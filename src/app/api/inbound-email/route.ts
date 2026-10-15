import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import PostalMime from 'postal-mime';
import { db } from '@/lib/db';
import { isAIConfigured } from '@/lib/ai/client';
import { processJobEmail } from '@/lib/job-tracker/process-email';
import { gmailForwardingConfirmation, htmlToText, tokenFromAddress } from '@/lib/job-tracker/inbound';
import { createNotification } from '@/lib/notifications';

const MAX_BYTES = 2 * 1024 * 1024; // bigger emails are mostly attachments we don't need
const MAX_TEXT = 15000;

function authorized(request: NextRequest): boolean {
  const secret = process.env.INBOUND_EMAIL_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization') ?? '';
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ''));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

interface InboundEmail {
  recipients: string[];
  from: string;
  subject: string;
  date: string;
  text: string;
}

async function readEmail(request: NextRequest): Promise<InboundEmail | null> {
  const buf = Buffer.from(await request.arrayBuffer());
  if (!buf.length || buf.length > MAX_BYTES) return null;
  const envelopeTo = request.headers.get('x-envelope-to');

  // JSON from another inbound-email provider: { to, from, subject, text, html }
  if ((request.headers.get('content-type') ?? '').includes('application/json')) {
    const j = JSON.parse(buf.toString('utf8')) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
      recipients: [envelopeTo, ...str(j.to).split(',')].filter(Boolean) as string[],
      from: str(j.from),
      subject: str(j.subject),
      date: str(j.date),
      text: str(j.text) || htmlToText(str(j.html)),
    };
  }

  // Raw email (what the Cloudflare Email Worker sends)
  const mail = await PostalMime.parse(buf);
  const from = mail.from ? `${mail.from.name ?? ''} <${mail.from.address ?? ''}>`.trim() : '';
  const recipients = [
    envelopeTo,
    mail.deliveredTo,
    ...(mail.to ?? []).map((a) => a.address),
    ...(mail.cc ?? []).map((a) => a.address),
  ].filter(Boolean) as string[];
  return {
    recipients,
    from,
    subject: mail.subject ?? '',
    date: mail.date ?? '',
    text: (mail.text && mail.text.trim()) || htmlToText(mail.html ?? ''),
  };
}

/**
 * POST /api/inbound-email — receives emails sent to users' personal forwarding
 * addresses (track-<token>@INBOUND_EMAIL_DOMAIN) and updates their job tracker.
 * Protected by INBOUND_EMAIL_SECRET. Always answers 200 for accepted mail so the
 * sender isn't bounced; problems are logged.
 */
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const email = await readEmail(request);
    if (!email) return NextResponse.json({ success: true, skipped: 'empty_or_too_large' });

    const token = email.recipients.map(tokenFromAddress).find(Boolean);
    if (!token) return NextResponse.json({ success: true, skipped: 'unknown_recipient' });

    const user = await db.user.findUnique({
      where: { inbound_email_token: token },
      select: { id: true, language: true },
    });
    if (!user) return NextResponse.json({ success: true, skipped: 'unknown_recipient' });

    // Gmail asks the user to confirm forwarding first: hand them the code/link
    const confirm = gmailForwardingConfirmation(email.from, email.subject, email.text);
    if (confirm) {
      await createNotification(user.id, {
        type: 'forwarding_confirm',
        key: `fwd-confirm:${confirm.code ?? confirm.link ?? email.date}`,
        data: confirm,
        link: confirm.link,
      });
      return NextResponse.json({ success: true, handled: 'gmail_confirmation' });
    }

    if (!isAIConfigured()) return NextResponse.json({ success: true, skipped: 'ai_not_configured' });

    const header = [
      email.from ? `From: ${email.from}` : '',
      email.subject ? `Subject: ${email.subject}` : '',
      email.date ? `Date: ${email.date}` : '',
    ].filter(Boolean);
    const content = [...header, '', email.text].join('\n').slice(0, MAX_TEXT);
    if (content.trim().length < 20) return NextResponse.json({ success: true, skipped: 'no_text' });

    const result = await processJobEmail(user.id, content, { locale: user.language === 'fr' ? 'fr' : 'en' });
    if (result.body.error === 'limit_reached') {
      // Don't lose it silently: tell the user (once a day) to paste it later or upgrade
      await createNotification(user.id, {
        type: 'forward_skipped_limit',
        key: `fwd-limit:${new Date().toISOString().slice(0, 10)}`,
        data: { subject: email.subject.slice(0, 120) },
        link: '/billing',
      });
    }
    return NextResponse.json({ success: true, result: { action: result.body.action ?? null, error: result.body.error ?? null } });
  } catch (error) {
    console.error('Inbound email error:', error);
    // 200 so the email isn't bounced back to the user; it's logged for us
    return NextResponse.json({ success: true, skipped: 'error' });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { enterpriseLeadSchema } from '@/lib/enterprise/leads';
import { adminEmails } from '@/lib/admin';
import { createNotification } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { getRequestLocale } from '@/lib/ai/locale';

/**
 * POST /api/enterprise/contact — the Contact Sales form.
 * Saves the request and tells the site admins (ADMIN_EMAILS) in the app.
 */
export async function POST(request: NextRequest) {
  const limit = rateLimit(`enterprise:${getClientIp(request)}`, { maxRequests: 3, windowMs: 10 * 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 });
  }

  const parsed = enterpriseLeadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'invalid', fields: parsed.error.issues.map((i) => String(i.path[0])) },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // Bots fill in the hidden field: pretend it worked, save nothing
  if (input.website) return NextResponse.json({ success: true });

  try {
    const auth = await getAuthUser(request).catch(() => null);
    const lead = await db.enterpriseLead.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        organization: input.organization,
        org_type: input.org_type,
        team_size: input.team_size,
        country: input.country || null,
        phone: input.phone || null,
        message: input.message,
        locale: getRequestLocale(request),
        user_id: auth?.userId ?? null,
      },
    });

    // Tell the admins: a bell notification for each admin account
    const admins = adminEmails();
    if (admins.length) {
      const users = await db.user.findMany({ where: { email: { in: admins } }, select: { id: true, email: true } });
      await Promise.all(users.map((u) => createNotification(u.id, {
        type: 'enterprise_lead',
        key: `lead:${lead.id}`,
        data: { organization: lead.organization, name: lead.name, orgType: lead.org_type, teamSize: lead.team_size },
        link: '/admin/leads',
      }).catch((err) => console.error('Lead notification failed:', err))));
      // Also by email once an email provider is set up (src/lib/email)
      await Promise.all(admins.map((to) => sendEmail({
        to,
        subject: `New Enterprise request: ${lead.organization}`,
        html: `<p><b>${escapeHtml(lead.name)}</b> (${escapeHtml(lead.email)}) from <b>${escapeHtml(lead.organization)}</b>
          — ${lead.org_type}, ${lead.team_size} people${lead.country ? `, ${escapeHtml(lead.country)}` : ''}.</p>
          <p>${escapeHtml(lead.message).replace(/\n/g, '<br>')}</p>`,
        replyTo: lead.email,
      }).catch(() => null)));
    } else {
      console.warn('[enterprise] New request saved, but ADMIN_EMAILS is not set so nobody was notified');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Enterprise contact error:', error);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

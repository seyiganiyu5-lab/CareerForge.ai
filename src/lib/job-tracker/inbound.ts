import { randomBytes } from 'crypto';

/**
 * Personal forwarding addresses: track-<token>@<INBOUND_EMAIL_DOMAIN>.
 * Emails sent there reach /api/inbound-email (see integrations/cloudflare-email-worker).
 */

const PREFIX = 'track-';
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // no look-alikes (0/o, 1/l/i)

export function inboundDomain(): string | null {
  const d = process.env.INBOUND_EMAIL_DOMAIN?.trim().toLowerCase();
  return d ? d.replace(/^@/, '') : null;
}

export function newInboundToken(): string {
  const bytes = randomBytes(12);
  let out = '';
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

export function inboundAddress(token: string, domain: string): string {
  return `${PREFIX}${token}@${domain}`;
}

/** The token from a recipient address (also accepts "name+track-xxx@..."), or null. */
export function tokenFromAddress(address: string): string | null {
  const local = address.trim().toLowerCase().replace(/^.*</, '').replace(/>.*$/, '').split('@')[0] ?? '';
  for (const part of local.split('+')) {
    if (part.startsWith(PREFIX)) {
      const token = part.slice(PREFIX.length);
      if (/^[a-z0-9]{8,32}$/.test(token)) return token;
    }
  }
  return null;
}

/** Gmail sends a confirmation email (with a code and a link) before it starts forwarding. */
export function gmailForwardingConfirmation(from: string, subject: string, text: string) {
  if (!/forwarding-noreply@google\.com/i.test(from)) return null;
  const code = text.match(/(?:confirmation code|code de confirmation)\s*:?\s*(\d{6,12})/i)?.[1]
    ?? subject.match(/#(\d{6,12})/)?.[1]
    ?? null;
  const link = text.match(/https:\/\/mail(?:-settings)?\.google\.com\/mail\/[^\s<>"')]+/i)?.[0] ?? null;
  const requester = text.match(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\s+(?:has requested|a demandé)/i)?.[1] ?? null;
  return { code, link, requester };
}

/** Plain text from an HTML email body (for emails that have no text part). */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h\d)>/gi, '\n')
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

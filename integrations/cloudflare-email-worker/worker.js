/**
 * Cloudflare Email Worker for CareerForge job-tracker forwarding.
 *
 * Cloudflare Email Routing sends every email for the inbox domain
 * (e.g. track-abc123@inbox.example.com) to this worker, which passes the raw
 * email to the CareerForge webhook. The app finds the user from the address,
 * reads the email with AI and updates their job tracker.
 *
 * Settings (Cloudflare dashboard → Workers → this worker → Settings → Variables):
 *   WEBHOOK_URL          https://YOUR-SITE/api/inbound-email
 *   INBOUND_EMAIL_SECRET same value as INBOUND_EMAIL_SECRET in the app (mark it "Encrypt")
 */
export default {
  async email(message, env) {
    // Ignore huge emails (attachments); job emails are small
    if (message.rawSize > 2 * 1024 * 1024) return;

    const raw = await new Response(message.raw).arrayBuffer();
    const res = await fetch(env.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.INBOUND_EMAIL_SECRET}`,
        'Content-Type': 'message/rfc822',
        'X-Envelope-To': message.to,
        'X-Envelope-From': message.from,
      },
      body: raw,
    });

    // Only a bad setup returns an error (wrong secret/URL); bounce so it gets noticed
    if (res.status === 401 || res.status === 404) {
      message.setReject('Forwarding address is not set up correctly');
    }
  },
};

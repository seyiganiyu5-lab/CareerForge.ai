/**
 * Email Service Abstraction Layer
 *
 * This module provides a provider-agnostic interface for sending emails.
 * When you're ready to send emails, configure one of the supported providers:
 *
 * - Resend (https://resend.com)
 * - Brevo (https://brevo.com)
 * - Mailchimp Transactional
 * - ConvertKit
 *
 * Simply uncomment and configure the provider of your choice in `sendEmail()`.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via the configured provider.
 *
 * Currently returns a no-op result. To enable email sending:
 *
 * 1. Install the provider SDK (e.g., `bun add resend`)
 * 2. Set the provider API key in .env
 * 3. Uncomment the provider implementation below
 */
export async function sendEmail(_payload: EmailPayload): Promise<EmailResult> {
  // === RESEND ===
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // const result = await resend.emails.send({
  //   from: 'CareerForge AI <noreply@careerforge.ai>',
  //   to: payload.to,
  //   subject: payload.subject,
  //   html: payload.html,
  //   text: payload.text,
  // });
  // return { success: true, messageId: result.id };

  // === BREVO ===
  // import SibApiV3Sdk from 'sib-api-v3-sdk';
  // const apiInstance = SibApiV3Sdk.ApiClient.instance;
  // apiInstance.authenticate(process.env.BREVO_API_KEY!);
  // await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
  //   sender: { name: 'CareerForge AI', email: 'noreply@careerforge.ai' },
  //   to: [{ email: payload.to }],
  //   subject: payload.subject,
  //   htmlContent: payload.html,
  //   textContent: payload.text,
  // });

  // No-op: emails are not sent until a provider is configured
  return { success: true, messageId: `noop-${Date.now()}` };
}

/**
 * Send a welcome email to a new subscriber.
 */
export async function sendWelcomeEmail(
  email: string,
  language: 'en' | 'fr'
): Promise<EmailResult> {
  const subject =
    language === 'fr'
      ? 'Bienvenue sur CareerForge AI 🎉'
      : 'Welcome to CareerForge AI 🎉';

  const html =
    language === 'fr'
      ? `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#6C3CE1">Bienvenue !</h1>
          <p>Merci de vous être abonné à la newsletter CareerForge AI.</p>
          <p>Vous recevrez bientôt des conseils de carrière, des astuces pour votre CV et des mises à jour produit.</p>
          <a href="/" style="display:inline-block;background:#6C3CE1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
            Commencer maintenant
          </a>
        </div>`
      : `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#6C3CE1">Welcome!</h1>
          <p>Thank you for subscribing to the CareerForge AI newsletter.</p>
          <p>You'll soon receive career tips, resume advice, and product updates.</p>
          <a href="/" style="display:inline-block;background:#6C3CE1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
            Get started
          </a>
        </div>`;

  return sendEmail({
    to: email,
    subject,
    html,
    text: subject,
  });
}

/**
 * Send a double opt-in confirmation email.
 * TODO: Implement when double opt-in is enabled.
 */
export async function sendOptInConfirmation(
  _email: string,
  _token: string,
  _language: 'en' | 'fr'
): Promise<EmailResult> {
  return { success: true, messageId: `noop-optin-${Date.now()}` };
}
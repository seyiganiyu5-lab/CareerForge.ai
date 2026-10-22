/**
 * Site owners/admins, set with ADMIN_EMAILS (comma-separated) in .env.
 * They see the Enterprise requests page and get notified of new requests.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && adminEmails().includes(email.trim().toLowerCase());
}

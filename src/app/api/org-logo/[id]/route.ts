import { db } from '@/lib/db';

/** GET /api/org-logo/:organizationId — the organisation's logo (cached; the URL changes when it does) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await db.organization.findUnique({
    where: { id },
    select: { logo: true, logo_mime: true },
  }).catch(() => null);
  if (!org?.logo || !org.logo_mime) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(org.logo), {
    headers: {
      'Content-Type': org.logo_mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}

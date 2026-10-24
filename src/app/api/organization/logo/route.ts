import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOrgManager } from '@/lib/enterprise/organizations';
import { MAX_LOGO_BYTES, logoUrl, sniffLogo } from '@/lib/enterprise/branding';

/** POST /api/organization/logo (form field "logo") — PNG, JPEG or WebP up to 300 KB (owners/admins) */
export async function POST(request: Request) {
  const { membership, error } = await requireOrgManager();
  if (error) return error;

  // Refuse big uploads before reading them
  if (Number(request.headers.get('content-length') ?? 0) > MAX_LOGO_BYTES + 16 * 1024) {
    return NextResponse.json({ success: false, error: 'too_big' }, { status: 413 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get('logo');
  if (!(file instanceof File)) return NextResponse.json({ success: false, error: 'no_file' }, { status: 400 });
  if (file.size > MAX_LOGO_BYTES) return NextResponse.json({ success: false, error: 'too_big' }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffLogo(bytes);
  if (!mime) return NextResponse.json({ success: false, error: 'bad_type' }, { status: 415 });

  const org = await db.organization.update({
    where: { id: membership.organization_id },
    data: { logo: bytes, logo_mime: mime, logo_updated_at: new Date() },
    select: { id: true, logo_updated_at: true },
  });
  return NextResponse.json({ success: true, logo_url: logoUrl(org) });
}

/** DELETE /api/organization/logo — remove the logo (owners/admins) */
export async function DELETE() {
  const { membership, error } = await requireOrgManager();
  if (error) return error;
  await db.organization.update({
    where: { id: membership.organization_id },
    data: { logo: null, logo_mime: null, logo_updated_at: null },
    select: { id: true },
  });
  return NextResponse.json({ success: true });
}

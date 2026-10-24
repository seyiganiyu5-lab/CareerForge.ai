import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOrgManager } from '@/lib/enterprise/organizations';
import { MAX_RECOMMENDED_TEMPLATES, brandingOf, checkBrandColor, cleanTemplates } from '@/lib/enterprise/branding';

/** PATCH /api/organization/branding { brand_color?, recommended_templates? } (owners/admins) */
export async function PATCH(request: Request) {
  const { membership, error } = await requireOrgManager();
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 });

  const data: { brand_color?: string | null; recommended_templates?: string } = {};
  if ('brand_color' in body) {
    const checked = checkBrandColor(body.brand_color);
    if ('error' in checked) return NextResponse.json({ success: false, error: checked.error }, { status: 400 });
    data.brand_color = checked.color;
  }
  if ('recommended_templates' in body) {
    const list = Array.isArray(body.recommended_templates) ? body.recommended_templates : null;
    const clean = cleanTemplates(list);
    if (!list || list.length > MAX_RECOMMENDED_TEMPLATES || clean.length !== new Set(list).size) {
      return NextResponse.json({ success: false, error: 'invalid_templates' }, { status: 400 });
    }
    data.recommended_templates = JSON.stringify(clean);
  }

  const org = await db.organization.update({ where: { id: membership.organization_id }, data });
  return NextResponse.json({ success: true, branding: brandingOf(org) });
}

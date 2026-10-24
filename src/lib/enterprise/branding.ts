import { isValidTemplateId } from '@/lib/templates/registry';

/** Organisation branding shown to its members: logo, colour, recommended CV templates */

export const MAX_LOGO_BYTES = 300 * 1024;
export const MAX_RECOMMENDED_TEMPLATES = 3;
// White text on the colour must stay readable (WCAG for large text and UI)
export const MIN_CONTRAST = 3;

const HEX = /^#[0-9a-f]{6}$/i;

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast of white text on this colour (1–21) */
export function contrastWithWhite(hex: string) {
  return 1.05 / (luminance(hex) + 0.05);
}

/** '#2563eb' for a usable colour, null to clear it, or an error */
export function checkBrandColor(value: unknown): { color: string | null } | { error: 'invalid_color' | 'low_contrast' } {
  if (value === null || value === '') return { color: null };
  if (typeof value !== 'string' || !HEX.test(value)) return { error: 'invalid_color' };
  if (contrastWithWhite(value) < MIN_CONTRAST) return { error: 'low_contrast' };
  return { color: value.toLowerCase() };
}

/** Image type from the file's first bytes (not its name or the browser's claim) */
export function sniffLogo(bytes: Uint8Array): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  const at = (i: number, ...v: number[]) => v.every((b, k) => bytes[i + k] === b);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (at(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  return null;
}

/** Valid template ids from what's stored or sent, at most 3, no duplicates */
export function cleanTemplates(value: unknown): string[] {
  let list: unknown = value;
  if (typeof value === 'string') {
    try { list = JSON.parse(value); } catch { list = []; }
  }
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((id): id is string => typeof id === 'string' && isValidTemplateId(id)))].slice(0, MAX_RECOMMENDED_TEMPLATES);
}

export function logoUrl(org: { id: string; logo_updated_at: Date | null }) {
  return org.logo_updated_at ? `/api/org-logo/${org.id}?v=${org.logo_updated_at.getTime()}` : null;
}

export function brandingOf(org: { id: string; brand_color: string | null; logo_updated_at: Date | null; recommended_templates: string }) {
  return {
    brand_color: org.brand_color,
    logo_url: logoUrl(org),
    recommended_templates: cleanTemplates(org.recommended_templates),
  };
}

'use client';

import { useAuth } from '@/lib/auth/context';

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Members of an organisation see its colour instead of the Hassify blue
 * across the dashboard. The colour is checked on the server (readable with
 * white text); in dark mode it is lightened so it stays visible.
 */
export default function OrgTheme() {
  const { user } = useAuth();
  const color = user?.organization?.brand_color;
  if (!color || !HEX.test(color)) return null;

  const dark = `color-mix(in srgb, ${color} 75%, white)`;
  const vars = (c: string, light: string) =>
    `--brand:${c};--primary:${c};--ring:${c};--sidebar-primary:${c};--sidebar-ring:${c};--brand-light:${light};`;
  const css =
    `html:root{${vars(color, `color-mix(in srgb, ${color} 14%, white)`)}}` +
    `html.dark{${vars(dark, `color-mix(in srgb, ${color} 30%, #0b1120)`)}}`;

  return <style data-org-theme>{css}</style>;
}

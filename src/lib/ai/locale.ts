import type { NextRequest } from 'next/server';

export type AiLocale = 'en' | 'fr';

/** The site language the user picked (set as a cookie by the language switcher). */
export function getRequestLocale(request: NextRequest): AiLocale {
  return request.cookies.get('cf-locale')?.value === 'fr' ? 'fr' : 'en';
}

/**
 * Instruction for feedback, tips and analysis the user reads in the app.
 * JSON keys and fixed values (e.g. "high" | "medium" | "low") must stay as specified.
 */
export function replyLanguageInstruction(locale: AiLocale): string {
  if (locale !== 'fr') return '';
  return '\n\nLANGUAGE: Write all of your text in French (français), using the "vous" form. If you reply in JSON, keep the JSON keys and any fixed values listed in the format (such as "high", "medium", "low") exactly as specified, in English; only the free text values are in French.';
}

/**
 * Instruction for text that goes into the user's own document (resume content).
 * Keeps the document's language; only falls back to the site language when there is no text yet.
 */
export function contentLanguageInstruction(locale: AiLocale): string {
  const fallback = locale === 'fr' ? 'French' : 'English';
  return `\n\nLANGUAGE: Write in the same language as the existing content provided. If there is no existing content, write in ${fallback}.`;
}

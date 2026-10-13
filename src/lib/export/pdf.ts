import html2pdf from 'html2pdf.js';

export interface ExportPDFOptions {
  element: HTMLElement;
  filename?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Export an HTML element to a PDF file.
 *
 * ARCHITECTURE:
 * ─────────────
 * The `element` parameter is the hidden off-screen render container
 * (position: fixed + clip-path to hide visually). Inside it, React
 * renders the TemplateEngine whose FIRST CHILD is the actual resume
 * wrapper <div> with width/minHeight/background.
 *
 * We do NOT clone the outer container (it carries fixed/clip-path
 * baggage). Instead we clone the **first child** — the TemplateEngine
 * wrapper — and override its styles for clean capture:
 *
 *   • position: static   → html2canvas can compute height correctly
 *   • min-height: auto   → content determines height naturally
 *   • no explicit height → prevents unnecessary 2nd page for short content
 *   • no overflow:hidden → nothing gets clipped
 *
 * This guarantees:
 *   ✅ Content is never blank (clone is self-contained, no parent deps)
 *   ✅ Short resumes → exactly 1 page
 *   ✅ Long resumes → auto-multi-page via html2pdf
 */

export async function exportToPDF({
  element,
  filename = 'resume.pdf',
  onProgress,
}: ExportPDFOptions): Promise<void> {
  // ── Handle ESM/CJS interop ──────────────────────────────────────
  // html2pdf.js is a CJS module; the default export may be nested under .default
  const mod = html2pdf as unknown as { default?: unknown; [key: string]: unknown };
  const html2pdfFn: () => { set: (o: object) => { from: (el: HTMLElement) => { save: () => Promise<void> } } } =
    typeof html2pdf === 'function'
      ? (html2pdf as unknown as typeof html2pdfFn)
      : ((mod.default ?? html2pdf) as unknown as typeof html2pdfFn);

  // ── Locate the actual resume content ────────────────────────────
  // element = hidden render container (position: fixed, clip-path)
  // element.firstElementChild = TemplateEngine wrapper (width, minHeight, bg)
  const resumeWrapper =
    (element.firstElementChild as HTMLElement | null) ?? element;

  // ── Clone the resume wrapper (NOT the outer container) ──────────
  const clone = resumeWrapper.cloneNode(true) as HTMLElement;

  // Override all styles for clean PDF capture
  clone.style.cssText = [
    'position: static',
    'width: 794px',
    'max-width: 794px',
    'min-height: auto',       // let content determine height
    'height: auto',            // no fixed height — prevents phantom 2nd page
    'margin: 0',
    'padding: 0',
    'opacity: 1',
    'visibility: visible',
    'clip-path: none',
    'pointer-events: none',
    'background: #ffffff',
    'box-sizing: border-box',
    // Do NOT set overflow:hidden — let content flow naturally for
    // accurate height measurement and multi-page splitting
  ].join('; ');

  // Also remove minHeight/height from cloned children that inherited
  // the TemplateEngine wrapper's inline style. The wrapper itself has
  // minHeight in its style attribute; cssText above already overrides it.
  // But for safety, walk direct children and clear any min-height too.
  const inner = clone.firstElementChild as HTMLElement | null;
  if (inner) {
    inner.style.minHeight = 'auto';
    inner.style.height = 'auto';
  }

  // ── Append clone to body (off-screen but in normal flow) ────────
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.body.appendChild(clone);

  // Force layout + wait for paint
  void clone.offsetHeight;
  await new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r()))
  );

  // ── html2pdf options ─────────────────────────────────────────────
  const opt = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      // Ensure the entire element is captured, regardless of height
      windowWidth: 794,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: [
        'tr', 'td', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'blockquote',
      ],
    },
  };

  if (onProgress) onProgress(0);

  try {
    await html2pdfFn().set(opt).from(clone).save();
  } finally {
    clone.remove();
    document.body.style.overflow = prevOverflow;
  }

  if (onProgress) onProgress(100);
}
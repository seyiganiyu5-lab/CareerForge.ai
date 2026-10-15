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
  const html2pdfFn: () => Html2PdfWorker =
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
    image: { type: 'jpeg', quality: 0.95 },
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
    let runs: TextRun[] = [];
    let pageWidthPx = 794;
    await html2pdfFn()
      .set(opt)
      .from(clone)
      // Lay out the page (including page-break spacing) first, so the text
      // positions measured here match the picture taken afterwards
      .toContainer()
      .then(function (this: { prop: { container: HTMLElement } }) {
        pageWidthPx = this.prop.container.getBoundingClientRect().width;
        runs = collectTextRuns(this.prop.container);
      })
      .toPdf()
      .get('pdf')
      .then((pdf: JsPdfLike) => {
        addInvisibleText(pdf, runs, pageWidthPx);
        pdf.save(filename);
      });
  } finally {
    clone.remove();
    document.body.style.overflow = prevOverflow;
  }

  if (onProgress) onProgress(100);
}
// ── Searchable text layer ────────────────────────────────────────────
// html2pdf turns the page into a picture, so on its own the PDF has no text:
// it can't be selected, searched or read by applicant tracking systems (ATS).
// We measure every line of text in the laid-out page and write the same text,
// invisibly, at the same place on top of the picture.

interface Html2PdfWorker {
  set: (o: object) => Html2PdfWorker;
  from: (el: HTMLElement) => Html2PdfWorker;
  toContainer: () => Html2PdfWorker;
  toPdf: () => Html2PdfWorker;
  get: (key: string) => Html2PdfWorker;
  then: (fn: (this: any, value: any) => unknown) => Html2PdfWorker;
}

interface JsPdfLike {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  getNumberOfPages: () => number;
  setPage: (n: number) => void;
  setFont: (name: string, style?: string) => void;
  setFontSize: (size: number) => void;
  getTextWidth: (text: string) => number;
  text: (text: string, x: number, y: number, options?: Record<string, unknown>) => void;
  save: (filename: string) => void;
}

interface TextRun {
  text: string;
  x: number; // CSS px, relative to the page container
  y: number; // top of the line box
  width: number;
  height: number;
}

/** Group the words of each text node into lines, in reading (DOM) order. */
function collectTextRuns(root: HTMLElement): TextRun[] {
  const origin = root.getBoundingClientRect();
  const runs: TextRun[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const value = node.nodeValue ?? '';
    if (!value.trim()) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    const style = getComputedStyle(parent);
    if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue;

    let line: TextRun | null = null;
    const wordRe = /\S+/g;
    for (let m = wordRe.exec(value); m; m = wordRe.exec(value)) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const x = rect.left - origin.left;
      const y = rect.top - origin.top;
      // Same line if the word sits at (about) the same height
      if (line && Math.abs(line.y - y) < rect.height / 2) {
        line.text += ' ' + m[0];
        line.width = x + rect.width - line.x;
      } else {
        if (line) runs.push(line);
        line = { text: m[0], x, y, width: rect.width, height: rect.height };
      }
    }
    if (line) runs.push(line);
  }
  range.detach();
  return runs;
}

// The built-in PDF font covers Latin-1 plus the Windows-1252 extras (€ œ ’ « » • – …).
// Other characters are mapped to a close equivalent or dropped (hidden layer only).
const CP1252_EXTRAS = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const FALLBACK_CHARS: Record<string, string> = {
  '\u25CF': '•', '\u25AA': '•', '\u25C6': '•', '\u25B6': '•', '\u2009': ' ', '\u202F': ' ',
};

function toPdfText(text: string): string {
  let out = '';
  for (const c of text) {
    const mapped = FALLBACK_CHARS[c] ?? c;
    if (mapped.charCodeAt(0) <= 0xff || CP1252_EXTRAS.includes(mapped)) out += mapped;
  }
  return out;
}

function addInvisibleText(pdf: JsPdfLike, runs: TextRun[], pageWidthPx: number) {
  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const mmPerPx = pageWidthMm / pageWidthPx;
  const pageHeightPx = pageHeightMm / mmPerPx;
  const pageCount = pdf.getNumberOfPages();
  pdf.setFont('helvetica', 'normal');

  for (const run of runs) {
    const text = toPdfText(run.text).trim();
    if (!text) continue;
    const page = Math.floor(run.y / pageHeightPx);
    if (page >= pageCount) continue;
    pdf.setPage(page + 1);

    // Size the hidden text like the visible line so selecting it lines up
    // (the line box is a little taller than the font itself)
    const fontSizePt = Math.max(1, run.height * mmPerPx * (72 / 25.4) * 0.8);
    pdf.setFontSize(fontSizePt);
    const naturalWidth = pdf.getTextWidth(text);
    const targetWidth = run.width * mmPerPx;
    const horizontalScale = naturalWidth > 0 ? targetWidth / naturalWidth : 1;

    pdf.text(text, run.x * mmPerPx, (run.y - page * pageHeightPx) * mmPerPx, {
      baseline: 'top',
      renderingMode: 'invisible',
      horizontalScale,
    });
  }
  pdf.setPage(pageCount);
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docWhere } from '@/lib/subscription/documents';
import { checkAndIncrementUsage } from '@/lib/subscription/service';
import { FEATURE_KEYS } from '@/lib/subscription/features';
import { db } from '@/lib/db';
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import type { CoverLetterData, CoverLetterCustomization } from '@/types/cover-letter';

type Params = { params: Promise<{ id: string }> };

function formatDateFull(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check DOCX export limit
    const access = await checkAndIncrementUsage(auth.userId, FEATURE_KEYS.DOCX_EXPORT);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason === 'limit_reached' ? 'limit_reached' : 'upgrade_required' },
        { status: 403 },
      );
    }

    const { id } = await params;

    const letter = await db.coverLetter.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });

    if (!letter) {
      return NextResponse.json({ success: false, error: 'Cover letter not found' }, { status: 404 });
    }

    let data: CoverLetterData;
    try {
      data = JSON.parse(letter.data_json);
    } catch {
      data = {
        fullName: '', email: '', phone: '', address: '', linkedIn: '', website: '',
        hiringManager: '', companyName: '', companyAddress: '', jobTitle: '', jobDescription: '',
        salutation: 'Dear Hiring Manager,', opening: '', body: '', closing: '', signOff: 'Sincerely,',
        language: 'en', tone: 'professional', date: new Date().toISOString().split('T')[0],
      };
    }

    let customization: Partial<CoverLetterCustomization> = {};
    try {
      customization = JSON.parse(letter.customization_json);
    } catch {
      // use defaults
    }

    const fontFamily = customization.primaryFont?.split(',')[0].replace(/"/g, '').trim() || 'Calibri';
    const paragraphs: Paragraph[] = [];

    // ── Sender address block ──
    const senderLines: string[] = [];
    if (data.fullName) senderLines.push(data.fullName);
    if (data.address) senderLines.push(data.address);
    if (data.email) senderLines.push(data.email);
    if (data.phone) senderLines.push(data.phone);

    for (const line of senderLines) {
      paragraphs.push(new Paragraph({
        spacing: { after: 0, line: 276 },
        children: [new TextRun({ text: line, size: 21, font: fontFamily, color: '333333' })],
      }));
    }

    // Empty line
    paragraphs.push(new Paragraph({ spacing: { after: 0 }, children: [] }));

    // ── Date ──
    if (data.date) {
      paragraphs.push(new Paragraph({
        spacing: { after: 0, line: 276 },
        children: [new TextRun({ text: formatDateFull(data.date), size: 21, font: fontFamily, color: '333333' })],
      }));
    }

    // Empty line
    paragraphs.push(new Paragraph({ spacing: { after: 0 }, children: [] }));

    // ── Recipient block ──
    const recipientLines: string[] = [];
    if (data.hiringManager) recipientLines.push(data.hiringManager);
    if (data.companyName) recipientLines.push(data.companyName);
    if (data.companyAddress) recipientLines.push(data.companyAddress);

    for (const line of recipientLines) {
      paragraphs.push(new Paragraph({
        spacing: { after: 0, line: 276 },
        children: [new TextRun({ text: line, size: 21, font: fontFamily, color: '333333' })],
      }));
    }

    // Empty line
    paragraphs.push(new Paragraph({ spacing: { after: 0 }, children: [] }));

    // ── Salutation ──
    if (data.salutation) {
      paragraphs.push(new Paragraph({
        spacing: { after: 200, line: 276 },
        children: [new TextRun({ text: data.salutation, size: 21, font: fontFamily })],
      }));
    }

    // ── Opening paragraph ──
    if (data.opening) {
      paragraphs.push(new Paragraph({
        spacing: { after: 200, line: 276 },
        children: [new TextRun({ text: data.opening, size: 21, font: fontFamily })],
      }));
    }

    // ── Body paragraphs ──
    if (data.body) {
      const bodyParagraphs = data.body.split('\n').filter((p) => p.trim());
      for (const bp of bodyParagraphs) {
        paragraphs.push(new Paragraph({
          spacing: { after: 200, line: 276 },
          children: [new TextRun({ text: bp.trim(), size: 21, font: fontFamily })],
        }));
      }
    }

    // ── Closing paragraph ──
    if (data.closing) {
      paragraphs.push(new Paragraph({
        spacing: { after: 200, line: 276 },
        children: [new TextRun({ text: data.closing, size: 21, font: fontFamily })],
      }));
    }

    // Empty line
    paragraphs.push(new Paragraph({ spacing: { after: 0 }, children: [] }));

    // ── Sign-off ──
    if (data.signOff) {
      paragraphs.push(new Paragraph({
        spacing: { after: 200, line: 276 },
        children: [new TextRun({ text: data.signOff, size: 21, font: fontFamily })],
      }));
    }

    // Empty lines for signature space
    paragraphs.push(new Paragraph({ spacing: { after: 0 }, children: [] }));
    paragraphs.push(new Paragraph({ spacing: { after: 0 }, children: [] }));
    paragraphs.push(new Paragraph({ spacing: { after: 0 }, children: [] }));

    // ── Printed name ──
    if (data.fullName) {
      paragraphs.push(new Paragraph({
        spacing: { after: 0, line: 276 },
        children: [new TextRun({ text: data.fullName, size: 21, font: fontFamily, bold: true })],
      }));
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: fontFamily, size: 21 },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const { Packer } = await import('docx');
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="cover-letter-${(data.companyName || 'draft').toLowerCase().replace(/\s+/g, '-')}.docx"`,
      },
    });
  } catch (error) {
    console.error('Cover letter DOCX export error:', error);
    return NextResponse.json({ success: false, error: 'Failed to export cover letter' }, { status: 500 });
  }
}

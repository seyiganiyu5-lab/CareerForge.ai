import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import type { ResumeData } from '@/types/resume';
import { formatDate, formatDateRange } from '@/lib/templates/utils';

// ─── Helpers ──────────────────────────────────────────────────────

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    border: {
      bottom: { color: '999999', space: 4, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        font: 'Calibri',
        color: '333333',
        characterSpacing: 60,
      }),
    ],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 276 },
    children: [
      new TextRun({
        text,
        size: 21,
        font: 'Calibri',
      }),
    ],
  });
}

function textPara(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40, line: 276 },
    children: [
      new TextRun({
        text,
        size: 21,
        font: 'Calibri',
      }),
    ],
  });
}

// dateRange is now imported as formatDateRange from shared utils — kept as alias
const dateRange = formatDateRange;

// ─── Section Builders ─────────────────────────────────────────────

function buildPersonalInfo(data: ResumeData): Paragraph[] {
  const { personalInfo: p } = data;
  const paras: Paragraph[] = [];

  // Name
  paras.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: p.fullName || 'Your Name',
          bold: true,
          size: 32,
          font: 'Calibri',
          color: '1a1a1a',
        }),
      ],
    })
  );

  // Title
  if (p.professionalTitle) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: p.professionalTitle,
            size: 22,
            font: 'Calibri',
            color: '555555',
            italics: true,
          }),
        ],
      })
    );
  }

  // Contact line: email | phone | location | website/linkedin
  const contactParts: string[] = [];
  if (p.email) contactParts.push(p.email);
  if (p.phone) contactParts.push(p.phone);
  if (p.location) contactParts.push(p.location);

  const linkParts: string[] = [];
  if (p.linkedin) linkParts.push(p.linkedin);
  if (p.github) linkParts.push(p.github);
  if (p.website) linkParts.push(p.website);
  if (p.portfolio) linkParts.push(p.portfolio);

  if (contactParts.length > 0) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20, line: 276 },
        children: contactParts.map((part, i) => [
          new TextRun({ text: part, size: 18, font: 'Calibri', color: '444444' }),
          ...(i < contactParts.length - 1
            ? [new TextRun({ text: '  |  ', size: 18, font: 'Calibri', color: '999999' })]
            : []),
        ]).flat(),
      })
    );
  }

  if (linkParts.length > 0) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80, line: 276 },
        children: linkParts.map((part, i) => [
          new TextRun({ text: part, size: 18, font: 'Calibri', color: '0078D4' }),
          ...(i < linkParts.length - 1
            ? [new TextRun({ text: '  |  ', size: 18, font: 'Calibri', color: '999999' })]
            : []),
        ]).flat(),
      })
    );
  }

  return paras;
}

function buildSummary(data: ResumeData): Paragraph[] {
  if (!data.professionalSummary?.trim()) return [];
  return [heading('Professional Summary'), textPara(data.professionalSummary.trim())];
}

function buildWorkExperience(data: ResumeData): Paragraph[] {
  const items = data.workExperience?.filter((e) => e.company || e.position);
  if (!items?.length) return [];

  const paras: Paragraph[] = [heading('Work Experience')];

  for (const exp of items) {
    // Company + location line
    const companyChildren: TextRun[] = [
      new TextRun({ text: exp.company || '', bold: true, size: 22, font: 'Calibri' }),
    ];
    if (exp.location) {
      companyChildren.push(new TextRun({ text: `, ${exp.location}`, size: 20, font: 'Calibri', color: '666666' }));
    }
    paras.push(new Paragraph({ spacing: { before: 160, after: 0 }, children: companyChildren }));

    // Position + date range line
    const dateStr = dateRange(exp.startDate, exp.endDate, exp.currentJob);
    const posChildren: TextRun[] = [
      new TextRun({ text: exp.position || '', italics: true, size: 21, font: 'Calibri' }),
    ];
    if (dateStr) {
      posChildren.push(new TextRun({ text: `\t${dateStr}`, size: 20, font: 'Calibri', color: '666666' }));
    }
    paras.push(new Paragraph({ spacing: { before: 0, after: 40 }, children: posChildren }));

    // Bullet points from description
    if (exp.description?.trim()) {
      // Split by newlines or bullet characters
      const lines = exp.description
        .split(/\n/)
        .map((l) => l.replace(/^[\s•\-–—*]\s*/, '').trim())
        .filter(Boolean);
      for (const line of lines) {
        paras.push(bullet(line));
      }
    }
  }

  return paras;
}

function buildEducation(data: ResumeData): Paragraph[] {
  const items = data.education?.filter((e) => e.school || e.degree);
  if (!items?.length) return [];

  const paras: Paragraph[] = [heading('Education')];

  for (const edu of items) {
    const schoolChildren: TextRun[] = [
      new TextRun({ text: edu.school || '', bold: true, size: 22, font: 'Calibri' }),
    ];
    if (edu.location) {
      schoolChildren.push(new TextRun({ text: `, ${edu.location}`, size: 20, font: 'Calibri', color: '666666' }));
    }
    paras.push(new Paragraph({ spacing: { before: 160, after: 0 }, children: schoolChildren }));

    const degreeParts: string[] = [];
    if (edu.degree) degreeParts.push(edu.degree);
    if (edu.fieldOfStudy) degreeParts.push(edu.fieldOfStudy);
    if (edu.grade) degreeParts.push(`GPA: ${edu.grade}`);

    const degreeStr = degreeParts.join(', ');
    const dateStr = dateRange(edu.startDate, edu.endDate, false);

    const degreeChildren: TextRun[] = [
      new TextRun({ text: degreeStr, italics: true, size: 21, font: 'Calibri' }),
    ];
    if (dateStr) {
      degreeChildren.push(new TextRun({ text: `\t${dateStr}`, size: 20, font: 'Calibri', color: '666666' }));
    }
    paras.push(new Paragraph({ spacing: { before: 0, after: 40 }, children: degreeChildren }));
  }

  return paras;
}

function subheading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 160, after: 40 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 19,
        font: 'Calibri',
        color: '666666',
        italics: true,
      }),
    ],
  });
}

function buildSkills(data: ResumeData): Paragraph[] {
  const items = data.skills?.filter((s) => s.name?.trim());
  if (!items?.length) return [];

  const technicalSkills = items.filter((s) => s.type !== 'soft');
  const softSkills = items.filter((s) => s.type === 'soft');
  const hasBothGroups = technicalSkills.length > 0 && softSkills.length > 0;

  const paras: Paragraph[] = [heading('Skills')];

  const skillRuns = (skills: typeof items): TextRun[] => {
    const runs: TextRun[] = [];
    skills.forEach((s, i) => {
      if (i > 0) runs.push(new TextRun({ text: '  •  ', size: 21, font: 'Calibri' }));
      runs.push(new TextRun({ text: s.name.trim(), size: 21, font: 'Calibri' }));
      if (s.proficiency) {
        runs.push(new TextRun({ text: ` (${s.proficiency})`, size: 18, font: 'Calibri', color: '777777', italics: true }));
      }
    });
    return runs;
  };

  if (hasBothGroups) {
    // Technical Skills subheading
    paras.push(subheading('Technical Skills'));
    paras.push(new Paragraph({ spacing: { before: 40, after: 60, line: 276 }, children: skillRuns(technicalSkills) }));

    // Soft Skills subheading
    paras.push(subheading('Soft Skills'));
    paras.push(new Paragraph({ spacing: { before: 40, after: 40, line: 276 }, children: skillRuns(softSkills) }));
  } else {
    paras.push(new Paragraph({ spacing: { before: 40, after: 40, line: 276 }, children: skillRuns(items) }));
  }

  return paras;
}

function buildProjects(data: ResumeData): Paragraph[] {
  const items = data.projects?.filter((p) => p.name?.trim());
  if (!items?.length) return [];

  const paras: Paragraph[] = [heading('Projects')];

  for (const proj of items) {
    // Project name + URLs
    const nameChildren: TextRun[] = [
      new TextRun({ text: proj.name, bold: true, size: 22, font: 'Calibri' }),
    ];
    const urls: string[] = [];
    if (proj.githubUrl) urls.push(proj.githubUrl);
    if (proj.liveUrl) urls.push(proj.liveUrl);
    if (urls.length > 0) {
      nameChildren.push(new TextRun({ text: `  (${urls.join(' | ')})`, size: 18, font: 'Calibri', color: '0078D4' }));
    }
    paras.push(new Paragraph({ spacing: { before: 160, after: 0 }, children: nameChildren }));

    // Description (as bullet points)
    if (proj.description?.trim()) {
      const descLines = proj.description
        .split('\n')
        .map((l) => l.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);
      if (descLines.length > 0) {
        descLines.forEach((line) => paras.push(bullet(line)));
      } else {
        paras.push(bullet(proj.description.trim()));
      }
    }

    // Technologies
    if (proj.technologies?.trim()) {
      paras.push(
        new Paragraph({
          spacing: { before: 20, after: 0, line: 276 },
          children: [
            new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Calibri', color: '555555' }),
            new TextRun({ text: proj.technologies, size: 20, font: 'Calibri', color: '555555', italics: true }),
          ],
        })
      );
    }

    // Business Impact & Results
    if (proj.results?.trim()) {
      paras.push(
        new Paragraph({
          spacing: { before: 40, after: 40, line: 276 },
          children: [
            new TextRun({ text: 'Results: ', bold: true, size: 20, font: 'Calibri', color: '555555' }),
            new TextRun({ text: proj.results.trim(), size: 20, font: 'Calibri', color: '555555', italics: true }),
          ],
        })
      );
    }
  }

  return paras;
}

function buildCertifications(data: ResumeData): Paragraph[] {
  const items = data.certifications?.filter((c) => c.name?.trim());
  if (!items?.length) return [];

  const paras: Paragraph[] = [heading('Certifications')];

  for (const cert of items) {
    const children: TextRun[] = [
      new TextRun({ text: cert.name, bold: true, size: 21, font: 'Calibri' }),
    ];
    if (cert.issuer) {
      children.push(new TextRun({ text: ` — ${cert.issuer}`, size: 21, font: 'Calibri' }));
    }
    if (cert.issueDate) {
      children.push(new TextRun({ text: ` (${formatDate(cert.issueDate)})`, size: 20, font: 'Calibri', color: '666666' }));
    }
    paras.push(new Paragraph({ spacing: { before: 60, after: 40, line: 276 }, children }));
  }

  return paras;
}

function buildLanguages(data: ResumeData): Paragraph[] {
  const items = data.languages?.filter((l) => l.language?.trim());
  if (!items?.length) return [];

  const paras: Paragraph[] = [heading('Languages')];

  const text = items
    .map((l) => {
      const parts = [l.language.trim()];
      if (l.proficiency) parts.push(`(${l.proficiency})`);
      return parts.join(' ');
    })
    .join('  •  ');

  paras.push(
    new Paragraph({
      spacing: { before: 40, after: 40, line: 276 },
      children: [new TextRun({ text, size: 21, font: 'Calibri' })],
    })
  );

  return paras;
}

function buildAwards(data: ResumeData): Paragraph[] {
  const items = data.awards?.filter((a) => a.name?.trim());
  if (!items?.length) return [];

  const paras: Paragraph[] = [heading('Awards')];

  for (const award of items) {
    const children: TextRun[] = [
      new TextRun({ text: award.name, bold: true, size: 21, font: 'Calibri' }),
    ];
    if (award.organization) {
      children.push(new TextRun({ text: ` — ${award.organization}`, size: 21, font: 'Calibri' }));
    }
    if (award.year) {
      children.push(new TextRun({ text: ` (${award.year})`, size: 20, font: 'Calibri', color: '666666' }));
    }
    paras.push(new Paragraph({ spacing: { before: 60, after: 40, line: 276 }, children }));
  }

  return paras;
}

function buildVolunteer(data: ResumeData): Paragraph[] {
  const items = data.volunteerExperience?.filter((v) => v.organization?.trim());
  if (!items?.length) return [];

  const paras: Paragraph[] = [heading('Volunteer Experience')];

  for (const vol of items) {
    paras.push(
      new Paragraph({
        spacing: { before: 160, after: 0 },
        children: [
          new TextRun({ text: vol.organization, bold: true, size: 22, font: 'Calibri' }),
          ...(vol.role
            ? [new TextRun({ text: ` — ${vol.role}`, size: 21, font: 'Calibri', italics: true })]
            : []),
        ],
      })
    );

    if (vol.description?.trim()) {
      const lines = vol.description
        .split(/\n/)
        .map((l) => l.replace(/^[\s•\-–—*]\s*/, '').trim())
        .filter(Boolean);
      for (const line of lines) {
        paras.push(bullet(line));
      }
    }
  }

  return paras;
}

function buildReferences(data: ResumeData): Paragraph[] {
  const items = data.references?.filter((r) => r.name?.trim());
  if (!items?.length) return [];

  const paras: Paragraph[] = [heading('References')];

  for (const ref of items) {
    const children: TextRun[] = [
      new TextRun({ text: ref.name, bold: true, size: 21, font: 'Calibri' }),
    ];
    const details: string[] = [];
    if (ref.position) details.push(ref.position);
    if (ref.company) details.push(ref.company);
    if (details.length > 0) {
      children.push(new TextRun({ text: `, ${details.join(' at ')}`, size: 21, font: 'Calibri' }));
    }
    paras.push(new Paragraph({ spacing: { before: 120, after: 0 }, children }));

    const contactParts: string[] = [];
    if (ref.email) contactParts.push(ref.email);
    if (ref.phone) contactParts.push(ref.phone);
    if (contactParts.length > 0) {
      paras.push(
        new Paragraph({
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({ text: contactParts.join('  |  '), size: 20, font: 'Calibri', color: '666666' }),
          ],
        })
      );
    }
  }

  return paras;
}

function buildAdditionalInfo(data: ResumeData): Paragraph[] {
  if (!data.additionalInfo?.text?.trim()) return [];
  return [
    heading('Additional Information'),
    ...data.additionalInfo.text
      .split(/\n/)
      .filter((l) => l.trim())
      .map((line) => textPara(line.trim())),
  ];
}

// ─── Main Export Function ─────────────────────────────────────────

export async function generateDocxBlob(data: ResumeData): Promise<Buffer> {
  const sections: Paragraph[] = [
    ...buildPersonalInfo(data),
    ...buildSummary(data),
    ...buildWorkExperience(data),
    ...buildEducation(data),
    ...buildSkills(data),
    ...buildProjects(data),
    ...buildCertifications(data),
    ...buildLanguages(data),
    ...buildAwards(data),
    ...buildVolunteer(data),
    ...buildReferences(data),
    ...buildAdditionalInfo(data),
  ];

  // No post-filter needed — section builders only add non-empty content

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 21,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.7),
              bottom: convertInchesToTwip(0.7),
              left: convertInchesToTwip(0.7),
            },
          },
        },
        children: sections,
      },
    ],
  });

  const buffer = await doc_to_buffer(doc);
  return Buffer.from(buffer);
}

/**
 * Convert a docx Document to an ArrayBuffer using Packer.
 * The docx library's Packer is async and returns a Blob or ArrayBuffer.
 */
async function doc_to_buffer(doc: Document): Promise<ArrayBuffer> {
  // Dynamic import to avoid bundling issues
  const { Packer } = await import('docx');
  return Packer.toBuffer(doc);
}
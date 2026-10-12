import type { TemplateComponentProps } from '@/types/template';
import type { SectionKey } from '@/types/resume';
import {
  formatDate,
  formatDateRange,
  formatDateRangeRaw,
  getContactItems,
  getVisibleSections,
  getSectionLabel,
  getTemplateStyles,
  hexToRgba,
} from '@/lib/templates/utils';

export default function Graduate({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const fs = 11 * customization.fontSize;
  const sectionGap = 16 * customization.sectionSpacing;

  // Get visible sections, then reorder so education comes before workExperience
  const rawSections = getVisibleSections(
    data,
    customization.hiddenSections,
    customization.sectionOrder,
  );

  const sections = reorderEducationFirst(rawSections);

  const contactItems = getContactItems(data.personalInfo);

  return (
    <div style={s.container}>
      {/* ── Header (Centered) ──────────────────────────────── */}
      <div style={{ marginBottom: `${sectionGap}px`, textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: s.heading.fontFamily,
            fontSize: `${22 * customization.fontSize}px`,
            fontWeight: 700,
            color: '#111827',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {data.personalInfo.fullName}
        </h1>
        {data.personalInfo.professionalTitle && (
          <p
            style={{
              fontSize: `${fs * 1.1}px`,
              color: s.accent.color,
              margin: `${4 * customization.sectionSpacing}px 0 0`,
              fontWeight: 500,
            }}
          >
            {data.personalInfo.professionalTitle}
          </p>
        )}

        {/* Centered contact with " · " separator */}
        {contactItems.length > 0 && (
          <p
            style={{
              fontSize: `${fs * 0.88}px`,
              color: '#6b7280',
              margin: `${8 * customization.sectionSpacing}px 0 0`,
              lineHeight: 1.5,
            }}
          >
            {contactItems.map((item, i) => {
              const display = item.replace(/^https?:\/\//, '').replace(/\/$/, '');
              const isLink = item.startsWith('http') || item.includes('@');
              if (isLink) {
                const href = item.startsWith('mailto:') || item.startsWith('tel:') || item.startsWith('http') ? item : `https://${item}`;
                return (
                  <span key={i}>
                    {i > 0 && <span style={{ color: '#d1d5db', margin: '0 6px' }}>·</span>}
                    <a href={href} style={{ color: '#6b7280', textDecoration: 'none' }}>{display}</a>
                  </span>
                );
              }
              return (
                <span key={i}>
                  {i > 0 && <span style={{ color: '#d1d5db', margin: '0 6px' }}>·</span>}
                  {display}
                </span>
              );
            })}
          </p>
        )}
      </div>

      {/* ── Sections ────────────────────────────────────────── */}
      {sections.map((sectionKey) => (
        <SectionRenderer
          key={sectionKey}
          sectionKey={sectionKey}
          data={data}
          customization={customization}
          s={s}
          fs={fs}
          sectionGap={sectionGap}
        />
      ))}
    </div>
  );
}

// ─── Reorder: education before workExperience ──────────────────

function reorderEducationFirst(sections: SectionKey[]): SectionKey[] {
  const hasEducation = sections.includes('education');
  const hasWork = sections.includes('workExperience');

  if (!hasEducation || !hasWork) return sections;

  const without = sections.filter(k => k !== 'education' && k !== 'workExperience');

  // Find the insertion point: after professionalSummary (which is always near top)
  const summaryIdx = without.indexOf('professionalSummary');
  const insertAt = summaryIdx >= 0 ? summaryIdx + 1 : 0;

  const result = [...without];
  result.splice(insertAt, 0, 'education');

  // Insert workExperience right after education
  const eduNewIdx = result.indexOf('education');
  result.splice(eduNewIdx + 1, 0, 'workExperience');

  return result;
}

// ─── Section Router ────────────────────────────────────────────

function SectionRenderer({
  sectionKey,
  data,
  customization,
  s,
  fs,
  sectionGap,
}: {
  sectionKey: SectionKey;
  data: TemplateComponentProps['data'];
  customization: TemplateComponentProps['customization'];
  s: ReturnType<typeof getTemplateStyles>;
  fs: number;
  sectionGap: number;
}) {
  const label = getSectionLabel(sectionKey);
  if (!label) return null;

  return (
    <div style={{ marginBottom: `${sectionGap}px` }}>
      <SectionHeading
        label={label}
        customization={customization}
        fs={fs}
        sectionGap={sectionGap}
      />
      <div>
        {sectionKey === 'professionalSummary' && renderSummary(data, customization, fs)}
        {sectionKey === 'workExperience' && renderWorkExperience(data, customization, fs)}
        {sectionKey === 'education' && renderEducation(data, customization, fs, s)}
        {sectionKey === 'skills' && renderSkills(data, customization, fs)}
        {sectionKey === 'projects' && renderProjects(data, customization, fs, s)}
        {sectionKey === 'certifications' && renderCertifications(data, customization, fs)}
        {sectionKey === 'languages' && renderLanguages(data, customization, fs)}
        {sectionKey === 'awards' && renderAwards(data, customization, fs)}
        {sectionKey === 'volunteerExperience' && renderVolunteer(data, customization, fs)}
        {sectionKey === 'references' && renderReferences(data, customization, fs)}
        {sectionKey === 'additionalInfo' && renderAdditionalInfo(data, customization, fs)}
      </div>
    </div>
  );
}

// ─── Section Heading ───────────────────────────────────────────

function SectionHeading({
  label,
  customization,
  fs,
  sectionGap,
}: {
  label: string;
  customization: TemplateComponentProps['customization'];
  fs: number;
  sectionGap: number;
}) {
  return (
    <div>
      <h2
        style={{
          fontFamily: customization.headingFont,
          fontSize: `${13 * customization.fontSize}px`,
          fontWeight: 700,
          color: customization.accentColor,
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </h2>
      {customization.sectionDividers && (
        <div
          style={{
            borderBottom: `2px solid ${customization.accentColor}`,
            marginTop: `${4 * customization.sectionSpacing}px`,
            marginBottom: `${sectionGap * 0.5}px`,
          }}
        />
      )}
    </div>
  );
}

// ─── Summary ───────────────────────────────────────────────────

function renderSummary(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  return (
    <p style={{ color: '#374151', margin: `${6 * customization.sectionSpacing}px 0 0`, lineHeight: customization.lineHeight, fontSize: `${fs}px` }}>
      {data.professionalSummary}
    </p>
  );
}

// ─── Education (Detailed, Graduate-focused) ────────────────────

function renderEducation(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number, s: ReturnType<typeof getTemplateStyles>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${14 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.education.filter(e => e.school || e.degree).map((edu) => (
        <div key={edu.id}>
          {/* Degree + field — bold and prominent */}
          <div className="flex items-baseline justify-between gap-2">
            <h3
              style={{
                fontWeight: 700,
                fontSize: `${fs * 1.05}px`,
                color: '#111827',
                margin: 0,
                fontFamily: s.heading.fontFamily,
              }}
            >
              {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
            </h3>
            <span style={{ fontSize: `${fs * 0.85}px`, color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {formatDateRangeRaw(edu.startDate, edu.endDate)}
            </span>
          </div>

          {/* School name — medium weight */}
          <p style={{ fontSize: `${fs}px`, color: '#374151', margin: '2px 0 0', fontWeight: 500 }}>
            {edu.school}
          </p>

          {/* Location + GPA */}
          <p style={{ fontSize: `${fs * 0.88}px`, color: '#6b7280', margin: '2px 0 0' }}>
            {edu.location}{edu.location && edu.grade ? '  ·  ' : ''}
            {edu.grade && <span style={{ fontWeight: 600, color: '#374151' }}>GPA: {edu.grade}</span>}
          </p>

          {/* Description / coursework / achievements as bullet points */}
          {(() => {
            const descLines = edu.description ? splitBullets(edu.description) : [];
            if (descLines.length === 0) return null;
            return (
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#374151' }}>
                {descLines.map((line, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: `${fs}px`,
                      lineHeight: customization.lineHeight,
                      marginBottom: i < descLines.length - 1 ? '2px' : '0',
                    }}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

// ─── Work Experience ───────────────────────────────────────────

function renderWorkExperience(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${12 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.workExperience.filter(e => e.company || e.position).map((exp) => {
        const descLines = splitBullets(exp.description);
        return (
          <div key={exp.id}>
            <div className="flex items-baseline justify-between gap-2">
              <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>
                {exp.position}
              </span>
              <span style={{ fontSize: `${fs * 0.85}px`, color: '#6b7280', whiteSpace: 'nowrap' }}>
                {formatDateRange(exp.startDate, exp.endDate, exp.currentJob)}
              </span>
            </div>
            <div style={{ fontSize: `${fs * 0.9}px`, color: '#4b5563', marginTop: 1 }}>
              {exp.company}{exp.location ? ` · ${exp.location}` : ''}
            </div>
            {descLines.length > 0 && (
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#374151' }}>
                {descLines.map((line, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: `${fs}px`,
                      lineHeight: customization.lineHeight,
                      marginBottom: i < descLines.length - 1 ? '2px' : '0',
                    }}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Skills (2-column grid with accent circle bullets) ─────────

function renderSkills(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  if (data.skills.length === 0) return null;

  const technicalSkills = data.skills.filter(sk => sk.type !== 'soft');
  const softSkills = data.skills.filter(sk => sk.type === 'soft');
  const hasBoth = technicalSkills.length > 0 && softSkills.length > 0;

  const renderSkillItem = (skill: typeof data.skills[0]) => (
    <div key={skill.id} className="flex items-center" style={{ gap: '6px' }}>
      <span
        style={{
          display: 'inline-block',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: customization.accentColor,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: `${fs}px`, color: '#374151' }}>
        {skill.name}
        {skill.proficiency && (
          <span style={{ color: '#6b7280', fontSize: '0.85em', marginLeft: 4 }}>({skill.proficiency})</span>
        )}
      </span>
    </div>
  );

  const renderSkillColumns = (skills: typeof data.skills) => {
    const half = Math.ceil(skills.length / 2);
    const leftCol = skills.slice(0, half);
    const rightCol = skills.slice(half);
    return (
      <div
        className="grid grid-cols-2"
        style={{
          gapX: '16px',
          gapY: `${3 * customization.sectionSpacing}px`,
        }}
      >
        {[leftCol, rightCol].map((col, colIdx) => (
          <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: `${3 * customization.sectionSpacing}px` }}>
            {col.map(renderSkillItem)}
          </div>
        ))}
      </div>
    );
  };

  const renderSkillGroup = (label: string, skills: typeof data.skills) => (
    <div>
      <p
        style={{
          fontSize: `${fs * 0.75}px`,
          fontWeight: 600,
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: `${10 * customization.sectionSpacing}px 0 ${4 * customization.sectionSpacing}px`,
        }}
      >
        {label}
      </p>
      {renderSkillColumns(skills)}
    </div>
  );

  if (hasBoth) {
    return (
      <div style={{ marginTop: `${6 * customization.sectionSpacing}px` }}>
        {renderSkillGroup('Technical Skills', technicalSkills)}
        {renderSkillGroup('Soft Skills', softSkills)}
      </div>
    );
  }
  return (
    <div
      className="grid grid-cols-2"
      style={{
        gapX: '16px',
        gapY: `${3 * customization.sectionSpacing}px`,
        marginTop: `${6 * customization.sectionSpacing}px`,
      }}
    >
      {(() => {
        const half = Math.ceil(data.skills.length / 2);
        const leftCol = data.skills.slice(0, half);
        const rightCol = data.skills.slice(half);
        return [leftCol, rightCol].map((col, colIdx) => (
          <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: `${3 * customization.sectionSpacing}px` }}>
            {col.map(renderSkillItem)}
          </div>
        ));
      })()}
    </div>
  );
}

// ─── Projects ──────────────────────────────────────────────────

function renderProjects(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number, s: ReturnType<typeof getTemplateStyles>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${12 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.projects.filter(p => p.name).map((proj) => (
        <div key={proj.id}>
          <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827', fontFamily: customization.headingFont }}>
            {proj.name}
          </span>
          {proj.technologies && (
            <span style={{ marginLeft: 8, fontSize: `${fs * 0.85}px`, color: customization.accentColor, fontWeight: 500 }}>
              {proj.technologies}
            </span>
          )}
          {(() => {
            const descLines = proj.description ? proj.description.split('\n').map(l => l.replace(/^[-\u2022*]\s*/, '').trim()).filter(Boolean) : [];
            if (descLines.length === 0) return null;
            return (
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#374151' }}>
                {descLines.map((line, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: `${fs}px`,
                      lineHeight: customization.lineHeight,
                      marginBottom: i < descLines.length - 1 ? '2px' : '0',
                    }}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            );
          })()}
          {proj.results && (
            <p
              style={{
                fontFamily: s.body.fontFamily,
                fontSize: `${fs}px`,
                color: '#374151',
                margin: '4px 0 0 0',
                lineHeight: customization.lineHeight,
                fontStyle: 'italic',
              }}
            >
              {proj.results}
            </p>
          )}
          {(proj.githubUrl || proj.liveUrl) && (
            <div className="flex flex-wrap" style={{ gap: `${3 * customization.sectionSpacing}px`, marginTop: `${3 * customization.sectionSpacing}px` }}>
              {proj.githubUrl && (
                <a
                  href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                  style={{ fontSize: `${fs * 0.85}px`, color: customization.accentColor, textDecoration: 'none', fontWeight: 500 }}
                >
                  GitHub
                </a>
              )}
              {proj.liveUrl && (
                <a
                  href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                  style={{ fontSize: `${fs * 0.85}px`, color: customization.accentColor, textDecoration: 'none', fontWeight: 500 }}
                >
                  Live Demo
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Certifications ────────────────────────────────────────────

function renderCertifications(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.certifications.filter(c => c.name).map((cert) => (
        <div key={cert.id} className="flex items-baseline justify-between gap-2">
          <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>
            {cert.name}
          </span>
          <span style={{ fontSize: `${fs * 0.85}px`, color: '#6b7280', whiteSpace: 'nowrap' }}>
            {cert.issuer}{cert.issueDate ? ` · ${formatDate(cert.issueDate)}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Languages ─────────────────────────────────────────────────

function renderLanguages(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  return (
    <div className="flex flex-wrap" style={{ gap: '4px 16px', marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.languages.map((lang) => (
        <span key={lang.id} style={{ fontSize: `${fs}px`, color: '#374151' }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>{lang.language}</span>
          <span style={{ color: '#6b7280' }}> — {lang.proficiency}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Awards ────────────────────────────────────────────────────

function renderAwards(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.awards.filter(a => a.name).map((award) => (
        <div key={award.id} className="flex items-baseline justify-between gap-2">
          <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>
            {award.name}
          </span>
          <span style={{ fontSize: `${fs * 0.85}px`, color: '#6b7280', whiteSpace: 'nowrap' }}>
            {award.organization}{award.year ? ` · ${award.year}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Volunteer ─────────────────────────────────────────────────

function renderVolunteer(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${10 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.volunteerExperience.filter(v => v.organization).map((vol) => (
        <div key={vol.id}>
          <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>
            {vol.role}
          </span>
          <span style={{ fontSize: `${fs * 0.9}px`, color: '#4b5563', marginLeft: 8 }}>
            — {vol.organization}
          </span>
          {(() => {
            const descLines = vol.description ? vol.description.split('\n').map(l => l.replace(/^[-\u2022*]\s*/, '').trim()).filter(Boolean) : [];
            if (descLines.length === 0) return null;
            return (
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#374151' }}>
                {descLines.map((line, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: `${fs}px`,
                      lineHeight: customization.lineHeight,
                      marginBottom: i < descLines.length - 1 ? '2px' : '0',
                    }}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

// ─── References ────────────────────────────────────────────────

function renderReferences(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${10 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.references.filter(r => r.name).map((ref) => (
        <div key={ref.id}>
          <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>{ref.name}</span>
          <span style={{ fontSize: `${fs * 0.9}px`, color: '#4b5563', marginLeft: 8 }}>
            {ref.position}{ref.company ? ` at ${ref.company}` : ''}
          </span>
          <div style={{ fontSize: `${fs * 0.85}px`, color: '#6b7280', marginTop: 1 }}>
            {[ref.email, ref.phone].filter(Boolean).join(' · ')}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Additional Info ───────────────────────────────────────────

function renderAdditionalInfo(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  return (
    <div style={{ color: '#374151', margin: `${6 * customization.sectionSpacing}px 0 0`, lineHeight: customization.lineHeight, fontSize: `${fs}px`, whiteSpace: 'pre-line' as const }}>
      {data.additionalInfo.text}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

function splitBullets(text: string): string[] {
  if (!text) return [];
  return text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
}
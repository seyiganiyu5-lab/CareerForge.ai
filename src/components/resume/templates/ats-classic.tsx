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
} from '@/lib/templates/utils';

// ─── Color Palette ─────────────────────────────────────────────────────
const COLORS = {
  text: '#1a1a2e',
  secondary: '#4a4a68',
  muted: '#6b7280',
  divider: '#e5e7eb',
} as const;

export default function AtsClassic({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const contactItems = getContactItems(data.personalInfo);
  const visibleSections = getVisibleSections(
    data,
    customization.hiddenSections,
    customization.sectionOrder
  );

  // ─── Computed Sizes ─────────────────────────────────────────────────
  const nameSize = `${22 * customization.fontSize}px`;
  const titleSize = `${12 * customization.fontSize}px`;
  const headingSize = `${12 * customization.fontSize}px`;
  const baseSize = `${10.5 * customization.fontSize}px`;
  const smallSize = `${9.5 * customization.fontSize}px`;
  const sectionGap = `${18 * customization.sectionSpacing}px`;
  const entryGap = `${10 * customization.sectionSpacing}px`;
  const smallEntryGap = `${6 * customization.sectionSpacing}px`;

  // ─── Section Divider (between sections) ─────────────────────────────
  const renderSectionDivider = () => {
    if (!customization.sectionDividers) return null;
    return (
      <div
        style={{
          height: '1px',
          backgroundColor: COLORS.divider,
          marginTop: sectionGap,
        }}
      />
    );
  };

  // ─── Section Heading ────────────────────────────────────────────────
  const renderSectionHeading = (key: SectionKey) => {
    const label = getSectionLabel(key);
    if (!label) return null;
    return (
      <h2
        style={{
          fontFamily: s.heading.fontFamily,
          fontSize: headingSize,
          fontWeight: 700,
          color: COLORS.text,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.1em',
          margin: '0 0 6px 0',
          paddingBottom: '4px',
          borderBottom: `1.5px solid ${customization.accentColor}`,
          lineHeight: 1.3,
        }}
      >
        {label}
      </h2>
    );
  };

  // ─── Shared Style Helpers ───────────────────────────────────────────
  const entryTitleStyle: React.CSSProperties = {
    fontFamily: s.heading.fontFamily,
    fontSize: baseSize,
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
    lineHeight: 1.3,
  };

  const entrySubtitleStyle: React.CSSProperties = {
    fontFamily: s.body.fontFamily,
    fontSize: baseSize,
    color: COLORS.secondary,
    margin: '2px 0 0 0',
    lineHeight: 1.3,
  };

  const dateStyle: React.CSSProperties = {
    fontFamily: s.body.fontFamily,
    fontSize: smallSize,
    color: COLORS.muted,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  };



  const rowLayout: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '12px',
  };

  // ─── Main Return ────────────────────────────────────────────────────
  return (
    <div style={s.container}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: sectionGap }}>
        <h1
          style={{
            fontFamily: s.heading.fontFamily,
            fontSize: nameSize,
            fontWeight: 700,
            color: COLORS.text,
            margin: '0 0 3px 0',
            lineHeight: 1.15,
          }}
        >
          {data.personalInfo.fullName}
        </h1>

        {data.personalInfo.professionalTitle && (
          <p
            style={{
              fontFamily: s.heading.fontFamily,
              fontSize: titleSize,
              fontWeight: 500,
              color: customization.accentColor,
              margin: '0 0 8px 0',
              lineHeight: 1.3,
            }}
          >
            {data.personalInfo.professionalTitle}
          </p>
        )}

        {contactItems.length > 0 && (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: smallSize,
              color: COLORS.muted,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {contactItems.join(' | ')}
          </p>
        )}
      </div>

      {/* ── Sections ─────────────────────────────────────────────── */}
      {visibleSections.map((key, idx) => (
        <div key={key}>
          {idx > 0 && renderSectionDivider()}
          <div style={{ marginTop: idx > 0 ? sectionGap : 0 }}>
            {renderSectionHeading(key)}
            <div style={{ marginTop: '8px' }}>
              {renderSection(key)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Section Router ──────────────────────────────────────────────────

  function renderSection(key: SectionKey) {
    switch (key) {
      case 'professionalSummary':
        return renderProfessionalSummary();
      case 'workExperience':
        return renderWorkExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      case 'projects':
        return renderProjects();
      case 'certifications':
        return renderCertifications();
      case 'languages':
        return renderLanguages();
      case 'awards':
        return renderAwards();
      case 'volunteerExperience':
        return renderVolunteerExperience();
      case 'references':
        return renderReferences();
      case 'additionalInfo':
        return renderAdditionalInfo();
      default:
        return null;
    }
  }

  // ── Professional Summary ────────────────────────────────────────────

  function renderProfessionalSummary() {
    if (!data.professionalSummary.trim()) return null;
    return (
      <p
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: baseSize,
          color: COLORS.secondary,
          lineHeight: customization.lineHeight,
          margin: 0,
          whiteSpace: 'pre-line' as const,
        }}
      >
        {data.professionalSummary}
      </p>
    );
  }

  // ── Work Experience ─────────────────────────────────────────────────

  function renderWorkExperience() {
    const entries = data.workExperience.filter(e => e.company || e.position);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((exp) => {
          const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.currentJob);
          const descLines = exp.description
            ? exp.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            : [];
          return (
            <div key={exp.id}>
              <div style={rowLayout}>
                <h3 style={entryTitleStyle}>
                  {exp.position}
                </h3>
                {dateRange && (
                  <span style={dateStyle}>
                    {dateRange}
                  </span>
                )}
              </div>
              <p style={entrySubtitleStyle}>
                {exp.company}{exp.location ? `, ${exp.location}` : ''}
              </p>
              {descLines.length > 0 && (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: COLORS.secondary }}>
                  {descLines.map((line, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: s.body.fontFamily,
                        fontSize: baseSize,
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

  // ── Education ───────────────────────────────────────────────────────

  function renderEducation() {
    const entries = data.education.filter(e => e.school || e.degree);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((edu) => {
          const dateRange = formatDateRangeRaw(edu.startDate, edu.endDate);
          return (
            <div key={edu.id}>
              <div style={rowLayout}>
                <h3 style={entryTitleStyle}>
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </h3>
                {dateRange && (
                  <span style={dateStyle}>
                    {dateRange}
                  </span>
                )}
              </div>
              <p style={entrySubtitleStyle}>
                {edu.school}{edu.location ? `, ${edu.location}` : ''}{edu.grade ? ` — GPA: ${edu.grade}` : ''}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Skills ──────────────────────────────────────────────────────────

  function renderSkills() {
    if (data.skills.length === 0) return null;
    const technicalSkills = data.skills.filter(sk => sk.type !== 'soft');
    const softSkills = data.skills.filter(sk => sk.type === 'soft');
    const hasBoth = technicalSkills.length > 0 && softSkills.length > 0;

    const renderSkillLine = (skills: typeof data.skills) => (
      <p
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: baseSize,
          color: COLORS.secondary,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {skills.map((sk, i) => (
          <span key={sk.id}>
            {sk.name}
            {sk.proficiency && (
              <span style={{ color: '#6b7280', fontSize: '0.85em' }}> ({sk.proficiency})</span>
            )}
            {i < skills.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
    );

    const renderSkillGroup = (label: string, skills: typeof data.skills) => (
      <div>
        <p
          style={{
            fontFamily: s.body.fontFamily,
            fontSize: smallSize,
            fontWeight: 600,
            color: COLORS.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '10px 0 4px 0',
          }}
        >
          {label}
        </p>
        {renderSkillLine(skills)}
      </div>
    );

    if (hasBoth) {
      return (
        <div>
          {renderSkillGroup('Technical Skills', technicalSkills)}
          {renderSkillGroup('Soft Skills', softSkills)}
        </div>
      );
    }
    return renderSkillLine(data.skills);
  }

  // ── Projects ────────────────────────────────────────────────────────

  function renderProjects() {
    const entries = data.projects.filter(p => p.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((proj) => {
          const descLines = proj.description
            ? proj.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            : [];
          return (
            <div key={proj.id}>
              <h3 style={entryTitleStyle}>
                {proj.name}
              </h3>
              {proj.technologies && (
                <p
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: COLORS.muted,
                    margin: '2px 0 0 0',
                    lineHeight: 1.3,
                  }}
                >
                  {proj.technologies}
                </p>
              )}
              {descLines.length > 0 && (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: COLORS.secondary }}>
                  {descLines.map((line, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: s.body.fontFamily,
                        fontSize: baseSize,
                        lineHeight: customization.lineHeight,
                        marginBottom: i < descLines.length - 1 ? '2px' : '0',
                      }}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              )}
              {proj.results && (
                <p
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: baseSize,
                    color: COLORS.secondary,
                    margin: '4px 0 0 0',
                    lineHeight: customization.lineHeight,
                    fontStyle: 'italic',
                  }}
                >
                  {proj.results}
                </p>
              )}
              {(proj.githubUrl || proj.liveUrl) && (
                <p
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: COLORS.muted,
                    margin: '4px 0 0 0',
                    lineHeight: 1.3,
                  }}
                >
                  {[proj.githubUrl, proj.liveUrl].filter(Boolean).join(' | ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Certifications ──────────────────────────────────────────────────

  function renderCertifications() {
    const entries = data.certifications.filter(c => c.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: smallEntryGap }}>
        {entries.map((cert) => {
          const dateStr = formatDate(cert.issueDate);
          return (
            <div key={cert.id}>
              <div style={rowLayout}>
                <h3 style={entryTitleStyle}>
                  {cert.name}
                </h3>
                {dateStr && (
                  <span style={dateStyle}>
                    {dateStr}
                  </span>
                )}
              </div>
              {cert.issuer && (
                <p style={entrySubtitleStyle}>
                  {cert.issuer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Languages ───────────────────────────────────────────────────────

  function renderLanguages() {
    if (data.languages.length === 0) return null;
    return (
      <p
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: baseSize,
          color: COLORS.secondary,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {data.languages.map(l => `${l.language} (${l.proficiency})`).join(', ')}
      </p>
    );
  }

  // ── Awards ──────────────────────────────────────────────────────────

  function renderAwards() {
    const entries = data.awards.filter(a => a.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: smallEntryGap }}>
        {entries.map((award) => (
          <div key={award.id}>
            <div style={rowLayout}>
              <h3 style={entryTitleStyle}>
                {award.name}
              </h3>
              {award.year && (
                <span style={dateStyle}>
                  {award.year}
                </span>
              )}
            </div>
            {award.organization && (
              <p style={entrySubtitleStyle}>
                {award.organization}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Volunteer Experience ────────────────────────────────────────────

  function renderVolunteerExperience() {
    const entries = data.volunteerExperience.filter(v => v.organization);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((vol) => {
          const descLines = vol.description
            ? vol.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            : [];
          return (
            <div key={vol.id}>
              <h3 style={entryTitleStyle}>
                {vol.role} — {vol.organization}
              </h3>
              {descLines.length > 0 && (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: COLORS.secondary }}>
                  {descLines.map((line, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: s.body.fontFamily,
                        fontSize: baseSize,
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

  // ── References ──────────────────────────────────────────────────────

  function renderReferences() {
    const entries = data.references.filter(r => r.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((ref) => (
          <div key={ref.id}>
            <h3 style={entryTitleStyle}>
              {ref.name}
            </h3>
            <p
              style={{
                fontFamily: s.body.fontFamily,
                fontSize: baseSize,
                color: COLORS.secondary,
                margin: '2px 0 0 0',
                lineHeight: 1.3,
              }}
            >
              {[ref.position, ref.company].filter(Boolean).join(' at ')}
            </p>
            {(ref.email || ref.phone) && (
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: smallSize,
                  color: COLORS.muted,
                  margin: '1px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {[ref.email, ref.phone].filter(Boolean).join(' | ')}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Additional Information ──────────────────────────────────────────

  function renderAdditionalInfo() {
    if (!data.additionalInfo.text.trim()) return null;
    return (
      <div
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: baseSize,
          color: COLORS.secondary,
          lineHeight: customization.lineHeight,
          whiteSpace: 'pre-line' as const,
        }}
      >
        {data.additionalInfo.text}
      </div>
    );
  }
}
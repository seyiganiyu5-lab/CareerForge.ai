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

export default function ModernMinimal({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const { accentColor, fontSize, sectionSpacing, headerAlignment, lineHeight } = customization;

  const nameSize = `${24 * fontSize}px`;
  const titleSize = `${12.5 * fontSize}px`;
  const headingSize = `${15 * fontSize}px`;
  const baseSize = `${10.5 * fontSize}px`;
  const smallSize = `${9.5 * fontSize}px`;
  const sectionGap = `${Math.round(22 * sectionSpacing)}px`;
  const itemGap = `${Math.round(12 * sectionSpacing)}px`;
  const smallItemGap = `${Math.round(6 * sectionSpacing)}px`;

  const contactItems = getContactItems(data.personalInfo);
  const visibleSections = getVisibleSections(data, customization.hiddenSections, customization.sectionOrder);

  const align =
    headerAlignment === 'center' ? 'center' as const
    : headerAlignment === 'right' ? 'right' as const
    : 'left' as const;

  return (
    <div style={s.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ marginBottom: sectionGap, textAlign: align }}>
        <h1
          style={{
            fontFamily: s.heading.fontFamily,
            fontSize: nameSize,
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 6px 0',
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
          }}
        >
          {data.personalInfo.fullName}
        </h1>

        {data.personalInfo.professionalTitle && (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: titleSize,
              color: accentColor,
              margin: '0 0 18px 0',
              fontWeight: 500,
              letterSpacing: '0.2px',
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
              color: '#6b7280',
              margin: 0,
              lineHeight: 1.7,
              textAlign: align,
            }}
          >
            {contactItems.join(' \u00B7 ')}
          </p>
        )}
      </header>

      {/* ── Sections ───────────────────────────────────────── */}
      {visibleSections.map((sectionKey, idx) => (
        <section key={sectionKey} style={{ marginTop: idx > 0 ? sectionGap : 0 }}>
          {/* Section heading — large, bold, no decorations */}
          <h2
            style={{
              fontFamily: s.heading.fontFamily,
              fontSize: headingSize,
              fontWeight: 700,
              color: '#0f172a',
              margin: `0 0 10px 0`,
              lineHeight: 1.25,
              letterSpacing: '-0.3px',
            }}
          >
            {getSectionLabel(sectionKey)}
          </h2>
          <div style={{ color: s.body.color }}>
            {renderSection(sectionKey)}
          </div>
        </section>
      ))}
    </div>
  );

  // ── Section Renderers ──────────────────────────────────────

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

  function renderProfessionalSummary() {
    if (!data.professionalSummary.trim()) return null;
    return (
      <p
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: baseSize,
          margin: 0,
          lineHeight: lineHeight,
          color: '#374151',
        }}
      >
        {data.professionalSummary}
      </p>
    );
  }

  function renderWorkExperience() {
    const entries = data.workExperience.filter(e => e.company || e.position);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: itemGap }}>
        {entries.map((job) => {
          const dateRange = formatDateRange(job.startDate, job.endDate, job.currentJob);
          return (
            <div key={job.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '8px',
                }}
              >
                <h3
                  style={{
                    fontFamily: s.heading.fontFamily,
                    fontSize: baseSize,
                    fontWeight: 700,
                    margin: 0,
                    color: '#0f172a',
                    lineHeight: 1.3,
                  }}
                >
                  {job.position}{job.company ? `, ${job.company}` : ''}
                </h3>
                {dateRange && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: '#9ca3af',
                      whiteSpace: 'nowrap' as const,
                      flexShrink: 0,
                    }}
                  >
                    {dateRange}
                  </span>
                )}
              </div>
              {job.location && (
                <p
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: '#6b7280',
                    margin: '2px 0 0 0',
                    lineHeight: 1.3,
                  }}
                >
                  {job.location}
                </p>
              )}
              {(() => {
                const descLines = job.description ? job.description.split('\n').map(l => l.replace(/^[-\u2022*]\s*/, '').trim()).filter(Boolean) : [];
                if (descLines.length === 0) return null;
                return (
                  <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#374151' }}>
                    {descLines.map((line, i) => (
                      <li
                        key={i}
                        style={{
                          fontFamily: s.body.fontFamily,
                          fontSize: baseSize,
                          lineHeight: lineHeight,
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
          );
        })}
      </div>
    );
  }

  function renderEducation() {
    const entries = data.education.filter(e => e.school || e.degree);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: itemGap }}>
        {entries.map((edu) => {
          const dateRange = formatDateRangeRaw(edu.startDate, edu.endDate);
          const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
          return (
            <div key={edu.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '8px',
                }}
              >
                <h3
                  style={{
                    fontFamily: s.heading.fontFamily,
                    fontSize: baseSize,
                    fontWeight: 700,
                    margin: 0,
                    color: '#0f172a',
                    lineHeight: 1.3,
                  }}
                >
                  {edu.school}
                </h3>
                {dateRange && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: '#9ca3af',
                      whiteSpace: 'nowrap' as const,
                      flexShrink: 0,
                    }}
                  >
                    {dateRange}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: baseSize,
                  color: '#6b7280',
                  margin: '2px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {degreeLine}{edu.grade ? ` — GPA: ${edu.grade}` : ''}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

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
          margin: 0,
          lineHeight: 1.8,
          color: '#374151',
        }}
      >
        {skills.map((sk, i) => (
          <span key={sk.id}>
            {sk.name}
            {sk.proficiency && (
              <span style={{ color: '#6b7280', fontSize: '0.85em' }}> ({sk.proficiency})</span>
            )}
            {i < skills.length - 1 ? ' \u00B7 ' : ''}
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
            color: '#9ca3af',
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

  function renderProjects() {
    const entries = data.projects.filter(p => p.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: itemGap }}>
        {entries.map((proj) => (
          <div key={proj.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '8px',
              }}
            >
              <h3
                style={{
                  fontFamily: s.heading.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  margin: 0,
                  color: '#0f172a',
                  lineHeight: 1.3,
                }}
              >
                {proj.name}
              </h3>
              {proj.technologies && (
                <span
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: '#9ca3af',
                    whiteSpace: 'nowrap' as const,
                    flexShrink: 0,
                  }}
                >
                  {proj.technologies}
                </span>
              )}
            </div>
            {(() => {
              const descLines = proj.description ? proj.description.split('\n').map(l => l.replace(/^[-\u2022*]\s*/, '').trim()).filter(Boolean) : [];
              if (descLines.length === 0) return null;
              return (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#374151' }}>
                  {descLines.map((line, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: s.body.fontFamily,
                        fontSize: baseSize,
                        lineHeight: lineHeight,
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
                  fontSize: baseSize,
                  color: '#374151',
                  margin: '4px 0 0 0',
                  lineHeight: lineHeight,
                  fontStyle: 'italic',
                }}
              >
                {proj.results}
              </p>
            )}
            {(proj.githubUrl || proj.liveUrl) && (
              <div style={{ marginTop: '3px' }}>
                {proj.githubUrl && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: accentColor,
                      marginRight: '12px',
                    }}
                  >
                    {proj.githubUrl}
                  </span>
                )}
                {proj.liveUrl && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: accentColor,
                    }}
                  >
                    {proj.liveUrl}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderCertifications() {
    const entries = data.certifications.filter(c => c.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: smallItemGap }}>
        {entries.map((cert) => (
          <div key={cert.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '8px',
              }}
            >
              <h3
                style={{
                  fontFamily: s.heading.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  margin: 0,
                  color: '#0f172a',
                  lineHeight: 1.3,
                }}
              >
                {cert.name}
              </h3>
              {cert.issueDate && (
                <span
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: '#9ca3af',
                    whiteSpace: 'nowrap' as const,
                    flexShrink: 0,
                  }}
                >
                  {formatDate(cert.issueDate)}
                </span>
              )}
            </div>
            {cert.issuer && (
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: baseSize,
                  color: '#6b7280',
                  margin: '2px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {cert.issuer}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderLanguages() {
    if (data.languages.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px 20px' }}>
        {data.languages.filter(l => l.language).map(lang => (
          <p
            key={lang.id}
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: baseSize,
              margin: 0,
              color: '#374151',
              lineHeight: 1.6,
            }}
          >
            {lang.language}
            <span style={{ color: '#9ca3af' }}> — {lang.proficiency}</span>
          </p>
        ))}
      </div>
    );
  }

  function renderAwards() {
    const entries = data.awards.filter(a => a.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: smallItemGap }}>
        {entries.map((award) => (
          <div key={award.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '8px',
              }}
            >
              <h3
                style={{
                  fontFamily: s.heading.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  margin: 0,
                  color: '#0f172a',
                  lineHeight: 1.3,
                }}
              >
                {award.name}
              </h3>
              {award.year && (
                <span
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: '#9ca3af',
                    whiteSpace: 'nowrap' as const,
                    flexShrink: 0,
                  }}
                >
                  {award.year}
                </span>
              )}
            </div>
            {award.organization && (
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: baseSize,
                  color: '#6b7280',
                  margin: '2px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {award.organization}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderVolunteerExperience() {
    const entries = data.volunteerExperience.filter(v => v.organization);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: itemGap }}>
        {entries.map((vol) => (
          <div key={vol.id}>
            <h3
              style={{
                fontFamily: s.heading.fontFamily,
                fontSize: baseSize,
                fontWeight: 700,
                margin: 0,
                color: '#0f172a',
                lineHeight: 1.3,
              }}
            >
              {vol.role}{vol.organization ? ` \u2014 ${vol.organization}` : ''}
            </h3>
            {(() => {
              const descLines = vol.description ? vol.description.split('\n').map(l => l.replace(/^[-\u2022*]\s*/, '').trim()).filter(Boolean) : [];
              if (descLines.length === 0) return null;
              return (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#374151' }}>
                  {descLines.map((line, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: s.body.fontFamily,
                        fontSize: baseSize,
                        lineHeight: lineHeight,
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

  function renderReferences() {
    const entries = data.references.filter(r => r.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: itemGap }}>
        {entries.map((ref) => (
          <div key={ref.id}>
            <h3
              style={{
                fontFamily: s.heading.fontFamily,
                fontSize: baseSize,
                fontWeight: 700,
                margin: 0,
                color: '#0f172a',
                lineHeight: 1.3,
              }}
            >
              {ref.name}
            </h3>
            <p
              style={{
                fontFamily: s.body.fontFamily,
                fontSize: baseSize,
                color: '#6b7280',
                margin: '2px 0 0 0',
                lineHeight: 1.3,
              }}
            >
              {[ref.position, ref.company].filter(Boolean).join(' \u00B7 ')}
            </p>
            {(ref.email || ref.phone) && (
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: smallSize,
                  color: '#9ca3af',
                  margin: '2px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {[ref.email, ref.phone].filter(Boolean).join(' \u00B7 ')}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderAdditionalInfo() {
    if (!data.additionalInfo.text.trim()) return null;
    return (
      <p
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: baseSize,
          margin: 0,
          lineHeight: lineHeight,
          color: '#374151',
          whiteSpace: 'pre-line' as const,
        }}
      >
        {data.additionalInfo.text}
      </p>
    );
  }
}
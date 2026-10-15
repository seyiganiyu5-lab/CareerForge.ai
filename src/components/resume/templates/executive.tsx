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
  docLanguage,
  docText,
  levelLabel,
} from '@/lib/templates/utils';

export default function Executive({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const lang = docLanguage(customization);
  const T = docText(lang);
  const { accentColor, fontSize, sectionSpacing, lineHeight } = customization;

  const nameSize = `${26 * fontSize}px`;
  const titleSize = `${12 * fontSize}px`;
  const headingSize = `${11 * fontSize}px`;
  const baseSize = `${10.5 * fontSize}px`;
  const smallSize = `${9.5 * fontSize}px`;
  const sectionGap = `${Math.round(26 * sectionSpacing)}px`;
  const entryGap = `${Math.round(14 * sectionSpacing)}px`;
  const smallEntryGap = `${Math.round(8 * sectionSpacing)}px`;

  const contactItems = getContactItems(data.personalInfo);
  const visibleSections = getVisibleSections(data, customization.hiddenSections, customization.sectionOrder);

  const nameFont = 'Georgia, "Times New Roman", serif';

  // ── Decorative section heading with flanking lines ────────
  const renderSectionHeading = (key: SectionKey) => {
    const label = getSectionLabel(key, lang);
    if (!label) return null;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          margin: `0 0 ${10 * sectionSpacing}px 0`,
        }}
      >
        <div
          style={{
            width: '40px',
            height: '1px',
            backgroundColor: '#d1d5db',
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontFamily: nameFont,
            fontSize: headingSize,
            fontWeight: 600,
            color: '#1a1a2e',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.15em',
            margin: 0,
            lineHeight: 1.4,
            whiteSpace: 'nowrap' as const,
          }}
        >
          {label}
        </h2>
        <div
          style={{
            width: '40px',
            height: '1px',
            backgroundColor: '#d1d5db',
            flexShrink: 0,
          }}
        />
      </div>
    );
  };

  return (
    <div style={s.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ textAlign: 'center' as const, marginBottom: sectionGap }}>
        {/* Thin rule line above name */}
        <div
          style={{
            width: '80%',
            maxWidth: '500px',
            height: '0.5px',
            backgroundColor: '#d1d5db',
            margin: '0 auto 16px auto',
          }}
        />

        <h1
          style={{
            fontFamily: nameFont,
            fontSize: nameSize,
            fontWeight: 700,
            color: '#1a1a2e',
            margin: '0 0 8px 0',
            letterSpacing: '1px',
            lineHeight: 1.15,
          }}
        >
          {data.personalInfo.fullName}
        </h1>

        {/* Thin rule line below name */}
        <div
          style={{
            width: '40%',
            maxWidth: '250px',
            height: '0.5px',
            backgroundColor: '#d1d5db',
            margin: '0 auto 14px auto',
          }}
        />

        {data.personalInfo.professionalTitle && (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: titleSize,
              color: accentColor,
              margin: '0 0 16px 0',
              fontWeight: 500,
              letterSpacing: '0.5px',
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
              letterSpacing: '0.2px',
            }}
          >
            {contactItems.join('  |  ')}
          </p>
        )}
      </div>

      {/* ── Sections ───────────────────────────────────────── */}
      {visibleSections.map((key, idx) => (
        <div
          key={key}
          style={{
            marginTop: idx > 0 ? sectionGap : 0,
          }}
        >
          {renderSectionHeading(key)}
          <div>{renderSection(key)}</div>
        </div>
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
          color: '#374151',
          lineHeight: lineHeight,
          margin: 0,
          whiteSpace: 'pre-line' as const,
          textAlign: 'center' as const,
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
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: entryGap }}>
        {entries.map((job) => {
          const dateRange = formatDateRange(job.startDate, job.endDate, job.currentJob, lang);
          return (
            <div key={job.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                }}
              >
                <h3
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: baseSize,
                    fontWeight: 700,
                    margin: 0,
                    color: '#1a1a2e',
                    lineHeight: 1.3,
                    letterSpacing: '0.2px',
                  }}
                >
                  {job.position}
                  {job.company && (
                    <span style={{ color: accentColor, fontWeight: 500, fontFamily: s.body.fontFamily }}>
                      {' '}| {job.company}
                    </span>
                  )}
                </h3>
                {dateRange && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: '#6b7280',
                      whiteSpace: 'nowrap' as const,
                      flexShrink: 0,
                      letterSpacing: '0.3px',
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
                    color: '#9ca3af',
                    margin: '3px 0 0 0',
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
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: entryGap }}>
        {entries.map((edu) => {
          const dateRange = formatDateRangeRaw(edu.startDate, edu.endDate, lang);
          return (
            <div key={edu.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                }}
              >
                <h3
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: baseSize,
                    fontWeight: 700,
                    margin: 0,
                    color: '#1a1a2e',
                    lineHeight: 1.3,
                  }}
                >
                  {edu.degree}{edu.fieldOfStudy ? ` ${T.in} ${edu.fieldOfStudy}` : ''}
                </h3>
                {dateRange && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: '#6b7280',
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
                  margin: '3px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {[edu.school, edu.location].filter(Boolean).join('  |  ')}
              </p>
              {edu.grade && (
                <p
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: '#9ca3af',
                    margin: '2px 0 0 0',
                    lineHeight: 1.3,
                  }}
                >
                  {T.gpa}: {edu.grade}
                </p>
              )}
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

    const renderSkillItem = (sk: typeof data.skills[0]) => (
      <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '18px',
            height: '0.5px',
            backgroundColor: accentColor,
            flexShrink: 0,
            opacity: 0.6,
          }}
        />
        <span
          style={{
            fontFamily: s.body.fontFamily,
            fontSize: baseSize,
            color: '#374151',
            lineHeight: 1.5,
          }}
        >
          {sk.name}
          {sk.proficiency && (
            <span style={{ color: '#6b7280', fontSize: '0.85em', marginLeft: 4 }}>({levelLabel(sk.proficiency, lang)})</span>
          )}
        </span>
      </div>
    );

    const renderSkillColumns = (skills: typeof data.skills) => {
      const half = Math.ceil(skills.length / 2);
      const col1 = skills.slice(0, half);
      const col2 = skills.slice(half);
      return (
        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
            {col1.map(renderSkillItem)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
            {col2.map(renderSkillItem)}
          </div>
        </div>
      );
    };

    const renderSkillGroup = (label: string, skills: typeof data.skills) => (
      <div>
        <p
          style={{
            fontFamily: s.body.fontFamily,
            fontSize: smallSize,
            fontWeight: 600,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '10px 0 6px 0',
          }}
        >
          {label}
        </p>
        {renderSkillColumns(skills)}
      </div>
    );

    if (hasBoth) {
      return (
        <div>
          {renderSkillGroup(T.technicalSkills, technicalSkills)}
          {renderSkillGroup(T.softSkills, softSkills)}
        </div>
      );
    }
    return renderSkillColumns(data.skills);
  }

  function renderProjects() {
    const entries = data.projects.filter(p => p.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: entryGap }}>
        {entries.map((proj) => (
          <div key={proj.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <h3
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  margin: 0,
                  color: '#1a1a2e',
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
                    color: '#6b7280',
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
            {proj.liveUrl && (
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: smallSize,
                  color: accentColor,
                  margin: '3px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {proj.liveUrl}
              </p>
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
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: smallEntryGap }}>
        {entries.map((cert) => {
          const dateStr = formatDate(cert.issueDate, lang);
          return (
            <div key={cert.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                }}
              >
                <h3
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: baseSize,
                    fontWeight: 700,
                    margin: 0,
                    color: '#1a1a2e',
                    lineHeight: 1.3,
                  }}
                >
                  {cert.name}
                </h3>
                {dateStr && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: '#6b7280',
                      whiteSpace: 'nowrap' as const,
                      flexShrink: 0,
                    }}
                  >
                    {dateStr}
                  </span>
                )}
              </div>
              {cert.issuer && (
                <p
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: baseSize,
                    color: '#6b7280',
                    margin: '3px 0 0 0',
                    lineHeight: 1.3,
                  }}
                >
                  {cert.issuer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function renderLanguages() {
    if (data.languages.length === 0) return null;
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: '4px 24px',
        }}
      >
        {data.languages.map(langItem => (
          <span
            key={langItem.id}
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: baseSize,
              color: '#374151',
              lineHeight: 1.6,
            }}
          >
            {langItem.language}
            <span style={{ color: '#6b7280' }}> — {levelLabel(langItem.proficiency, lang)}</span>
          </span>
        ))}
      </div>
    );
  }

  function renderAwards() {
    const entries = data.awards.filter(a => a.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: smallEntryGap }}>
        {entries.map((award) => (
          <div key={award.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <h3
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  margin: 0,
                  color: '#1a1a2e',
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
                    color: '#6b7280',
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
                  margin: '3px 0 0 0',
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
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: entryGap }}>
        {entries.map((vol) => (
          <div key={vol.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <h3
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  margin: 0,
                  color: '#1a1a2e',
                  lineHeight: 1.3,
                }}
              >
                {vol.role}
                {vol.organization && (
                  <span style={{ color: accentColor, fontWeight: 500 }}>
                    {' '}| {vol.organization}
                  </span>
                )}
              </h3>
            </div>
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
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: entryGap }}>
        {entries.map((ref) => (
          <div key={ref.id}>
            <h3
              style={{
                fontFamily: s.body.fontFamily,
                fontSize: baseSize,
                fontWeight: 700,
                margin: 0,
                color: '#1a1a2e',
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
                margin: '3px 0 0 0',
                lineHeight: 1.3,
              }}
            >
              {[ref.position, ref.company].filter(Boolean).join('  |  ')}
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
                {[ref.email, ref.phone].filter(Boolean).join('  |  ')}
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
      <div
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: baseSize,
          color: '#374151',
          lineHeight: lineHeight,
          whiteSpace: 'pre-line' as const,
        }}
      >
        {data.additionalInfo.text}
      </div>
    );
  }
}
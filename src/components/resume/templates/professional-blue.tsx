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

export default function ProfessionalBlue({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const lang = docLanguage(customization);
  const T = docText(lang);
  const contactItems = getContactItems(data.personalInfo);
  const visibleSections = getVisibleSections(
    data,
    customization.hiddenSections,
    customization.sectionOrder
  );

  const nameSize = `${24 * customization.fontSize}px`;
  const titleSize = `${12.5 * customization.fontSize}px`;
  const headingSize = `${13 * customization.fontSize}px`;
  const baseSize = `${10.5 * customization.fontSize}px`;
  const smallSize = `${9.5 * customization.fontSize}px`;
  const contactSize = `${9 * customization.fontSize}px`;
  const sectionGap = `${20 * customization.sectionSpacing}px`;
  const entryGap = `${12 * customization.sectionSpacing}px`;
  const smallEntryGap = `${8 * customization.sectionSpacing}px`;

  const align = customization.headerAlignment;
  const justifyAlign =
    align === 'center' ? 'center' as const
    : align === 'right' ? 'flex-end' as const
    : 'flex-start' as const;

  const renderSectionHeading = (key: SectionKey) => {
    const label = getSectionLabel(key, lang);
    if (!label) return null;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: `${10 * customization.sectionSpacing}px`,
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            width: '3px',
            height: '16px',
            backgroundColor: customization.accentColor,
            borderRadius: '1px',
            marginRight: '10px',
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontFamily: s.heading.fontFamily,
            fontSize: headingSize,
            fontWeight: 700,
            color: '#111827',
            margin: 0,
            letterSpacing: '0.01em',
            lineHeight: 1.3,
          }}
        >
          {label}
        </h2>
        {customization.sectionDividers && (
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e5e7eb',
              marginLeft: '12px',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div style={s.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ textAlign: align, marginBottom: '4px' }}>
        <h1
          style={{
            fontFamily: s.heading.fontFamily,
            fontSize: nameSize,
            fontWeight: 800,
            color: '#111827',
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
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
              marginTop: '4px',
              marginBottom: '10px',
              letterSpacing: '0.02em',
              lineHeight: 1.3,
            }}
          >
            {data.personalInfo.professionalTitle}
          </p>
        )}

        {contactItems.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap' as const,
              justifyContent: justifyAlign,
              gap: '0px',
              marginTop: '2px',
            }}
          >
            {contactItems.map((item, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: s.body.fontFamily,
                  fontSize: contactSize,
                  color: '#6b7280',
                  lineHeight: 1.5,
                }}
              >
                {i > 0 && (
                  <span
                    style={{
                      width: '3px',
                      height: '3px',
                      borderRadius: '50%',
                      backgroundColor: customization.accentColor,
                      display: 'inline-block',
                      margin: '0 10px',
                      verticalAlign: 'middle',
                    }}
                  />
                )}
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thin accent divider separating header from content */}
      <div
        style={{
          height: '1px',
          backgroundColor: hexToRgba(customization.accentColor, 0.2),
          marginTop: '12px',
          marginBottom: '2px',
        }}
      />

      {/* ── Sections ───────────────────────────────────────── */}
      {visibleSections.map((key, idx) => (
        <div
          key={key}
          style={{
            marginTop: idx > 0 ? sectionGap : 0,
          }}
        >
          {renderSectionHeading(key)}
          <div>
            {renderSection(key)}
          </div>
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
          lineHeight: customization.lineHeight,
          margin: 0,
          whiteSpace: 'pre-line' as const,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((exp) => {
          const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.currentJob, lang);
          return (
            <div key={exp.id}>
              <h3
                style={{
                  fontFamily: s.heading.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  color: '#111827',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {exp.company}
              </h3>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                  marginTop: '1px',
                }}
              >
                <p
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: baseSize,
                    color: customization.accentColor,
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {exp.position}{exp.location ? `  ·  ${exp.location}` : ''}
                </p>
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
              {(() => {
                const descLines = exp.description ? exp.description.split('\n').map(l => l.replace(/^[-\u2022*]\s*/, '').trim()).filter(Boolean) : [];
                if (descLines.length === 0) return null;
                return (
                  <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#374151' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
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
                    fontFamily: s.heading.fontFamily,
                    fontSize: baseSize,
                    fontWeight: 700,
                    color: '#111827',
                    margin: 0,
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
                  color: '#374151',
                  margin: '2px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {edu.degree}{edu.fieldOfStudy ? ` ${T.in} ${edu.fieldOfStudy}` : ''}{edu.grade ? `  ·  ${T.gpa}: ${edu.grade}` : ''}
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

    const renderBadge = (skill: typeof data.skills[0]) => (
      <span
        key={skill.id}
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: smallSize,
          color: customization.accentColor,
          backgroundColor: hexToRgba(customization.accentColor, 0.08),
          padding: '3px 12px',
          borderRadius: '12px',
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {skill.name}
        {skill.proficiency && (
          <span style={{ fontSize: '0.85em', opacity: 0.7 }}> — {levelLabel(skill.proficiency, lang)}</span>
        )}
      </span>
    );

    const renderBadgeWrap = (skills: typeof data.skills) => (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: '6px',
        }}
      >
        {skills.map(renderBadge)}
      </div>
    );

    const renderSkillGroup = (label: string, skills: typeof data.skills) => (
      <div>
        <p
          style={{
            fontFamily: s.body.fontFamily,
            fontSize: contactSize,
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '10px 0 4px 0',
          }}
        >
          {label}
        </p>
        {renderBadgeWrap(skills)}
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
    return renderBadgeWrap(data.skills);
  }

  function renderProjects() {
    const entries = data.projects.filter(p => p.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((proj) => (
          <div key={proj.id}>
            <h3
              style={{
                fontFamily: s.heading.fontFamily,
                fontSize: baseSize,
                fontWeight: 700,
                color: '#111827',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {proj.name}
              {proj.technologies && (
                <span
                  style={{
                    fontWeight: 500,
                    color: customization.accentColor,
                    marginLeft: '8px',
                    fontSize: smallSize,
                  }}
                >
                  {proj.technologies}
                </span>
              )}
            </h3>
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
                  fontSize: baseSize,
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
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: smallSize,
                  color: '#6b7280',
                  margin: '3px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {[proj.githubUrl, proj.liveUrl].filter(Boolean).join('  ·  ')}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: smallEntryGap }}>
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
                    fontFamily: s.heading.fontFamily,
                    fontSize: baseSize,
                    fontWeight: 700,
                    color: '#111827',
                    margin: 0,
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
                    color: '#374151',
                    margin: '1px 0 0 0',
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
          gap: '4px 20px',
        }}
      >
        {data.languages.map(langItem => (
          <span
            key={langItem.id}
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: baseSize,
              color: '#374151',
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600, color: '#111827' }}>{langItem.language}</span>
            {' — '}
            <span style={{ color: '#6b7280' }}>{levelLabel(langItem.proficiency, lang)}</span>
          </span>
        ))}
      </div>
    );
  }

  function renderAwards() {
    const entries = data.awards.filter(a => a.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: smallEntryGap }}>
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
                  fontFamily: s.heading.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  color: '#111827',
                  margin: 0,
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
                  color: '#374151',
                  margin: '1px 0 0 0',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((vol) => (
          <div key={vol.id}>
            <h3
              style={{
                fontFamily: s.heading.fontFamily,
                fontSize: baseSize,
                fontWeight: 700,
                color: '#111827',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {vol.role}
              <span
                style={{
                  fontWeight: 500,
                  color: '#6b7280',
                  marginLeft: '6px',
                }}
              >
                — {vol.organization}
              </span>
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

  function renderReferences() {
    const entries = data.references.filter(r => r.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map((ref) => (
          <div key={ref.id}>
            <h3
              style={{
                fontFamily: s.heading.fontFamily,
                fontSize: baseSize,
                fontWeight: 700,
                color: '#111827',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {ref.name}
            </h3>
            <p
              style={{
                fontFamily: s.body.fontFamily,
                fontSize: baseSize,
                color: '#374151',
                margin: '1px 0 0 0',
                lineHeight: 1.3,
              }}
            >
              {[ref.position, ref.company].filter(Boolean).join(` ${T.at} `)}
            </p>
            {(ref.email || ref.phone) && (
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: smallSize,
                  color: '#6b7280',
                  margin: '1px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {[ref.email, ref.phone].filter(Boolean).join('  ·  ')}
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
          lineHeight: customization.lineHeight,
          whiteSpace: 'pre-line' as const,
        }}
      >
        {data.additionalInfo.text}
      </div>
    );
  }
}
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

export default function Contemporary({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const { accentColor, fontSize, sectionSpacing, lineHeight } = customization;

  const base = 10.5 * fontSize;
  const nameSize = `${23 * fontSize}px`;
  const titleSize = `${12 * fontSize}px`;
  const headingSize = `${12.5 * fontSize}px`;
  const smallSize = `${9.5 * fontSize}px`;
  const sectionGap = `${20 * sectionSpacing}px`;
  const itemGap = `${10 * sectionSpacing}px`;

  const contactItems = getContactItems(data.personalInfo);
  const visibleSections = getVisibleSections(data, customization.hiddenSections, customization.sectionOrder);

  return (
    <div style={s.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ marginBottom: sectionGap }}>
        {/* Name with accent dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1
            style={{
              fontFamily: s.heading.fontFamily,
              fontSize: nameSize,
              fontWeight: 700,
              color: '#1e293b',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {data.personalInfo.fullName}
          </h1>
          <span
            style={{
              display: 'inline-block',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: accentColor,
              flexShrink: 0,
            }}
          />
        </div>

        {/* Title */}
        {data.personalInfo.professionalTitle && (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: titleSize,
              color: '#94a3b8',
              margin: '4px 0 0 0',
              fontWeight: 400,
            }}
          >
            {data.personalInfo.professionalTitle}
          </p>
        )}

        {/* Contact row with accent dot prefixes */}
        {contactItems.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 16px', marginTop: '8px' }}>
            {contactItems.map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: '#334155',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item}
                </span>
              </span>
            ))}
          </div>
        )}
      </header>

      {/* ── Sections ───────────────────────────────────────── */}
      {visibleSections.map((sectionKey) => (
        <section key={sectionKey} style={{ marginBottom: sectionGap }}>
          {/* Section heading with accent dot and thin line */}
          <div style={{ marginBottom: `${10 * sectionSpacing}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                  flexShrink: 0,
                }}
              />
              <h2
                style={{
                  fontFamily: s.heading.fontFamily,
                  fontSize: headingSize,
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1.3,
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                }}
              >
                {getSectionLabel(sectionKey)}
              </h2>
            </div>
            <div
              style={{
                height: '0.5px',
                backgroundColor: '#e5e7eb',
                marginTop: '6px',
              }}
            />
          </div>
          <div>{renderSection(sectionKey)}</div>
        </section>
      ))}
    </div>
  );

  /* ── Section Renderers ──────────────────────────────────── */

  function renderSection(key: SectionKey) {
    switch (key) {
      case 'professionalSummary':
        return (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: `${base}px`,
              margin: 0,
              color: '#334155',
              lineHeight,
            }}
          >
            {data.professionalSummary}
          </p>
        );

      case 'workExperience':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
            {data.workExperience.filter(e => e.company || e.position).map(job => {
              const dateRange = formatDateRange(job.startDate, job.endDate, job.currentJob);
              return (
                <div key={job.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{job.position}</span>
                      {job.company && (
                        <span style={{ color: accentColor, fontWeight: 400, flexShrink: 0 }}>
                          {job.company}
                        </span>
                      )}
                    </div>
                    {dateRange && (
                      <span
                        style={{
                          fontFamily: s.body.fontFamily,
                          fontSize: smallSize,
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
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
                        color: '#94a3b8',
                        margin: '2px 0 0 0',
                      }}
                    >
                      {job.location}
                    </p>
                  )}
                  {(() => {
                    const descLines = job.description ? job.description.split('\n').map(l => l.replace(/^[-\u2022*]\s*/, '').trim()).filter(Boolean) : [];
                    if (descLines.length === 0) return null;
                    return (
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#334155' }}>
                        {descLines.map((line, i) => (
                          <li
                            key={i}
                            style={{
                              fontFamily: s.body.fontFamily,
                              fontSize: `${base}px`,
                              lineHeight,
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

      case 'education':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
            {data.education.filter(e => e.school || e.degree).map(edu => {
              const dateRange = formatDateRangeRaw(edu.startDate, edu.endDate);
              const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
              return (
                <div key={edu.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{degreeLine}</span>
                    {dateRange && (
                      <span
                        style={{
                          fontFamily: s.body.fontFamily,
                          fontSize: smallSize,
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
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
                      fontSize: smallSize,
                      color: '#94a3b8',
                      margin: '2px 0 0 0',
                    }}
                  >
                    {[edu.school, edu.location].filter(Boolean).join(', ')}
                  </p>
                  {edu.grade && (
                    <p
                      style={{
                        fontFamily: s.body.fontFamily,
                        fontSize: smallSize,
                        color: '#94a3b8',
                        margin: '1px 0 0 0',
                      }}
                    >
                      GPA: {edu.grade}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'skills':
        if (data.skills.length === 0) return null;
        {
          const technicalSkills = data.skills.filter(sk => sk.type !== 'soft');
          const softSkills = data.skills.filter(sk => sk.type === 'soft');
          const hasBoth = technicalSkills.length > 0 && softSkills.length > 0;

          const renderBadge = (skill: typeof data.skills[0]) => (
            <span
              key={skill.id}
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '20px',
                backgroundColor: hexToRgba(accentColor, 0.1),
                color: accentColor,
                fontFamily: s.body.fontFamily,
                fontSize: smallSize,
                fontWeight: 500,
                lineHeight: 1.6,
                whiteSpace: 'nowrap',
              }}
            >
              {skill.name}
              {skill.proficiency && (
                <span style={{ fontSize: '0.85em', opacity: 0.7 }}> — {skill.proficiency}</span>
              )}
            </span>
          );

          const renderSkillGroup = (label: string, skills: typeof data.skills) => (
            <div>
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: smallSize,
                  fontWeight: 600,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '10px 0 4px 0',
                }}
              >
                {label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
                {skills.map(renderBadge)}
              </div>
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
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
              {data.skills.map(renderBadge)}
            </div>
          );
        }

      case 'projects':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
            {data.projects.filter(p => p.name).map(proj => (
              <div key={proj.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{proj.name}</span>
                  {proj.technologies && (
                    <span
                      style={{
                        fontFamily: s.body.fontFamily,
                        fontSize: smallSize,
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
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
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#334155' }}>
                      {descLines.map((line, i) => (
                        <li
                          key={i}
                          style={{
                            fontFamily: s.body.fontFamily,
                            fontSize: `${base}px`,
                            lineHeight,
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
                      fontSize: `${base}px`,
                      color: '#334155',
                      margin: '4px 0 0 0',
                      lineHeight,
                      fontStyle: 'italic',
                    }}
                  >
                    {proj.results}
                  </p>
                )}
                {(proj.githubUrl || proj.liveUrl) && (
                  <div style={{ marginTop: '3px' }}>
                    {proj.githubUrl && (
                      <span style={{ fontFamily: s.body.fontFamily, fontSize: smallSize, color: accentColor, marginRight: '12px' }}>
                        {proj.githubUrl}
                      </span>
                    )}
                    {proj.liveUrl && (
                      <span style={{ fontFamily: s.body.fontFamily, fontSize: smallSize, color: accentColor }}>
                        {proj.liveUrl}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'certifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * sectionSpacing}px` }}>
            {data.certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{cert.name}</span>
                  {cert.issuer && (
                    <span style={{ color: '#94a3b8' }}> — {cert.issuer}</span>
                  )}
                </div>
                {cert.issueDate && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: '#94a3b8',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {formatDate(cert.issueDate)}
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case 'languages':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
            {data.languages.filter(l => l.language).map(lang => (
              <span key={lang.id} style={{ color: '#334155' }}>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{lang.language}</span>
                {lang.proficiency && (
                  <span style={{ color: '#94a3b8' }}> — {lang.proficiency}</span>
                )}
              </span>
            ))}
          </div>
        );

      case 'awards':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * sectionSpacing}px` }}>
            {data.awards.filter(a => a.name).map(award => (
              <div key={award.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{award.name}</span>
                  {award.organization && (
                    <span style={{ color: '#94a3b8' }}> — {award.organization}</span>
                  )}
                </div>
                {award.year && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: '#94a3b8',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {award.year}
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case 'volunteerExperience':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
            {data.volunteerExperience.filter(v => v.organization).map(vol => (
              <div key={vol.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{vol.role}</span>
                    {vol.organization && (
                      <span style={{ color: '#94a3b8' }}> — {vol.organization}</span>
                    )}
                  </div>
                </div>
                {(() => {
                  const descLines = vol.description ? vol.description.split('\n').map(l => l.replace(/^[-\u2022*]\s*/, '').trim()).filter(Boolean) : [];
                  if (descLines.length === 0) return null;
                  return (
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#334155' }}>
                      {descLines.map((line, i) => (
                        <li
                          key={i}
                          style={{
                            fontFamily: s.body.fontFamily,
                            fontSize: `${base}px`,
                            lineHeight,
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

      case 'references':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
            {data.references.filter(r => r.name).map(ref => (
              <div key={ref.id}>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{ref.name}</div>
                <div style={{ fontFamily: s.body.fontFamily, fontSize: smallSize, color: '#94a3b8' }}>
                  {[ref.position, ref.company].filter(Boolean).join(' at ')}
                </div>
                <div style={{ fontFamily: s.body.fontFamily, fontSize: smallSize, color: '#94a3b8' }}>
                  {[ref.email, ref.phone].filter(Boolean).join(' \u00B7 ')}
                </div>
              </div>
            ))}
          </div>
        );

      case 'additionalInfo':
        return (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: `${base}px`,
              margin: 0,
              color: '#334155',
              lineHeight,
              whiteSpace: 'pre-line',
            }}
          >
            {data.additionalInfo.text}
          </p>
        );

      default:
        return null;
    }
  }
}
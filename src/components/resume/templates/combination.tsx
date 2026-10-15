import type { TemplateComponentProps } from '@/types/template';
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
import type { SectionKey } from '@/types/resume';

export default function Combination({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const lang = docLanguage(customization);
  const T = docText(lang);
  const { personalInfo } = data;
  const contactItems = getContactItems(personalInfo);
  const visible = getVisibleSections(
    data,
    customization.hiddenSections,
    customization.sectionOrder,
  );

  // Combination layout: summary + skills + work + education first, then rest
  const priorityKeys: SectionKey[] = [
    'professionalSummary',
    'skills',
    'workExperience',
    'education',
  ];
  const topSections = priorityKeys.filter(k => visible.includes(k));
  const bottomSections = visible.filter(k => !priorityKeys.includes(k));

  // Computed sizes — compact
  const compact = 0.8;
  const fs = 11 * customization.fontSize;
  const baseFontSize = `${fs}px`;
  const smallFontSize = `${fs * 0.9}px`;
  const nameSize = `${20 * customization.fontSize}px`;
  const titleSize = `${12 * customization.fontSize}px`;
  const headingSize = `${13 * customization.fontSize}px`;
  const sectionGap = 16 * customization.sectionSpacing * compact;
  const itemGap = 10 * customization.sectionSpacing * compact;

  // ── Section Heading with accent bottom border ─────────
  const renderSectionHeading = (label: string) => (
    <div>
      <h2
        style={{
          fontFamily: s.heading.fontFamily,
          fontSize: headingSize,
          fontWeight: 700,
          color: s.heading.color,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.6px',
          margin: 0,
          lineHeight: 1.3,
          paddingBottom: customization.sectionDividers
            ? `${4 * customization.sectionSpacing * compact}px`
            : 0,
          marginBottom: customization.sectionDividers
            ? 0
            : `${6 * customization.sectionSpacing * compact}px`,
          borderBottom: customization.sectionDividers
            ? `1.5px solid ${s.divider.borderColor}`
            : 'none',
        }}
      >
        {label}
      </h2>
      {customization.sectionDividers && (
        <div style={{ marginBottom: `${6 * customization.sectionSpacing * compact}px` }} />
      )}
    </div>
  );

  return (
    <div style={s.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: `${sectionGap}px` }}>
        {/* Row 1: Name (left) + Contact items (right) */}
        <div
          className="flex justify-between items-baseline"
          style={{ gap: '12px' }}
        >
          <h1
            style={{
              fontFamily: s.heading.fontFamily,
              fontSize: nameSize,
              fontWeight: 700,
              color: '#111827',
              margin: 0,
              lineHeight: 1.2,
              textAlign: customization.headerAlignment as
                | 'left' | 'center' | 'right',
            }}
          >
            {personalInfo.fullName}
          </h1>

          {contactItems.length > 0 && (
            <p
              style={{
                fontFamily: s.body.fontFamily,
                fontSize: smallFontSize,
                color: '#6b7280',
                margin: 0,
                textAlign: 'right',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {contactItems.join('  ·  ')}
            </p>
          )}
        </div>

        {/* Row 2: Title below name */}
        {personalInfo.professionalTitle && (
          <p
            style={{
              fontFamily: s.heading.fontFamily,
              fontSize: titleSize,
              fontWeight: 500,
              color: '#374151',
              margin: `${4 * customization.sectionSpacing * compact}px 0 0`,
              textAlign: customization.headerAlignment as
                | 'left' | 'center' | 'right',
            }}
          >
            {personalInfo.professionalTitle}
          </p>
        )}
      </div>

      {/* ── Priority Sections (Summary, Skills, Work, Ed) ── */}
      {topSections.map(key => {
        const label = getSectionLabel(key, lang);
        if (!label) return null;
        return (
          <div key={key} style={{ marginTop: `${sectionGap}px` }}>
            {renderSectionHeading(label)}
            {renderSectionBody(key)}
          </div>
        );
      })}

      {/* ── Other Sections ────────────────────────────────── */}
      {bottomSections.map(key => {
        const label = getSectionLabel(key, lang);
        if (!label) return null;
        return (
          <div key={key} style={{ marginTop: `${sectionGap}px` }}>
            {renderSectionHeading(label)}
            {renderSectionBody(key)}
          </div>
        );
      })}
    </div>
  );

  /* ── Section Body Renderers ─────────────────────────────── */

  function renderSectionBody(key: SectionKey) {
    switch (key) {
      case 'professionalSummary':
        return (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: baseFontSize,
              color: '#374151',
              lineHeight: customization.lineHeight,
              margin: 0,
            }}
          >
            {data.professionalSummary}
          </p>
        );

      case 'skills':
        {
          if (data.skills.length === 0) return null;
          const technicalSkills = data.skills.filter(sk => sk.type !== 'soft');
          const softSkills = data.skills.filter(sk => sk.type === 'soft');
          const hasBoth = technicalSkills.length > 0 && softSkills.length > 0;

          const renderSkillItem = (skill: typeof data.skills[0]) => (
            <div
              key={skill.id}
              className="flex items-center"
              style={{ gap: '8px' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: s.accent.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: baseFontSize, color: '#374151' }}>
                {skill.name}
                {skill.proficiency && (
                  <span style={{ color: '#6b7280', fontSize: '0.85em', marginLeft: 4 }}>({levelLabel(skill.proficiency, lang)})</span>
                )}
              </span>
            </div>
          );

          const renderSkillGrid = (skills: typeof data.skills) => (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: `${4 * customization.sectionSpacing * compact}px ${14 * customization.sectionSpacing * compact}px`,
              }}
            >
              {skills.map(renderSkillItem)}
            </div>
          );

          const renderSkillGroup = (label: string, skills: typeof data.skills) => (
            <div>
              <p
                style={{
                  fontSize: smallFontSize,
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '10px 0 4px 0',
                }}
              >
                {label}
              </p>
              {renderSkillGrid(skills)}
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
          return renderSkillGrid(data.skills);
        }

      case 'workExperience':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${itemGap}px`,
            }}
          >
            {data.workExperience
              .filter(e => e.company || e.position)
              .map(exp => {
                const dateRange = formatDateRange(
                  exp.startDate,
                  exp.endDate,
                  exp.currentJob,
                  lang,
                );
                const descLines = exp.description
                  ? exp.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
                  : [];
                return (
                  <div key={exp.id}>
                    <div
                      className="flex justify-between items-baseline"
                      style={{ gap: '8px' }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#111827',
                          fontSize: baseFontSize,
                          fontFamily: s.heading.fontFamily,
                        }}
                      >
                        {exp.position}
                      </span>
                      {dateRange && (
                        <span
                          style={{
                            color: '#6b7280',
                            fontSize: smallFontSize,
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dateRange}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        color: '#6b7280',
                        fontSize: baseFontSize,
                        margin: '1px 0 0',
                      }}
                    >
                      {[exp.company, exp.location].filter(Boolean).join(', ')}
                    </div>
                    {descLines.length > 0 && (
                      <ul
                        style={{
                          margin: '5px 0 0 0',
                          paddingLeft: '14px',
                          listStyleType: 'disc',
                          color: '#4b5563',
                        }}
                      >
                        {descLines.map((line, i) => (
                          <li
                            key={i}
                            style={{
                              fontFamily: s.body.fontFamily,
                              fontSize: baseFontSize,
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

      case 'education':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${itemGap}px`,
            }}
          >
            {data.education
              .filter(e => e.school || e.degree)
              .map(edu => {
                const dateRange = formatDateRangeRaw(
                  edu.startDate,
                  edu.endDate,
                  lang,
                );
                return (
                  <div key={edu.id}>
                    <div
                      className="flex justify-between items-baseline"
                      style={{ gap: '8px' }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#111827',
                          fontSize: baseFontSize,
                          fontFamily: s.heading.fontFamily,
                        }}
                      >
                        {edu.degree}
                        {edu.fieldOfStudy ? ` ${T.in} ${edu.fieldOfStudy}` : ''}
                      </span>
                      {dateRange && (
                        <span
                          style={{
                            color: '#6b7280',
                            fontSize: smallFontSize,
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dateRange}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        color: '#6b7280',
                        fontSize: baseFontSize,
                        margin: '1px 0 0',
                      }}
                    >
                      {[edu.school, edu.location].filter(Boolean).join(', ')}
                      {edu.grade ? ` — ${T.gpa}: ${edu.grade}` : ''}
                    </div>
                  </div>
                );
              })}
          </div>
        );

      case 'projects':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${itemGap}px`,
            }}
          >
            {data.projects
              .filter(p => p.name)
              .map(proj => {
                const descLines = proj.description
                  ? proj.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
                  : [];
                return (
                  <div key={proj.id}>
                    <div
                      className="flex justify-between items-baseline"
                      style={{ gap: '8px' }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#111827',
                          fontSize: baseFontSize,
                        }}
                      >
                        {proj.name}
                      </span>
                      {proj.technologies && (
                        <span
                          style={{
                            color: '#6b7280',
                            fontSize: smallFontSize,
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {proj.technologies}
                        </span>
                      )}
                    </div>
                    {descLines.length > 0 && (
                      <ul
                        style={{
                          margin: '5px 0 0 0',
                          paddingLeft: '14px',
                          listStyleType: 'disc',
                          color: '#4b5563',
                        }}
                      >
                        {descLines.map((line, i) => (
                          <li
                            key={i}
                            style={{
                              fontFamily: s.body.fontFamily,
                              fontSize: baseFontSize,
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
                          fontSize: baseFontSize,
                          color: '#4b5563',
                          margin: '4px 0 0 0',
                          lineHeight: customization.lineHeight,
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
                          fontSize: smallFontSize,
                          color: s.accent.color,
                          margin: `${2 * customization.sectionSpacing * compact}px 0 0`,
                        }}
                      >
                        {proj.liveUrl}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        );

      case 'certifications':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${5 * customization.sectionSpacing * compact}px`,
            }}
          >
            {data.certifications
              .filter(c => c.name)
              .map(cert => (
                <div
                  key={cert.id}
                  className="flex justify-between items-baseline"
                  style={{ gap: '8px' }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 600,
                        color: '#111827',
                        fontSize: baseFontSize,
                      }}
                    >
                      {cert.name}
                    </span>
                    {cert.issuer && (
                      <span
                        style={{
                          color: '#6b7280',
                          fontSize: baseFontSize,
                        }}
                      >
                        {' — '}
                        {cert.issuer}
                      </span>
                    )}
                  </div>
                  {cert.issueDate && (
                    <span
                      style={{
                        color: '#6b7280',
                        fontSize: smallFontSize,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDate(cert.issueDate, lang)}
                    </span>
                  )}
                </div>
              ))}
          </div>
        );

      case 'languages':
        return (
          <div className="flex flex-wrap" style={{ gap: '4px 20px' }}>
            {data.languages.map(langItem => (
              <span key={langItem.id} style={{ fontSize: baseFontSize }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {langItem.language}
                </span>
                {langItem.proficiency && (
                  <span style={{ color: '#6b7280' }}>
                    {' '}
                    ({levelLabel(langItem.proficiency, lang)})
                  </span>
                )}
              </span>
            ))}
          </div>
        );

      case 'awards':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${5 * customization.sectionSpacing * compact}px`,
            }}
          >
            {data.awards
              .filter(a => a.name)
              .map(award => (
                <div
                  key={award.id}
                  className="flex justify-between items-baseline"
                  style={{ gap: '8px' }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#111827',
                      fontSize: baseFontSize,
                    }}
                  >
                    {award.name}
                  </span>
                  <span
                    style={{
                      color: '#6b7280',
                      fontSize: baseFontSize,
                      flexShrink: 0,
                    }}
                  >
                    {[award.organization, award.year].filter(Boolean).join(' · ')}
                  </span>
                </div>
              ))}
          </div>
        );

      case 'volunteerExperience':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${itemGap}px`,
            }}
          >
            {data.volunteerExperience
              .filter(v => v.organization)
              .map(vol => {
                const descLines = vol.description
                  ? vol.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
                  : [];
                return (
                  <div key={vol.id}>
                    <div
                      className="flex justify-between items-baseline"
                      style={{ gap: '8px' }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#111827',
                          fontSize: baseFontSize,
                          fontFamily: s.heading.fontFamily,
                        }}
                      >
                        {vol.role}
                      </span>
                      <span
                        style={{
                          color: '#6b7280',
                          fontSize: baseFontSize,
                          flexShrink: 0,
                        }}
                      >
                        {vol.organization}
                      </span>
                    </div>
                    {descLines.length > 0 && (
                      <ul
                        style={{
                          margin: '5px 0 0 0',
                          paddingLeft: '14px',
                          listStyleType: 'disc',
                          color: '#4b5563',
                        }}
                      >
                        {descLines.map((line, i) => (
                          <li
                            key={i}
                            style={{
                              fontFamily: s.body.fontFamily,
                              fontSize: baseFontSize,
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

      case 'references':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${itemGap}px`,
            }}
          >
            {data.references
              .filter(r => r.name)
              .map(ref => (
                <div key={ref.id}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#111827',
                      fontSize: baseFontSize,
                    }}
                  >
                    {ref.name}
                  </div>
                  <div
                    style={{
                      color: '#6b7280',
                      fontSize: baseFontSize,
                      margin: '1px 0 0',
                    }}
                  >
                    {[ref.position, ref.company].filter(Boolean).join(` ${T.at} `)}
                  </div>
                  {(ref.email || ref.phone) && (
                    <div
                      style={{
                        color: '#9ca3af',
                        fontSize: smallFontSize,
                        margin: '1px 0 0',
                      }}
                    >
                      {[ref.email, ref.phone].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              ))}
          </div>
        );

      case 'additionalInfo':
        return (
          <div
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: baseFontSize,
              color: '#374151',
              lineHeight: customization.lineHeight,
              whiteSpace: 'pre-line' as const,
            }}
          >
            {data.additionalInfo.text}
          </div>
        );

      default:
        return null;
    }
  }
}
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

export default function Functional({ data, customization }: TemplateComponentProps) {
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

  // Functional layout: ensure skills appear right after professionalSummary
  const orderedSections: SectionKey[] = [];
  const summaryIdx = visible.indexOf('professionalSummary');
  const skillsIdx = visible.indexOf('skills');

  if (summaryIdx >= 0) {
    orderedSections.push('professionalSummary');
  }
  if (skillsIdx >= 0) {
    orderedSections.push('skills');
  }
  // Add remaining sections in their original order
  for (const key of visible) {
    if (key !== 'professionalSummary' && key !== 'skills') {
      orderedSections.push(key);
    }
  }

  // Font sizes
  const nameSize = `${22 * customization.fontSize}px`;
  const titleSize = `${12 * customization.fontSize}px`;
  const headingSize = `${12.5 * customization.fontSize}px`;
  const baseSize = `${10.5 * customization.fontSize}px`;
  const smallSize = `${9.5 * customization.fontSize}px`;

  // Spacing
  const sectionGap = `${20 * customization.sectionSpacing}px`;
  const entryGap = `${10 * customization.sectionSpacing}px`;
  const smallEntryGap = `${6 * customization.sectionSpacing}px`;

  // Accent at 30% opacity for section heading borders
  const accentBorder30 = hexToRgba(customization.accentColor, 0.3);

  const renderSectionHeading = (key: SectionKey) => {
    const label = key === 'skills' ? T.coreCompetencies : getSectionLabel(key, lang);
    if (!label) return null;
    return (
      <h2
        style={{
          fontFamily: s.heading.fontFamily,
          fontSize: headingSize,
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 6px 0',
          paddingBottom: '4px',
          borderBottom: `1px solid ${accentBorder30}`,
          lineHeight: 1.3,
        }}
      >
        {label}
      </h2>
    );
  };

  return (
    <div style={s.container}>
      {/* ── Header (Left-aligned) ─────────────────────────── */}
      <div style={{ marginBottom: sectionGap }}>
        <h1
          style={{
            fontFamily: s.heading.fontFamily,
            fontSize: nameSize,
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 3px 0',
            lineHeight: 1.15,
          }}
        >
          {personalInfo.fullName}
        </h1>

        {personalInfo.professionalTitle && (
          <p
            style={{
              fontFamily: s.heading.fontFamily,
              fontSize: titleSize,
              fontWeight: 500,
              color: s.accent.color,
              margin: '0 0 8px 0',
              lineHeight: 1.3,
            }}
          >
            {personalInfo.professionalTitle}
          </p>
        )}

        {contactItems.length > 0 && (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: smallSize,
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {contactItems.join(' | ')}
          </p>
        )}
      </div>

      {/* ── Sections (skills-first ordering) ───────────────── */}
      {orderedSections.map((key, idx) => (
        <div
          key={key}
          style={{
            marginTop: idx > 0 ? sectionGap : 0,
          }}
        >
          {renderSectionHeading(key)}
          <div style={{ marginTop: '8px' }}>
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
          color: '#334155',
          lineHeight: customization.lineHeight,
          margin: 0,
          whiteSpace: 'pre-line' as const,
        }}
      >
        {data.professionalSummary}
      </p>
    );
  }

  function renderSkills() {
    if (data.skills.length === 0) return null;
    const technicalSkills = data.skills.filter(sk => sk.type !== 'soft');
    const softSkills = data.skills.filter(sk => sk.type === 'soft');
    const hasBoth = technicalSkills.length > 0 && softSkills.length > 0;

    const renderSkillItem = (skill: typeof data.skills[0]) => (
      <div
        key={skill.id}
        style={{
          backgroundColor: '#f8fafc',
          borderLeft: `2px solid ${s.accent.color}`,
          padding: '3px 8px',
          borderRadius: '0 3px 3px 0',
        }}
      >
        <span
          style={{
            fontFamily: s.body.fontFamily,
            fontWeight: 600,
            color: '#1e293b',
            fontSize: baseSize,
          }}
        >
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
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
        }}
      >
        {skills.map(renderSkillItem)}
      </div>
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

  function renderWorkExperience() {
    const entries = data.workExperience.filter(e => e.company || e.position);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map(exp => {
          const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.currentJob, lang);
          const descLines = exp.description
            ? exp.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            : [];
          return (
            <div key={exp.id}>
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
                    color: '#1e293b',
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {exp.position}
                </h3>
                {dateRange && (
                  <span
                    style={{
                      fontFamily: s.body.fontFamily,
                      fontSize: smallSize,
                      color: '#94a3b8',
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
                  color: '#334155',
                  margin: '2px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {exp.company}{exp.location ? `, ${exp.location}` : ''}
              </p>
              {descLines.length > 0 && (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#334155' }}>
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

  function renderEducation() {
    const entries = data.education.filter(e => e.school || e.degree);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map(edu => {
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
                    color: '#1e293b',
                    margin: 0,
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
                      color: '#94a3b8',
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
                  color: '#334155',
                  margin: '2px 0 0 0',
                  lineHeight: 1.3,
                }}
              >
                {edu.school}{edu.location ? `, ${edu.location}` : ''}{edu.grade ? ` — ${T.gpa}: ${edu.grade}` : ''}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  function renderProjects() {
    const entries = data.projects.filter(p => p.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map(proj => {
          const descLines = proj.description
            ? proj.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            : [];
          return (
            <div key={proj.id}>
              <h3
                style={{
                  fontFamily: s.heading.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {proj.name}
              </h3>
              {proj.technologies && (
                <p
                  style={{
                    fontFamily: s.body.fontFamily,
                    fontSize: smallSize,
                    color: '#94a3b8',
                    margin: '2px 0 0 0',
                    lineHeight: 1.3,
                  }}
                >
                  {proj.technologies}
                </p>
              )}
              {descLines.length > 0 && (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#334155' }}>
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
                    color: '#334155',
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
                    color: '#94a3b8',
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

  function renderCertifications() {
    const entries = data.certifications.filter(c => c.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: smallEntryGap }}>
        {entries.map(cert => {
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
                    color: '#1e293b',
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
                      color: '#94a3b8',
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
                    color: '#334155',
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
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px 20px' }}>
        {data.languages.map(langItem => (
          <span
            key={langItem.id}
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: baseSize,
              color: '#334155',
            }}
          >
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{langItem.language}</span>
            {langItem.proficiency && (
              <span style={{ color: '#94a3b8' }}> ({levelLabel(langItem.proficiency, lang)})</span>
            )}
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
        {entries.map(award => (
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
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {award.name}
              </h3>
              <span
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: smallSize,
                  color: '#94a3b8',
                  whiteSpace: 'nowrap' as const,
                  flexShrink: 0,
                }}
              >
                {[award.organization, award.year].filter(Boolean).join(' · ')}
              </span>
            </div>
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
        {entries.map(vol => {
          const descLines = vol.description
            ? vol.description.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            : [];
          return (
            <div key={vol.id}>
              <h3
                style={{
                  fontFamily: s.heading.fontFamily,
                  fontSize: baseSize,
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {vol.role} — {vol.organization}
              </h3>
              {descLines.length > 0 && (
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: '#334155' }}>
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

  function renderReferences() {
    const entries = data.references.filter(r => r.name);
    if (entries.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: entryGap }}>
        {entries.map(ref => (
          <div key={ref.id}>
            <h3
              style={{
                fontFamily: s.heading.fontFamily,
                fontSize: baseSize,
                fontWeight: 700,
                color: '#1e293b',
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
                color: '#334155',
                margin: '2px 0 0 0',
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
                  color: '#94a3b8',
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

  function renderAdditionalInfo() {
    if (!data.additionalInfo.text.trim()) return null;
    return (
      <div
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: baseSize,
          color: '#334155',
          lineHeight: customization.lineHeight,
          whiteSpace: 'pre-line' as const,
        }}
      >
        {data.additionalInfo.text}
      </div>
    );
  }
}
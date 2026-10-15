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

export default function Chronological({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const lang = docLanguage(customization);
  const T = docText(lang);
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
      <header style={{ marginBottom: sectionGap, textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: s.heading.fontFamily,
            fontSize: nameSize,
            fontWeight: 700,
            color: '#1e293b',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {data.personalInfo.fullName}
        </h1>

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

        {/* Contact line with pipe separators */}
        {contactItems.length > 0 && (
          <p
            style={{
              fontFamily: s.body.fontFamily,
              fontSize: smallSize,
              color: '#334155',
              margin: '10px 0 0 0',
            }}
          >
            {contactItems.join(' | ')}
          </p>
        )}
      </header>

      {/* ── Sections ───────────────────────────────────────── */}
      {visibleSections.map((sectionKey) => (
        <section key={sectionKey} style={{ marginBottom: sectionGap }}>
          {renderSection(sectionKey)}
        </section>
      ))}
    </div>
  );

  /* ── Section Wrapper ───────────────────────────────────── */

  function renderSection(key: SectionKey) {
    const label = getSectionLabel(key, lang);
    const isTimeline = key === 'workExperience';
    const isLightTimeline = key === 'education';

    return (
      <>
        {/* Section heading with accent branch line */}
        <div style={{ marginBottom: `${10 * sectionSpacing}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Timeline branch — 2px accent line, 20px wide */}
            <div
              style={{
                width: '20px',
                height: '2px',
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
              {label}
            </h2>
          </div>
        </div>

        {/* Section content — indented for timeline sections */}
        <div style={(isTimeline || isLightTimeline) ? { paddingLeft: '16px', position: 'relative' as const } : undefined}>
          {renderSectionContent(key, isTimeline, isLightTimeline)}
        </div>
      </>
    );
  }

  /* ── Section Content Router ────────────────────────────── */

  function renderSectionContent(key: SectionKey, isTimeline: boolean, isLightTimeline: boolean) {
    switch (key) {
      case 'professionalSummary':
        return renderSummary();
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
        return renderVolunteer();
      case 'references':
        return renderReferences();
      case 'additionalInfo':
        return renderAdditionalInfo();
      default:
        return null;
    }
  }

  /* ── Professional Summary ──────────────────────────────── */

  function renderSummary() {
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
  }

  /* ── Work Experience (Timeline) ────────────────────────── */

  function renderWorkExperience() {
    const filtered = data.workExperience.filter(e => e.company || e.position);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
        {filtered.map((job, idx) => {
          const dateRange = formatDateRange(job.startDate, job.endDate, job.currentJob, lang);
          const descLines = job.description ? job.description.split('\n').filter(Boolean) : [];
          return (
            <div
              key={job.id}
              style={{
                position: 'relative' as const,
                borderLeft: '2px solid ' + accentColor,
                borderRadius: '1px',
                paddingLeft: '16px',
                paddingBottom: idx < filtered.length - 1 ? '2px' : '0',
              }}
            >
              {/* Accent circle at top */}
              <div
                style={{
                  position: 'absolute' as const,
                  left: '-6px',
                  top: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                }}
              />
              {/* Position + company on one line (bold) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>
                  {job.position}{job.company ? `, ${job.company}` : ''}
                </span>
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
              {/* Description with bullet points */}
              {descLines.length > 0 && (
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
                      {line.replace(/^[-•*]\s*/, '')}
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

  /* ── Education (Light Timeline) ─────────────────────────── */

  function renderEducation() {
    const filtered = data.education.filter(e => e.school || e.degree);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
        {filtered.map((edu, idx) => {
          const dateRange = formatDateRangeRaw(edu.startDate, edu.endDate, lang);
          const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(` ${T.in} `);
          return (
            <div
              key={edu.id}
              style={{
                position: 'relative' as const,
                borderLeft: '1px solid #e5e7eb',
                paddingLeft: '16px',
                paddingBottom: idx < filtered.length - 1 ? '2px' : '0',
              }}
            >
              {/* Gray circle at top */}
              <div
                style={{
                  position: 'absolute' as const,
                  left: '-5px',
                  top: '4px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#94a3b8',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>
                  {degreeLine}
                </span>
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
              <p style={{ fontFamily: s.body.fontFamily, color: '#94a3b8', margin: '2px 0 0 0', fontSize: smallSize }}>
                {edu.school}{edu.location ? `, ${edu.location}` : ''}
              </p>
              {edu.grade && (
                <p style={{ fontFamily: s.body.fontFamily, fontSize: smallSize, color: '#94a3b8', margin: '1px 0 0 0' }}>
                  {T.gpa}: {edu.grade}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Skills ────────────────────────────────────────────── */

  function renderSkills() {
    if (data.skills.length === 0) return null;
    const technicalSkills = data.skills.filter(sk => sk.type !== 'soft');
    const softSkills = data.skills.filter(sk => sk.type === 'soft');
    const hasBoth = technicalSkills.length > 0 && softSkills.length > 0;

    const renderSkillLine = (skills: typeof data.skills) => (
      <p
        style={{
          fontFamily: s.body.fontFamily,
          fontSize: `${base}px`,
          margin: 0,
          color: '#334155',
          lineHeight,
        }}
      >
        {skills.map((sk, i) => (
          <span key={sk.id}>
            {sk.name}
            {sk.proficiency && (
              <span style={{ color: '#6b7280', fontSize: '0.85em' }}> ({levelLabel(sk.proficiency, lang)})</span>
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
            color: '#94a3b8',
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
          {renderSkillGroup(T.technicalSkills, technicalSkills)}
          {renderSkillGroup(T.softSkills, softSkills)}
        </div>
      );
    }
    return renderSkillLine(data.skills);
  }

  /* ── Projects ──────────────────────────────────────────── */

  function renderProjects() {
    const filtered = data.projects.filter(p => p.name);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
        {filtered.map(proj => (
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
            {proj.description && (
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: `${base}px`,
                  margin: '4px 0 0 0',
                  color: '#334155',
                  lineHeight,
                }}
              >
                {proj.description}
              </p>
            )}
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
  }

  /* ── Certifications ────────────────────────────────────── */

  function renderCertifications() {
    const filtered = data.certifications.filter(c => c.name);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * sectionSpacing}px` }}>
        {filtered.map(cert => (
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
                {formatDate(cert.issueDate, lang)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ── Languages ─────────────────────────────────────────── */

  function renderLanguages() {
    const filtered = data.languages.filter(l => l.language);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
        {filtered.map(langItem => (
          <span key={langItem.id} style={{ color: '#334155' }}>
            <span style={{ fontWeight: 500, color: '#1e293b' }}>{langItem.language}</span>
            {langItem.proficiency && (
              <span style={{ color: '#94a3b8' }}> — {levelLabel(langItem.proficiency, lang)}</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  /* ── Awards ────────────────────────────────────────────── */

  function renderAwards() {
    const filtered = data.awards.filter(a => a.name);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * sectionSpacing}px` }}>
        {filtered.map(award => (
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
  }

  /* ── Volunteer Experience ──────────────────────────────── */

  function renderVolunteer() {
    const filtered = data.volunteerExperience.filter(v => v.organization);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
        {filtered.map(vol => (
          <div key={vol.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{vol.role}</span>
                {vol.organization && (
                  <span style={{ color: '#94a3b8' }}> — {vol.organization}</span>
                )}
              </div>
            </div>
            {vol.description && (
              <p
                style={{
                  fontFamily: s.body.fontFamily,
                  fontSize: `${base}px`,
                  margin: '4px 0 0 0',
                  color: '#334155',
                  lineHeight,
                  whiteSpace: 'pre-line',
                }}
              >
                {vol.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ── References ────────────────────────────────────────── */

  function renderReferences() {
    const filtered = data.references.filter(r => r.name);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
        {filtered.map(ref => (
          <div key={ref.id}>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{ref.name}</div>
            <div style={{ fontFamily: s.body.fontFamily, fontSize: smallSize, color: '#94a3b8' }}>
              {[ref.position, ref.company].filter(Boolean).join(` ${T.at} `)}
            </div>
            <div style={{ fontFamily: s.body.fontFamily, fontSize: smallSize, color: '#94a3b8' }}>
              {[ref.email, ref.phone].filter(Boolean).join(' \u00B7 ')}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Additional Info ───────────────────────────────────── */

  function renderAdditionalInfo() {
    if (!data.additionalInfo.text.trim()) return null;
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
  }
}
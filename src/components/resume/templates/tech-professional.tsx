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

export default function TechProfessional({ data, customization }: TemplateComponentProps) {
  const s = getTemplateStyles(customization);
  const lang = docLanguage(customization);
  const T = docText(lang);
  const fs = 11 * customization.fontSize;
  const sectionGap = 16 * customization.sectionSpacing;

  const visibleSections = getVisibleSections(
    data,
    customization.hiddenSections,
    customization.sectionOrder,
  );

  const contactItems = getContactItems(data.personalInfo);

  // Build labeled contact entries for the grid
  const contactEntries: { label: string; value: string; isLink?: boolean; href?: string }[] = [];
  const info = data.personalInfo;
  if (info.email) contactEntries.push({ label: T.email.toUpperCase(), value: info.email, href: `mailto:${info.email}` });
  if (info.phone) contactEntries.push({ label: T.phone.toUpperCase(), value: info.phone, href: `tel:${info.phone}` });
  if (info.location) contactEntries.push({ label: T.location.toUpperCase(), value: info.location });
  if (info.website && info.website !== 'https://') contactEntries.push({ label: T.web.toUpperCase(), value: info.website, isLink: true });
  if (info.linkedin) contactEntries.push({ label: T.linkedin.toUpperCase(), value: info.linkedin, isLink: true });
  if (info.github) contactEntries.push({ label: T.github.toUpperCase(), value: info.github, isLink: true });
  if (info.portfolio) contactEntries.push({ label: T.portfolio.toUpperCase(), value: info.portfolio, isLink: true });

  // Accent color with 10% opacity for tag backgrounds
  const accentBg10 = hexToRgba(customization.accentColor, 0.1);

  const align = customization.headerAlignment;

  return (
    <div style={s.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: `${sectionGap}px` }}>
        <h1
          style={{
            fontFamily: s.heading.fontFamily,
            fontSize: `${20 * customization.fontSize}px`,
            fontWeight: 700,
            color: '#111827',
            margin: 0,
            lineHeight: 1.2,
            textAlign: align,
          }}
        >
          {data.personalInfo.fullName}
        </h1>
        {data.personalInfo.professionalTitle && (
          <p
            style={{
              fontSize: `${fs * 1.05}px`,
              color: '#6b7280',
              margin: `${4 * customization.sectionSpacing}px 0 0`,
              textAlign: align,
              fontWeight: 400,
            }}
          >
            {data.personalInfo.professionalTitle}
          </p>
        )}

        {/* Contact grid with small gray labels */}
        {contactEntries.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: `${6 * customization.sectionSpacing}px ${16 * customization.sectionSpacing}px`,
              marginTop: `${10 * customization.sectionSpacing}px`,
            }}
          >
            {contactEntries.map((entry) => (
              <div key={entry.label} style={{ textAlign: align }}>
                <span
                  style={{
                    fontSize: `${fs * 0.7}px`,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: s.heading.fontFamily,
                    display: 'block',
                    marginBottom: 1,
                  }}
                >
                  {entry.label}
                </span>
                {entry.href || entry.isLink ? (
                  <a
                    href={entry.href || (entry.value.startsWith('http') ? entry.value : `https://${entry.value}`)}
                    style={{
                      fontSize: `${fs * 0.88}px`,
                      color: entry.isLink ? customization.accentColor : '#374151',
                      textDecoration: 'none',
                      fontWeight: 400,
                      wordBreak: 'break-all',
                    }}
                  >
                    {cleanUrl(entry.value)}
                  </a>
                ) : (
                  <span style={{ fontSize: `${fs * 0.88}px`, color: '#374151' }}>
                    {entry.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sections ────────────────────────────────────────── */}
      {visibleSections.map((sectionKey) => (
        <SectionRenderer
          key={sectionKey}
          sectionKey={sectionKey}
          data={data}
          customization={customization}
          s={s}
          fs={fs}
          sectionGap={sectionGap}
          accentBg10={accentBg10}
        />
      ))}
    </div>
  );
}

// ─── Section Router ────────────────────────────────────────────

function SectionRenderer({
  sectionKey,
  data,
  customization,
  s,
  fs,
  sectionGap,
  accentBg10,
}: {
  sectionKey: SectionKey;
  data: TemplateComponentProps['data'];
  customization: TemplateComponentProps['customization'];
  s: ReturnType<typeof getTemplateStyles>;
  fs: number;
  sectionGap: number;
  accentBg10: string;
}) {
  const lang = docLanguage(customization);
  const label = getSectionLabel(sectionKey, lang);
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
        {sectionKey === 'education' && renderEducation(data, customization, fs)}
        {sectionKey === 'skills' && renderSkills(data, customization, fs, accentBg10)}
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
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </h2>
      {customization.sectionDividers && (
        <div
          style={{
            borderStyle: 'dashed',
            borderWidth: '0 0 1px 0',
            borderColor: '#d1d5db',
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

// ─── Work Experience ───────────────────────────────────────────

function renderWorkExperience(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  const lang = docLanguage(customization);
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
                {formatDateRange(exp.startDate, exp.endDate, exp.currentJob, lang)}
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

// ─── Education ─────────────────────────────────────────────────

function renderEducation(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  const lang = docLanguage(customization);
  const T = docText(lang);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${10 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.education.filter(e => e.school || e.degree).map((edu) => (
        <div key={edu.id}>
          <div className="flex items-baseline justify-between gap-2">
            <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>
              {edu.degree}{edu.fieldOfStudy ? ` ${T.in} ${edu.fieldOfStudy}` : ''}
            </span>
            <span style={{ fontSize: `${fs * 0.85}px`, color: '#6b7280', whiteSpace: 'nowrap' }}>
              {formatDateRangeRaw(edu.startDate, edu.endDate, lang)}
            </span>
          </div>
          <div style={{ fontSize: `${fs * 0.9}px`, color: '#4b5563', marginTop: 1 }}>
            {edu.school}{edu.location ? ` · ${edu.location}` : ''}{edu.grade ? ` — ${T.gpa}: ${edu.grade}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Skills (Tech Tags) ────────────────────────────────────────

function renderSkills(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number, accentBg10: string) {
  const lang = docLanguage(customization);
  const T = docText(lang);
  if (data.skills.length === 0) return null;
  const technicalSkills = data.skills.filter(sk => sk.type !== 'soft');
  const softSkills = data.skills.filter(sk => sk.type === 'soft');
  const hasBoth = technicalSkills.length > 0 && softSkills.length > 0;

  const renderTag = (skill: typeof data.skills[0]) => (
    <span
      key={skill.id}
      style={{
        display: 'inline-block',
        padding: `${3 * customization.sectionSpacing}px ${8 * customization.sectionSpacing}px`,
        borderRadius: '4px',
        backgroundColor: accentBg10,
        color: customization.accentColor,
        fontSize: `${fs * 0.88}px`,
        fontFamily: customization.headingFont,
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      {skill.name}{skill.proficiency && <span style={{ fontSize: '0.85em', opacity: 0.7 }}> — {levelLabel(skill.proficiency, lang)}</span>}
    </span>
  );

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
      <div className="flex flex-wrap" style={{ gap: `${6 * customization.sectionSpacing}px` }}>
        {skills.map(renderTag)}
      </div>
    </div>
  );

  if (hasBoth) {
    return (
      <div style={{ marginTop: `${6 * customization.sectionSpacing}px` }}>
        {renderSkillGroup(T.technicalSkills, technicalSkills)}
        {renderSkillGroup(T.softSkills, softSkills)}
      </div>
    );
  }
  return (
    <div
      className="flex flex-wrap"
      style={{ gap: `${6 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}
    >
      {data.skills.map(renderTag)}
    </div>
  );
}

// ─── Projects (Prominent) ─────────────────────────────────────

function renderProjects(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number, s: ReturnType<typeof getTemplateStyles>) {
  const lang = docLanguage(customization);
  const T = docText(lang);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${12 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.projects.filter(p => p.name).map((proj) => {
        const descLines = splitBullets(proj.description);
        return (
          <div key={proj.id}>
            <div className="flex items-baseline justify-between gap-2">
              <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827', fontFamily: customization.headingFont }}>
                {proj.name}
              </span>
            </div>
            {proj.technologies && (
              <div style={{ marginTop: 2, fontSize: `${fs * 0.82}px`, fontFamily: customization.headingFont, color: customization.accentColor, letterSpacing: '0.01em' }}>
                {proj.technologies}
              </div>
            )}
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
                    &#x2192; {T.github}
                  </a>
                )}
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                    style={{ fontSize: `${fs * 0.85}px`, color: customization.accentColor, textDecoration: 'none', fontWeight: 500 }}
                  >
                    &#x2192; {T.liveDemo}
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Certifications ────────────────────────────────────────────

function renderCertifications(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  const lang = docLanguage(customization);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.certifications.filter(c => c.name).map((cert) => (
        <div key={cert.id} className="flex items-baseline justify-between gap-2">
          <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>
            {cert.name}
          </span>
          <span style={{ fontSize: `${fs * 0.85}px`, color: '#6b7280', whiteSpace: 'nowrap' }}>
            {cert.issuer}{cert.issueDate ? ` · ${formatDate(cert.issueDate, lang)}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Languages ─────────────────────────────────────────────────

function renderLanguages(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  const lang = docLanguage(customization);
  return (
    <div className="flex flex-wrap" style={{ gap: '4px 16px', marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.languages.map((langItem) => (
        <span key={langItem.id} style={{ fontSize: `${fs}px`, color: '#374151' }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>{langItem.language}</span>
          <span style={{ color: '#6b7280' }}> — {levelLabel(langItem.proficiency, lang)}</span>
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
      {data.volunteerExperience.filter(v => v.organization).map((vol) => {
        const descLines = splitBullets(vol.description);
        return (
          <div key={vol.id}>
            <div className="flex items-baseline justify-between gap-2">
              <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>
                {vol.role}
              </span>
            </div>
            <div style={{ fontSize: `${fs * 0.9}px`, color: '#4b5563', marginTop: 1 }}>
              {vol.organization}
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

// ─── References ────────────────────────────────────────────────

function renderReferences(data: TemplateComponentProps['data'], customization: TemplateComponentProps['customization'], fs: number) {
  const lang = docLanguage(customization);
  const T = docText(lang);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${10 * customization.sectionSpacing}px`, marginTop: `${6 * customization.sectionSpacing}px` }}>
      {data.references.filter(r => r.name).map((ref) => (
        <div key={ref.id}>
          <span style={{ fontWeight: 700, fontSize: `${fs}px`, color: '#111827' }}>{ref.name}</span>
          <span style={{ fontSize: `${fs * 0.9}px`, color: '#4b5563', marginLeft: 8 }}>
            {ref.position}{ref.company ? ` ${T.at} ${ref.company}` : ''}
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

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import type { ResumeData } from '@/types/resume';
import { formatDate, formatDateRange } from '@/lib/templates/utils';

interface ResumePreviewProps {
  resumeData: ResumeData;
  className?: string;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[14px] font-bold uppercase tracking-wider text-foreground pb-1.5 mb-3 border-b border-gray-200 dark:border-gray-700">
      {children}
    </h2>
  );
}

export function ResumePreview({ resumeData, className }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const paperWidth = 794; // 210mm at 96dpi
    const newScale = Math.min(1, (containerWidth - 48) / paperWidth); // 48px padding
    setScale(newScale);
  }, []);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  const hasContent = useMemo(() => {
    const { personalInfo, professionalSummary, workExperience, education, skills, projects, certifications, languages, awards, volunteerExperience, references, additionalInfo } = resumeData;
    return (
      personalInfo.fullName ||
      professionalSummary ||
      workExperience.length > 0 ||
      education.length > 0 ||
      skills.length > 0 ||
      projects.length > 0 ||
      certifications.length > 0 ||
      languages.length > 0 ||
      awards.length > 0 ||
      volunteerExperience.length > 0 ||
      references.length > 0 ||
      additionalInfo.text.trim()
    );
  }, [resumeData]);

  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certifications, languages, awards, volunteerExperience, references, additionalInfo } = resumeData;

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.website && personalInfo.website !== 'https://' ? personalInfo.website : '',
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean);

  return (
    <div ref={containerRef} className={className}>
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: '794px',
          minHeight: '1123px',
        }}
        className="bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.12)] mx-auto"
      >
        <div className="px-[60px] py-[56px]" style={{ fontFamily: 'var(--font-inter)' }}>
          {!hasContent ? (
            <div className="flex items-center justify-center h-[900px]">
              <p className="text-[14px] text-gray-400">Start filling in your details to see a preview</p>
            </div>
          ) : (
            <>
              {/* Header */}
              {personalInfo.fullName && (
                <header className="text-center mb-6">
                  <h1 className="text-[22px] font-bold text-gray-900 dark:text-white leading-tight">
                    {personalInfo.fullName}
                  </h1>
                  {personalInfo.professionalTitle && (
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">
                      {personalInfo.professionalTitle}
                    </p>
                  )}
                  {contactItems.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-2 text-[11px] text-gray-600 dark:text-gray-400">
                      {contactItems.map((item, i) => (
                        <span key={i} className="flex items-center gap-2">
                          {i > 0 && <span className="text-gray-300 dark:text-gray-600">|</span>}
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </header>
              )}

              {/* Professional Summary */}
              {professionalSummary.trim() && (
                <section className="mb-5">
                  <SectionHeading>Professional Summary</SectionHeading>
                  <p className="text-[11px] leading-[1.5] text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {professionalSummary}
                  </p>
                </section>
              )}

              {/* Work Experience */}
              {workExperience.length > 0 && workExperience.some(e => e.company || e.position) && (
                <section className="mb-5">
                  <SectionHeading>Work Experience</SectionHeading>
                  <div className="space-y-4">
                    {workExperience.filter(e => e.company || e.position).map((exp) => (
                      <div key={exp.id}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                              {exp.position || 'Position'}
                            </h3>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">
                              {exp.company}{exp.location ? `, ${exp.location}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-[11px] text-gray-500 dark:text-gray-500">
                              {formatDateRange(exp.startDate, exp.endDate, exp.currentJob)}
                            </p>
                            {exp.employmentType && exp.employmentType !== 'Full-time' && (
                              <p className="text-[10px] text-gray-400">{exp.employmentType}</p>
                            )}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-[11px] leading-[1.5] text-gray-700 dark:text-gray-300 mt-1.5 whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {education.length > 0 && education.some(e => e.school || e.degree) && (
                <section className="mb-5">
                  <SectionHeading>Education</SectionHeading>
                  <div className="space-y-3">
                    {education.filter(e => e.school || e.degree).map((edu) => (
                      <div key={edu.id}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                              {edu.degree || 'Degree'}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                            </h3>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">
                              {edu.school}{edu.location ? `, ${edu.location}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-[11px] text-gray-500 dark:text-gray-500">
                              {formatDateRange(edu.startDate, edu.endDate, false)}
                            </p>
                            {edu.grade && (
                              <p className="text-[10px] text-gray-400">GPA: {edu.grade}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {skills.length > 0 && (() => {
                const technicalSkills = skills.filter(sk => sk.type !== 'soft');
                const softSkills = skills.filter(sk => sk.type === 'soft');
                const hasBoth = technicalSkills.length > 0 && softSkills.length > 0;

                const renderBadge = (skill: typeof skills[0]) => (
                  <span
                    key={skill.id}
                    className="inline-block rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:text-gray-300"
                  >
                    {skill.name}
                  </span>
                );

                const renderBadgeWrap = (skillList: typeof skills) => (
                  <div className="flex flex-wrap gap-1.5">
                    {skillList.map(renderBadge)}
                  </div>
                );

                return (
                  <section className="mb-5">
                    <SectionHeading>Skills</SectionHeading>
                    {hasBoth ? (
                      <div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-3 mb-1">Technical Skills</p>
                          {renderBadgeWrap(technicalSkills)}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-3 mb-1">Soft Skills</p>
                          {renderBadgeWrap(softSkills)}
                        </div>
                      </div>
                    ) : (
                      renderBadgeWrap(skills)
                    )}
                  </section>
                );
              })()}

              {/* Projects */}
              {projects.length > 0 && projects.some(p => p.name) && (
                <section className="mb-5">
                  <SectionHeading>Projects</SectionHeading>
                  <div className="space-y-4">
                    {projects.filter(p => p.name).map((proj) => (
                      <div key={proj.id}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                              {proj.name}
                            </h3>
                            {proj.technologies && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                                {proj.technologies}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            {proj.githubUrl && (
                              <span className="text-[10px] text-brand">GitHub</span>
                            )}
                            {proj.liveUrl && (
                              <span className="text-[10px] text-brand">Live Demo</span>
                            )}
                          </div>
                        </div>
                        {proj.description && (
                          <p className="text-[11px] leading-[1.5] text-gray-700 dark:text-gray-300 mt-1">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {certifications.length > 0 && certifications.some(c => c.name) && (
                <section className="mb-5">
                  <SectionHeading>Certifications</SectionHeading>
                  <div className="space-y-2">
                    {certifications.filter(c => c.name).map((cert) => (
                      <div key={cert.id} className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                            {cert.name}
                          </h3>
                          <p className="text-[11px] text-gray-600 dark:text-gray-400">
                            {cert.issuer}
                          </p>
                        </div>
                        {cert.issueDate && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-500 shrink-0 ml-4">
                            {formatDate(cert.issueDate)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {languages.length > 0 && languages.some(l => l.language) && (
                <section className="mb-5">
                  <SectionHeading>Languages</SectionHeading>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {languages.filter(l => l.language).map((lang) => (
                      <span key={lang.id} className="text-[11px] text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{lang.language}</span>
                        {lang.proficiency && (
                          <span className="text-gray-500 dark:text-gray-500"> - {lang.proficiency}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Awards */}
              {awards.length > 0 && awards.some(a => a.name) && (
                <section className="mb-5">
                  <SectionHeading>Awards</SectionHeading>
                  <div className="space-y-2">
                    {awards.filter(a => a.name).map((award) => (
                      <div key={award.id} className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                            {award.name}
                          </h3>
                          <p className="text-[11px] text-gray-600 dark:text-gray-400">
                            {award.organization}
                          </p>
                        </div>
                        {award.year && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-500 shrink-0 ml-4">
                            {award.year}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Volunteer Experience */}
              {volunteerExperience.length > 0 && volunteerExperience.some(v => v.organization) && (
                <section className="mb-5">
                  <SectionHeading>Volunteer Experience</SectionHeading>
                  <div className="space-y-3">
                    {volunteerExperience.filter(v => v.organization).map((vol) => (
                      <div key={vol.id}>
                        <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                          {vol.role || 'Role'} - {vol.organization}
                        </h3>
                        {vol.description && (
                          <p className="text-[11px] leading-[1.5] text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line">
                            {vol.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* References */}
              {references.length > 0 && references.some(r => r.name) && (
                <section className="mb-5">
                  <SectionHeading>References</SectionHeading>
                  <div className="space-y-3">
                    {references.filter(r => r.name).map((ref) => (
                      <div key={ref.id}>
                        <h3 className="text-[12px] font-bold text-gray-900 dark:text-white">
                          {ref.name}
                        </h3>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          {ref.position}{ref.company ? ` at ${ref.company}` : ''}
                        </p>
                        <div className="flex gap-4 mt-0.5 text-[11px] text-gray-500 dark:text-gray-500">
                          {ref.email && <span>{ref.email}</span>}
                          {ref.phone && <span>{ref.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Additional Info */}
              {additionalInfo.text.trim() && (
                <section className="mb-5">
                  <SectionHeading>Additional Information</SectionHeading>
                  <p className="text-[11px] leading-[1.5] text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {additionalInfo.text}
                  </p>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
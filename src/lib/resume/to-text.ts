import type { ResumeData } from '@/types/resume';

/**
 * The whole CV as plain text (every section), for the ATS checker and the AI review.
 * Section headings are in English; the content is the user's own.
 */
export function resumeDataToText(data: ResumeData): string {
  const parts: string[] = [];

  // Personal info
  const pi = data.personalInfo;
  if (pi) {
    if (pi.fullName) parts.push(pi.fullName);
    if (pi.professionalTitle) parts.push(pi.professionalTitle);
    if (pi.email) parts.push(pi.email);
    if (pi.phone) parts.push(pi.phone);
    if (pi.location) parts.push(pi.location);
    if (pi.website) parts.push(pi.website);
    if (pi.linkedin) parts.push(pi.linkedin);
    if (pi.github) parts.push(pi.github);
    if (pi.portfolio) parts.push(pi.portfolio);
  }

  // Summary
  if (data.professionalSummary) {
    parts.push('Professional Summary');
    parts.push(data.professionalSummary);
  }

  // Work experience
  if (data.workExperience?.length) {
    parts.push('Work Experience');
    for (const w of data.workExperience) {
      if (w.position) parts.push(w.position);
      if (w.company) parts.push(w.company);
      if (w.location) parts.push(w.location);
      if (w.startDate) parts.push(w.startDate);
      if (w.endDate) parts.push(w.endDate);
      else if (w.currentJob) parts.push('Present');
      if (w.description) parts.push(w.description);
    }
  }

  // Education
  if (data.education?.length) {
    parts.push('Education');
    for (const e of data.education) {
      if (e.school) parts.push(e.school);
      if (e.degree) parts.push(e.degree);
      if (e.fieldOfStudy) parts.push(e.fieldOfStudy);
      if (e.location) parts.push(e.location);
      if (e.startDate) parts.push(e.startDate);
      if (e.endDate) parts.push(e.endDate);
      if (e.grade) parts.push(e.grade);
    }
  }

  // Skills
  if (data.skills?.length) {
    parts.push('Skills');
    parts.push(data.skills.map(s => s.name).join(', '));
  }

  // Projects
  if (data.projects?.length) {
    parts.push('Projects');
    for (const p of data.projects) {
      if (p.name) parts.push(p.name);
      if (p.description) parts.push(p.description);
      if (p.technologies) parts.push(p.technologies);
      if (p.results) parts.push(p.results);
    }
  }

  // Certifications
  if (data.certifications?.length) {
    parts.push('Certifications');
    for (const c of data.certifications) {
      if (c.name) parts.push(c.name);
      if (c.issuer) parts.push(c.issuer);
      if (c.issueDate) parts.push(c.issueDate);
    }
  }

  // Languages
  if (data.languages?.length) {
    parts.push('Languages');
    for (const l of data.languages) {
      if (l.language) parts.push(l.language);
      if (l.proficiency) parts.push(l.proficiency);
    }
  }

  // Awards
  if (data.awards?.length) {
    parts.push('Awards');
    for (const a of data.awards) {
      if (a.name) parts.push(a.name);
      if (a.organization) parts.push(a.organization);
      if (a.year) parts.push(a.year);
    }
  }

  // Volunteer
  if (data.volunteerExperience?.length) {
    parts.push('Volunteer Experience');
    for (const v of data.volunteerExperience) {
      if (v.organization) parts.push(v.organization);
      if (v.role) parts.push(v.role);
      if (v.description) parts.push(v.description);
    }
  }

  // References
  if (data.references?.length) {
    parts.push('References');
    for (const r of data.references) {
      if (r.name) parts.push(r.name);
      if (r.position) parts.push(r.position);
      if (r.company) parts.push(r.company);
    }
  }

  // Additional info
  if (data.additionalInfo?.text) {
    parts.push('Additional Information');
    parts.push(data.additionalInfo.text);
  }

  return parts.join('\n');
}

import type { ResumeData, WorkExperience, Education, Skill, Project, Certification, Language, Award, VolunteerExperience, Reference } from '@/types/resume';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function createDefaultResumeData(): ResumeData {
  return {
    personalInfo: {
      fullName: '',
      professionalTitle: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    professionalSummary: '',
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    volunteerExperience: [],
    references: [],
    additionalInfo: { text: '' },
  };
}

// Factory helpers for creating new entries with unique IDs
export function createWorkExperience(): WorkExperience {
  return { id: uid(), company: '', position: '', location: '', employmentType: 'Full-time', startDate: '', endDate: '', currentJob: false, description: '' };
}

export function createEducation(): Education {
  return { id: uid(), school: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', grade: '' };
}

export function createSkill(name = '', type: 'technical' | 'soft' = 'technical', proficiency?: string): Skill {
  return { id: uid(), name, type, proficiency: proficiency as Skill['proficiency'] || undefined };
}

export function createProject(): Project {
  return { id: uid(), name: '', description: '', results: '', technologies: '', githubUrl: '', liveUrl: '' };
}

export function createCertification(): Certification {
  return { id: uid(), name: '', issuer: '', issueDate: '', credentialUrl: '' };
}

export function createLanguage(): Language {
  return { id: uid(), language: '', proficiency: 'Intermediate' };
}

export function createAward(): Award {
  return { id: uid(), name: '', organization: '', year: '' };
}

export function createVolunteerExperience(): VolunteerExperience {
  return { id: uid(), organization: '', role: '', description: '' };
}

export function createReference(): Reference {
  return { id: uid(), name: '', position: '', company: '', email: '', phone: '' };
}

// Count non-empty sections (for progress indication)
export function getCompletedSections(data: ResumeData): number {
  let count = 0;
  if (data.personalInfo.fullName) count++;
  if (data.professionalSummary.trim()) count++;
  if (data.workExperience.length > 0 && data.workExperience.some(e => e.company || e.position)) count++;
  if (data.education.length > 0 && data.education.some(e => e.school || e.degree)) count++;
  if (data.skills.length > 0) count++;
  if (data.projects.length > 0 && data.projects.some(p => p.name)) count++;
  if (data.certifications.length > 0 && data.certifications.some(c => c.name)) count++;
  if (data.languages.length > 0 && data.languages.some(l => l.language)) count++;
  if (data.awards.length > 0 && data.awards.some(a => a.name)) count++;
  if (data.volunteerExperience.length > 0 && data.volunteerExperience.some(v => v.organization)) count++;
  if (data.references.length > 0 && data.references.some(r => r.name)) count++;
  if (data.additionalInfo.text.trim()) count++;
  return count;
}
// ─── Resume Data Types ───────────────────────────────────────────────

export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  currentJob: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export type SkillType = 'technical' | 'soft';

export type SkillProficiency = 'Expert' | 'Advanced' | 'Intermediate' | 'Basic';

export interface Skill {
  id: string;
  name: string;
  type?: SkillType; // defaults to 'technical' for backward compatibility
  proficiency?: SkillProficiency; // defaults to undefined (not shown) for backward compatibility
}

export interface Project {
  id: string;
  name: string;
  description: string;
  results: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface Award {
  id: string;
  name: string;
  organization: string;
  year: string;
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
}

export interface AdditionalInfo {
  text: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  awards: Award[];
  volunteerExperience: VolunteerExperience[];
  references: Reference[];
  additionalInfo: AdditionalInfo;
}

// ─── Resume Model (database) ────────────────────────────────────────

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  data_json: string;
  template: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── Section Keys ────────────────────────────────────────────────────

export const SECTION_KEYS = [
  'personalInfo',
  'professionalSummary',
  'workExperience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'awards',
  'volunteerExperience',
  'references',
  'additionalInfo',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

// ─── Section Meta (for sidebar) ──────────────────────────────────────

export interface SectionMeta {
  key: SectionKey;
  label: string;
  icon: string;
}

export const SECTIONS: SectionMeta[] = [
  { key: 'personalInfo', label: 'Personal Information', icon: 'User' },
  { key: 'professionalSummary', label: 'Professional Summary', icon: 'AlignLeft' },
  { key: 'workExperience', label: 'Work Experience', icon: 'Briefcase' },
  { key: 'education', label: 'Education', icon: 'GraduationCap' },
  { key: 'skills', label: 'Skills', icon: 'Wrench' },
  { key: 'projects', label: 'Projects', icon: 'FolderGit2' },
  { key: 'certifications', label: 'Certifications', icon: 'Award' },
  { key: 'languages', label: 'Languages', icon: 'Globe' },
  { key: 'awards', label: 'Awards', icon: 'Trophy' },
  { key: 'volunteerExperience', label: 'Volunteer Experience', icon: 'Heart' },
  { key: 'references', label: 'References', icon: 'Users' },
  { key: 'additionalInfo', label: 'Additional Information', icon: 'FileText' },
];

// ─── Employment Types ────────────────────────────────────────────────

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Self-employed',
] as const;

// ─── Language Proficiencies ──────────────────────────────────────────

export const PROFICIENCY_LEVELS = [
  'Native',
  'Fluent',
  'Advanced',
  'Intermediate',
  'Beginner',
] as const;

// ─── Autosave Status ────────────────────────────────────────────────

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';
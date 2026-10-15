import type { SectionKey } from '@/types/resume';
import type { TemplateCustomization } from '@/types/template';

/** Language the CV itself is written in (headings, dates, fixed labels). */
export type DocLanguage = 'en' | 'fr';

export function docLanguage(c?: Pick<TemplateCustomization, 'language'> | null): DocLanguage {
  return c?.language === 'fr' ? 'fr' : 'en';
}

const SECTIONS: Record<DocLanguage, Record<SectionKey, string>> = {
  en: {
    personalInfo: '',
    professionalSummary: 'Professional Summary',
    workExperience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    languages: 'Languages',
    awards: 'Awards',
    volunteerExperience: 'Volunteer Experience',
    references: 'References',
    additionalInfo: 'Additional Information',
  },
  fr: {
    personalInfo: '',
    professionalSummary: 'Profil professionnel',
    workExperience: 'Expérience professionnelle',
    education: 'Formation',
    skills: 'Compétences',
    projects: 'Projets',
    certifications: 'Certifications',
    languages: 'Langues',
    awards: 'Distinctions',
    volunteerExperience: 'Bénévolat',
    references: 'Références',
    additionalInfo: 'Informations complémentaires',
  },
};

const TEXT = {
  en: {
    technicalSkills: 'Technical Skills',
    softSkills: 'Soft Skills',
    coreCompetencies: 'Core Competencies',
    present: 'Present',
    gpa: 'GPA',
    in: 'in', // "Master's in Computer Science"
    at: 'at', // "Director at Company"
    technologies: 'Technologies',
    results: 'Results',
    yourName: 'Your Name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    web: 'Web',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    portfolio: 'Portfolio',
    liveDemo: 'Live Demo',
  },
  fr: {
    technicalSkills: 'Compétences techniques',
    softSkills: 'Savoir-être',
    coreCompetencies: 'Compétences clés',
    present: "Aujourd'hui",
    gpa: 'Moyenne',
    in: 'en',
    at: 'chez',
    technologies: 'Technologies',
    results: 'Résultats',
    yourName: 'Votre nom',
    email: 'E-mail',
    phone: 'Téléphone',
    location: 'Adresse',
    web: 'Site web',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    portfolio: 'Portfolio',
    liveDemo: 'Démo en ligne',
  },
} as const;

export type DocText = { [K in keyof (typeof TEXT)['en']]: string };

const MONTHS: Record<DocLanguage, readonly string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
};

// Stored values stay in English; only the printed label changes
const LEVELS: Record<string, string> = {
  Expert: 'Expert',
  Advanced: 'Avancé',
  Intermediate: 'Intermédiaire',
  Basic: 'Notions',
  Beginner: 'Débutant',
  Native: 'Langue maternelle',
  Fluent: 'Courant',
  Professional: 'Professionnel',
  Conversational: 'Conversationnel',
  Elementary: 'Élémentaire',
};

export function sectionLabel(key: SectionKey, lang: DocLanguage = 'en'): string {
  return SECTIONS[lang][key];
}

export function docText(lang: DocLanguage = 'en'): DocText {
  return TEXT[lang];
}

export function monthName(index: number, lang: DocLanguage = 'en'): string {
  return MONTHS[lang][index];
}

/** Skill or language level as printed on the CV ("Advanced" → "Avancé" in French). */
export function levelLabel(value: string | undefined, lang: DocLanguage = 'en'): string {
  if (!value) return '';
  return lang === 'fr' ? LEVELS[value] ?? value : value;
}

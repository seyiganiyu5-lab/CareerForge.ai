'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ResumeData, SectionKey } from '@/types/resume';
import { PersonalInfoForm } from './sections/personal-info-form';
import { SummaryForm } from './sections/summary-form';
import { WorkExperienceForm } from './sections/work-experience-form';
import { EducationForm } from './sections/education-form';
import { SkillsForm } from './sections/skills-form';
import { ProjectsForm } from './sections/projects-form';
import { CertificationsForm } from './sections/certifications-form';
import { LanguagesForm } from './sections/languages-form';
import { AwardsForm } from './sections/awards-form';
import { VolunteerForm } from './sections/volunteer-form';
import { ReferencesForm } from './sections/references-form';
import { AdditionalInfoForm } from './sections/additional-info-form';

interface AiAssistParams {
  section: string;
  content: string;
  itemId?: string;
  field?: string;
}

interface SectionEditorProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  activeSection: SectionKey;
  onAiAssist?: (params: AiAssistParams) => void;
}

export function SectionEditor({ resumeData, setResumeData, activeSection, onAiAssist }: SectionEditorProps) {
  const renderSection = () => {
    switch (activeSection) {
      case 'personalInfo':
        return <PersonalInfoForm resumeData={resumeData} setResumeData={setResumeData} />;
      case 'professionalSummary':
        return <SummaryForm resumeData={resumeData} setResumeData={setResumeData} onAiAssist={onAiAssist} />;
      case 'workExperience':
        return <WorkExperienceForm resumeData={resumeData} setResumeData={setResumeData} onAiAssist={onAiAssist} />;
      case 'education':
        return <EducationForm resumeData={resumeData} setResumeData={setResumeData} />;
      case 'skills':
        return <SkillsForm resumeData={resumeData} setResumeData={setResumeData} onAiAssist={onAiAssist} />;
      case 'projects':
        return <ProjectsForm resumeData={resumeData} setResumeData={setResumeData} onAiAssist={onAiAssist} />;
      case 'certifications':
        return <CertificationsForm resumeData={resumeData} setResumeData={setResumeData} />;
      case 'languages':
        return <LanguagesForm resumeData={resumeData} setResumeData={setResumeData} />;
      case 'awards':
        return <AwardsForm resumeData={resumeData} setResumeData={setResumeData} />;
      case 'volunteerExperience':
        return <VolunteerForm resumeData={resumeData} setResumeData={setResumeData} onAiAssist={onAiAssist} />;
      case 'references':
        return <ReferencesForm resumeData={resumeData} setResumeData={setResumeData} />;
      case 'additionalInfo':
        return <AdditionalInfoForm resumeData={resumeData} setResumeData={setResumeData} onAiAssist={onAiAssist} />;
      default:
        return null;
    }
  };

  return (
    <div className="@container h-full overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="p-4 @md:p-6 max-w-3xl"
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
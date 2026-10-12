'use client';

import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import LegalHero from '@/components/legal/legal-hero';
import LegalToc from '@/components/legal/legal-toc';
import { LegalSearchProvider } from '@/components/legal/legal-search';
import {
  LegalSection,
  LegalSubSection,
  LegalParagraph,
  LegalCallout,
  LegalList,
} from '@/components/legal/legal-content';

const SECTION_KEYS = [
  'introduction',
  'infoWeCollect',
  'autoCollected',
  'howWeUse',
  'aiProcessing',
  'sharingInfo',
  'dataStorage',
  'cookies',
  'userRights',
  'dataRetention',
  'dataBreach',
  'childrenPrivacy',
  'internationalUsers',
  'policyChanges',
  'contactUs',
] as const;

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacyPolicy');

  const sections = SECTION_KEYS.map((key) => ({
    id: key,
    title: t(`sections.${key}.title`),
  }));

  return (
    <>
      <LegalHero
        titleKey="hero.title"
        subtitleKey="hero.subtitle"
        icon={<ShieldCheck className="w-7 h-7 text-brand" />}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 sm:pb-40">
        <div className="flex gap-10">
          {/* Table of Contents - Desktop sidebar */}
          <LegalToc sections={sections} />

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            <LegalSearchProvider namespace="privacyPolicy">

              {/* 1. Introduction */}
              <LegalSection id="introduction" title={t('sections.introduction.title')}>
              {(t.raw('sections.introduction.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 2. Information We Collect */}
            <LegalSection id="infoWeCollect" title={t('sections.infoWeCollect.title')}>
              <LegalParagraph>{t('sections.infoWeCollect.content')}</LegalParagraph>
              {(t.raw('sections.infoWeCollect.subsections') as { title: string; content: string }[]).map((sub, i) => (
                <LegalSubSection key={i} title={sub.title}>
                  <LegalParagraph>{sub.content}</LegalParagraph>
                </LegalSubSection>
              ))}
            </LegalSection>

            {/* 3. Automatically Collected Information */}
            <LegalSection id="autoCollected" title={t('sections.autoCollected.title')}>
              <LegalParagraph>{t('sections.autoCollected.content')}</LegalParagraph>
              {(t.raw('sections.autoCollected.subsections') as { title: string; content: string }[]).map((sub, i) => (
                <LegalSubSection key={i} title={sub.title}>
                  <LegalParagraph>{sub.content}</LegalParagraph>
                </LegalSubSection>
              ))}
            </LegalSection>

            {/* 4. How We Use Your Information */}
            <LegalSection id="howWeUse" title={t('sections.howWeUse.title')}>
              <LegalParagraph>{t('sections.howWeUse.content')}</LegalParagraph>
              {(t.raw('sections.howWeUse.subsections') as { title: string; content: string }[]).map((sub, i) => (
                <LegalSubSection key={i} title={sub.title}>
                  <LegalParagraph>{sub.content}</LegalParagraph>
                </LegalSubSection>
              ))}
            </LegalSection>

            {/* 5. AI Processing */}
            <LegalSection id="aiProcessing" title={t('sections.aiProcessing.title')}>
              {(t.raw('sections.aiProcessing.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
              <LegalCallout type="info">
                {t('sections.aiProcessing.content.1')}
              </LegalCallout>
            </LegalSection>

            {/* 6. Sharing Information */}
            <LegalSection id="sharingInfo" title={t('sections.sharingInfo.title')}>
              {(t.raw('sections.sharingInfo.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
              <LegalCallout type="warning">
                {t('sections.sharingInfo.content.1')}
              </LegalCallout>
              {(t.raw('sections.sharingInfo.subsections') as { title: string; content: string }[]).map((sub, i) => (
                <LegalSubSection key={i} title={sub.title}>
                  <LegalParagraph>{sub.content}</LegalParagraph>
                </LegalSubSection>
              ))}
            </LegalSection>

            {/* 7. Data Storage */}
            <LegalSection id="dataStorage" title={t('sections.dataStorage.title')}>
              {(t.raw('sections.dataStorage.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 8. Cookies */}
            <LegalSection id="cookies" title={t('sections.cookies.title')}>
              <LegalParagraph>{t('sections.cookies.content')}</LegalParagraph>
              {(t.raw('sections.cookies.subsections') as { title: string; content: string }[]).map((sub, i) => (
                <LegalSubSection key={i} title={sub.title}>
                  <LegalParagraph>{sub.content}</LegalParagraph>
                </LegalSubSection>
              ))}
            </LegalSection>

            {/* 9. User Rights */}
            <LegalSection id="userRights" title={t('sections.userRights.title')}>
              <LegalParagraph>{t('sections.userRights.content')}</LegalParagraph>
              {(t.raw('sections.userRights.subsections') as { title: string; content: string }[]).map((sub, i) => (
                <LegalSubSection key={i} title={sub.title}>
                  <LegalParagraph>{sub.content}</LegalParagraph>
                </LegalSubSection>
              ))}
            </LegalSection>

            {/* 10. Data Retention */}
            <LegalSection id="dataRetention" title={t('sections.dataRetention.title')}>
              {(t.raw('sections.dataRetention.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 11. Data Breach Notification */}
            <LegalSection id="dataBreach" title={t('sections.dataBreach.title')}>
              <LegalParagraph>{t('sections.dataBreach.content')}</LegalParagraph>
            </LegalSection>

            {/* 12. Children's Privacy */}
            <LegalSection id="childrenPrivacy" title={t('sections.childrenPrivacy.title')}>
              <LegalParagraph>{t('sections.childrenPrivacy.content')}</LegalParagraph>
            </LegalSection>

            {/* 13. International Users */}
            <LegalSection id="internationalUsers" title={t('sections.internationalUsers.title')}>
              <LegalParagraph>{t('sections.internationalUsers.content')}</LegalParagraph>
            </LegalSection>

            {/* 14. Policy Changes */}
            <LegalSection id="policyChanges" title={t('sections.policyChanges.title')}>
              <LegalParagraph>{t('sections.policyChanges.content')}</LegalParagraph>
            </LegalSection>

            {/* 15. Contact Us */}
            <LegalSection id="contactUs" title={t('sections.contactUs.title')}>
              {(t.raw('sections.contactUs.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>
            </LegalSearchProvider>
          </article>
        </div>
      </div>
    </>
  );
}
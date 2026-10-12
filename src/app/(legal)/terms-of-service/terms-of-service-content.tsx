'use client';

import { FileText, ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import LegalHero from '@/components/legal/legal-hero';
import LegalToc from '@/components/legal/legal-toc';
import { LegalSearchProvider } from '@/components/legal/legal-search';
import {
  LegalSection,
  LegalParagraph,
  LegalCallout,
  LegalList,
} from '@/components/legal/legal-content';

const SECTION_KEYS = [
  'acceptanceOfTerms',
  'eligibility',
  'accountRegistration',
  'userResponsibilities',
  'acceptableUse',
  'aiServices',
  'subscriptions',
  'payments',
  'refundPolicy',
  'accountSuspension',
  'intellectualProperty',
  'thirdPartyServices',
  'disclaimer',
  'limitationOfLiability',
  'indemnification',
  'governingLaw',
  'disputeResolution',
  'termination',
  'changesToTerms',
  'contactInformation',
] as const;

const SECTION_IDS: Record<string, string> = {
  acceptanceOfTerms: 'acceptance',
  eligibility: 'eligibility',
  accountRegistration: 'account-registration',
  userResponsibilities: 'user-responsibilities',
  acceptableUse: 'acceptable-use',
  aiServices: 'ai-services',
  subscriptions: 'subscriptions',
  payments: 'payments',
  refundPolicy: 'refund-policy',
  accountSuspension: 'account-suspension',
  intellectualProperty: 'intellectual-property',
  thirdPartyServices: 'third-party-services',
  disclaimer: 'disclaimer',
  limitationOfLiability: 'limitation-of-liability',
  indemnification: 'indemnification',
  governingLaw: 'governing-law',
  disputeResolution: 'dispute-resolution',
  termination: 'termination',
  changesToTerms: 'changes-to-terms',
  contactInformation: 'contact-information',
};

export default function TermsOfServiceContent() {
  const t = useTranslations('termsOfService');

  const sections = SECTION_KEYS.map((key) => ({
    id: SECTION_IDS[key],
    title: t(`sections.${key}.title`),
  }));

  return (
    <>
      <LegalHero
        titleKey="hero.title"
        subtitleKey="hero.subtitle"
        namespace="termsOfService"
        icon={<FileText className="w-7 h-7 text-brand" />}
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
            <LegalSearchProvider namespace="termsOfService">

            {/* 1. Acceptance of Terms */}
            <LegalSection id="acceptance" title={t('sections.acceptanceOfTerms.title')}>
              {(t.raw('sections.acceptanceOfTerms.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 2. Eligibility */}
            <LegalSection id="eligibility" title={t('sections.eligibility.title')}>
              {(t.raw('sections.eligibility.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 3. Account Registration */}
            <LegalSection id="account-registration" title={t('sections.accountRegistration.title')}>
              {(t.raw('sections.accountRegistration.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 4. User Responsibilities */}
            <LegalSection id="user-responsibilities" title={t('sections.userResponsibilities.title')}>
              {(t.raw('sections.userResponsibilities.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 5. Acceptable Use */}
            <LegalSection id="acceptable-use" title={t('sections.acceptableUse.title')}>
              <LegalParagraph>{t('sections.acceptableUse.content')}</LegalParagraph>
              <LegalList items={t.raw('sections.acceptableUse.items') as string[]} />
            </LegalSection>

            {/* 6. AI Services */}
            <LegalSection id="ai-services" title={t('sections.aiServices.title')}>
              {(t.raw('sections.aiServices.content') as string[]).map((p, i) =>
                i === 1 ? (
                  <LegalCallout key={i} type="warning">
                    {p}
                  </LegalCallout>
                ) : (
                  <LegalParagraph key={i}>{p}</LegalParagraph>
                ),
              )}
            </LegalSection>

            {/* 7. Subscriptions & Plans */}
            <LegalSection id="subscriptions" title={t('sections.subscriptions.title')}>
              {(t.raw('sections.subscriptions.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 8. Payments & Billing */}
            <LegalSection id="payments" title={t('sections.payments.title')}>
              {(t.raw('sections.payments.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 9. Refund Policy */}
            <LegalSection id="refund-policy" title={t('sections.refundPolicy.title')}>
              {(t.raw('sections.refundPolicy.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 10. Account Suspension & Termination */}
            <LegalSection id="account-suspension" title={t('sections.accountSuspension.title')}>
              {(t.raw('sections.accountSuspension.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 11. Intellectual Property */}
            <LegalSection id="intellectual-property" title={t('sections.intellectualProperty.title')}>
              {(t.raw('sections.intellectualProperty.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 12. Third-Party Services */}
            <LegalSection id="third-party-services" title={t('sections.thirdPartyServices.title')}>
              {(t.raw('sections.thirdPartyServices.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 13. Disclaimer */}
            <LegalSection id="disclaimer" title={t('sections.disclaimer.title')}>
              {(t.raw('sections.disclaimer.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 14. Limitation of Liability */}
            <LegalSection id="limitation-of-liability" title={t('sections.limitationOfLiability.title')}>
              {(t.raw('sections.limitationOfLiability.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 15. Indemnification */}
            <LegalSection id="indemnification" title={t('sections.indemnification.title')}>
              {(t.raw('sections.indemnification.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 16. Governing Law */}
            <LegalSection id="governing-law" title={t('sections.governingLaw.title')}>
              {(t.raw('sections.governingLaw.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 17. Dispute Resolution */}
            <LegalSection id="dispute-resolution" title={t('sections.disputeResolution.title')}>
              {(t.raw('sections.disputeResolution.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 18. Termination */}
            <LegalSection id="termination" title={t('sections.termination.title')}>
              {(t.raw('sections.termination.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 19. Changes to These Terms */}
            <LegalSection id="changes-to-terms" title={t('sections.changesToTerms.title')}>
              {(t.raw('sections.changesToTerms.content') as string[]).map((p, i) => (
                <LegalParagraph key={i}>{p}</LegalParagraph>
              ))}
            </LegalSection>

            {/* 20. Contact Information */}
            <LegalSection id="contact-information" title={t('sections.contactInformation.title')}>
              {(t.raw('sections.contactInformation.content') as string[]).map((p, i) => (
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
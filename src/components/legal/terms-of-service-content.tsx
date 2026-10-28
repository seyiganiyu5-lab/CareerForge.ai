'use client';

import { useTranslations } from '@/i18n/provider';
import LegalHero from '@/components/legal/legal-hero';
import HomeLink from '@/components/home-link';

const TERMS_SECTIONS = [
  'acceptance',
  'description',
  'registration',
  'acceptableUse',
  'intellectualProperty',
  'subscriptions',
  'cancellation',
  'disclaimer',
  'liabilityLimitation',
  'indemnification',
  'appleSignIn',
  'disputeResolution',
  'governingLaw',
  'changes',
  'severability',
  'contact',
] as const;

export default function TermsOfServiceContent() {
  const t = useTranslations('legal.termsOfService');
  const tGeneral = useTranslations('legal');

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 sm:pb-40">
      {/* Back to Home */}
      <div className="pt-6">
        <HomeLink className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-body" signedInLabel={tGeneral('backToDashboard')}>
          {tGeneral('backToHome')}
        </HomeLink>
      </div>

      {/* Hero */}
      <LegalHero title={t('title')} lastUpdated={t('lastUpdated')} />

      {/* Intro */}
      <p className="text-muted-foreground leading-relaxed mb-10 font-body">
        {t('intro')}
      </p>

      {/* Sections */}
      <div className="space-y-10">
        {TERMS_SECTIONS.map((sectionKey) => (
          <section key={sectionKey} aria-labelledby={`section-${sectionKey}`}>
            <h2
              id={`section-${sectionKey}`}
              className="font-heading text-xl font-semibold text-foreground mb-4"
            >
              {t(`sections.${sectionKey}.title`)}
            </h2>
            <p className="text-muted-foreground leading-relaxed font-body">
              {t(`sections.${sectionKey}.content`)}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
'use client';

import { useTranslations } from '@/i18n/provider';
import LegalHero from '@/components/legal/legal-hero';
import HomeLink from '@/components/home-link';

const PRIVACY_SECTIONS = [
  'infoWeCollect',
  'howWeUse',
  'infoSharing',
  'dataSecurity',
  'dataRetention',
  'yourRights',
  'cookies',
  'thirdParty',
  'children',
  'international',
  'changes',
  'dataBreach',
  'contact',
] as const;

const INFO_COLLECT_SUBSECTIONS = ['personal', 'usage', 'documents'] as const;

export default function PrivacyPolicyContent() {
  const t = useTranslations('legal.privacyPolicy');
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
        {PRIVACY_SECTIONS.map((sectionKey) => (
          <section key={sectionKey} aria-labelledby={`section-${sectionKey}`}>
            <h2
              id={`section-${sectionKey}`}
              className="font-heading text-xl font-semibold text-foreground mb-4"
            >
              {t(`sections.${sectionKey}.title`)}
            </h2>

            {sectionKey === 'infoWeCollect' ? (
              <div className="space-y-6">
                {INFO_COLLECT_SUBSECTIONS.map((subKey) => (
                  <div key={subKey}>
                    <h3 className="font-heading text-base font-semibold text-foreground mb-2">
                      {t(`sections.infoWeCollect.${subKey}.title`)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-body">
                      {t(`sections.infoWeCollect.${subKey}.content`)}
                    </p>
                  </div>
                ))}
              </div>
            ) : sectionKey === 'cookies' ? (
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed font-body">
                  {t('sections.cookies.content')}
                </p>
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground mb-2">
                    {t('sections.cookies.consent.title')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-body">
                    {t('sections.cookies.consent.content')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed font-body">
                {t(`sections.${sectionKey}.content`)}
              </p>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
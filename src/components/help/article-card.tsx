'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import type { HelpArticle } from '@/types/content';

interface ArticleCardProps {
  article: HelpArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { locale } = useLocale();
  const local = getLocalized(article, locale);
  const category = helpCategoryMap[article.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/help/article/${article.slug}`}>
        <div className="rounded-xl border border-border bg-card p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 group h-full">
          {category && (
            <span className="inline-block text-xs font-medium text-brand bg-brand/10 rounded-full px-2.5 py-0.5 mb-3 font-body">
              {category[locale]}
            </span>
          )}
          <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-brand transition-colors leading-snug">
            {local.title}
          </h3>
          <p className="text-sm text-muted-foreground font-body leading-relaxed mb-3 line-clamp-2">
            {local.description}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
            <Clock className="h-3.5 w-3.5" />
            {local.readingTime}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Lightweight lookup for category name badges
const helpCategoryMap: Record<string, { en: string; fr: string }> = {
  'getting-started': { en: 'Getting Started', fr: 'Prise en Main' },
  'account-profile': { en: 'Account & Profile', fr: 'Compte & Profil' },
  'resume-builder': { en: 'Resume Builder', fr: 'Créateur de CV' },
  'ai-cover-letter': { en: 'AI Cover Letter', fr: 'Lettre de Motivation IA' },
  'resume-review': { en: 'Resume Review', fr: 'Revue de CV' },
  'ats-optimization': { en: 'ATS Optimization', fr: 'Optimisation ATS' },
  templates: { en: 'Templates', fr: 'Modèles' },
  'job-tracker': { en: 'Job Tracker', fr: 'Suivi de Candidatures' },
  'billing-subscription': { en: 'Billing & Subscription', fr: 'Facturation & Abonnement' },
  security: { en: 'Security', fr: 'Sécurité' },
  privacy: { en: 'Privacy', fr: 'Confidentialité' },
  'technical-issues': { en: 'Technical Issues', fr: 'Problèmes Techniques' },
};
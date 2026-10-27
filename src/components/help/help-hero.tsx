'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useLocale } from '@/i18n/provider';

interface HelpHeroProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

const heroContent = {
  en: {
    title: 'Help Center',
    subtitle: 'Find answers to common questions, guides, and tips to get the most out of Hassify.',
    searchPlaceholder: 'Search for help articles...',
    popular: 'Popular:',
  },
  fr: {
    title: 'Centre d\'Aide',
    subtitle: 'Trouvez des réponses aux questions fréquentes, des guides et des conseils pour tirer le meilleur parti de Hassify.',
    searchPlaceholder: 'Rechercher des articles d\'aide...',
    popular: 'Populaire :',
  },
};

const popularChips = [
  { label: { en: 'Resume Builder', fr: 'Créateur de CV' }, query: 'resume builder' },
  { label: { en: 'Cover Letter', fr: 'Lettre de Motivation' }, query: 'cover letter' },
  { label: { en: 'Billing', fr: 'Facturation' }, query: 'billing' },
  { label: { en: 'Account', fr: 'Compte' }, query: 'account' },
  { label: { en: 'Templates', fr: 'Modèles' }, query: 'template' },
  { label: { en: 'ATS', fr: 'ATS' }, query: 'ats' },
];

export default function HelpHero({ onSearch, searchQuery }: HelpHeroProps) {
  const { locale } = useLocale();
  const t = heroContent[locale];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden py-16 md:py-24"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand/5 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4"
        >
          {t.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto font-body"
        >
          {t.subtitle}
        </motion.p>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand font-body"
          />
        </motion.div>

        {/* Popular Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-sm text-muted-foreground font-body">
            {t.popular}
          </span>
          {popularChips.map((chip) => (
            <button
              key={chip.query}
              onClick={() => onSearch(chip.query)}
              className="rounded-full bg-secondary text-secondary-foreground text-sm px-3 py-1 hover:bg-secondary/80 transition-colors font-body"
            >
              {chip.label[locale]}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
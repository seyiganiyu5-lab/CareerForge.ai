'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useLocale } from '@/i18n/provider';

interface BlogHeroProps {
  searchQuery: string;
  onSearch: (q: string) => void;
}

const heroContent = {
  en: {
    title: 'Career Advice & Resources',
    subtitle: 'Expert tips, AI insights, and practical guides to help you land your dream job and advance your career.',
    searchPlaceholder: 'Search articles...',
  },
  fr: {
    title: 'Conseils de Carrière et Ressources',
    subtitle: 'Conseils d\'experts, perspectives IA et guides pratiques pour vous aider à décrocher le job de vos rêves.',
    searchPlaceholder: 'Rechercher des articles...',
  },
};

export default function BlogHero({ searchQuery, onSearch }: BlogHeroProps) {
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
          className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-brand to-violet bg-clip-text text-transparent"
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

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative"
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
      </div>
    </motion.section>
  );
}
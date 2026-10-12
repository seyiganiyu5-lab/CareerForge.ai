'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import * as Icons from 'lucide-react';
import { ArrowRight, Mail, MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import SearchBar from '@/components/shared/search-bar';
import { helpCategories, helpArticles, searchArticles, getPopularArticles } from '@/data/help-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const POPULAR_SEARCHES = [
  { en: 'Resume Builder', fr: 'Constructeur de CV' },
  { en: 'Cover Letter', fr: 'Lettre de Motivation' },
  { en: 'Billing', fr: 'Facturation' },
  { en: 'Account', fr: 'Compte' },
  { en: 'Templates', fr: 'Modèles' },
  { en: 'ATS', fr: 'ATS' },
];

export default function HelpCenterContent() {
  const t = useTranslations('helpCenter');
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchArticles(searchQuery, locale);
  }, [searchQuery, locale]);

  const popularArticles = useMemo(() => getPopularArticles(locale), [locale]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="pt-12 pb-8 text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4"
        >
          {t('hero.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <SearchBar
            placeholder={t('hero.searchPlaceholder')}
            onSearch={setSearchQuery}
            className="w-full"
          />
        </motion.div>

        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <p className="text-sm text-muted-foreground mb-3">{t('hero.popularSearches')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term.en}
                  onClick={() => setSearchQuery(term.en)}
                  className="px-3 py-1.5 text-sm rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-brand/30 hover:bg-brand/5 transition-colors"
                >
                  {term[locale as 'en' | 'fr']}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* Search Results */}
      {searchQuery ? (
        <section className="pb-32 sm:pb-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className="text-sm text-muted-foreground">
              {searchResults.length} {t('search.results')} &ldquo;{searchQuery}&rdquo;
            </p>
            {searchResults.length > 0 && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-brand hover:underline mt-1"
              >
                {t('search.clear')}
              </button>
            )}
          </motion.div>

          {searchResults.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {searchResults.map((article) => {
                const cat = helpCategories.find(c => c.slug === article.category);
                const content = article.content[locale as 'en' | 'fr'];
                return (
                  <motion.a
                    key={article.slug}
                    variants={cardVariants}
                    href={`/help/article/${article.slug}`}
                    className="block p-5 rounded-2xl border border-border bg-card hover:border-brand/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {cat && (
                          <Badge className="mb-2 bg-gradient-to-r from-brand to-violet text-white rounded-full px-3 py-0.5 text-xs">
                            {cat.content[locale as 'en' | 'fr'].title}
                          </Badge>
                        )}
                        <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                          {content.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {content.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {content.readingTime} {t('popularArticles.minRead')}
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Icons.Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('search.noResults')}</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t('search.noResultsDescription')}
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setSearchQuery('')}
              >
                {t('search.clear')}
              </Button>
            </motion.div>
          )}
        </section>
      ) : (
        <>
          {/* Categories */}
          <section className="mt-16 pb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-8 text-center"
            >
              {t('categories.title')}
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {helpCategories.map((cat) => {
                const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[cat.icon] ?? Icons.Folder;
                const content = cat.content[locale as 'en' | 'fr'];
                return (
                  <motion.a
                    key={cat.slug}
                    variants={cardVariants}
                    href={`/help/category/${cat.slug}`}
                    className="block p-6 rounded-2xl border border-border bg-card hover:border-brand/30 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-brand/10 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                      <IconComponent className="w-5 h-5 text-brand" />
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors mb-2">
                      {content.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {content.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {cat.articleCount} {t('categories.articles')}
                    </Badge>
                  </motion.a>
                );
              })}
            </motion.div>
          </section>

          {/* Popular Articles */}
          <section className="pb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-8"
            >
              {t('popularArticles.title')}
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {popularArticles.map((article) => {
                const cat = helpCategories.find(c => c.slug === article.category);
                const content = article.content[locale as 'en' | 'fr'];
                return (
                  <motion.a
                    key={article.slug}
                    variants={cardVariants}
                    href={`/help/article/${article.slug}`}
                    className="block p-6 rounded-2xl border border-border bg-card hover:border-brand/30 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-brand/10 group"
                  >
                    {cat && (
                      <Badge className="mb-3 bg-gradient-to-r from-brand to-violet text-white rounded-full px-3 py-0.5 text-xs">
                        {cat.content[locale as 'en' | 'fr'].title}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-2 mb-2">
                      {content.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {content.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(article.date)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {content.readingTime} {t('popularArticles.minRead')}
                      </span>
                    </div>
                  </motion.a>
                );
              })}
            </motion.div>
          </section>

          {/* Contact Support CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl bg-gradient-to-r from-brand/10 via-violet/10 to-emerald/10 p-8 md:p-12 text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-3">
              {t('contact.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t('contact.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-brand hover:bg-brand/90 text-white gap-2"
                asChild
              >
                <a href="mailto:support@careerforge.ai">
                  <Mail className="w-4 h-4" />
                  {t('contact.emailSupport')}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                asChild
              >
                <a href="mailto:support@careerforge.ai">
                  <MessageSquare className="w-4 h-4" />
                  {t('contact.openTicket')}
                </a>
              </Button>
            </div>
          </motion.section>

          <div className="pb-32 sm:pb-40" />
        </>
      )}
    </div>
  );
}
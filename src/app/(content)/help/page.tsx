'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import { helpArticles } from '@/data/help-articles';
import HelpHero from '@/components/help/help-hero';
import CategoryGrid from '@/components/help/category-grid';
import ArticleCard from '@/components/help/article-card';
import ContactSupport from '@/components/help/contact-support';

const sectionTitles = {
  en: {
    categories: 'Browse by Category',
    popularArticles: 'Popular Articles',
    searchResults: 'Search Results',
    noResults: 'No articles found matching your search. Try different keywords.',
  },
  fr: {
    categories: 'Parcourir par Catégorie',
    popularArticles: 'Articles Populaires',
    searchResults: 'Résultats de Recherche',
    noResults: 'Aucun article trouvé correspondant à votre recherche. Essayez d\'autres mots-clés.',
  },
};

export default function HelpPage() {
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const t = sectionTitles[locale];

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return helpArticles.filter((article) => {
      const local = getLocalized(article, locale);
      return (
        local.title.toLowerCase().includes(q) ||
        local.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, locale]);

  const popularArticles = helpArticles.slice(0, 6);

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <HelpHero onSearch={setSearchQuery} searchQuery={searchQuery} />

        {searchQuery.trim() ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-16"
          >
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              {t.searchResults}
              <span className="text-muted-foreground font-normal text-base ml-2">
                ({filteredArticles.length})
              </span>
            </h2>
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-body text-center py-12">
                {t.noResults}
              </p>
            )}
          </motion.div>
        ) : (
          <>
            <section className="mb-16">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                {t.categories}
              </h2>
              <CategoryGrid />
            </section>

            <section className="mb-16">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                {t.popularArticles}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>

            <ContactSupport />
          </>
        )}
      </div>
    </div>
  );
}
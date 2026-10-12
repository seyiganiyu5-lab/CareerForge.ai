'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import { helpCategories, helpArticles } from '@/data/help-articles';
import ArticleCard from '@/components/help/article-card';

export default function CategoryPage() {
  const { locale } = useLocale();
  const params = useParams();
  const slug = params.slug as string;

  const category = useMemo(
    () => helpCategories.find((c) => c.slug === slug),
    [slug]
  );

  const articles = useMemo(
    () => helpArticles.filter((a) => a.category === slug),
    [slug]
  );

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          {locale === 'fr' ? 'Catégorie non trouvée' : 'Category Not Found'}
        </h1>
        <Link
          href="/help"
          className="text-brand hover:underline font-body"
        >
          ← {locale === 'fr' ? 'Retour au Centre d\'Aide' : 'Back to Help Center'}
        </Link>
      </div>
    );
  }

  const local = getLocalized(category, locale);

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 font-body">
          <Link href="/" className="hover:text-foreground transition-colors">
            {locale === 'fr' ? 'Accueil' : 'Home'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/help" className="hover:text-foreground transition-colors">
            {locale === 'fr' ? 'Centre d\'Aide' : 'Help Center'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{local.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 font-body"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === 'fr' ? 'Toutes les catégories' : 'All categories'}
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2"
          >
            {local.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-muted-foreground max-w-2xl font-body"
          >
            {local.description}
          </motion.p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
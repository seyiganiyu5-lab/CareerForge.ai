'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import * as Icons from 'lucide-react';
import { Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useLocale } from '@/i18n/provider';
import { helpCategories, helpArticles, getArticlesByCategory } from '@/data/help-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

interface CategoryContentProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryContent({ params }: CategoryContentProps) {
  const { slug } = React.use(params);
  const t = useTranslations('helpCenter');
  const { locale } = useLocale();

  const category = helpCategories.find(c => c.slug === slug);
  const articles = category ? getArticlesByCategory(slug, locale) : [];

  const IconComponent = category
    ? (Icons as Record<string, React.ComponentType<{ className?: string }>>)[category.icon] ?? Icons.Folder
    : Icons.Folder;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
        <h1 className="text-2xl font-bold text-foreground">Category not found</h1>
      </div>
    );
  }

  const catContent = category.content[locale as 'en' | 'fr'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="pt-6 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t('breadcrumb.help')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{catContent.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-10"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
              {catContent.title}
            </h1>
            <p className="text-muted-foreground mt-1">{catContent.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Article List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {articles.map((article) => {
          const content = article.content[locale as 'en' | 'fr'];
          return (
            <motion.a
              key={article.slug}
              variants={cardVariants}
              href={`/help/article/${article.slug}`}
              className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-brand/30 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground group-hover:text-brand transition-colors mb-1">
                  {content.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {content.description}
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {content.readingTime} {t('popularArticles.minRead')}
                </span>
                <span>{formatDate(article.date)}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors shrink-0" />
            </motion.a>
          );
        })}
      </motion.div>

      <div className="pb-32 sm:pb-40" />
    </div>
  );
}
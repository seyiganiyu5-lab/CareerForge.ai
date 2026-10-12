'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import * as Icons from 'lucide-react';
import { Clock, User, Calendar, ArrowLeft, ArrowRight, Mail, MessageSquare, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { helpCategories, helpArticles, getArticleBySlug, getAdjacentArticles, getRelatedArticles } from '@/data/help-data';
import TableOfContents from '@/components/shared/table-of-contents';
import ShareButtons from '@/components/shared/share-buttons';
import ArticleFeedback from '@/components/shared/article-feedback';
import type { ArticleBlock } from '@/data/help-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

interface ArticleContentProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleContent({ params }: ArticleContentProps) {
  const { slug } = React.use(params);
  const t = useTranslations('helpCenter');
  const { locale } = useLocale();

  const article = getArticleBySlug(slug, locale);
  const category = article ? helpCategories.find(c => c.slug === article.category) : undefined;
  const { prev, next } = article ? getAdjacentArticles(slug, locale) : { prev: undefined, next: undefined };
  const related = article ? getRelatedArticles(slug, article.category, locale, 3) : [];

  const tocItems = useMemo(() => {
    if (!article) return [];
    let idx = 0;
    return article.content[locale as 'en' | 'fr'].body
      .filter((b): b is ArticleBlock & { type: 'heading' } => b.type === 'heading')
      .map(b => ({
        id: `section-${idx++}`,
        title: b.text,
        level: b.level,
      }));
  }, [article, locale]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  if (!article) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
        <h1 className="text-2xl font-bold text-foreground">Article not found</h1>
      </div>
    );
  }

  const content = article.content[locale as 'en' | 'fr'];
  const catContent = category?.content[locale as 'en' | 'fr'];

  const renderBlock = (block: ArticleBlock, blockIdx: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={blockIdx} className="text-foreground/90 leading-relaxed mb-4">
            {block.text}
          </p>
        );

      case 'heading': {
        const headingIdx = tocItems.findIndex(t => t.title === block.text);
        const id = headingIdx >= 0 ? `section-${headingIdx}` : undefined;
        const Tag = block.level === 3 ? 'h3' : 'h2';
        return (
          <Tag
            key={blockIdx}
            id={id}
            className={cn(
              'font-heading font-semibold mt-10 mb-4 scroll-mt-24',
              block.level === 3 ? 'text-lg' : 'text-xl md:text-2xl text-foreground'
            )}
          >
            {block.text}
          </Tag>
        );
      }

      case 'list':
        return (
          <ul key={blockIdx} className="space-y-2 mb-4 list-disc list-inside text-foreground/90">
            {block.items.map((item, i) => (
              <li key={i} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        );

      case 'callout': {
        const variantStyles = {
          info: 'bg-brand/5 border-brand/20',
          tip: 'bg-emerald-500/5 border-emerald-500/20',
          warning: 'bg-amber-500/5 border-amber-500/20',
        };
        const variantIcons = {
          info: <Info className="w-5 h-5 text-brand" />,
          tip: <Lightbulb className="w-5 h-5 text-emerald-500" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        };
        return (
          <div
            key={blockIdx}
            className={cn('rounded-xl border p-4 mb-4', variantStyles[block.variant])}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{variantIcons[block.variant]}</div>
              <div>
                {block.title && (
                  <p className="font-semibold text-foreground mb-1">{block.title}</p>
                )}
                <p className="text-sm text-foreground/90 leading-relaxed">{block.text}</p>
              </div>
            </div>
          </div>
        );
      }

      case 'quote':
        return (
          <blockquote key={blockIdx} className="border-l-4 border-brand/50 pl-4 italic text-muted-foreground my-6">
            <p className="leading-relaxed">{block.text}</p>
            {block.author && (
              <cite className="text-sm not-italic text-foreground/70 mt-2 block">— {block.author}</cite>
            )}
          </blockquote>
        );

      case 'steps':
        return (
          <div key={blockIdx} className="space-y-4 mb-6">
            {block.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand">{i + 1}</span>
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="pt-6 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/help">{t('breadcrumb.help')}</BreadcrumbLink>
            </BreadcrumbItem>
            {category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/help/category/${category.slug}`}>
                    {catContent?.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{content.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Article Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-8 max-w-3xl"
      >
        {category && (
          <Badge className="mb-4 bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium">
            {catContent?.title}
          </Badge>
        )}
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">
          {content.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {article.author.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(article.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {content.readingTime} {t('popularArticles.minRead')}
          </span>
          <span className="flex items-center gap-1.5">
            {t('article.lastUpdated')}: {formatDate(article.lastUpdated)}
          </span>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="flex gap-10">
        {/* Article Body */}
        <article className="flex-1 min-w-0 max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {content.body.map((block, idx) => renderBlock(block, idx))}
          </motion.div>

          {/* Share & Feedback */}
          <div className="mt-12 space-y-6">
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t('article.share')}</span>
              <ShareButtons title={content.title} />
            </div>
            <ArticleFeedback />
          </div>

          {/* Prev/Next */}
          {(prev || next) && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prev && (
                <a
                  href={`/help/article/${prev.slug}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-brand/30 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-brand shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">{t('article.previousArticle')}</span>
                    <p className="text-sm font-medium text-foreground truncate">
                      {prev.content[locale as 'en' | 'fr'].title}
                    </p>
                  </div>
                </a>
              )}
              {next && (
                <a
                  href={`/help/article/${next.slug}`}
                  className="flex items-center justify-end gap-3 p-4 rounded-xl border border-border bg-card hover:border-brand/30 transition-colors group text-right"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">{t('article.nextArticle')}</span>
                    <p className="text-sm font-medium text-foreground truncate">
                      {next.content[locale as 'en' | 'fr'].title}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand shrink-0" />
                </a>
              )}
            </div>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold font-heading text-foreground mb-6">
                {t('article.relatedArticles')}
              </h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {related.map((relArticle) => {
                  const relContent = relArticle.content[locale as 'en' | 'fr'];
                  const relCat = helpCategories.find(c => c.slug === relArticle.category);
                  return (
                    <motion.a
                      key={relArticle.slug}
                      variants={cardVariants}
                      href={`/help/article/${relArticle.slug}`}
                      className="block p-5 rounded-2xl border border-border bg-card hover:border-brand/30 transition-all group"
                    >
                      {relCat && (
                        <Badge className="mb-2 bg-gradient-to-r from-brand to-violet text-white rounded-full px-3 py-0.5 text-xs">
                          {relCat.content[locale as 'en' | 'fr'].title}
                        </Badge>
                      )}
                      <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-2 mb-2">
                        {relContent.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{relContent.description}</p>
                    </motion.a>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* Contact Support CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-16 rounded-2xl bg-gradient-to-r from-brand/10 via-violet/10 to-emerald/10 p-8 text-center"
          >
            <h2 className="text-xl font-bold font-heading text-foreground mb-2">
              {t('contact.title')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">{t('contact.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="sm" className="bg-brand hover:bg-brand/90 text-white gap-2" asChild>
                <a href="mailto:support@careerforge.ai">
                  <Mail className="w-4 h-4" />
                  {t('contact.emailSupport')}
                </a>
              </Button>
              <Button size="sm" variant="outline" className="gap-2" asChild>
                <a href="mailto:support@careerforge.ai">
                  <MessageSquare className="w-4 h-4" />
                  {t('contact.openTicket')}
                </a>
              </Button>
            </div>
          </motion.div>

          <div className="pb-32 sm:pb-40" />
        </article>

        {/* TOC Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <TableOfContents items={tocItems} />
        </div>
      </div>
    </div>
  );
}
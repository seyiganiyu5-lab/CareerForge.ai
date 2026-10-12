'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Clock, Calendar, ArrowLeft, ArrowRight, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { blogCategories, blogPosts, getBlogPostBySlug, getRelatedPosts } from '@/data/blog-data';
import TableOfContents from '@/components/shared/table-of-contents';
import ShareButtons from '@/components/shared/share-buttons';
import Newsletter from '@/components/shared/newsletter';
import AuthorCard from '@/components/shared/author-card';
import type { BlogBlock } from '@/data/blog-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

interface BlogArticleContentProps {
  params: Promise<{ slug: string }>;
}

export default function BlogArticleContent({ params }: BlogArticleContentProps) {
  const { slug } = React.use(params);
  const t = useTranslations('blog');
  const { locale } = useLocale();

  const post = getBlogPostBySlug(slug, locale);
  const category = post ? blogCategories.find(c => c.slug === post.category) : undefined;
  const related = post ? getRelatedPosts(slug, post.category, locale, 3) : [];

  // Get prev/next
  const postIndex = blogPosts.findIndex(p => p.slug === slug);
  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : undefined;
  const nextPost = postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : undefined;

  const tocItems = useMemo(() => {
    if (!post) return [];
    let idx = 0;
    return post.content[locale as 'en' | 'fr'].body
      .filter((b): b is BlogBlock & { type: 'heading' } => b.type === 'heading')
      .map(b => ({
        id: `section-${idx++}`,
        title: b.text,
        level: b.level,
      }));
  }, [post, locale]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  if (!post) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
        <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
      </div>
    );
  }

  const content = post.content[locale as 'en' | 'fr'];

  const renderBlock = (block: BlogBlock, blockIdx: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={blockIdx} className="text-foreground/90 leading-relaxed mb-4">
            {block.text}
          </p>
        );

      case 'heading': {
        const headingIdx = tocItems.findIndex(ti => ti.title === block.text);
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
        if (block.ordered) {
          return (
            <ol key={blockIdx} className="space-y-2 mb-4 list-decimal list-inside text-foreground/90">
              {block.items.map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ol>
          );
        }
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

      case 'image':
        return (
          <figure key={blockIdx} className="my-6">
            <div className="h-48 md:h-64 rounded-2xl bg-gradient-to-br from-brand/20 via-violet/20 to-emerald/20" />
            {block.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-3">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'code':
        return (
          <div key={blockIdx} className="my-6 rounded-xl overflow-hidden border">
            <div className="bg-muted px-4 py-2 text-xs text-muted-foreground font-mono border-b">
              {block.language}
            </div>
            <pre className="bg-muted/50 p-4 overflow-x-auto">
              <code className="text-sm font-mono text-foreground">{block.code}</code>
            </pre>
          </div>
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
              <BreadcrumbLink href="/blog">{t('article.backToBlog')}</BreadcrumbLink>
            </BreadcrumbItem>
            {category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/blog?category=${category.slug}`}>
                    {category.content[locale as 'en' | 'fr'].name}
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

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-64 md:h-80 rounded-2xl bg-gradient-to-br from-brand/20 via-violet/20 to-emerald/20 mb-8"
      />

      {/* Article Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        className="mb-8 max-w-3xl"
      >
        {category && (
          <Badge className="mb-4 bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium">
            {category.content[locale as 'en' | 'fr'].name}
          </Badge>
        )}
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">
          {content.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <AuthorCard author={{ name: post.author.name, role: post.author.role }} />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {t('article.publishedOn')} {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {content.readingTime} {t('article.readTime')}
            </span>
          </div>
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

          {/* Share */}
          <div className="mt-12">
            <Separator className="mb-6" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t('article.share')}</span>
              <ShareButtons title={content.title} />
            </div>
          </div>

          {/* Newsletter Compact */}
          <div className="mt-12">
            <Newsletter variant="default" />
          </div>

          {/* Author Full Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-12 p-6 rounded-2xl border bg-card"
          >
            <AuthorCard
              author={{
                name: post.author.name,
                role: post.author.role,
                bio: post.author.bio[locale as 'en' | 'fr'],
              }}
            />
          </motion.div>

          {/* Prev/Next */}
          {(prevPost || nextPost) && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost && (
                <a
                  href={`/blog/${prevPost.slug}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-brand/30 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-brand shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">{t('article.previousPost')}</span>
                    <p className="text-sm font-medium text-foreground truncate">
                      {prevPost.content[locale as 'en' | 'fr'].title}
                    </p>
                  </div>
                </a>
              )}
              {nextPost && (
                <a
                  href={`/blog/${nextPost.slug}`}
                  className="flex items-center justify-end gap-3 p-4 rounded-xl border border-border bg-card hover:border-brand/30 transition-colors group text-right"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">{t('article.nextPost')}</span>
                    <p className="text-sm font-medium text-foreground truncate">
                      {nextPost.content[locale as 'en' | 'fr'].title}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand shrink-0" />
                </a>
              )}
            </div>
          )}

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold font-heading text-foreground mb-6">
                {t('article.relatedPosts')}
              </h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {related.map((relPost) => {
                  const relContent = relPost.content[locale as 'en' | 'fr'];
                  const relCat = blogCategories.find(c => c.slug === relPost.category);
                  return (
                    <motion.a
                      key={relPost.slug}
                      variants={cardVariants}
                      href={`/blog/${relPost.slug}`}
                      className="block rounded-2xl border border-border bg-card overflow-hidden hover:scale-[1.02] hover:shadow-lg hover:shadow-brand/10 transition-all group"
                    >
                      <div className="h-32 bg-gradient-to-br from-brand/20 via-violet/20 to-emerald/20" />
                      <div className="p-5">
                        {relCat && (
                          <Badge className="mb-2 bg-gradient-to-r from-brand to-violet text-white rounded-full px-3 py-0.5 text-xs">
                            {relCat.content[locale as 'en' | 'fr'].name}
                          </Badge>
                        )}
                        <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-2 mb-2 text-sm">
                          {relContent.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{relContent.description}</p>
                      </div>
                    </motion.a>
                  );
                })}
              </motion.div>
            </div>
          )}

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
'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Clock,
  Calendar,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import { blogPosts, blogCategories } from '@/data/blog-posts';
import BlogCard from '@/components/blog/blog-card';
import NewsletterSection from '@/components/blog/newsletter-section';

const uiText = {
  en: {
    home: 'Home',
    blog: 'Blog',
    tableOfContents: 'Table of Contents',
    share: 'Share',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    relatedArticles: 'Related Articles',
    prev: 'Previous',
    next: 'Next',
    articleNotFound: 'Article Not Found',
    backToBlog: 'Back to Blog',
    publishedOn: 'Published on',
  },
  fr: {
    home: 'Accueil',
    blog: 'Blog',
    tableOfContents: 'Table des Matières',
    share: 'Partager',
    copyLink: 'Copier le Lien',
    copied: 'Copié !',
    relatedArticles: 'Articles Connexes',
    prev: 'Précédent',
    next: 'Suivant',
    articleNotFound: 'Article Non Trouvé',
    backToBlog: 'Retour au Blog',
    publishedOn: 'Publié le',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getAuthorColor(name: string): string {
  const colors = [
    'bg-violet text-white',
    'bg-emerald text-white',
    'bg-brand text-white',
    'bg-cyan-500 text-white',
    'bg-amber-500 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getCategoryColor(slug: string): string {
  const map: Record<string, string> = {
    'career-advice': 'bg-violet/10 text-violet',
    'resume-tips': 'bg-emerald/10 text-emerald',
    'cover-letters': 'bg-brand/10 text-brand',
    'interview-prep': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'ai-technology': 'bg-brand/10 text-brand',
    'job-search': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    'remote-work': 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    'career-growth': 'bg-violet/10 text-violet',
    'product-updates': 'bg-brand/10 text-brand',
    announcements: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };
  return map[slug] || 'bg-secondary text-muted-foreground';
}

export default function BlogArticlePage() {
  const { locale } = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const t = uiText[locale];

  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const postIndex = useMemo(
    () => blogPosts.findIndex((p) => p.slug === slug),
    [slug]
  );
  const post = blogPosts[postIndex];
  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : null;
  const nextPost =
    postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null;

  const category = useMemo(
    () => blogCategories.find((c) => c.slug === post?.category),
    [post]
  );

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    // First try same category, then fallback to any other posts
    const sameCategory = blogPosts.filter(
      (p) => p.category === post.category && p.slug !== post.slug
    );
    if (sameCategory.length >= 3) return sameCategory.slice(0, 3);
    // Fill from different categories
    const others = blogPosts.filter(
      (p) => p.slug !== post.slug && !sameCategory.includes(p)
    );
    return [...sameCategory, ...others].slice(0, 3);
  }, [post]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!post) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          {t.articleNotFound}
        </h1>
        <Link
          href="/blog"
          className="text-brand hover:underline font-body"
        >
          ← {t.backToBlog}
        </Link>
      </div>
    );
  }

  const local = getLocalized(post, locale);
  const categoryLocal = category ? getLocalized(category, locale) : null;
  const authorColorClass = getAuthorColor(post.author.name);
  const categoryColorClass = getCategoryColor(post.category);
  const authorInitials = getInitials(post.author.name);

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground mb-8 font-body">
          <Link href="/" className="hover:text-foreground transition-colors">
            {t.home}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-foreground transition-colors">
            {t.blog}
          </Link>
          {categoryLocal && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="hover:text-foreground transition-colors cursor-default">
                {categoryLocal}
              </span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground truncate max-w-[200px]">{local.title}</span>
        </nav>

        {/* Main layout: ToC + Content */}
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
          {/* Sticky Table of Contents - Desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <h3 className="text-sm font-heading font-semibold text-foreground mb-3">
                {t.tableOfContents}
              </h3>
              <nav className="flex flex-col gap-1">
                {local.content.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={`text-sm font-body transition-colors py-1 border-l-2 pl-3 ${
                      activeSection === section.id
                        ? 'border-brand text-brand font-medium'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {section.heading}
                  </a>
                ))}
              </nav>

              {/* Share */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-heading font-semibold text-foreground mb-3">
                  {t.share}
                </h3>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                >
                  <LinkIcon className="h-4 w-4" />
                  {copied ? t.copied : t.copyLink}
                </button>
              </div>
            </div>
          </aside>

          {/* Article Content */}
          <article className="min-w-0">
            {/* Featured Image Placeholder */}
            <div className="h-64 md:h-80 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-brand/15" />
                </div>
              </div>
            </div>

            {/* Category Badge */}
            {categoryLocal && (
              <span
                className={`inline-block text-xs font-medium rounded-full px-2.5 py-0.5 mb-4 font-body ${categoryColorClass}`}
              >
                {categoryLocal}
              </span>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-5 leading-tight"
            >
              {local.title}
            </motion.h1>

            {/* Author Card + Meta */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-border"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold ${authorColorClass}`}
                >
                  {authorInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground font-body">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {post.author.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {t.publishedOn}{' '}
                  {new Date(local.publishedDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {local.readingTime}
                </span>
              </div>
            </motion.div>

            {/* Mobile Share */}
            <div className="lg:hidden mb-6">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
              >
                <LinkIcon className="h-4 w-4" />
                {copied ? t.copied : t.copyLink}
              </button>
            </div>

            {/* Intro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mb-8"
            >
              <p className="text-foreground/90 text-lg leading-relaxed font-body">
                {local.content.intro}
              </p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8 mb-10">
              {local.content.sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
                  className="scroll-mt-24"
                >
                  <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-3">
                    {section.heading}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed font-body whitespace-pre-line">
                    {section.body}
                  </div>
                </motion.section>
              ))}
            </div>

            {/* Conclusion */}
            {local.content.conclusion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="rounded-xl border border-brand/20 bg-brand/5 p-6 mb-10"
              >
                <p className="text-foreground leading-relaxed font-body">
                  {local.content.conclusion}
                </p>
              </motion.div>
            )}

            {/* Prev / Next Navigation */}
            <div className="border-t border-border pt-8 mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link href={`/blog/${prevPost.slug}`}>
                    <div className="rounded-xl border border-border bg-card p-4 hover:border-brand/30 transition-colors group">
                      <span className="text-xs text-muted-foreground font-body">
                        ← {t.prev}
                      </span>
                      <p className="text-sm font-heading font-medium text-foreground mt-1 group-hover:text-brand transition-colors truncate">
                        {getLocalized(prevPost, locale).title}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextPost && (
                  <Link href={`/blog/${nextPost.slug}`}>
                    <div className="rounded-xl border border-border bg-card p-4 hover:border-brand/30 transition-colors group sm:text-right">
                      <span className="text-xs text-muted-foreground font-body">
                        {t.next} →
                      </span>
                      <p className="text-sm font-heading font-medium text-foreground mt-1 group-hover:text-brand transition-colors truncate">
                        {getLocalized(nextPost, locale).title}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Newsletter */}
            <NewsletterSection />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mb-12 pt-12">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  {t.relatedArticles}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((p, i) => (
                    <BlogCard key={p.slug} post={p} index={i} />
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
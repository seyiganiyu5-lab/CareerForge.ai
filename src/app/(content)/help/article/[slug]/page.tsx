'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Clock,
  User,
  Calendar,
  Link as LinkIcon,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import { helpArticles, helpCategories } from '@/data/help-articles';
import ArticleCard from '@/components/help/article-card';

const uiText = {
  en: {
    home: 'Home',
    helpCenter: 'Help Center',
    tableOfContents: 'Table of Contents',
    share: 'Share',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    helpful: 'Was this helpful?',
    thankYou: 'Thank you for your feedback!',
    relatedArticles: 'Related Articles',
    prev: 'Previous',
    next: 'Next',
    backToHelp: 'Back to Help Center',
    lastUpdated: 'Last updated',
    minRead: 'min read',
  },
  fr: {
    home: 'Accueil',
    helpCenter: 'Centre d\'Aide',
    tableOfContents: 'Table des Matières',
    share: 'Partager',
    copyLink: 'Copier le Lien',
    copied: 'Copié !',
    helpful: 'Cet article vous a-t-il été utile ?',
    thankYou: 'Merci pour votre retour !',
    relatedArticles: 'Articles Connexes',
    prev: 'Précédent',
    next: 'Suivant',
    backToHelp: 'Retour au Centre d\'Aide',
    lastUpdated: 'Dernière mise à jour',
    minRead: 'min de lecture',
  },
};

export default function ArticlePage() {
  const { locale } = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const t = uiText[locale];

  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const articleIndex = useMemo(
    () => helpArticles.findIndex((a) => a.slug === slug),
    [slug]
  );
  const article = helpArticles[articleIndex];
  const prevArticle = articleIndex > 0 ? helpArticles[articleIndex - 1] : null;
  const nextArticle =
    articleIndex < helpArticles.length - 1 ? helpArticles[articleIndex + 1] : null;

  const category = useMemo(
    () => helpCategories.find((c) => c.slug === article?.category),
    [article]
  );

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return helpArticles
      .filter((a) => a.category === article.category && a.slug !== article.slug)
      .slice(0, 3);
  }, [article]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!article) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          {locale === 'fr' ? 'Article non trouvé' : 'Article Not Found'}
        </h1>
        <Link
          href="/help"
          className="text-brand hover:underline font-body"
        >
          ← {t.backToHelp}
        </Link>
      </div>
    );
  }

  const local = getLocalized(article, locale);
  const categoryLocal = category ? getLocalized(category, locale) : null;

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground mb-8 font-body">
          <Link href="/" className="hover:text-foreground transition-colors">
            {t.home}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/help" className="hover:text-foreground transition-colors">
            {t.helpCenter}
          </Link>
          {category && categoryLocal && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/help/category/${category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {categoryLocal.title}
              </Link>
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
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4 leading-tight">
                {local.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-body">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {article.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {local.readingTime}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {t.lastUpdated}{' '}
                  {new Date(local.lastUpdated).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
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
              transition={{ duration: 0.4, delay: 0.1 }}
              className="prose prose-neutral max-w-none mb-8"
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
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
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
                transition={{ duration: 0.4, delay: 0.3 }}
                className="rounded-xl border border-brand/20 bg-brand/5 p-6 mb-10"
              >
                <p className="text-foreground leading-relaxed font-body">
                  {local.content.conclusion}
                </p>
              </motion.div>
            )}

            {/* Feedback */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="border-t border-border pt-8 mb-10"
            >
              {feedback === null ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3 font-body">
                    {t.helpful}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setFeedback('up')}
                      className="p-2.5 rounded-full border border-border hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors text-muted-foreground"
                      aria-label="Helpful"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setFeedback('down')}
                      className="p-2.5 rounded-full border border-border hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors text-muted-foreground"
                      aria-label="Not helpful"
                    >
                      <ThumbsDown className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-brand font-medium font-body">
                  {t.thankYou}
                </p>
              )}
            </motion.div>

            {/* Prev / Next Navigation */}
            <div className="border-t border-border pt-8 mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevArticle ? (
                  <Link href={`/help/article/${prevArticle.slug}`}>
                    <div className="rounded-xl border border-border bg-card p-4 hover:border-brand/30 transition-colors group">
                      <span className="text-xs text-muted-foreground font-body">
                        ← {t.prev}
                      </span>
                      <p className="text-sm font-heading font-medium text-foreground mt-1 group-hover:text-brand transition-colors truncate">
                        {getLocalized(prevArticle, locale).title}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextArticle && (
                  <Link href={`/help/article/${nextArticle.slug}`}>
                    <div className="rounded-xl border border-border bg-card p-4 hover:border-brand/30 transition-colors group sm:text-right">
                      <span className="text-xs text-muted-foreground font-body">
                        {t.next} →
                      </span>
                      <p className="text-sm font-heading font-medium text-foreground mt-1 group-hover:text-brand transition-colors truncate">
                        {getLocalized(nextArticle, locale).title}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  {t.relatedArticles}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedArticles.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
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
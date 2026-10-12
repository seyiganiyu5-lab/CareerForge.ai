'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Clock, ArrowRight, Search as SearchIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import SearchBar from '@/components/shared/search-bar';
import Newsletter from '@/components/shared/newsletter';
import { blogCategories, blogPosts, searchBlogPosts, getFeaturedPosts } from '@/data/blog-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(d: string, locale: string) {
  return new Date(d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function BlogContent() {
  const t = useTranslations('blog');
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const featuredPosts = useMemo(() => getFeaturedPosts(locale), [locale]);

  const filteredPosts = useMemo(() => {
    let posts = activeCategory === 'all' ? blogPosts : blogPosts.filter(p => p.category === activeCategory);
    if (searchQuery.trim()) {
      const searchResults = searchBlogPosts(searchQuery, locale);
      const searchSlugs = new Set(searchResults.map(p => p.slug));
      posts = posts.filter(p => searchSlugs.has(p.slug));
    }
    return posts;
  }, [searchQuery, activeCategory, locale]);

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
      </section>

      {/* Featured Article */}
      {!searchQuery && activeCategory === 'all' && featuredPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          className="mb-12"
        >
          {featuredPosts.map((post) => {
            const content = post.content[locale as 'en' | 'fr'];
            const cat = blogCategories.find(c => c.slug === post.category);
            return (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block relative h-64 md:h-80 rounded-2xl bg-gradient-to-br from-brand/20 via-violet/20 to-emerald/20 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 rounded-full px-3 py-0.5 text-xs">
                      {t('featured.badge')}
                    </Badge>
                    {cat && (
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 rounded-full px-3 py-0.5 text-xs">
                        {cat.content[locale as 'en' | 'fr'].name}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2 group-hover:underline decoration-2 underline-offset-4">
                    {content.title}
                  </h2>
                  <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 max-w-2xl">
                    {content.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 bg-white/20 border-0">
                        <AvatarFallback className="bg-white/20 text-white text-xs">{getInitials(post.author.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white/90">{post.author.name}</span>
                    </div>
                    <span className="text-sm text-white/70">{formatDate(post.date, locale)}</span>
                    <span className="flex items-center gap-1 text-sm text-white/70">
                      <Clock className="w-3.5 h-3.5" />
                      {content.readingTime} {t('featured.readTime')}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </motion.section>
      )}

      {/* Category Filters */}
      <div className="mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-colors',
              activeCategory === 'all'
                ? 'bg-brand text-white border-brand'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-brand/30'
            )}
          >
            {t('categories.all')}
          </button>
          {blogCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={cn(
                'px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-colors',
                activeCategory === cat.slug
                  ? 'bg-brand text-white border-brand'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-brand/30'
              )}
            >
              {cat.content[locale as 'en' | 'fr'].name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={`${activeCategory}-${searchQuery}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPosts.map((post) => {
            const content = post.content[locale as 'en' | 'fr'];
            const cat = blogCategories.find(c => c.slug === post.category);
            return (
              <motion.a
                key={post.slug}
                variants={cardVariants}
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-border bg-card overflow-hidden hover:scale-[1.02] hover:shadow-lg hover:shadow-brand/10 transition-all group"
              >
                {/* Image Area */}
                <div className="h-48 bg-gradient-to-br from-brand/20 via-violet/20 to-emerald/20" />
                <div className="p-6">
                  {cat && (
                    <Badge className="mb-3 bg-gradient-to-r from-brand to-violet text-white rounded-full px-3 py-0.5 text-xs">
                      {cat.content[locale as 'en' | 'fr'].name}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-2 mb-2">
                    {content.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {content.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 bg-brand/10 border-0">
                        <AvatarFallback className="bg-brand/10 text-brand text-xs">{getInitials(post.author.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(post.date, locale)}</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {content.readingTime}m
                      </span>
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">{t('search.noResults')}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t('search.noResultsDescription')}
          </p>
        </motion.div>
      )}

      {/* Newsletter */}
      <div className="mt-16 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold font-heading text-foreground text-center">
            {t('newsletter.title')}
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {t('newsletter.subtitle')}
          </p>
        </div>
        <Newsletter variant="compact" />
      </div>

      <div className="pb-32 sm:pb-40" />
    </div>
  );
}
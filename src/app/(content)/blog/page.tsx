'use client';

import { useState, useMemo } from 'react';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import { blogPosts } from '@/data/blog-posts';
import BlogHero from '@/components/blog/blog-hero';
import FeaturedArticle from '@/components/blog/featured-article';
import CategoryFilter from '@/components/blog/category-filter';
import BlogCard from '@/components/blog/blog-card';
import NewsletterSection from '@/components/blog/newsletter-section';

const sectionText = {
  en: {
    latestArticles: 'Latest Articles',
    noPosts: 'No posts found matching your criteria. Try a different search or category.',
    featuredArticle: 'Featured Article',
  },
  fr: {
    latestArticles: 'Derniers Articles',
    noPosts: 'Aucun article trouvé correspondant à vos critères. Essayez une recherche ou une catégorie différente.',
    featuredArticle: 'Article à la Une',
  },
};

export default function BlogPage() {
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const t = sectionText[locale];

  const featuredPost = blogPosts[0];

  const filteredPosts = useMemo(() => {
    let posts = blogPosts.slice(1); // Exclude featured post
    if (activeCategory !== 'all') {
      posts = posts.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter((p) => {
        const local = getLocalized(p, locale);
        return (
          local.title.toLowerCase().includes(q) ||
          local.description.toLowerCase().includes(q)
        );
      });
    }
    return posts;
  }, [searchQuery, activeCategory, locale]);

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlogHero searchQuery={searchQuery} onSearch={setSearchQuery} />

        {/* Featured Article */}
        <div className="mb-2">
          <span className="text-xs font-medium text-brand bg-brand/10 rounded-full px-2.5 py-0.5 font-body">
            {t.featuredArticle}
          </span>
        </div>
        <FeaturedArticle post={featuredPost} />

        {/* Category Filter */}
        <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        {/* Articles Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
            {t.latestArticles}
          </h2>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-body">
                {t.noPosts}
              </p>
            </div>
          )}
        </section>

        <NewsletterSection />
      </div>
    </div>
  );
}
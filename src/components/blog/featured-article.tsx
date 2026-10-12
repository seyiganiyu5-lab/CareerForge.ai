'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import type { BlogPost, BlogCategory } from '@/types/content';
import { blogCategories } from '@/data/blog-posts';

interface FeaturedArticleProps {
  post: BlogPost;
}

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

export default function FeaturedArticle({ post }: FeaturedArticleProps) {
  const { locale } = useLocale();
  const local = getLocalized(post, locale);
  const category = blogCategories.find((c) => c.slug === post.category);
  const authorColorClass = getAuthorColor(post.author.name);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 group">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Placeholder */}
            <div className="h-64 md:h-auto bg-gradient-to-br from-brand/10 via-secondary to-violet/10 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-brand/15" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              {category && (
                <span className="inline-block self-start text-xs font-medium text-brand bg-brand/10 rounded-full px-2.5 py-0.5 mb-4 font-body">
                  {getLocalized(category, locale)}
                </span>
              )}

              <h2 className="text-2xl font-heading font-bold text-foreground mb-3 group-hover:text-brand transition-colors leading-tight">
                {local.title}
              </h2>

              <p className="text-muted-foreground font-body leading-relaxed mb-6 line-clamp-3">
                {local.description}
              </p>

              {/* Author & Meta */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${authorColorClass}`}
                >
                  {getInitials(post.author.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground font-body">
                    {post.author.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(local.publishedDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {local.readingTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Read More */}
              <span className="inline-flex items-center gap-1.5 text-brand font-medium text-sm font-body group-hover:gap-2.5 transition-all">
                {locale === 'fr' ? 'Lire la suite' : 'Read More'}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.section>
  );
}
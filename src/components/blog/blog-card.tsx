'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import type { BlogPost, BlogCategory } from '@/types/content';
import { blogCategories } from '@/data/blog-posts';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
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

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const { locale } = useLocale();
  const local = getLocalized(post, locale);
  const category = blogCategories.find((c) => c.slug === post.category);
  const categoryColorClass = getCategoryColor(post.category);
  const authorColorClass = getAuthorColor(post.author.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-200 group h-full flex flex-col">
          {/* Featured Image Placeholder */}
          <div className="h-48 bg-gradient-to-br from-secondary to-secondary/60 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-brand/20" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Category Badge */}
            {category && (
              <span
                className={`inline-block self-start text-xs font-medium rounded-full px-2.5 py-0.5 mb-3 font-body ${categoryColorClass}`}
              >
                {getLocalized(category, locale)}
              </span>
            )}

            {/* Title */}
            <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-brand transition-colors leading-snug line-clamp-2">
              {local.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4 line-clamp-2 flex-1">
              {local.description}
            </p>

            {/* Meta: Author, Date, Reading Time */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${authorColorClass}`}
                >
                  {getInitials(post.author.name)}
                </div>
                <span className="text-xs text-muted-foreground font-body truncate max-w-[120px]">
                  {post.author.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                <span className="hidden sm:inline">
                  {new Date(local.publishedDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    month: 'short',
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
        </div>
      </Link>
    </motion.div>
  );
}
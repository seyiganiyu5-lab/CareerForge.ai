'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import { blogCategories } from '@/data/blog-posts';

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

const allLabel = { en: 'All', fr: 'Tous' };

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const { locale } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-10"
    >
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* "All" pill */}
        <button
          onClick={() => onCategoryChange('all')}
          className={`shrink-0 rounded-full text-sm px-4 py-2 font-medium transition-colors font-body ${
            activeCategory === 'all'
              ? 'bg-brand text-white'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          {allLabel[locale]}
        </button>

        {/* Category pills */}
        {blogCategories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              className={`shrink-0 rounded-full text-sm px-4 py-2 font-medium transition-colors font-body ${
                isActive
                  ? 'bg-brand text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {getLocalized(cat, locale)}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
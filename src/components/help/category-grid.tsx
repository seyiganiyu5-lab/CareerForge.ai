'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Rocket,
  User,
  FileText,
  Mail,
  Star,
  ShieldCheck,
  Layout,
  ListChecks,
  CreditCard,
  Lock,
  Eye,
  Wrench,
} from 'lucide-react';
import { useLocale } from '@/i18n/provider';
import { getLocalized } from '@/types/content';
import { helpCategories } from '@/data/help-articles';

const iconMap: Record<string, React.ElementType> = {
  Rocket,
  User,
  FileText,
  Mail,
  Star,
  ShieldCheck,
  Layout,
  ListChecks,
  CreditCard,
  Lock,
  Eye,
  Wrench,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CategoryGrid() {
  const { locale } = useLocale();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {helpCategories.map((category) => {
        const local = getLocalized(category, locale);
        const Icon = iconMap[category.icon] || FileText;

        return (
          <motion.div key={category.slug} variants={itemVariants}>
            <Link href={`/help/category/${category.slug}`}>
              <div className="rounded-2xl border border-border bg-card p-6 hover:scale-[1.02] hover:border-brand/30 transition-all duration-200 group h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5 font-body">
                    {category.articleCount} {locale === 'fr' ? 'articles' : 'articles'}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1.5 group-hover:text-brand transition-colors">
                  {local.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {local.description}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
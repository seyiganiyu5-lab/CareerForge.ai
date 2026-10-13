'use client';

import { motion, type Variants } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';

const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Deloitte'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Trust() {
  const t = useTranslations('trust');

  return (
    <section className="relative border-y border-border/60 py-12 bg-background">
      {/* Gradient edge masks */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm text-muted-foreground mb-8 font-body"
        >
          {t('heading')}
        </motion.p>

        {/* Company logos row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16 flex-wrap"
        >
          {companies.map((company) => (
            <motion.span
              key={company}
              variants={itemVariants}
              whileHover={{ scale: 1.05, opacity: 1 }}
              className="
                text-lg font-semibold tracking-wide
                text-slate-300 dark:text-slate-600
                hover:text-slate-400 dark:hover:text-slate-500
                transition-colors cursor-default select-none
                font-heading
              "
            >
              {company}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
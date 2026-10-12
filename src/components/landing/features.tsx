'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { FileText, Mail, ShieldCheck, Layout, Star, Briefcase } from 'lucide-react';

const featureItems = [
  { key: 'aiResumeBuilder', icon: FileText },
  { key: 'aiCoverLetter', icon: Mail },
  { key: 'atsOptimization', icon: ShieldCheck },
  { key: 'resumeTemplates', icon: Layout },
  { key: 'aiResumeReview', icon: Star },
  { key: 'jobTracker', icon: Briefcase },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Features() {
  const t = useTranslations('features');

  return (
    <section id="features" className="relative py-20 md:py-28 bg-background grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium font-body shadow-lg shadow-brand/20">
            {t('badge')}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mt-6 text-foreground">
            {t('title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base md:text-lg leading-relaxed font-body">
            {t('description')}
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureItems.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                variants={cardVariants}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
                className="rounded-2xl border border-border bg-card p-6 md:p-8 transition-colors duration-200 hover:border-brand/30 cursor-default"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-violet shadow-lg shadow-brand/20">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-lg mt-4 text-foreground">
                  {t(`items.${feature.key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed font-body">
                  {t(`items.${feature.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
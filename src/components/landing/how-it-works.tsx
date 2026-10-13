'use client';

import { motion, type Variants } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { FileText, Mail, ShieldCheck, Target, Users, Zap } from 'lucide-react';

const highlights = [
  { key: 'atsStandard', icon: ShieldCheck },
  { key: 'aiPowered', icon: Zap },
  { key: 'allInOne', icon: Target },
  { key: 'global', icon: Users },
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function HowItWorks() {
  const t = useTranslations('about');

  return (
    <section id="about" className="relative py-20 md:py-28 bg-secondary">
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

        {/* Mission & Vision Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-violet shadow-lg shadow-brand/20">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground">
                {t('mission.title')}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed font-body">
              {t('mission.description')}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald to-brand shadow-lg shadow-emerald/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground">
                {t('vision.title')}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed font-body">
              {t('vision.description')}
            </p>
          </motion.div>
        </motion.div>

        {/* Highlight Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                variants={cardVariants}
                className="rounded-xl border border-border bg-card p-5 text-center"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 mx-auto mb-3">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <h4 className="font-heading font-semibold text-sm text-foreground">
                  {t(`highlights.${item.key}.title`)}
                </h4>
                <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed font-body">
                  {t(`highlights.${item.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
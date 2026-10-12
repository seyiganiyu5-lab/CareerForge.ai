'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

const templateKeys = ['modern', 'professional', 'executive', 'minimal', 'creative', 'atsFriendly'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

function ModernMockup() {
  return (
    <div className="flex h-full w-full p-4 gap-3">
      {/* Sidebar */}
      <div className="w-1/3 flex flex-col gap-2">
        <div className="w-8 h-8 rounded-full bg-brand/30 mx-auto" />
        <div className="h-1.5 w-12 bg-brand/20 rounded mx-auto" />
        <div className="h-1.5 w-10 bg-brand/15 rounded mx-auto mt-1" />
        <div className="mt-3 space-y-1.5">
          <div className="h-1 w-full bg-brand/10 rounded" />
          <div className="h-1 w-3/4 bg-brand/10 rounded" />
          <div className="h-1 w-5/6 bg-brand/10 rounded" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-1 w-full bg-brand/10 rounded" />
          <div className="h-1 w-2/3 bg-brand/10 rounded" />
          <div className="h-1 w-4/5 bg-brand/10 rounded" />
          <div className="h-1 w-3/4 bg-brand/10 rounded" />
        </div>
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-2 w-3/4 bg-foreground/10 rounded" />
        <div className="h-1.5 w-1/2 bg-foreground/8 rounded" />
        <div className="mt-2 space-y-1">
          <div className="h-1 w-full bg-foreground/6 rounded" />
          <div className="h-1 w-5/6 bg-foreground/6 rounded" />
          <div className="h-1 w-4/5 bg-foreground/6 rounded" />
          <div className="h-1 w-3/4 bg-foreground/6 rounded" />
        </div>
        <div className="mt-2 h-1.5 w-1/3 bg-brand/20 rounded" />
        <div className="mt-1 space-y-1">
          <div className="h-1 w-full bg-foreground/6 rounded" />
          <div className="h-1 w-5/6 bg-foreground/6 rounded" />
          <div className="h-1 w-2/3 bg-foreground/6 rounded" />
        </div>
      </div>
    </div>
  );
}

function ProfessionalMockup() {
  return (
    <div className="flex flex-col h-full w-full p-4">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="h-2.5 w-1/2 bg-foreground/12 rounded mx-auto" />
        <div className="h-1 w-1/3 bg-foreground/8 rounded mx-auto mt-1.5" />
        <div className="h-px w-full bg-foreground/10 mt-3" />
      </div>
      {/* Body */}
      <div className="flex-1 space-y-2.5">
        <div>
          <div className="h-1.5 w-1/4 bg-foreground/12 rounded mb-1.5" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-foreground/6 rounded" />
            <div className="h-1 w-5/6 bg-foreground/6 rounded" />
            <div className="h-1 w-4/5 bg-foreground/6 rounded" />
          </div>
        </div>
        <div>
          <div className="h-1.5 w-1/3 bg-foreground/12 rounded mb-1.5" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-foreground/6 rounded" />
            <div className="h-1 w-3/4 bg-foreground/6 rounded" />
            <div className="h-1 w-5/6 bg-foreground/6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecutiveMockup() {
  return (
    <div className="flex flex-col h-full w-full p-4">
      {/* Bold header */}
      <div className="flex items-end gap-2 mb-3">
        <div className="h-3 w-2/5 bg-foreground/12 rounded" />
        <div className="flex-1 border-b-2 border-brand/30 pb-1">
          <div className="h-1 w-3/4 bg-foreground/8 rounded ml-auto" />
        </div>
      </div>
      {/* Two-column layout */}
      <div className="flex gap-3 flex-1">
        <div className="flex-1 space-y-2">
          <div className="h-1.5 w-1/2 bg-foreground/12 rounded" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-foreground/6 rounded" />
            <div className="h-1 w-5/6 bg-foreground/6 rounded" />
            <div className="h-1 w-4/5 bg-foreground/6 rounded" />
            <div className="h-1 w-3/4 bg-foreground/6 rounded" />
          </div>
          <div className="h-1.5 w-2/5 bg-foreground/12 rounded mt-2" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-foreground/6 rounded" />
            <div className="h-1 w-3/4 bg-foreground/6 rounded" />
          </div>
        </div>
        <div className="w-px bg-foreground/10" />
        <div className="flex-1 space-y-2">
          <div className="h-1.5 w-2/5 bg-foreground/12 rounded" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-foreground/6 rounded" />
            <div className="h-1 w-5/6 bg-foreground/6 rounded" />
            <div className="h-1 w-2/3 bg-foreground/6 rounded" />
          </div>
          <div className="h-1.5 w-1/3 bg-foreground/12 rounded mt-2" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-foreground/6 rounded" />
            <div className="h-1 w-4/5 bg-foreground/6 rounded" />
            <div className="h-1 w-3/4 bg-foreground/6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalMockup() {
  return (
    <div className="flex flex-col h-full w-full p-6 justify-center">
      <div className="h-2.5 w-2/5 bg-foreground/10 rounded mb-4" />
      <div className="h-1 w-1/4 bg-foreground/7 rounded mb-6" />
      <div className="space-y-1.5 mb-6">
        <div className="h-1 w-full bg-foreground/5 rounded" />
        <div className="h-1 w-4/5 bg-foreground/5 rounded" />
        <div className="h-1 w-3/5 bg-foreground/5 rounded" />
      </div>
      <div className="h-1.5 w-1/4 bg-foreground/8 rounded mb-2" />
      <div className="space-y-1.5">
        <div className="h-1 w-full bg-foreground/5 rounded" />
        <div className="h-1 w-3/4 bg-foreground/5 rounded" />
      </div>
    </div>
  );
}

function CreativeMockup() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Color accent bar at top */}
      <div className="h-2 bg-gradient-to-r from-violet to-brand" />
      <div className="flex-1 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-violet/15" />
          <div>
            <div className="h-2 w-20 bg-foreground/12 rounded" />
            <div className="h-1 w-16 bg-foreground/7 rounded mt-1" />
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-14 rounded-full bg-brand/15" />
          <div className="h-5 w-14 rounded-full bg-violet/15" />
          <div className="h-5 w-14 rounded-full bg-emerald/15" />
        </div>
        <div className="space-y-1">
          <div className="h-1 w-full bg-foreground/6 rounded" />
          <div className="h-1 w-5/6 bg-foreground/6 rounded" />
          <div className="h-1 w-3/4 bg-foreground/6 rounded" />
          <div className="h-1 w-4/5 bg-foreground/6 rounded" />
        </div>
      </div>
    </div>
  );
}

function AtsFriendlyMockup() {
  return (
    <div className="flex flex-col h-full w-full p-4">
      {/* Standard header */}
      <div className="mb-3">
        <div className="h-2.5 w-1/2 bg-foreground/12 rounded" />
        <div className="flex gap-2 mt-1.5">
          <div className="h-1 w-20 bg-foreground/7 rounded" />
          <div className="h-1 w-24 bg-foreground/7 rounded" />
        </div>
        <div className="h-px w-full bg-foreground/10 mt-3" />
      </div>
      {/* Clear sections */}
      <div className="flex-1 space-y-2.5">
        <div>
          <div className="h-1.5 w-1/4 bg-brand/15 rounded mb-1.5" />
          <div className="space-y-1 pl-2 border-l-2 border-brand/10">
            <div className="h-1 w-full bg-foreground/6 rounded" />
            <div className="h-1 w-5/6 bg-foreground/6 rounded" />
            <div className="h-1 w-4/5 bg-foreground/6 rounded" />
          </div>
        </div>
        <div>
          <div className="h-1.5 w-1/3 bg-brand/15 rounded mb-1.5" />
          <div className="space-y-1 pl-2 border-l-2 border-brand/10">
            <div className="h-1 w-full bg-foreground/6 rounded" />
            <div className="h-1 w-3/4 bg-foreground/6 rounded" />
            <div className="h-1 w-5/6 bg-foreground/6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

const mockups: Record<string, () => ReactNode> = {
  modern: ModernMockup,
  professional: ProfessionalMockup,
  executive: ExecutiveMockup,
  minimal: MinimalMockup,
  creative: CreativeMockup,
  atsFriendly: AtsFriendlyMockup,
};

export default function Templates() {
  const t = useTranslations('templates');

  return (
    <section id="templates" className="relative py-20 md:py-28 bg-background grid-pattern">
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

        {/* Template Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {templateKeys.map((key) => {
            const Mockup = mockups[key];
            return (
              <motion.div
                key={key}
                variants={cardVariants}
                whileHover={{
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                }}
                className="rounded-2xl border border-border overflow-hidden bg-card transition-colors duration-200 hover:border-brand/30 group"
              >
                {/* Preview Area */}
                <div className="h-48 bg-secondary overflow-hidden">
                  <div className="h-full w-full scale-90 group-hover:scale-95 transition-transform duration-300">
                    <Mockup />
                  </div>
                </div>
                {/* Info */}
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-base text-foreground">
                    {t(`items.${key}`)}
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-brand font-medium font-body hover:text-brand/80 transition-colors"
                  >
                    {t('viewAll')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
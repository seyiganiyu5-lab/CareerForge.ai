'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import Link from 'next/link';
import {
  Sparkles,
  Brain,
  Cpu,
  Zap,
  CheckCircle2,
  Activity,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const checklistKeys = [
  'aiResumeWriting',
  'aiCoverLetterGen',
  'resumeRewriting',
  'atsOptimization',
  'keywordSuggestions',
  'grammarImprovements',
  'resumeScoring',
] as const;

export default function AiFeatures() {
  const t = useTranslations('aiFeatures');

  return (
    <section id="ai-features" className="relative py-20 md:py-28 bg-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Column — Decorative AI Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative w-full max-w-lg mx-auto aspect-[4/5] sm:aspect-square">
              {/* Main Glass Card */}
              <motion.div
                className="absolute inset-8 rounded-2xl p-6 glass border border-border shadow-xl z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-violet flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-heading font-semibold text-foreground">
                    {t('visual.engine')}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                    {t('visual.active')}
                  </span>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <Activity className="w-3.5 h-3.5" />
                        {t('visual.analysis')}
                      </div>
                      <span className="text-xs text-brand font-medium font-body">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <BarChart3 className="w-3.5 h-3.5" />
                        {t('visual.keywords')}
                      </div>
                      <span className="text-xs text-violet font-medium font-body">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <Cpu className="w-3.5 h-3.5" />
                        {t('visual.ats')}
                      </div>
                      <span className="text-xs text-emerald font-medium font-body">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>

                {/* Processing indicator */}
                <div className="mt-6 flex items-center gap-2 px-3 py-2 rounded-xl bg-brand/5 border border-brand/10">
                  <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                  <span className="text-sm text-brand font-medium font-body animate-pulse">
                    {t('visual.processing')}
                  </span>
                </div>
              </motion.div>

              {/* Floating Card — Brain */}
              <motion.div
                className="absolute -top-2 right-0 lg:right-4 rounded-xl p-3 glass-subtle border border-border shadow-lg z-20 animate-float"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-violet/70 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground font-heading">
                      {t('visual.nlp')}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {t('visual.languageModel')}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card — Cpu */}
              <motion.div
                className="absolute bottom-8 -left-2 lg:left-0 rounded-xl p-3 glass-subtle border border-border shadow-lg z-20 animate-float-delayed"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-emerald/70 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground font-heading">
                      {t('visual.deepLearning')}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {t('visual.neuralNetwork')}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card — Zap */}
              <motion.div
                className="absolute bottom-0 right-8 lg:right-12 rounded-xl p-3 glass-subtle border border-border shadow-lg z-20 animate-float-slow"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground font-heading">
                      {t('visual.fast')}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {t('visual.response')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column — Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full lg:w-1/2"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium font-body shadow-lg shadow-brand/20">
              {t('badge')}
            </span>

            {/* Title */}
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-6 text-foreground leading-tight">
              {t('title')}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mt-4 mb-8 text-base md:text-lg leading-relaxed font-body">
              {t('description')}
            </p>

            {/* Checklist */}
            <div className="space-y-4">
              {checklistKeys.map((key, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.3, delay: index * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />
                  <span className="text-foreground font-medium font-body">
                    {t(`checklist.${key}`)}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-10"
            >
              <Button
                size="lg"
                className="bg-brand hover:bg-brand/90 text-white font-body font-semibold rounded-xl px-8 shadow-lg shadow-brand/25 transition-all duration-200 hover:shadow-xl hover:shadow-brand/30"
                asChild
              >
                <Link href="/signup">
                  {t('cta')}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
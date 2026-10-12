'use client';

import { motion } from 'framer-motion';
import { Mail, Sparkles } from 'lucide-react';
import { useTranslations } from '@/i18n/provider';
import NewsletterForm from '@/components/newsletter/newsletter-form';

export default function LandingNewsletter() {
  const t = useTranslations('cta');

  return (
    <section className="relative py-20 md:py-24 bg-secondary/50">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 mb-6">
          <Mail className="w-7 h-7 text-brand" />
          <Sparkles className="absolute w-4 h-4 text-violet -translate-x-1 -translate-y-1" />
        </div>

        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
          {t('newsletterTitle')}
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 font-body">
          {t('newsletterDescription')}
        </p>

        <NewsletterForm source="landing" variant="hero" />
      </motion.div>
    </section>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import NewsletterForm from '@/components/newsletter/newsletter-form';

export default function NewsletterSection() {
  const t = useTranslations('content.newsletter');

  return (
    <section className="py-20 bg-secondary">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto px-4 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
          {t('title')}
        </h2>
        <p className="text-muted-foreground font-body mb-8">
          {t('description')}
        </p>
        <NewsletterForm source="blog" variant="hero" />
      </motion.div>
    </section>
  );
}
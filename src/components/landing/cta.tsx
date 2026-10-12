'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-r from-brand via-violet to-brand">
      {/* Decorative blurred circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl mx-auto">
            {t('title')}
          </h2>
          <p className="text-white/80 text-lg mt-6 max-w-2xl mx-auto font-body">
            {t('description')}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/signup">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white text-brand font-semibold rounded-xl px-8 py-3.5 hover:bg-white/90 shadow-lg transition-colors font-body"
              >
                {t('button')}
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
            <p className="text-white/60 text-sm font-body">
              {t('note')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
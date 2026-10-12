'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { Star, Quote } from 'lucide-react';

const testimonialKeys = ['sarah', 'michael', 'emily'] as const;

const avatarConfig: Record<string, { initials: string; className: string }> = {
  sarah: { initials: 'SJ', className: 'bg-brand/10 text-brand' },
  michael: { initials: 'MC', className: 'bg-violet/10 text-violet' },
  emily: { initials: 'ER', className: 'bg-emerald/10 text-emerald' },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
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

export default function Testimonials() {
  const t = useTranslations('testimonials');

  return (
    <section id="testimonials" className="bg-secondary py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-gradient-to-r from-brand to-violet text-white rounded-full px-4 py-1.5 text-sm font-medium font-body">
            {t('badge')}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-6">
            {t('title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 font-body">
            {t('description')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonialKeys.map((key) => {
            const avatar = avatarConfig[key];

            return (
              <motion.div
                key={key}
                variants={cardVariants}
                className="rounded-2xl border border-border bg-card p-6 md:p-8"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                <div className="relative mt-4">
                  <Quote className="absolute -top-1 -left-1 w-5 h-5 text-brand/20 fill-brand/20" />
                  <p className="text-foreground/90 text-sm leading-relaxed font-body pl-4">
                    {t(`items.${key}.review`)}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${avatar.className}`}
                  >
                    {avatar.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm font-body">
                      {t(`items.${key}.name`)}
                    </p>
                    <p className="text-muted-foreground text-xs font-body">
                      {t(`items.${key}.title`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
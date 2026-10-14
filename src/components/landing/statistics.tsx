'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';

function useAnimatedCount(target: number, suffix: string, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const steps = 60;
    const interval = duration / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return `${count}${suffix}`;
}

const statKeys = ['templates', 'suggestions', 'optimization', 'access'] as const;

export default function Statistics() {
  const t = useTranslations('statistics');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const templates = useAnimatedCount(10, '', inView, 1500);
  const suggestions = useAnimatedCount(100, '+', inView, 1800);
  const optimization = useAnimatedCount(95, '%', inView, 1600);

  const statItems = [
    { key: 'templates', value: templates },
    { key: 'suggestions', value: suggestions },
    { key: 'optimization', value: optimization },
    { key: 'access', value: '24/7' },
  ];

  return (
    <section ref={ref} className="relative py-16 md:py-20 bg-gradient-to-r from-brand to-violet overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <span className="block text-4xl md:text-5xl font-heading font-bold text-white">
                {stat.value}
              </span>
              <span className="block text-sm md:text-base mt-2 text-white/80 font-body">
                {t(`items.${stat.key}.label`)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
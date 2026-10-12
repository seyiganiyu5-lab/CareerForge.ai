'use client';

import { motion } from 'framer-motion';

interface LegalHeroProps {
  title: string;
  lastUpdated: string;
}

export default function LegalHero({ title, lastUpdated }: LegalHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="pt-10 pb-10 sm:pt-14 sm:pb-14 text-center"
    >
      <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight gradient-text">
        {title}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground font-body">
        {lastUpdated}
      </p>
    </motion.div>
  );
}
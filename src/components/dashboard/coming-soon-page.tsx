'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ComingSoonPageProps {
  /** i18n namespace key, e.g. "resumeBuilder" */
  featureKey: string;
  /** Override icon (defaults to Construction) */
  icon?: React.ElementType;
}

export default function ComingSoonPage({ featureKey, icon: Icon = Construction }: ComingSoonPageProps) {
  const t = useTranslations('dashboard.comingSoon');
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center mb-6"
      >
        <Icon className="w-9 h-9 text-brand" />
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4, type: 'spring' }}
        >
          <Construction className="w-3 h-3 text-white" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-2xl font-bold font-heading text-foreground mb-2"
      >
        {t(`${featureKey}.title`)}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-muted-foreground max-w-md mb-8 font-body leading-relaxed"
      >
        {t(`${featureKey}.description`)}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="outline"
          onClick={() => router.push('/home')}
          className="gap-2 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToDashboard')}
        </Button>
      </motion.div>
    </motion.div>
  );
}
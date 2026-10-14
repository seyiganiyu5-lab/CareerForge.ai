'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import { useTranslations } from '@/i18n/provider';

interface ResumeEmptyStateProps {
  error: string | null;
  onCreateResume: () => Promise<string | null>;
}

export function ResumeEmptyState({ error, onCreateResume }: ResumeEmptyStateProps) {
  const router = useRouter();
  const t = useTranslations('app.resumeEditor');
  const tc = useTranslations('app.common');
  const [creating, setCreating] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(error === 'limit_reached');

  const handleCreate = async () => {
    setCreating(true);
    const id = await onCreateResume();
    setCreating(false);
    if (id) {
      window.location.hash = `#resume=${id}`;
    }
  };

  if (error === 'limit_reached') {
    return (
      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        featureName={t('resumeBuilderFeature')}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <div className="mb-6 flex size-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
          <FileText className="size-9 text-muted-foreground/60" aria-hidden="true" />
        </div>

        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {t('emptyTitle')}
        </h2>

        <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
          {t('emptyBody')}
        </p>

        <div className="flex items-center gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/resume-builder')}
            className="font-body"
          >
            <ArrowLeft className="size-4 mr-2" />
            {t('myResumes')}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand/50 font-body"
            size="lg"
          >
            {creating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="size-4 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            {creating ? tc('creating') : t('newResume')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
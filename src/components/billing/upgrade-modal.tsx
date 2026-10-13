'use client';

import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { Sparkles, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  onClose?: () => void;
}

const contentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

const iconContainerVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 },
  },
};

export function UpgradeModal({ open, onOpenChange, featureName, onClose }: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onOpenChange(false);
    onClose?.();
    router.push('/billing');
  };

  const handleMaybeLater = () => {
    onOpenChange(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
      >
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate={open ? 'visible' : 'exit'}
        >
          <DialogHeader className="text-center sm:text-center">
            <motion.div
              className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-brand/10"
              variants={iconContainerVariants}
              initial="hidden"
              animate={open ? 'visible' : 'hidden'}
            >
              {featureName ? (
                <Lock className="size-7 text-brand" aria-hidden="true" />
              ) : (
                <Sparkles className="size-7 text-brand" aria-hidden="true" />
              )}
            </motion.div>

            <DialogTitle className="text-2xl font-heading font-semibold tracking-tight">
              Upgrade to Pro
            </DialogTitle>

            <DialogDescription className="text-sm font-body">
              Premium Feature
            </DialogDescription>
          </DialogHeader>

          <div className="px-2 py-2 text-center">
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              {featureName ? (
                <>
                  Unlock{' '}
                  <span className="font-semibold text-foreground">{featureName}</span>{' '}
                  and all other Pro features.
                </>
              ) : (
                'This feature is available on the Pro plan. Unlock AI-powered resume tools, ATS optimization, unlimited documents, and more.'
              )}
            </p>

            {/* Feature highlights */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="list" aria-label="Pro plan features">
              {[
                { label: 'AI Resume Tools', icon: '🤖' },
                { label: 'ATS Optimization', icon: '✅' },
                { label: 'Unlimited Docs', icon: '📄' },
              ].map((feature) => (
                <div
                  key={feature.label}
                  role="listitem"
                  className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2"
                >
                  <span className="text-base" aria-hidden="true">{feature.icon}</span>
                  <span className="font-body text-xs font-medium text-foreground">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2 flex-col gap-3 sm:flex-col">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand/50 sm:text-sm"
              size="lg"
              aria-label="Upgrade to Pro plan now"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Upgrade Now
            </Button>
            <Button
              variant="outline"
              onClick={handleMaybeLater}
              className="w-full font-body"
              size="lg"
              aria-label="Close upgrade dialog and continue with free plan"
            >
              Maybe Later
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
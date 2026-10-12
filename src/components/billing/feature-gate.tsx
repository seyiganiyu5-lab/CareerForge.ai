'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import type { FeatureKey } from '@/lib/subscription/features';
import { FEATURE_DISPLAY_INFO } from '@/lib/subscription/features';
import { useUsage } from '@/lib/usage/context';

interface FeatureGateProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAccessDenied?: () => void;
}

export function FeatureGate({ featureKey, children, fallback, onAccessDenied }: FeatureGateProps) {
  const { data: usageData, isLoading, canAccess } = useUsage();

  const featureLabel = FEATURE_DISPLAY_INFO[featureKey]?.label ?? featureKey;

  // Use shared context — no separate API call needed
  // During loading, show skeleton
  if (isLoading) {
    return <FeatureGateSkeleton />;
  }

  const allowed = canAccess(featureKey as FeatureKey);

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Use the locked card state for denied access
  return (
    <LockedCard
      featureLabel={featureLabel}
      onAccessDenied={onAccessDenied}
    />
  );
}

// Separate component for the locked state to avoid re-rendering the provider
function LockedCard({ featureLabel, onAccessDenied }: { featureLabel: string; onAccessDenied?: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card className="border-dashed" role="region" aria-label={`${featureLabel} - Premium feature locked`}>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand/10">
            <Lock className="size-6 text-brand" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold">
              Premium Feature
            </h3>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              This feature requires a Pro plan
            </p>
          </div>
          <Button
            onClick={() => { setModalOpen(true); onAccessDenied?.(); }}
            className="bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand/50"
            aria-label={`Upgrade to Pro to access ${featureLabel}`}
          >
            <Lock className="size-4" aria-hidden="true" />
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>

      <UpgradeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        featureName={featureLabel}
      />
    </>
  );
}

function FeatureGateSkeleton() {
  return (
    <Card role="status" aria-label="Loading feature access check">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <div className="size-14 rounded-full bg-muted animate-pulse" aria-hidden="true" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" aria-hidden="true" />
          <div className="h-4 w-48 rounded bg-muted animate-pulse" aria-hidden="true" />
        </div>
        <div className="h-10 w-36 rounded bg-muted animate-pulse" aria-hidden="true" />
      </CardContent>
    </Card>
  );
}

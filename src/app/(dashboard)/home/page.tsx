'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Eagerly load the light, above-the-fold components
import WelcomeHero from '@/components/dashboard/welcome-hero';
import QuickActions from '@/components/dashboard/quick-actions';

// Dynamically import heavier / below-the-fold components with loading skeletons
const SubscriptionCard = dynamic(
  () => import('@/components/billing/subscription-card'),
  { ssr: false }
);
const JobTrackerPreview = dynamic(
  () => import('@/components/dashboard/job-tracker-preview'),
  { ssr: false }
);
const AIInsights = dynamic(
  () => import('@/components/dashboard/ai-insights'),
  { ssr: false }
);

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm p-6 space-y-3">
      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
      <div className="h-4 w-full bg-muted rounded animate-pulse" />
      <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WelcomeHero />
        </div>
        <div>
          <Suspense fallback={<CardSkeleton />}>
            <SubscriptionCard />
          </Suspense>
        </div>
      </div>
      <QuickActions />
      <Suspense fallback={<CardSkeleton />}>
        <JobTrackerPreview />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <AIInsights />
      </Suspense>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Crown, ArrowRight, Settings2, FileText, Mail } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsage } from '@/lib/usage/context';

interface SubscriptionData {
  id: string;
  plan: {
    id: string;
    name: string;
    display_name: string;
    price_monthly: number;
    price_yearly: number;
    currency: string;
  };
  status: string;
  billing_cycle: string;
  started_at: string | null;
  expires_at: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
}

const FREE_LIMITS = { resumes: 1, cover_letters: 3 };

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: 'bg-muted text-muted-foreground border-muted-foreground/20',
  pro: 'bg-brand/10 text-brand border-brand/20',
  enterprise: 'bg-emerald/10 text-emerald border-emerald/20',
};

export default function SubscriptionCard() {
  const router = useRouter();
  const { data: usageData, isLoading } = useUsage();

  const planName = usageData?.planName ?? 'free';
  const planDisplayName = planName === 'free' ? 'Free' : planName.charAt(0).toUpperCase() + planName.slice(1);
  const isFree = planName === 'free';

  const resumeCount = usageData?.raw?.resume_count ?? 0;
  const coverLetterCount = usageData?.raw?.cover_letter_count ?? 0;
  const resumeLimit = usageData?.usage?.resumes?.limit ?? FREE_LIMITS.resumes;
  const coverLetterLimit = usageData?.usage?.cover_letters?.limit ?? FREE_LIMITS.cover_letters;
  const resumePercent = resumeLimit > 0 ? Math.min((resumeCount / resumeLimit) * 100, 100) : 0;
  const coverLetterPercent = coverLetterLimit > 0 ? Math.min((coverLetterCount / coverLetterLimit) * 100, 100) : 0;

  const handleAction = () => {
    router.push('/billing');
  };

  if (isLoading) {
    return <SubscriptionCardSkeleton />;
  }

  return (
    <div>
      <Card role="region" aria-label="Subscription overview">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-base">
              Your Plan
            </CardTitle>
            <Badge
              variant="outline"
              className={`font-body text-[11px] font-semibold uppercase tracking-wider ${PLAN_BADGE_STYLES[planName] ?? 'bg-muted text-muted-foreground'}`}
            >
              {planDisplayName}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="gap-5">
          {isFree ? (
            <>
              {/* Free plan usage bars */}
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                      <FileText className="size-3.5" aria-hidden="true" />
                      Resumes
                    </span>
                    <span className="font-body text-xs font-medium tabular-nums">
                      {resumeCount}/{resumeLimit}
                    </span>
                  </div>
                  <Progress
                    value={resumePercent}
                    className={`h-2 ${resumePercent >= 100 ? '[&>[data-slot=progress-indicator]]:bg-destructive' : '[&>[data-slot=progress-indicator]]:bg-brand'}`}
                    aria-label={`Resumes used: ${resumeCount} of ${resumeLimit}`}
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                      <Mail className="size-3.5" aria-hidden="true" />
                      Cover Letters
                    </span>
                    <span className="font-body text-xs font-medium tabular-nums">
                      {coverLetterCount}/{coverLetterLimit}
                    </span>
                  </div>
                  <Progress
                    value={coverLetterPercent}
                    className={`h-2 ${coverLetterPercent >= 100 ? '[&>[data-slot=progress-indicator]]:bg-destructive' : '[&>[data-slot=progress-indicator]]:bg-brand'}`}
                    aria-label={`Cover letters used: ${coverLetterCount} of ${coverLetterLimit}`}
                  />
                </div>
              </div>

              {/* Upgrade prompt */}
              <div className="rounded-lg bg-brand/5 px-4 py-3 dark:bg-brand/10">
                <p className="font-body text-sm text-muted-foreground">
                  {resumePercent >= 100 || coverLetterPercent >= 100
                    ? 'You\'ve reached your free limit. Upgrade for unlimited access.'
                    : 'Upgrade for unlimited docs, AI tools, and more.'}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-lg bg-emerald/5 px-4 py-3 dark:bg-emerald/10">
              <div className="flex items-center gap-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-emerald/20">
                  <Crown className="size-3 text-emerald" aria-hidden="true" />
                </div>
                <p className="font-body text-sm font-medium text-emerald">
                  {planDisplayName === 'Enterprise' ? 'Enterprise plan active' : 'Pro plan active'}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {isFree ? (
            <Button
              onClick={handleAction}
              className="w-full bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand/50"
              aria-label="Upgrade your subscription plan"
            >
              <Crown className="size-4" aria-hidden="true" />
              Upgrade
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleAction}
              className="w-full font-body"
              aria-label="Manage your subscription settings"
            >
              <Settings2 className="size-4" aria-hidden="true" />
              Manage Subscription
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function SubscriptionCardSkeleton() {
  return (
    <Card role="status" aria-label="Loading subscription information">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" aria-hidden="true" />
          <Skeleton className="h-6 w-16 rounded-md" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="gap-5">
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Skeleton className="h-4 w-24" aria-hidden="true" />
              <Skeleton className="h-3 w-10" aria-hidden="true" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" aria-hidden="true" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Skeleton className="h-4 w-28" aria-hidden="true" />
              <Skeleton className="h-3 w-10" aria-hidden="true" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" aria-hidden="true" />
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-lg" aria-hidden="true" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" aria-hidden="true" />
      </CardFooter>
    </Card>
  );
}

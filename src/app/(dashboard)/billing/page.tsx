'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { FadeInUp, ScaleIn, FadeIn, StaggerItem } from '@/lib/motion';
import { useAuth } from '@/lib/auth/context';
import { useUsage } from '@/lib/usage/context';
import { useLocale, useTranslations } from '@/i18n/provider';
import { FEATURE_DISPLAY_INFO, FEATURE_KEYS } from '@/lib/subscription/features';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  ArrowRight,
  AlertTriangle,
  Crown,
  Sparkles,
  Building2,
  Receipt,
  Loader2,
  FileText,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface PlanFeature {
  key: string;
  enabled: boolean;
  limit: number | null;
}

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  description: string;
  features: PlanFeature[];
}

interface Subscription {
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
  billing_cycle: string | null;
  started_at: string | null;
  expires_at: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
}

interface UsageEntry {
  limit: number;
  used: number;
  enabled: boolean;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_reference: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  plan_name: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_ORDER = ['free', 'pro', 'enterprise'] as const;
type PlanName = (typeof PLAN_ORDER)[number];

function getPlanTier(planName: string): number {
  const idx = PLAN_ORDER.indexOf(planName.toLowerCase() as PlanName);
  return idx >= 0 ? idx : 0;
}

function formatPrice(cents: number, currency: string = 'USD', locale = 'en-US'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string | null, locale = 'en-US', notAvailable = 'N/A'): string {
  if (!dateStr) return notAvailable;
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(dateStr: string | null, locale = 'en-US'): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getFeatureLimitText(feature: PlanFeature): string {
  if (!feature.enabled) return '';
  if (feature.limit === null || feature.limit === -1 || feature.limit === 0) return 'Unlimited';
  return String(feature.limit);
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Sparkles className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  enterprise: <Building2 className="w-5 h-5" />,
};

const PLAN_COLORS: Record<string, string> = {
  free: 'text-muted-foreground',
  pro: 'text-brand',
  enterprise: 'text-amber-600 dark:text-amber-400',
};

// ── Animation ───────────────────────────────────────────────────────────────

// Replaced framer-motion variants with CSS animation components from @/lib/motion

// ── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-full mt-2" />
        <Separator className="my-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <ScaleIn
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold font-heading text-foreground">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 font-body max-w-sm">
        {description}
      </p>
    </ScaleIn>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function BillingPage() {
  useAuth(); // ensures session is active
  const t = useTranslations('app.billing');
  const tc = useTranslations('app.common');
  const tf = useTranslations('app.features');
  const { locale } = useLocale();
  const numLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  const fmtPrice = (cents: number, currency?: string) => formatPrice(cents, currency, numLocale);
  const fmtDate = (d: string | null) => formatDate(d, numLocale, t('notAvailable'));
  const fmtShortDate = (d: string | null) => formatShortDate(d, numLocale);
  const planLabel = (name: string, fallback: string) => (['free', 'pro', 'enterprise'].includes(name.toLowerCase()) ? t(`planName_${name.toLowerCase()}`) : fallback);
  const planDesc = (name: string, fallback: string) => (['free', 'pro', 'enterprise'].includes(name.toLowerCase()) ? t(`planDesc_${name.toLowerCase()}`) : fallback);
  const getFeatureLabel = (key: string) => (FEATURE_DISPLAY_INFO[key] ? tf(key) : key.replace(/_/g, ' '));

  // State
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Record<string, UsageEntry>>({});
  const [rawUsage, setRawUsage] = useState<Record<string, number>>({});
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const currentPlanName = subscription?.plan.name.toLowerCase() as PlanName || 'free';
  const currentTier = getPlanTier(currentPlanName);
  const isCancelled = subscription?.status === 'cancelled';
  const isFree = currentPlanName === 'free';

  const { refetch: refetchPlan } = useUsage();

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, usageRes, paymentsRes] = await Promise.all([
        fetch('/api/subscriptions/me', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/billing/plans', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/usage/me', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/payments/history', { credentials: 'include' }).then(r => r.json()),
      ]);

      if (subRes.success) setSubscription(subRes.subscription);
      if (plansRes.success) setPlans(plansRes.plans);
      if (usageRes.success) {
        setUsage(usageRes.usage || {});
        setRawUsage(usageRes.raw || {});
      }
      if (paymentsRes.success) setPayments(paymentsRes.payments || []);
      // Plan may have just changed: refresh it for the rest of the app
      // (sidebar Pro badges, locked features)
      refetchPlan();
    } catch {
      toast.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [refetchPlan]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Flutterwave sends the user back here with ?status=...&tx_ref=...&transaction_id=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txRef = params.get('tx_ref');
    if (!txRef) return;
    window.history.replaceState(null, '', window.location.pathname);

    if (params.get('status') === 'cancelled') {
      toast.info(t('paymentCancelled'));
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tx_ref: txRef, transaction_id: params.get('transaction_id') }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(t('paymentReceived'));
          await fetchAllData();
        } else {
          toast.error(data.error || t('paymentNotConfirmed'));
        }
      } catch {
        toast.error(t('paymentCheckFailed'));
      }
    })();
  }, [fetchAllData]);

  // Handlers
  const handleUpgrade = async (planId: string, planDisplayName: string) => {
    setUpgrading(planId);
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: isYearly ? 'yearly' : 'monthly' }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.payment_link) {
          window.location.href = data.payment_link;
        } else {
          toast.success(data.message || t('upgradedTo', { plan: planDisplayName }));
          await fetchAllData();
        }
      } else {
        toast.error(data.error || t('upgradeFailed'));
      }
    } catch {
      toast.error(tc('somethingWrong'));
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediate: true }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t('downgraded'));
        setCancelDialogOpen(false);
        await fetchAllData();
      } else {
        toast.error(data.error || t('cancelFailed'));
      }
    } catch {
      toast.error(tc('somethingWrong'));
    } finally {
      setCancelling(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  // Collect all feature keys from all plans for the comparison table
  const allFeatureKeys = Array.from(
    new Set(plans.flatMap(p => p.features.map(f => f.key)))
  ).filter(key => FEATURE_DISPLAY_INFO[key]);

  return (
    <div
      className="space-y-8"
    >
      {/* Page Header */}
      <FadeInUp duration={0.5}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm font-body">
          {t('subtitle')}
        </p>
      </FadeInUp>

      {/* ── 1. Current Plan Section ────────────────────────────────────────── */}
      <FadeInUp delay={0.08} duration={0.5}>
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`rounded-xl p-3 ${isFree ? 'bg-muted' : 'bg-brand/10'}`}>
                  <span className={PLAN_COLORS[currentPlanName] || 'text-brand'}>
                    {PLAN_ICONS[currentPlanName] || <CreditCard className="w-5 h-5" />}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-semibold font-heading text-foreground">
                      {subscription ? planLabel(subscription.plan.name, subscription.plan.display_name) : t('freePlan')}
                    </h2>
                    <Badge
                      variant={isCancelled ? 'destructive' : 'secondary'}
                      className={
                        !isCancelled && !isFree
                          ? 'bg-brand/10 text-brand border-brand/20'
                          : ''
                      }
                    >
                      {isCancelled ? t('statusCancelled') : subscription?.status === 'active' || !subscription ? t('statusActive') : subscription.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-body mt-0.5">
                    {isFree
                      ? t('freeNote')
                      : isCancelled && subscription?.current_period_end
                        ? t('expiresOn', { date: fmtDate(subscription.current_period_end) })
                        : t('nextBilling', { date: fmtDate(subscription?.current_period_end || null) })
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isFree ? (
                  <Button
                    className="bg-brand text-white hover:bg-brand/90 font-body rounded-lg"
                    onClick={() => {
                      const proPlan = plans.find(p => p.name === 'pro');
                      if (proPlan) handleUpgrade(proPlan.id, proPlan.display_name);
                    }}
                    disabled={upgrading !== null}
                  >
                    {upgrading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {t('upgrade')}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="font-body rounded-lg"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    {t('changePlan')}
                  </Button>
                )}
              </div>
            </div>

            {/* Cancelled Warning */}
            {isCancelled && subscription?.current_period_end && (
              <FadeIn
                className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium font-body text-amber-700 dark:text-amber-300">
                    {t('expiresOnShort', { date: fmtDate(subscription.current_period_end) })}
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5 font-body">
                    {t('cancelledWarning')}
                  </p>
                </div>
              </FadeIn>
            )}

            {/* Free plan usage bars */}
            {isFree && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    key: FEATURE_KEYS.CREATE_RESUME,
                    rawKey: 'resume_count' as const,
                    label: tf('CREATE_RESUME'),
                    icon: <FileText className="w-4 h-4" />,
                  },
                  {
                    key: FEATURE_KEYS.CREATE_COVER_LETTER,
                    rawKey: 'cover_letter_count' as const,
                    label: tf('CREATE_COVER_LETTER'),
                    icon: <FileText className="w-4 h-4" />,
                  },
                  {
                    key: FEATURE_KEYS.PDF_EXPORT,
                    rawKey: 'exports_count' as const,
                    label: tf('PDF_EXPORT'),
                    icon: <CreditCard className="w-4 h-4" />,
                  },
                ].map(item => {
                  const used = rawUsage[item.rawKey] ?? 0;
                  const limit = usage[item.key]?.limit ?? 1;
                  const pct = Math.min((used / limit) * 100, 100);
                  const isExhausted = used >= limit && limit > 0;

                  return (
                    <div
                      key={item.key}
                      className="rounded-lg border border-border bg-background/50 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.icon}</span>
                          <span className="text-sm font-medium font-body text-foreground">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium font-body ${
                            isExhausted ? 'text-rose-500' : 'text-muted-foreground'
                          }`}
                        >
                          {used}/{limit}
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className={`h-2 ${isExhausted ? '[&>div]:bg-rose-500' : '[&>div]:bg-brand'}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paid plan info row */}
            {!isFree && subscription && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-background/50 p-4">
                  <p className="text-xs text-muted-foreground font-body mb-1">{t('billingCycle')}</p>
                  <p className="text-sm font-medium font-heading text-foreground capitalize">
                    {subscription.billing_cycle === 'yearly' ? t('yearly') : t('monthly')}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-4">
                  <p className="text-xs text-muted-foreground font-body mb-1">{t('periodEnd')}</p>
                  <p className="text-sm font-medium font-heading text-foreground">
                    {fmtShortDate(subscription.current_period_end)}
                  </p>
                </div>
                {subscription.plan.name.toLowerCase() !== 'enterprise' && (
                <div className="rounded-lg border border-border bg-background/50 p-4">
                  <p className="text-xs text-muted-foreground font-body mb-1">{t('planPrice')}</p>
                  <p className="text-sm font-medium font-heading text-foreground">
                    {subscription.billing_cycle === 'yearly'
                      ? `${fmtPrice(subscription.plan.price_yearly, subscription.plan.currency)}${t('perYear')}`
                      : `${fmtPrice(subscription.plan.price_monthly, subscription.plan.currency)}${t('perMonth')}`
                    }
                  </p>
                </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>

      {/* ── 2. Plan Comparison Cards ───────────────────────────────────────── */}
      <FadeInUp delay={0.16} duration={0.5}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground">
              {t('comparePlans')}
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              {t('comparePlansSub')}
            </p>
          </div>
          {/* Monthly / Yearly toggle */}
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium font-body transition-colors ${
                !isYearly ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {t('monthly')}
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label={t('toggleBilling')}
            />
            <span
              className={`text-sm font-medium font-body transition-colors ${
                isYearly ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {t('yearly')}
            </span>
            <Badge className="bg-emerald/10 text-emerald border-emerald/20 text-xs font-body">
              {t('save20')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const planName = plan.name.toLowerCase() as PlanName;
            const tier = getPlanTier(planName);
            const isCurrentPlan = planName === currentPlanName;
            const isHigher = tier > currentTier;
            const isPro = planName === 'pro';
            const isEnterprise = planName === 'enterprise';
            const price = isYearly ? plan.price_yearly : plan.price_monthly;
            const otherPrice = isYearly ? plan.price_monthly : plan.price_yearly;
            const isFreePlan = planName === 'free';

            return (
              <StaggerItem
                key={plan.id}
                delay={0.16 + 0.08 * idx}
                duration={0.45}
                className={`relative rounded-2xl border bg-card flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
                  isPro
                    ? 'border-brand shadow-lg lg:scale-[1.02]'
                    : isCurrentPlan
                      ? 'border-brand/50'
                      : 'border-border'
                }`}
              >
                {/* Popular badge */}
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-medium px-3 py-1 rounded-full font-body z-10">
                    {t('mostPopular')}
                  </span>
                )}

                {/* Card header area */}
                <div className="p-6 pb-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={PLAN_COLORS[planName] || 'text-foreground'}>
                        {PLAN_ICONS[planName] || <CreditCard className="w-5 h-5" />}
                      </span>
                      <h3 className="text-lg font-bold font-heading text-foreground">
                        {planLabel(plan.name, plan.display_name)}
                      </h3>
                    </div>
                    {isCurrentPlan && (
                      <Badge
                        variant="outline"
                        className="border-brand/30 text-brand text-xs font-body"
                      >
                        {t('currentPlan')}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground font-body mt-1">
                    {planDesc(plan.name, plan.description)}
                  </p>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    {isFreePlan ? (
                      <span className="text-4xl font-bold font-heading text-foreground">
                        {t('free')}
                      </span>
                    ) : isEnterprise ? (
                      <span className="text-4xl font-bold font-heading text-foreground">
                        {t('custom')}
                      </span>
                    ) : (
                      <>
                        <span
                          key={isYearly ? 'yearly-price' : 'monthly-price'}
                          className="text-4xl font-bold font-heading text-foreground transition-all duration-200"
                        >
                          {fmtPrice(price, plan.currency)}
                        </span>
                        <span
                          key={isYearly ? 'yearly-period' : 'monthly-period'}
                          className="text-muted-foreground text-sm font-body transition-all duration-200"
                        >
                          {isYearly ? t('perYear') : t('perMonth')}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Yearly savings note */}
                  {!isFreePlan && !isEnterprise && (
                    <p
                      key={isYearly ? 'savings-on' : 'savings-off'}
                      className="text-xs text-muted-foreground font-body mt-1 transition-opacity duration-200"
                    >
                      {isYearly
                        ? t('billedAnnually', { price: fmtPrice(Math.round(price / 12), plan.currency) })
                        : t('orYearly', { price: fmtPrice(plan.price_yearly, plan.currency), savings: fmtPrice(plan.price_monthly * 12 - plan.price_yearly, plan.currency) })
                      }
                    </p>
                  )}

                  <Separator className="my-5" />

                  {/* Feature list */}
                  <ul className="space-y-3">
                    {plan.features
                      .filter(f => FEATURE_DISPLAY_INFO[f.key])
                      .map(feature => {
                        const label = getFeatureLabel(feature.key);
                        const limitText = getFeatureLimitText(feature);

                        return (
                          <li key={feature.key} className="flex items-start gap-2.5">
                            {feature.enabled ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                            )}
                            <span
                              className={`text-sm font-body ${
                                feature.enabled
                                  ? 'text-foreground/90'
                                  : 'text-muted-foreground/50 line-through'
                              }`}
                            >
                              {label}
                              {feature.enabled && limitText && limitText !== 'Unlimited' && (
                                <span className="text-muted-foreground ml-1">({limitText})</span>
                              )}
                              {feature.enabled && limitText === 'Unlimited' && (
                                <span className="text-emerald ml-1 text-xs">({t('unlimited')})</span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>

                {/* CTA button */}
                <div className="p-6 pt-2 mt-auto">
                  {isCurrentPlan ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-lg font-body"
                      disabled
                    >
                      {t('currentPlan')}
                    </Button>
                  ) : isEnterprise ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-lg font-body"
                      onClick={() => toast.info(t('contactSalesToast'))}
                    >
                      {t('contactSales')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : isHigher ? (
                    <Button
                      className={`w-full rounded-lg font-body ${
                        isPro
                          ? 'bg-brand text-white hover:bg-brand/90'
                          : 'bg-foreground text-background hover:bg-foreground/90'
                      }`}
                      onClick={() => handleUpgrade(plan.id, plan.display_name)}
                      disabled={upgrading !== null}
                    >
                      {upgrading === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {t('upgradeTo', { plan: planLabel(plan.name, plan.display_name) })}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full rounded-lg font-body text-rose-500 border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-600"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      {t('downgrade')}
                    </Button>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </div>
      </FadeInUp>

      {/* ── 3. Payment History ─────────────────────────────────────────────── */}
      <FadeInUp delay={0.24} duration={0.5}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="font-heading">
                {t('paymentHistory')}
              </CardTitle>
            </div>
            <CardDescription className="font-body">
              {t('paymentHistorySub')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title={t('noPayments')}
                description={t('noPaymentsSub')}
              />
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('colDate')}
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('colPlan')}
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('colAmount')}
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('colStatus')}
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        {t('colMethod')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr
                        key={payment.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3.5 px-3 text-foreground">
                          {fmtShortDate(payment.paid_at || payment.created_at)}
                        </td>
                        <td className="py-3.5 px-3 text-foreground font-medium">
                          {payment.plan_name}
                        </td>
                        <td className="py-3.5 px-3 text-foreground">
                          {fmtPrice(payment.amount, payment.currency)}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            variant={
                              payment.status === 'successful'
                                ? 'secondary'
                                : payment.status === 'pending'
                                  ? 'outline'
                                  : 'destructive'
                            }
                            className={
                              payment.status === 'successful'
                                ? 'bg-emerald/10 text-emerald border-emerald/20'
                                : ''
                            }
                          >
                            {payment.status === 'successful'
                              ? t('paid')
                              : payment.status === 'pending'
                                ? t('pending')
                                : payment.status === 'failed'
                                  ? t('failed')
                                  : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
                            }
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground capitalize hidden md:table-cell">
                          {payment.payment_method || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>

      {/* ── Cancel / Downgrade Dialog ──────────────────────────────────────── */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {t('downgradeTitle')}
            </DialogTitle>
            <DialogDescription className="font-body">
              {t('downgradeBody', { plan: subscription ? planLabel(subscription.plan.name, subscription.plan.display_name) : t('yourCurrentPlan') })}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-700 dark:text-rose-300 font-body">
                <strong>{t('whatYouLose')}</strong> {t('whatYouLoseList')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-lg font-body"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
            >
              {t('keepPlan')}
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg font-body"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('downgradeToFree')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
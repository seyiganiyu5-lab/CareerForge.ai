import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const PLANS = [
  {
    name: 'free',
    display_name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
    billing_cycle: 'monthly',
    description: 'Get started with basic resume building tools',
    sort_order: 0,
    is_active: true,
  },
  {
    name: 'pro',
    display_name: 'Pro',
    price_monthly: 799,
    price_yearly: 7999,
    currency: 'USD',
    billing_cycle: 'monthly',
    description: 'Unlock AI-powered tools and unlimited documents',
    sort_order: 1,
    is_active: true,
  },
  {
    name: 'enterprise',
    display_name: 'Enterprise',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
    billing_cycle: 'monthly',
    description: 'Team management, analytics, and custom branding',
    sort_order: 2,
    is_active: true,
  },
];

const FEATURES: Record<string, { key: string; enabled: boolean; limit: number }[]> = {
  free: [
    { key: 'CREATE_RESUME', enabled: true, limit: 1 },
    { key: 'CREATE_COVER_LETTER', enabled: true, limit: 3 },
    { key: 'TEMPLATES', enabled: true, limit: 3 },
    { key: 'PDF_EXPORT', enabled: true, limit: 3 },
    { key: 'BASIC_ATS_SCORE', enabled: true, limit: -1 },
    { key: 'AI_RESUME_BUILDER', enabled: true, limit: 3 },
    { key: 'AI_COVER_LETTER', enabled: false, limit: 0 },
    { key: 'AI_RESUME_REVIEW', enabled: false, limit: 0 },
    { key: 'ATS_CHECKER', enabled: false, limit: 0 },
    { key: 'JOB_TRACKER', enabled: false, limit: 0 },
    { key: 'DOCX_EXPORT', enabled: false, limit: 0 },
    { key: 'VERSION_HISTORY', enabled: false, limit: 0 },
    { key: 'AI_REQUESTS', enabled: true, limit: 3 },
  ],
  pro: [
    { key: 'CREATE_RESUME', enabled: true, limit: -1 },
    { key: 'CREATE_COVER_LETTER', enabled: true, limit: -1 },
    { key: 'TEMPLATES', enabled: true, limit: -1 },
    { key: 'PDF_EXPORT', enabled: true, limit: -1 },
    { key: 'BASIC_ATS_SCORE', enabled: true, limit: -1 },
    { key: 'AI_RESUME_BUILDER', enabled: true, limit: -1 },
    { key: 'AI_COVER_LETTER', enabled: true, limit: -1 },
    { key: 'AI_RESUME_REVIEW', enabled: true, limit: -1 },
    { key: 'ATS_CHECKER', enabled: true, limit: -1 },
    { key: 'JOB_TRACKER', enabled: true, limit: -1 },
    { key: 'DOCX_EXPORT', enabled: true, limit: -1 },
    { key: 'VERSION_HISTORY', enabled: true, limit: -1 },
    { key: 'AI_REQUESTS', enabled: true, limit: 100 },
  ],
  enterprise: [
    { key: 'CREATE_RESUME', enabled: true, limit: -1 },
    { key: 'CREATE_COVER_LETTER', enabled: true, limit: -1 },
    { key: 'TEMPLATES', enabled: true, limit: -1 },
    { key: 'PDF_EXPORT', enabled: true, limit: -1 },
    { key: 'BASIC_ATS_SCORE', enabled: true, limit: -1 },
    { key: 'AI_RESUME_BUILDER', enabled: true, limit: -1 },
    { key: 'AI_COVER_LETTER', enabled: true, limit: -1 },
    { key: 'AI_RESUME_REVIEW', enabled: true, limit: -1 },
    { key: 'ATS_CHECKER', enabled: true, limit: -1 },
    { key: 'JOB_TRACKER', enabled: true, limit: -1 },
    { key: 'DOCX_EXPORT', enabled: true, limit: -1 },
    { key: 'VERSION_HISTORY', enabled: true, limit: -1 },
    { key: 'AI_REQUESTS', enabled: true, limit: -1 },
    { key: 'TEAM_MANAGEMENT', enabled: true, limit: -1 },
    { key: 'RECRUITER_DASHBOARD', enabled: true, limit: -1 },
    { key: 'COMPANY_BRANDING', enabled: true, limit: -1 },
    { key: 'ANALYTICS', enabled: true, limit: -1 },
    { key: 'MULTIPLE_WORKSPACES', enabled: true, limit: -1 },
    { key: 'API_ACCESS', enabled: true, limit: -1 },
  ],
};

async function seed() {
  console.log('🌱 Seeding plans and features...');

  // Clear existing
  await db.planFeature.deleteMany();
  await db.payment.deleteMany();
  await db.userUsage.deleteMany();
  await db.subscription.deleteMany();
  await db.plan.deleteMany();

  for (const planData of PLANS) {
    const plan = await db.plan.create({
      data: {
        ...planData,
        features: JSON.stringify(FEATURES[planData.name].map(f => f.key)),
      },
    });

    for (const feature of FEATURES[planData.name]) {
      await db.planFeature.create({
        data: {
          plan_id: plan.id,
          feature_key: feature.key,
          enabled: feature.enabled,
          limit_value: feature.limit,
        },
      });
    }

    console.log(`  ✅ Plan: ${plan.display_name} with ${FEATURES[planData.name].length} features`);
  }

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
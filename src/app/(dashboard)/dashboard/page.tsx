'use client';

import { motion } from 'framer-motion';
import WelcomeHero from '@/components/dashboard/welcome-hero';
import QuickActions from '@/components/dashboard/quick-actions';
import StatsCards from '@/components/dashboard/stats-cards';
import RecentDocuments from '@/components/dashboard/recent-documents';
import ActivityTimeline from '@/components/dashboard/activity-timeline';
import AIInsights from '@/components/dashboard/ai-insights';
import JobTrackerPreview from '@/components/dashboard/job-tracker-preview';
import TemplatesCarousel from '@/components/dashboard/templates-carousel';
import CareerTips from '@/components/dashboard/career-tips';

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <WelcomeHero />
      <QuickActions />
      <StatsCards />

      {/* Two-column: Documents + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RecentDocuments />
        </div>
        <div className="lg:col-span-2">
          <ActivityTimeline />
        </div>
      </div>

      <AIInsights />

      {/* Two-column: Job Tracker + Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobTrackerPreview />
        <TemplatesCarousel />
      </div>

      <CareerTips />
    </div>
  );
}
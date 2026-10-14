'use client';

import Navbar from '@/components/landing/navbar';
import Hero from '@/components/landing/hero';
import HowItWorks from '@/components/landing/how-it-works';
import Features from '@/components/landing/features';
import Templates from '@/components/landing/templates';
import AIFeatures from '@/components/landing/ai-features';
import ATSChecker from '@/components/landing/ats-checker';
import Statistics from '@/components/landing/statistics';
import Pricing from '@/components/landing/pricing';
import FAQ from '@/components/landing/faq';
import LandingNewsletter from '@/components/landing/newsletter';
import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Templates />
        <AIFeatures />
        <ATSChecker />
        <Statistics />
        <Pricing />
        <FAQ />
        <LandingNewsletter />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
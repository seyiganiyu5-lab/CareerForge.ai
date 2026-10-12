import type { Metadata } from 'next';
import HelpCenterContent from './help-center-content';

export const metadata: Metadata = {
  title: 'Help Center | CareerForge AI',
  description: 'Find answers to common questions about CareerForge AI. Browse our knowledge base for help with resume building, cover letters, ATS optimization, and more.',
  alternates: {
    canonical: '/help',
  },
};

export default function HelpPage() {
  return <HelpCenterContent />;
}
import type { Metadata } from 'next';
import TermsOfServiceContent from '@/components/legal/terms-of-service-content';

export const metadata: Metadata = {
  title: 'Terms of Service | CareerForge AI',
  description: 'Read the Terms of Service for CareerForge AI. Understand your rights and obligations when using our AI-powered career platform.',
};

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
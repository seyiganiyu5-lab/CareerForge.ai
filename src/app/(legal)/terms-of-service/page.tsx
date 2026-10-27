import type { Metadata } from 'next';
import TermsOfServiceContent from '@/components/legal/terms-of-service-content';

export const metadata: Metadata = {
  title: 'Terms of Service | Hassify',
  description: 'Read the Terms of Service for Hassify. Understand your rights and obligations when using our AI-powered career platform.',
};

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
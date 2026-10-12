import type { Metadata } from 'next';
import PrivacyPolicyContent from '@/components/legal/privacy-policy-content';

export const metadata: Metadata = {
  title: 'Privacy Policy | CareerForge AI',
  description: 'Learn how CareerForge AI collects, uses, and protects your personal information. Our privacy policy explains our data practices and your rights.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
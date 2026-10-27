import type { Metadata } from 'next';
import PrivacyPolicyContent from '@/components/legal/privacy-policy-content';

export const metadata: Metadata = {
  title: 'Privacy Policy | Hassify',
  description: 'Learn how Hassify collects, uses, and protects your personal information. Our privacy policy explains our data practices and your rights.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
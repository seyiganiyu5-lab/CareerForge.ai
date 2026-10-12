import { Suspense } from 'react';
import AuthLayout from '@/components/auth/auth-layout';

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout><Suspense>{children}</Suspense></AuthLayout>;
}
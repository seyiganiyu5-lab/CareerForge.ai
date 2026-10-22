'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Join link opened while signed out; picked up after signing up or logging in */
export const PENDING_JOIN_KEY = 'cf-pending-join';

/** In the dashboard: takes the person back to the join link they opened before signing up */
export default function PendingJoin() {
  const router = useRouter();
  useEffect(() => {
    let code: string | null = null;
    try {
      code = localStorage.getItem(PENDING_JOIN_KEY);
      if (code) localStorage.removeItem(PENDING_JOIN_KEY);
    } catch { /* private mode */ }
    if (code && /^[A-Za-z0-9_-]{1,64}$/.test(code)) router.push(`/join/${code}`);
  }, [router]);
  return null;
}

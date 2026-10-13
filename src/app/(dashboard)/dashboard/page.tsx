import { redirect } from 'next/navigation';

// The dashboard lives at /home; keep old /dashboard links working
export default function DashboardPage() {
  redirect('/home');
}

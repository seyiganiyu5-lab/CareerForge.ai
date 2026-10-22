import DashboardShell from '@/components/dashboard/dashboard-shell';
import PendingJoin from '@/components/enterprise/pending-join';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <PendingJoin />
      {children}
    </DashboardShell>
  );
}
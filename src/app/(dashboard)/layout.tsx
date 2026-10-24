import DashboardShell from '@/components/dashboard/dashboard-shell';
import PendingJoin from '@/components/enterprise/pending-join';
import OrgTheme from '@/components/enterprise/org-theme';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <PendingJoin />
      <OrgTheme />
      {children}
    </DashboardShell>
  );
}
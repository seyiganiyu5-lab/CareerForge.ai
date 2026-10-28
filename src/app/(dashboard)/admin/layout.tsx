import AdminGate from '@/components/admin/admin-gate';

/** Every admin page needs a site admin who has entered their authenticator code */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}

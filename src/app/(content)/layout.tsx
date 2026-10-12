import ContentNavbar from '@/components/content/content-navbar';
import ContentFooter from '@/components/content/content-footer';

export default function ContentLayout({
  children,
  activeSection,
}: {
  children: React.ReactNode;
  activeSection?: 'help' | 'blog';
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ContentNavbar activeSection={activeSection} />
      <main className="flex-1">{children}</main>
      <ContentFooter />
    </div>
  );
}
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import Sidebar from './sidebar';
import TopNav from './top-nav';
import MobileDrawer from './mobile-drawer';

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 72;
const MOBILE_BREAKPOINT = 768;

function getIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(() => getIsMobile());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && !getIsMobile()) {
      return localStorage.getItem('cf-sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Guard against redirect loops — only redirect once per mount
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(getIsMobile());
      if (!getIsMobile()) setMobileDrawerOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Persist sidebar state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('cf-sidebar-collapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isMobile]);

  // Session is already refreshed by AuthProvider on mount with 5min cache.
  // No need for an additional forced refresh here — this was causing 5s+ delays
  // on every navigation due to redundant network requests.

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  // Client-side redirect to login when session loaded and not authenticated
  // Use a ref guard to prevent rapid redirect loops
  // Delay 500ms to give session checks time to complete (important after signup)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  // Not authenticated — redirect triggered by useEffect above
  // Show nothing while still loading initially
  if (isLoading) {
    return null;
  }
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          pathname={pathname}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer
          open={mobileDrawerOpen}
          onClose={closeMobileDrawer}
          pathname={pathname}
        />
      )}

      {/* Main Content Area */}
      <div
        className="min-h-screen transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: isMobile ? 0 : sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      >
        <TopNav
          isMobile={isMobile}
          onMenuClick={() => setMobileDrawerOpen(true)}
        />
        <main className="p-4 md:p-6 lg:p-8 pt-4 md:pt-6 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
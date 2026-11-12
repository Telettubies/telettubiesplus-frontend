import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '@/shared/hooks/useAuth';
import { GuidedTourProvider } from '../tour/GuidedTourProvider';
import { TransversalIncidentOverlay, OfflineReadOnlyBanner } from '../modals/ConfirmModal';
import { ROUTE_PATHS } from '@/routes/routePaths';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'criterio_sidebar_collapsed';

interface MainLayoutProps {
  children: React.ReactNode;
  breadcrumbCategory?: string;
  breadcrumbCurrent?: string;
  hideNavbar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  breadcrumbCategory,
  breadcrumbCurrent,
  hideNavbar = false,
}) => {
  const { user, switchDemoRole, transversalModal, setTransversalModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--sidebar-width',
        hideNavbar ? '0px' : sidebarCollapsed ? '68px' : '240px'
      );
    }
  }, [sidebarCollapsed, hideNavbar]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
        }
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  };

  const handleTourNavigate = (route: string) => {
    if (route.startsWith('/configuracion') && user?.rol !== 'administrador') {
      switchDemoRole('administrador');
    }
    navigate(route);
  };

  return (
    <GuidedTourProvider
      autoStart={true}
      pathname={location.pathname + (location.search || '')}
      onNavigate={handleTourNavigate}
    >
      <div className="min-h-screen flex flex-col bg-surface-page dark:bg-[#121212] text-slate-900 dark:text-[#EDEDED] font-sans transition-colors duration-200">
        <OfflineReadOnlyBanner
          active={transversalModal === 'offline_readonly'}
          onRestore={() => setTransversalModal(null)}
        />

        {!hideNavbar && (
          <Navbar
            breadcrumbCategory={breadcrumbCategory}
            breadcrumbCurrent={breadcrumbCurrent}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        )}

        <div
          className={
            !hideNavbar
              ? `pt-14 lg:pt-0 ${sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-60'} flex-1 flex flex-col transition-[padding-left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]`
              : 'flex-1 flex flex-col'
          }
        >
          <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
            <div key={location.pathname} className="soft-page-enter soft-stagger">
              {children}
            </div>
          </main>
        </div>

        <TransversalIncidentOverlay
          mode={
            transversalModal === 'offline_readonly'
              ? null
              : transversalModal
          }
          onClose={() => setTransversalModal(null)}
          onNavigatePortfolio={() => navigate(ROUTE_PATHS.TENDERS_LIST)}
          onNavigateLogin={() =>
            navigate(
              `${ROUTE_PATHS.LOGIN}?expired=1&redirect=${encodeURIComponent(location.pathname)}`
            )
          }
        />
      </div>
    </GuidedTourProvider>
  );
};

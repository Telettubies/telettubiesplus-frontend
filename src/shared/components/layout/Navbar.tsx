import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiUploadCloud,
  FiDatabase,
  FiUsers,
  FiLogOut,
  FiLayers,
  FiShield,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTheme } from '@/shared/hooks/useTheme';
import { ROUTE_PATHS } from '@/routes/routePaths';
import { TYPOGRAPHY } from '../typography/Typography';

export const CriterioLogo: React.FC<{ subtitle?: boolean; size?: 'sm' | 'md' }> = ({
  subtitle = false,
  size = 'sm',
}) => {
  const { isDark } = useTheme();
  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src={isDark ? '/logo criterio white.png' : '/logo criterio.png'}
        alt="Logo CRITERIO"
        className={`${size === 'md' ? 'w-11 h-11' : 'w-9 h-9'} object-contain shrink-0`}
      />
      <div className="leading-tight">
        <span className={`${TYPOGRAPHY.title} text-base tracking-wide block`}>CRITERIO</span>
        {subtitle && <span className={`${TYPOGRAPHY.label} block`}>Analizador de Pliegos</span>}
      </div>
    </div>
  );
};

export const TenderComplyLogo = CriterioLogo;

interface NavbarProps {
  breadcrumbCategory?: string;
  breadcrumbCurrent?: string;
  compactHeader?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  collapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout, switchDemoRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.rol === 'administrador';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  const operationItems = [
    {
      to: ROUTE_PATHS.TENDERS_LIST,
      label: 'Portafolio',
      icon: FiGrid,
      active: location.pathname === ROUTE_PATHS.TENDERS_LIST,
    },
    {
      to: ROUTE_PATHS.TENDER_UPLOAD,
      label: 'Cargar Pliego',
      icon: FiUploadCloud,
      active:
        location.pathname.includes('/nueva') || location.pathname.includes('/progreso'),
    },
    {
      to: '/licitaciones/LP-MIN-001-2026',
      label: 'Matriz y Análisis',
      icon: FiLayers,
      active:
        location.pathname.startsWith('/licitaciones/') &&
        !location.pathname.includes('/nueva') &&
        !location.pathname.includes('/progreso'),
    },
  ];

  const organizationItems = isAdmin
    ? [
        {
          to: ROUTE_PATHS.KNOWLEDGE_BASE,
          label: 'Base de Conocimiento',
          icon: FiDatabase,
          active: location.pathname === ROUTE_PATHS.KNOWLEDGE_BASE,
          testId: 'nav-admin-conocimiento',
        },
        {
          to: ROUTE_PATHS.MEMBERS_MANAGEMENT,
          label: 'Equipo',
          icon: FiUsers,
          active: location.pathname === ROUTE_PATHS.MEMBERS_MANAGEMENT,
          testId: 'nav-admin-miembros',
        },
      ]
    : [];

  const renderSidebarLinks = (compact = false) => (
    <div className="flex flex-col justify-between h-full py-5 px-3 overflow-x-hidden">
      {/* Top: Brand Logo + Navigation */}
      <div className="space-y-6">
        {/* Brand Header inside Left Sidebar */}
        <div
          data-tour="topbar-brand"
          className="pb-4 border-b border-slate-200/80 flex items-center justify-between"
        >
          <Link
            to={ROUTE_PATHS.TENDERS_LIST}
            title="CRITERIO — Analizador de Pliegos"
            className="flex items-center gap-2.5 px-1.5 overflow-hidden whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            <img
              src={isDark ? '/logo criterio white.png' : '/logo criterio.png'}
              alt="Logo CRITERIO"
              className="w-8 h-8 object-contain shrink-0"
            />
            <div
              className={`leading-tight transition-all duration-150 ${
                compact
                  ? 'opacity-0 -translate-x-1 pointer-events-none'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              <span className={`${TYPOGRAPHY.title} text-sm tracking-wide block`}>CRITERIO</span>
              <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                {user?.organizacion_nombre || 'Constructora Andina S.A.S.'}
              </span>
            </div>
          </Link>
        </div>

        {/* Section 1: Operación Licitatoria */}
        <div className="space-y-1.5">
          <div className="h-5 px-3 flex items-center overflow-hidden">
            <p
              className={`uppercase tracking-wider text-[11px] whitespace-nowrap transition-opacity duration-150 ${TYPOGRAPHY.label} ${
                compact ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'
              }`}
            >
              Operación Licitatoria
            </p>
          </div>
          <div className="space-y-1">
            {operationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={compact ? item.label : undefined}
                  aria-label={item.label}
                  className={`flex items-center gap-3 h-10 px-3 rounded-xl overflow-hidden whitespace-nowrap transition-colors duration-150 ${
                    item.active
                      ? 'bg-brand-primary text-white font-medium shadow-2xs dark:ring-1 dark:ring-[#3ECF8E]/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-[#EDEDED] dark:hover:bg-[#232323] font-normal'
                  } text-xs`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span
                    className={`transition-all duration-150 ${
                      compact
                        ? 'opacity-0 -translate-x-1 pointer-events-none'
                        : 'opacity-100 translate-x-0'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Configuración */}
        {organizationItems.length > 0 && (
          <div className="space-y-1.5">
            <div className="h-5 px-3 flex items-center overflow-hidden relative">
              <p
                className={`uppercase tracking-wider text-[11px] whitespace-nowrap transition-opacity duration-150 ${TYPOGRAPHY.label} ${
                  compact ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'
                }`}
              >
                Configuración
              </p>
              <span
                className={`absolute inset-x-2 h-px bg-slate-200/80 transition-opacity duration-150 ${
                  compact ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              />
            </div>
            <div className="space-y-1">
              {organizationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={compact ? item.label : undefined}
                    aria-label={item.label}
                    data-testid={item.testId}
                    className={`flex items-center gap-3 h-10 px-3 rounded-xl overflow-hidden whitespace-nowrap transition-colors duration-150 ${
                      item.active
                        ? 'bg-brand-primary text-white font-medium shadow-2xs dark:ring-1 dark:ring-[#3ECF8E]/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-[#EDEDED] dark:hover:bg-[#232323] font-normal'
                    } text-xs`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span
                      className={`transition-all duration-150 ${
                        compact
                          ? 'opacity-0 -translate-x-1 pointer-events-none'
                          : 'opacity-100 translate-x-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Theme Switcher, Role Switcher, User Profile & Sign Out inside Left Sidebar */}
      <div
        data-tour="topbar-actions"
        className="pt-4 border-t border-slate-200/80 dark:border-[#2E2E2E] space-y-1.5 overflow-hidden"
      >
        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          data-testid="theme-toggle-btn"
          className="w-full flex items-center gap-3 h-9 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:text-[#3ECF8E] dark:hover:bg-[#232323] text-xs font-medium overflow-hidden whitespace-nowrap transition-colors duration-150 cursor-pointer"
        >
          {isDark ? (
            <FiSun className="w-4 h-4 shrink-0 text-[#3ECF8E]" />
          ) : (
            <FiMoon className="w-4 h-4 shrink-0 text-slate-500" />
          )}
          <span
            className={`transition-all duration-150 ${
              compact
                ? 'opacity-0 -translate-x-1 pointer-events-none'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </span>
        </button>

        {/* Role Switcher */}
        <button
          type="button"
          onClick={() => switchDemoRole(isAdmin ? 'revisor' : 'administrador')}
          title={`Rol activo: ${isAdmin ? 'Administrador' : 'Revisor'} (clic para alternar)`}
          data-testid="active-role-badge"
          className="w-full flex items-center gap-3 h-9 px-3 rounded-xl text-slate-600 hover:text-brand-primary hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-[#3ECF8E] dark:hover:bg-[#232323] text-xs font-medium overflow-hidden whitespace-nowrap transition-colors duration-150 cursor-pointer"
        >
          <FiShield className="w-4 h-4 shrink-0 text-brand-primary dark:text-[#3ECF8E]" />
          <span
            className={`transition-all duration-150 ${
              compact
                ? 'opacity-0 -translate-x-1 pointer-events-none'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {isAdmin ? 'Administrador' : 'Revisor'}
          </span>
        </button>

        {/* User Avatar + Name */}
        <div
          title={`${user?.nombre || 'Mauricio Restrepo'} (${user?.correo || 'admin@constructoraandina.com.co'})`}
          className="flex items-center gap-3 h-9 px-2.5 overflow-hidden whitespace-nowrap"
        >
          <div className="w-6 h-6 rounded-full bg-slate-700 dark:bg-[#0D7A4D] dark:text-white dark:ring-1 dark:ring-[#3ECF8E]/40 text-white flex items-center justify-center text-[10px] font-medium shrink-0">
            {user?.iniciales || 'MR'}
          </div>
          <div
            className={`min-w-0 transition-all duration-150 ${
              compact
                ? 'opacity-0 -translate-x-1 pointer-events-none'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <p className="text-xs font-medium text-slate-800 dark:text-[#EDEDED] truncate leading-tight">
              {user?.nombre || 'Mauricio Restrepo'}
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          title={compact ? 'Cerrar sesión' : undefined}
          data-testid="sign-out-button"
          className="w-full flex items-center gap-3 h-9 px-3 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50/60 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 text-xs font-medium overflow-hidden whitespace-nowrap transition-colors duration-150 cursor-pointer"
        >
          <FiLogOut className="w-4 h-4 shrink-0" />
          <span
            className={`transition-all duration-150 ${
              compact
                ? 'opacity-0 -translate-x-1 pointer-events-none'
                : 'opacity-100 translate-x-0'
            }`}
          >
            Salir
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Menu Trigger (solo en pantallas pequeñas donde el sidebar es drawer) */}
      <button
        type="button"
        aria-label="Abrir menú de navegación"
        onClick={() => setMobileMenuOpen((v) => !v)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-white/95 dark:bg-[#171717]/95 shadow-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#232323]"
      >
        {mobileMenuOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
      </button>

      {/* Desktop Left Sidebar (Full Height, sin navbar superior) */}
      <aside
        data-tour="sidebar-nav"
        aria-label="Navegación principal"
        className={`hidden lg:flex lg:flex-col ${
          isCollapsed ? 'lg:w-[68px]' : 'lg:w-60'
        } lg:fixed lg:inset-y-0 lg:left-0 bg-white dark:bg-[#171717] border-r border-slate-200/80 dark:border-[#2E2E2E] z-40 transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width]`}
      >
        {/* Middle Arrow Toggle Button */}
        <button
          type="button"
          onClick={handleToggleCollapse}
          aria-label={isCollapsed ? 'Expandir menú lateral' : 'Simplificar menú lateral a iconos'}
          title={isCollapsed ? 'Expandir menú lateral' : 'Simplificar vista a solo iconos'}
          data-testid="sidebar-collapse-toggle"
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-[#1C1C1C] border border-slate-200 dark:border-[#2E2E2E] shadow-xs text-slate-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-[#3ECF8E] hover:border-slate-300 dark:hover:border-[#3ECF8E]/40 transition-colors duration-150 absolute top-1/2 -translate-y-1/2 -right-3.5 z-50 cursor-pointer"
        >
          {isCollapsed ? (
            <FiChevronRight className="w-4 h-4" />
          ) : (
            <FiChevronLeft className="w-4 h-4" />
          )}
        </button>

        {renderSidebarLinks(isCollapsed)}
      </aside>

      {/* Mobile / Tablet Responsive Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            aria-label="Navegación móvil"
            className="relative w-64 max-w-[80vw] bg-white dark:bg-[#171717] border-r border-slate-200 dark:border-[#2E2E2E] h-full z-10 shadow-xl pt-12"
          >
            {renderSidebarLinks(false)}
          </aside>
        </div>
      )}
    </>
  );
};

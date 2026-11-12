import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiUploadCloud, FiDatabase, FiUsers, FiCheckSquare, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROUTE_PATHS } from '@/routes/routePaths';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.rol === 'administrador';

  const items = [
    { label: 'Portafolio Activo', path: ROUTE_PATHS.TENDERS_LIST, icon: FiGrid, adminOnly: false },
    { label: 'Cargar Nuevo Pliego', path: ROUTE_PATHS.TENDER_UPLOAD, icon: FiUploadCloud, adminOnly: false },
    { label: 'Matriz y Análisis', path: '/licitaciones/LP-MIN-001-2026', icon: FiCheckSquare, adminOnly: false },
    { label: 'Asistente y Observaciones', path: '/licitaciones/LP-MIN-001-2026?tab=chat', icon: FiMessageSquare, adminOnly: false },
    { label: 'Base de Conocimiento', path: ROUTE_PATHS.KNOWLEDGE_BASE, icon: FiDatabase, adminOnly: true },
    { label: 'Miembros del Equipo', path: ROUTE_PATHS.MEMBERS_MANAGEMENT, icon: FiUsers, adminOnly: true },
  ].filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="w-60 bg-white border-r border-slate-200 p-4 hidden xl:flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <p className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Módulos de Dominio
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-slate-900 dark:bg-[#0D7A4D] text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#232323] hover:text-slate-900 dark:hover:text-[#EDEDED]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};


import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import type { RolOrganizacion } from '@/api/types';
import { ROUTE_PATHS } from './routePaths';

interface RoleRouteProps {
  allowedRole?: RolOrganizacion;
  allowedRoles?: RolOrganizacion[];
  children?: React.ReactElement;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRole,
  allowedRoles,
  children,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolesList = allowedRoles ?? (allowedRole ? [allowedRole] : ['administrador']);

  if (!user || !rolesList.includes(user.rol)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div
          role="alert"
          data-testid="role-forbidden-card"
          className="bg-white border border-slate-200 rounded-xl shadow-card max-w-md w-full p-7 space-y-4"
        >
          <h2 className="text-base font-semibold text-slate-900">
            Se requieren permisos de Administrador
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            La configuración de la organización, la gestión del equipo y la actualización de la base de conocimiento están disponibles únicamente para usuarios con rol de Administrador.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.TENDERS_LIST)}
            className="w-full py-2.5 px-4 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
          >
            Volver al Portafolio de Licitaciones
          </button>
        </div>
      </div>
    );
  }

  return children ?? <Outlet />;
};

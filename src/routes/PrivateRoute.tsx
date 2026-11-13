import React, { useState } from 'react';
import { services } from '@/features/connected/services';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { SkeletonLoader } from '@/shared/components/feedback/SkeletonLoader';
import { ROUTE_PATHS } from './routePaths';

interface PrivateRouteProps {
  children?: React.ReactElement;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated,isLoading,memberships,chooseOrganization,authError,reloadIdentity,accessToken,logout } = useAuth();
  const location = useLocation();

  const [empresa, setEmpresa] = useState('');
  const [creando, setCreando] = useState(false);
  const [errorEmpresa, setErrorEmpresa] = useState<string | null>(null);

  const crearEmpresa = async (event: React.FormEvent) => {
    event.preventDefault();
    const nombre = empresa.trim();
    if (nombre.length < 2) { setErrorEmpresa('Escribe el nombre de tu empresa (mínimo 2 caracteres).'); return; }
    setCreando(true);
    setErrorEmpresa(null);
    try {
      await services.createOrganization(nombre);
      reloadIdentity?.();
    } catch (e) {
      setErrorEmpresa((e as { message?: string }).message || 'No se pudo crear la empresa. Inténtalo de nuevo.');
    } finally {
      setCreando(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader variant="fullscreen" />;
  }

  if (!isAuthenticated && (memberships?.length || (accessToken && authError))) {
    const sinMembresia = !memberships?.length;
    return (
      <div className="min-h-screen bg-surface-page dark:bg-[#121212] flex items-center justify-center p-6">
        <section
          role="alert"
          data-testid="membership-required-card"
          className="bg-white dark:bg-[#1C1C1C] border border-slate-200 dark:border-[#2E2E2E] rounded-2xl shadow-elevated max-w-md w-full p-7 space-y-4"
        >
          <img src="/logo criterio.png" alt="CRITERIO" className="h-9 w-auto" />
          <h1 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            {sinMembresia ? 'Aún no perteneces a una organización' : 'Elige la organización'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            {sinMembresia
              ? 'Si trabajas en una empresa que ya usa CRITERIO, pide a su administrador que te invite desde "Gestión del equipo" con este correo y pulsa "Reintentar". Si quieres registrar tu propia empresa, escribe su nombre: quedarás como su administrador.'
              : 'Tu cuenta pertenece a varias organizaciones. Selecciona con cuál quieres trabajar.'}
          </p>
          {authError && !sinMembresia && <p className="text-xs text-rose-700 dark:text-rose-400">{authError}</p>}
          {sinMembresia && (
            <form onSubmit={crearEmpresa} noValidate className="space-y-2">
              <label htmlFor="crear-empresa-nombre" className="block text-xs font-medium text-slate-800 dark:text-zinc-200">
                Nombre o razón social de tu empresa
              </label>
              <div className="flex gap-2">
                <input
                  id="crear-empresa-nombre"
                  type="text"
                  maxLength={200}
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej. Constructora Andina S.A.S."
                  aria-invalid={!!errorEmpresa}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#232323] text-xs text-slate-800 dark:text-[#EDEDED] placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
                <button
                  type="submit"
                  disabled={creando}
                  className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                  {creando ? 'Creando…' : 'Crear empresa'}
                </button>
              </div>
              {errorEmpresa && <p role="alert" className="text-[11px] text-rose-600">{errorEmpresa}</p>}
            </form>
          )}
          {!!memberships?.length && (
            <div className="space-y-2">
              {memberships.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => chooseOrganization?.(m.organizacion_id)}
                  className="block w-full p-3 rounded-xl border border-slate-200 dark:border-[#2E2E2E] text-left text-xs text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#232323] transition-colors"
                >
                  <span className="font-medium">{m.rol === 'administrador' ? 'Administrador' : 'Revisor'}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-500 truncate">{m.organizacion_nombre || `Organización ${m.organizacion_id}`}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={reloadIdentity}
              className="flex-1 py-2.5 px-4 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-[#2E2E2E] text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#232323] transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </section>
      </div>
    );
  }
  if (!isAuthenticated) {
    const redirectTarget = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTE_PATHS.LOGIN}?redirect=${redirectTarget}`} replace />;
  }

  return children ?? <Outlet />;
};

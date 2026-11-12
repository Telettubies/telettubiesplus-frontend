import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiAlertTriangle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { useAcceptInvitation } from '../hooks/useAcceptInvitation';
import { PasswordRulesChecklist } from './PasswordRulesChecklist';
import { useTheme } from '@/shared/hooks/useTheme';

interface AcceptInviteFormProps {
  onSuccessRedirect?: () => void;
}

export const AcceptInviteForm: React.FC<AcceptInviteFormProps> = ({ onSuccessRedirect }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const handleRedirect = onSuccessRedirect ?? (() => navigate('/licitaciones'));

  const {
    metadata,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validation,
    screenState,
    handleSubmitInvitation,
  } = useAcceptInvitation();

  const isExpired = screenState === 'expired_link';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitInvitation(handleRedirect);
  };

  return (
    <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center p-6">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-elevated max-w-[860px] w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Metadata Column */}
        <div className="md:col-span-5 p-8 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col justify-between space-y-6 bg-slate-50/40">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <img
                src={isDark ? '/logo criterio white.png' : '/logo criterio.png'}
                alt="Logo CRITERIO"
                className="w-9 h-9 object-contain shrink-0"
              />
              <span className="font-semibold text-slate-900 tracking-wide text-base">CRITERIO</span>
            </div>

            {/* Organization */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Organización
              </p>
              <h2 className="text-base font-semibold text-slate-900">{metadata.organizacion}</h2>
            </div>

            {/* Assigned Role */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Rol Asignado
              </p>
              <span className="inline-block text-xs font-medium text-brand-primary">
                {metadata.rolAsignado}
              </span>
            </div>

            <div className="border-t border-slate-200/70 pt-4 space-y-4 text-xs">
              <div>
                <p className="text-slate-400">Invitado por</p>
                <p className="font-medium text-slate-800 mt-0.5">{metadata.invitadoPorRol}</p>
                <p className="text-[11px] text-slate-500">{metadata.invitadoPorCorreo}</p>
              </div>

              <div>
                <p className="text-slate-400">Estado de invitación</p>
                {isExpired ? (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-red-700 font-medium">
                      Expirado
                    </span>
                    <span className="text-slate-500">Límite 48 h</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-emerald-700 font-medium">
                      Válido
                    </span>
                    <span className="text-slate-500">{metadata.expiracionTexto}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-8 sm:p-10 space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Configurar perfil de usuario</h1>
            <p className="text-xs text-slate-500 mt-1">
              Sus credenciales quedarán vinculadas a {metadata.organizacion}.
            </p>
          </div>

          {screenState === 'expired_link' && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
            >
              <FiAlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                El enlace de invitación ha vencido. Solicite una nueva invitación al administrador de su organización.
              </span>
            </div>
          )}

          {screenState === 'weak_password' && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2"
            >
              <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Contraseña débil. Falta: {validation.missingSummary.join(', ') || 'confirmación coincidente'}.
              </span>
            </div>
          )}

          {screenState === 'provisioning' && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2"
            >
              <FiLoader className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span>Activando acceso al espacio de trabajo...</span>
            </div>
          )}

          {screenState === 'configured' && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cuenta configurada — Redirigiendo al Portafolio</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-800">Correo corporativo</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={metadata.correoInvitado}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-xs text-slate-600"
                />
                <FiLock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="invite-fullname" className="block text-xs font-semibold text-slate-800">
                Nombre completo
              </label>
              <input
                id="invite-fullname"
                type="text"
                disabled={isExpired}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre y apellidos"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="invite-password" className="block text-xs font-semibold text-slate-800">
                Nueva contraseña
              </label>
              <input
                id="invite-password"
                type="password"
                disabled={isExpired}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese una contraseña segura"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
              />
            </div>

            <PasswordRulesChecklist validation={validation} />

            <div className="space-y-1">
              <label htmlFor="invite-confirm" className="block text-xs font-semibold text-slate-800">
                Confirmar contraseña
              </label>
              <input
                id="invite-confirm"
                type="password"
                disabled={isExpired}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la contraseña"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isExpired}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-colors ${
                validation.isValid && !isExpired
                  ? 'bg-brand-primary text-white hover:bg-brand-hover'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300/80'
              }`}
            >
              Aceptar Invitación e Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiAlertCircle, FiCheckCircle, FiLoader, FiMoon, FiSun } from 'react-icons/fi';
import { useLogin } from '../hooks/useLogin';
import { useTheme } from '@/shared/hooks/useTheme';
import { ROUTE_PATHS } from '@/routes/routePaths';
import '../styles/auth.animations.css';

interface LoginFormProps {
  initialExpired?: boolean;
  onSuccessRedirect?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ initialExpired, onSuccessRedirect }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpiredQuery = initialExpired ?? searchParams.get('expired') === '1';
  const requestedRedirect = searchParams.get('redirect') || ROUTE_PATHS.TENDERS_LIST;
  const redirectTarget = requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//') && !requestedRedirect.includes(String.fromCharCode(92)) && !['/login', '/registro', '/register'].includes(requestedRedirect.split(/[?#]/)[0]) ? requestedRedirect : ROUTE_PATHS.TENDERS_LIST;
  const { accessToken, isLoading, user } = useAuth();
  // Las páginas de administración no sirven de destino para un revisor: va al portafolio.
  const adminOnly = [ROUTE_PATHS.KNOWLEDGE_BASE, ROUTE_PATHS.MEMBERS_MANAGEMENT].some((ruta) => redirectTarget.split(/[?#]/)[0].startsWith(ruta));
  const finalTarget = adminOnly && user && user.rol !== 'administrador' ? ROUTE_PATHS.TENDERS_LIST : redirectTarget;
  const handleRedirect = useCallback(() => { if (onSuccessRedirect) onSuccessRedirect(); else navigate(finalTarget, { replace: true }); }, [onSuccessRedirect, navigate, finalTarget]);
  useEffect(() => { if (!shouldUseMock() && accessToken && !isLoading) handleRedirect(); }, [accessToken, isLoading, handleRedirect]);

  const {
    email,
    setEmail,
    password,
    setPassword,
    visualState,
    setVisualState,
    errorMessage,
    submitLogin,
    signInWithGoogle, resetPassword, notice, isSubmitting,
  } = useLogin(isExpiredQuery);

  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLogin(handleRedirect);
  };

  return (
    <div className="min-h-screen bg-surface-page dark:bg-[#121212] flex flex-col items-center justify-center p-6 relative transition-colors duration-200">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="fixed top-5 right-5 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1C1C1C] text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#232323] transition-colors shadow-2xs cursor-pointer"
      >
        {isDark ? (
          <>
            <FiSun className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>Modo claro</span>
          </>
        ) : (
          <>
            <FiMoon className="w-3.5 h-3.5" />
            <span>Modo oscuro</span>
          </>
        )}
      </button>

      <div className="bg-white dark:bg-[#1C1C1C] border border-slate-200/80 dark:border-[#2E2E2E] rounded-2xl shadow-elevated max-w-[440px] w-full p-8 sm:p-10 space-y-6 soft-page-enter">
        {/* Header Logo */}
        <div className="flex items-center gap-3">
          <img
            src={isDark ? '/logo criterio white.png' : '/logo criterio.png'}
            alt="Logo CRITERIO"
            className="w-11 h-11 object-contain shrink-0"
          />
          <div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-wide leading-tight">CRITERIO</h1>
            <p className="text-xs text-slate-500">Analizador de Pliegos</p>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Iniciar sesión</h2>
          <p className="text-xs text-slate-500">Plataforma de Análisis de Licitaciones y Matriz de Cobertura</p>
        </div>

        {visualState === 'verifying' && (
          <div
            role="status"
            className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-normal"
          >
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verificando credenciales y cargando tu organización...</span>
          </div>
        )}

        {(visualState === 'invalid_credentials' || errorMessage) && (
          <div
            role="alert"
            data-testid="login-error-banner"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-normal"
          >
            <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              {errorMessage ||
                'Credenciales inválidas o dominio corporativo no autorizado. Contacte al administrador de su organización.'}
            </span>
          </div>
        )}

        {visualState === 'session_expired' && (
          <div
            role="alert"
            data-testid="session-expired-banner"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-normal"
          >
            <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Tu sesión expiró por inactividad. Inicia sesión de nuevo para continuar.</span>
          </div>
        )}

        {(notice || searchParams.get('confirmed') === '1') && <div role="status" className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs"><FiCheckCircle className="w-4 h-4 shrink-0" /><span>{notice || 'Confirmación recibida. Inicia sesión con tu correo y contraseña.'}</span></div>}
        {searchParams.get('error_description') && <p role="alert" className="text-xs text-red-700">{searchParams.get('error_description')}</p>}
        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={() => void signInWithGoogle(handleRedirect, redirectTarget)}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center justify-center gap-2.5 transition-colors"
        >
          {visualState === 'connecting_idp' ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin text-slate-500" />
              <span>Conectando con proveedor de identidad...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-[#2E2E2E] w-full" />
          <span className="bg-white dark:bg-[#1C1C1C] px-3 text-[11px] text-slate-400 dark:text-zinc-500 whitespace-nowrap">
            o continuar con correo corporativo
          </span>
          <div className="border-t border-slate-200 dark:border-[#2E2E2E] w-full" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="corporate-email" className="block text-xs font-medium text-slate-800 dark:text-zinc-200">
              Correo corporativo
            </label>
            <input
              id="corporate-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@empresa.com.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#232323] text-xs text-slate-800 dark:text-[#EDEDED] placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-[#3ECF8E]/20 focus:border-slate-800 dark:focus:border-[#3ECF8E]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="corporate-password" className="block text-xs font-medium text-slate-800 dark:text-zinc-200">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => void resetPassword()}
                disabled={isSubmitting}
                className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-[#3ECF8E] font-normal cursor-pointer"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                id="corporate-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#232323] text-xs text-slate-800 dark:text-[#EDEDED] focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-[#3ECF8E]/20 focus:border-slate-800 dark:focus:border-[#3ECF8E]"
              />
              <button
                type="button"
                aria-label="Alternar visibilidad de contraseña"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            data-testid="login-submit-button"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-medium transition-colors shadow-xs dark:ring-1 dark:ring-[#3ECF8E]/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Verificando...' : 'Ingresar al Espacio de Trabajo'}
          </button>
        </form>

        {/* Link to Company Registration */}
        <div className="pt-1 text-center">
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            ¿Su empresa aún no tiene cuenta?{' '}
            <Link
              to={ROUTE_PATHS.REGISTER}
              data-testid="go-to-register-link"
              className="font-medium text-brand-primary dark:text-[#3ECF8E] hover:text-brand-hover dark:hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              Registrar organización
            </Link>
          </p>
        </div>

        {/* Footer Security Note */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <FiLock className="w-3.5 h-3.5 shrink-0" />
          <span>Acceso seguro para su organización</span>
        </div>
      </div>
    </div>
  );
};

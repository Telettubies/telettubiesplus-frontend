import { authService, EMAIL_PATTERN } from '../services/authService';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiLock,
  FiCheck,
  FiAlertCircle,
  FiMoon,
  FiSun,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import { PasswordRulesChecklist } from './PasswordRulesChecklist';
import { validateEnterprisePassword } from '../utils/authValidators';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTheme } from '@/shared/hooks/useTheme';
import { ROUTE_PATHS } from '@/routes/routePaths';
import { cookieStorage } from '@/shared/utils/cookieStorage';
import '../styles/auth.animations.css';

// El registro pide solo lo que se guarda: el nombre de la organización (organizaciones.nombre,
// máx. 200) y la cuenta de Supabase Auth (nombre, correo y contraseña del administrador).
const STEPS = [
  { id: 1, label: 'Empresa' },
  { id: 2, label: 'Administrador' },
  { id: 3, label: 'Confirmar' },
];

const LIMITS = { companyName: 200, adminName: 120, email: 320, password: 72 } as const;

type FieldName = 'companyName' | 'adminName' | 'adminEmail' | 'password' | 'confirmPassword';
const STEP_FIELDS: Record<number, FieldName[]> = {
  1: ['companyName'],
  2: ['adminName', 'adminEmail', 'password', 'confirmPassword'],
  3: [],
};

const inputClass = (hasError: boolean) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none ${
    hasError ? 'border-rose-400 focus:border-rose-500 bg-rose-50/40' : 'border-slate-200 focus:border-brand-primary'
  }`;

const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-[11px] text-rose-600">
      <FiAlertCircle className="w-3 h-3 shrink-0" />
      <span>{message}</span>
    </p>
  ) : null;

const Required = () => (
  <span className="text-rose-500" aria-hidden="true">
    {' '}*
  </span>
);

export const RegisterCompanyForm: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithProfile, reloadIdentity, accessToken, isLoading } = useAuth();
  const [awaitingSession, setAwaitingSession] = useState(false);

  // Tras registrarse con sesión activa, entra cuando la sesión y la identidad (/api/yo) están listas.
  useEffect(() => {
    if (awaitingSession && accessToken && !isLoading) {
      setAwaitingSession(false);
      navigate(ROUTE_PATHS.TENDERS_LIST, { replace: true });
    }
  }, [awaitingSession, accessToken, isLoading, navigate]);
  const { isDark, toggleTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepNotice, setStepNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordValidation = validateEnterprisePassword(password, confirmPassword);

  const errors: Partial<Record<FieldName, string>> = {};
  const company = companyName.trim();
  if (!company) errors.companyName = 'El nombre de la empresa es obligatorio.';
  else if (company.length < 2) errors.companyName = 'Escribe al menos 2 caracteres.';
  else if (company.length > LIMITS.companyName) errors.companyName = `Máximo ${LIMITS.companyName} caracteres.`;

  const name = adminName.trim();
  if (!name) errors.adminName = 'Tu nombre completo es obligatorio.';
  else if (name.length < 3) errors.adminName = 'Escribe tu nombre completo.';
  else if (name.length > LIMITS.adminName) errors.adminName = `Máximo ${LIMITS.adminName} caracteres.`;

  const email = adminEmail.trim().toLowerCase();
  if (!email) errors.adminEmail = 'El correo electrónico es obligatorio.';
  else if (!EMAIL_PATTERN.test(email)) errors.adminEmail = 'Escribe un correo válido, por ejemplo nombre@empresa.com.co.';
  else if (email.length > LIMITS.email) errors.adminEmail = 'El correo es demasiado largo.';

  const passwordRulesMet =
    passwordValidation.minLength &&
    passwordValidation.hasUppercase &&
    passwordValidation.hasLowercase &&
    passwordValidation.hasNumber &&
    passwordValidation.hasSpecial;
  if (!password) errors.password = 'La contraseña es obligatoria.';
  else if (password.length > LIMITS.password) errors.password = `Máximo ${LIMITS.password} caracteres.`;
  else if (!passwordRulesMet) errors.password = 'La contraseña aún no cumple todas las reglas de abajo.';

  if (!confirmPassword) errors.confirmPassword = 'Confirma tu contraseña.';
  else if (password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';

  const visibleError = (field: FieldName) => (touched[field] ? errors[field] : undefined);
  const touch = (field: FieldName) => setTouched((prev) => ({ ...prev, [field]: true }));

  const firstInvalidStep = (upTo: number): number | null => {
    for (let step = 1; step <= upTo; step += 1) {
      if (STEP_FIELDS[step].some((field) => errors[field])) return step;
    }
    return null;
  };

  const validateUpTo = (step: number): boolean => {
    const fields = Object.entries(STEP_FIELDS)
      .filter(([s]) => Number(s) <= step)
      .flatMap(([, f]) => f);
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }));
    const invalid = firstInvalidStep(step);
    if (invalid !== null) {
      setCurrentStep(invalid);
      setStepNotice('Revisa los campos marcados en rojo para continuar.');
      return false;
    }
    return true;
  };

  const goToStep = (targetStep: number) => {
    if (isSubmitting || registrationComplete) return;
    setStepNotice(null);
    if (targetStep > currentStep && !validateUpTo(targetStep - 1)) return;
    setCurrentStep(targetStep);
  };

  const handleNextStep = () => {
    if (isSubmitting || registrationComplete) return;
    setStepNotice(null);
    if (validateUpTo(currentStep) && currentStep < STEPS.length) setCurrentStep((previous) => previous + 1);
  };

  const handlePrevStep = () => {
    setStepNotice(null);
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleCompleteRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || registrationComplete) return;
    if (currentStep < STEPS.length) {
      handleNextStep();
      return;
    }
    setStepNotice(null);
    if (!validateUpTo(STEPS.length)) return;
    setIsSubmitting(true);
    try {
      const result = await authService.signUp({ companyName: company, adminName: name, email, password });
      cookieStorage.resetTour();
      if (result.profile) {
        loginWithProfile(result.profile, 'jwt-demo-token');
        navigate(ROUTE_PATHS.TENDERS_LIST, { replace: true });
      } else if (result.requiresEmailConfirmation) {
        setRegistrationComplete(true);
        setPassword('');
        setConfirmPassword('');
        setStepNotice(
          `Cuenta creada. Enviamos un enlace de confirmación a ${email}. Ábrelo y luego inicia sesión: al entrar se creará la organización "${company}" y quedarás como su administrador.`
        );
      } else {
        // Supabase devolvió sesión: el usuario queda autenticado sin pasar por el login.
        setAwaitingSession(true);
        reloadIdentity?.();
      }
    } catch (error) {
      setStepNotice((error as Error).message || 'No se pudo crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="bg-white dark:bg-[#1C1C1C] border border-slate-200/80 dark:border-[#2E2E2E] rounded-2xl shadow-elevated max-w-[480px] w-full p-8 sm:p-10 space-y-6 soft-page-enter">
        {/* Header Logo */}
        <div className="flex items-center justify-between gap-3">
          <Link to={ROUTE_PATHS.LOGIN} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src={isDark ? '/logo criterio white.png' : '/logo criterio.png'}
              alt="Logo CRITERIO"
              className="w-10 h-10 object-contain shrink-0"
            />
            <div>
              <span className="text-base font-semibold text-slate-900 tracking-wide block leading-tight">
                CRITERIO
              </span>
              <span className="text-xs text-slate-500 block">Analizador de Pliegos</span>
            </div>
          </Link>

          {/* Minimalist Circle Step Indicators (sin cajas de secciones) */}
          <div
            role="tablist"
            aria-label="Pasos de registro de empresa"
            className="flex items-center gap-2"
          >
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Paso ${step.id}: ${step.label}`}
                    title={`Paso ${step.id}: ${step.label}`}
                    data-testid={`register-step-card-${step.id}`}
                    onClick={() => goToStep(step.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-brand-primary text-white scale-105 shadow-2xs'
                        : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600'
                    }`}
                  >
                    {isCompleted ? <FiCheck className="w-3.5 h-3.5" /> : step.id}
                  </button>
                  {index < STEPS.length - 1 && (
                    <span
                      className={`w-3 h-px transition-colors duration-200 ${
                        isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className={`${TYPOGRAPHY.title} text-xl`}>Registro de Organización en CRITERIO</h1>
          <p className="text-xs text-slate-500">
            Paso {currentStep} de {STEPS.length} — {STEPS[currentStep - 1].label}
          </p>
        </div>

        {stepNotice && (
          <div
            role={registrationComplete ? 'status' : 'alert'}
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
              registrationComplete
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {registrationComplete ? (
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-px" />
            ) : (
              <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-px" />
            )}
            <span>{stepNotice}</span>
          </div>
        )}

        <form onSubmit={handleCompleteRegistration} noValidate className="space-y-5">
          {/* PASO 1: EMPRESA */}
          {currentStep === 1 && (
            <div key="step-1" className="space-y-4 soft-page-enter">
              <p className="text-xs text-slate-600">
                Información de su organización. Los campos con <span className="text-rose-500">*</span> son obligatorios.
              </p>

              <div className="space-y-1.5">
                <label htmlFor="reg-company-name" className="block text-xs font-medium text-slate-800">
                  Nombre o razón social de la empresa
                  <Required />
                </label>
                <input
                  id="reg-company-name"
                  type="text"
                  autoComplete="organization"
                  required
                  maxLength={LIMITS.companyName}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onBlur={() => touch('companyName')}
                  aria-invalid={!!visibleError('companyName')}
                  aria-describedby="reg-company-name-error"
                  placeholder="Ej. Constructora Andina S.A.S."
                  className={inputClass(!!visibleError('companyName'))}
                />
                <FieldError id="reg-company-name-error" message={visibleError('companyName')} />
              </div>
            </div>
          )}

          {/* PASO 2: ADMINISTRADOR */}
          {currentStep === 2 && (
            <div key="step-2" className="space-y-4 soft-page-enter">
              <p className="text-xs text-slate-600">Cuenta del administrador principal</p>

              <div className="space-y-1.5">
                <label htmlFor="reg-admin-name" className="block text-xs font-medium text-slate-800">
                  Nombre completo
                  <Required />
                </label>
                <input
                  id="reg-admin-name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={LIMITS.adminName}
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  onBlur={() => touch('adminName')}
                  aria-invalid={!!visibleError('adminName')}
                  aria-describedby="reg-admin-name-error"
                  placeholder="Ej. Mauricio Restrepo"
                  className={inputClass(!!visibleError('adminName'))}
                />
                <FieldError id="reg-admin-name-error" message={visibleError('adminName')} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-admin-email" className="block text-xs font-medium text-slate-800">
                  Correo electrónico corporativo
                  <Required />
                </label>
                <input
                  id="reg-admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={LIMITS.email}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  onBlur={() => touch('adminEmail')}
                  aria-invalid={!!visibleError('adminEmail')}
                  aria-describedby="reg-admin-email-error"
                  placeholder="nombre@empresa.com.co"
                  className={inputClass(!!visibleError('adminEmail'))}
                />
                <FieldError id="reg-admin-email-error" message={visibleError('adminEmail')} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-admin-pass" className="block text-xs font-medium text-slate-800">
                  Contraseña de acceso
                  <Required />
                </label>
                <div className="relative">
                  <input
                    id="reg-admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    maxLength={LIMITS.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => touch('password')}
                    aria-invalid={!!visibleError('password')}
                    aria-describedby="reg-admin-pass-error"
                    placeholder="Cree una contraseña segura"
                    className={`${inputClass(!!visibleError('password'))} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <FieldError id="reg-admin-pass-error" message={visibleError('password')} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-admin-confirm" className="block text-xs font-medium text-slate-800">
                  Confirmar contraseña
                  <Required />
                </label>
                <input
                  id="reg-admin-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  maxLength={LIMITS.password}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => touch('confirmPassword')}
                  aria-invalid={!!visibleError('confirmPassword')}
                  aria-describedby="reg-admin-confirm-error"
                  placeholder="Repita la contraseña"
                  className={inputClass(!!visibleError('confirmPassword'))}
                />
                <FieldError id="reg-admin-confirm-error" message={visibleError('confirmPassword')} />
              </div>

              <PasswordRulesChecklist validation={passwordValidation} />
            </div>
          )}

          {/* PASO 3: CONFIRMAR */}
          {currentStep === 3 && (
            <div key="step-3" className="space-y-4 soft-page-enter">
              <p className="text-xs text-slate-600">Revise y confirme los datos de su organización</p>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-slate-400">Empresa</p>
                    <p className="font-medium text-slate-900 break-words">{company}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    disabled={isSubmitting || registrationComplete}
                    className="text-brand-primary hover:text-brand-hover font-medium shrink-0 disabled:opacity-50"
                  >
                    Editar
                  </button>
                </div>

                <div className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-slate-400">Administrador principal</p>
                    <p className="font-medium text-slate-900 break-words">{name}</p>
                    <p className="text-slate-500 break-all">{email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    disabled={isSubmitting || registrationComplete}
                    className="text-brand-primary hover:text-brand-hover font-medium shrink-0 disabled:opacity-50"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {currentStep > 1 && !registrationComplete ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                data-testid="register-prev-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            ) : (
              <span />
            )}

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  handleNextStep();
                }}
                data-testid="register-next-btn"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors shadow-2xs"
              >
                <span>Continuar</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : registrationComplete ? (
              <Link
                to={ROUTE_PATHS.LOGIN}
                data-testid="register-go-login-btn"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors shadow-2xs"
              >
                <span>Ir a iniciar sesión</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || awaitingSession}
                data-testid="register-submit-btn"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors shadow-2xs disabled:opacity-60"
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>{isSubmitting || awaitingSession ? 'Creando cuenta...' : 'Crear cuenta e ingresar'}</span>
              </button>
            )}
          </div>
        </form>

        {/* Link back to Login */}
        <div className="pt-1 text-center">
          <p className="text-xs text-slate-600">
            ¿Su empresa ya tiene cuenta?{' '}
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="font-medium text-brand-primary hover:text-brand-hover underline underline-offset-2 transition-colors"
            >
              Iniciar sesión
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

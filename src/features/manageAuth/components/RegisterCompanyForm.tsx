import React, { useState } from 'react';
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
} from 'react-icons/fi';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import { PasswordRulesChecklist } from './PasswordRulesChecklist';
import { validateEnterprisePassword } from '../utils/authValidators';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTheme } from '@/shared/hooks/useTheme';
import { ROUTE_PATHS } from '@/routes/routePaths';
import { cookieStorage } from '@/shared/utils/cookieStorage';
import '../styles/auth.animations.css';

const STEPS = [
  { id: 1, label: 'Empresa' },
  { id: 2, label: 'Administrador' },
  { id: 3, label: 'Preferencias' },
  { id: 4, label: 'Confirmar' },
];

const SECTORS = [
  'Infraestructura y Obra Civil',
  'Consultoría e Interventoría',
  'Tecnología y Servicios',
  'Suministros y Equipamiento',
  'Salud y Dotación Institucional',
];

const VOLUME_OPTIONS = [
  '1 a 5 pliegos al mes',
  '6 a 15 pliegos al mes',
  'Más de 15 pliegos al mes',
];

const MODALITY_OPTIONS = [
  'Proponente individual',
  'Consorcio o Unión Temporal',
  'Ambas modalidades',
];

const PRIORITY_AREAS = [
  'Requisitos habilitantes y jurídicos',
  'Indicadores financieros y RUP',
  'Acreditación de experiencia y contratos',
  'Personal clave y plazos de ejecución',
];

export const RegisterCompanyForm: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepNotice, setStepNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paso 1: Datos de la Empresa
  const [companyName, setCompanyName] = useState('');
  const [companyNit, setCompanyNit] = useState('');
  const [companySector, setCompanySector] = useState(SECTORS[0]);
  const [companyCity, setCompanyCity] = useState('Bogotá D.C., Colombia');

  // Paso 2: Administrador Principal
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Paso 3: Perfil Licitatorio
  const [monthlyVolume, setMonthlyVolume] = useState(VOLUME_OPTIONS[1]);
  const [modality, setModality] = useState(MODALITY_OPTIONS[2]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Requisitos habilitantes y jurídicos',
    'Acreditación de experiencia y contratos',
  ]);

  const passwordValidation = validateEnterprisePassword(password, confirmPassword);

  const togglePriority = (area: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    );
  };

  const goToStep = (targetStep: number) => {
    setStepNotice(null);
    setCurrentStep(targetStep);
  };

  const handleNextStep = () => {
    setStepNotice(null);
    if (currentStep === 1 && !companyName.trim()) {
      setStepNotice('Por favor ingrese el nombre o razón social de su empresa para continuar.');
      return;
    }
    if (currentStep === 2 && (!adminName.trim() || !adminEmail.trim())) {
      setStepNotice('Por favor complete el nombre y el correo corporativo del administrador.');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStepNotice(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setStepNotice(null);

    const finalCompanyName = companyName.trim() || 'Constructora Andina S.A.S.';
    const finalNit = companyNit.trim() ? `NIT ${companyNit.trim()}` : 'NIT 900.342.112-4';
    const finalAdminName = adminName.trim() || 'Mauricio Restrepo';
    const finalEmail = adminEmail.trim() || 'admin@constructoraandina.com.co';

    const initials =
      finalAdminName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'CR';

    setIsSubmitting(true);

    setTimeout(() => {
      cookieStorage.resetTour();
      loginWithProfile({
        id: 'mem-admin-registered',
        user_id: 'usr-registered-001',
        nombre: finalAdminName,
        iniciales: initials,
        correo: finalEmail,
        rol: 'administrador',
        organizacion_id: 'org-co-registered',
        organizacion_nombre: finalCompanyName,
        organizacion_nit: finalNit,
        tenant_codigo: 'ORG-CO-REG',
      });
      navigate(ROUTE_PATHS.TENDERS_LIST);
    }, 400);
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
            Paso {currentStep} de 4 — {STEPS[currentStep - 1].label}
          </p>
        </div>

        {stepNotice && (
          <div
            role="alert"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs"
          >
            <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{stepNotice}</span>
          </div>
        )}

        <form onSubmit={handleCompleteRegistration} className="space-y-5">
          {/* STEP 1: DATOS DE LA EMPRESA */}
          {currentStep === 1 && (
            <div key="step-1" className="space-y-4 soft-page-enter">
              <p className="text-xs text-slate-600">
                Información general de su organización
              </p>

              <div className="space-y-1.5">
                <label htmlFor="reg-company-name" className="block text-xs font-medium text-slate-800">
                  Nombre o razón social de la empresa
                </label>
                <input
                  id="reg-company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej. Constructora Andina S.A.S."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-company-nit" className="block text-xs font-medium text-slate-800">
                  NIT o identificación tributaria
                </label>
                <input
                  id="reg-company-nit"
                  type="text"
                  value={companyNit}
                  onChange={(e) => setCompanyNit(e.target.value)}
                  placeholder="Ej. 900.342.112-4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-company-sector" className="block text-xs font-medium text-slate-800">
                  Sector principal de contratación
                </label>
                <select
                  id="reg-company-sector"
                  value={companySector}
                  onChange={(e) => setCompanySector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-brand-primary"
                >
                  {SECTORS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-company-city" className="block text-xs font-medium text-slate-800">
                  Ciudad y país de operación
                </label>
                <input
                  id="reg-company-city"
                  type="text"
                  value={companyCity}
                  onChange={(e) => setCompanyCity(e.target.value)}
                  placeholder="Ej. Bogotá D.C., Colombia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ADMINISTRADOR PRINCIPAL */}
          {currentStep === 2 && (
            <div key="step-2" className="space-y-4 soft-page-enter">
              <p className="text-xs text-slate-600">
                Cuenta del administrador principal
              </p>

              <div className="space-y-1.5">
                <label htmlFor="reg-admin-name" className="block text-xs font-medium text-slate-800">
                  Nombre completo
                </label>
                <input
                  id="reg-admin-name"
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ej. Mauricio Restrepo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-admin-email" className="block text-xs font-medium text-slate-800">
                  Correo electrónico corporativo
                </label>
                <input
                  id="reg-admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="nombre@empresa.com.co"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-admin-pass" className="block text-xs font-medium text-slate-800">
                  Contraseña de acceso
                </label>
                <input
                  id="reg-admin-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Cree una contraseña segura"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-admin-confirm" className="block text-xs font-medium text-slate-800">
                  Confirmar contraseña
                </label>
                <input
                  id="reg-admin-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <PasswordRulesChecklist validation={passwordValidation} />
            </div>
          )}

          {/* STEP 3: PERFIL DE LICITACIÓN */}
          {currentStep === 3 && (
            <div key="step-3" className="space-y-4 soft-page-enter">
              <p className="text-xs text-slate-600">
                Perfil licitatorio y preferencias de análisis
              </p>

              <div className="space-y-1.5">
                <label htmlFor="reg-volume" className="block text-xs font-medium text-slate-800">
                  Volumen estimado de pliegos al mes
                </label>
                <select
                  id="reg-volume"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-brand-primary"
                >
                  {VOLUME_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-modality" className="block text-xs font-medium text-slate-800">
                  Modalidad habitual de participación
                </label>
                <select
                  id="reg-modality"
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-brand-primary"
                >
                  {MODALITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <span className="block text-xs font-medium text-slate-800">
                  Áreas prioritarias de verificación
                </span>
                <div className="space-y-2">
                  {PRIORITY_AREAS.map((area) => {
                    const active = selectedPriorities.includes(area);
                    return (
                      <label
                        key={area}
                        onClick={() => togglePriority(area)}
                        className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none py-1"
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                            active
                              ? 'bg-brand-primary text-white'
                              : 'border border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          <FiCheck className="w-3 h-3" />
                        </span>
                        <span>{area}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: RESUMEN Y CONFIRMACIÓN */}
          {currentStep === 4 && (
            <div key="step-4" className="space-y-4 soft-page-enter">
              <p className="text-xs text-slate-600">
                Revise y confirme los datos de su organización
              </p>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-slate-400">Empresa y NIT</p>
                    <p className="font-medium text-slate-900">
                      {companyName || 'Constructora Andina S.A.S.'}
                    </p>
                    <p className="text-slate-500">
                      {companyNit || '900.342.112-4'} • {companySector}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-brand-primary hover:text-brand-hover font-medium shrink-0"
                  >
                    Editar
                  </button>
                </div>

                <div className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-slate-400">Administrador principal</p>
                    <p className="font-medium text-slate-900">
                      {adminName || 'Mauricio Restrepo'}
                    </p>
                    <p className="text-slate-500">
                      {adminEmail || 'admin@constructoraandina.com.co'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="text-brand-primary hover:text-brand-hover font-medium shrink-0"
                  >
                    Editar
                  </button>
                </div>

                <div className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-slate-400">Perfil de licitación</p>
                    <p className="font-medium text-slate-900">{monthlyVolume}</p>
                    <p className="text-slate-500">
                      {modality} • {selectedPriorities.length} áreas activas
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="text-brand-primary hover:text-brand-hover font-medium shrink-0"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                data-testid="register-prev-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            ) : (
              <span />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                data-testid="register-next-btn"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors shadow-2xs"
              >
                <span>Continuar</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="register-submit-btn"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors shadow-2xs disabled:opacity-60"
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Activando cuenta...' : 'Crear cuenta e ingresar'}</span>
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

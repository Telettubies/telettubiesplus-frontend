import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Joyride, {
  STATUS,
  EVENTS,
  ACTIONS,
  type CallBackProps,
  type Step,
} from 'react-joyride';
import { cookieStorage, TOUR_COOKIE_NAME } from '@/shared/utils/cookieStorage';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  FULL_SYSTEM_TOUR_STEPS,
  getStartStepIndexForPath,
  type TourStepData,
} from './tourSteps';

interface GuidedTourContextValue {
  isRunning: boolean;
  startTour: (fromBeginning?: boolean, customSteps?: Step[]) => void;
  stopTour: () => void;
}

const GuidedTourContext = createContext<GuidedTourContextValue>({
  isRunning: false,
  startTour: () => {},
  stopTour: () => {},
});

export const useGuidedTour = () => useContext(GuidedTourContext);

/**
 * Estado persistido en memoria de módulo para que al cambiar de página
 * (cuando MainLayout se desmonta y vuelve a montar en la nueva ruta,
 * o al navegar hacia/desde la vista de pantalla completa del pliego)
 * el tutorial continúe exactamente en el paso destino sin reiniciarse ni perderse.
 */
let persistedStepIndex: number | null = null;
let persistedNavigatingToRoute: string | null = null;

interface GuidedTourProviderProps {
  tourKey?: string;
  autoStart?: boolean;
  pathname?: string;
  onNavigate?: (route: string) => void;
  children?: React.ReactNode;
}

export const GuidedTourProvider: React.FC<GuidedTourProviderProps> = ({
  tourKey = TOUR_COOKIE_NAME,
  autoStart = false,
  pathname = '',
  onNavigate,
  children,
}) => {
  const { isDark } = useTheme();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>(FULL_SYSTEM_TOUR_STEPS);
  const [stepIndex, setStepIndex] = useState<number>(() => persistedStepIndex ?? 0);

  const resolveResponsiveSteps = useCallback((rawSteps: Step[]): Step[] => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return rawSteps;
    }
    const sidebarEl = document.querySelector('[data-tour="sidebar-nav"]') as HTMLElement | null;
    const isSidebarHidden =
      !sidebarEl || window.getComputedStyle(sidebarEl).display === 'none';

    const filtersEl = document.querySelector('[data-tour="focused-state-filters"]') as HTMLElement | null;
    const isFiltersHidden =
      !filtersEl || window.getComputedStyle(filtersEl).display === 'none';

    return rawSteps.map((step) => {
      if (step.target === '[data-tour="sidebar-nav"]' && isSidebarHidden) {
        return {
          ...step,
          target: '[data-tour="topbar-brand"]',
          placement: 'bottom',
        };
      }
      if (step.target === '[data-tour="focused-state-filters"]' && isFiltersHidden) {
        return {
          ...step,
          target: '[data-tour="focused-header"]',
          placement: 'bottom',
        };
      }
      return step;
    });
  }, []);

  useEffect(() => {
    if (cookieStorage.isTourCompleted(tourKey)) {
      return;
    }

    // 1. Si venimos de una transición entre páginas del tutorial, reanudar en el paso exacto
    if (persistedStepIndex !== null) {
      const targetStep = FULL_SYSTEM_TOUR_STEPS[persistedStepIndex];
      const expectedRoute = (targetStep?.data as TourStepData | undefined)?.route;

      if (
        !expectedRoute ||
        !pathname ||
        pathname === expectedRoute ||
        (!expectedRoute.includes('?') && pathname.split('?')[0] === expectedRoute)
      ) {
        const timer = setTimeout(() => {
          persistedNavigatingToRoute = null;
          setSteps(resolveResponsiveSteps(FULL_SYSTEM_TOUR_STEPS));
          setStepIndex(persistedStepIndex ?? 0);
          setRun(true);
        }, 300);
        return () => clearTimeout(timer);
      }
      return;
    }

    // 2. Verificación en cookies/localStorage ('criterio_guided_tour_v1'):
    // Si no está marcado como 'completed', se inicia automáticamente
    if (autoStart) {
      const timer = setTimeout(() => {
        const initialIdx = getStartStepIndexForPath(pathname);
        persistedStepIndex = initialIdx;
        setSteps(resolveResponsiveSteps(FULL_SYSTEM_TOUR_STEPS));
        setStepIndex(initialIdx);
        setRun(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoStart, tourKey, pathname, resolveResponsiveSteps]);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        cookieStorage.markTourCompleted(tourKey);
        persistedStepIndex = null;
        persistedNavigatingToRoute = null;
        setRun(false);
        return;
      }

      if (action === ACTIONS.CLOSE) {
        cookieStorage.markTourCompleted(tourKey);
        persistedStepIndex = null;
        persistedNavigatingToRoute = null;
        setRun(false);
        return;
      }

      // Auto-centrado del scroll para asegurar que el elemento y su tooltip nunca queden fuera del viewport
      // ni expandan el tamaño del documento
      if (type === EVENTS.STEP_BEFORE || type === EVENTS.TOOLTIP) {
        const currentStep = steps[index];
        if (currentStep?.target) {
          const selector =
            typeof currentStep.target === 'string' ? currentStep.target : null;
          if (selector) {
            try {
              const el = document.querySelector(selector) as HTMLElement | null;
              if (el) {
                el.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest',
                });
              }
            } catch {
              // ignore
            }
          }
        }
      }

      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        // Evitar doble disparo mientras ya se está navegando a otra ruta
        if (persistedNavigatingToRoute) {
          return;
        }

        const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);

        if (nextIndex < 0 || nextIndex >= steps.length) {
          cookieStorage.markTourCompleted(tourKey);
          persistedStepIndex = null;
          persistedNavigatingToRoute = null;
          setRun(false);
          return;
        }

        const nextStep = steps[nextIndex];
        const nextRoute = (nextStep?.data as TourStepData | undefined)?.route;
        persistedStepIndex = nextIndex;

        if (nextRoute && onNavigate && pathname && pathname !== nextRoute) {
          // Pausar Joyride antes de desmontar la página actual y navegar a la nueva ruta
          persistedNavigatingToRoute = nextRoute;
          setRun(false);
          onNavigate(nextRoute);
        } else {
          setStepIndex(nextIndex);
        }
      }
    },
    [onNavigate, pathname, steps, tourKey]
  );

  const startTour = useCallback(
    (fromBeginning = false, customSteps?: Step[]) => {
      const activeSteps =
        customSteps && customSteps.length > 0 ? customSteps : FULL_SYSTEM_TOUR_STEPS;
      setSteps(activeSteps);

      const initialIdx = fromBeginning ? 0 : getStartStepIndexForPath(pathname);
      const targetStep = activeSteps[initialIdx];
      const targetRoute = (targetStep?.data as TourStepData | undefined)?.route;

      cookieStorage.resetTour(tourKey);
      persistedStepIndex = initialIdx;

      if (targetRoute && onNavigate && pathname && pathname !== targetRoute) {
        persistedNavigatingToRoute = targetRoute;
        setRun(false);
        onNavigate(targetRoute);
      } else {
        setStepIndex(initialIdx);
        setRun(true);
      }
    },
    [onNavigate, pathname, tourKey]
  );

  const stopTour = useCallback(() => {
    cookieStorage.markTourCompleted(tourKey);
    persistedStepIndex = null;
    persistedNavigatingToRoute = null;
    setRun(false);
  }, [tourKey]);

  return (
    <GuidedTourContext.Provider value={{ isRunning: run, startTour, stopTour }}>
      {children}

      {typeof window !== 'undefined' && (
        <Joyride
          steps={steps}
          stepIndex={stepIndex}
          run={run}
          continuous
          showSkipButton
          showProgress
          scrollToFirstStep
          disableScrolling={false}
          disableScrollParentFix={true}
          scrollOffset={120}
          scrollDuration={350}
          disableOverlayClose={false}
          callback={handleJoyrideCallback}
          floaterProps={{
            disableAnimation: true,
            options: {
              preventOverflow: {
                boundariesElement: 'viewport',
                padding: 20,
              },
              flip: {
                behavior: ['bottom', 'top', 'right', 'left'],
                boundariesElement: 'viewport',
                padding: 20,
              },
            },
            styles: {
              floater: {
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
                maxWidth: 'calc(100vw - 32px)',
              },
            },
          }}
          locale={{
            back: 'Anterior',
            close: 'Cerrar',
            last: 'Finalizar recorrido',
            next: 'Siguiente paso',
            skip: 'Omitir tutorial',
          }}
          styles={{
            options: {
              primaryColor: isDark ? '#3ECF8E' : '#1E3A5F',
              textColor: isDark ? '#EDEDED' : '#0F172A',
              backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
              arrowColor: isDark ? '#1C1C1C' : '#FFFFFF',
              overlayColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(15, 23, 42, 0.45)',
              zIndex: 99999,
            },
            tooltip: {
              borderRadius: '16px',
              padding: '20px',
              fontFamily: 'Montserrat, sans-serif',
              maxWidth: '440px',
              width: '100%',
              border: isDark ? '1px solid #2E2E2E' : 'none',
              boxShadow: isDark
                ? '0 24px 36px -6px rgba(0, 0, 0, 0.65), 0 8px 16px -4px rgba(0, 0, 0, 0.45)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            },
            tooltipTitle: {
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: isDark ? '#EDEDED' : '#0F172A',
            },
            tooltipContent: {
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '13px',
              lineHeight: 1.6,
              padding: '10px 0 4px 0',
              color: isDark ? '#D4D4D8' : '#334155',
            },
            buttonNext: {
              borderRadius: '10px',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              padding: '8px 14px',
              backgroundColor: isDark ? '#0D7A4D' : '#1E3A5F',
              color: '#FFFFFF',
              border: isDark ? '1px solid rgba(62, 207, 142, 0.35)' : 'none',
            },
            buttonBack: {
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: isDark ? '#A1A1AA' : '#334155',
            },
            buttonSkip: {
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              color: isDark ? '#8E8E93' : '#64748B',
            },
          }}
        />
      )}
    </GuidedTourContext.Provider>
  );
};

import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { FocusedTenderPdfWorkspace } from '@/features/manageVisorPliego/components/FocusedTenderPdfWorkspace';
import { GuidedTourProvider } from '@/shared/components/tour/GuidedTourProvider';

export const FocusedTenderPdfPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, switchDemoRole } = useAuth();

  const handleTourNavigate = (route: string) => {
    if (route.startsWith('/configuracion') && user?.rol !== 'administrador') {
      switchDemoRole('administrador');
    }
    navigate(route);
  };

  const handleClose = () => {
    // Si se abrió en una pestaña nueva con target="_blank", intentar cerrar la ventana
    if (window.opener && window.opener !== window) {
      window.close();
    } else {
      // Si se accedió directamente por URL, volver a la página de análisis del pliego
      navigate(`/licitaciones/${id || 'LP-MIN-001-2026'}`);
    }
  };

  return (
    <GuidedTourProvider
      autoStart={true}
      pathname={location.pathname}
      onNavigate={handleTourNavigate}
    >
      <ErrorBoundary fallbackTitle="Error al cargar la Pantalla Completa del Pliego">
        <FocusedTenderPdfWorkspace
          processId={id || 'LP-MIN-001-2026'}
          onClose={handleClose}
        />
      </ErrorBoundary>
    </GuidedTourProvider>
  );
};

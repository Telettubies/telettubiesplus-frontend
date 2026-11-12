import React from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { PortfolioActiveWorkspace } from '@/features/managePanelLicitaciones/components/PortfolioActiveWorkspace';

export const TendersListPage: React.FC = () => {
  return (
    <MainLayout
      breadcrumbCategory="Licitaciones"
      breadcrumbCurrent="Portafolio Activo"
    >
      <ErrorBoundary fallbackTitle="Error en Portafolio Activo">
        <PortfolioActiveWorkspace />
      </ErrorBoundary>
    </MainLayout>
  );
};


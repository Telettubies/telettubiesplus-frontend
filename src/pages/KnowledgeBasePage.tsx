import React from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { OrganizationKnowledgeWorkspace } from '@/features/manageBaseConocimiento/components/OrganizationKnowledgeWorkspace';

export const KnowledgeBasePage: React.FC = () => {
  return (
    <MainLayout
      breadcrumbCategory="Configuración"
      breadcrumbCurrent="Fichero Corporativo de la Empresa"
    >
      <ErrorBoundary fallbackTitle="Error en Base de Conocimiento">
        <OrganizationKnowledgeWorkspace />
      </ErrorBoundary>
    </MainLayout>
  );
};


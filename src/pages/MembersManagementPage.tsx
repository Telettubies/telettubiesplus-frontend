import React from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { MembersManagementView } from '@/features/manageMiembros/components/MembersManagementView';

export const MembersManagementPage: React.FC = () => {
  return (
    <MainLayout
      breadcrumbCategory="Configuración"
      breadcrumbCurrent="Miembros del Equipo"
    >
      <ErrorBoundary fallbackTitle="Error en Gestión de Miembros">
        <MembersManagementView />
      </ErrorBoundary>
    </MainLayout>
  );
};


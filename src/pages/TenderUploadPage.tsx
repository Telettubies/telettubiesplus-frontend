import React from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { UploadAndProgressView } from '@/features/manageCargaYProgreso/components/UploadAndProgressView';

export const TenderUploadPage: React.FC = () => {
  return (
    <MainLayout
      breadcrumbCategory="Licitaciones / Nueva Licitación"
      breadcrumbCurrent="Carga y Procesamiento"
    >
      <ErrorBoundary fallbackTitle="Error en Carga de Pliego">
        <UploadAndProgressView initialMode="upload_idle" />
      </ErrorBoundary>
    </MainLayout>
  );
};


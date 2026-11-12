import React from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { UploadAndProgressView } from '@/features/manageCargaYProgreso/components/UploadAndProgressView';

export const TenderProgressPage: React.FC = () => {
  return (
    <MainLayout
      breadcrumbCategory="Licitaciones / Nueva Licitación"
      breadcrumbCurrent="Carga y Procesamiento"
    >
      <ErrorBoundary fallbackTitle="Error en Progreso del Pipeline">
        <UploadAndProgressView initialMode="live_polling" />
      </ErrorBoundary>
    </MainLayout>
  );
};


import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { UploadAndProgressView } from '@/features/manageCargaYProgreso/components/UploadAndProgressView';

export const TenderProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <MainLayout
      breadcrumbCategory={`Licitaciones / ${id || 'Nueva Licitación'}`}
      breadcrumbCurrent="Carga y Procesamiento"
    >
      <ErrorBoundary fallbackTitle="Error en Progreso del Pipeline">
        <UploadAndProgressView licitacionId={id} initialMode="live_polling" />
      </ErrorBoundary>
    </MainLayout>
  );
};


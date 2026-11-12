import React from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { TenderAnalysisWorkspace } from '@/features/manageDashboardMatriz/components/TenderAnalysisWorkspace';

export const TenderAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const tabLabel =
    tab === 'pliego'
      ? 'Visor del Pliego'
      : tab === 'revision'
        ? 'Revisión Humana'
        : tab === 'chat'
          ? 'Asistente Legal'
          : 'Estados y Gráficas';

  return (
    <MainLayout
      breadcrumbCategory={`Licitaciones / ${id || 'LP-MIN-001-2026'}`}
      breadcrumbCurrent={tabLabel}
    >
      <TenderAnalysisWorkspace />
    </MainLayout>
  );
};


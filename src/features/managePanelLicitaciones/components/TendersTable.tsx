import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import type { LicitacionPortafolioItem } from '@/api/types';
import type { PortfolioVisualState } from '../hooks/useTendersList';
import { TenderRowCard } from './TenderRowCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { SkeletonLoader } from '@/shared/components/feedback/SkeletonLoader';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import '../styles/panel.styles.css';

interface TendersTableProps {
  items: LicitacionPortafolioItem[];
  visualState: PortfolioVisualState;
  searchQuery: string;
  onOpenTender: (item: LicitacionPortafolioItem) => void;
  onNewTenderClick: () => void;
  onClearFilters: () => void;
  onRetryConnection: () => void;
}

export const TendersTable: React.FC<TendersTableProps> = ({
  items,
  visualState,
  searchQuery,
  onOpenTender,
  onNewTenderClick,
  onClearFilters,
  onRetryConnection,
}) => {
  if (visualState === 'empty') {
    return (
      <div data-tour="portfolio-table" className="space-y-4 font-sans">
        <EmptyState
          title="No hay licitaciones registradas en este espacio"
          description="Cargue el pliego de condiciones de un proceso licitatorio de SECOP en formato PDF para iniciar la extracción automatizada y la matriz de cumplimiento."
          actionLabel="Cargar Primer Pliego (PDF)"
          onAction={onNewTenderClick}
        />
      </div>
    );
  }

  if (visualState === 'error_403') {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="bg-red-50/90 border border-red-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-red-900"
        >
          <div className="flex items-center gap-2.5">
            <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-normal">
              No se pudieron cargar las licitaciones en este momento. Verifique su conexión e intente nuevamente.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRetryConnection}
              className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-hover"
            >
              Reintentar conexión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (visualState === 'skeleton') {
    return <SkeletonLoader variant="table" rows={8} />;
  }

  const totalResults = visualState === 'new_job' ? 25 : items.length === 10 ? 24 : items.length;

  return (
    <div data-tour="portfolio-table" className="space-y-4">
      <div className="overflow-x-auto border-y border-slate-200 bg-white/70">
        <table className="w-full text-left border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>ID Proceso</th>
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Entidad Contratante</th>
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Objeto de la Contratación</th>
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Fecha y Plazo de Cierre</th>
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Estado del Análisis</th>
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Recomendación IA</th>
              <th className={`py-3.5 px-4 text-right ${TYPOGRAPHY.label}`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {items.length > 0 ? (
              items.map((item) => (
                <TenderRowCard key={item.id} item={item} onOpenTender={onOpenTender} />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  <p className="text-xs font-semibold text-slate-800">
                    No se encontraron procesos que coincidan con el filtro &apos;{searchQuery || 'LP-2024'}&apos;
                  </p>
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-3 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Limpiar filtros de búsqueda
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer directly on canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className={TYPOGRAPHY.label}>
          {items.length === 0
            ? 'Página 0 de 0 • 0 resultados'
            : `Página 1 de 3 • ${totalResults} resultados`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={items.length === 0}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-400 disabled:opacity-60"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={items.length === 0}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

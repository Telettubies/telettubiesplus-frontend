import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { ResultadoLicitacion } from '@/api/types';
import { RecommendationBadge } from '@/shared/components/badges/RecommendationBadge';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';

interface RecommendationHeroCardProps {
  resultado: ResultadoLicitacion;
  onOpenReviewInbox?: () => void;
}

export const RecommendationHeroCard: React.FC<RecommendationHeroCardProps> = ({
  resultado,
  onOpenReviewInbox,
}) => {
  const {
    recomendacion,
    justificacion,
    cobertura,
    resumen_estados,
    fecha_cierre,
    dias_al_cierre,
    riesgos_habilitantes_criticos,
  } = resultado;

  const totalRequisitos =
    resumen_estados.cumple +
    resumen_estados.cumple_parcialmente +
    resumen_estados.no_cumple +
    resumen_estados.revision;

  const coveragePct =
    cobertura.secciones_total > 0
      ? Math.round((cobertura.secciones_procesadas / cobertura.secciones_total) * 100)
      : 100;

  return (
    <div data-tour="nivel-1-veredicto" className="space-y-4">
      {/* Open 4-Column Executive Strip directly on canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 pb-6 border-b border-slate-200/80 items-start">
        {/* Column 1: Recomendación y Justificación */}
        <div className="lg:col-span-3 space-y-2.5 lg:pr-4">
          <div>
            <RecommendationBadge recomendacion={recomendacion} variant="hero" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{justificacion}</p>
        </div>

        {/* Column 2: Cobertura Global del Pliego */}
        <div className="lg:col-span-3 space-y-2 lg:border-l lg:border-slate-200/80 lg:pl-6">
          <p className={TYPOGRAPHY.label}>Cobertura Global del Pliego</p>
          <p className={`${TYPOGRAPHY.title} text-2xl`}>{coveragePct}% Cobertura</p>
          <div className="space-y-1.5">
            <p className={TYPOGRAPHY.label}>
              {cobertura.secciones_procesadas} / {cobertura.secciones_total} Secciones Auditadas
            </p>
            <div className="h-2 bg-slate-200/80 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary dark:bg-[#3ECF8E] rounded-full"
                style={{ width: `${coveragePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Column 3: Matriz de Cumplimiento */}
        <div className="lg:col-span-3 space-y-2 lg:border-l lg:border-slate-200/80 lg:pl-6">
          <p className={TYPOGRAPHY.label}>Matriz de Cumplimiento</p>
          <div className="grid grid-cols-4 gap-2 pt-0.5">
            <div>
              <p className="text-xl font-semibold text-emerald-600">{resumen_estados.cumple}</p>
              <p className="text-xs font-medium text-emerald-700 leading-tight">Cumple</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-amber-600">
                {resumen_estados.cumple_parcialmente}
              </p>
              <p className="text-xs font-medium text-amber-700 leading-tight">
                Parcial
              </p>
            </div>
            <div>
              <p className="text-xl font-semibold text-red-600">{resumen_estados.no_cumple}</p>
              <p className="text-xs font-medium text-red-700 leading-tight">No Cumple</p>
            </div>
            <div
              onClick={onOpenReviewInbox}
              className={onOpenReviewInbox ? 'cursor-pointer hover:opacity-80' : ''}
            >
              <p className="text-xl font-semibold text-slate-700">{resumen_estados.revision}</p>
              <p className="text-xs font-medium text-slate-600 leading-tight">
                Revisión
              </p>
            </div>
          </div>
          <p className={TYPOGRAPHY.label}>Total: {totalRequisitos} requisitos</p>
        </div>

        {/* Column 4: Plazos y Riesgos */}
        <div className="lg:col-span-3 space-y-2 lg:border-l lg:border-slate-200/80 lg:pl-6">
          <p className={TYPOGRAPHY.label}>Plazos y Riesgos</p>
          <p className={`${TYPOGRAPHY.title} text-sm`}>
            Cierre: {fecha_cierre || '2026-12-05'} ({dias_al_cierre ?? 24} Días)
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className={TYPOGRAPHY.label}>Riesgos Habilitantes:</span>
            <span className="text-red-700 text-xs font-medium">
              {riesgos_habilitantes_criticos ?? 1} Crítico
            </span>
          </div>
        </div>
      </div>

      {/* Alerta si existen secciones sin procesar */}
      {cobertura.numerales_no_procesados.length > 0 && (
        <div
          role="alert"
          className="rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 flex items-center justify-between text-xs text-amber-900"
        >
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Atención: Quedaron secciones sin procesar ({cobertura.numerales_no_procesados.join(', ')}). La recomendación se mantiene condicionada.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

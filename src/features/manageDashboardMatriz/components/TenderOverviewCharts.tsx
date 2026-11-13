import React from 'react';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import type { ResultadoLicitacion, CategoriaRequisito } from '@/api/types';
import { RecommendationHeroCard } from './RecommendationHeroCard';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';

interface TenderOverviewChartsProps {
  resultado: ResultadoLicitacion;
  onOpenReviewInbox?: () => void;
  onGoToMatrix?: () => void;
}

const CATEGORY_LABELS: { key: CategoriaRequisito; label: string }[] = [
  { key: 'habilitante', label: 'Requisitos Habilitantes' },
  { key: 'tecnico', label: 'Requisitos Técnicos' },
  { key: 'experiencia', label: 'Acreditación de Experiencia' },
  { key: 'plazo', label: 'Plazos y Cronograma' },
];

export const TenderOverviewCharts: React.FC<TenderOverviewChartsProps> = ({
  resultado,
  onOpenReviewInbox,
  onGoToMatrix,
}) => {
  const { resumen_estados, items } = resultado;
  const total =
    resumen_estados.cumple +
      resumen_estados.cumple_parcialmente +
      resumen_estados.no_cumple +
      resumen_estados.revision || 1;

  const pctCumple = Math.round((resumen_estados.cumple / total) * 100);
  const pctParcial = Math.round((resumen_estados.cumple_parcialmente / total) * 100);
  const pctNoCumple = Math.round((resumen_estados.no_cumple / total) * 100);
  const pctRevision = Math.max(0, 100 - pctCumple - pctParcial - pctNoCumple);

  const stateBars = [
    {
      label: 'Cumple totalmente',
      count: resumen_estados.cumple,
      pct: pctCumple,
      barColor: 'bg-emerald-600 dark:bg-[#3ECF8E]',
      textColor: 'text-emerald-700 dark:text-[#3ECF8E]',
    },
    {
      label: shouldUseMock() ? 'Cumple parcialmente (Subsanable)' : 'Cumple parcialmente',
      count: resumen_estados.cumple_parcialmente,
      pct: pctParcial,
      barColor: 'bg-amber-500 dark:bg-amber-400',
      textColor: 'text-amber-700 dark:text-amber-400',
    },
    {
      label: 'No cumple (Brecha identificada)',
      count: resumen_estados.no_cumple,
      pct: pctNoCumple,
      barColor: 'bg-red-600 dark:bg-red-500',
      textColor: 'text-red-700 dark:text-red-400',
    },
    {
      label: 'Pendiente de revisión humana',
      count: resumen_estados.revision,
      pct: pctRevision,
      barColor: 'bg-brand-primary dark:bg-sky-500',
      textColor: 'text-brand-primary dark:text-sky-400',
    },
  ];

  // Estadísticas por categoría a partir de los ítems
  const categoryStats = CATEGORY_LABELS.map(({ key, label }) => {
    const catItems = items.filter((item) => item.categoria === key);
    const totalCat = catItems.length || 1;
    const cumpleCat = catItems.filter((i) => i.estado === 'cumple').length;
    const parcialCat = catItems.filter((i) => i.estado === 'cumple_parcialmente').length;
    const brechaCat = catItems.filter((i) => i.estado === 'no_cumple').length;
    const pctCoverage = Math.round(((cumpleCat + parcialCat * 0.5) / totalCat) * 100);

    return {
      key,
      label,
      total: catItems.length,
      cumple: cumpleCat,
      parcial: parcialCat,
      brechas: brechaCat,
      pctCoverage,
    };
  });

  const gapsList = items.filter(
    (item) => item.estado === 'no_cumple' || item.estado === 'cumple_parcialmente'
  );
  const subsanablesCount = gapsList.filter((item) => item.subsanable).length;
  const noSubsanablesCount = gapsList.length - subsanablesCount;

  return (
    <div className="space-y-8 soft-page-enter soft-stagger">
      {/* Resumen General Ejecutivo (movido aquí para despejar Matriz y Pliego) */}
      <RecommendationHeroCard
        resultado={resultado}
        onOpenReviewInbox={onOpenReviewInbox}
      />

      {/* Gráficas de Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfica 1: Distribución de Estados de Cumplimiento */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-2xs">
          <div>
            <h3 className={`${TYPOGRAPHY.title} text-sm`}>
              Distribución de Estados de la Licitación
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporción sobre {total} requisitos evaluados en el pliego
            </p>
          </div>

          {/* Barra apilada general */}
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-[#2A2A2A] overflow-hidden flex">
              <div
                style={{ width: `${pctCumple}%` }}
                className="bg-emerald-600 dark:bg-[#3ECF8E] transition-all duration-500"
                title={`Cumple: ${pctCumple}%`}
              />
              <div
                style={{ width: `${pctParcial}%` }}
                className="bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                title={`Parcial: ${pctParcial}%`}
              />
              <div
                style={{ width: `${pctNoCumple}%` }}
                className="bg-red-600 dark:bg-red-500 transition-all duration-500"
                title={`No cumple: ${pctNoCumple}%`}
              />
              <div
                style={{ width: `${pctRevision}%` }}
                className="bg-brand-primary dark:bg-sky-500 transition-all duration-500"
                title={`En revisión: ${pctRevision}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{pctCumple}% cumplimiento directo</span>
              <span>{pctParcial + pctNoCumple}% con observaciones o brechas</span>
            </div>
          </div>

          {/* Barras individuales por estado */}
          <div className="space-y-3.5 pt-2">
            {stateBars.map((bar) => (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">{bar.label}</span>
                  <span className={`font-mono font-medium ${bar.textColor}`}>
                    {bar.count} ({bar.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(bar.pct, 3)}%` }}
                    className={`h-full rounded-full ${bar.barColor} transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfica 2: Cobertura por Categoría del Pliego */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-2xs">
          <div>
            <h3 className={`${TYPOGRAPHY.title} text-sm`}>
              Desempeño por Categoría del Pliego
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nivel de cobertura frente a la base de conocimiento de la empresa
            </p>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{cat.label}</span>
                  <span className="text-slate-500">
                    <span className="font-mono font-medium text-slate-900">
                      {cat.pctCoverage}%
                    </span>{' '}
                    ({cat.cumple} cumple • {cat.parcial} parcial • {cat.brechas} brecha)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-[#2A2A2A] overflow-hidden">
                  <div
                    style={{ width: `${cat.pctCoverage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.pctCoverage >= 80
                        ? 'bg-emerald-600 dark:bg-[#3ECF8E]'
                        : cat.pctCoverage >= 55
                          ? 'bg-amber-500 dark:bg-amber-400'
                          : 'bg-red-600 dark:bg-red-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Resumen de Subsanabilidad de Brechas */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <p className="text-slate-500">Balance de brechas detectadas en muestra</p>
              <p className="text-slate-800">
                <span className="text-amber-700 font-medium">{shouldUseMock() ? `${subsanablesCount} subsanables` : 'Subsanabilidad no disponible'}</span>
                {' • '}
                <span className="text-red-700 font-medium">{shouldUseMock() ? `${noSubsanablesCount} críticas` : `${gapsList.length} brechas`}</span>
              </p>
            </div>
            {onGoToMatrix && (
              <button
                type="button"
                onClick={onGoToMatrix}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors cursor-pointer"
              >
                Explorar Pliego y Matriz →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


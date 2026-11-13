import React from 'react';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { CheckCircle2 } from 'lucide-react';
import { useHumanReview, type ReviewScenarioState } from '../hooks/useHumanReview';
import { ReviewDecisionForm } from './ReviewDecisionForm';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import '../styles/review.styles.css';

export interface ReviewInboxDrawerProps {
  licitacionId?: string;
  externalScenario?: ReviewScenarioState;
  onOpenPdfPage?: (page: number, reqCode?: string) => void;
  onGoToMatrix?: () => void;
  onGoToObservationGenerator?: (reqCode?: string) => void;
}

export const ReviewInboxDrawer: React.FC<ReviewInboxDrawerProps> = ({
  licitacionId = 'LP-MIN-001-2026',
  externalScenario,
  onOpenPdfPage,
  onGoToMatrix,
  onGoToObservationGenerator,
}) => {
  const {
    scenario,
    applyScenarioPreset,
    effectiveItems,
    filteredItems,
    activeItem,
    setSelectedId,
    filterType,
    setFilterType,
    toastMessage,
    isSubmitting,
    submitResolution,
  } = useHumanReview(licitacionId, externalScenario ?? 'pending_4');

  React.useEffect(() => {
    if (externalScenario) {
      applyScenarioPreset(externalScenario);
    }
  }, [externalScenario]);

  const totalPending = effectiveItems.length;
  const habilitantesCount = effectiveItems.filter((i) => i.es_habilitante).length;
  const tecnicosCount = effectiveItems.filter((i) => !i.es_habilitante).length;

  const renderHighlightedClause = (fullText: string, highlightFragment?: string) => {
    if (!highlightFragment || !fullText.includes(highlightFragment)) {
      return <span>{fullText}</span>;
    }
    const parts = fullText.split(highlightFragment);
    return (
      <>
        {parts[0]}
        <mark className="rounded bg-[#FEF08A] dark:bg-[#3ECF8E]/20 px-1 py-0.5 font-medium text-slate-900 dark:text-[#3ECF8E]">
          {highlightFragment}
        </mark>
        {parts.slice(1).join(highlightFragment)}
      </>
    );
  };

  return (
    <div id="tour-step-human-review" className="relative space-y-6">
      {/* Header Compacto con Filtros Rápidos (sin cards gigantes) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Revisión Humana de Requisitos
          </h2>
          <span
            className={`text-xs font-medium ${
              totalPending === 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {totalPending === 0 ? '· Al día' : `· ${totalPending} requisitos por decidir`}
          </span>
        </div>

        {/* Filtro Rápido Compacto */}
        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs bg-white">
          <button
            type="button"
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1.5 font-medium transition-colors ${
              filterType === 'todos'
                ? 'bg-brand-primary text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({totalPending})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('habilitantes')}
            className={`px-3 py-1.5 border-l border-slate-200 font-medium transition-colors ${
              filterType === 'habilitantes'
                ? 'bg-brand-primary text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Habilitantes ({habilitantesCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('tecnicos')}
            className={`px-3 py-1.5 border-l border-slate-200 font-medium transition-colors ${
              filterType === 'tecnicos'
                ? 'bg-brand-primary text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Técnicos ({tecnicosCount})
          </button>
        </div>
      </div>

      {/* Área Principal de Revisión */}
      {totalPending === 0 ? (
        <div className="flex min-h-[340px] flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-card">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Bandeja de revisión al día</h3>
          <p className="mt-1.5 max-w-md text-xs text-slate-500 leading-relaxed">
            No existen requisitos ambiguos ni discrepancias pendientes en este proceso licitatorio.
            La recomendación final ha sido consolidada.
          </p>
          <button
            type="button"
            onClick={onGoToMatrix}
            className="mt-5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover"
          >
            Ver Matriz de Cobertura Completa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:divide-x lg:divide-slate-200/80">
          {/* Columna Izquierda: Lista limpia de requisitos para elegir */}
          <div className="lg:col-span-5 space-y-2 lg:pr-4">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Seleccione un requisito a evaluar:
            </p>
            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const isSelected = activeItem?.id === item.id;
                const isRedBadge = item.motivo_badge.toLowerCase().includes('verificación');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-primary bg-slate-50/90 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {item.codigo} · {item.numeral}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isRedBadge ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        {item.motivo_badge}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 line-clamp-2">
                      {item.requisito_resumido}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">
                      {item.capitulo_label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Contraste de evidencias y Formulario de decisión */}
          <div className="space-y-5 lg:col-span-7 lg:pl-6">
            {activeItem && (
              <>
                {/* Comparación Directa */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pb-5 border-b border-slate-200/80">
                  {/* Pliego Literal */}
                  <div className="space-y-2 bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/70">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Exigencia del Pliego
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPdfPage?.(activeItem.ubicacion.pagina, activeItem.codigo)
                        }
                        className="text-[11px] font-medium text-brand-primary hover:underline"
                      >
                        Ver en Pág. {activeItem.ubicacion.pagina} →
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-800">
                      {renderHighlightedClause(
                        activeItem.cita_literal_pliego,
                        activeItem.pliego_resaltado_fragmento
                      )}
                    </p>
                  </div>

                  {/* Evidencia Corporativa */}
                  <div className="space-y-2 bg-white rounded-xl p-3.5 border border-slate-200/70">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Evidencia Corporativa
                      </h4>
                      <span className="text-xs font-medium text-amber-600">
                        {activeItem.similitud_porcentaje}% coincidencia
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">
                      {activeItem.evidencia_fragmento}
                    </p>
                  </div>
                </div>

                {/* Formulario de Decisión Manual */}
                <ReviewDecisionForm
                  key={shouldUseMock() ? 'mock-form' : activeItem.id}
                  esHabilitante={activeItem.es_habilitante}
                  initialDecision={
                    !shouldUseMock() ? (activeItem.estado_propuesto || 'cumple') : scenario === 'no_cumple_warn' || scenario === 'recalculating'
                      ? 'no_cumple'
                      : 'cumple'
                  }
                  initialComment={
                    scenario === 'no_cumple_warn' || scenario === 'recalculating'
                      ? 'La evidencia 2024-C08 acredita arrendamiento operativo; la cláusula exige propiedad o leasing financiero. No cumple la redacción literal.'
                      : ''
                  }
                  forceValidationError={scenario === 'validation_err'}
                  isSubmitting={isSubmitting}
                  onConfirm={submitResolution}
                  onGenerateObservation={() => onGoToObservationGenerator?.(activeItem.codigo)}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Green Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-6 z-40 flex items-center gap-2.5 rounded-xl border border-[#10B981]/40 dark:border-[#3ECF8E]/40 bg-[#ECFDF5] dark:bg-[#172821] px-4 py-3 text-xs font-semibold text-[#065F46] dark:text-[#3ECF8E] shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669] dark:text-[#3ECF8E]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

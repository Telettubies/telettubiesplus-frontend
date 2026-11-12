import React from 'react';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import type { ProgresoAnalisis, EtapaPipeline } from '@/api/types';
import { SectionsProgressCounter } from './SectionsProgressCounter';
import { ErrorRetryCard } from './ErrorRetryCard';
import { CalmingSpinner } from '@/shared/components/feedback/CalmingSpinner';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import '../styles/stepper.animations.css';

interface PipelineStepperProps {
  progress: ProgresoAnalisis;
  onOpenMatrix: () => void;
  onRetryFromCheckpoint: () => void;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  progress,
  onOpenMatrix,
  onRetryFromCheckpoint,
}) => {
  const renderStageBadge = (stage: EtapaPipeline) => {
    if (stage.estado === 'completado') {
      return (
        <span className="text-emerald-700 text-xs font-medium">
          Completado
        </span>
      );
    }
    if (stage.estado === 'en_proceso') {
      return (
        <span className="text-amber-700 text-xs font-medium">
          En Proceso
        </span>
      );
    }
    if (stage.estado === 'error') {
      return (
        <span className="text-red-700 text-xs font-medium">
          {stage.detalle_error || 'Interrupción en la etapa'}
        </span>
      );
    }
    return (
      <span className="text-slate-500 text-xs font-normal">
        En cola
      </span>
    );
  };

  return (
    <div data-tour="upload-stepper" className="space-y-5">
      {/* Header + Top Bar directly on canvas */}
      <div className="space-y-3">
        <h2 className={`${TYPOGRAPHY.title} text-lg`}>
          Progreso del Análisis del Pliego
        </h2>
        <div className="h-2 bg-slate-200/80 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary dark:bg-[#3ECF8E] transition-all duration-300 rounded-full"
            style={{ width: `${progress.porcentaje}%` }}
          />
        </div>
      </div>

      {/* Top Status Banner */}
      {progress.estado === 'pendiente' && (
        <div className="py-2 flex items-center gap-2.5 text-xs text-slate-600">
          <FiClock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Seleccione un archivo PDF para iniciar el análisis del documento.</span>
        </div>
      )}

      {(progress.estado === 'procesando' || progress.estado === 'error') && (
        <SectionsProgressCounter
          etapaIndice={progress.etapa_indice}
          etapasTotal={progress.etapas_total}
          porcentaje={progress.porcentaje}
          seccionesProcesadas={progress.secciones_procesadas}
          seccionesTotal={progress.secciones_total}
        />
      )}

      {progress.estado === 'procesando' && (
        <CalmingSpinner
          stage="extraccion"
          customMessage={`Analizando sección ${progress.secciones_procesadas || 38} de ${
            progress.secciones_total || 52
          }: identificando cada requisito con su numeral...`}
        />
      )}

      {progress.estado === 'completado' && progress.resumen_final && (
        <div
          data-testid="pipeline-completed-banner"
          className="rounded-2xl bg-emerald-50/80 dark:bg-[#0D7A4D]/15 border border-emerald-200 dark:border-[#3ECF8E]/30 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 text-xs font-medium">
              Análisis finalizado
            </span>
            <span className={TYPOGRAPHY.label}>Etapa 8 de 8 • 100%</span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-emerald-200/60">
            <div>
              <p className={`${TYPOGRAPHY.title} text-xl`}>
                {progress.resumen_final.requisitos_extraidos}
              </p>
              <p className={TYPOGRAPHY.label}>Requisitos Extraídos</p>
            </div>
            <div>
              <p className={`${TYPOGRAPHY.title} text-xl`}>
                {progress.resumen_final.secciones_validadas}
              </p>
              <p className={TYPOGRAPHY.label}>Secciones Revisadas</p>
            </div>
            <div>
              <p className={`${TYPOGRAPHY.title} text-xl`}>
                {progress.resumen_final.duracion_texto}
              </p>
              <p className={TYPOGRAPHY.label}>Duración</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenMatrix}
              data-testid="open-matrix-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
            >
              <span>Abrir Matriz de Cobertura y Visor del Pliego</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 8 Stages Open List */}
      <div className="border-y border-slate-200 divide-y divide-slate-200/70 bg-white/60">
        {progress.etapas.map((etapa) => {
          const isCurrent = etapa.estado === 'en_proceso';
          const isError = etapa.estado === 'error';

          return (
            <div
              key={etapa.numero}
              className={`px-4 py-3.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                isCurrent
                  ? 'bg-amber-50/70'
                  : isError
                  ? 'bg-red-50/70'
                  : 'hover:bg-white'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`text-xs font-medium mt-0.5 ${
                    isError ? 'text-red-700' : 'text-slate-400'
                  }`}
                >
                  {etapa.numero}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 leading-snug">{etapa.titulo}</p>
                  <p
                    className={`text-xs truncate ${
                      isCurrent ? 'text-amber-900 font-normal' : 'text-slate-500'
                    }`}
                  >
                    {etapa.subtitulo}
                  </p>
                </div>
              </div>
              <div className="shrink-0">{renderStageBadge(etapa)}</div>
            </div>
          );
        })}
      </div>

      {/* Retry Card when Stage 4 fails */}
      {progress.estado === 'error' && (
        <ErrorRetryCard
          checkpointEtapa={progress.checkpoint_etapa}
          checkpointFecha={progress.checkpoint_fecha}
          onRetry={onRetryFromCheckpoint}
        />
      )}
    </div>
  );
};

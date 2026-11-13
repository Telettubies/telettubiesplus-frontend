import React from 'react';

interface SectionsProgressCounterProps {
  etapaIndice: number;
  etapasTotal: number;
  porcentaje: number;
  seccionesProcesadas?: number;
  seccionesTotal?: number;
}

export const SectionsProgressCounter: React.FC<SectionsProgressCounterProps> = ({
  etapaIndice,
  etapasTotal,
  porcentaje,
  seccionesProcesadas,
  seccionesTotal,
}) => {
  const displayTotal = etapasTotal > 0 ? etapasTotal : 8;
  const displayIndice = Math.max(1, Math.min(etapaIndice || 1, displayTotal));

  return (
    <div
      data-testid="sections-progress-counter"
      className="rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#1C1C1C] px-4 py-3.5 flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2 font-mono text-base font-semibold text-slate-900 dark:text-zinc-100">
        <span>
          Etapa {displayIndice} de {displayTotal} • {porcentaje}%
        </span>
      </div>
      {seccionesProcesadas !== undefined && seccionesTotal !== undefined && (
        <span className="font-mono text-xs text-slate-600 dark:text-zinc-400">
          Secciones analizadas: {seccionesProcesadas} / {seccionesTotal}
        </span>
      )}
    </div>
  );
};


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
  return (
    <div
      data-testid="sections-progress-counter"
      className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2 font-mono text-base font-semibold text-slate-900">
        <span>
          Etapa {etapaIndice} de {etapasTotal} • {porcentaje}%
        </span>
      </div>
      {seccionesProcesadas !== undefined && seccionesTotal !== undefined && (
        <span className="font-mono text-xs text-slate-600">
          Secciones analizadas: {seccionesProcesadas} / {seccionesTotal}
        </span>
      )}
    </div>
  );
};


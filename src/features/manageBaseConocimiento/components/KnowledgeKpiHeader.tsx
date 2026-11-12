import React from 'react';
import type { ResumenBaseConocimiento } from '@/api/types';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';

interface KnowledgeKpiHeaderProps {
  summary: ResumenBaseConocimiento;
}

export const KnowledgeKpiHeader: React.FC<KnowledgeKpiHeaderProps> = ({ summary }) => {
  const isEmpty = summary.estado_indexacion === 'sin_indexar';
  const isIndexing = summary.estado_indexacion === 'indexando';

  return (
    <div
      data-tour="knowledge-kpis"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-slate-200/80"
    >
      {/* KPI 1: Contratos */}
      <div className="space-y-1.5 sm:pr-4">
        <p className={TYPOGRAPHY.label}>Contratos de Experiencia</p>
        <div className="flex items-baseline gap-2">
          <span className={`${TYPOGRAPHY.title} text-2xl`}>{summary.contratos_indexados}</span>
          <span className={TYPOGRAPHY.label}>Contratos</span>
        </div>
        <p className={TYPOGRAPHY.label}>Último: {summary.ultimo_contrato_fecha}</p>
      </div>

      {/* KPI 2: Equipo Clave */}
      <div className="space-y-1.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
        <p className={TYPOGRAPHY.label}>Equipo Clave / Hojas de Vida</p>
        <div className="flex items-baseline gap-2">
          <span className={`${TYPOGRAPHY.title} text-2xl`}>{summary.perfiles_acreditados}</span>
          <span className={TYPOGRAPHY.label}>
            {isEmpty ? 'Hojas de Vida' : 'Perfiles Acreditados'}
          </span>
        </div>
        <p className={TYPOGRAPHY.label}>
          {isEmpty ? 'Sin registros' : `${summary.certificaciones_iso} certificaciones ISO`}
        </p>
      </div>

      {/* KPI 3: Indicadores Financieros */}
      <div className="space-y-1.5 lg:border-l lg:border-slate-200/80 lg:pl-6">
        <p className={TYPOGRAPHY.label}>Indicadores Financieros</p>
        <p className={`${TYPOGRAPHY.title} text-xl`}>
          {isEmpty ? 'No Registrado' : `SMMLV Base: ${summary.smmlv_base}`}
        </p>
        <div className="flex items-center gap-2">
          <span className={TYPOGRAPHY.label}>Capacidad Residual:</span>
          {summary.capacidad_residual === 'Validada' ? (
            <span className="text-emerald-700 text-xs font-medium">
              Validada
            </span>
          ) : (
            <span className="text-slate-600 text-xs font-medium">
              Pendiente
            </span>
          )}
        </div>
      </div>

      {/* KPI 4: Documentos Registrados */}
      <div className="space-y-1.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
        <p className={TYPOGRAPHY.label}>Soportes Registrados</p>
        <div className="flex items-baseline gap-2">
          <span className={`${TYPOGRAPHY.title} text-2xl`}>{summary.fragmentos_activos}</span>
          <span className={TYPOGRAPHY.label}>Secciones Activas</span>
        </div>
        <div>
          {isEmpty ? (
            <span className="text-slate-500 text-xs font-medium">
              Sin cargar
            </span>
          ) : isIndexing ? (
            <span className="text-amber-700 text-xs font-medium">
              Procesando 43%
            </span>
          ) : (
            <span className="text-emerald-700 text-xs font-medium">
              Actualizado 100%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

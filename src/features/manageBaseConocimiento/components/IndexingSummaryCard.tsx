import React from 'react';
import type { ResumenBaseConocimiento } from '@/api/types';

interface IndexingSummaryCardProps {
  summary: ResumenBaseConocimiento;
}

export const IndexingSummaryCard: React.FC<IndexingSummaryCardProps> = ({ summary }) => {
  const renderBadge = (
    estado: 'Verificado' | 'Sin datos' | 'Falló' | 'Parcial' | 'En proceso' | 'En cola'
  ) => {
    const styles: Record<string, string> = {
      Verificado: 'text-emerald-700',
      'Sin datos': 'text-slate-500',
      Falló: 'text-red-700',
      Parcial: 'text-amber-700',
      'En proceso': 'text-blue-700',
      'En cola': 'text-slate-500',
    };

    return (
      <span
        className={`text-xs font-medium ${
          styles[estado] || styles['Sin datos']
        }`}
      >
        {estado}
      </span>
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-medium text-slate-500">
              <th className="py-2.5 px-3.5">Resumen de validación</th>
              <th className="py-2.5 px-3.5">Resultado</th>
              <th className="py-2.5 px-3.5">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.validaciones.map((row, idx) => (
              <tr key={idx}>
                <td className="py-2.5 px-3.5 text-slate-800 font-normal">{row.criterio}</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{row.resultado}</td>
                <td className="py-2.5 px-3.5">{renderBadge(row.estado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500">{summary.ultima_carga_fecha}</p>
    </div>
  );
};


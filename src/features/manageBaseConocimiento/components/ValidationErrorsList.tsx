import React from 'react';
import type { ErrorValidacionConocimiento } from '@/api/types';

interface ValidationErrorsListProps {
  archivoNombre?: string;
  errors: ErrorValidacionConocimiento[];
  onRetry: () => void;
}

export const ValidationErrorsList: React.FC<ValidationErrorsListProps> = ({
  archivoNombre = 'contratos.json',
  errors,
  onRetry,
}) => {
  return (
    <div
      role="alert"
      data-testid="validation-errors-422"
      className="rounded-xl bg-red-50/70 border border-red-200 p-4 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-red-700 font-mono text-[11px] font-medium">
            [Carga Rechazada]
          </span>
          <span className="text-xs font-semibold text-red-900">
            Se encontraron {errors.length} observaciones · se conserva la información actual
          </span>
        </div>
        <span className="font-mono text-xs text-slate-600">{archivoNombre}</span>
      </div>

      <div className="bg-white border border-red-100 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500 bg-slate-50/50">
              <th className="py-2 px-3 w-16">Línea</th>
              <th className="py-2 px-3 w-48">Campo</th>
              <th className="py-2 px-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {errors.map((err, idx) => (
              <tr key={idx}>
                <td className="py-2.5 px-3 font-mono text-slate-700">{err.linea}</td>
                <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{err.campo}</td>
                <td className="py-2.5 px-3 text-slate-700">{err.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <button
          type="button"
          onClick={onRetry}
          className="px-3.5 py-2 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 text-xs font-semibold transition-colors"
        >
          Corrija los campos señalados y vuelva a intentar
        </button>
      </div>
    </div>
  );
};


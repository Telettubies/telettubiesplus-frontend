import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export const ReplaceWarningBanner: React.FC = () => {
  return (
    <div
      role="note"
      data-testid="replace-warning-banner"
      className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs"
    >
      <FiAlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        <span className="font-medium">Nota:</span> La carga de un nuevo archivo reemplaza la versión completa anterior de forma atómica para mantener actualizada la información de la organización.
      </p>
    </div>
  );
};


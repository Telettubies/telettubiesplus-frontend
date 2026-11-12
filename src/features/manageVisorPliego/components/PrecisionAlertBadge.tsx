import React from 'react';
import type { PrecisionUbicacion } from '@/api/types';

export interface PrecisionAlertBadgeProps {
  precision: PrecisionUbicacion;
}

export const PrecisionAlertBadge: React.FC<PrecisionAlertBadgeProps> = ({ precision }) => {
  if (precision === 'exacta') {
    return null;
  }

  if (precision === 'aproximada') {
    return (
      <div
        role="status"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700"
      >
        <span>Ubicación aproximada</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700"
    >
      <span>Ubicación aproximada en esta página</span>
    </div>
  );
};


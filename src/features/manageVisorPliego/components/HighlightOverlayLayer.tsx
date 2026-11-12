import React from 'react';
import type { UbicacionPliego } from '@/api/types';
import { normalizeBoxCoordinates } from '../utils/normalizeBoxCoordinates';
import { PrecisionAlertBadge } from './PrecisionAlertBadge';

export interface HighlightOverlayLayerProps {
  ubicacion: UbicacionPliego;
  reqCode?: string;
}

export const HighlightOverlayLayer: React.FC<HighlightOverlayLayerProps> = ({
  ubicacion,
  reqCode = 'REQ-014',
}) => {
  const boxes = normalizeBoxCoordinates(ubicacion);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {ubicacion.precision !== 'exacta' && (
        <div className="absolute left-4 top-2 z-20">
          <PrecisionAlertBadge precision={ubicacion.precision} />
        </div>
      )}
      {boxes.map((box) => (
        <div
          key={box.id}
          data-testid="pdf-highlight-box"
          style={{
            position: 'absolute',
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            backgroundColor: 'var(--color-pdf-highlight, rgba(255, 235, 59, 0.42))',
          }}
          className="rounded-[3px] border border-[#F59E0B] dark:border-[#3ECF8E] transition-all duration-300"
        >
          {reqCode && (
            <span className="absolute -top-5 right-0 rounded-t bg-[#FDE68A] dark:bg-[#0D7A4D] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#92400E] dark:text-white border border-b-0 border-[#F59E0B] dark:border-[#3ECF8E]">
              {reqCode}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};


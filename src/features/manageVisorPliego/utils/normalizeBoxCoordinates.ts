import type { UbicacionPliego, ZonaCoordenada } from '@/api/types';

export interface CssBoxPercentages {
  id?: string;
  left: string;
  top: string;
  width: string;
  height: string;
}

/**
 * Convierte coordenadas relativas normalizadas [0, 1] a porcentajes CSS exactos (RF-26 / HU-F10).
 * Esto garantiza que los resaltados escalen automáticamente con el zoom y el redimensionamiento.
 */
export function normalizeBoxToCssPercentages(zona: ZonaCoordenada): CssBoxPercentages {
  const clamp = (val: number) => Math.max(0, Math.min(1, val));
  return {
    left: `${Number((clamp(zona.x) * 100).toFixed(4))}%`,
    top: `${Number((clamp(zona.y) * 100).toFixed(4))}%`,
    width: `${Number((clamp(zona.width) * 100).toFixed(4))}%`,
    height: `${Number((clamp(zona.height) * 100).toFixed(4))}%`,
  };
}

export function normalizeBoxCoordinates(ubicacion: UbicacionPliego): CssBoxPercentages[] {
  if (!ubicacion || ubicacion.precision === 'solo_pagina' || !ubicacion.zonas) {
    return [];
  }
  return ubicacion.zonas.map((zona, idx) => ({
    id: `box-${ubicacion.pagina}-${idx}`,
    ...normalizeBoxToCssPercentages(zona),
  }));
}

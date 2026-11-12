import { useState, useEffect } from 'react';
import type { ItemVerificable, UbicacionPliego } from '@/api/types';

export function usePdfJumpAndHighlight(activeItem: ItemVerificable | null, totalPages = 74) {
  const [currentPage, setCurrentPage] = useState<number>(activeItem?.ubicacion?.pagina ?? 1);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [searchInPdf, setSearchInPdf] = useState<string>('');

  useEffect(() => {
    if (activeItem?.ubicacion?.pagina) {
      setCurrentPage(activeItem.ubicacion.pagina);
    }
  }, [activeItem?.id, activeItem?.ubicacion?.pagina]);

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(clamped);
  };

  const zoomIn = () => setZoomPercent((z) => Math.min(150, z + 10));
  const zoomOut = () => setZoomPercent((z) => Math.max(70, z - 10));

  const activeUbicacion: UbicacionPliego = activeItem?.ubicacion ?? {
    pagina: currentPage,
    precision: 'solo_pagina',
    zonas: [],
  };

  return {
    currentPage,
    setCurrentPage: goToPage,
    zoomPercent,
    zoomIn,
    zoomOut,
    searchInPdf,
    setSearchInPdf,
    activeUbicacion,
  };
}


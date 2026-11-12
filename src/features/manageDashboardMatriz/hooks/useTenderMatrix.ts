import { useState, useCallback } from 'react';
import { MOCK_RESULTADO_LICITACION } from '../mockups/matrizResultado.mock';
import { sortGapsHabilitantesFirst } from '../utils/sortGapsHabilitantesFirst';
import type {
  ResultadoLicitacion,
  ItemVerificable,
  EstadoCumplimiento,
  RecomendacionLicitacion,
} from '@/api/types';

export type MatrixVisualPreset =
  | 'default' // Pág. 32: REQ-014 Cita verificada 100%
  | 'unverified_citation' // Pág. 36: Cita No Verificada en Fuente (78% < 85%)
  | 'expired_pdf_url' // Pág. 35: URL temporal S3 expirada
  | 'skeleton'; // Pág. 37: Skeleton loading

export function useTenderMatrix(initialResult: ResultadoLicitacion = MOCK_RESULTADO_LICITACION) {
  const [resultado, setResultado] = useState<ResultadoLicitacion>(initialResult);
  // Por defecto el mock no selecciona ningún ítem hasta que el usuario haga clic
  const [selectedItem, setSelectedItem] = useState<ItemVerificable | null>(null);
  const [expandedDetailItem, setExpandedDetailItem] = useState<ItemVerificable | null>(null);
  const [visualPreset, setVisualPreset] = useState<MatrixVisualPreset>('default');

  const applyHumanReviewUpdate = useCallback(
    (
      itemId: string,
      nuevoEstado: EstadoCumplimiento,
      comentario: string,
      autorNombre = 'Laura Gómez'
    ) => {
      setResultado((prev) => {
        const updatedItems = prev.items.map((item) => {
          if (item.id !== itemId && item.codigo_req !== itemId) return item;
          const newHistory = [
            ...item.revisiones,
            {
              id: `rev-${Date.now()}`,
              autor_nombre: autorNombre,
              fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
              estado_anterior: item.estado,
              estado_nuevo: nuevoEstado,
              comentario,
            },
          ];
          return {
            ...item,
            estado: nuevoEstado,
            revisiones: newHistory,
          };
        });

        const hasHabilitanteNoCumple = updatedItems.some(
          (i) => i.categoria === 'habilitante' && i.estado === 'no_cumple'
        );
        const nextRecomendacion: RecomendacionLicitacion =
          nuevoEstado === 'no_cumple' && hasHabilitanteNoCumple
            ? 'no_presentarse'
            : prev.recomendacion;

        return {
          ...prev,
          recomendacion: nextRecomendacion,
          items: updatedItems,
          brechas: sortGapsHabilitantesFirst(updatedItems),
        };
      });
    },
    []
  );

  return {
    resultado,
    setResultado,
    selectedItem,
    setSelectedItem,
    expandedDetailItem,
    setExpandedDetailItem,
    visualPreset,
    setVisualPreset,
    applyHumanReviewUpdate,
  };
}


import { axiosClient } from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import type { ResolucionHumanaPayload } from '@/api/types';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { MOCK_REVISIONES_PENDIENTES, type ConflictReviewItem } from '../mockups/revisiones.mock';

export const revisionService = {
  async getRevisionesPendientes(_licitacionId: string): Promise<ConflictReviewItem[]> {
    if (shouldUseMock('VITE_MOCK_REVISION')) {
      return [...MOCK_REVISIONES_PENDIENTES];
    }
    const { data } = await axiosClient.get<ConflictReviewItem[]>(
      `${ENDPOINTS.licitaciones.resultado(_licitacionId)}/revisiones`
    );
    return data;
  },

  async resolverItem(
    licitacionId: string,
    itemId: string,
    payload: ResolucionHumanaPayload
  ): Promise<{ recalculado: boolean; mensaje: string }> {
    if (!payload.comentario || !payload.comentario.trim()) {
      throw new Error(
        'El comentario de justificación es obligatorio para garantizar la trazabilidad de la decisión (ISO/IEC 25010 / HU-B23).'
      );
    }

    if (shouldUseMock('VITE_MOCK_REVISION')) {
      await new Promise((res) => setTimeout(res, 250));
      return {
        recalculado: true,
        mensaje: 'Decisión guardada y recomendación actualizada.',
      };
    }

    const { data } = await axiosClient.patch<{ recalculado: boolean; mensaje: string }>(
      ENDPOINTS.licitaciones.resolverItem(licitacionId, itemId),
      payload
    );
    return data;
  },
};

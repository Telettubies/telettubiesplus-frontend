import { services } from '@/features/connected/services';
import { itemView,notifyResult } from '@/features/connected/adapters';
import { axiosClient } from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import type { ResolucionHumanaPayload } from '@/api/types';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { MOCK_REVISIONES_PENDIENTES, type ConflictReviewItem } from '../mockups/revisiones.mock';

export const revisionService = {
  async getRevisionesPendientes(_licitacionId: string): Promise<ConflictReviewItem[]> {
    if(!shouldUseMock('VITE_MOCK_REVISION')){const r=await services.result(_licitacionId);if(r.kind!=='ready')return [];return r.value.items.filter(i=>i.estado==='revision').map(i=>({...itemView(i),codigo:i.codigo_req,es_habilitante:i.categoria==='habilitante',requisito_resumido:i.descripcion_item,cita_literal_pliego:i.texto_requisito_literal,evidencia_fragmento:i.evidencia?.cita_literal||'',motivo_badge:i.es_ambiguo?'Redacción ambigua' as const:'Requiere verificación' as const,capitulo_label:`Numeral ${i.numeral}`,similitud_porcentaje:(i.evidencia?.similitud||0)*100}));}
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

    if(!shouldUseMock('VITE_MOCK_REVISION')){if(payload.estado==='revision')throw new Error('Selecciona una decisión de cumplimiento.');const r=await services.result(licitacionId);if(r.kind!=='ready')throw new Error('Espera a que termine la reevaluación.');const item=r.value.items.find(i=>i.id===itemId);if(!item?.resultado_id)throw new Error('El ítem no tiene resultado para revisar.');await services.review(item.resultado_id,payload.estado,payload.comentario);notifyResult();return {recalculado:false,mensaje:'Revisión guardada. Recomendación en reevaluación.'};}
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

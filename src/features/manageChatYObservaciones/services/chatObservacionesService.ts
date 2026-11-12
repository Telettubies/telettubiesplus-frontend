import { axiosClient } from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import type { BorradorObservacion, MensajeChat } from '@/api/types';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import {
  MOCK_BORRADORES_OBSERVACION,
  MOCK_CHAT_HISTORIAL,
} from '../mockups/chatObservaciones.mock';

export const chatObservacionesService = {
  async getHistorialChat(_licitacionId: string): Promise<{
    mensajes: MensajeChat[];
    cuota_disponible: number;
    cuota_total: number;
  }> {
    if (shouldUseMock('VITE_MOCK_CHAT')) {
      return {
        mensajes: [...MOCK_CHAT_HISTORIAL],
        cuota_disponible: 18,
        cuota_total: 30,
      };
    }
    const { data } = await axiosClient.get<{
      mensajes: MensajeChat[];
      cuota_disponible: number;
      cuota_total: number;
    }>(ENDPOINTS.licitaciones.chat(_licitacionId));
    return data;
  },

  async enviarPregunta(licitacionId: string, pregunta: string): Promise<MensajeChat> {
    if (shouldUseMock('VITE_MOCK_CHAT')) {
      await new Promise((res) => setTimeout(res, 250));
      const lower = pregunta.toLowerCase();
      if (lower.includes('noticias') || lower.includes('clima') || lower.includes('fútbol')) {
        return {
          id: `msg-${Date.now()}`,
          rol: 'FueraDeAlcance',
          contenido:
            'Esta consulta excede los términos del pliego de condiciones. El asistente solo responde sobre cláusulas, anexos y requisitos de esta licitación.',
          creado_en: new Date().toISOString(),
        };
      }
      return {
        id: `msg-${Date.now()}`,
        rol: 'asistente',
        contenido:
          'Según el pliego de condiciones, los criterios y condiciones aplicables se encuentran detallados en el Capítulo Jurídico y Técnico.',
        creado_en: new Date().toISOString(),
        referencias: [{ etiqueta: 'Numeral 3.2.1', pagina: 14 }],
      };
    }

    const { data } = await axiosClient.post<MensajeChat>(
      ENDPOINTS.licitaciones.chat(licitacionId),
      { pregunta }
    );
    return data;
  },

  async generarBorradorObservacion(
    licitacionId: string,
    requisitoCodigo: string
  ): Promise<BorradorObservacion> {
    if (shouldUseMock('VITE_MOCK_CHAT')) {
      await new Promise((res) => setTimeout(res, 300));
      return (
        MOCK_BORRADORES_OBSERVACION[requisitoCodigo] ?? MOCK_BORRADORES_OBSERVACION['REQ-019']
      );
    }

    const { data } = await axiosClient.post<BorradorObservacion>(
      ENDPOINTS.licitaciones.observaciones(licitacionId),
      { requisito_id: requisitoCodigo }
    );
    return data;
  },
};

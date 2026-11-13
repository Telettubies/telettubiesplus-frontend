import { services } from '@/features/connected/services';
import { progressView } from '@/features/connected/adapters';
import { axiosClient } from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import {
  MOCK_PROGRESO_EN_CURSO_ETAPA_4,
  MOCK_PROGRESO_COMPLETADO,
} from '../mockups/progreso.mock';
import type { ProgresoAnalisis } from '@/api/types';

export interface UploadTenderResponse {
  licitacion_id: string;
  trabajo_id: string;
  ya_analizado_en_cache?: boolean;
}

export const cargaProgresoService = {
  async uploadTenderPdf(file: File, useCache = true): Promise<UploadTenderResponse> {
    if (!shouldUseMock('VITE_MOCK_CARGA')) { const r=await services.upload(file); return {licitacion_id:r.licitacion.id,trabajo_id:r.trabajo.id,ya_analizado_en_cache:r.duplicada}; }
    if (shouldUseMock('VITE_MOCK_CARGA')) {
      await new Promise((res) => setTimeout(res, 200));
      const isDuplicateCached =
        useCache && file.name.toLowerCase().includes('duplicado');
      return {
        licitacion_id: 'LP-MIN-001-2026',
        trabajo_id: 'job-live-004',
        ya_analizado_en_cache: isDuplicateCached,
      };
    }

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('usar_cache', String(useCache));
    const { data } = await axiosClient.post<UploadTenderResponse>(
      API_ENDPOINTS.LICITACIONES.UPLOAD,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  async getAnalysisProgress(licitacionId: string, pollTick = 1): Promise<ProgresoAnalisis> {
    if (!shouldUseMock('VITE_MOCK_CARGA')) return progressView(await services.progress(licitacionId));
    if (shouldUseMock('VITE_MOCK_CARGA')) {
      if (pollTick >= 3) {
        return {
          ...MOCK_PROGRESO_COMPLETADO,
          licitacion_id: licitacionId,
        };
      }
      return {
        ...MOCK_PROGRESO_EN_CURSO_ETAPA_4,
        licitacion_id: licitacionId,
      };
    }

    const { data } = await axiosClient.get<ProgresoAnalisis>(
      API_ENDPOINTS.LICITACIONES.PROGRESS(licitacionId)
    );
    return data;
  },
};

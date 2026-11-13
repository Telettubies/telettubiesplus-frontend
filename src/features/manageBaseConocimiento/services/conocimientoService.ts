import { services } from '@/features/connected/services';
import { knowledgeView } from '@/features/connected/adapters';
import { axiosClient } from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import {
  MOCK_CONOCIMIENTO_VERIFICADO,
  MOCK_CONOCIMIENTO_RECHAZADO_422,
} from '../mockups/conocimiento.mock';
import type { ResumenBaseConocimiento } from '@/api/types';

export const conocimientoService = {
  async getKnowledgeStatus(): Promise<ResumenBaseConocimiento> {
    if (!shouldUseMock('VITE_MOCK_CONOCIMIENTO')) return knowledgeView(await services.knowledge());
    if (shouldUseMock('VITE_MOCK_CONOCIMIENTO')) {
      await new Promise((res) => setTimeout(res, 150));
      return MOCK_CONOCIMIENTO_VERIFICADO;
    }
    const { data } = await axiosClient.get<ResumenBaseConocimiento>(API_ENDPOINTS.CONOCIMIENTO.STATUS);
    return data;
  },

  async uploadKnowledgeArchive(
    file: File,
    simulate422 = false
  ): Promise<ResumenBaseConocimiento> {
    if (!shouldUseMock('VITE_MOCK_CONOCIMIENTO')) return knowledgeView((await services.uploadKnowledge(file)).resumen);
    if (shouldUseMock('VITE_MOCK_CONOCIMIENTO')) {
      await new Promise((res) => setTimeout(res, 350));
      if (simulate422 || file.name.toLowerCase().includes('error')) {
        return MOCK_CONOCIMIENTO_RECHAZADO_422;
      }
      return {
        ...MOCK_CONOCIMIENTO_VERIFICADO,
        ultimo_contrato_fecha: '2026-11-11',
        ultima_carga_fecha: 'Carga: 2026-11-11 15:58 -05:00 · v2026.11.1',
        archivo_nombre: file.name || 'contratos_andina_2026-11.zip',
      };
    }

    const formData = new FormData();
    formData.append('archivo', file);
    const { data } = await axiosClient.post<ResumenBaseConocimiento>(
      API_ENDPOINTS.CONOCIMIENTO.UPLOAD,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },
};

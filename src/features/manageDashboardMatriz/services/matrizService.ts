import { services } from '@/features/connected/services';
import { matrixView } from '@/features/connected/adapters';
import { axiosClient } from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { MOCK_RESULTADO_LICITACION } from '../mockups/matrizResultado.mock';
import type { ResultadoLicitacion } from '@/api/types';

export const matrizService = {
  async getResultadoLicitacion(licitacionId: string): Promise<ResultadoLicitacion> {
    if (!shouldUseMock('VITE_MOCK_MATRIZ')) { const r=await services.result(licitacionId); if(r.kind!=='ready') throw new Error(r.value.error||'El análisis sigue en proceso.'); return matrixView(r.value); }
    if (shouldUseMock('VITE_MOCK_MATRIZ')) {
      await new Promise((res) => setTimeout(res, 120));
      return {
        ...MOCK_RESULTADO_LICITACION,
        licitacion_id: licitacionId || MOCK_RESULTADO_LICITACION.licitacion_id,
      };
    }
    const { data } = await axiosClient.get<ResultadoLicitacion>(
      API_ENDPOINTS.LICITACIONES.RESULTADO(licitacionId)
    );
    return data;
  },
};

import { axiosClient } from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { MOCK_PORTAFOLIO_LICITACIONES } from '../mockups/licitacionesList.mock';
import type { LicitacionPortafolioItem } from '@/api/types';

export const licitacionesListService = {
  async getTenders(): Promise<LicitacionPortafolioItem[]> {
    if (shouldUseMock('VITE_MOCK_PANEL')) {
      await new Promise((res) => setTimeout(res, 150));
      return [...MOCK_PORTAFOLIO_LICITACIONES];
    }
    const { data } = await axiosClient.get<LicitacionPortafolioItem[]>(
      API_ENDPOINTS.LICITACIONES.LIST
    );
    return data;
  },
};

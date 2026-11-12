import { axiosClient } from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { shouldUseMock } from '@/shared/utils/mockSwitch';

export const visorPdfService = {
  async downloadPdfOnce(pdfUrlTemporal: string): Promise<Blob> {
    if (shouldUseMock('VITE_MOCK_VISOR')) {
      if (typeof fetch !== 'undefined' && pdfUrlTemporal.startsWith('/')) {
        try {
          const resp = await fetch(pdfUrlTemporal);
          if (resp.ok) {
            return await resp.blob();
          }
        } catch {
          // Fallback to synthetic PDF blob in tests or offline environments
        }
      }
      return new Blob(['%PDF-1.7 synthetic cached document LP-MIN-001-2026'], {
        type: 'application/pdf',
      });
    }

    const response = await axiosClient.get(pdfUrlTemporal, {
      responseType: 'blob',
    });
    return response.data;
  },

  async refreshPresignedUrl(licitacionId: string): Promise<string> {
    if (shouldUseMock('VITE_MOCK_VISOR')) {
      await new Promise((res) => setTimeout(res, 150));
      return `/Pliego_Condiciones_v1.pdf?renewed=${Date.now()}`;
    }
    const { data } = await axiosClient.get<{ pdf_url_temporal: string }>(
      API_ENDPOINTS.LICITACIONES.REFRESH_PDF_URL(licitacionId)
    );
    return data.pdf_url_temporal;
  },
};

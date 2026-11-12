import { renderHook, waitFor } from '@testing-library/react';
import {
  usePdfBlobCache,
  clearPdfBlobCacheForTests,
  getPdfDownloadsCountForTests,
} from '../hooks/usePdfBlobCache';

describe('usePdfBlobCache — Descarga Única en Memoria del PDF (HU-F10 / S-10)', () => {
  beforeEach(() => {
    clearPdfBlobCacheForTests();
  });

  it('descarga el archivo PDF desde la URL temporal una sola vez y reutiliza el Blob en memoria en montajes posteriores', async () => {
    const fakeBlob = new Blob(['%PDF-1.4 mock'], { type: 'application/pdf' });
    const mockDownloader = jest.fn().mockResolvedValue(fakeBlob);

    const { result, rerender } = renderHook(() =>
      usePdfBlobCache({
        licitacionId: 'LP-MIN-001-2026',
        initialUrl: 'https://s3.mock/pliego-presigned.pdf',
        customDownloader: mockDownloader,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoadingPdf).toBe(false);
    });

    expect(mockDownloader).toHaveBeenCalledTimes(1);
    expect(getPdfDownloadsCountForTests()).toBe(1);

    // Rerenderizar al cambiar de requisito en la matriz no debe volver a descargar el PDF
    rerender();
    expect(mockDownloader).toHaveBeenCalledTimes(1);
  });
});


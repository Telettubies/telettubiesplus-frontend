import { useState, useEffect, useCallback } from 'react';
import { visorPdfService } from '../services/visorPdfService';

// Caché en memoria del cliente (por licitacionId) para garantizar descarga única (HU-F10 / S-10)
const pdfMemoryBlobCache = new Map<string, Blob>();
let totalDownloadsCounter = 0;

export function clearPdfBlobCacheForTests() {
  pdfMemoryBlobCache.clear();
  totalDownloadsCounter = 0;
}

export function getPdfDownloadsCountForTests() {
  return totalDownloadsCounter;
}

interface UsePdfBlobCacheOptions {
  licitacionId: string;
  initialUrl: string;
  customDownloader?: (url: string) => Promise<Blob>;
  customUrlRefresher?: (licitacionId: string) => Promise<string>;
}

/**
 * Hook de descarga única y caché en memoria del PDF (HU-F10 / S-10):
 * - Descarga el PDF una sola vez al abrir la licitación y lo conserva como Blob en memoria.
 * - Cambiar entre filas de la matriz jamás vuelve a descargar el PDF.
 * - Permite renovar silenciosamente la URL prefirmada de S3 si caduca, conservando la página actual.
 */
export function usePdfBlobCache({
  licitacionId,
  initialUrl,
  customDownloader,
  customUrlRefresher,
}: UsePdfBlobCacheOptions) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(
    () => pdfMemoryBlobCache.get(licitacionId) ?? null
  );
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(
    !pdfMemoryBlobCache.has(licitacionId)
  );
  const [isUrlExpired, setIsUrlExpired] = useState<boolean>(false);

  const downloadOrGetFromCache = useCallback(
    async (urlToFetch: string, forceReload = false) => {
      if (!forceReload && pdfMemoryBlobCache.has(licitacionId)) {
        setPdfBlob(pdfMemoryBlobCache.get(licitacionId)!);
        setIsLoadingPdf(false);
        return pdfMemoryBlobCache.get(licitacionId)!;
      }

      setIsLoadingPdf(true);
      const downloader = customDownloader || visorPdfService.downloadPdfOnce;
      try {
        totalDownloadsCounter += 1;
        const blob = await downloader(urlToFetch);
        pdfMemoryBlobCache.set(licitacionId, blob);
        setPdfBlob(blob);
        setIsUrlExpired(false);
        setIsLoadingPdf(false);
        return blob;
      } catch {
        // Si la URL temporal expiró antes de completar la descarga, pide una nueva silenciosamente
        const refresher = customUrlRefresher || visorPdfService.refreshPresignedUrl;
        try {
          const freshUrl = await refresher(licitacionId);
          totalDownloadsCounter += 1;
          const retryBlob = await downloader(freshUrl);
          pdfMemoryBlobCache.set(licitacionId, retryBlob);
          setPdfBlob(retryBlob);
          setIsUrlExpired(false);
          setIsLoadingPdf(false);
          return retryBlob;
        } catch {
          setIsUrlExpired(true);
          setIsLoadingPdf(false);
          return null;
        }
      }
    },
    [licitacionId, customDownloader, customUrlRefresher]
  );

  useEffect(() => {
    downloadOrGetFromCache(initialUrl, false);
  }, [licitacionId, initialUrl, downloadOrGetFromCache]);

  const regeneratePresignedSession = useCallback(async () => {
    const refresher = customUrlRefresher || visorPdfService.refreshPresignedUrl;
    const freshUrl = await refresher(licitacionId);
    await downloadOrGetFromCache(freshUrl, true);
  }, [licitacionId, customUrlRefresher, downloadOrGetFromCache]);

  return {
    pdfBlob,
    isLoadingPdf,
    isUrlExpired,
    setIsUrlExpired,
    regeneratePresignedSession,
  };
}


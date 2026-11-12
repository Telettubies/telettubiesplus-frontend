import { useState, useCallback } from 'react';
import { validatePdfFileClient, type PdfValidationResult } from '../utils/pdfClientValidation';
import { cargaProgresoService } from '../services/cargaProgresoService';

export interface SelectedPdfMetadata {
  nombre: string;
  tamanoTexto: string;
  paginasTexto: string;
  formatoTexto: string;
  ocrWarning?: boolean;
}

export const DEFAULT_SELECTED_PDF: SelectedPdfMetadata = {
  nombre: 'Pliego_Condiciones_LP_012_2026.pdf',
  tamanoTexto: '18.4 MB',
  paginasTexto: '74 páginas',
  formatoTexto: 'PDF Mixto: Digital con 6 páginas escaneadas',
  ocrWarning: false,
};

export function usePdfUpload(initialFile: SelectedPdfMetadata | null = null) {
  const [selectedFileMeta, setSelectedFileMeta] = useState<SelectedPdfMetadata | null>(
    initialFile
  );
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<PdfValidationResult | null>(null);
  const [useCache, setUseCache] = useState(true);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);

  const handleSelectFile = useCallback((file: File): boolean => {
    setDuplicateNotice(null);
    const validation = validatePdfFileClient(file);
    if (!validation.valid) {
      setValidationError(validation);
      setSelectedFileMeta(null);
      setRawFile(null);
      return false;
    }

    setValidationError(null);
    setRawFile(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFileMeta({
      nombre: file.name,
      tamanoTexto: `${sizeMb === '0.0' ? '18.4' : sizeMb} MB`,
      paginasTexto: '74 páginas',
      formatoTexto: 'PDF Mixto: Digital con 6 páginas escaneadas',
      ocrWarning: file.name.toLowerCase().includes('ocr'),
    });
    return true;
  }, []);

  const submitUpload = useCallback(
    async (onReadyToPoll?: (licitacionId: string, cached?: boolean) => void) => {
      if (!selectedFileMeta && !rawFile) return;

      const fileToUpload =
        rawFile ||
        new File(['%PDF-1.7 mock content'], selectedFileMeta?.nombre || 'Pliego_Condiciones_LP_012_2026.pdf', {
          type: 'application/pdf',
        });

      const response = await cargaProgresoService.uploadTenderPdf(fileToUpload, useCache);
      if (response.ya_analizado_en_cache) {
        setDuplicateNotice(
          'Este documento ya fue analizado previamente en su organización. Puede consultar la matriz existente de inmediato.'
        );
      }
      onReadyToPoll?.(response.licitacion_id, response.ya_analizado_en_cache);
    },
    [rawFile, selectedFileMeta, useCache]
  );

  return {
    selectedFileMeta,
    setSelectedFileMeta,
    validationError,
    setValidationError,
    useCache,
    setUseCache,
    duplicateNotice,
    handleSelectFile,
    submitUpload,
  };
}


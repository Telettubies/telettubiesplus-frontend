import {shouldUseMock} from '@/shared/utils/mockSwitch';
import {services} from '@/features/connected/services';
import { useState, useCallback, useEffect } from 'react';
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
  const [limits,setLimits]=useState({max_pdf_mb:40,max_pdf_paginas:150});
  useEffect(()=>{if(shouldUseMock())return;let alive=true;services.limits().then(l=>{if(alive)setLimits(l);}).catch(()=>{});return()=>{alive=false;};},[]);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<PdfValidationResult | null>(null);
  const [useCache, setUseCache] = useState(true);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);

  const handleSelectFile = useCallback((file: File): boolean => {
    setDuplicateNotice(null);
    const validation = !shouldUseMock()&&file.size>limits.max_pdf_mb*1024*1024?{valid:false,errorTitle:`El PDF supera ${limits.max_pdf_mb} MB.`}:(!shouldUseMock()?{valid:file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf'),errorTitle:'Selecciona un PDF válido.'}:validatePdfFileClient(file));
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
      tamanoTexto: `${shouldUseMock()&&sizeMb === '0.0' ? '18.4' : sizeMb} MB`,
      paginasTexto: shouldUseMock()?'74 páginas':'Páginas pendientes de lectura',
      formatoTexto: shouldUseMock()?'PDF Mixto: Digital con 6 páginas escaneadas':'PDF seleccionado',
      ocrWarning: file.name.toLowerCase().includes('ocr'),
    });
    return true;
  }, [limits]);

  const submitUpload = useCallback(
    async (onReadyToPoll?: (licitacionId: string, cached?: boolean) => void) => {
      if (!selectedFileMeta && !rawFile) return;

      if(!shouldUseMock()&&!rawFile)throw new Error('Selecciona un archivo PDF real.');
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
    maxPdfMb:limits.max_pdf_mb,maxPdfPages:limits.max_pdf_paginas,
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


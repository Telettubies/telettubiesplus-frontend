import { useState, useCallback } from 'react';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import {
  MOCK_CONOCIMIENTO_VERIFICADO,
  MOCK_CONOCIMIENTO_VACIO,
  MOCK_CONOCIMIENTO_RECHAZADO_422,
  MOCK_CONOCIMIENTO_INDEXANDO,
} from '../mockups/conocimiento.mock';
import { validateKnowledgeFile } from '../utils/filePrecheck';
import { conocimientoService } from '../services/conocimientoService';
import type { ResumenBaseConocimiento } from '@/api/types';

export type KnowledgeVisualMode =
  | 'default_verified' // Pág. 13
  | 'empty_initial' // Pág. 14
  | 'completed_success' // Pág. 15
  | 'rejected_422' // Pág. 16
  | 'indexing_live'; // Pág. 18

export function useKnowledgeBaseUpload() {
  const isMockEnabled = shouldUseMock('VITE_MOCK_CONOCIMIENTO');
  const [summary, setSummary] = useState<ResumenBaseConocimiento>(
    isMockEnabled ? MOCK_CONOCIMIENTO_VERIFICADO : MOCK_CONOCIMIENTO_VACIO
  );
  const [visualMode, setVisualMode] = useState<KnowledgeVisualMode>(
    isMockEnabled ? 'default_verified' : 'empty_initial'
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const switchMode = useCallback((mode: KnowledgeVisualMode) => {
    setClientError(null);
    setVisualMode(mode);
    setShowSuccessToast(mode === 'completed_success');

    if (mode === 'default_verified') {
      setSummary(MOCK_CONOCIMIENTO_VERIFICADO);
    } else if (mode === 'empty_initial') {
      setSummary(MOCK_CONOCIMIENTO_VACIO);
    } else if (mode === 'completed_success') {
      setSummary({
        ...MOCK_CONOCIMIENTO_VERIFICADO,
        ultimo_contrato_fecha: '2026-11-11',
        ultima_carga_fecha: 'Carga: 2026-11-11 15:58 -05:00 · v2026.11.1',
        archivo_nombre: 'contratos_andina_2026-11.zip · 18,4 MB',
      });
    } else if (mode === 'rejected_422') {
      setSummary(MOCK_CONOCIMIENTO_RECHAZADO_422);
    } else if (mode === 'indexing_live') {
      setSummary(MOCK_CONOCIMIENTO_INDEXANDO);
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setClientError(null);
    const check = validateKnowledgeFile(file);
    if (!check.valid) {
      setClientError(check.reason || 'Archivo inválido.');
      return;
    }

    setVisualMode('indexing_live');
    setSummary(MOCK_CONOCIMIENTO_INDEXANDO);

    const updated = await conocimientoService.uploadKnowledgeArchive(
      file,
      file.name.toLowerCase().includes('invalido') || file.name.toLowerCase().includes('error')
    );

    setSummary(updated);
    if (updated.estado_indexacion === 'rechazado') {
      setVisualMode('rejected_422');
      setShowSuccessToast(false);
    } else {
      setVisualMode('completed_success');
      setShowSuccessToast(true);
    }
  }, []);

  return {
    summary,
    visualMode,
    switchMode,
    clientError,
    showSuccessToast,
    setShowSuccessToast,
    handleFileSelect,
  };
}


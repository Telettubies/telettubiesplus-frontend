import { useState } from 'react';
import type { BorradorObservacion } from '@/api/types';
import { MOCK_BORRADORES_OBSERVACION } from '../mockups/chatObservaciones.mock';
import { chatObservacionesService } from '../services/chatObservacionesService';

export function useObservationDraft(licitacionId = 'LP-MIN-001-2026', initialReqCode = 'REQ-019') {
  const [selectedReqCode, setSelectedReqCode] = useState<string>(initialReqCode);
  const [draft, setDraft] = useState<BorradorObservacion | null>(
    initialReqCode ? MOCK_BORRADORES_OBSERVACION[initialReqCode] ?? MOCK_BORRADORES_OBSERVACION['REQ-019'] : null
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const selectClause = async (reqCode: string) => {
    setSelectedReqCode(reqCode);
    if (!reqCode) {
      setDraft(null);
      return;
    }
    setIsGenerating(true);
    try {
      const res = await chatObservacionesService.generarBorradorObservacion(licitacionId, reqCode);
      setDraft(res);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateDraftField = (
    field: 'hecho_cuestionado' | 'sustento_juridico' | 'solicitud_concreta',
    value: string
  ) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const formatFullDraftForClipboard = (): string => {
    if (!draft) return '';
    return [
      draft.destinatario,
      '',
      `Hecho / Cláusula cuestionada. ${draft.hecho_cuestionado}`,
      '',
      `Sustento jurídico / Argumento. ${draft.sustento_juridico}`,
      '',
      `Solicitud concreta. ${draft.solicitud_concreta}`,
    ].join('\n');
  };

  return {
    selectedReqCode,
    setSelectedReqCode,
    draft,
    setDraft,
    isGenerating,
    setIsGenerating,
    selectClause,
    updateDraftField,
    formatFullDraftForClipboard,
  };
}


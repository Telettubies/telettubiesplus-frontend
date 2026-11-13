import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { services } from '@/features/connected/services';
import { notifyError } from '@/features/connected/adapters';
import { useState, useEffect } from 'react';
import type { BorradorObservacion } from '@/api/types';
import { MOCK_BORRADORES_OBSERVACION } from '../mockups/chatObservaciones.mock';
import { chatObservacionesService } from '../services/chatObservacionesService';

export function useObservationDraft(licitacionId = 'LP-MIN-001-2026', initialReqCode = 'REQ-019') {
  const [selectedReqCode, setSelectedReqCode] = useState<string>(()=>shouldUseMock()?initialReqCode:'');
  const [draft, setDraft] = useState<BorradorObservacion | null>(
    shouldUseMock() && initialReqCode ? MOCK_BORRADORES_OBSERVACION[initialReqCode] ?? MOCK_BORRADORES_OBSERVACION['REQ-019'] : null
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [clauses,setClauses]=useState<{id:string;label:string}[]>([]);
  useEffect(()=>{if(shouldUseMock())return;let alive=true;services.result(licitacionId).then(r=>{if(alive&&r.kind==='ready')setClauses(r.value.items.filter((i,n,all)=>i.es_ambiguo&&all.findIndex(x=>x.requisito_id===i.requisito_id)===n).map(i=>({id:i.requisito_id,label:`${i.numeral} · ${i.descripcion_item}`})));}).catch(notifyError);return()=>{alive=false;};},[licitacionId]);
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
    } catch(e){notifyError(e);setDraft(null);} finally {
      setIsGenerating(false);
    }
  };

  const updateDraftField = (
    field: 'hecho_cuestionado' | 'sustento_juridico' | 'solicitud_concreta',
    value: string
  ) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value, texto_completo: field === 'hecho_cuestionado' && prev.texto_completo ? value : prev.texto_completo } : prev));
  };

  const formatFullDraftForClipboard = (): string => {
    if (!draft) return '';
    if(draft.texto_completo)return draft.texto_completo;
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
    clauses,isMock:shouldUseMock(),
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


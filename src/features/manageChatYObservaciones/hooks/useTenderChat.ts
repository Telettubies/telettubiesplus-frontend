import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { services } from '@/features/connected/services';
import { notifyError } from '@/features/connected/adapters';
import { useState, useMemo, useEffect } from 'react';
import type { MensajeChat } from '@/api/types';
import { MOCK_CHAT_HISTORIAL } from '../mockups/chatObservaciones.mock';
import { chatObservacionesService } from '../services/chatObservacionesService';

export type ChatScenarioState =
  | 'default_chat'      // Page 44: Active conversation (18/30) + REQ-019 observation draft
  | 'empty_suggestions' // Page 45: Empty conversation (30/30) with suggested questions + unselected clause
  | 'copied_clipboard'  // Page 46: Draft copied to clipboard state ("✓ [Copiado al Portapapeles]")
  | 'rate_limit_429'    // Page 47: HTTP 429 error bubble on 3rd question
  | 'out_of_scope'      // Page 48: Out-of-scope guardrail warning bubble
  | 'generating_draft'; // Page 49: Claude API spinner generating observation draft

export function useTenderChat(
  licitacionId = 'LP-MIN-001-2026',
  initialScenario: ChatScenarioState = 'default_chat'
) {
  const [scenario, setScenario] = useState<ChatScenarioState>(initialScenario);
  const [customMessages, setCustomMessages] = useState<MensajeChat[]>(()=>shouldUseMock()?MOCK_CHAT_HISTORIAL:[]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const displayedMessages = useMemo<MensajeChat[]>(() => {
    if (!shouldUseMock()) return customMessages;
    if (scenario === 'empty_suggestions') {
      return [];
    }
    if (scenario === 'rate_limit_429') {
      return [
        MOCK_CHAT_HISTORIAL[0],
        MOCK_CHAT_HISTORIAL[1],
        {
          id: 'msg-429-q',
          rol: 'usuario',
          contenido: '¿Qué penalidades aplican por incumplimiento del plazo de ejecución?',
          creado_en: '2026-11-11T16:12:00Z',
        },
        {
          id: 'msg-429-err',
          rol: 'error_429',
          contenido:
            'Límite de solicitudes alcanzado o API de NVIDIA no disponible temporalmente. Intente nuevamente en 60 segundos (Código 429).',
          creado_en: '2026-11-11T16:12:02Z',
        },
      ];
    }
    if (scenario === 'out_of_scope') {
      return [
        MOCK_CHAT_HISTORIAL[0],
        MOCK_CHAT_HISTORIAL[1],
        {
          id: 'msg-oos-q',
          rol: 'usuario',
          contenido: '¿Qué noticias hay hoy sobre el sector de infraestructura?',
          creado_en: '2026-11-11T16:14:00Z',
        },
        {
          id: 'msg-oos-ans',
          rol: 'FueraDeAlcance',
          contenido:
            'Esta consulta excede los términos del pliego de condiciones. El asistente solo responde sobre cláusulas, anexos y requisitos de esta licitación.',
          creado_en: '2026-11-11T16:14:02Z',
        },
      ];
    }
    return customMessages;
  }, [scenario, customMessages]);

  const [limits,setLimits]=useState<{available:number;total:number}>({available:0,total:0});
  useEffect(()=>{if(shouldUseMock())return;let alive=true;services.limits().then(l=>{if(alive)setLimits({available:Math.max(0,l.chat.cuota-l.chat.usados),total:l.chat.cuota});}).catch(notifyError);return()=>{alive=false;};},[licitacionId,customMessages.length]);
  const quotaAvailable = shouldUseMock()?(scenario === 'empty_suggestions' ? 30 : 18):limits.available;
  const quotaTotal = shouldUseMock()?30:limits.total;

  const sendMessage = async (questionOverride?: string, contextOverride?: string) => {
    const q = (questionOverride ?? inputText).trim();
    if (!q || isSending) return;
    const userMsg: MensajeChat = {
      id: `user-${Date.now()}`,
      rol: 'usuario',
      contexto: contextOverride,
      contenido: q,
      creado_en: new Date().toISOString(),
    };
    if (scenario === 'empty_suggestions') {
      setScenario('default_chat');
      setCustomMessages([userMsg]);
    } else {
      setCustomMessages((prev) => [...prev, userMsg]);
    }
    setInputText('');
    setIsSending(true);
    try {
      const reply = await chatObservacionesService.enviarPregunta(licitacionId, !shouldUseMock() && contextOverride ? `${q}\nContexto seleccionado: ${contextOverride}` : q);
      setCustomMessages((prev) => [...prev, reply]);
    } catch(e){setCustomMessages(prev=>[...prev,{id:crypto.randomUUID(),rol:'error_429',contenido:(e as Error).message||'No se pudo enviar la pregunta.'}]);} finally {
      setIsSending(false);
    }
  };

  return {
    scenario,
    setScenario,
    displayedMessages,
    quotaAvailable,
    quotaTotal,
    inputText,
    setInputText,
    isSending,
    sendMessage,
  };
}


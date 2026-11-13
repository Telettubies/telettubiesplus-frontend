import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cargaProgresoService } from '../services/cargaProgresoService';
import {
  MOCK_PROGRESO_IDLE,
  MOCK_PROGRESO_EN_CURSO_ETAPA_4,
  MOCK_PROGRESO_ERROR_ETAPA_4,
  MOCK_PROGRESO_COMPLETADO,
} from '../mockups/progreso.mock';
import type { ProgresoAnalisis } from '@/api/types';

interface UseAnalysisPollingOptions {
  licitacionId: string;
  enabled?: boolean;
  intervalMs?: number;
  customFetcher?: (licitacionId: string, tick: number) => Promise<ProgresoAnalisis>;
  onComplete?: (progress: ProgresoAnalisis) => void;
}

/**
 * Polling seguro de progreso (HU-F06):
 * Consulta periódicamente el estado y se detiene INMEDIATAMENTE al alcanzar
 * un estado terminal ('completado' o 'error') o al desmontar el componente.
 */
export function useAnalysisPolling({
  licitacionId,
  enabled = false,
  intervalMs = 2000,
  customFetcher,
  onComplete,
}: UseAnalysisPollingOptions) {
  const [progress, setProgress] = useState<ProgresoAnalisis>(
    shouldUseMock()?(enabled ? MOCK_PROGRESO_EN_CURSO_ETAPA_4 : MOCK_PROGRESO_IDLE):{trabajo_id:'',licitacion_id:licitacionId,estado:'pendiente',etapa_actual:'En cola',etapa_indice:0,etapas_total:0,porcentaje:0,etapas:[]}
  );
  const [isPolling, setIsPolling] = useState<boolean>(enabled);
  const completeRef=useRef(onComplete);completeRef.current=onComplete;
  const tickRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    tickRef.current = 0;
    if(shouldUseMock())setProgress(MOCK_PROGRESO_EN_CURSO_ETAPA_4);
    setIsPolling(true);
  }, []);

  const setPresetProgress = useCallback(
    (preset: 'idle' | 'processing' | 'completed' | 'error') => {
      stopPolling();
      if (preset === 'idle') setProgress(MOCK_PROGRESO_IDLE);
      if (preset === 'processing') setProgress(MOCK_PROGRESO_EN_CURSO_ETAPA_4);
      if (preset === 'completed') setProgress(MOCK_PROGRESO_COMPLETADO);
      if (preset === 'error') setProgress(MOCK_PROGRESO_ERROR_ETAPA_4);
    },
    [stopPolling]
  );

  useEffect(() => {
    if (!isPolling) {
      return;
    }

    const fetcher = customFetcher || cargaProgresoService.getAnalysisProgress;
    if(!shouldUseMock()){
      let alive=true;let pending:ReturnType<typeof setTimeout>;
      const load=async()=>{try{const next=await fetcher(licitacionId,++tickRef.current);if(!alive)return;setProgress(next);if(next.estado==='completado'||next.estado==='error'){setIsPolling(false);if(next.estado==='completado')completeRef.current?.(next);}else pending=setTimeout(load,intervalMs);}catch(e){if(alive){setProgress(prev=>({...prev,estado:'error',mensaje_error:(e as Error).message||'No se pudo consultar el progreso.'}));setIsPolling(false);}}};
      void load();return()=>{alive=false;clearTimeout(pending);};
    }


    timerRef.current = setInterval(async () => {
      tickRef.current += 1;
      try {
        const nextState = await fetcher(licitacionId, tickRef.current);
        setProgress(nextState);

        if (nextState.estado === 'completado' || nextState.estado === 'error') {
          stopPolling();
          if (nextState.estado === 'completado' && completeRef.current) {
            completeRef.current(nextState);
          }
        }
      } catch {
        stopPolling();
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPolling, licitacionId, intervalMs, customFetcher, stopPolling]);

  return {
    progress,
    setProgress,
    isPolling,
    startPolling,
    stopPolling,
    setPresetProgress,
  };
}


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
    enabled ? MOCK_PROGRESO_EN_CURSO_ETAPA_4 : MOCK_PROGRESO_IDLE
  );
  const [isPolling, setIsPolling] = useState<boolean>(enabled);
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
    setProgress(MOCK_PROGRESO_EN_CURSO_ETAPA_4);
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

    timerRef.current = setInterval(async () => {
      tickRef.current += 1;
      try {
        const nextState = await fetcher(licitacionId, tickRef.current);
        setProgress(nextState);

        if (nextState.estado === 'completado' || nextState.estado === 'error') {
          stopPolling();
          if (nextState.estado === 'completado' && onComplete) {
            onComplete(nextState);
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
  }, [isPolling, licitacionId, intervalMs, customFetcher, onComplete, stopPolling]);

  return {
    progress,
    setProgress,
    isPolling,
    startPolling,
    stopPolling,
    setPresetProgress,
  };
}


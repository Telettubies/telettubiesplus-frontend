import { renderHook, act } from '@testing-library/react';
import { useAnalysisPolling } from '../hooks/useAnalysisPolling';
import { MOCK_PROGRESO_COMPLETADO } from '../mockups/progreso.mock';

describe('useAnalysisPolling (HU-F06 — Polling Seguro y Limpieza)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('consulta el progreso periódicamente y detiene el intervalo inmediatamente al recibir estado completado o al desmontar', async () => {
    const mockFetcher = jest.fn().mockResolvedValue(MOCK_PROGRESO_COMPLETADO);
    const onComplete = jest.fn();

    const { result, unmount } = renderHook(() =>
      useAnalysisPolling({
        licitacionId: 'LP-MIN-001-2026',
        enabled: true,
        intervalMs: 1000,
        customFetcher: mockFetcher,
        onComplete,
      })
    );

    expect(result.current.isPolling).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(result.current.isPolling).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Avanzar más tiempo no debe disparar nuevas peticiones tras completarse
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    unmount();
  });
});


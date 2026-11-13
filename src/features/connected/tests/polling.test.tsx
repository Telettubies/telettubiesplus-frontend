import { renderHook, act } from '@testing-library/react';
import { useResource } from '../common';
it('no solapa solicitudes y cancela resultados tardíos al desmontar', async () => {
    jest.useFakeTimers();
    let resolve!: (v: {
        active: boolean;
    }) => void;
    let signal: AbortSignal | undefined;
    const load = jest.fn((s: AbortSignal) => {
        signal = s;
        return new Promise<{
            active: boolean;
        }>(r => { resolve = r; });
    });
    const { result, unmount } = renderHook(() => useResource<{
        active: boolean;
    }>(load, v => v.active));
    await act(async () => { jest.advanceTimersByTime(10000); });
    expect(load).toHaveBeenCalledTimes(1);
    unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => resolve({ active: true }));
    expect(result.current.data).toBeNull();
    jest.useRealTimers();
});
it('detiene el sondeo cuando el trabajo alcanza estado terminal', async () => {
    jest.useFakeTimers();
    const load = jest.fn().mockResolvedValueOnce({ active: true }).mockResolvedValueOnce({ active: false });
    renderHook(() => useResource<{
        active: boolean;
    }>(load, v => v.active));
    await act(async () => { });
    await act(async () => { jest.advanceTimersByTime(2000); });
    await act(async () => { jest.advanceTimersByTime(10000); });
    expect(load).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
});

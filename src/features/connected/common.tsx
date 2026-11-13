import React, { useEffect, useRef, useState } from 'react';
export function useResource<T>(load: (signal: AbortSignal) => Promise<T>, poll?: (value: T) => boolean) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [revision, refresh] = useState(0);
    const pollRef = useRef(poll);
    pollRef.current = poll;
    useEffect(() => {
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        setLoading(true);
        setError(null);
        const run = async () => {
            try {
                const value = await load(controller.signal);
                if (controller.signal.aborted)
                    return;
                setData(value);
                setError(null);
                setLoading(false);
                if (pollRef.current?.(value))
                    timer = setTimeout(run, 2000);
            }
            catch (e) {
                if (!controller.signal.aborted) {
                    setError(e);
                    setLoading(false);
                }
            }
        };
        void run();
        return () => {
            controller.abort();
            if (timer)
                clearTimeout(timer);
        };
    }, [load, revision]);
    return { data, error, loading, refresh: () => refresh(n => n + 1) };
}
export function useAction() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const lock = useRef(false);
    async function run<T>(work: () => Promise<T>): Promise<T | undefined> {
        if (lock.current)
            return;
        lock.current = true;
        setBusy(true);
        setError(null);
        try {
            return await work();
        }
        catch (e) {
            setError(e);
            return undefined;
        }
        finally {
            lock.current = false;
            setBusy(false);
        }
    }
    return { busy, error, run, setError };
}
export function ErrorBox({ error }: {
    error: unknown;
}) {
    if (!error)
        return null;
    const e = error as {
        message?: string;
        validationErrors?: {
            campo: string;
            detalle: string;
            ubicacion?: (string | number)[];
        }[];
    };
    return <div className="notice error" role="alert"><p>{e.message || 'No se pudo completar la operación.'}</p>{e.validationErrors?.map((v, i) => <p key={i}>{v.campo}{v.ubicacion?.length ? ` (${v.ubicacion.join(' → ')})` : ''}: {v.detalle}</p>)}</div>;
}
export function Loading() { return <p role="status" className="notice">Cargando…</p>; }
export const label = (s: string) => ({ cumple: 'Cumple', cumple_parcialmente: 'Cumple parcialmente', no_cumple: 'No cumple', revision: 'En revisión', presentarse: 'Presentarse', presentarse_con_riesgo: 'Presentarse con riesgo', no_presentarse: 'No presentarse', condicionada: 'Condicionada', en_cola: 'En cola', en_ejecucion: 'En ejecución', completado: 'Completado', fallido: 'Fallido', pendiente: 'Pendiente', procesando: 'Procesando', completada: 'Completada', fallida: 'Fallida' } as Record<string, string>)[s] || s;
export function Badge({ value }: {
    value: string;
}) { return <span className={`badge state-${value}`}>{label(value)}</span>; }
export const date = (s: string | null) => s ? new Date(s).toLocaleString('es-CO') : 'No disponible';
export function download(blob: Blob, name: string) { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }

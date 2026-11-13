import { getEnvVar } from '@/shared/utils/mockSwitch';
const cache = new Map<string, Blob>();
export function clearConnectedPdfCache() { cache.clear(); }
export function cachedPdf(context: string) { return cache.get(context); }
export async function fetchPdf(url: string, signal: AbortSignal, context: string): Promise<Blob> {
    const target = new URL(url);
    const allowed = new URL(getEnvVar('VITE_SUPABASE_URL') || 'https://invalid.local');
    if (target.origin !== allowed.origin || target.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(target.hostname))
        throw new Error('El origen del PDF no está autorizado.');
    const r = await fetch(target.href, { signal, credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error' });
    if (!r.ok)
        throw new Error('No se pudo descargar el PDF.');
    const limit = 100 * 1024 * 1024;
    if (Number(r.headers.get('content-length') || 0) > limit)
        throw new Error('El PDF supera el límite de descarga.');
    const reader = r.body?.getReader();
    if (!reader)
        throw new Error('La descarga del PDF no está disponible.');
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            size += value.byteLength;
            if (size > limit) {
                await reader.cancel();
                throw new Error('El PDF supera el límite de descarga.');
            }
            chunks.push(new Uint8Array(value));
        }
    }
    finally {
        reader.releaseLock();
    }
    const blob = new Blob(chunks, { type: 'application/pdf' });
    const header = await blob.slice(0, 1024).text();
    if (!header.includes('%PDF-'))
        throw new Error('El archivo recibido no es un PDF válido.');
    if (signal.aborted)
        throw new DOMException('Descarga cancelada', 'AbortError');
    cache.set(context, blob);
    return blob;
}

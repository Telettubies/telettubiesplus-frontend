// Servicios del modo conectado. La demo conserva sus servicios independientes.
import { axiosClient as api } from '@/api/axiosClient';
import { decode, decodeList } from '@/api/backend';
import type { Identity, Member, Tender, CreatedTender, Progress, Matrix, Job, Knowledge, Source, Limits, ChatReply, Draft, Decision, Revision } from '@/api/backend';
export const services = {
    async identity(token?: string) {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        // Un token recién emitido puede rechazarse (401) durante 1-2 s si el reloj del equipo va por
        // detrás del de Supabase: su `iat` parece futuro. Se reintenta antes de dar la sesión por inválida.
        for (const espera of [800, 1500, 2500]) {
            const r = await api.get('/yo', { headers, validateStatus: s => s === 200 || s === 401 });
            if (r.status === 200)
                return decode<Identity>('YoOut', r.data);
            await new Promise(resolve => setTimeout(resolve, espera));
        }
        // Último intento normal: si sigue en 401, el interceptor cierra la sesión como siempre.
        return decode<Identity>('YoOut', (await api.get('/yo', { headers })).data);
    },
    async createOrganization(nombre: string, token?: string) { return decode<Member>('MiembroOut', (await api.post('/organizaciones', { nombre }, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)).data); },
    async members(signal?: AbortSignal) { return decodeList<Member>('MiembroOut', (await api.get('/miembros', { signal })).data); },
    async invite(email: string, rol: Member['rol']) { return decode<Member>('MiembroOut', (await api.post('/miembros/invitaciones', { email, rol })).data); },
    async role(id: string, rol: Member['rol']) { return decode<Member>('MiembroOut', (await api.patch(`/miembros/${encodeURIComponent(id)}/rol`, { rol })).data); },
    async remove(id: string) { await api.delete(`/miembros/${encodeURIComponent(id)}`); },
    async tenders(signal?: AbortSignal) { return decodeList<Tender>('LicitacionResumen', (await api.get('/licitaciones', { signal })).data); },
    async upload(file: File, titulo?: string) {
        const body = new FormData();
        body.append('archivo', file);
        if (titulo)
            body.append('titulo', titulo);
        return decode<CreatedTender>('LicitacionCreada', (await api.post('/licitaciones', body, { headers: { 'Content-Type': undefined }, timeout: 120000 })).data);
    },
    async progress(id: string, signal?: AbortSignal) { return decode<Progress>('ProgresoOut', (await api.get(`/licitaciones/${encodeURIComponent(id)}/progreso`, { signal })).data); },
    async result(id: string, signal?: AbortSignal): Promise<{
        kind: 'ready';
        value: Matrix;
    } | {
        kind: 'pending' | 'failed';
        value: Progress;
    }> {
        const r = await api.get(`/licitaciones/${encodeURIComponent(id)}/resultado`, { signal, validateStatus: s => s === 200 || s === 202 || s === 409 });
        if (r.status === 200)
            return { kind: 'ready', value: decode<Matrix>('ResultadoMatrizOut', r.data) };
        if (r.status === 409 && typeof r.data.detail === 'string')
            throw new Error(r.data.detail);
        return { kind: r.status === 202 ? 'pending' : 'failed', value: decode<Progress>('ProgresoOut', r.data) };
    },
    async jobs(id: string, signal?: AbortSignal) { return decodeList<Job>('TrabajoOut', (await api.get(`/licitaciones/${encodeURIComponent(id)}/trabajos`, { signal })).data); },
    async retry(id: string) { return decode<Job>('TrabajoOut', (await api.post(`/licitaciones/${encodeURIComponent(id)}/reintentar`)).data); },
    async review(id: string, estado_nuevo: Decision, comentario: string) {
        return decode<{
            revision: Revision;
            trabajo: Job;
        }>('RevisionCreada', (await api.post(`/resultados/${encodeURIComponent(id)}/revisiones`, { estado_nuevo, comentario })).data);
    },
    async pdfUrl(id: string) {
        return decode<{
            pdf_url_temporal: string;
        }>('UrlPdfOut', (await api.get(`/licitaciones/${encodeURIComponent(id)}/pdf-url`)).data).pdf_url_temporal;
    },
    async limits(signal?: AbortSignal) { return decode<Limits>('LimitesOut', (await api.get('/limites', { signal })).data); },
    async knowledge(signal?: AbortSignal) { return decode<Knowledge>('ResumenConocimiento', (await api.get('/conocimiento', { signal })).data); },
    async sources(signal?: AbortSignal) { return decodeList<Source>('FuenteConocimientoOut', (await api.get('/conocimiento/fuentes', { signal })).data); },
    async uploadKnowledge(file: File) {
        const b = new FormData();
        b.append('archivo', file);
        return decode<{
            resumen: Knowledge;
            trabajo: Job;
        }>('ConocimientoCargado', (await api.post('/conocimiento', b, { headers: { 'Content-Type': undefined }, timeout: 120000 })).data);
    },
    async reindex() { return decode<Job>('TrabajoOut', (await api.post('/conocimiento/indexacion')).data); },
    async chat(id: string, pregunta: string) { return decode<ChatReply>('RespuestaChatOut', (await api.post(`/licitaciones/${encodeURIComponent(id)}/chat`, { pregunta }, { timeout: 120000 })).data); },
    async draft(id: string, requisito_id: string) { return decode<Draft>('ObservacionOut', (await api.post(`/licitaciones/${encodeURIComponent(id)}/observaciones`, { requisito_id }, { timeout: 120000 })).data); },
    async excel(id: string) { return (await api.get<Blob>(`/licitaciones/${encodeURIComponent(id)}/exportar`, { responseType: 'blob' })).data; },
};

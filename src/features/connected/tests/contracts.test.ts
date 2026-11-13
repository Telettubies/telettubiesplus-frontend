import { decode, decodeList } from '@/api/backend';
import type { Progress } from '@/api/backend';
import { services } from '../services';
import { axiosClient } from '@/api/axiosClient';
jest.mock('@/api/axiosClient', () => ({ axiosClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() } }));
const api = axiosClient as jest.Mocked<typeof axiosClient>;
const job = { id: 'job-1', tipo: 'analisis', estado: 'en_cola', etapa_actual: null, progreso: 0, error: null, detalle: null, creado_en: '2026-11-13T00:00:00Z', iniciado_en: null, finalizado_en: null };
const tender = { id: 'tender-1', titulo: 'Pliego prueba', nombre_archivo: 'prueba.pdf', estado: 'pendiente', recomendacion: null, creado_en: '2026-11-13T00:00:00Z' };
const progress = { licitacion_id: tender.id, estado_licitacion: 'procesando', trabajo_id: job.id, estado: 'en_ejecucion', etapa_actual: 'lectura_pdf', progreso: 5, secciones: null, error: null, intentos: 1, iniciado_en: null, finalizado_en: null, actualizado_en: '2026-11-13T00:00:00Z', etapas: [{ clave: 'lectura_pdf', nombre: 'Lectura del PDF', porcentaje: 5 }] };
beforeEach(() => jest.resetAllMocks());
it('acepta nullable y rechaza respuestas de demo y estados desconocidos', () => {
    expect(decode<Progress>('ProgresoOut', progress).secciones).toBeNull();
    expect(() => decode('ProgresoOut', { ...progress, estado: 'error' })).toThrow('contrato');
    expect(() => decode('ProgresoOut', { estado: 'procesando', porcentaje: 5 })).toThrow('contrato');
    expect(() => decodeList('MiembroOut', {})).toThrow('lista');
});
it('sube multipart sin usar_cache y conserva UUIDs y duplicada', async () => {
    api.post.mockResolvedValue({ data: { licitacion: tender, trabajo: job, duplicada: true } });
    const result = await services.upload(new File(['%PDF-1.7'], 'prueba.pdf', { type: 'application/pdf' }), 'Mi pliego');
    expect(result.licitacion.id).toBe(tender.id);
    expect(result.trabajo.id).toBe(job.id);
    expect(result.duplicada).toBe(true);
    const [path, body] = api.post.mock.calls[0];
    expect(path).toBe('/licitaciones');
    expect((body as FormData).get('archivo')).toBeInstanceOf(File);
    expect((body as FormData).has('usar_cache')).toBe(false);
});
it.each([202, 409])('trata %i como progreso y no como matriz', async (status) => {
    api.get.mockResolvedValue({ status, data: progress });
    expect((await services.result(tender.id)).kind).toBe(status === 202 ? 'pending' : 'failed');
});
it('muestra un conflicto sin resultado consolidado', async () => {
    api.get.mockResolvedValue({ status: 409, data: { detail: 'Sin decisión consolidada' } });
    await expect(services.result(tender.id)).rejects.toThrow('Sin decisión');
});
it('revisión usa resultado_id, POST y estado_nuevo; devuelve trabajo asíncrono', async () => {
    const revision = { id: 'revision', usuario_id: 'user', autor_email: null, estado_anterior: 'no_cumple', estado_nuevo: 'cumple', comentario: 'Comprobado', creado_en: '2026-11-13T00:00:00Z' };
    api.post.mockResolvedValue({ data: { revision, trabajo: { ...job, tipo: 'reevaluacion' } } });
    const r = await services.review('resultado-1', 'cumple', 'Comprobado');
    expect(api.post).toHaveBeenCalledWith('/resultados/resultado-1/revisiones', { estado_nuevo: 'cumple', comentario: 'Comprobado' });
    expect(r.trabajo.tipo).toBe('reevaluacion');
});
it('reintentar realiza POST real', async () => {
    api.post.mockResolvedValue({ data: job });
    await services.retry(tender.id);
    expect(api.post).toHaveBeenCalledWith('/licitaciones/tender-1/reintentar');
});
it('chat conserva encontrado y páginas nulas sin inventar referencias', async () => {
    api.post.mockResolvedValue({ data: { respuesta: 'No hay información', encontrado: false, citas: [{ numeral: 's/n', pagina: null }] } });
    const r = await services.chat(tender.id, '¿Qué exige?');
    expect(r.citas[0].pagina).toBeNull();
    expect(r.encontrado).toBe(false);
});
it('observaciones conserva el texto del servidor y usa UUID del requisito', async () => {
    const draft = { requisito_id: 'req-id', numeral: '3.1', asunto: 'Aclaración', texto: 'Texto literal <no interpretar>' };
    api.post.mockResolvedValue({ data: draft });
    expect(await services.draft(tender.id, 'req-id')).toEqual(draft);
    expect(api.post.mock.calls[0][1]).toEqual({ requisito_id: 'req-id' });
});
it('invita con email y usa ruta de miembros actual', async () => {
    const m = { id: 'm', usuario_id: 'u', organizacion_id: 'o', email: 'prueba@example.com', rol: 'revisor', invitacion_pendiente: true, creado_en: '2026-11-13T00:00:00Z' };
    api.post.mockResolvedValue({ data: m });
    await services.invite(m.email, 'revisor');
    expect(api.post).toHaveBeenCalledWith('/miembros/invitaciones', { email: m.email, rol: 'revisor' });
});
it('envía JSON de conocimiento como archivo y conserva trabajo de indexación', async () => {
    const resumen = { cargada: true, empresa: 'Empresa prueba', cargada_en: null, anios_financieros: 1, contratos: 2, personas: 3, certificaciones: 0, capacidades: 1, fragmentos_indexados: 0, indexacion: null };
    api.post.mockResolvedValue({ data: { resumen, trabajo: { ...job, tipo: 'indexacion' } } });
    const r = await services.uploadKnowledge(new File(['{}'], 'empresa.json'));
    expect(r.resumen.contratos).toBe(2);
    expect(api.post.mock.calls[0][0]).toBe('/conocimiento');
});

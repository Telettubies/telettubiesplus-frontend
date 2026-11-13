import axios, { AxiosError } from 'axios';
import { attachInterceptors, normalizeApiError, setTokenProvider, setOrganizationProvider, setUnauthorizedRedirectHandler } from '@/api/interceptors';
import { fetchPdf, clearConnectedPdfCache, cachedPdf } from '../pdfTransport';
beforeEach(() => { setTokenProvider(() => null); setOrganizationProvider(() => null); setUnauthorizedRedirectHandler(jest.fn()); clearConnectedPdfCache(); });
it('preserva token explícito nuevo y selecciona solo la membresía elegida', async () => {
    setTokenProvider(() => 'anterior');
    setOrganizationProvider(() => 'org-verificada');
    const adapter = jest.fn(async (config) => ({ config, data: {}, headers: {}, status: 200, statusText: 'OK' }));
    const api = axios.create({ baseURL: 'http://localhost:8000/api', adapter });
    attachInterceptors(api);
    await api.get('/yo', { headers: { Authorization: 'Bearer nuevo' } });
    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer nuevo');
    expect(adapter.mock.calls[0][0].headers['X-Organizacion-Id']).toBe('org-verificada');
});
it('nunca envía JWT al origen externo mediante el cliente API', async () => {
    const adapter = jest.fn();
    setTokenProvider(() => 'privado');
    const api = axios.create({ baseURL: 'http://localhost:8000/api', adapter });
    attachInterceptors(api);
    await expect(api.get('https://otro.example/pdf')).rejects.toMatchObject({ status: 0 });
    expect(adapter).not.toHaveBeenCalled();
});
it('normaliza detail.errores y no inventa línea ni trace ID', () => {
    const r = normalizeApiError({ response: { status: 422, data: { detail: { mensaje: 'JSON rechazado', errores: [{ campo: 'contratos', ubicacion: ['contratos', 0, 'valor_cop'], mensaje: 'Debe ser positivo' }] } } } } as AxiosError);
    expect(r.message).toBe('JSON rechazado');
    expect(r.validationErrors?.[0]).toMatchObject({ campo: 'contratos', detalle: 'Debe ser positivo', ubicacion: ['contratos', 0, 'valor_cop'] });
    expect(r.validationErrors?.[0].linea).toBeUndefined();
    expect(r.traceId).toBeUndefined();
});
it('preserva mensajes de conflicto y límites, y ubicaciones FastAPI', () => {
    expect(normalizeApiError({ response: { status: 409, data: { detail: 'Último administrador' } } } as AxiosError).message).toBe('Último administrador');
    expect(normalizeApiError({ response: { status: 429, data: { detail: 'Cuota en 24 horas' } } } as AxiosError).message).toBe('Cuota en 24 horas');
    expect(normalizeApiError({ response: { status: 422, data: { detail: [{ loc: ['body', 'email'], msg: 'Correo inválido' }] } } } as AxiosError).validationErrors?.[0].campo).toBe('body.email');
});
it('rechaza un PDF de origen ajeno antes de efectuar la descarga', async () => {
    const old = global.fetch;
    global.fetch = jest.fn();
    await expect(fetchPdf('https://no-autorizado.example/doc', new AbortController().signal, 'ctx')).rejects.toThrow('origen');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(cachedPdf('ctx')).toBeUndefined();
    global.fetch = old;
});

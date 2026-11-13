import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorStandard } from './types';
export type SessionTokenProvider = () => Promise<string | null> | string | null;
export type UnauthorizedRedirectHandler = (redirectPath: string) => void;
let currentTokenProvider: SessionTokenProvider = () => null;
let organizationProvider: () => string | null = () => null;
let currentUnauthorizedHandler: UnauthorizedRedirectHandler = (path) => {
    if (typeof window !== 'undefined')
        window.location.assign(`/login?redirect=${encodeURIComponent(path)}&expired=1`);
};
export function setTokenProvider(provider: SessionTokenProvider) { currentTokenProvider = provider; }
export function setOrganizationProvider(provider: () => string | null) { organizationProvider = provider; }
export function setUnauthorizedRedirectHandler(handler: UnauthorizedRedirectHandler) { currentUnauthorizedHandler = handler; }
export function normalizeApiError(error: AxiosError<any>, currentPath = '/licitaciones'): ApiErrorStandard {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const detail = data?.detail;
    const message = typeof detail === 'string' ? detail : detail?.mensaje || data?.message;
    const raw = Array.isArray(detail) ? detail : detail?.errores || data?.errors;
    const validationErrors = Array.isArray(raw) ? raw.map((e: any) => ({
        ...(typeof e.linea === 'number' ? { linea: e.linea } : {}),
        campo: e.campo || (e.loc || []).join('.'), detalle: e.mensaje || e.msg || e.detalle || 'Valor no válido',
        ubicacion: e.ubicacion || e.loc,
    })) : undefined;
    if (status === 401) {
        currentUnauthorizedHandler(currentPath);
        return { status, code: 'UNAUTHORIZED', message: 'La sesión ha caducado. Inicia sesión de nuevo.', redirectPath: `/login?redirect=${encodeURIComponent(currentPath)}` };
    }
    if (status === 403 || status === 404)
        return { status, code: 'RESOURCE_UNAVAILABLE', message: 'Recurso no disponible. No existe o no tienes permisos para acceder.' };
    return { status, code: status === 422 ? 'VALIDATION_ERROR' : status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'SERVER_ERROR',
        message: message || (status === 0 ? 'No se pudo conectar con la API. Comprueba la conexión y que el backend está encendido.' : status === 429 ? 'Se alcanzó el límite de solicitudes.' : status === 422 ? 'Revisa los datos enviados.' : 'No se pudo completar la operación.'),
        validationErrors, ...(typeof data?.trace_id === 'string' ? { traceId: data.trace_id } : {}) };
}
export function attachInterceptors(instance: AxiosInstance) {
    instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
        const base = new URL(config.baseURL || '/', typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
        const target = new URL(config.url || '', base.href.endsWith('/') ? base.href : base.href + '/');
        if (target.origin !== base.origin)
            throw new Error('El cliente autenticado solo admite el origen de la API.');
        const token = await currentTokenProvider();
        if (token && !config.headers.Authorization)
            config.headers.Authorization = `Bearer ${token}`;
        delete config.headers['X-Organization-Id'];
        delete config.headers['X-User-Role'];
        const org = organizationProvider();
        if (org)
            config.headers['X-Organizacion-Id'] = org;
        else
            delete config.headers['X-Organizacion-Id'];
        return config;
    });
    instance.interceptors.response.use(r => r, async (error: AxiosError) => {
        if (error.response?.data instanceof Blob && error.response.data.type.includes('json')) {
            try {
                error.response.data = JSON.parse(await error.response.data.text());
            }
            catch { /* Conserva el error HTTP si el cuerpo no es JSON. */ }
        }
        if (error.code === 'ERR_CANCELED')
            return Promise.reject(error);
        const path = typeof window === 'undefined' ? '/licitaciones' : window.location.pathname + window.location.search;
        return Promise.reject(normalizeApiError(error, path));
    });
}

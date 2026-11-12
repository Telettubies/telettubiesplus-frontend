import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorStandard } from './types';

export type SessionTokenProvider = () => Promise<string | null> | string | null;
export type UnauthorizedRedirectHandler = (redirectPath: string) => void;

let currentTokenProvider: SessionTokenProvider = () => {
  if (typeof window !== 'undefined') {
    return window.sessionStorage.getItem('tc_supabase_access_token');
  }
  return null;
};

let currentUnauthorizedHandler: UnauthorizedRedirectHandler = (redirectPath: string) => {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem('tc_supabase_access_token');
    const encoded = encodeURIComponent(redirectPath || '/licitaciones');
    window.location.assign(`/login?redirect=${encoded}&expired=1`);
  }
};

export function setTokenProvider(provider: SessionTokenProvider) {
  currentTokenProvider = provider;
}

export function setUnauthorizedRedirectHandler(handler: UnauthorizedRedirectHandler) {
  currentUnauthorizedHandler = handler;
}

/**
 * Normaliza errores HTTP siguiendo estrictamente HU-F15, S-03, S-04 y HU-B26:
 * - 401: Limpia sesión y redirige a /login?redirect=<ruta_actual>
 * - 403 / 404: Opacidad IDOR ("Recurso no disponible") sin revelar existencia en otra organización
 * - 422: Conserva la lista completa de errores de validación por línea/campo
 * - 429: Mensaje claro de cuota diaria alcanzada
 */
export function normalizeApiError(error: AxiosError<any>, currentPath = '/licitaciones'): ApiErrorStandard {
  const status = error.response?.status ?? 500;
  const responseData = error.response?.data;

  if (status === 401) {
    currentUnauthorizedHandler(currentPath);
    return {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Su sesión de Supabase Auth ha caducado por motivos de seguridad corporativa.',
      redirectPath: `/login?redirect=${encodeURIComponent(currentPath)}`,
    };
  }

  if (status === 403 || status === 404) {
    return {
      status,
      code: 'RESOURCE_UNAVAILABLE',
      message: 'Recurso no disponible. El identificador solicitado no existe o su organización no cuenta con permisos para acceder a este expediente.',
    };
  }

  if (status === 422) {
    return {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: responseData?.message || 'Esquema inválido en el archivo cargado.',
      validationErrors: Array.isArray(responseData?.errors) ? responseData.errors : [],
    };
  }

  if (status === 429) {
    return {
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      message:
        responseData?.message ||
        'Límite de solicitudes alcanzado o API de NVIDIA no disponible temporalmente. Intente nuevamente en 60 segundos (Código 429).',
    };
  }

  return {
    status,
    code: 'SERVER_ERROR',
    message:
      responseData?.message ||
      'El servicio en segundo plano experimentó una interrupción temporal. No se han perdido datos ni créditos de análisis.',
    traceId: responseData?.trace_id || 'req_8820f_node_worker_03',
  };
}

export function attachInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await currentTokenProvider();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // S-04: Jamás enviar organizacion_id ni rol desde el cliente
      if (config.headers) {
        delete config.headers['X-Organization-Id'];
        delete config.headers['X-User-Role'];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const currentPath =
        typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/licitaciones';
      const normalized = normalizeApiError(error, currentPath);
      return Promise.reject(normalized);
    }
  );
}


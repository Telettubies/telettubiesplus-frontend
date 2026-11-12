export const API_ENDPOINTS = {
  AUTH: {
    ME: '/me',
    ACCEPT_INVITE: '/invitaciones/aceptar',
  },
  MIEMBROS: {
    LIST: '/organizacion/miembros',
    INVITE: '/organizacion/miembros/invitar',
    UPDATE_ROLE: (miembroId: string) => `/organizacion/miembros/${miembroId}/rol`,
    REMOVE: (miembroId: string) => `/organizacion/miembros/${miembroId}`,
  },
  CONOCIMIENTO: {
    STATUS: '/organizacion/conocimiento',
    UPLOAD: '/organizacion/conocimiento/cargar',
  },
  LICITACIONES: {
    LIST: '/licitaciones',
    UPLOAD: '/licitaciones/cargar',
    PROGRESS: (id: string) => `/licitaciones/${id}/progreso`,
    RETRY: (id: string) => `/licitaciones/${id}/reintentar`,
    RESULTADO: (id: string) => `/licitaciones/${id}/resultado`,
    REFRESH_PDF_URL: (id: string) => `/licitaciones/${id}/pdf-url`,
    REVISAR_ITEM: (id: string, itemId: string) => `/licitaciones/${id}/items/${itemId}/revisar`,
    CHAT: (id: string) => `/licitaciones/${id}/chat`,
    OBSERVACION: (id: string, itemId: string) => `/licitaciones/${id}/items/${itemId}/observacion`,
    EXPORTAR_EXCEL: (id: string) => `/licitaciones/${id}/exportar`,
  },
} as const;

export const ENDPOINTS = {
  ...API_ENDPOINTS,
  licitaciones: {
    resultado: API_ENDPOINTS.LICITACIONES.RESULTADO,
    resolverItem: API_ENDPOINTS.LICITACIONES.REVISAR_ITEM,
    chat: API_ENDPOINTS.LICITACIONES.CHAT,
    observaciones: (id: string) => `/licitaciones/${id}/observaciones`,
  },
};

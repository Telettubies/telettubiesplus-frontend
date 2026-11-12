export const ROUTE_PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/registro',
  ACCEPT_INVITATION: '/invitacion',
  ACCEPT_INVITE: '/invitacion',
  MEMBERS_MANAGEMENT: '/configuracion/miembros',
  KNOWLEDGE_BASE: '/configuracion/conocimiento',
  TENDERS_LIST: '/licitaciones',
  TENDER_UPLOAD: '/licitaciones/nueva',
  TENDER_PROGRESS: '/licitaciones/:id/progreso',
  TENDER_ANALYSIS: '/licitaciones/:id',
  TENDER_FOCUSED_VIEW: '/licitaciones/:id/visor-enfocado',
} as const;


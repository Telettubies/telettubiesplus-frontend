import type { PerfilMiembro } from '@/api/types';

export const MOCK_USERS: Record<string, { password: string; profile: PerfilMiembro }> = {
  'admin@constructoraandina.com.co': {
    password: 'Password123!',
    profile: {
      id: 'mem-admin-01',
      user_id: 'usr-supabase-001',
      nombre: 'Mauricio Restrepo',
      iniciales: 'MR',
      correo: 'admin@constructoraandina.com.co',
      rol: 'administrador',
      organizacion_id: 'org-co-8001',
      organizacion_nombre: 'Constructora Andina S.A.S.',
      organizacion_nit: 'NIT 900.342.112-4',
      tenant_codigo: 'ORG-CO-8001',
    },
  },
  'laura.gomez@constructoraandina.com.co': {
    password: 'Password123!',
    profile: {
      id: 'mem-rev-02',
      user_id: 'usr-supabase-002',
      nombre: 'Laura Gómez',
      iniciales: 'LG',
      correo: 'laura.gomez@constructoraandina.com.co',
      rol: 'revisor',
      organizacion_id: 'org-co-8001',
      organizacion_nombre: 'Constructora Andina S.A.S.',
      organizacion_nit: 'NIT 900.342.112-4',
      tenant_codigo: 'ORG-CO-8001',
    },
  },
};

export interface InvitationMetadata {
  organizacion: string;
  tenantId: string;
  rolAsignado: string;
  invitadoPorRol: string;
  invitadoPorCorreo: string;
  fechaEnvio: string;
  correoInvitado: string;
  estadoToken: 'Valid' | 'Expired';
  expiracionTexto: string;
}

export const MOCK_INVITATION_METADATA: InvitationMetadata = {
  organizacion: 'Constructora Andina S.A.S.',
  tenantId: 'ORG-CO-8001',
  rolAsignado: 'Rol: Revisor Técnico',
  invitadoPorRol: 'Administrador de la organización',
  invitadoPorCorreo: 'admin@constructoraandina.com.co',
  fechaEnvio: '2026-11-10 09:14 -05:00',
  correoInvitado: 'laura.gomez@constructoraandina.com.co',
  estadoToken: 'Valid',
  expiracionTexto: 'expires in 18 h 46 m',
};


import type { MiembroOrganizacion } from '@/api/types';

export const MOCK_MIEMBROS_EQUIPO: MiembroOrganizacion[] = [
  {
    id: 'mem-01',
    nombre: 'Mauricio Restrepo',
    correo: 'admin@constructoraandina.com.co',
    rol: 'administrador',
    estado: 'activo',
  },
  {
    id: 'mem-02',
    nombre: 'Diana Cardona',
    correo: 'diana.cardona@constructoraandina.com.co',
    rol: 'administrador',
    estado: 'activo',
  },
  {
    id: 'mem-03',
    nombre: 'Laura Gómez',
    correo: 'laura.gomez@constructoraandina.com.co',
    rol: 'revisor',
    estado: 'activo',
  },
  {
    id: 'mem-04',
    nombre: 'Jorge Pineda',
    correo: 'jorge.pineda@constructoraandina.com.co',
    rol: 'revisor',
    estado: 'activo',
  },
  {
    id: 'mem-05',
    correo: 'carlos.vidal@constructoraandina.com.co',
    rol: 'revisor',
    estado: 'pendiente',
    fecha_invitacion: '2026-11-09',
  },
];


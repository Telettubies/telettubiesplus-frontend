import { services } from '@/features/connected/services';
import { memberView } from '@/features/connected/adapters';
import { axiosClient } from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { MOCK_MIEMBROS_EQUIPO } from '../mockups/miembros.mock';
import type { MiembroOrganizacion, RolOrganizacion } from '@/api/types';

export const miembrosService = {
  async listMembers(): Promise<MiembroOrganizacion[]> {
    if (!shouldUseMock('VITE_MOCK_MIEMBROS')) return (await services.members()).map(memberView);
    if (shouldUseMock('VITE_MOCK_MIEMBROS')) {
      await new Promise((res) => setTimeout(res, 150));
      return [...MOCK_MIEMBROS_EQUIPO];
    }
    const { data } = await axiosClient.get<MiembroOrganizacion[]>(API_ENDPOINTS.MIEMBROS.LIST);
    return data;
  },

  async inviteMember(correo: string, rol: RolOrganizacion): Promise<MiembroOrganizacion> {
    if (!shouldUseMock('VITE_MOCK_MIEMBROS')) return memberView(await services.invite(correo,rol));
    if (shouldUseMock('VITE_MOCK_MIEMBROS')) {
      await new Promise((res) => setTimeout(res, 220));
      return {
        id: `mem-${Date.now()}`,
        correo: correo.trim().toLowerCase(),
        rol,
        estado: 'pendiente',
        fecha_invitacion: '2026-11-11',
      };
    }
    const { data } = await axiosClient.post<MiembroOrganizacion>(API_ENDPOINTS.MIEMBROS.INVITE, {
      correo,
      rol,
    });
    return data;
  },
};

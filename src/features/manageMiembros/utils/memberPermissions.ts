import type { MiembroOrganizacion, RolOrganizacion } from '@/api/types';

/**
 * Regla S-05 / HU-B03 / HU-F03:
 * La organización debe conservar al menos un administrador activo en todo momento.
 */
export function canModifyOrRemoveMember(
  members: MiembroOrganizacion[],
  targetMemberId: string,
  action: 'degrade_to_revisor' | 'remove'
): { allowed: boolean; reason?: string } {
  const target = members.find((m) => m.id === targetMemberId);
  if (!target) {
    return { allowed: false, reason: 'Miembro no encontrado en la organización.' };
  }

  if (target.rol === 'administrador' && target.estado === 'activo') {
    const activeAdmins = members.filter(
      (m) => m.rol === 'administrador' && m.estado === 'activo'
    );
    if (activeAdmins.length <= 1 && (action === 'degrade_to_revisor' || action === 'remove')) {
      return {
        allowed: false,
        reason:
          'No se puede retirar ni cambiar el rol al único administrador activo de la organización.',
      };
    }
  }

  return { allowed: true };
}

export function canInviteEmail(
  members: MiembroOrganizacion[],
  email: string
): { allowed: boolean; reason?: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) {
    return { allowed: false, reason: 'Ingrese un correo corporativo válido.' };
  }
  const exists = members.some((m) => m.correo.toLowerCase() === normalized);
  if (exists) {
    return {
      allowed: false,
      reason: 'Este correo ya pertenece a la organización o tiene una invitación activa.',
    };
  }
  return { allowed: true };
}

export function getOppositeRole(rol: RolOrganizacion): RolOrganizacion {
  return rol === 'administrador' ? 'revisor' : 'administrador';
}


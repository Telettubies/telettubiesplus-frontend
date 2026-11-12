import { useState, useCallback } from 'react';
import { MOCK_MIEMBROS_EQUIPO } from '../mockups/miembros.mock';
import { canModifyOrRemoveMember, canInviteEmail, getOppositeRole } from '../utils/memberPermissions';
import { miembrosService } from '../services/miembrosService';
import type { MiembroOrganizacion, RolOrganizacion } from '@/api/types';

export function useOrganizationMembers(initialMembers: MiembroOrganizacion[] = MOCK_MIEMBROS_EQUIPO) {
  const [members, setMembers] = useState<MiembroOrganizacion[]>(initialMembers);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [blockedModalReason, setBlockedModalReason] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    member: MiembroOrganizacion;
    type: 'role_change' | 'remove';
  } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleInvite = useCallback(
    async (correo: string, rol: RolOrganizacion) => {
      setInviteError(null);
      const check = canInviteEmail(members, correo);
      if (!check.allowed) {
        setInviteError(check.reason || 'Correo inválido.');
        return false;
      }
      const created = await miembrosService.inviteMember(correo, rol);
      setMembers((prev) => [...prev, created]);
      setInviteModalOpen(false);
      return true;
    },
    [members]
  );

  const requestRoleToggle = useCallback(
    (member: MiembroOrganizacion) => {
      if (member.rol === 'administrador') {
        const check = canModifyOrRemoveMember(members, member.id, 'degrade_to_revisor');
        if (!check.allowed) {
          setBlockedModalReason(
            check.reason ||
              'No se puede retirar ni cambiar el rol al único administrador activo de la organización.'
          );
          return;
        }
      }
      setPendingAction({ member, type: 'role_change' });
    },
    [members]
  );

  const requestRemoveMember = useCallback(
    (member: MiembroOrganizacion) => {
      const check = canModifyOrRemoveMember(members, member.id, 'remove');
      if (!check.allowed) {
        setBlockedModalReason(
          check.reason ||
            'No se puede retirar ni cambiar el rol al único administrador activo de la organización.'
        );
        return;
      }
      setPendingAction({ member, type: 'remove' });
    },
    [members]
  );

  const confirmPendingAction = useCallback(() => {
    if (!pendingAction) return;
    const { member, type } = pendingAction;

    if (type === 'role_change') {
      const nextRole = getOppositeRole(member.rol);
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, rol: nextRole } : m))
      );
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    }
    setPendingAction(null);
  }, [pendingAction]);

  const simulateLastAdminBlockedModal = useCallback(() => {
    setMembers((prev) =>
      prev.map((m) =>
        m.correo === 'diana.cardona@constructoraandina.com.co' ? { ...m, rol: 'revisor' } : m
      )
    );
    setBlockedModalReason(
      'No se puede retirar ni cambiar el rol al único administrador activo de la organización.'
    );
  }, []);

  return {
    members,
    setMembers,
    inviteModalOpen,
    setInviteModalOpen,
    inviteError,
    setInviteError,
    blockedModalReason,
    setBlockedModalReason,
    pendingAction,
    setPendingAction,
    handleInvite,
    requestRoleToggle,
    requestRemoveMember,
    confirmPendingAction,
    simulateLastAdminBlockedModal,
  };
}


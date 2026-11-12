import React from 'react';
import { FiPlus, FiShield, FiTrash2 } from 'react-icons/fi';
import type { MiembroOrganizacion, RolOrganizacion } from '@/api/types';
import { InviteMemberModal } from './InviteMemberModal';
import { RoleChangeConfirmModal } from './RoleChangeConfirmModal';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import '../styles/miembros.styles.css';

interface MembersTableProps {
  members: MiembroOrganizacion[];
  inviteModalOpen: boolean;
  setInviteModalOpen: (open: boolean) => void;
  inviteError: string | null;
  blockedModalReason: string | null;
  setBlockedModalReason: (reason: string | null) => void;
  pendingAction: {
    member: MiembroOrganizacion;
    type: 'role_change' | 'remove';
  } | null;
  setPendingAction: (action: null) => void;
  onInvite: (correo: string, rol: RolOrganizacion) => Promise<boolean>;
  onRequestRoleToggle: (member: MiembroOrganizacion) => void;
  onRequestRemove: (member: MiembroOrganizacion) => void;
  onConfirmPendingAction: () => void;
  showActionsColumn?: boolean;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  inviteModalOpen,
  setInviteModalOpen,
  inviteError,
  blockedModalReason,
  setBlockedModalReason,
  pendingAction,
  setPendingAction,
  onInvite,
  onRequestRoleToggle,
  onRequestRemove,
  onConfirmPendingAction,
  showActionsColumn = false,
}) => {
  return (
    <div data-tour="team-members-section" className="space-y-6">
      {/* Header directly on canvas */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className={`${TYPOGRAPHY.title} text-xl`}>Miembros del Equipo</h2>
          <p className={`${TYPOGRAPHY.body} mt-0.5`}>
            Gestione roles y permisos de acceso de la organización
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          data-testid="invite-member-btn"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Invitar Miembro</span>
        </button>
      </div>

      {/* Open Table on Canvas */}
      <div className="overflow-x-auto border-y border-slate-200 bg-white/70">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Usuario / Email</th>
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Rol</th>
              <th className={`py-3.5 px-4 ${TYPOGRAPHY.label}`}>Estado</th>
              {showActionsColumn && (
                <th className={`py-3.5 px-4 text-right ${TYPOGRAPHY.label}`}>Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 text-xs">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-white transition-colors">
                <td className="py-4 px-4">
                  {member.nombre ? (
                    <>
                      <p className="font-semibold text-slate-900 leading-snug">{member.nombre}</p>
                      <p className={`${TYPOGRAPHY.label} mt-0.5`}>{member.correo}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-900 leading-snug">{member.correo}</p>
                      <p className={`${TYPOGRAPHY.label} mt-0.5`}>
                        Invitación enviada {member.fecha_invitacion || '2026-11-09'}
                      </p>
                    </>
                  )}
                </td>
                <td className="py-4 px-4">
                  <button
                    type="button"
                    onClick={() => onRequestRoleToggle(member)}
                    title="Clic para cambiar el rol del miembro"
                    className="text-brand-primary text-xs font-medium hover:text-brand-hover transition-colors"
                  >
                    {member.rol === 'administrador' ? 'Administrador' : 'Revisor'}
                  </button>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-between gap-2">
                    {member.estado === 'activo' ? (
                      <span className="text-emerald-700 text-xs font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="text-amber-700 text-xs font-medium">
                        Pendiente
                      </span>
                    )}

                    {!showActionsColumn && (
                      <button
                        type="button"
                        aria-label={`Retirar a ${member.nombre || member.correo}`}
                        onClick={() => onRequestRemove(member)}
                        className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"
                        title="Retirar miembro de la organización"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
                {showActionsColumn && (
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onRequestRemove(member)}
                      className="text-xs text-slate-500 hover:text-red-600 font-medium"
                    >
                      Retirar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Protection Rule directly on canvas */}
      <div className="pt-2 flex items-center gap-2.5 text-xs text-slate-600">
        <FiShield className="w-4 h-4 text-slate-500 shrink-0" />
        <p>
          <span className="font-medium text-slate-800">Nota:</span> La organización debe conservar al menos un administrador activo en todo momento.
        </p>
      </div>

      <InviteMemberModal
        isOpen={inviteModalOpen}
        error={inviteError}
        onClose={() => setInviteModalOpen(false)}
        onInvite={onInvite}
      />

      <RoleChangeConfirmModal
        pendingAction={pendingAction}
        blockedReason={blockedModalReason}
        onConfirmAction={onConfirmPendingAction}
        onCancelAction={() => setPendingAction(null)}
        onCloseBlocked={() => setBlockedModalReason(null)}
      />
    </div>
  );
};

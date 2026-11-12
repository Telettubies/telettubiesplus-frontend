import React from 'react';
import { createPortal } from 'react-dom';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import type { MiembroOrganizacion } from '@/api/types';

interface RoleChangeConfirmModalProps {
  pendingAction: {
    member: MiembroOrganizacion;
    type: 'role_change' | 'remove';
  } | null;
  blockedReason: string | null;
  onConfirmAction: () => void;
  onCancelAction: () => void;
  onCloseBlocked: () => void;
}

export const RoleChangeConfirmModal: React.FC<RoleChangeConfirmModalProps> = ({
  pendingAction,
  blockedReason,
  onConfirmAction,
  onCancelAction,
  onCloseBlocked,
}) => {
  if (blockedReason) {
    const blockedNode = (
      <div
        role="dialog"
        aria-modal="true"
        data-testid="last-admin-blocked-modal"
        className="fixed inset-y-0 right-0 left-0 lg:left-[var(--sidebar-width,240px)] z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/70 backdrop-blur-xs p-4"
      >
        <div className="bg-white border border-slate-200 rounded-xl shadow-elevated max-w-sm w-full p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Acción no disponible</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{blockedReason}</p>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onCloseBlocked}
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );

    if (typeof document !== 'undefined') {
      return createPortal(blockedNode, document.body);
    }
    return blockedNode;
  }

  if (!pendingAction) return null;

  const { member, type } = pendingAction;
  const isRemove = type === 'remove';
  const nextRoleLabel = member.rol === 'administrador' ? 'Revisor' : 'Administrador';

  return (
    <ConfirmModal
      isOpen={true}
      title={isRemove ? 'Confirmar retiro de miembro' : 'Confirmar cambio de rol'}
      description={
        isRemove
          ? `¿Está seguro de retirar a ${member.nombre || member.correo} de la organización? Ya no tendrá acceso al espacio de trabajo.`
          : `¿Desea cambiar el rol de ${member.nombre || member.correo} a ${nextRoleLabel}?`
      }
      confirmLabel={isRemove ? 'Retirar miembro' : 'Confirmar cambio'}
      variant={isRemove ? 'danger' : 'warning'}
      onConfirm={onConfirmAction}
      onCancel={onCancelAction}
    />
  );
};


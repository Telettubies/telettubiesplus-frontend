import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiUserPlus, FiX } from 'react-icons/fi';
import type { RolOrganizacion } from '@/api/types';

interface InviteMemberModalProps {
  isOpen: boolean;
  error: string | null;
  onClose: () => void;
  onInvite: (correo: string, rol: RolOrganizacion) => Promise<boolean>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  error,
  onClose,
  onInvite,
}) => {
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState<RolOrganizacion>('revisor');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onInvite(correo, rol);
    if (ok) {
      setCorreo('');
      setRol('revisor');
    }
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-member-title"
      className="fixed inset-y-0 right-0 left-0 lg:left-[var(--sidebar-width,240px)] z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/70 backdrop-blur-xs p-4"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-elevated max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiUserPlus className="w-4 h-4 text-slate-700" />
            <h3 id="invite-member-title" className="text-sm font-semibold text-slate-900">
              Invitar Miembro a la Organización
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Se enviará una invitación por correo electrónico para unirse al equipo de Constructora Andina S.A.S.
        </p>

        {error && (
          <div role="alert" className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="invite-email-input" className="block text-xs font-medium text-slate-800">
              Correo corporativo
            </label>
            <input
              id="invite-email-input"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ingeniero@constructoraandina.com.co"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="invite-role-select" className="block text-xs font-medium text-slate-800">
              Rol asignado en la organización
            </label>
            <select
              id="invite-role-select"
              value={rol}
              onChange={(e) => setRol(e.target.value as RolOrganizacion)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-800"
            >
              <option value="revisor">Revisor Técnico (Evaluar pliegos y matriz)</option>
              <option value="administrador">Administrador (Gestionar base de conocimiento y miembros)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover"
            >
              Enviar Invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }
  return modalNode;
};


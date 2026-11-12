import React from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiShieldOff, FiWifiOff } from 'react-icons/fi';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  singleButton?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'warning',
  singleButton = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-y-0 right-0 left-0 lg:left-[var(--sidebar-width,240px)] z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/65 backdrop-blur-xs p-4"
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-elevated max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              variant === 'danger'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {variant === 'danger' ? (
              <FiShieldOff className="w-4 h-4" />
            ) : (
              <FiAlertTriangle className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-sm font-medium text-slate-900">
              {title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {!singleButton && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors ${
              variant === 'danger' && !singleButton
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-primary hover:bg-brand-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

/**
 * Pantallas Transversales de Estado de Sesión y Servicio
 */
export const TransversalIncidentOverlay: React.FC<{
  mode: 'session_expired_401' | 'resource_404' | 'worker_interrupted_503' | null;
  onClose: () => void;
  onNavigatePortfolio: () => void;
  onNavigateLogin: () => void;
}> = ({ mode, onClose, onNavigatePortfolio, onNavigateLogin }) => {
  if (!mode) return null;

  if (mode === 'session_expired_401') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 bg-surface-page/95 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div className="bg-white border border-slate-200 rounded-xl shadow-card max-w-md w-full p-7 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Sesión finalizada por inactividad</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Su sesión ha finalizado por motivos de seguridad. Su avance se encuentra guardado y podrá continuar en el mismo punto al volver a ingresar.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateLogin();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
          >
            Iniciar sesión nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'resource_404') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 bg-surface-page/95 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div className="bg-white border border-slate-200 rounded-xl shadow-card max-w-md w-full p-7 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Licitación o documento no encontrado</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            El proceso solicitado no existe o no cuenta con permisos para consultar este documento.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigatePortfolio();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
          >
            Volver al Portafolio de Licitaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-surface-page/95 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-card max-w-md w-full p-7 space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Interrupción temporal del servicio</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Ocurrió una desconexión temporal durante el procesamiento. No se ha perdido información de su cuenta.
        </p>
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
          >
            Reintentar conexión
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar aviso
          </button>
        </div>
      </div>
    </div>
  );
};

export const OfflineReadOnlyBanner: React.FC<{
  active: boolean;
  onRestore: () => void;
}> = ({ active, onRestore }) => {
  if (!active) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-300 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
      <div className="flex items-center gap-2 font-medium">
        <FiWifiOff className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Conexión a internet perdida. Modo solo lectura activo — Reconectando con el servidor en segundo plano...
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-amber-800">
          Portafolio Activo — solo lectura: Edición, carga y resoluciones deshabilitadas hasta recuperar la conexión.
        </span>
        <button
          type="button"
          onClick={onRestore}
          className="px-2.5 py-0.5 rounded bg-amber-900 dark:bg-amber-500 text-white dark:text-slate-950 text-[11px] font-medium hover:bg-amber-800 dark:hover:bg-amber-400"
        >
          Restaurar red
        </button>
      </div>
    </div>
  );
};


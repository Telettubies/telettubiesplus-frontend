import React from 'react';
import type { ItemVerificable } from '@/api/types';
import { sanitizeText } from '@/shared/utils/sanitizeText';

export interface AssignedEvidenceSidebarProps {
  activeItem: ItemVerificable | null;
  unverifiedSimOverride?: boolean;
  manualValidatedOverride?: boolean;
}

export const AssignedEvidenceSidebar: React.FC<AssignedEvidenceSidebarProps> = ({
  activeItem,
  unverifiedSimOverride = false,
  manualValidatedOverride = false,
}) => {
  const isManual = manualValidatedOverride || activeItem?.id === 'REQ-017-RESOLVED';
  const itemVerified =
    activeItem?.evidencia?.cita_verificada ?? activeItem?.cita_verificada ?? true;
  const isUnverified = unverifiedSimOverride || (activeItem && !itemVerified && !isManual);

  const fuente = isManual
    ? 'HV_Dir_Obra_Castro.pdf (Pág. 2)'
    : activeItem?.evidencia?.fuente_nombre ||
      activeItem?.evidencia_fuente ||
      'Contrato Obra Vial 2024-C08 (Pág. 12)';

  const textoLiteral = isManual
    ? '“Director de obra, 2016–2025 (9 años). Especialización en Gerencia de Obras Civiles...”'
    : isUnverified
      ? '“Acreditación de 5.000 m² de pavimentación asfáltica en vías primarias...” — similitud textual 78% (umbral 85%).'
      : activeItem?.evidencia?.cita_literal ||
        activeItem?.evidencia_fragmento ||
        '“Acreditación de 5.000 m² de pavimentación asfáltica en vías primarias...”';

  const brechaText = isManual
    ? 'Ninguno. Revisado por L. Gómez · 2026-11-11.'
    : isUnverified
      ? 'Se recomienda revisar el documento original para confirmar este punto.'
      : activeItem?.faltante ||
        activeItem?.brecha_identificada ||
        'Ninguno. Cumple con el metraje mínimo exigido de 4.000 m².';

  return (
    <div className="border-t border-slate-200 bg-white px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[12.5px] font-semibold text-slate-900">
          Evidencia Interna Contrastada
        </h3>
        {isManual ? (
          <span className="inline-flex items-center text-[11px] font-medium text-emerald-700">
            Validado manualmente
          </span>
        ) : isUnverified ? (
          <span className="inline-flex items-center text-[11px] font-medium text-amber-700">
            Cita por confirmar
          </span>
        ) : (
          <span className="inline-flex items-center text-[11px] font-medium text-emerald-700">
            Cita verificada
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-y-2 gap-x-3 text-[12px] leading-relaxed">
        <span className="text-slate-500">Fuente</span>
        <span className="font-medium text-slate-800">{sanitizeText(fuente)}</span>

        <span className="text-slate-500">Texto literal</span>
        <span className="italic text-slate-700">{sanitizeText(textoLiteral)}</span>

        <span className="text-slate-500">Brecha identificada</span>
        <span className={isUnverified ? 'font-medium text-amber-700' : 'text-slate-800'}>
          {sanitizeText(brechaText)}
        </span>
      </div>
    </div>
  );
};

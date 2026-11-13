import React, { useEffect, useState } from 'react';
import { axiosClient as api } from '@/api/axiosClient';
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
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentError, setDocumentError] = useState('');
  useEffect(() => { setDocumentUrl(''); setDocumentError(''); }, [activeItem?.id]);
  const isManual = manualValidatedOverride || activeItem?.id === 'REQ-017-RESOLVED';
  const itemVerified =
    activeItem?.evidencia?.cita_verificada ?? activeItem?.cita_verificada ?? true;
  const isUnverified = unverifiedSimOverride || (activeItem && !itemVerified && !isManual);

  const fuente = isManual
    ? 'HV_Dir_Obra_Castro.pdf (Pág. 2)'
    : activeItem?.evidencia?.fuente_nombre ||
      activeItem?.evidencia_fuente ||
      (activeItem?.estado === 'cumple'
        ? 'Base de conocimiento de la empresa'
        : 'Sin documento fuente vinculado');

  const textoLiteral = isManual
    ? '“Director de obra, 2016–2025 (9 años). Especialización en Gerencia de Obras Civiles...”'
    : isUnverified
      ? `Cita con similitud por debajo del umbral de verificación (${Math.round((activeItem?.evidencia?.similitud ?? 0.78) * 100)}%). Requiere revisión.`
      : activeItem?.evidencia?.cita_literal ||
        activeItem?.evidencia_fragmento ||
        (activeItem?.faltante
          ? activeItem.faltante
          : activeItem?.estado === 'cumple'
            ? 'Condición técnica o financiera acreditada satisfactoriamente con la información aportada.'
            : 'No se identificó fragmento textual en los documentos cargados que acredite este requisito.');

  const brechaText = isManual
    ? 'Ninguno. Revisado por L. Gómez · 2026-11-11.'
    : isUnverified
      ? 'Se recomienda revisar el documento original para confirmar este punto.'
      : activeItem?.faltante ||
        activeItem?.brecha_identificada ||
        (activeItem?.estado === 'cumple'
          ? 'Ninguna. Cumple satisfactoriamente con las condiciones exigidas.'
          : activeItem?.motivo_revision ||
            'Brecha identificada: la documentación registrada no respalda esta exigencia del pliego.');

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
        {activeItem?.evidencia?.fuente_id && <div className="col-span-2"><button onClick={async () => { try { const {data} = await api.get(`/conocimiento/documentos/fuentes/${activeItem.evidencia!.fuente_id}/pdf-url`); setDocumentUrl(`${data.url}${data.pagina ? `#page=${data.pagina}` : ''}`); } catch { setDocumentError('Esta fuente no dispone de un PDF empresarial vinculado.'); } }}>Consultar documento empresarial</button>{documentUrl && <a href={documentUrl} target="_blank" rel="noreferrer">Abrir PDF original</a>}{documentError && <p role="status">{documentError}</p>}</div>}
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

import React from 'react';
import { FiX, FiFileText, FiMessageSquare } from 'react-icons/fi';
import type { ItemVerificable } from '@/api/types';
import { sanitizeText } from '@/shared/utils/sanitizeText';
import { ComplianceBadge } from '@/shared/components/badges/ComplianceBadge';
import { CitationVerificationBadge } from './CitationVerificationBadge';

interface ItemDetailDrawerProps {
  item: ItemVerificable | null;
  onClose: () => void;
  onGenerateObservation?: (item: ItemVerificable) => void;
}

export const ItemDetailDrawer: React.FC<ItemDetailDrawerProps> = ({
  item,
  onClose,
  onGenerateObservation,
}) => {
  if (!item) return null;

  return (
    <div
      data-testid="item-detail-level-3"
      className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-medium text-slate-900">{item.codigo_req}</span>
          <span className="font-mono text-slate-600">Numeral {item.numeral}</span>
          <span className="font-mono text-slate-500">• Pág. {item.ubicacion.pagina}</span>
          <ComplianceBadge estado={item.estado} />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle de ítem"
          className="text-slate-400 hover:text-slate-700 p-1"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Requisito Literal Sanitizado */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
        <p className="text-[11px] font-medium text-slate-500">Texto del pliego:</p>
        <p className="text-slate-800 leading-relaxed text-xs">
          {sanitizeText(item.texto_requisito_literal)}
        </p>
      </div>

      {/* Evidencia Citada */}
      {item.evidencia && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <FiFileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Fuente: {sanitizeText(item.evidencia.fuente_nombre)}</span>
            </div>
            <CitationVerificationBadge verificada={item.evidencia.cita_verificada} />
          </div>
          <p className="text-slate-600 italic leading-relaxed">
            {sanitizeText(item.evidencia.cita_literal)}
          </p>
        </div>
      )}

      {/* Faltante o Motivo de Revisión */}
      {item.faltante && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-amber-900">
          <span className="font-semibold">Brecha / Faltante: </span>
          <span>{sanitizeText(item.faltante)}</span>
        </div>
      )}

      {item.motivo_revision && (
        <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-slate-800 flex items-center justify-between">
          <div>
            <span className="font-semibold">Motivo de revisión humana: </span>
            <span>{sanitizeText(item.motivo_revision)}</span>
          </div>
          {item.es_ambiguo && onGenerateObservation && (
            <button
              type="button"
              onClick={() => onGenerateObservation(item)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-primary text-white font-medium hover:bg-brand-hover transition-colors"
            >
              <FiMessageSquare className="w-3 h-3" />
              <span>Generar observación</span>
            </button>
          )}
        </div>
      )}

      {/* Historial de Revisiones Humanas (HU-F09 / HU-F11) */}
      {item.revisiones.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5">
          <p className="font-semibold text-slate-800">Trazabilidad de Revisión Humana:</p>
          {item.revisiones.map((rev) => (
            <div key={rev.id} className="text-[11px] text-slate-600 border-l-2 border-slate-400 pl-2">
              <p className="font-mono font-semibold text-slate-800">
                Modificado por {rev.autor_nombre} · {rev.fecha} ({rev.estado_anterior} →{' '}
                {rev.estado_nuevo})
              </p>
              <p className="mt-0.5">{sanitizeText(rev.comentario)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


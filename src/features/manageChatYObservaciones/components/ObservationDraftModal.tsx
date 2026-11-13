import React from 'react';
import { useObservationDraft } from '../hooks/useObservationDraft';
import { CopyClipboardButton } from './CopyClipboardButton';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';

export interface ObservationDraftModalProps {
  licitacionId?: string;
  emptySelectionState?: boolean;
  generatingState?: boolean;
  copiedState?: boolean;
}

export const ObservationDraftModal: React.FC<ObservationDraftModalProps> = ({
  licitacionId = 'LP-MIN-001-2026',
  emptySelectionState = false,
  generatingState = false,
  copiedState = false,
}) => {
  const {
    clauses,isMock,
    selectedReqCode,
    draft,
    selectClause,
    formatFullDraftForClipboard,
  } = useObservationDraft(licitacionId, emptySelectionState ? '' : 'REQ-019');

  const isUnselected = emptySelectionState || !selectedReqCode || !draft;

  return (
    <div className="flex h-full flex-col justify-between space-y-6">
      <div>
        {/* Header directly on canvas */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className={`${TYPOGRAPHY.title} text-base`}>
            Generador de Observaciones al Pliego
          </h3>
          <span className="text-xs font-medium text-slate-500">
            Borrador formal
          </span>
        </div>

        {/* Selector Dropdown */}
        <div className="mb-5">
          <select
            aria-label="Seleccionar cláusula para observación"
            value={emptySelectionState ? '' : selectedReqCode}
            onChange={(e) => selectClause(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-slate-800 focus:outline-none"
          >
            <option value="">Seleccione una cláusula ambigua o restrictiva ▾</option>
            {isMock?<><option value="REQ-019">REQ-019 (Numeral 3.4.2 - Maquinaria y Equipos Propios) ▾</option><option value="REQ-022">REQ-022 (Numeral 5.2 - Plan de Gestión Ambiental y SST) ▾</option></>:clauses.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {/* Document Editor Area */}
        <div className="min-h-[340px] border-y border-slate-200 py-5">
          {isUnselected ? (
            <div className="flex h-[300px] items-center justify-center text-center">
              <p className={`max-w-sm ${TYPOGRAPHY.body}`}>
                Seleccione un requisito ambiguo de la matriz para redactar una observación formal.
              </p>
            </div>
          ) : generatingState ? (
            <div>
              <div className="mb-6 border-l-2 border-slate-400 pl-3.5 text-xs leading-relaxed text-slate-700">
                {draft.clausula_origen}
              </div>
              <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                <p className={TYPOGRAPHY.label}>
                  Redactando observación jurídica fundamentada...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <button type="button" className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
                  Negrita
                </button>
                <button type="button" className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
                  Subrayado
                </button>
                <button type="button" className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
                  Copiar
                </button>
              </div>

              {/* Quoted Clause Box */}
              <div className="border-l-2 border-slate-900 pl-4 py-1 text-xs leading-relaxed text-slate-700">
                {draft.clausula_origen}
              </div>

              {/* Formal Addressee & Structured Legal Paragraphs */}
              <div className="space-y-3 pt-1 text-xs leading-relaxed text-slate-800">
                <p className="font-semibold text-slate-900">{draft.destinatario}</p>

                <p>
                  <strong className="font-semibold text-slate-900">
                    Hecho / Cláusula cuestionada.
                  </strong>{' '}
                  {draft.hecho_cuestionado}
                </p>

                <p>
                  <strong className="font-semibold text-slate-900">
                    Sustento jurídico / Argumento.
                  </strong>{' '}
                  {draft.sustento_juridico}
                </p>

                <p>
                  <strong className="font-semibold text-slate-900">Solicitud concreta.</strong>{' '}
                  {draft.solicitud_concreta}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions & Mandatory SECOP II Notice */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <CopyClipboardButton
            textToCopy={formatFullDraftForClipboard()}
            forceCopiedState={copiedState}
            disabled={isUnselected || generatingState}
          />
          <button
            type="button"
            disabled={isUnselected || generatingState}
            className={`rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium transition-colors ${
              isUnselected || generatingState
                ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            Exportar como Anexo PDF
          </button>
        </div>

        <p className={TYPOGRAPHY.label}>
          Nota: El sistema no envía observaciones a la entidad. Este borrador debe presentarse a
          través de la plataforma oficial SECOP II.
        </p>
      </div>
    </div>
  );
};

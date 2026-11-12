import React, { useState, useEffect } from 'react';
import type { EstadoCumplimiento } from '@/api/types';
import { detectRecommendationShift } from '../utils/detectRecommendationShift';

export interface ReviewDecisionFormProps {
  esHabilitante?: boolean;
  initialDecision?: EstadoCumplimiento;
  initialComment?: string;
  forceValidationError?: boolean;
  isSubmitting?: boolean;
  onConfirm: (estado: EstadoCumplimiento, comentario: string) => void;
  onGenerateObservation?: () => void;
}

export const ReviewDecisionForm: React.FC<ReviewDecisionFormProps> = ({
  esHabilitante = true,
  initialDecision = 'cumple',
  initialComment = '',
  forceValidationError = false,
  isSubmitting = false,
  onConfirm,
  onGenerateObservation,
}) => {
  const [decision, setDecision] = useState<EstadoCumplimiento>(initialDecision);
  const [comentario, setComentario] = useState<string>(initialComment);
  const [showValidationAlert, setShowValidationAlert] = useState<boolean>(forceValidationError);

  useEffect(() => {
    setDecision(initialDecision);
    setComentario(initialComment);
    setShowValidationAlert(forceValidationError);
  }, [initialDecision, initialComment, forceValidationError]);

  const shiftInfo = detectRecommendationShift(esHabilitante, decision, 4);
  const isCommentEmpty = comentario.trim().length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommentEmpty) {
      setShowValidationAlert(true);
      return;
    }
    setShowValidationAlert(false);
    onConfirm(decision, comentario.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h4 className="mb-3 text-[13px] font-semibold text-slate-900">
          Determinar Estado de Cumplimiento Manual:
        </h4>

        <div className="mb-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setDecision('cumple')}
            className={`rounded-lg border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
              decision === 'cumple'
                ? 'border-[#10B981] bg-[#ECFDF5]/60 text-[#047857] dark:border-[#3ECF8E] dark:bg-[#0D7A4D]/25 dark:text-[#3ECF8E]'
                : 'border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#232323] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#2A2A2A]'
            }`}
          >
            Cumple
          </button>

          <button
            type="button"
            onClick={() => setDecision('cumple_parcialmente')}
            className={`rounded-lg border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
              decision === 'cumple_parcialmente'
                ? 'border-[#F59E0B] bg-[#FFFBEB] text-[#B45309] dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#232323] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#2A2A2A]'
            }`}
          >
            Cumple Parcial / Con Consorcio
          </button>

          <button
            type="button"
            onClick={() => setDecision('no_cumple')}
            className={`rounded-lg border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
              decision === 'no_cumple'
                ? 'border-[#E11D48] bg-[#FFF1F2]/60 text-[#BE123C] dark:border-red-400 dark:bg-red-500/15 dark:text-red-300'
                : 'border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#232323] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#2A2A2A]'
            }`}
          >
            No Cumple
          </button>
        </div>

        <label
          htmlFor="review-justification-textarea"
          className="mb-2 block text-[12.5px] font-medium text-slate-700 dark:text-zinc-300"
        >
          Motivo de la decisión:
        </label>
        <textarea
          id="review-justification-textarea"
          rows={3}
          value={comentario}
          onChange={(e) => {
            setComentario(e.target.value);
            if (e.target.value.trim().length > 0) {
              setShowValidationAlert(false);
            }
          }}
          placeholder="Explique por qué se aprueba o rechaza el requisito basándose en la evidencia..."
          className={`w-full rounded-lg border p-3 text-[12.5px] text-slate-800 dark:text-[#EDEDED] placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none ${
            showValidationAlert
              ? 'border-[#E11D48] bg-[#FFF1F2]/20 dark:border-red-400 dark:bg-red-500/10 focus:border-[#E11D48]'
              : 'border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#232323] focus:border-slate-400 dark:focus:border-[#3ECF8E]'
          }`}
        />

        {showValidationAlert && (
          <div
            role="alert"
            className="mt-2.5 rounded-lg border border-[#FECDD3] dark:border-red-500/30 bg-[#FFF1F2] dark:bg-red-500/10 px-3.5 py-2 text-[12px] font-normal text-[#BE123C] dark:text-red-300"
          >
            Por favor ingrese un breve motivo antes de guardar la decisión.
          </div>
        )}
      </div>

      {/* Warning Banner when No Cumple alters overall recommendation (Page 42) */}
      {shiftInfo.warningMessage && (
        <div
          role="status"
          className="rounded-xl border border-[#FDE68A] dark:border-amber-500/30 bg-[#FFFBEB] dark:bg-amber-500/10 px-4 py-3 text-[12.5px] font-medium text-[#B45309] dark:text-amber-300"
        >
          {shiftInfo.warningMessage}
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5">
        <button
          type="button"
          onClick={onGenerateObservation}
          className="text-[12.5px] font-semibold text-slate-700 hover:text-slate-900"
        >
          Generar Borrador de Observación a la Entidad →
        </button>

        <button
          type="submit"
          disabled={(isCommentEmpty && !forceValidationError) || isSubmitting}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
            isSubmitting
              ? 'bg-slate-200 text-slate-600 cursor-wait'
              : isCommentEmpty && !forceValidationError
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-brand-primary text-white hover:bg-brand-hover'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
              <span>Recalculando matriz y recomendación...</span>
            </>
          ) : (
            <span>Confirmar Resolución y Recalcular Decisión</span>
          )}
        </button>
      </div>
    </form>
  );
};


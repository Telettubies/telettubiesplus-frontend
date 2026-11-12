import type { EstadoCumplimiento, RecomendacionEstado } from '@/api/types';

export interface RecommendationShiftResult {
  willShiftToNoPresentarse: boolean;
  newRecommendation: RecomendacionEstado;
  warningMessage: string | null;
}

export function detectRecommendationShift(
  esHabilitante: boolean,
  nuevoEstado: EstadoCumplimiento,
  remainingReviewsCount: number
): RecommendationShiftResult {
  if (esHabilitante && nuevoEstado === 'no_cumple') {
    return {
      willShiftToNoPresentarse: true,
      newRecommendation: 'no_presentarse',
      warningMessage:
        "Atención: Marcar este ítem como 'No Cumple' alterará automáticamente la recomendación general del proceso a 'NO PRESENTARSE'.",
    };
  }

  if (remainingReviewsCount <= 1) {
    return {
      willShiftToNoPresentarse: false,
      newRecommendation: 'presentarse_con_riesgo',
      warningMessage: null,
    };
  }

  return {
    willShiftToNoPresentarse: false,
    newRecommendation: 'condicionada',
    warningMessage: null,
  };
}


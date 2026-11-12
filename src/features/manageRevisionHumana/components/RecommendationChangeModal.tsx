import React from 'react';
import type { RecomendacionEstado } from '@/api/types';
import { RecommendationBadge } from '@/shared/components/badges/RecommendationBadge';

export interface RecommendationChangeModalProps {
  isOpen: boolean;
  previousRecommendation: RecomendacionEstado;
  newRecommendation: RecomendacionEstado;
  onClose: () => void;
}

export const RecommendationChangeModal: React.FC<RecommendationChangeModalProps> = ({
  isOpen,
  previousRecommendation,
  newRecommendation,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 left-0 lg:left-[var(--sidebar-width,240px)] z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-[15px] font-semibold text-slate-900">
          Recomendación General Actualizada
        </h3>
        <p className="mb-4 text-[13px] text-slate-600">
          La recomendación del proceso se ha actualizado según su revisión:
        </p>
        <div className="mb-5 flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <RecommendationBadge recomendacion={previousRecommendation} />
          <span className="font-mono text-slate-400">→</span>
          <RecommendationBadge recomendacion={newRecommendation} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-brand-primary py-2 text-[13px] font-semibold text-white hover:bg-brand-hover transition-colors"
        >
          Continuar en la Bandeja
        </button>
      </div>
    </div>
  );
};


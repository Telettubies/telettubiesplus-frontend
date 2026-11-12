import React from 'react';
import { FiAward, FiAlertOctagon, FiSlash, FiClock } from 'react-icons/fi';
import type { RecomendacionLicitacion } from '@/api/types';

interface RecommendationBadgeProps {
  recomendacion: RecomendacionLicitacion;
  variant?: 'hero' | 'table' | 'kpi';
  className?: string;
}

const RECOMMENDATION_CONFIG: Record<
  RecomendacionLicitacion,
  {
    fullLabel: string;
    heroLabel: string;
    tableLabel: string;
    kpiLabel: string;
    Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    styles: string;
  }
> = {
  presentarse: {
    fullLabel: 'Presentarse',
    heroLabel: 'Recomendación: Presentarse',
    tableLabel: 'Presentarse',
    kpiLabel: 'Presentarse',
    Icon: FiAward,
    styles: 'text-emerald-700 dark:text-[#3ECF8E]',
  },
  presentarse_con_riesgo: {
    fullLabel: 'Presentarse con riesgo',
    heroLabel: 'Recomendación: Presentarse con Riesgo',
    tableLabel: 'Con Riesgo',
    kpiLabel: 'Con Riesgo',
    Icon: FiAlertOctagon,
    styles: 'text-amber-700 dark:text-amber-400',
  },
  no_presentarse: {
    fullLabel: 'No presentarse',
    heroLabel: 'Recomendación: No Presentarse',
    tableLabel: 'No Presentarse',
    kpiLabel: 'No Presentarse',
    Icon: FiSlash,
    styles: 'text-red-700 dark:text-red-400',
  },
  condicionada: {
    fullLabel: 'Recomendación condicionada',
    heroLabel: 'Recomendación: Condicionada',
    tableLabel: 'Condicionada',
    kpiLabel: 'Condicionada',
    Icon: FiClock,
    styles: 'text-slate-600 dark:text-zinc-400',
  },
};

export const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({
  recomendacion,
  variant = 'table',
  className = '',
}) => {
  const config = RECOMMENDATION_CONFIG[recomendacion] ?? RECOMMENDATION_CONFIG.condicionada;
  const { Icon } = config;

  const visibleText =
    variant === 'hero'
      ? config.heroLabel
      : variant === 'kpi'
      ? config.kpiLabel
      : config.tableLabel;

  return (
    <span
      role="status"
      aria-label={config.fullLabel}
      data-testid={`recommendation-badge-${recomendacion}`}
      className={`inline-flex items-center gap-1.5 text-xs font-sans font-medium tracking-tight ${config.styles} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden={true} />
      <span>{visibleText}</span>
    </span>
  );
};

import React from 'react';
import { RecommendationBadge } from '@/shared/components/badges/RecommendationBadge';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import type { PortfolioVisualState } from '../hooks/useTendersList';

interface PortfolioKpiCardsProps {
  visualState: PortfolioVisualState;
}

export const PortfolioKpiCards: React.FC<PortfolioKpiCardsProps> = ({ visualState }) => {
  const isEmpty = visualState === 'empty';
  const isError = visualState === 'error_403';
  const isSkeleton = visualState === 'skeleton';
  const isNewJob = visualState === 'new_job';

  const totalCount = isError ? '—' : isEmpty ? 0 : isNewJob ? 25 : 24;
  const inProgressCount = isEmpty ? 0 : isNewJob ? 5 : 4;
  const viableCount = isError ? '—' : isEmpty ? 0 : 9;
  const riskCount = isError ? '—' : isEmpty ? 0 : 6;
  const discardedCount = isError ? '—' : isEmpty ? 0 : 9;

  return (
    <div
      data-tour="portfolio-kpis"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-slate-200/80"
    >
      {/* KPI 1 */}
      <div className="space-y-1.5 sm:pr-4">
        <p className={TYPOGRAPHY.label}>Total Procesos Analizados</p>
        {isSkeleton ? (
          <div className="space-y-2 pt-1 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className={`${TYPOGRAPHY.title} text-2xl`}>{totalCount}</span>
              <span className={TYPOGRAPHY.label}>Procesos</span>
            </div>
            {!isError && <p className={TYPOGRAPHY.label}>{inProgressCount} en curso</p>}
          </>
        )}
      </div>

      {/* KPI 2 */}
      <div className="space-y-1.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
        <p className={TYPOGRAPHY.label}>Viables para Presentarse</p>
        {isSkeleton ? (
          <div className="space-y-2 pt-1 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="h-5 bg-slate-100 rounded w-24" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className={`${TYPOGRAPHY.title} text-2xl`}>{viableCount}</span>
              <span className={TYPOGRAPHY.label}>Procesos</span>
            </div>
            <RecommendationBadge recomendacion="presentarse" variant="kpi" />
          </>
        )}
      </div>

      {/* KPI 3 */}
      <div className="space-y-1.5 lg:border-l lg:border-slate-200/80 lg:pl-6">
        <p className={TYPOGRAPHY.label}>En Riesgo / Requiere Consorcio</p>
        {isSkeleton ? (
          <div className="space-y-2 pt-1 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="h-5 bg-slate-100 rounded w-24" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className={`${TYPOGRAPHY.title} text-2xl`}>{riskCount}</span>
              <span className={TYPOGRAPHY.label}>Procesos</span>
            </div>
            <RecommendationBadge recomendacion="presentarse_con_riesgo" variant="kpi" />
          </>
        )}
      </div>

      {/* KPI 4 */}
      <div className="space-y-1.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
        <p className={TYPOGRAPHY.label}>Descartados por No Cumplimiento</p>
        {isSkeleton ? (
          <div className="space-y-2 pt-1 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="h-5 bg-slate-100 rounded w-24" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className={`${TYPOGRAPHY.title} text-2xl`}>{discardedCount}</span>
              <span className={TYPOGRAPHY.label}>Procesos</span>
            </div>
            <RecommendationBadge recomendacion="no_presentarse" variant="kpi" />
          </>
        )}
      </div>
    </div>
  );
};

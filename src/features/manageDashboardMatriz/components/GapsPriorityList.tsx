import React from 'react';
import { FiAlertOctagon } from 'react-icons/fi';
import type { ItemVerificable } from '@/api/types';
import { sortGapsHabilitantesFirst } from '../utils/sortGapsHabilitantesFirst';
import { ComplianceBadge } from '@/shared/components/badges/ComplianceBadge';
import { CategoryBadge } from '@/shared/components/badges/CategoryBadge';

interface GapsPriorityListProps {
  items: ItemVerificable[];
  onSelectGap: (item: ItemVerificable) => void;
}

export const GapsPriorityList: React.FC<GapsPriorityListProps> = ({ items, onSelectGap }) => {
  const orderedGaps = sortGapsHabilitantesFirst(items);

  return (
    <div
      data-testid="gaps-priority-list"
      className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiAlertOctagon className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-semibold text-slate-900">
            Lista Priorizada de Brechas
          </h3>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          {orderedGaps.length} brechas detectadas
        </span>
      </div>

      {orderedGaps.length === 0 ? (
        <p className="text-xs text-slate-500 py-2">
          No existen brechas de cumplimiento registradas en este proceso.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {orderedGaps.map((gap) => (
            <div
              key={gap.id}
              data-testid={`gap-row-${gap.codigo_req}`}
              onClick={() => onSelectGap(gap)}
              className="py-2.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded cursor-pointer transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono font-medium text-slate-900">{gap.codigo_req}</span>
                <span className="font-mono text-slate-500">Numeral {gap.numeral}</span>
                <CategoryBadge categoria={gap.categoria === 'habilitantes' ? 'habilitante' : gap.categoria === 'tecnicos' ? 'tecnico' : gap.categoria} />
                <span className="text-slate-700 truncate max-w-xs">{gap.descripcion_item}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {gap.subsanable !== undefined && gap.subsanable !== null && (
                  <span
                    className={`text-[11px] font-medium ${
                      gap.subsanable ? 'text-blue-700' : 'text-red-700'
                    }`}
                  >
                    {gap.subsanable ? 'Subsanable' : 'No subsanable'}
                  </span>
                )}
                <ComplianceBadge estado={gap.estado} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


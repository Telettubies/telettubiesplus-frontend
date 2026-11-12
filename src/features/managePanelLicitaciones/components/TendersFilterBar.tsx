import React from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import type { PortfolioCategoryFilter, PortfolioStatusFilter } from '../utils/sortTenders';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';

interface TendersFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: PortfolioCategoryFilter;
  onCategoryChange: (cat: PortfolioCategoryFilter) => void;
  statusFilter: PortfolioStatusFilter;
  onStatusChange: (st: PortfolioStatusFilter) => void;
  onNewTenderClick: () => void;
}

export const TendersFilterBar: React.FC<TendersFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  onNewTenderClick,
}) => {
  const categories: PortfolioCategoryFilter[] = ['Todos', 'Infraestructura', 'Tecnología'];
  const statuses: PortfolioStatusFilter[] = ['Habilitado', 'Descalificado', 'En Análisis'];

  return (
    <div
      data-tour="portfolio-filters"
      className="py-2 flex flex-wrap items-center justify-between gap-4"
    >
      {/* Search + Category Pills + Status Pills directly on canvas */}
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
        <div className="relative w-full sm:w-72">
          <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por proceso, entidad u objeto..."
            aria-label="Buscar licitaciones"
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`${TYPOGRAPHY.label} mr-1`}>Categoría</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hidden md:block h-4 w-px bg-slate-200 mx-1" />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`${TYPOGRAPHY.label} mr-1`}>Estado</span>
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusChange(statusFilter === st ? 'Todos' : st)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={onNewTenderClick}
        data-testid="upload-new-tender-btn"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors shrink-0"
      >
        <FiPlus className="w-4 h-4" />
        <span>Cargar Nuevo Pliego (PDF)</span>
      </button>
    </div>
  );
};

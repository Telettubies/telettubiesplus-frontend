import React from 'react';
import { Search } from 'lucide-react';

export interface ViewerToolbarProps {
  fileName?: string;
  currentPage: number;
  totalPages: number;
  zoomPercent: number;
  searchQuery: string;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSearchChange: (q: string) => void;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  fileName = 'Pliego_Condiciones_v1.pdf',
  currentPage,
  totalPages,
  zoomPercent,
  searchQuery,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3.5 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold text-slate-900">{fileName}</span>
        <span className="text-[12px] text-slate-500">Pág.</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          aria-label="Página actual del pliego"
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value) || 1)}
          className="w-11 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-center font-mono text-[12px] font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
        />
        <span className="text-[12px] text-slate-500">de {totalPages}</span>

        <div className="ml-1 flex items-center gap-1">
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Reducir zoom"
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50"
          >
            −
          </button>
          <span className="min-w-[38px] text-center font-mono text-[12px] font-medium text-slate-700">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Aumentar zoom"
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="relative min-w-[180px] flex-1 max-w-[230px]">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar en el pliego"
          className="w-full rounded border border-slate-200 bg-slate-50/60 py-1 pl-8 pr-2.5 text-[12px] text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
        />
      </div>
    </div>
  );
};


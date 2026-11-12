import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'dashboard' | 'table' | 'card' | 'viewer' | 'fullscreen';
  rows?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'table',
  rows = 6,
  className = '',
}) => {
  if (variant === 'fullscreen') {
    return (
      <div
        role="status"
        aria-label="Cargando espacio de trabajo..."
        className="min-h-screen bg-surface-page p-8 space-y-6 animate-pulse"
      >
        <div className="h-14 bg-white border border-slate-200 rounded-xl w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="h-96 bg-white border border-slate-200 rounded-xl" />
      </div>
    );
  }

  if (variant === 'viewer') {
    return (
      <div
        role="status"
        aria-label="Preparando lienzo del pliego..."
        className={`bg-slate-200/70 rounded-lg p-6 flex flex-col items-center justify-center h-[520px] animate-pulse ${className}`}
      >
        <div className="bg-white w-4/5 h-full rounded shadow-sm p-8 space-y-4">
          <div className="h-3 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-300 rounded w-1/2 mt-4" />
          <div className="space-y-2 pt-4">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-11/12" />
            <div className="h-3 bg-slate-200 rounded w-4/5" />
          </div>
          <div className="h-20 bg-amber-100/60 border border-amber-200 rounded p-3 space-y-2 mt-4">
            <div className="h-3 bg-amber-200/80 rounded w-full" />
            <div className="h-3 bg-amber-200/80 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Cargando registros..."
      className={`bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse ${className}`}
    >
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-none gap-4"
        >
          <div className="h-3.5 bg-slate-200 rounded w-24 shrink-0" />
          <div className="h-3.5 bg-slate-200 rounded w-1/3" />
          <div className="h-3.5 bg-slate-100 rounded w-1/4" />
          <div className="h-5 bg-slate-200 rounded w-20 shrink-0" />
          <div className="h-4 bg-slate-200 rounded w-24 shrink-0" />
        </div>
      ))}
    </div>
  );
};


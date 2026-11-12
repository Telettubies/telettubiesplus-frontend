import React from 'react';
import type { ReferenciaPliegoChat } from '@/api/types';

export interface ClickableNumeralTextProps {
  referencias?: ReferenciaPliegoChat[];
  onJumpToPage?: (pagina: number, etiqueta: string) => void;
}

export const ClickableNumeralText: React.FC<ClickableNumeralTextProps> = ({
  referencias = [],
  onJumpToPage,
}) => {
  if (!referencias || referencias.length === 0) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {referencias.map((ref) => (
        <button
          key={`${ref.etiqueta}-${ref.pagina}`}
          type="button"
          onClick={() => onJumpToPage?.(ref.pagina, ref.etiqueta)}
          className="inline-flex items-center rounded border border-slate-300 dark:border-[#343434] bg-white dark:bg-[#1C1C1C] px-2.5 py-1 font-mono text-[11px] font-medium text-slate-700 dark:text-zinc-300 transition-colors hover:border-slate-400 dark:hover:border-[#3ECF8E] hover:bg-slate-50 dark:hover:bg-[#232323] dark:hover:text-[#3ECF8E] cursor-pointer"
        >
          [Ver {ref.etiqueta} (Pág. {ref.pagina})]
        </button>
      ))}
    </div>
  );
};


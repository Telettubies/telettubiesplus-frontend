import React from 'react';
import { FiShield, FiCpu, FiBriefcase, FiCalendar } from 'react-icons/fi';
import type { CategoriaRequisito } from '@/api/types';

interface CategoryBadgeProps {
  categoria: CategoriaRequisito;
  className?: string;
}

const CATEGORY_CONFIG: Record<
  CategoriaRequisito,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    styles: string;
  }
> = {
  habilitante: {
    label: 'Habilitante',
    Icon: FiShield,
    styles: 'text-slate-700 dark:text-zinc-300',
  },
  tecnico: {
    label: 'Técnico',
    Icon: FiCpu,
    styles: 'text-blue-700 dark:text-[#3ECF8E]',
  },
  experiencia: {
    label: 'Experiencia',
    Icon: FiBriefcase,
    styles: 'text-indigo-700 dark:text-emerald-300',
  },
  plazo: {
    label: 'Plazo',
    Icon: FiCalendar,
    styles: 'text-purple-700 dark:text-zinc-400',
  },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ categoria, className = '' }) => {
  const config = CATEGORY_CONFIG[categoria] ?? CATEGORY_CONFIG.tecnico;
  const { Icon } = config;

  return (
    <span
      data-testid={`category-badge-${categoria}`}
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.styles} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden={true} />
      <span>{config.label}</span>
    </span>
  );
};


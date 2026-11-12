import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiEye } from 'react-icons/fi';
import type { EstadoCumplimiento } from '@/api/types';

interface ComplianceBadgeProps {
  estado: EstadoCumplimiento;
  variant?: 'bracket' | 'full';
  className?: string;
}

const COMPLIANCE_CONFIG: Record<
  EstadoCumplimiento,
  {
    label: string;
    shortLabel: string;
    Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    styles: string;
  }
> = {
  cumple: {
    label: 'Cumple',
    shortLabel: 'Cumple',
    Icon: FiCheckCircle,
    styles: 'text-emerald-700 dark:text-[#3ECF8E]',
  },
  cumple_parcialmente: {
    label: 'Cumple parcialmente',
    shortLabel: 'Cumple Parcial',
    Icon: FiAlertTriangle,
    styles: 'text-amber-700 dark:text-amber-400',
  },
  no_cumple: {
    label: 'No cumple',
    shortLabel: 'No Cumple',
    Icon: FiXCircle,
    styles: 'text-red-700 dark:text-red-400',
  },
  revision: {
    label: 'Requiere revisión',
    shortLabel: 'En Revisión',
    Icon: FiEye,
    styles: 'text-slate-600 dark:text-zinc-400',
  },
};

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  estado,
  variant = 'bracket',
  className = '',
}) => {
  const config = COMPLIANCE_CONFIG[estado] ?? COMPLIANCE_CONFIG.revision;
  const { Icon } = config;

  return (
    <span
      role="status"
      aria-label={config.label}
      data-testid={`compliance-badge-${estado}`}
      className={`inline-flex items-center gap-1.5 text-xs font-sans font-medium tracking-tight ${config.styles} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden={true} />
      <span>{variant === 'bracket' ? config.shortLabel : config.label}</span>
    </span>
  );
};

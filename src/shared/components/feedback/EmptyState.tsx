import React from 'react';
import { FiFolderPlus, FiCheckCircle } from 'react-icons/fi';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'success';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  className = '',
}) => {
  const Icon = variant === 'success' ? FiCheckCircle : FiFolderPlus;

  return (
    <div
      data-testid="empty-state-card"
      className={`bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 ${className}`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${
          variant === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};


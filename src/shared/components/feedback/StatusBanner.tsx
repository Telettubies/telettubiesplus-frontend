import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi';

export type BannerVariant = 'success' | 'warning' | 'error' | 'info';

interface StatusBannerProps {
  variant: BannerVariant;
  title?: string;
  message: string;
  badgeText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const BANNER_STYLES: Record<
  BannerVariant,
  {
    container: string;
    Icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
  }
> = {
  success: {
    container: 'bg-emerald-50/90 border-emerald-200 text-emerald-900 dark:bg-[#0D7A4D]/20 dark:border-[#3ECF8E]/35 dark:text-[#3ECF8E]',
    Icon: FiCheckCircle,
    iconColor: 'text-emerald-600 dark:text-[#3ECF8E]',
  },
  warning: {
    container: 'bg-amber-50/90 border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
    Icon: FiAlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    container: 'bg-red-50/90 border-red-200 text-red-900 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300',
    Icon: FiAlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
  },
  info: {
    container: 'bg-blue-50/90 border-blue-200 text-blue-900 dark:bg-[#232323] dark:border-[#3ECF8E]/30 dark:text-zinc-200',
    Icon: FiInfo,
    iconColor: 'text-blue-600 dark:text-[#3ECF8E]',
  },
};

export const StatusBanner: React.FC<StatusBannerProps> = ({
  variant,
  title,
  message,
  badgeText,
  actionLabel,
  onAction,
  className = '',
}) => {
  const { container, Icon, iconColor } = BANNER_STYLES[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 px-4 py-3 rounded-lg border text-xs ${container} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
        <div className="space-y-0.5">
          {title && <p className="font-semibold">{title}</p>}
          <p className="leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {badgeText && (
          <span className="px-2 py-0.5 rounded bg-white/80 border border-current/20 font-mono text-[11px] font-medium">
            {badgeText}
          </span>
        )}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-3 py-1 rounded bg-brand-primary text-white font-medium hover:bg-brand-hover transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};


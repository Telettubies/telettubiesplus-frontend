import React from 'react';

interface ErrorRetryCardProps {
  checkpointEtapa?: number;
  checkpointFecha?: string;
  onRetry: () => void;
}

export const ErrorRetryCard: React.FC<ErrorRetryCardProps> = ({
  onRetry,
}) => {
  return (
    <div
      data-testid="pipeline-error-retry-card"
      className="pt-2 flex flex-wrap items-center justify-between gap-3"
    >
      <button
        type="button"
        onClick={onRetry}
        className="flex-1 py-3 px-4 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors text-center"
      >
        Reintentar desde la última etapa guardada
      </button>
    </div>
  );
};


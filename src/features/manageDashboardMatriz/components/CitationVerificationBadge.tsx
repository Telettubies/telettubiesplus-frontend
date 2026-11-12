import React from 'react';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

interface CitationVerificationBadgeProps {
  verificada: boolean;
}

export const CitationVerificationBadge: React.FC<CitationVerificationBadgeProps> = ({
  verificada,
}) => {
  if (verificada) {
    return (
      <span
        data-testid="citation-verified-badge"
        className="inline-flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium"
      >
        <FiCheckCircle className="w-3 h-3 shrink-0" aria-hidden={true} />
        <span>Cita verificada</span>
      </span>
    );
  }

  return (
    <span
      role="alert"
      data-testid="citation-unverified-badge"
      className="inline-flex items-center gap-1.5 text-amber-700 text-[11px] font-medium"
    >
      <FiAlertTriangle className="w-3 h-3 shrink-0" aria-hidden={true} />
      <span>Cita por confirmar</span>
    </span>
  );
};


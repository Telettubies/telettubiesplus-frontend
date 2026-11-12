import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiShield, FiLayers } from 'react-icons/fi';

export type CalmingStageKey =
  | 'ocr'
  | 'filtrado'
  | 'extraccion'
  | 'verificacion'
  | 'localizacion'
  | 'default';

export const CALMING_MESSAGES: Record<CalmingStageKey, string> = {
  ocr: 'Leyendo documento página por página y extrayendo tablas sin omitir anexos...',
  filtrado: 'Identificando capítulos con obligaciones y descartando secciones informativas...',
  extraccion: 'Analizando sección 38 de 52: identificando cada requisito con su numeral...',
  verificacion: 'Contrastando requisitos contra los contratos, hojas de vida y certificaciones...',
  localizacion: 'Asociando cada requisito con su ubicación en el PDF...',
  default: 'Analizando el documento de la licitación...',
};

interface CalmingSpinnerProps {
  stage?: CalmingStageKey;
  customMessage?: string;
  subMessage?: string;
  className?: string;
}

export const CalmingSpinner: React.FC<CalmingSpinnerProps> = ({
  stage = 'default',
  customMessage,
  subMessage,
  className = '',
}) => {
  const message = customMessage || CALMING_MESSAGES[stage] || CALMING_MESSAGES.default;
  const Icon = stage === 'verificacion' ? FiShield : stage === 'localizacion' ? FiLayers : FiCpu;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3.5 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
        className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0"
      >
        <Icon className="w-4 h-4" />
      </motion.div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-800 leading-snug">{message}</p>
        {subMessage && <p className="text-[11px] text-slate-500 font-mono mt-0.5">{subMessage}</p>}
      </div>
    </div>
  );
};


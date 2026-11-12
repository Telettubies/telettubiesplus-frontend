import React, { useState, useEffect } from 'react';

export interface CopyClipboardButtonProps {
  textToCopy: string;
  forceCopiedState?: boolean;
  disabled?: boolean;
}

export const CopyClipboardButton: React.FC<CopyClipboardButtonProps> = ({
  textToCopy,
  forceCopiedState = false,
  disabled = false,
}) => {
  const [copied, setCopied] = useState<boolean>(forceCopiedState);

  useEffect(() => {
    setCopied(forceCopiedState);
  }, [forceCopiedState]);

  const handleCopy = async () => {
    if (disabled) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
    } catch {
      // Fallback for non-HTTPS or test environments
    }
    setCopied(true);
  };

  if (copied) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="px-2 py-2 text-xs font-medium text-emerald-700 transition-colors"
      >
        ✓ [Copiado al Portapapeles]
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleCopy}
      className={`rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
        disabled
          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
          : 'bg-brand-primary text-white hover:bg-brand-hover'
      }`}
    >
      Copiar Borrador al Portapapeles
    </button>
  );
};


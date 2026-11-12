import React from 'react';
import { FiCheck, FiMinus } from 'react-icons/fi';
import type { PasswordValidationResult } from '../utils/authValidators';

interface PasswordRulesChecklistProps {
  validation: PasswordValidationResult;
}

export const PasswordRulesChecklist: React.FC<PasswordRulesChecklistProps> = ({ validation }) => {
  const rules = [
    { key: 'minLength', label: '12+ characters', met: validation.minLength },
    { key: 'hasUppercase', label: 'Uppercase letter', met: validation.hasUppercase },
    { key: 'hasLowercase', label: 'Lowercase letter', met: validation.hasLowercase },
    { key: 'hasNumber', label: 'Number', met: validation.hasNumber },
    { key: 'hasSpecial', label: 'Special character', met: validation.hasSpecial },
    { key: 'passwordsMatch', label: 'Passwords match', met: validation.passwordsMatch },
  ];

  return (
    <div
      aria-label="Requisitos de complejidad de contraseña"
      className="grid grid-cols-2 gap-x-6 gap-y-1.5 py-2 text-xs"
    >
      {rules.map((rule) => (
        <div
          key={rule.key}
          className={`flex items-center gap-2 ${
            rule.met ? 'text-emerald-700 font-medium' : 'text-slate-500'
          }`}
        >
          {rule.met ? (
            <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <FiMinus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span>{rule.label}</span>
        </div>
      ))}
    </div>
  );
};


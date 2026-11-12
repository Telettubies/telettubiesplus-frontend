export interface PasswordValidationResult {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  passwordsMatch: boolean;
  isValid: boolean;
  missingSummary: string[];
}

export function validateEnterprisePassword(password: string, confirmPassword = ''): PasswordValidationResult {
  const minLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const missingSummary: string[] = [];
  if (!minLength) missingSummary.push(`12+ characters (${password.length} of 12)`);
  if (!hasUppercase) missingSummary.push('uppercase letter');
  if (!hasLowercase) missingSummary.push('lowercase letter');
  if (!hasNumber) missingSummary.push('number');
  if (!hasSpecial) missingSummary.push('special character');

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    passwordsMatch,
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch,
    missingSummary,
  };
}


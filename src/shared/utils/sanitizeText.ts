/**
 * Prevención estricta de XSS (S-11):
 * Todo texto proveniente de pliegos, evidencias o respuestas de LLMs (Claude/NVIDIA)
 * se trata como texto no confiable. Elimina etiquetas <script>, manejadores on* y HTML peligroso.
 */
export function sanitizeText(rawInput: string | null | undefined): string {
  if (!rawInput) return '';
  return String(rawInput)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .trim();
}

/**
 * Neutraliza fórmulas maliciosas al exportar celdas a Excel/CSV (S-12 / HU-B29):
 * Los valores que empiezan con =, +, - o @ se prefijan con comilla simple.
 */
export function sanitizeSpreadsheetCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}


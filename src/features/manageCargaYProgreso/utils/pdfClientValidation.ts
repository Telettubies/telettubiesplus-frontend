export const MAX_PDF_SIZE_BYTES = 40 * 1024 * 1024; // 40 MB
export const MAX_PDF_PAGES = 150;

export interface PdfValidationResult {
  valid: boolean;
  errorTitle?: string;
  errorSubtext?: string;
}

/**
 * Validación previa en cliente (HU-F05):
 * Rechaza archivos que no sean .pdf o superen el límite de 40MB antes de iniciar la subida.
 */
export function validatePdfFileClient(file: File): PdfValidationResult {
  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  const sizeMb = (file.size / (1024 * 1024)).toFixed(1).replace('.', ',');

  if (!isPdfMime && !isPdfExt) {
    return {
      valid: false,
      errorTitle: 'El archivo cargado no es un PDF válido o supera el límite permitido de 40MB.',
      errorSubtext: `${file.name} · ${sizeMb} MB · rechazado antes de la carga`,
    };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      errorTitle: 'El archivo cargado no es un PDF válido o supera el límite permitido de 40MB.',
      errorSubtext: `${file.name} · ${sizeMb} MB · rechazado antes de la carga`,
    };
  }

  return { valid: true };
}


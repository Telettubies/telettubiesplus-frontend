import React, { useRef } from 'react';
import { FiFilePlus, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import type { SelectedPdfMetadata } from '../hooks/usePdfUpload';
import type { PdfValidationResult } from '../utils/pdfClientValidation';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';

interface PdfDropzoneProps {
  selectedFileMeta: SelectedPdfMetadata | null;
  validationError: PdfValidationResult | null;
  useCache: boolean;
  onToggleCache: (val: boolean) => void;
  onSelectFile: (file: File) => void;
  onStartAnalysis: () => void;
  pipelineStatus: 'pendiente' | 'procesando' | 'completado' | 'error';
  showEmptySelectionHint?: boolean;
}

export const PdfDropzone: React.FC<PdfDropzoneProps> = ({
  selectedFileMeta,
  validationError,
  useCache,
  onToggleCache,
  onSelectFile,
  onStartAnalysis,
  pipelineStatus,
  showEmptySelectionHint = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  const getCtaLabel = () => {
    if (pipelineStatus === 'completado') return 'Análisis completado';
    if (pipelineStatus === 'procesando') return 'Análisis en curso...';
    if (pipelineStatus === 'error') return 'Ejecución detenida en la etapa 4';
    if (showEmptySelectionHint && !selectedFileMeta) return 'Seleccione un archivo PDF válido';
    return 'Iniciar Extracción y Análisis de Cobertura';
  };

  const isButtonActive =
    !!selectedFileMeta && pipelineStatus === 'pendiente' && !validationError;

  return (
    <div data-tour="upload-dropzone" className="space-y-6">
      {/* Header directly on canvas */}
      <div>
        <h2 className={`${TYPOGRAPHY.title} text-lg`}>Cargar Pliego de Condiciones</h2>
        <p className={`${TYPOGRAPHY.body} mt-0.5`}>
          Formatos permitidos: PDF nativo o digitalizado escaneado
        </p>
      </div>

      {/* Client Validation Error Banner */}
      {validationError && !validationError.valid && (
        <div
          role="alert"
          data-testid="pdf-validation-error"
          className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-1 text-xs text-red-900"
        >
          <div className="flex items-center gap-2 font-semibold">
            <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{validationError.errorTitle}</span>
          </div>
          {validationError.errorSubtext && (
            <p className="text-xs text-red-700 pl-6">
              {validationError.errorSubtext}
            </p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        data-testid="pdf-file-input"
        className="hidden"
      />

      {/* Selected File Summary vs Drag & Drop Zone */}
      {selectedFileMeta ? (
        <div className="space-y-4">
          <div
            data-testid="selected-pdf-card"
            className="rounded-2xl border border-slate-200 bg-white/80 p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-11 rounded-xl border border-slate-200 bg-red-50 flex items-center justify-center text-xs font-semibold text-red-600 shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {selectedFileMeta.nombre}
                  </p>
                  <p className={TYPOGRAPHY.label}>Archivo seleccionado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline shrink-0"
              >
                Cambiar
              </button>
            </div>

            <div className="border-t border-slate-200/70 pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className={TYPOGRAPHY.label}>Tamaño</span>
                <span className="font-medium text-slate-800">
                  {selectedFileMeta.tamanoTexto}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={TYPOGRAPHY.label}>Total de páginas</span>
                <span className="font-medium text-slate-800">
                  {selectedFileMeta.paginasTexto}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={TYPOGRAPHY.label}>Formato detectado</span>
                <span className="font-medium text-slate-800">
                  {selectedFileMeta.formatoTexto}
                </span>
              </div>
            </div>
          </div>

          {selectedFileMeta.ocrWarning && (
            <div
              role="note"
              className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-900"
            >
              <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-medium">Aviso:</span> Se detectaron páginas escaneadas. Se aplicará lectura automática sobre esas páginas.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          data-testid="pdf-dropzone-area"
          className="rounded-2xl border border-dashed border-slate-300 dark:border-[#383838] hover:border-brand-primary dark:hover:border-[#3ECF8E]/60 bg-white/60 dark:bg-[#1A1A1A] p-10 text-center flex flex-col items-center justify-center space-y-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#232323] border border-slate-200 dark:border-[#2E2E2E] flex items-center justify-center text-slate-700 dark:text-[#3ECF8E]">
            <FiFilePlus className="w-5 h-5" />
          </div>
          <p className={`${TYPOGRAPHY.title} text-sm`}>Arrastre aquí el pliego en PDF</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#232323] text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            Seleccionar archivo PDF local
          </button>
          <p className={TYPOGRAPHY.label}>Máximo 40MB o 150 páginas por proceso</p>
        </div>
      )}

      {/* Bottom Cache Toggle & CTA */}
      <div className="pt-2 space-y-4">
        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useCache}
            onChange={(e) => onToggleCache(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-[#383838] text-brand-primary accent-[#0D7A4D] focus:ring-brand-primary"
          />
          <span>Reutilizar análisis previo si este documento ya fue cargado anteriormente</span>
        </label>

        <button
          type="button"
          onClick={onStartAnalysis}
          data-testid="start-analysis-btn"
          className={`w-full py-3.5 px-4 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            isButtonActive
              ? 'bg-brand-primary text-white hover:bg-brand-hover dark:ring-1 dark:ring-[#3ECF8E]/30'
              : 'bg-slate-200/80 dark:bg-[#232323] text-slate-600 dark:text-zinc-400 hover:bg-slate-300/70 dark:hover:bg-[#2A2A2A]'
          }`}
        >
          {getCtaLabel()}
        </button>
      </div>
    </div>
  );
};

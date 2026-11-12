import React, { useRef } from 'react';
import { FiUpload, FiCheckCircle, FiDatabase } from 'react-icons/fi';
import type { ResumenBaseConocimiento } from '@/api/types';
import type { KnowledgeVisualMode } from '../hooks/useKnowledgeBaseUpload';
import { ReplaceWarningBanner } from './ReplaceWarningBanner';
import { ValidationErrorsList } from './ValidationErrorsList';
import { IndexingSummaryCard } from './IndexingSummaryCard';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import '../styles/conocimiento.animations.css';

interface KnowledgeUploaderProps {
  summary: ResumenBaseConocimiento;
  visualMode: KnowledgeVisualMode;
  clientError: string | null;
  onSwitchMode: (mode: KnowledgeVisualMode) => void;
  onFileSelect: (file: File) => void;
}

export const KnowledgeUploader: React.FC<KnowledgeUploaderProps> = ({
  summary,
  visualMode,
  clientError,
  onSwitchMode,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div data-tour="knowledge-uploader" className="space-y-6 pb-8 border-b border-slate-200/80">
      {/* Header directly on canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`${TYPOGRAPHY.title} text-lg`}>
            Carga de Datos Maestros de la Organización
          </h2>
          <p className={`${TYPOGRAPHY.body} mt-0.5`}>
            Actualice contratos de experiencia, hojas de vida e indicadores financieros
          </p>
        </div>
      </div>

      {/* Mandatory Warning Banner */}
      <ReplaceWarningBanner />

      {clientError && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          {clientError}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.zip"
        onChange={handleFileChange}
        data-testid="knowledge-file-input"
        className="hidden"
      />

      {/* Two-Column Open Layout: Left Dropzone / Status | Right Validation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          {visualMode === 'rejected_422' && summary.errores_validacion ? (
            <ValidationErrorsList
              archivoNombre="contratos.json"
              errors={summary.errores_validacion}
              onRetry={() => onSwitchMode('default_verified')}
            />
          ) : visualMode === 'completed_success' ? (
            <div
              data-testid="knowledge-completed-card"
              className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 text-xs font-medium">
                    Carga completada
                  </span>
                  <span className="text-xs text-slate-700 font-medium">
                    {summary.archivo_nombre}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reemplazar archivo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-emerald-200/60">
                <div>
                  <p className={`${TYPOGRAPHY.title} text-xl`}>{summary.contratos_indexados}</p>
                  <p className={TYPOGRAPHY.label}>Contratos</p>
                </div>
                <div>
                  <p className={`${TYPOGRAPHY.title} text-xl`}>{summary.perfiles_acreditados}</p>
                  <p className={TYPOGRAPHY.label}>Hojas de Vida</p>
                </div>
                <div>
                  <p className={`${TYPOGRAPHY.title} text-xl`}>{summary.certificaciones_iso}</p>
                  <p className={TYPOGRAPHY.label}>Certificaciones ISO</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800">
                <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Información actualizada correctamente para la organización.</span>
              </div>
            </div>
          ) : visualMode === 'indexing_live' ? (
            <div className="rounded-2xl bg-white/80 border border-slate-200 p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">
                    Revisando formato del archivo... (45%)
                  </span>
                  <span className={TYPOGRAPHY.label}>1/2</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary w-[45%] rounded-full transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">
                    Organizando documentos para búsqueda (12/28)...
                  </span>
                  <span className={TYPOGRAPHY.label}>2/2</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[43%] rounded-full transition-all" />
                </div>
              </div>

              <p className={TYPOGRAPHY.label}>
                Procesando archivo · por favor espere
              </p>
            </div>
          ) : visualMode === 'empty_initial' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <FiDatabase className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className={`${TYPOGRAPHY.title} text-sm`}>Aún no hay datos maestros cargados</p>
                <p className={`${TYPOGRAPHY.body} max-w-md`}>
                  Suba los contratos, hojas de vida e indicadores financieros para evaluar pliegos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
              >
                Subir archivo de capacidades inicial
              </button>
              <p className={TYPOGRAPHY.label}>Formatos admitidos: .JSON o .ZIP · Máx 50MB</p>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="rounded-2xl border border-dashed border-slate-300 bg-white/60 hover:bg-white p-8 text-center flex flex-col items-center justify-center space-y-3 transition-colors"
            >
              <FiUpload className="w-6 h-6 text-slate-600" />
              <div className="space-y-1">
                <p className={`${TYPOGRAPHY.title} text-sm`}>
                  Arrastre aquí el archivo .JSON o .ZIP
                </p>
                <p className={TYPOGRAPHY.body}>
                  Paquetes con registros de la empresa y soportes PDF de origen
                </p>
                <p className={TYPOGRAPHY.label}>
                  Tamaño máximo permitido: 50 MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
              >
                Seleccionar archivo
              </button>
            </div>
          )}
        </div>

        {/* Right: Validation Summary Table directly on canvas */}
        <div className="lg:col-span-5">
          <IndexingSummaryCard summary={summary} />
        </div>
      </div>
    </div>
  );
};

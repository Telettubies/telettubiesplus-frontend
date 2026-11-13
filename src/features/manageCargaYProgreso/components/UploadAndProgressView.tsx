import { services } from '@/features/connected/services';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { notifyError } from '@/features/connected/adapters';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud } from 'react-icons/fi';
import { usePdfUpload } from '../hooks/usePdfUpload';
import { useAnalysisPolling } from '../hooks/useAnalysisPolling';
import { PdfDropzone } from './PdfDropzone';
import { PipelineStepper } from './PipelineStepper';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';

interface UploadAndProgressViewProps {
  licitacionId?: string;
  initialMode?: 'upload_idle' | 'live_polling' | 'completed';
  onNavigateMatrix?: (licitacionId: string) => void;
}

export const UploadAndProgressView: React.FC<UploadAndProgressViewProps> = ({
  licitacionId = 'LP-MIN-001-2026',
  initialMode = 'upload_idle',
  onNavigateMatrix,
}) => {
  const navigate = useNavigate();
  const handleNavigateMatrix =
    onNavigateMatrix ?? ((targetId: string) => navigate(`/licitaciones/${targetId}`));
  const {
    maxPdfMb,maxPdfPages,
    selectedFileMeta,
    validationError,
    useCache,
    setUseCache,
    duplicateNotice,
    handleSelectFile,
    submitUpload,
  } = usePdfUpload();

  const [activeId,setActiveId]=useState(licitacionId);
  const { progress, startPolling } = useAnalysisPolling({
    licitacionId:activeId,
    onComplete:()=>{if(!shouldUseMock())handleNavigateMatrix(activeId);},
    enabled: initialMode === 'live_polling',
  });

  const [showEmptySelectionHint, setShowEmptySelectionHint] = useState(false);

  const handleStartClick = async () => {
    if (!selectedFileMeta) {
      setShowEmptySelectionHint(true);
      return;
    }
    setShowEmptySelectionHint(false);
    try{await submitUpload((createdId,cached) => {
      setActiveId(createdId);
      if(!shouldUseMock()){navigate(`/licitaciones/${createdId}/progreso`,{state:{duplicada:cached}});return;}
      startPolling();
    });}catch(e){notifyError(e);}
  };

  return (
    <div className="space-y-8">
      {/* Encabezado Principal de Página */}
      <div className="pb-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <FiUploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                Carga y Extracción de Pliegos Oficiales
              </h1>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Suba el documento PDF de SECOP para iniciar el análisis automático y la matriz de cumplimiento.
              </p>
            </div>
          </div>
        </div>
      </div>

      {duplicateNotice && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-3"
        >
          <span>{duplicateNotice}</span>
          <button
            type="button"
            onClick={() => handleNavigateMatrix(activeId)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-medium cursor-pointer"
          >
            Ver Matriz Existente →
          </button>
        </div>
      )}

      {/* 2-Column Open Split Layout directly on canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:divide-x lg:divide-slate-200/80 items-start">
        <div className="lg:col-span-5 lg:pr-4">
          <PdfDropzone
            maxPdfMb={maxPdfMb} maxPdfPages={maxPdfPages}
            selectedFileMeta={selectedFileMeta}
            validationError={validationError}
            useCache={useCache}
            onToggleCache={setUseCache}
            onSelectFile={handleSelectFile}
            onStartAnalysis={handleStartClick}
            pipelineStatus={progress.estado}
            showEmptySelectionHint={showEmptySelectionHint}
          />
        </div>
        <div className="lg:col-span-7 lg:pl-8">
          <PipelineStepper
            progress={progress}
            onOpenMatrix={() => handleNavigateMatrix(activeId)}
            onRetryFromCheckpoint={() => {if(shouldUseMock()){startPolling();return;}void services.retry(activeId).then(()=>startPolling()).catch(notifyError);}}
          />
        </div>
      </div>
    </div>
  );
};

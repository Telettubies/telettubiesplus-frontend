import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiBarChart2,
  FiCheckSquare,
  FiMessageSquare,
  FiFolder,
  FiFileText,
} from 'react-icons/fi';
import type { ItemVerificable } from '@/api/types';
import { useTenderMatrix } from '../hooks/useTenderMatrix';
import { TenderOverviewCharts } from './TenderOverviewCharts';
import { MatrixAndGapsContainer } from './MatrixAndGapsContainer';
import { ExportExcelButton } from './ExportExcelButton';
import { PdfViewerContainer } from '@/features/manageVisorPliego/components/PdfViewerContainer';
import { ReviewInboxDrawer } from '@/features/manageRevisionHumana/components/ReviewInboxDrawer';
import { TenderChatPanel } from '@/features/manageChatYObservaciones/components/TenderChatPanel';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { SkeletonLoader } from '@/shared/components/feedback/SkeletonLoader';
import { ROUTE_PATHS } from '@/routes/routePaths';
import { shouldUseMock } from '@/shared/utils/mockSwitch';

export type AnalysisViewTab = 'estadisticas' | 'pliego' | 'revision' | 'chat';

export type MatrixPageScenario =
  | 'page_32_default'
  | 'page_33_empty_filter'
  | 'page_34_req17_resolved'
  | 'page_35_s3_expired'
  | 'page_36_unverified_quote'
  | 'page_37_skeleton';

export const TenderAnalysisWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: AnalysisViewTab =
    tabParam === 'pliego'
      ? 'pliego'
      : tabParam === 'revision'
        ? 'revision'
        : tabParam === 'chat'
          ? 'chat'
          : 'estadisticas';

  const { resultado, selectedItem, setSelectedItem, isLoading, error, reloadResult } = useTenderMatrix();

  const [matrixScenario, setMatrixScenario] = useState<MatrixPageScenario>('page_32_default');
  const [pdfJumpPage, setPdfJumpPage] = useState<number>();
  const pdfSectionRef = useRef<HTMLDivElement | null>(null);
  const tableSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (matrixScenario === 'page_34_req17_resolved') {
      const req17 = resultado.items.find((i) => i.codigo_req === 'REQ-017');
      if (req17) setSelectedItem(req17);
    }
    // Por defecto el mock no preselecciona ningún requisito para mantener la vista limpia
  }, [matrixScenario, resultado.items, setSelectedItem]);

  const switchTab = (next: AnalysisViewTab) => {
    if (next === 'estadisticas') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: next });
    }
  };

  const handleViewItemInPdf = (item: ItemVerificable) => {
    setSelectedItem(item);
    switchTab('pliego');
  };

  const handleScrollToTableRow = (item: ItemVerificable) => {
    setSelectedItem(item);
    switchTab('estadisticas');
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const rowEl = document.getElementById(`matrix-row-anchor-${item.codigo_req}`);
        if (rowEl && typeof rowEl.scrollIntoView === 'function') {
          rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
      if (tableSectionRef.current && typeof tableSectionRef.current.scrollIntoView === 'function') {
        tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const displayedResultado =
    matrixScenario === 'page_34_req17_resolved'
      ? {
          ...resultado,
          justificacion:
            'Cumple con experiencia, personal clave y plazos técnicos; persiste brecha financiera subsanable en liquidez (Numeral 4.2).',
          resumen_estados: {
            cumple: 115,
            cumple_parcialmente: 16,
            no_cumple: 8,
            revision: 3,
          },
        }
      : resultado;

  const navigate = useNavigate();
  const isMockEnabled = shouldUseMock('VITE_MOCK_PANEL');

  if(!isMockEnabled&&isLoading&&!resultado.items.length)return <SkeletonLoader variant="dashboard"/>;
  if(!isMockEnabled&&error)return <div role="alert" className="p-5 rounded-xl border border-red-200 bg-red-50 text-sm text-red-800">{error}<button onClick={reloadResult} className="ml-3 underline">Reintentar</button><button onClick={()=>navigate(`/licitaciones/${id}/progreso`)} className="ml-3 underline">Ver progreso</button></div>;

  return (
    <div className="space-y-6">
      {/* Sub-Header Bar directly on canvas */}
      <div className="pb-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="typo-title text-lg">
            {id || resultado.codigo_proceso}
          </h1>
          <p className="typo-label mt-0.5">
            {isMockEnabled?'Constructora Andina S.A.S.':resultado.nombre} • {resultado.entidad}
          </p>
        </div>

        {/* Sub-Navigation Pills */}
        <div
          data-tour="subnav-tabs"
          className="inline-flex flex-wrap rounded-xl border border-slate-200/80 bg-white/80 p-1 text-xs"
        >
          <button
            type="button"
            data-tour="tab-graficas"
            onClick={() => switchTab('estadisticas')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'estadisticas'
                ? 'bg-brand-primary text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiBarChart2 className="w-3.5 h-3.5" />
            <span>Estados y Gráficas</span>
          </button>
          <button
            type="button"
            data-tour="tab-matriz"
            data-tour-pliego="true"
            onClick={() => switchTab('pliego')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'pliego'
                ? 'bg-brand-primary text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiFileText className="w-3.5 h-3.5" />
            <span>Visor del Pliego</span>
          </button>
          <button
            type="button"
            data-tour="tab-revision"
            onClick={() => switchTab('revision')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'revision'
                ? 'bg-brand-primary text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiCheckSquare className="w-3.5 h-3.5" />
            <span>Revisión Humana ({displayedResultado.resumen_estados.revision})</span>
          </button>
          <button
            type="button"
            data-tour="tab-chat"
            onClick={() => switchTab('chat')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-brand-primary text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiMessageSquare className="w-3.5 h-3.5" />
            <span>Asistente Legal</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Estados y Gráficas + Matriz Completa de Requisitos (Primera opción) */}
      {activeTab === 'estadisticas' && (
        <div key="tab-estadisticas" className="space-y-6 soft-page-enter soft-stagger">
          <div className="flex justify-end -mt-2">
            <ExportExcelButton
              codigoProceso={id || resultado.codigo_proceso}
              items={displayedResultado.items}
              pendingReviewCount={displayedResultado.resumen_estados.revision}
            />
          </div>
          <ErrorBoundary fallbackTitle="Error en Estados y Gráficas">
            <TenderOverviewCharts
              resultado={displayedResultado}
              onOpenReviewInbox={() => switchTab('revision')}
              onGoToMatrix={() => {
                if (tableSectionRef.current && typeof tableSectionRef.current.scrollIntoView === 'function') {
                  tableSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          </ErrorBoundary>

          {/* Tabla de la Matriz ubicada en esta subsección */}
          <div ref={tableSectionRef} className="scroll-mt-6 pt-2 space-y-3">
            <div className="px-1">
              <h3 className="text-sm font-semibold text-slate-800">
                Matriz Completa de Requisitos y Cobertura
              </h3>
              <p className="text-xs text-slate-500">
                Detalle de ítems evaluados, evidencias registradas y estado de cumplimiento.
              </p>
            </div>

            <ErrorBoundary fallbackTitle="Error en la Matriz de Cobertura">
              {matrixScenario === 'page_37_skeleton' ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
                  <SkeletonLoader variant="table" rows={8} />
                </div>
              ) : matrixScenario === 'page_33_empty_filter' ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-card min-h-[340px] flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold text-slate-700">
                    No se encontraron requisitos bajo este filtro.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMatrixScenario('page_32_default')}
                    className="mt-3 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Restablecer filtros de tabla
                  </button>
                </div>
              ) : (
                <MatrixAndGapsContainer
                  items={displayedResultado.items}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                  onScrollToPdf={handleViewItemInPdf}
                  forceAllReqs17And22InReview={isMockEnabled && matrixScenario !== 'page_34_req17_resolved'}
                  onOpenReviewForItem={() => switchTab('revision')}
                  onOpenObservationForItem={handleViewItemInPdf}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* TAB 2: Únicamente el Pliego de Condiciones — Vista Larga con las mismas opciones */}
      {activeTab === 'pliego' && (
        <div key="tab-pliego" ref={pdfSectionRef} className="space-y-4 soft-page-enter soft-stagger">
          <ErrorBoundary fallbackTitle="Error en el Visor PDF">
            <PdfViewerContainer
              pdfUrl={resultado.pdf_url_temporal}
              pdfName={resultado.pdf_nombre}
              jumpPage={pdfJumpPage}
              activeItem={selectedItem}
              allItems={displayedResultado.items}
              processId={id || resultado.codigo_proceso || 'LP-MIN-001-2026'}
              onSelectItemFromPdf={setSelectedItem}
              onScrollToTableRow={handleScrollToTableRow}
              expiredUrlState={matrixScenario === 'page_35_s3_expired'}
              unverifiedQuoteState={matrixScenario === 'page_36_unverified_quote'}
              manualResolvedState={matrixScenario === 'page_34_req17_resolved'}
              skeletonLoading={matrixScenario === 'page_37_skeleton'}
              onRegenerateSession={() => setMatrixScenario('page_32_default')}
              className="min-h-[800px] h-[840px] lg:h-[calc(100vh-185px)]"
            />
          </ErrorBoundary>
        </div>
      )}

      {/* TAB 3: Bandeja de Revisión Humana */}
      {activeTab === 'revision' && (
        <div key="tab-revision" className="space-y-5 soft-page-enter soft-stagger">
          <ErrorBoundary fallbackTitle="Error en la Bandeja de Revisión Humana">
            <ReviewInboxDrawer
              licitacionId={id || resultado.codigo_proceso}
              onOpenPdfPage={(page, reqCode) => {
                const matched = displayedResultado.items.find((i) => i.codigo_req === reqCode);
                if (matched) setSelectedItem(matched);
                switchTab('pliego');
              }}
              onGoToMatrix={() => switchTab('estadisticas')}
              onGoToObservationGenerator={(reqCode) => {
                const matched = displayedResultado.items.find((i) => i.codigo_req === reqCode);
                if (matched) setSelectedItem(matched);
                switchTab('pliego');
              }}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* TAB 4: Asistente Legal (Chat contextual del pliego - Vista Amplia) */}
      {activeTab === 'chat' && (
        <div key="tab-chat" className="space-y-5 soft-page-enter soft-stagger">
          <ErrorBoundary fallbackTitle="Error en el Asistente Legal">
            <TenderChatPanel
              licitacionId={id || resultado.codigo_proceso}
              onJumpToPdfPage={(page, label) => {
                setPdfJumpPage(page);
                const numeral = label.replace(/^Numeral\s+/i, '');
                setSelectedItem(displayedResultado.items.find(item => item.numeral === numeral) || null);
                switchTab('pliego');
              }}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};

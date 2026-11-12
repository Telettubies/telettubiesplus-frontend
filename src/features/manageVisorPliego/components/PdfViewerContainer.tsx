import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ArrowDown,
  FileText,
  Copy,
  Check,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  SlidersHorizontal,
  Search,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ExternalLink,
  Maximize2,
} from 'lucide-react';
import type { ItemVerificable } from '@/api/types';
import { MOCK_PLIEGO_PAGES_CONTENT, type PageContentMock } from '../mockups/ubicacionesPdf.mock';
import { usePdfJumpAndHighlight } from '../hooks/usePdfJumpAndHighlight';
import { ViewerToolbar } from './ViewerToolbar';
import { PrecisionAlertBadge } from './PrecisionAlertBadge';
import { AssignedEvidenceSidebar } from './AssignedEvidenceSidebar';
import { ComplianceBadge } from '@/shared/components/badges/ComplianceBadge';
import { SkeletonLoader } from '@/shared/components/feedback/SkeletonLoader';
import '../styles/pdfHighlight.css';

export interface PdfViewerContainerProps {
  activeItem: ItemVerificable | null;
  allItems?: ItemVerificable[];
  onSelectItemFromPdf?: (item: ItemVerificable) => void;
  onScrollToTableRow?: (item: ItemVerificable) => void;
  expiredUrlState?: boolean;
  unverifiedQuoteState?: boolean;
  manualResolvedState?: boolean;
  skeletonLoading?: boolean;
  onRegenerateSession?: () => void;
  processId?: string;
  isPreview?: boolean;
  className?: string;
}

type QuickFilterState = 'todos' | 'cumple' | 'brechas' | 'revision';

function getConciseReason(item: ItemVerificable): string {
  if (item.estado === 'cumple') {
    if (item.faltante) return item.faltante;
    if (item.evidencia?.cita_literal) {
      const cite = item.evidencia.cita_literal.replace(/[“”"]/g, '').trim();
      return `Acreditado con ${item.evidencia.fuente_nombre}: "${cite.slice(0, 115)}${cite.length > 115 ? '...' : ''}"`;
    }
    return `Cumple satisfactoriamente con la totalidad de exigencias del numeral ${item.numeral}.`;
  }
  if (item.estado === 'cumple_parcialmente') {
    return item.faltante || `Cumple parcialmente: presenta faltante subsanable en el numeral ${item.numeral}.`;
  }
  if (item.estado === 'no_cumple') {
    return item.faltante || `No cumple: se identificó brecha de cumplimiento en el numeral ${item.numeral}.`;
  }
  return (
    item.faltante ||
    item.motivo_revision ||
    `En revisión técnica: requiere confirmación o criterio manual de interpretación.`
  );
}

export const PdfViewerContainer: React.FC<PdfViewerContainerProps> = ({
  activeItem,
  allItems = [],
  onSelectItemFromPdf,
  onScrollToTableRow,
  expiredUrlState = false,
  unverifiedQuoteState = false,
  manualResolvedState = false,
  skeletonLoading = false,
  onRegenerateSession,
  processId = 'LP-MIN-001-2026',
  isPreview = true,
  className,
}) => {
  const {
    currentPage,
    setCurrentPage,
    zoomPercent,
    zoomIn,
    zoomOut,
    searchInPdf,
    setSearchInPdf,
    activeUbicacion,
  } = usePdfJumpAndHighlight(activeItem, 74);

  // Control para abrir y cerrar la descripción/diagnóstico del requisito en el PDF
  const [isClauseDiagnosisOpen, setIsClauseDiagnosisOpen] = useState(true);

  // Control para abrir y cerrar la tabla de accesos rápidos a la izquierda
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(true);

  // Espacio informativo colapsable a la derecha (detalles completos y redactor de observaciones)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [observationNote, setObservationNote] = useState<string>('');
  const [copiedObservation, setCopiedObservation] = useState(false);

  // Filtro y búsqueda de la tabla de accesos rápidos lateral
  const [quickFilter, setQuickFilter] = useState<QuickFilterState>('todos');
  const [quickSearch, setQuickSearch] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const indexListRef = useRef<HTMLDivElement | null>(null);

  const activeReqCode = manualResolvedState
    ? 'REQ-017'
    : (activeItem?.codigo_req ?? activeItem?.codigo ?? null);

  // Sincronizar el scroll del índice izquierdo y del lienzo del PDF cuando cambia activeItem
  useEffect(() => {
    if (!activeItem) return;

    // 1. Hacer scroll suave en la lista del índice hacia el requisito activo
    const navItemEl = document.getElementById(`quick-nav-item-${activeItem.codigo_req}`);
    if (navItemEl && indexListRef.current) {
      const containerTop = indexListRef.current.getBoundingClientRect().top;
      const itemTop = navItemEl.getBoundingClientRect().top;
      const targetScroll = indexListRef.current.scrollTop + (itemTop - containerTop) - 60;
      indexListRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }

    // 2. Hacer scroll en el lienzo del PDF hacia el párrafo o página seleccionada sin mover la ventana exterior
    if (scrollContainerRef.current) {
      const clauseEl = document.getElementById(`pdf-clause-${activeItem.codigo_req}`);
      if (clauseEl) {
        const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
        const itemTop = clauseEl.getBoundingClientRect().top;
        const targetScroll = scrollContainerRef.current.scrollTop + (itemTop - containerTop) - 30;
        scrollContainerRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
      } else if (activeItem.ubicacion?.pagina) {
        const pageEl = document.getElementById(`pdf-page-${activeItem.ubicacion.pagina}`);
        if (pageEl) {
          const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
          const pageTop = pageEl.getBoundingClientRect().top;
          const targetScroll = scrollContainerRef.current.scrollTop + (pageTop - containerTop) - 20;
          scrollContainerRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
        }
      }
    }
  }, [activeItem?.codigo_req, activeItem?.id, activeItem?.ubicacion?.pagina]);

  // Páginas del pliego en orden correlativo para scroll continuo
  const sortedPages: PageContentMock[] = React.useMemo(() => {
    return Object.values(MOCK_PLIEGO_PAGES_CONTENT).sort((a, b) => a.pagina - b.pagina);
  }, []);

  // Sincronizar número de página visible al hacer scroll continuo por el documento
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const pageElements = container.querySelectorAll<HTMLElement>('[data-pdf-page]');
      const containerTop = container.scrollTop;
      const containerCenter = containerTop + container.clientHeight / 3;

      for (let i = pageElements.length - 1; i >= 0; i--) {
        const el = pageElements[i];
        if (el.offsetTop <= containerCenter) {
          const pageNum = Number(el.getAttribute('data-pdf-page'));
          if (pageNum && pageNum !== currentPage) {
            setCurrentPage(pageNum);
          }
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPage, setCurrentPage]);

  // Selección de cláusula al hacer clic en el PDF
  const handleSelectClause = (numeral: string, reqCode?: string, fallbackText?: string) => {
    let matched = allItems.find(
      (item) => (reqCode && item.codigo_req === reqCode) || item.numeral === numeral
    );

    if (!matched && activeItem) {
      matched = {
        ...activeItem,
        numeral,
        codigo_req: reqCode || `REQ-${numeral.replace(/\./g, '')}`,
        descripcion_item: fallbackText ? fallbackText.slice(0, 95) + '...' : activeItem.descripcion_item,
        texto_requisito_literal: fallbackText || activeItem.texto_requisito_literal,
      };
    }

    if (matched && onSelectItemFromPdf) {
      onSelectItemFromPdf(matched);
      setIsClauseDiagnosisOpen(true);
    }
  };

  // Salto directo y scroll suave desde la tabla de accesos rápidos izquierda hacia el PDF
  const handleJumpToRequirement = (item: ItemVerificable) => {
    if (onSelectItemFromPdf) {
      onSelectItemFromPdf(item);
    }
    setIsClauseDiagnosisOpen(true);

    if (scrollContainerRef.current) {
      const clauseEl = document.getElementById(`pdf-clause-${item.codigo_req}`);
      if (clauseEl) {
        const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
        const itemTop = clauseEl.getBoundingClientRect().top;
        const targetScroll = scrollContainerRef.current.scrollTop + (itemTop - containerTop) - 30;
        scrollContainerRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
        return;
      }

      const pageEl = document.getElementById(`pdf-page-${item.ubicacion.pagina}`);
      if (pageEl) {
        const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
        const pageTop = pageEl.getBoundingClientRect().top;
        const targetScroll = scrollContainerRef.current.scrollTop + (pageTop - containerTop) - 20;
        scrollContainerRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    }
  };

  // Filtrado de la tabla izquierda de accesos rápidos
  const filteredQuickItems = React.useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        quickSearch.trim() === '' ||
        item.codigo_req.toLowerCase().includes(quickSearch.toLowerCase()) ||
        item.numeral.toLowerCase().includes(quickSearch.toLowerCase()) ||
        item.descripcion_item.toLowerCase().includes(quickSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (quickFilter === 'cumple') return item.estado === 'cumple';
      if (quickFilter === 'brechas') {
        return item.estado === 'cumple_parcialmente' || item.estado === 'no_cumple';
      }
      if (quickFilter === 'revision') return item.estado === 'revision';
      return true;
    });
  }, [allItems, quickFilter, quickSearch]);

  // Contadores para las pestañas de filtro de la tabla
  const counts = React.useMemo(() => {
    return {
      todos: allItems.length,
      cumple: allItems.filter((i) => i.estado === 'cumple').length,
      brechas: allItems.filter((i) => i.estado === 'cumple_parcialmente' || i.estado === 'no_cumple').length,
      revision: allItems.filter((i) => i.estado === 'revision').length,
    };
  }, [allItems]);

  // Borrador de observación
  const defaultObservationText = activeItem
    ? `Observación al Numeral ${activeItem.numeral} (${activeItem.codigo_req}): Solicitamos a la Entidad admitir la acreditación de "${activeItem.descripcion_item}" conforme a los soportes aportados.`
    : '';

  const currentObservation = observationNote || defaultObservationText;

  const handleCopyObs = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentObservation);
      }
    } catch {
      // ignore
    }
    setCopiedObservation(true);
    setTimeout(() => setCopiedObservation(false), 2000);
  };

  return (
    <div
      id="tour-step-pdf-viewer"
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card flex flex-col font-sans ${
        className || 'min-h-[780px] h-[820px] lg:h-[calc(100vh-190px)]'
      }`}
    >
      {/* 1. Barra de Herramientas Superior del Visor */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-white px-3 py-2 gap-2 font-sans shrink-0">
        <div className="flex items-center gap-2">
          {/* Botón para alternar visibilidad de la tabla izquierda de accesos rápidos */}
          <button
            type="button"
            onClick={() => setIsQuickNavOpen((prev) => !prev)}
            title={isQuickNavOpen ? 'Ocultar índice de requisitos' : 'Mostrar índice de requisitos'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {isQuickNavOpen ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Ocultar índice</span>
              </>
            ) : (
              <>
                <PanelLeft className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Ver índice</span>
              </>
            )}
          </button>
        </div>

        {/* Toolbar nativo con paginación y zoom */}
        <div className="flex-1 max-w-xl">
          <ViewerToolbar
            fileName="Pliego_Condiciones_v1.pdf"
            currentPage={currentPage}
            totalPages={74}
            zoomPercent={zoomPercent}
            searchQuery={searchInPdf}
            onPageChange={(page) => {
              setCurrentPage(page);
              if (scrollContainerRef.current) {
                const pageEl = document.getElementById(`pdf-page-${page}`);
                if (pageEl) {
                  const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
                  const pageTop = pageEl.getBoundingClientRect().top;
                  const targetScroll = scrollContainerRef.current.scrollTop + (pageTop - containerTop) - 20;
                  scrollContainerRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
                }
              }
            }}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onSearchChange={setSearchInPdf}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Botón claro y simple: Pantalla Completa en una nueva pestaña (blank) */}
          <a
            href={`/licitaciones/${processId}/visor-enfocado`}
            target="_blank"
            rel="noopener noreferrer"
            data-tour="btn-visor-enfocado"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary text-xs font-semibold transition-colors cursor-pointer shrink-0"
            title="Abrir el pliego a pantalla completa en una nueva pestaña"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Pantalla Completa</span>
          </a>

          {/* Botón para abrir/cerrar el panel de detalle lateral */}
          <button
            type="button"
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              isDetailsOpen
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isDetailsOpen ? 'Ocultar panel lateral' : 'Abrir detalle y observaciones'}</span>
          </button>
        </div>
      </div>

      {/* 2. Cuerpo Principal: Tabla Izquierda + Visor PDF con Scroll Continuo + Panel Lateral Opcional */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden font-sans">
        {/* TABLA DE ACCESOS RÁPIDOS AL LADO IZQUIERDO DEL PDF */}
        {isQuickNavOpen && (
          <aside
            aria-label="Índice de requisitos y accesos rápidos"
            className="w-72 sm:w-80 border-r border-slate-200/80 bg-white flex flex-col shrink-0 h-full max-h-full overflow-hidden font-sans select-none"
          >
            {/* Header de la Tabla Izquierda */}
            <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50/50 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 tracking-tight">
                  Índice de Requisitos
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {counts.todos} ítems
                </span>
              </div>

              {/* Buscador minimalista */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Buscar numeral o código..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none"
                />
              </div>

              {/* Filtros minimalistas limpios sin saturación de colores */}
              <div className="grid grid-cols-4 gap-1 text-[11px] pt-0.5">
                <button
                  type="button"
                  onClick={() => setQuickFilter('todos')}
                  className={`py-1 rounded-md font-medium transition-colors cursor-pointer text-center ${
                    quickFilter === 'todos'
                      ? 'bg-slate-900 dark:bg-[#0D7A4D] text-white'
                      : 'bg-white dark:bg-[#1C1C1C] text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#232323] border border-slate-200/60 dark:border-[#2E2E2E]'
                  }`}
                >
                  Todos ({counts.todos})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('cumple')}
                  className={`py-1 rounded-md font-medium transition-colors cursor-pointer text-center ${
                    quickFilter === 'cumple'
                      ? 'bg-slate-900 dark:bg-[#0D7A4D] text-white'
                      : 'bg-white dark:bg-[#1C1C1C] text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#232323] border border-slate-200/60 dark:border-[#2E2E2E]'
                  }`}
                >
                  Cumple ({counts.cumple})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('brechas')}
                  className={`py-1 rounded-md font-medium transition-colors cursor-pointer text-center ${
                    quickFilter === 'brechas'
                      ? 'bg-slate-900 dark:bg-[#0D7A4D] text-white'
                      : 'bg-white dark:bg-[#1C1C1C] text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#232323] border border-slate-200/60 dark:border-[#2E2E2E]'
                  }`}
                >
                  Brechas ({counts.brechas})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('revision')}
                  className={`py-1 rounded-md font-medium transition-colors cursor-pointer text-center ${
                    quickFilter === 'revision'
                      ? 'bg-slate-900 dark:bg-[#0D7A4D] text-white'
                      : 'bg-white dark:bg-[#1C1C1C] text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#232323] border border-slate-200/60 dark:border-[#2E2E2E]'
                  }`}
                >
                  Revisión ({counts.revision})
                </button>
              </div>
            </div>

            {/* Listado / Tabla Minimalista de Requisitos */}
            <div
              ref={indexListRef}
              className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 text-xs scroll-smooth"
            >
              {filteredQuickItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  No hay requisitos que coincidan con el filtro.
                </div>
              ) : (
                filteredQuickItems.map((item) => {
                  const isSelected = item.codigo_req === activeReqCode;

                  // Puntos de estado discretos sin colores estridentes en la tipografía
                  const dotColor =
                    item.estado === 'cumple'
                      ? 'bg-emerald-500'
                      : item.estado === 'cumple_parcialmente'
                        ? 'bg-amber-500'
                        : item.estado === 'no_cumple'
                          ? 'bg-red-500'
                          : 'bg-blue-500';

                  const statusLabel =
                    item.estado === 'cumple'
                      ? 'Cumple'
                      : item.estado === 'cumple_parcialmente'
                        ? 'Parcial'
                        : item.estado === 'no_cumple'
                          ? 'No cumple'
                          : 'Revisión';

                  return (
                    <div
                      key={item.id}
                      id={`quick-nav-item-${item.codigo_req}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleJumpToRequirement(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleJumpToRequirement(item);
                        }
                      }}
                      className={`p-2.5 transition-colors cursor-pointer font-sans ${
                        isSelected
                          ? 'bg-slate-100 border-l-2 border-brand-primary'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                          <span className="font-semibold text-slate-900 text-xs">
                            {item.codigo_req}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Numeral {item.numeral}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed pl-4">
                        {item.descripcion_item}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* CENTRO: LIENZO DEL PDF CON SCROLL CONTINUO Y DESCRIPCIONES COLAPSABLES */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 h-full overflow-y-auto bg-[#E2E8F0]/70 dark:bg-[#121212] p-4 sm:p-6 space-y-8 scroll-smooth font-sans"
        >
          {skeletonLoading ? (
            <div className="mx-auto max-w-[620px] rounded bg-white p-8 shadow-sm">
              <SkeletonLoader lines={9} />
            </div>
          ) : expiredUrlState ? (
            <div className="flex min-h-[360px] items-center justify-center font-sans">
              <div className="max-w-[390px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <Clock className="mb-3 h-5 w-5 text-slate-600" />
                <h4 className="mb-1.5 text-[14px] font-semibold leading-snug text-slate-900">
                  La sesión de visualización del documento ha expirado.
                </h4>
                <p className="mb-4 text-[12px] text-slate-500">
                  La matriz y sus filtros conservan su estado actual.
                </p>
                <button
                  type="button"
                  onClick={onRegenerateSession}
                  className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover transition-colors cursor-pointer"
                >
                  Recargar documento
                </button>
              </div>
            </div>
          ) : (
            sortedPages.map((pageData) => (
              <div
                key={pageData.pagina}
                id={`pdf-page-${pageData.pagina}`}
                data-pdf-page={pageData.pagina}
                style={{ transform: `scale(${zoomPercent / 100})`, transformOrigin: 'top center' }}
                className="relative mx-auto max-w-[680px] rounded-lg bg-white dark:bg-[#1A1A1A] px-8 py-7 shadow-sm transition-transform border border-slate-200/60 dark:border-[#2E2E2E] font-sans"
              >
                {/* Header de la Hoja del Documento */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 font-sans">
                  <span className="text-[10.5px] font-medium tracking-wide text-slate-400">
                    {pageData.header}
                  </span>
                  {activeUbicacion.precision !== 'exacta' &&
                    pageData.pagina === activeItem?.ubicacion?.pagina && (
                      <PrecisionAlertBadge precision={activeUbicacion.precision} />
                    )}
                </div>

                <h4 className="mb-2.5 text-[13px] font-semibold uppercase tracking-tight text-slate-900 font-sans">
                  {pageData.sectionTitle}
                </h4>

                <p className="mb-4 text-[12.5px] leading-relaxed text-slate-700 font-sans">
                  {pageData.introParagraph}
                </p>

                {/* Párrafos y Cláusulas del PDF */}
                <div className="space-y-3.5 font-sans">
                  {pageData.clauses.map((clause) => {
                    const isSelected =
                      clause.reqCode === activeReqCode ||
                      (activeItem?.numeral && clause.numeral === activeItem.numeral);

                    const matchedItem = allItems.find(
                      (item) =>
                        (clause.reqCode && item.codigo_req === clause.reqCode) ||
                        item.numeral === clause.numeral
                    );

                    const itemState = matchedItem?.estado || (isSelected ? activeItem?.estado : null);

                    if (isSelected) {
                      return (
                        <div
                          key={clause.numeral}
                          id={`pdf-clause-${clause.reqCode || clause.numeral}`}
                          data-testid="pdf-highlight-box"
                          className="rounded-xl border-2 border-amber-400 dark:border-[#3ECF8E] bg-amber-50/70 dark:bg-[#0D7A4D]/20 p-4 transition-all duration-200 shadow-xs space-y-3 font-sans"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 dark:border-[#3ECF8E]/30 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-amber-950 dark:text-[#3ECF8E] font-sans">
                                Numeral {clause.numeral}
                              </span>
                              {clause.reqCode && (
                                <span className="text-xs font-semibold text-amber-900 dark:text-emerald-300 font-sans">
                                  {clause.reqCode}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {itemState && <ComplianceBadge estado={itemState} />}

                              {/* BOTÓN PARA CERRAR/COLAPSAR LA DESCRIPCIÓN EN EL PDF */}
                              <button
                                type="button"
                                aria-label="Cerrar descripción y diagnóstico del requisito"
                                title="Cerrar descripción"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsClauseDiagnosisOpen((prev) => !prev);
                                }}
                                className="p-1 rounded-md text-amber-800 hover:bg-amber-200/60 transition-colors cursor-pointer"
                              >
                                {isClauseDiagnosisOpen ? (
                                  <X className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Texto de la cláusula en el pliego */}
                          <p className="text-[12.5px] leading-relaxed text-slate-900 font-sans">
                            {clause.text}
                          </p>

                          {/* INFORMACIÓN RESUMIDA Y CONCISA DIRECTAMENTE EN EL PDF (COLAPSABLE) */}
                          {isClauseDiagnosisOpen && matchedItem && (
                            <div className="rounded-lg bg-white/95 dark:bg-[#1C1C1C] border border-amber-200/90 dark:border-[#2E2E2E] p-3 space-y-2 font-sans soft-page-enter">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                  {matchedItem.estado === 'cumple' && (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span className="text-emerald-800">Cumple los términos</span>
                                    </>
                                  )}
                                  {matchedItem.estado === 'cumple_parcialmente' && (
                                    <>
                                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                      <span className="text-amber-800">Cumple parcialmente (Subsanable)</span>
                                    </>
                                  )}
                                  {matchedItem.estado === 'no_cumple' && (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                                      <span className="text-red-800">No cumple (Brecha identificada)</span>
                                    </>
                                  )}
                                  {matchedItem.estado === 'revision' && (
                                    <>
                                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                                      <span className="text-blue-800">En revisión humana</span>
                                    </>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setIsClauseDiagnosisOpen(false)}
                                  className="text-[11px] font-medium text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  Ocultar
                                </button>
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed font-normal font-sans">
                                <span className="font-medium text-slate-900">Diagnóstico: </span>
                                {getConciseReason(matchedItem)}
                              </p>

                              {/* Acciones directas integradas en el PDF */}
                              <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 font-sans">
                                <button
                                  type="button"
                                  onClick={() => setIsDetailsOpen(true)}
                                  className="inline-flex items-center gap-1 font-medium text-brand-primary hover:underline cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Ver evidencia y observación completa →</span>
                                </button>

                                {onScrollToTableRow && (
                                  <button
                                    type="button"
                                    onClick={() => onScrollToTableRow(matchedItem)}
                                    className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                                  >
                                    <span>Ver en tabla inferior</span>
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {!isClauseDiagnosisOpen && (
                            <button
                              type="button"
                              onClick={() => setIsClauseDiagnosisOpen(true)}
                              className="text-xs font-medium text-amber-800 hover:underline cursor-pointer inline-flex items-center gap-1 pt-1"
                            >
                              <span>Ver diagnóstico y resumen de cumplimiento ▾</span>
                            </button>
                          )}
                        </div>
                      );
                    }

                    // Párrafo no seleccionado (interactivo al clic para inspeccionar)
                    return (
                      <div
                        key={clause.numeral}
                        id={`pdf-clause-${clause.reqCode || clause.numeral}`}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          handleSelectClause(clause.numeral, clause.reqCode, clause.text)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectClause(clause.numeral, clause.reqCode, clause.text);
                          }
                        }}
                        title="Haga clic para ver si cumple y su diagnóstico en este párrafo"
                        className="group rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/90 p-3 transition-all duration-150 cursor-pointer font-sans"
                      >
                        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-600 font-sans">
                          <span className="font-medium">Numeral {clause.numeral}</span>
                          <div className="flex items-center gap-2">
                            {clause.reqCode && (
                              <span className="text-slate-500 font-semibold font-sans">
                                {clause.reqCode}
                              </span>
                            )}
                            {itemState && <ComplianceBadge estado={itemState} />}
                            <span className="text-[10.5px] text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              Clic para inspeccionar
                            </span>
                          </div>
                        </div>
                        <p className="text-[12.5px] leading-relaxed text-slate-800 font-sans">
                          {clause.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {pageData.footerSectionTitle && (
                  <>
                    <h4 className="mt-5 mb-2 text-[13px] font-semibold uppercase tracking-tight text-slate-900 font-sans">
                      {pageData.footerSectionTitle}
                    </h4>
                    <p className="text-[12.5px] leading-relaxed text-slate-700 font-sans">
                      {pageData.footerText}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* DERECHA: ESPACIO INFORMATIVO COLAPSABLE (DETALLES Y OBSERVACIONES) */}
        {isDetailsOpen && (
          <aside className="w-full lg:w-[420px] shrink-0 border-l border-slate-200/80 bg-white flex flex-col justify-between shadow-lg z-20 h-full max-h-full overflow-hidden soft-page-enter font-sans">
            {/* Header del Espacio Informativo */}
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between gap-2 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-semibold text-slate-900 font-sans">
                  Espacio Informativo ({activeReqCode})
                </h3>
              </div>
              <button
                type="button"
                aria-label="Cerrar panel informativo"
                title="Cerrar panel informativo"
                onClick={() => setIsDetailsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido Detallado: Evidencia y Observaciones */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 font-sans">
              {!activeItem ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 min-h-[260px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Ningún requisito seleccionado</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                      Haga clic en un requisito de la lista lateral o en una cláusula del documento para inspeccionar su trazabilidad y observaciones.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Resumen del Requisito */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 font-sans">
                        {activeReqCode || activeItem.codigo_req} · Numeral {activeItem.numeral || '3.2.1'}
                      </span>
                      <ComplianceBadge estado={activeItem.estado} />
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium font-sans">
                      {activeItem.descripcion_item}
                    </p>
                    {onScrollToTableRow && (
                      <button
                        type="button"
                        onClick={() => onScrollToTableRow(activeItem)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                        <span>Ver fila en la tabla inferior</span>
                      </button>
                    )}
                  </div>

                  {/* Evidencia Interna Contrastada */}
                  <div className="p-4">
                    <AssignedEvidenceSidebar
                      activeItem={activeItem}
                      unverifiedSimOverride={unverifiedQuoteState}
                      manualValidatedOverride={manualResolvedState}
                    />
                  </div>

                  {/* Redactor de Observaciones */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 font-sans">
                        Observación al Pliego
                      </h4>
                      <button
                        type="button"
                        onClick={handleCopyObs}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:text-brand-hover cursor-pointer"
                      >
                        {copiedObservation ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copiada</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar texto</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={currentObservation}
                      onChange={(e) => setObservationNote(e.target.value)}
                      placeholder="Redacte la observación para este numeral..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-800 leading-relaxed focus:bg-white focus:border-brand-primary focus:outline-none font-sans"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer con Botón para Ocultar */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/40 flex justify-end font-sans">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer font-sans"
              >
                Cerrar espacio informativo
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

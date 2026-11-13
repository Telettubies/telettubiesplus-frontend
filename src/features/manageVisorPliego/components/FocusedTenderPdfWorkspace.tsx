import { OriginalPdfCanvas } from './OriginalPdfCanvas';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { services } from '@/features/connected/services';
import { notifyError } from '@/features/connected/adapters';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PanelLeft,
  PanelLeftClose,
  SlidersHorizontal,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  Moon,
  Sun,
} from 'lucide-react';
import type { ItemVerificable, EstadoCumplimiento } from '@/api/types';
import { useTenderMatrix } from '@/features/manageDashboardMatriz/hooks/useTenderMatrix';
import { useTheme } from '@/shared/hooks/useTheme';
import { MOCK_PLIEGO_PAGES_CONTENT, type PageContentMock } from '../mockups/ubicacionesPdf.mock';
import { ComplianceBadge } from '@/shared/components/badges/ComplianceBadge';
import { sanitizeText } from '@/shared/utils/sanitizeText';

export interface FocusedTenderPdfWorkspaceProps {
  processId?: string;
  onClose?: () => void;
}

type QuickFilterState = 'todos' | 'cumple' | 'brechas' | 'revision';

function getConciseReason(item: ItemVerificable): string {
  if (item.estado === 'cumple') {
    if (item.faltante) return item.faltante;
    if (item.evidencia?.cita_literal) {
      const cite = item.evidencia.cita_literal.replace(/[“”"]/g, '').trim();
      return `Acreditado con ${item.evidencia.fuente_nombre}: "${cite.slice(0, 110)}${cite.length > 110 ? '...' : ''}"`;
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
    `Requisito marcado para verificación técnica manual por el equipo.`
  );
}

export const FocusedTenderPdfWorkspace: React.FC<FocusedTenderPdfWorkspaceProps> = ({
  processId = 'LP-MIN-001-2026',
  onClose,
}) => {
  const { resultado, selectedItem, setSelectedItem } = useTenderMatrix();
  const { isDark, toggleTheme } = useTheme();
  const allItems = resultado.items || [];

  // Paneles laterales toggleables para máxima concentración
  const [isLeftIndexOpen, setIsLeftIndexOpen] = useState(true);
  const [isRightEvidenceOpen, setIsRightEvidenceOpen] = useState(true);

  // Filtros y búsqueda en el índice de requisitos
  const [quickFilter, setQuickFilter] = useState<QuickFilterState>('todos');
  const [quickSearch, setQuickSearch] = useState('');

  // Controles de visor PDF
  const [currentPage, setCurrentPage] = useState(shouldUseMock()?14:1);
  const [pdfPages,setPdfPages]=useState(shouldUseMock()?74:1);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [searchInPdf, setSearchInPdf] = useState('');

  // Control para mostrar/ocultar el diagnóstico flotante sobre la cláusula
  const [isClauseDiagnosisOpen, setIsClauseDiagnosisOpen] = useState(true);

  // Estado de copia de observación y nota editable
  const [operationError, setOperationError] = useState<string | null>(null);
  useEffect(() => { const show = (event: Event) => setOperationError((event as CustomEvent<string>).detail); window.addEventListener('criterio:error', show); return () => window.removeEventListener('criterio:error', show); }, []);
  const [copiedObservation, setCopiedObservation] = useState(false);
  const [observationNote, setObservationNote] = useState('');
  useEffect(()=>{if(!shouldUseMock())setObservationNote('');},[selectedItem?.id]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const indexListRef = useRef<HTMLDivElement | null>(null);

  // Conteos ejecutivos de estado
  const counts = {
    todos: allItems.length,
    cumple: allItems.filter((i) => i.estado === 'cumple').length,
    brechas: allItems.filter((i) => i.estado === 'no_cumple' || i.estado === 'cumple_parcialmente').length,
    revision: allItems.filter((i) => i.estado === 'revision').length,
    parcial: allItems.filter((i) => i.estado === 'cumple_parcialmente').length,
    noCumple: allItems.filter((i) => i.estado === 'no_cumple').length,
  };

  // Filtrado de ítems para el índice izquierdo
  const filteredQuickItems = allItems.filter((item) => {
    if (quickFilter === 'cumple' && item.estado !== 'cumple') return false;
    if (
      quickFilter === 'brechas' &&
      item.estado !== 'no_cumple' &&
      item.estado !== 'cumple_parcialmente'
    )
      return false;
    if (
      quickFilter === 'revision' &&
      item.estado !== 'revision'
    )
      return false;

    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase();
      const matchCod = item.codigo_req.toLowerCase().includes(q);
      const matchNum = item.numeral.toLowerCase().includes(q);
      const matchDesc = (item.descripcion_item ?? "").toLowerCase().includes(q);
      if (!matchCod && !matchNum && !matchDesc) return false;
    }
    return true;
  });

  // Lista ordenada de páginas del documento mock
  const sortedPages = Object.keys(MOCK_PLIEGO_PAGES_CONTENT)
    .map(Number)
    .sort((a, b) => a - b);

  // Mapeo de numerales a páginas
  const NUMERAL_PAGE_MAP: Record<string, number> = {
    '2.4': 8,
    '3.1.2': 11,
    '3.1.4': 14,
    '3.2.1': 14,
    '3.2.2': 14,
    '3.2.3': 14,
    '3.3.1': 15,
    '3.3.2': 15,
    '3.3.3': 15,
    '3.4': 15,
    '4.2': 28,
    '4.3': 28,
    '4.4': 28,
    '5.1': 31,
    '5.2': 31,
    '6.1': 35,
    '7.1': 38,
  };

  const getPageForNumeral = (numeral: string): number => {
    if(!shouldUseMock())return allItems.find(i=>i.numeral===numeral)?.ubicacion.pagina||1;
    if (NUMERAL_PAGE_MAP[numeral]) return NUMERAL_PAGE_MAP[numeral];
    for (const [key, pg] of Object.entries(NUMERAL_PAGE_MAP)) {
      if (numeral.startsWith(key) || key.startsWith(numeral)) return pg;
    }
    return 14;
  };

  // Scroll suave al párrafo seleccionado sin mover la ventana exterior
  const scrollToClause = useCallback((item: ItemVerificable) => {
    const targetPage = getPageForNumeral(item.numeral);
    setCurrentPage(targetPage);
    setIsClauseDiagnosisOpen(true);

    setTimeout(() => {
      if (scrollContainerRef.current) {
        const clauseEl = document.getElementById(`pdf-clause-${item.codigo_req}`);
        if (clauseEl) {
          const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
          const itemTop = clauseEl.getBoundingClientRect().top;
          const targetScroll = scrollContainerRef.current.scrollTop + (itemTop - containerTop) - 30;
          scrollContainerRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
          return;
        }
        const pageEl = document.getElementById(`pdf-page-${targetPage}`);
        if (pageEl) {
          const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
          const pageTop = pageEl.getBoundingClientRect().top;
          const targetScroll = scrollContainerRef.current.scrollTop + (pageTop - containerTop) - 20;
          scrollContainerRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
        }
      }
    }, 100);
  }, []);

  // Al seleccionar un ítem desde el índice o el PDF
  const handleSelectItem = (item: ItemVerificable) => {
    setSelectedItem(item);
    scrollToClause(item);

    // Sincronizar también el scroll del índice izquierdo
    const navItemEl = document.getElementById(`focused-nav-item-${item.codigo_req}`);
    if (navItemEl && indexListRef.current) {
      const containerTop = indexListRef.current.getBoundingClientRect().top;
      const itemTop = navItemEl.getBoundingClientRect().top;
      const targetScroll = indexListRef.current.scrollTop + (itemTop - containerTop) - 60;
      indexListRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  };

  // Contenido de la observación activa
  const activeReqCode = selectedItem?.codigo_req || null;
  const defaultObservationText = !shouldUseMock() ? '' : selectedItem
    ?
      `Observación al Numeral ${selectedItem.numeral || '3.2.1'} (${activeReqCode}): Solicitamos a la Entidad contratante aclarar las condiciones del numeral en concordancia con los soportes aportados.`
    : '';

  const currentObservation = observationNote || defaultObservationText;

  const handleCopyObservation = () => {
    if(!shouldUseMock()&&selectedItem?.requisito_id){if(!selectedItem.es_ambiguo){notifyError(new Error('Solo se generan observaciones para requisitos ambiguos.'));return;}void (observationNote ? Promise.resolve(observationNote) : services.draft(processId,selectedItem.requisito_id).then(d=>d.texto)).then(text=>{setObservationNote(text);return navigator.clipboard.writeText(text);}).then(()=>{setCopiedObservation(true);setTimeout(()=>setCopiedObservation(false),2000);}).catch(notifyError);return;}
    navigator.clipboard?.writeText(currentObservation);
    setCopiedObservation(true);
    setTimeout(() => setCopiedObservation(false), 2000);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomPercent((z) => Math.min(z + 10, 150));
  const handleZoomOut = () => setZoomPercent((z) => Math.max(z - 10, 70));
  const handleZoomReset = () => setZoomPercent(100);

  // Page jump
  const handlePageJump = (page: number) => {
    const clamped = Math.max(1, Math.min(page, pdfPages));
    setCurrentPage(clamped);
    const pageEl = document.getElementById(`pdf-page-${clamped}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#EDF2F7] dark:bg-[#0D0D0D] p-3 sm:p-5 lg:p-6 flex flex-col font-sans select-none transition-colors duration-200">
      {operationError && <div role="alert" className="fixed right-4 top-4 z-[10000] rounded-xl border border-red-200 bg-white p-4 text-xs text-red-800">{operationError}<button className="ml-3 underline" onClick={() => setOperationError(null)}>Cerrar</button></div>}
      {/* Contenedor flotante con mayor aire y márgenes de los bordes para no saturar de esquina a esquina */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#171717] rounded-2xl border border-slate-200/80 dark:border-[#2E2E2E] shadow-card overflow-hidden">
        {/* 1. BARRA SUPERIOR CON MAYOR ALTURA Y ESPACIO */}
        <header className="h-16 sm:h-18 bg-white dark:bg-[#1A1A1A] border-b border-slate-200/80 dark:border-[#2E2E2E] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 font-sans z-30 transition-colors">
          {/* Izquierda: Volver/Cerrar pestaña + Identificador del Proceso */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              data-tour="focused-back-btn"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#212121] hover:bg-slate-50 dark:hover:bg-[#282828] text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
              title="Cerrar visor y volver al resumen"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-[#2E2E2E] hidden sm:block shrink-0" />

            <div data-tour="focused-header" className="min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 tracking-tight block truncate">
                {processId}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[150px] sm:max-w-xs md:max-w-md hidden md:block">
                {shouldUseMock() ? 'Pliego_Condiciones_v1.pdf · Ministerio de Transporte' : `${resultado.pdf_nombre || 'Pliego original'} · ${resultado.nombre}`}
              </p>
            </div>
          </div>

          {/* Centro: Filtros de Estado Limpios (con flex-nowrap) */}
          <div
            data-tour="focused-state-filters"
            className="hidden lg:flex items-center gap-1 bg-slate-100/70 dark:bg-[#212121] p-1 rounded-xl border border-slate-200/60 dark:border-[#2E2E2E] text-xs shrink-0"
          >
            <button
              type="button"
              onClick={() => setQuickFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                quickFilter === 'todos'
                  ? 'bg-white dark:bg-[#2A2A2A] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({counts.todos})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('cumple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                quickFilter === 'cumple'
                  ? 'bg-white dark:bg-[#2A2A2A] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cumple ({counts.cumple})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('brechas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                quickFilter === 'brechas'
                  ? 'bg-white dark:bg-[#2A2A2A] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Brechas ({counts.brechas})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('revision')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                quickFilter === 'revision'
                  ? 'bg-white dark:bg-[#2A2A2A] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Revisión ({counts.revision})
            </button>
          </div>

          {/* Derecha: Controles de Zoom, Paginación y Alternancia de Paneles (Siempre en una sola línea sin salto) */}
          <div data-tour="focused-controls" className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
            {/* Paginador */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-[#212121] border border-slate-200 dark:border-[#2E2E2E] rounded-xl px-2 py-1.5 text-xs text-slate-600 dark:text-zinc-300 shrink-0">
              <button
                type="button"
                onClick={() => handlePageJump(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
              </button>
              <span className="px-1 font-medium text-slate-800 dark:text-zinc-200 text-xs whitespace-nowrap">
                Pág. {currentPage} / {pdfPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageJump(currentPage + 1)}
                disabled={currentPage >= pdfPages}
                className="p-1 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center bg-slate-50 dark:bg-[#212121] border border-slate-200 dark:border-[#2E2E2E] rounded-xl text-xs text-slate-600 dark:text-zinc-300 p-0.5 shrink-0">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white dark:hover:bg-[#2A2A2A] hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
                title="Reducir zoom"
              >
                <ZoomOut className="w-3.5 h-3.5 shrink-0" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-2 py-1 font-semibold text-slate-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-[#2A2A2A] rounded-lg cursor-pointer text-xs whitespace-nowrap transition-colors"
                title="Restablecer zoom a 100%"
              >
                {zoomPercent}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white dark:hover:bg-[#2A2A2A] hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-[#2E2E2E] hidden sm:block shrink-0" />

            {/* Botón de Modo Oscuro / Claro */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#212121] text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#282828] transition-colors cursor-pointer shrink-0"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4 text-[#3ECF8E] shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            </button>

            {/* Botón para alternar el panel izquierdo (Índice) */}
            <button
              type="button"
              onClick={() => setIsLeftIndexOpen((prev) => !prev)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer shrink-0 ${
                isLeftIndexOpen
                  ? 'bg-slate-100 dark:bg-[#2A2A2A] border-slate-300 dark:border-[#3ECF8E]/40 text-slate-900 dark:text-[#3ECF8E]'
                  : 'bg-white dark:bg-[#212121] border-slate-200 dark:border-[#2E2E2E] text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#282828]'
              }`}
              title={isLeftIndexOpen ? 'Ocultar índice' : 'Mostrar índice de requisitos'}
            >
              {isLeftIndexOpen ? <PanelLeftClose className="w-4 h-4 shrink-0" /> : <PanelLeft className="w-4 h-4 shrink-0" />}
            </button>

            {/* Botón para alternar el panel derecho (Detalle & Evidencia) - Evita salto de línea con whitespace-nowrap */}
            <button
              type="button"
              onClick={() => setIsRightEvidenceOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                isRightEvidenceOpen
                  ? 'bg-brand-primary dark:bg-[#0D7A4D] text-white border-brand-primary dark:border-[#3ECF8E]/40'
                  : 'bg-white dark:bg-[#212121] border-slate-200 dark:border-[#2E2E2E] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#282828]'
              }`}
              title={isRightEvidenceOpen ? 'Ocultar información de evidencia' : 'Mostrar información de evidencia'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">
                {isRightEvidenceOpen ? 'Ocultar' : 'Ver evidencia'}
              </span>
            </button>
          </div>
        </header>

      {/* 2. ESPACIO DE TRABAJO INMERSIVO (3 Columnas con scroll individual, sin doble scroll) */}
      <div className="flex-1 min-h-0 flex overflow-hidden font-sans">
        {/* PANEL 1 (IZQUIERDA): ÍNDICE DE REQUISITOS Y NAVEGACIÓN RÁPIDA */}
        {isLeftIndexOpen && (
          <aside
            data-tour="focused-left-index"
            aria-label="Índice de Requisitos"
            className="w-72 sm:w-80 border-r border-slate-200/80 dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] flex flex-col shrink-0 h-full max-h-full overflow-hidden font-sans select-none z-20"
          >
            {/* Cabecera del índice con buscador */}
            <div className="p-3 border-b border-slate-100 dark:border-[#2E2E2E] space-y-2 bg-slate-50/60 dark:bg-[#1C1C1C] shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                  Índice de Requisitos
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                  {filteredQuickItems.length} ítems
                </span>
              </div>

              {/* Buscador de numerales y requisitos */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Buscar numeral o código..."
                  className="w-full rounded-lg border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#212121] py-1.5 pl-8 pr-2.5 text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-brand-primary dark:focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              {/* Filtros compactos */}
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
                  Todos
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
                  Cumple
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
                  Brechas
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
                  Revisión
                </button>
              </div>
            </div>

            {/* Lista con scroll interno exclusivo */}
            <div
              ref={indexListRef}
              className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 text-xs scroll-smooth"
            >
              {filteredQuickItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  No se encontraron requisitos con los filtros aplicados.
                </div>
              ) : (
                filteredQuickItems.map((item) => {
                  const isSelected = selectedItem?.codigo_req === item.codigo_req;
                  let dotColor = 'bg-slate-300';
                  let statusLabel = 'Pendiente';

                  if (item.estado === 'cumple') {
                    dotColor = 'bg-emerald-500';
                    statusLabel = 'Cumple';
                  } else if (item.estado === 'cumple_parcialmente') {
                    dotColor = 'bg-amber-500';
                    statusLabel = 'Parcial';
                  } else if (item.estado === 'no_cumple') {
                    dotColor = 'bg-rose-500';
                    statusLabel = 'No cumple';
                  } else if (item.estado === 'revision') {
                    dotColor = 'bg-blue-500';
                    statusLabel = 'En revisión';
                  }

                  return (
                    <div
                      key={item.codigo_req}
                      id={`focused-nav-item-${item.codigo_req}`}
                      onClick={() => handleSelectItem(item)}
                      className={`p-2.5 transition-colors cursor-pointer font-sans ${
                        isSelected
                          ? 'bg-slate-100/90 dark:bg-[#282828] border-l-3 border-brand-primary dark:border-[#3ECF8E]'
                          : 'hover:bg-slate-50/80 dark:hover:bg-[#232323]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                          <span className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                            {item.codigo_req}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                            Numeral {item.numeral}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed pl-4">
                        {item.descripcion_item}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* PANEL 2 (CENTRO): LIENZO DEL PLIEGO (PDF) CON SCROLL CONTINUO Y CLÁUSULAS */}
        <main
          ref={scrollContainerRef}
          data-tour="focused-pdf-canvas"
          className="flex-1 h-full max-h-full overflow-y-auto bg-[#E5E9F0]/80 dark:bg-[#121212] p-4 sm:p-6 space-y-8 scroll-smooth font-sans"
        >
          {!shouldUseMock()&&<OriginalPdfCanvas id={processId} url={resultado.pdf_url_temporal} item={selectedItem} page={currentPage} zoom={zoomPercent} onPages={setPdfPages} search={searchInPdf} onPage={setCurrentPage}/>}
          {shouldUseMock()&&sortedPages.map((pgNum) => {
            const pageData = MOCK_PLIEGO_PAGES_CONTENT[pgNum];
            if (!pageData) return null;

            return (
              <article
                key={`page-${pgNum}`}
                id={`pdf-page-${pgNum}`}
                style={{
                  transform: `scale(${zoomPercent / 100})`,
                  transformOrigin: 'top center',
                }}
                className="max-w-[780px] mx-auto bg-white dark:bg-[#1A1A1A] rounded-lg shadow-md border border-slate-200/80 dark:border-[#2E2E2E] p-8 sm:p-12 text-slate-800 dark:text-zinc-200 space-y-6 transition-transform duration-150 font-sans"
              >
                {/* Cabecera de la Página Oficial del Pliego */}
                <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between text-[11px] text-slate-500 tracking-wide font-medium">
                  <span>{pageData.header}</span>
                  <span className="font-semibold text-slate-700">Pág. {pgNum}</span>
                </div>

                {/* Título de Sección del Pliego */}
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {pageData.sectionTitle}
                </h3>

                {/* Párrafo Introductorio */}
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {pageData.introParagraph}
                </p>

                {/* Cláusulas y Requisitos Identificados */}
                <div className="space-y-4">
                  {pageData.clauses.map((clause, idx) => {
                    const reqItem = allItems.find(
                      (i) => i.codigo_req === clause.reqCode || i.numeral === clause.numeral
                    );
                    const isSelected =
                      selectedItem?.codigo_req === reqItem?.codigo_req ||
                      selectedItem?.numeral === clause.numeral;

                    return (
                      <div
                        key={`clause-${pgNum}-${idx}`}
                        id={reqItem ? `pdf-clause-${reqItem.codigo_req}` : undefined}
                        onClick={() => {
                          if (reqItem) {
                            handleSelectItem(reqItem);
                          }
                        }}
                        className={`relative rounded-xl p-3.5 transition-all cursor-pointer font-sans ${
                          isSelected
                            ? 'bg-amber-100/60 dark:bg-[#1E2E24] border-2 border-amber-400 dark:border-[#3ECF8E] shadow-sm'
                            : 'bg-amber-50/40 dark:bg-[#202020] hover:bg-amber-100/40 dark:hover:bg-[#262626] border border-amber-200/60 dark:border-[#333333]'
                        }`}
                      >
                        {/* Indicador de Numeral y Código */}
                        <div className={`flex items-center justify-between text-[11px] font-semibold mb-1.5 ${isSelected ? 'text-amber-900/90 dark:text-[#3ECF8E]' : 'text-amber-900/90 dark:text-zinc-300'}`}>
                          <span className="flex items-center gap-1.5">
                            <span>Numeral {clause.numeral}</span>
                            {isSelected && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-[#0D7A4D] text-amber-900 dark:text-white">
                                Cláusula seleccionada
                              </span>
                            )}
                          </span>
                          <span className={`font-mono ${isSelected ? 'text-amber-800 dark:text-[#3ECF8E]' : 'text-amber-800 dark:text-zinc-400'}`}>
                            {clause.reqCode || 'REQ-PLIEGO'}
                          </span>
                        </div>

                        {/* Texto de la Cláusula */}
                        <p className="text-xs leading-relaxed text-slate-800 dark:text-zinc-200 font-medium">
                          {clause.text}
                        </p>

                        {/* Diagnóstico Resumido y Colapsable dentro del PDF */}
                        {isSelected && reqItem && isClauseDiagnosisOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 pt-3 border-t border-amber-200/80 flex flex-col gap-2 bg-white/90 rounded-lg p-3 shadow-2xs font-sans"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900">
                                  Diagnóstico del Requisito:
                                </span>
                                <ComplianceBadge estado={reqItem.estado} />
                              </div>

                              {/* Botón para cerrar la descripción */}
                              <button
                                type="button"
                                onClick={() => setIsClauseDiagnosisOpen(false)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Cerrar diagnóstico del PDF"
                              >
                                <X className="w-3 h-3" />
                                <span>Ocultar</span>
                              </button>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed font-normal">
                              {getConciseReason(reqItem)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pie de página del documento */}
                {pageData.footerSectionTitle && (
                  <div className="pt-4 border-t border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      {pageData.footerSectionTitle}
                    </h4>
                    {pageData.footerText && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {pageData.footerText}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </main>

        {/* PANEL 3 (DERECHA): ANÁLISIS, EVIDENCIA Y OBSERVACIONES SIN RUIDO VISUAL */}
        {isRightEvidenceOpen && (
          <aside
            data-tour="focused-evidence-panel"
            aria-label="Panel de Análisis y Evidencia"
            className="w-80 sm:w-96 lg:w-[420px] border-l border-slate-200/80 dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] flex flex-col shrink-0 h-full max-h-full overflow-hidden font-sans z-20"
          >
            {/* Header del panel lateral */}
            <div className="p-3.5 border-b border-slate-200/80 dark:border-[#2E2E2E] bg-slate-50/70 dark:bg-[#1C1C1C] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary dark:text-[#3ECF8E]" />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                  Análisis del Requisito
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRightEvidenceOpen(false)}
                className="p-1 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#282828] cursor-pointer"
                title="Cerrar panel de análisis"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido con scroll interno exclusivo */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 font-sans p-4 space-y-5">
              {!selectedItem ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 min-h-[300px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Ningún requisito seleccionado</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                      Haga clic en un requisito de la lista lateral o en una cláusula del documento para inspeccionar su trazabilidad, evidencia y observaciones.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Bloque 1: Resumen y Estado */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">
                        {activeReqCode} · Numeral {selectedItem.numeral || '3.2.1'}
                      </span>
                      <ComplianceBadge estado={selectedItem.estado} />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Exigencia del Pliego
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {selectedItem.descripcion_item}
                      </p>
                    </div>
                  </div>

                  {/* Bloque 2: Evidencia Interna Contrastada */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-900">
                        Evidencia Interna Contrastada
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Cita Verificada 100%
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs bg-white rounded-xl border border-slate-200 p-3.5">
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
                          Documento Fuente:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {selectedItem.evidencia?.fuente_nombre ||
                            selectedItem.evidencia_fuente ||
                            'Contrato Obra Vial 2024-C08 (Pág. 12)'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
                          Texto Literal Citado:
                        </span>
                        <p className="italic text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          {selectedItem.evidencia?.cita_literal ||
                            selectedItem.evidencia_fragmento ||
                            '“Acreditación de 5.000 m² de pavimentación asfáltica en vías primarias...”'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
                          Diagnóstico de Brecha:
                        </span>
                        <p className="text-slate-800 font-medium">
                          {selectedItem.faltante ||
                            selectedItem.brecha_identificada ||
                            'Ninguno. Cumple con el metraje mínimo exigido de 4.000 m².'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 3: Redactor y Copiador de Observación al Pliego */}
                  <div className="pt-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900">
                        Observación Redactada al Pliego
                      </h4>
                      <button
                        type="button"
                        onClick={handleCopyObservation}
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
                      placeholder="Redacte la observación para presentar a la entidad..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-800 leading-relaxed focus:bg-white focus:border-brand-primary focus:outline-none font-sans"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer del panel lateral */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0 font-sans">
              <span className="text-[11px] text-slate-500">
                Auditoría en tiempo real
              </span>
              <button
                type="button"
                onClick={() => setIsRightEvidenceOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cerrar panel
              </button>
            </div>
          </aside>
        )}
        </div>
      </div>
    </div>
  );
};


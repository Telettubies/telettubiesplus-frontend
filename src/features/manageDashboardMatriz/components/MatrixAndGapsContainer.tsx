import React, { useState, useMemo, useEffect } from 'react';
import {
  FiSearch,
  FiExternalLink,
  FiEdit2,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import type { ItemVerificable } from '@/api/types';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { useMatrixFilters, type MatrixCategoryTab } from '../hooks/useMatrixFilters';
import { useKeyboardMatrixNav } from '../hooks/useKeyboardMatrixNav';
import { ComplianceBadge } from '@/shared/components/badges/ComplianceBadge';
import { GapsPriorityList } from './GapsPriorityList';
import { CategoryAccordion } from './CategoryAccordion';
import { ItemDetailDrawer } from './ItemDetailDrawer';
import '../styles/matrix.animations.css';

interface MatrixAndGapsContainerProps {
  items: ItemVerificable[];
  selectedItem: ItemVerificable | null;
  onSelectItem: (item: ItemVerificable) => void;
  onScrollToPdf?: (item: ItemVerificable) => void;
  onOpenReviewForItem?: (item: ItemVerificable) => void;
  onOpenObservationForItem?: (item: ItemVerificable) => void;
  forceAllReqs17And22InReview?: boolean;
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export const MatrixAndGapsContainer: React.FC<MatrixAndGapsContainerProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onScrollToPdf,
  onOpenReviewForItem,
  onOpenObservationForItem,
  forceAllReqs17And22InReview = false,
}) => {
  const displayItems = React.useMemo(() => {
    if (!forceAllReqs17And22InReview) return items;
    return items.map((item) =>
      item.codigo_req === 'REQ-017'
        ? { ...item, estado: 'revision' as const, evidencia: undefined }
        : item
    );
  }, [items, forceAllReqs17And22InReview]);

  const {
    activeCategoryTab,
    setActiveCategoryTab,
    quickStateFilter,
    setQuickStateFilter,
    searchQuery,
    setSearchQuery,
    filteredItems,
  } = useMatrixFilters(displayItems);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reiniciar a la página 1 cuando cambia la categoría, búsqueda o filtro rápido
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryTab, quickStateFilter, searchQuery]);

  // Si se selecciona un requisito externamente, posicionar la paginación en su página
  useEffect(() => {
    if (!selectedItem) return;
    const itemIndex = filteredItems.findIndex(
      (i) => i.id === selectedItem.id || i.codigo_req === selectedItem.codigo_req
    );
    if (itemIndex !== -1) {
      const targetPage = Math.floor(itemIndex / pageSize) + 1;
      setCurrentPage((prev) => (prev !== targetPage ? targetPage : prev));
    }
  }, [selectedItem?.id, selectedItem?.codigo_req, filteredItems, pageSize]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, safeCurrentPage, pageSize]);

  const startRecord = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalItems);

  const [showLevel2Accordions, setShowLevel2Accordions] = useState(false);
  const [detailDrawerItem, setDetailDrawerItem] = useState<ItemVerificable | null>(null);

  useKeyboardMatrixNav(filteredItems, selectedItem, onSelectItem, true);

  const tabs: { id: MatrixCategoryTab; label: string; count: number }[] = [
    { id: 'todos', label: 'Todos', count: shouldUseMock() ? 142 : items.length },
    { id: 'habilitante', label: 'Habilitantes', count: shouldUseMock() ? 38 : items.filter(i => i.categoria === 'habilitante').length },
    { id: 'tecnico', label: 'Técnicos', count: shouldUseMock() ? 64 : items.filter(i => i.categoria === 'tecnico').length },
    { id: 'experiencia', label: 'Experiencia', count: shouldUseMock() ? 28 : items.filter(i => i.categoria === 'experiencia').length },
    { id: 'plazo', label: 'Plazos', count: shouldUseMock() ? 12 : items.filter(i => i.categoria === 'plazo').length },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden flex flex-col">
      {/* Category Tabs Bar (Pág. 32 INTERFACES.pdf) */}
      <div
        data-tour="nivel-2-filtros-brechas"
        className="border-b border-slate-200 px-4 pt-2.5 flex items-center justify-between gap-2 overflow-x-auto bg-white"
      >
        <div className="flex items-center gap-5">
          {tabs.map((tab) => {
            const active = activeCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={`pb-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'border-brand-primary font-semibold text-slate-900'
                    : 'border-transparent font-normal text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowLevel2Accordions((v) => !v)}
          className={`mb-2 inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors shrink-0 ${
            showLevel2Accordions
              ? 'bg-slate-700 text-white border-slate-700'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <FiLayers className="w-3 h-3" />
          <span>{showLevel2Accordions ? 'Vista Tabla' : 'Brechas y Acordeones'}</span>
        </button>
      </div>

      {/* Search + Quick State Filter Pills (Todos | Solo Brechas (24) | En Revisión (4)) */}
      <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 bg-white">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar requisito o numeral"
            aria-label="Buscar requisito o numeral"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setQuickStateFilter('todos')}
            className={`px-3 py-1.5 font-medium transition-colors ${
              quickStateFilter === 'todos'
                ? 'bg-brand-primary text-white font-semibold'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setQuickStateFilter('solo_brechas')}
            className={`px-3 py-1.5 border-l border-slate-200 font-medium transition-colors ${
              quickStateFilter === 'solo_brechas'
                ? 'bg-brand-primary text-white font-semibold'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Solo Brechas (24)
          </button>
          <button
            type="button"
            onClick={() => setQuickStateFilter('en_revision')}
            className={`px-3 py-1.5 border-l border-slate-200 font-medium transition-colors ${
              quickStateFilter === 'en_revision'
                ? 'bg-brand-primary text-white font-semibold'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            En Revisión (4)
          </button>
        </div>
      </div>

      {/* Optional Level 3 Expanded Drawer */}
      {detailDrawerItem && (
        <div className="p-3 border-b border-slate-200">
          <ItemDetailDrawer
            item={detailDrawerItem}
            onClose={() => setDetailDrawerItem(null)}
            onGenerateObservation={onOpenObservationForItem}
          />
        </div>
      )}

      {/* Level 2 Accordions & Priority Gaps View vs Full-Width Matrix Table View (sin doble scroll interno) */}
      {showLevel2Accordions ? (
        <div className="p-4 space-y-4">
          <GapsPriorityList
            items={displayItems}
            onSelectGap={(item) => {
              onSelectItem(item);
              onScrollToPdf?.(item);
            }}
          />
          <CategoryAccordion
            items={displayItems}
            onSelectItem={(item) => {
              onSelectItem(item);
              onScrollToPdf?.(item);
            }}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-medium text-slate-500">
              <tr>
                <th className="py-3 px-4">Numeral / ID</th>
                <th className="py-3 px-4">Requisito del Pliego</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Evidencia Vinculada</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    id={`matrix-row-anchor-${item.codigo_req}`}
                    data-testid={`matrix-row-${item.codigo_req}`}
                    onClick={() => {
                      onSelectItem(item);
                      onScrollToPdf?.(item);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-100/95 dark:bg-[#232323] ring-1 ring-inset ring-brand-primary dark:ring-[#3ECF8E]'
                        : 'hover:bg-slate-50/80 dark:hover:bg-[#242424]'
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-900 leading-tight">{item.codigo_req}</p>
                      <p className="font-mono text-[11px] text-slate-500">
                        Numeral {item.numeral}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 leading-relaxed max-w-xl">
                      {item.descripcion_item}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ComplianceBadge estado={item.estado} variant="bracket" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {item.evidencia?.fuente_nombre || '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          title="Ver párrafo resaltado en el PDF"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem(item);
                            onScrollToPdf?.(item);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1C1C1C] hover:bg-slate-50 dark:hover:bg-[#2A2A2A] dark:hover:border-[#3ECF8E]/50 text-[11px] font-medium text-brand-primary dark:text-[#3ECF8E] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver en PDF ↑</span>
                          <FiExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          title="Revisar requisito manualmente"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem(item);
                            onOpenReviewForItem?.(item);
                          }}
                          className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600"
                        >
                          <FiEdit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Sistema de Paginación para Evitar Scroll Infinito */}
          {totalItems > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
              {/* Información de registros y selector de tamaño de página */}
              <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium">
                <span>
                  Mostrando <strong className="text-slate-900">{startRecord}</strong>–
                  <strong className="text-slate-900">{endRecord}</strong> de{' '}
                  <strong className="text-slate-900">{totalItems}</strong> requisitos
                </span>

                <span className="text-slate-300 hidden sm:inline">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Filas por página:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 font-medium focus:border-brand-primary focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Botones de navegación y números de página */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                  title="Primera página"
                >
                  <FiChevronsLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors inline-flex items-center gap-1"
                  title="Página anterior"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs font-medium">Anterior</span>
                </button>

                {/* Números de página interactivos */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
                    typeof p === 'number' ? (
                      <button
                        key={`page-btn-${p}`}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          p === safeCurrentPage
                            ? 'bg-brand-primary text-white font-semibold shadow-2xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={`dots-${idx}`} className="px-1 text-slate-400 select-none">
                        ...
                      </span>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors inline-flex items-center gap-1"
                  title="Página siguiente"
                >
                  <span className="hidden sm:inline text-xs font-medium">Siguiente</span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                  title="Última página"
                >
                  <FiChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


import { useState, useMemo } from 'react';
import type { ItemVerificable, CategoriaRequisito } from '@/api/types';

export type MatrixCategoryTab = 'todos' | CategoriaRequisito;
export type MatrixQuickStateFilter = 'todos' | 'solo_brechas' | 'en_revision';

export function useMatrixFilters(items: ItemVerificable[]) {
  const [activeCategoryTab, setActiveCategoryTab] = useState<MatrixCategoryTab>('todos');
  const [quickStateFilter, setQuickStateFilter] = useState<MatrixQuickStateFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCat =
        activeCategoryTab === 'todos' || item.categoria === activeCategoryTab;

      let matchesQuick = true;
      if (quickStateFilter === 'solo_brechas') {
        matchesQuick =
          item.estado === 'no_cumple' || item.estado === 'cumple_parcialmente';
      } else if (quickStateFilter === 'en_revision') {
        matchesQuick = item.estado === 'revision';
      }

      const matchesSearch =
        !q ||
        item.codigo_req.toLowerCase().includes(q) ||
        item.numeral.toLowerCase().includes(q) ||
        (item.descripcion_item ?? "").toLowerCase().includes(q) ||
        (item.texto_requisito_literal ?? "").toLowerCase().includes(q);

      return matchesCat && matchesQuick && matchesSearch;
    });
  }, [items, activeCategoryTab, quickStateFilter, searchQuery]);

  return {
    activeCategoryTab,
    setActiveCategoryTab,
    quickStateFilter,
    setQuickStateFilter,
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
}


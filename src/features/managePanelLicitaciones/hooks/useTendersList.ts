import { useState, useMemo, useCallback } from 'react';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import {
  MOCK_PORTAFOLIO_LICITACIONES,
  MOCK_NEW_JOB_TENDER,
} from '../mockups/licitacionesList.mock';
import {
  filterAndSortTenders,
  type PortfolioCategoryFilter,
  type PortfolioStatusFilter,
} from '../utils/sortTenders';

export type PortfolioVisualState =
  | 'default' // Pág. 19
  | 'empty' // Pág. 20
  | 'new_job' // Pág. 21
  | 'error_403' // Pág. 22
  | 'no_results' // Pág. 23
  | 'skeleton'; // Pág. 24

export function useTendersList() {
  const isMockEnabled = shouldUseMock('VITE_MOCK_PANEL');
  const [visualState, setVisualState] = useState<PortfolioVisualState>(
    isMockEnabled ? 'default' : 'empty'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PortfolioCategoryFilter>('Todos');
  const [statusFilter, setStatusFilter] = useState<PortfolioStatusFilter>('Todos');

  const sourceList = useMemo(() => {
    if (visualState === 'empty') return [];
    if (visualState === 'new_job') {
      return [MOCK_NEW_JOB_TENDER, ...MOCK_PORTAFOLIO_LICITACIONES.slice(0, 9)];
    }
    return MOCK_PORTAFOLIO_LICITACIONES;
  }, [visualState]);

  const filteredTenders = useMemo(
    () => filterAndSortTenders(sourceList, searchQuery, categoryFilter, statusFilter),
    [sourceList, searchQuery, categoryFilter, statusFilter]
  );

  const switchVisualState = useCallback((next: PortfolioVisualState) => {
    setVisualState(next);
    if (next === 'no_results') {
      setSearchQuery('LP-2024');
    } else if (searchQuery === 'LP-2024') {
      setSearchQuery('');
    }
  }, [searchQuery]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('Todos');
    setStatusFilter('Todos');
    if (visualState === 'no_results') {
      setVisualState('default');
    }
  }, [visualState]);

  return {
    visualState,
    switchVisualState,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    filteredTenders,
    clearFilters,
  };
}


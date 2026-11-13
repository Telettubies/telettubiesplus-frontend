import { licitacionesListService } from '../services/licitacionesListService';
import type { LicitacionPortafolioItem } from '@/api/types';
import { useAuth } from '@/shared/hooks/useAuth';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
  const {user}=useAuth();
  const [realRows,setRealRows]=useState<LicitacionPortafolioItem[]>([]);
  const [reload,setReload]=useState(0);
  useEffect(()=>{if(isMockEnabled)return;let alive=true;let timer:ReturnType<typeof setTimeout>;setVisualState('skeleton');const load=async()=>{try{const rows=await licitacionesListService.getTenders();if(!alive)return;setRealRows(rows);setVisualState(rows.length?'default':'empty');if(rows.some(t=>t.estado_pipeline!=='Completado'&&t.estado_pipeline!=='Fallido'))timer=setTimeout(load,5000);}catch{if(alive)setVisualState('error_403');}};void load();return()=>{alive=false;clearTimeout(timer);};},[isMockEnabled,user?.organizacion_id,reload]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PortfolioCategoryFilter>('Todos');
  const [statusFilter, setStatusFilter] = useState<PortfolioStatusFilter>('Todos');

  const sourceList = useMemo(() => {
    if(!isMockEnabled)return realRows;
    if (visualState === 'empty') return [];
    if (visualState === 'new_job') {
      return [MOCK_NEW_JOB_TENDER, ...MOCK_PORTAFOLIO_LICITACIONES.slice(0, 9)];
    }
    return MOCK_PORTAFOLIO_LICITACIONES;
  }, [visualState,realRows,isMockEnabled]);

  const filteredTenders = useMemo(
    () => filterAndSortTenders(sourceList, searchQuery, categoryFilter, statusFilter),
    [sourceList, searchQuery, categoryFilter, statusFilter]
  );

  const switchVisualState = useCallback((next: PortfolioVisualState) => {
    if(!isMockEnabled){setReload(n=>n+1);return;}
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
    sourceTenders:sourceList,
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


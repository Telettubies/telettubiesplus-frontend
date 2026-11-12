import type { LicitacionPortafolioItem } from '@/api/types';

export type PortfolioCategoryFilter = 'Todos' | 'Infraestructura' | 'Tecnología';
export type PortfolioStatusFilter = 'Todos' | 'Habilitado' | 'Descalificado' | 'En Análisis';

export function filterAndSortTenders(
  items: LicitacionPortafolioItem[],
  search: string,
  category: PortfolioCategoryFilter,
  status: PortfolioStatusFilter
): LicitacionPortafolioItem[] {
  const q = search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      !q ||
      item.codigo_proceso.toLowerCase().includes(q) ||
      item.entidad.toLowerCase().includes(q) ||
      item.objeto.toLowerCase().includes(q);

    const matchesCategory =
      category === 'Todos' || item.categoria_dominio === category;

    let matchesStatus = true;
    if (status === 'Habilitado') {
      matchesStatus =
        item.recomendacion === 'presentarse' ||
        item.recomendacion === 'presentarse_con_riesgo' ||
        item.recomendacion === 'condicionada';
    } else if (status === 'Descalificado') {
      matchesStatus = item.recomendacion === 'no_presentarse';
    } else if (status === 'En Análisis') {
      matchesStatus = item.estado_pipeline !== 'Completado';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });
}


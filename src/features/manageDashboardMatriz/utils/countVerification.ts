import type { ItemVerificable, EstadoCumplimiento, CategoriaRequisito } from '@/api/types';

export function calculateStateCounts(
  items: ItemVerificable[]
): Record<EstadoCumplimiento, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.estado] = (acc[item.estado] || 0) + 1;
      return acc;
    },
    {
      cumple: 0,
      cumple_parcialmente: 0,
      no_cumple: 0,
      revision: 0,
    } as Record<EstadoCumplimiento, number>
  );
}

export function groupItemsByCategory(
  items: ItemVerificable[]
): Record<CategoriaRequisito, ItemVerificable[]> {
  return {
    habilitante: items.filter((i) => i.categoria === 'habilitante'),
    tecnico: items.filter((i) => i.categoria === 'tecnico'),
    experiencia: items.filter((i) => i.categoria === 'experiencia'),
    plazo: items.filter((i) => i.categoria === 'plazo'),
  };
}


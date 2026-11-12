import type { ItemVerificable, CategoriaRequisito } from '@/api/types';

const CATEGORY_PRIORITY: Record<CategoriaRequisito, number> = {
  habilitante: 0, // Estrictamente los Habilitantes primero (HU-F08 / HU-B19)
  experiencia: 1,
  tecnico: 2,
  plazo: 3,
};

const STATE_PRIORITY: Record<string, number> = {
  no_cumple: 0,
  cumple_parcialmente: 1,
};

/**
 * Filtra y ordena la lista de brechas ('no_cumple' y 'cumple_parcialmente'),
 * colocando siempre los requisitos Habilitantes en primer lugar (HU-F08).
 */
export function sortGapsHabilitantesFirst(items: ItemVerificable[]): ItemVerificable[] {
  return items
    .filter((item) => item.estado === 'no_cumple' || item.estado === 'cumple_parcialmente')
    .sort((a, b) => {
      const catDiff =
        (CATEGORY_PRIORITY[a.categoria] ?? 99) - (CATEGORY_PRIORITY[b.categoria] ?? 99);
      if (catDiff !== 0) return catDiff;

      const stateDiff = (STATE_PRIORITY[a.estado] ?? 99) - (STATE_PRIORITY[b.estado] ?? 99);
      if (stateDiff !== 0) return stateDiff;

      return a.numeral.localeCompare(b.numeral, undefined, { numeric: true });
    });
}


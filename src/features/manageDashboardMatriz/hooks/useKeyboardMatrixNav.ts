import { useEffect, useCallback } from 'react';
import type { ItemVerificable } from '@/api/types';

/**
 * Navegación accesible por teclado entre filas de la matriz (HU-F10):
 * Permite recorrer las filas con ArrowUp / ArrowDown sincronizando el visor PDF.
 */
export function useKeyboardMatrixNav(
  items: ItemVerificable[],
  selectedItem: ItemVerificable | null,
  onSelectItem: (item: ItemVerificable) => void,
  enabled = true
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || items.length === 0) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

      e.preventDefault();
      const currentIndex = selectedItem
        ? items.findIndex((i) => i.id === selectedItem.id)
        : -1;

      if (e.key === 'ArrowDown') {
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        onSelectItem(items[nextIndex]);
      } else if (e.key === 'ArrowUp') {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        onSelectItem(items[prevIndex]);
      }
    },
    [enabled, items, selectedItem, onSelectItem]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}


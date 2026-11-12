import { useState, useMemo } from 'react';
import type { EstadoCumplimiento } from '@/api/types';
import { MOCK_REVISIONES_PENDIENTES, type ConflictReviewItem } from '../mockups/revisiones.mock';
import { revisionService } from '../services/revisionService';

export type ReviewScenarioState =
  | 'pending_4'       // Page 38: 4 items pending, REQ-019 selected
  | 'empty_0'         // Page 39: 0 items pending, Bandeja de revisión al día
  | 'resolved_toast'  // Page 40: 3 items pending (REQ-019 resolved), REQ-022 selected + green toast
  | 'validation_err'  // Page 41: Cumple selected, empty justification red alert
  | 'no_cumple_warn'  // Page 42: No Cumple selected + amber warning banner
  | 'recalculating';  // Page 43: Submitting state ("Recalculando matriz y recomendación...")

export function useHumanReview(licitacionId = 'LP-MIN-001-2026', initialScenario: ReviewScenarioState = 'pending_4') {
  const [scenario, setScenario] = useState<ReviewScenarioState>(initialScenario);
  const [items, setItems] = useState<ConflictReviewItem[]>(MOCK_REVISIONES_PENDIENTES);
  const [selectedId, setSelectedId] = useState<string>('rev-019');
  const [filterType, setFilterType] = useState<'todos' | 'habilitantes' | 'tecnicos'>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(
    initialScenario === 'resolved_toast'
      ? 'Decisión guardada y recomendación actualizada.'
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(initialScenario === 'recalculating');

  const effectiveItems = useMemo(() => {
    if (scenario === 'empty_0') return [];
    if (scenario === 'resolved_toast') {
      return items.filter((i) => i.codigo !== 'REQ-019');
    }
    return items;
  }, [items, scenario]);

  const filteredItems = useMemo(() => {
    if (filterType === 'habilitantes') {
      return effectiveItems.filter((i) => i.es_habilitante);
    }
    if (filterType === 'tecnicos') {
      return effectiveItems.filter((i) => !i.es_habilitante);
    }
    return effectiveItems;
  }, [effectiveItems, filterType]);

  const activeItem = useMemo(() => {
    if (scenario === 'resolved_toast') {
      return effectiveItems.find((i) => i.codigo === 'REQ-022') ?? effectiveItems[0] ?? null;
    }
    return effectiveItems.find((i) => i.id === selectedId) ?? effectiveItems[0] ?? null;
  }, [effectiveItems, selectedId, scenario]);

  const submitResolution = async (estado: EstadoCumplimiento, comentario: string) => {
    if (!activeItem) return;
    setIsSubmitting(true);
    try {
      const res = await revisionService.resolverItem(licitacionId, activeItem.id, {
        estado,
        comentario,
      });
      setItems((prev) => prev.filter((item) => item.id !== activeItem.id));
      setToastMessage(res.mensaje);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyScenarioPreset = (nextScenario: ReviewScenarioState) => {
    setScenario(nextScenario);
    setItems(MOCK_REVISIONES_PENDIENTES);
    if (nextScenario === 'resolved_toast') {
      setSelectedId('rev-022');
      setToastMessage('Resolución guardada. Recomendación recalculada por reglas deterministas (HU-B23).');
      setIsSubmitting(false);
    } else if (nextScenario === 'recalculating') {
      setSelectedId('rev-019');
      setToastMessage(null);
      setIsSubmitting(true);
    } else {
      setSelectedId('rev-019');
      setToastMessage(null);
      setIsSubmitting(false);
    }
  };

  return {
    scenario,
    applyScenarioPreset,
    effectiveItems,
    filteredItems,
    activeItem,
    selectedId,
    setSelectedId,
    filterType,
    setFilterType,
    toastMessage,
    setToastMessage,
    isSubmitting,
    submitResolution,
  };
}


import React from 'react';
import { render, screen } from '@testing-library/react';
import { GapsPriorityList } from '../components/GapsPriorityList';
import { MOCK_ITEMS_MATRIZ } from '../mockups/matrizResultado.mock';
import { sortGapsHabilitantesFirst } from '../utils/sortGapsHabilitantesFirst';

describe('GapsPriorityList — Ordenamiento de Brechas Habilitantes Primero (HU-F08)', () => {
  it('ordena las brechas colocando siempre la categoría habilitante en primer lugar', () => {
    const sorted = sortGapsHabilitantesFirst(MOCK_ITEMS_MATRIZ);
    expect(sorted.length).toBeGreaterThan(0);
    expect(sorted[0].categoria).toBe('habilitante');

    render(<GapsPriorityList items={MOCK_ITEMS_MATRIZ} onSelectGap={jest.fn()} />);
    expect(screen.getByText(/REQ-018/i)).toBeInTheDocument();
  });
});


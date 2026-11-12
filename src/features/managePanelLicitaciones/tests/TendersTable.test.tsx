import React from 'react';
import { render, screen } from '@testing-library/react';
import { TendersTable } from '../components/TendersTable';
import { MOCK_PORTAFOLIO_LICITACIONES } from '../mockups/licitacionesList.mock';

describe('TendersTable (HU-F14 — Portafolio Activo)', () => {
  it('renderiza las licitaciones de la organización con su estado y recomendación accesible', () => {
    render(
      <TendersTable
        items={MOCK_PORTAFOLIO_LICITACIONES}
        visualState="default"
        searchQuery=""
        onOpenTender={jest.fn()}
        onNewTenderClick={jest.fn()}
        onClearFilters={jest.fn()}
        onRetryConnection={jest.fn()}
      />
    );

    expect(screen.getByText('LP-MIN-001-2026')).toBeInTheDocument();
    expect(screen.getByText('Ministerio de Transporte')).toBeInTheDocument();
    expect(screen.getAllByText(/Ver Matriz y Pliego/i).length).toBeGreaterThan(0);
  });

  it('renderiza EmptyState orientativo cuando no hay licitaciones registradas (Pág. 20)', () => {
    render(
      <TendersTable
        items={[]}
        visualState="empty"
        searchQuery=""
        onOpenTender={jest.fn()}
        onNewTenderClick={jest.fn()}
        onClearFilters={jest.fn()}
        onRetryConnection={jest.fn()}
      />
    );

    expect(
      screen.getByText(/No hay licitaciones registradas en este espacio/i)
    ).toBeInTheDocument();
  });
});


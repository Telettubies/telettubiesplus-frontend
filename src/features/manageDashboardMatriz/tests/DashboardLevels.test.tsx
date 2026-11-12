import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendationHeroCard } from '../components/RecommendationHeroCard';
import { MatrixAndGapsContainer } from '../components/MatrixAndGapsContainer';
import { MOCK_RESULTADO_LICITACION } from '../mockups/matrizResultado.mock';

describe('DashboardLevels — 3 Niveles de Divulgación Progresiva (HU-F07, HU-F08, HU-F09)', () => {
  it('renderiza Nivel 1 (Veredicto y Cobertura 52/52) y Nivel 2/3 en la Matriz de Cobertura', () => {
    const onSelect = jest.fn();

    render(
      <div>
        <RecommendationHeroCard resultado={MOCK_RESULTADO_LICITACION} />
        <MatrixAndGapsContainer
          items={MOCK_RESULTADO_LICITACION.items}
          selectedItem={MOCK_RESULTADO_LICITACION.items[3]}
          onSelectItem={onSelect}
        />
      </div>
    );

    // Nivel 1
    expect(screen.getByText(/100% Cobertura/i)).toBeInTheDocument();
    expect(screen.getByText(/52 \/ 52 Secciones Auditadas/i)).toBeInTheDocument();

    // Nivel 2: Tabla e interacción con fila REQ-014
    const rowReq14 = screen.getByTestId('matrix-row-REQ-014');
    fireEvent.click(rowReq14);
    expect(onSelect).toHaveBeenCalled();
  });
});


import React from 'react';
import { render, screen } from '@testing-library/react';
import { ComplianceBadge } from '../components/badges/ComplianceBadge';
import { RecommendationBadge } from '../components/badges/RecommendationBadge';
import { CategoryBadge } from '../components/badges/CategoryBadge';

describe('Accesibilidad de Badges (ISO/IEC 25010 — Color + Ícono + Texto)', () => {
  it('renderiza ComplianceBadge con etiqueta textual e ícono accesible para los 4 estados', () => {
    const { rerender } = render(<ComplianceBadge estado="cumple" />);
    expect(screen.getAllByText(/Cumple/i).length).toBeGreaterThan(0);

    rerender(<ComplianceBadge estado="cumple_parcialmente" />);
    expect(screen.getAllByText(/Cumple Parcial|Parcial/i).length).toBeGreaterThan(0);

    rerender(<ComplianceBadge estado="no_cumple" />);
    expect(screen.getAllByText(/No Cumple/i).length).toBeGreaterThan(0);

    rerender(<ComplianceBadge estado="revision" />);
    expect(screen.getAllByText(/Revisión/i).length).toBeGreaterThan(0);
  });

  it('renderiza RecommendationBadge con texto visible obligatorio en los 4 veredictos', () => {
    const { rerender } = render(<RecommendationBadge recomendacion="presentarse" />);
    expect(screen.getAllByText(/PRESENTARSE/i).length).toBeGreaterThan(0);

    rerender(<RecommendationBadge recomendacion="presentarse_con_riesgo" />);
    expect(screen.getAllByText(/RIESGO/i).length).toBeGreaterThan(0);

    rerender(<RecommendationBadge recomendacion="no_presentarse" />);
    expect(screen.getAllByText(/NO PRESENTARSE/i).length).toBeGreaterThan(0);

    rerender(<RecommendationBadge recomendacion="condicionada" />);
    expect(screen.getAllByText(/CONDICIONADA/i).length).toBeGreaterThan(0);
  });

  it('renderiza CategoryBadge con etiqueta legible', () => {
    render(<CategoryBadge categoria="habilitante" />);
    expect(screen.getAllByText(/Habilitante/i).length).toBeGreaterThan(0);
  });
});

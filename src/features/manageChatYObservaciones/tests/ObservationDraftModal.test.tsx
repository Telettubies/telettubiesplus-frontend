import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ObservationDraftModal } from '../components/ObservationDraftModal';

describe('ObservationDraftModal — Generador de Observaciones y Aviso SECOP II (HU-F13)', () => {
  it('renderiza el borrador formal estructurado, botón de copiar al portapapeles y aviso obligatorio de no envío automático', () => {
    render(<ObservationDraftModal />);

    expect(
      screen.getByText(/Señores Ministerio de Transporte - Comité Evaluador/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El sistema no envía observaciones a la entidad/i)
    ).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', {
      name: /Copiar Borrador al Portapapeles/i,
    });
    fireEvent.click(copyBtn);

    expect(screen.getByText(/\[Copiado al Portapapeles\]/i)).toBeInTheDocument();
  });
});


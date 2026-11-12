import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewDecisionForm } from '../components/ReviewDecisionForm';

describe('ReviewDecisionForm — Comentario Obligatorio y Trazabilidad (HU-F11)', () => {
  it('mantiene el botón de confirmar deshabilitado mientras el comentario obligatorio está vacío y lo habilita al escribir justificación', () => {
    const onConfirm = jest.fn();

    render(<ReviewDecisionForm esHabilitante={true} onConfirm={onConfirm} />);

    const submitButton = screen.getByRole('button', {
      name: /Confirmar Resolución y Recalcular Decisión/i,
    });
    expect(submitButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(
      /Explique por qué se aprueba o rechaza el requisito/i
    );
    fireEvent.change(textarea, {
      target: { value: 'Se verifica experiencia en hoja de vida adjunta.' },
    });

    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);
    expect(onConfirm).toHaveBeenCalledWith(
      'cumple',
      'Se verifica experiencia en hoja de vida adjunta.'
    );
  });

  it('muestra advertencia cuando marcar No Cumple en un habilitante altera la recomendación general a NO PRESENTARSE (Pág. 42)', () => {
    render(
      <ReviewDecisionForm
        esHabilitante={true}
        initialDecision="no_cumple"
        initialComment="No cumple leasing financiero."
        onConfirm={jest.fn()}
      />
    );

    expect(
      screen.getByText(/alterará automáticamente la recomendación general del proceso a 'NO PRESENTARSE'/i)
    ).toBeInTheDocument();
  });
});


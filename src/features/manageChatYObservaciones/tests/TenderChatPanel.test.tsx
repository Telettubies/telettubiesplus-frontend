import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenderChatPanel } from '../components/TenderChatPanel';

describe('TenderChatPanel — Asistente Legal con Numerales Clicables y Cuota 429 (HU-F12)', () => {
  it('renderiza respuestas con numerales clicables hacia el visor PDF y cuota diaria disponible', () => {
    const onJump = jest.fn();
    render(<TenderChatPanel onJumpToPdfPage={onJump} />);

    expect(screen.getByText(/Consultas disponibles hoy: 18 \/ 30/i)).toBeInTheDocument();

    const numeralBtn = screen.getByRole('button', {
      name: /\[Ver Numeral 2\.3\.1 \(Pág\. 11\)\]/i,
    });
    fireEvent.click(numeralBtn);
    expect(onJump).toHaveBeenCalledWith(11, 'Numeral 2.3.1');
  });

  it('muestra alerta clara cuando se alcanza el límite de solicitudes HTTP 429 (Pág. 47)', () => {
    render(<TenderChatPanel externalScenario="rate_limit_429" />);
    expect(screen.getByText(/Código 429/i)).toBeInTheDocument();
  });
});


import React from 'react';
import { render, screen } from '@testing-library/react';
import { HighlightOverlayLayer } from '../components/HighlightOverlayLayer';
import { MOCK_UBICACIONES_PDF } from '../mockups/ubicacionesPdf.mock';

describe('HighlightOverlayLayer — Cálculo de coordenadas relativas (RF-26 / HU-F10)', () => {
  it('transforma coordenadas normalizadas (0..1) a porcentajes CSS exactos', () => {
    render(<HighlightOverlayLayer ubicacion={MOCK_UBICACIONES_PDF.exacta} reqCode="REQ-014" />);

    const box = screen.getByTestId('pdf-highlight-box');
    expect(box).toHaveStyle({
      left: '5.5%',
      top: '25%',
      width: '89%',
      height: '16%',
    });
  });

  it('degrada elegantemente mostrando aviso sin dibujar cuadros cuando precision === "solo_pagina"', () => {
    render(<HighlightOverlayLayer ubicacion={MOCK_UBICACIONES_PDF.solo_pagina} />);

    expect(screen.queryByTestId('pdf-highlight-box')).toBeNull();
    expect(screen.getByText(/Ubicación aproximada en esta página/i)).toBeInTheDocument();
  });
});


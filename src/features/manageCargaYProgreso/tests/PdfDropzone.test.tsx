import React from 'react';
import { render, screen } from '@testing-library/react';
import { PdfDropzone } from '../components/PdfDropzone';
import { DEFAULT_SELECTED_PDF } from '../hooks/usePdfUpload';

describe('PdfDropzone (HU-F05 — Validación previa en cliente)', () => {
  it('muestra metadatos del PDF seleccionado y opción de caché P-16', () => {
    render(
      <PdfDropzone
        selectedFileMeta={DEFAULT_SELECTED_PDF}
        validationError={null}
        useCache={true}
        onToggleCache={jest.fn()}
        onSelectFile={jest.fn()}
        onStartAnalysis={jest.fn()}
        pipelineStatus="pendiente"
      />
    );

    expect(screen.getByText('Pliego_Condiciones_LP_012_2026.pdf')).toBeInTheDocument();
    expect(screen.getByText('74 páginas')).toBeInTheDocument();
  });

  it('muestra alerta roja accionable cuando se rechaza un archivo inválido o mayor a 40MB (Pág. 29)', () => {
    render(
      <PdfDropzone
        selectedFileMeta={null}
        validationError={{
          valid: false,
          errorTitle:
            'El archivo cargado no es un PDF válido o supera el límite permitido de 40MB.',
          errorSubtext: 'Pliego_Condiciones_LP_031_2026.zip · 52,7 MB · rechazado antes de la carga',
        }}
        useCache={true}
        onToggleCache={jest.fn()}
        onSelectFile={jest.fn()}
        onStartAnalysis={jest.fn()}
        pipelineStatus="pendiente"
      />
    );

    expect(
      screen.getByText(/supera el límite permitido de 40MB/i)
    ).toBeInTheDocument();
  });
});


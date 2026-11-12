import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KnowledgeUploader } from '../components/KnowledgeUploader';
import { EditableKnowledgeRecords } from '../components/EditableKnowledgeRecords';
import { MOCK_CONOCIMIENTO_RECHAZADO_422 } from '../mockups/conocimiento.mock';

describe('KnowledgeUploader y EditableKnowledgeRecords (HU-F04)', () => {
  it('muestra la advertencia de reemplazo atómico y todos los errores de validación por línea y campo en rechazo 422', () => {
    render(
      <KnowledgeUploader
        summary={MOCK_CONOCIMIENTO_RECHAZADO_422}
        visualMode="rejected_422"
        clientError={null}
        onSwitchMode={jest.fn()}
        onFileSelect={jest.fn()}
      />
    );

    expect(
      screen.getByText(/reemplaza la versión completa anterior de forma atómica/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\[Carga Rechazada\]/i)).toBeInTheDocument();
    expect(screen.getByText('valor_contrato_smmlv')).toBeInTheDocument();
    expect(screen.getByText('codigo_unspsc')).toBeInTheDocument();
  });

  it('muestra archivos fuente y permite editar y guardar registros de la base de conocimiento', () => {
    render(<EditableKnowledgeRecords />);

    expect(screen.getByText('Archivos Fuente y Trazabilidad de Origen')).toBeInTheDocument();
    expect(screen.getByText('Información Detallada y Editable de la Organización')).toBeInTheDocument();

    const codeInput = screen.getByLabelText('Código de REC-001') as HTMLInputElement;
    expect(codeInput.value).toBe('CON-2024-C08');

    fireEvent.change(codeInput, { target: { value: 'CON-2026-EDITADO' } });
    expect(codeInput.value).toBe('CON-2026-EDITADO');

    fireEvent.click(screen.getByTestId('save-knowledge-records-btn'));
    expect(screen.getByTestId('knowledge-saved-banner')).toBeInTheDocument();
  });
});


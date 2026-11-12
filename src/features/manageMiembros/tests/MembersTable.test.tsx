import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MembersManagementView } from '../components/MembersManagementView';

describe('MembersTable y Regla S-05 de Único Administrador (HU-F03)', () => {
  it('lista los miembros de Constructora Andina S.A.S. y protege al último administrador activo', () => {
    render(<MembersManagementView />);

    expect(screen.getByText('Mauricio Restrepo')).toBeInTheDocument();
    expect(screen.getByText('Diana Cardona')).toBeInTheDocument();
    expect(
      screen.getByText(/conservar al menos un administrador activo en todo momento/i)
    ).toBeInTheDocument();

    const inviteBtn = screen.getByTestId('invite-member-btn');
    fireEvent.click(inviteBtn);
    expect(screen.getByText(/Invitar Miembro a la Organización/i)).toBeInTheDocument();
  });
});


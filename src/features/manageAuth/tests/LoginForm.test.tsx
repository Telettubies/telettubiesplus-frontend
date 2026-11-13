import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/shared/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';
import { RegisterCompanyForm } from '../components/RegisterCompanyForm';

describe('LoginForm y RegisterCompanyForm (CRITERIO Auth)', () => {
  it('renderiza campos corporativos, logo CRITERIO, botón Google SSO y aviso de sesión expirada cuando initialExpired=true', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm initialExpired={true} />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('CRITERIO')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByTestId('session-expired-banner')).toHaveTextContent(
      /Tu sesión expiró por inactividad|session has expired due to inactivity/i
    );
  });

  it('muestra alerta de credenciales inválidas cuando la contraseña no cumple validación', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^Contraseña$/i);
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(screen.getByTestId('login-submit-button'));
    expect(await screen.findByTestId('login-error-banner')).toBeInTheDocument();
  });

  it('valida los campos obligatorios antes de avanzar entre los 3 pasos de registro', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterCompanyForm />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Registro de Organización en CRITERIO')).toBeInTheDocument();
    // Sin datos obligatorios no se puede avanzar y se muestra el error del campo.
    fireEvent.click(screen.getByTestId('register-step-card-2'));
    expect(screen.getByText('El nombre de la empresa es obligatorio.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nombre o razón social/), { target: { value: 'Constructora Andina S.A.S.' } });
    fireEvent.click(screen.getByTestId('register-step-card-2'));
    expect(screen.getByText('Cuenta del administrador principal')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Mauricio Restrepo' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico corporativo/), { target: { value: 'admin@empresa.com.co' } });
    fireEvent.change(document.getElementById('reg-admin-pass')!, { target: { value: 'Password123!' } });
    fireEvent.change(document.getElementById('reg-admin-confirm')!, { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByTestId('register-step-card-3'));
    expect(screen.getByText('Revise y confirme los datos de su organización')).toBeInTheDocument();
  });
});


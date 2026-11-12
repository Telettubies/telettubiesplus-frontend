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
      /session has expired due to inactivity/i
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

  it('permite navegar de forma fluida entre los 4 pasos de registro de empresa', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterCompanyForm />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Registro de Organización en CRITERIO')).toBeInTheDocument();
    expect(screen.getByText('Información general de su organización')).toBeInTheDocument();

    // Navegar directamente haciendo clic en las cards de pasos
    fireEvent.click(screen.getByTestId('register-step-card-2'));
    expect(screen.getByText('Cuenta del administrador principal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('register-step-card-3'));
    expect(screen.getByText('Perfil licitatorio y preferencias de análisis')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('register-step-card-4'));
    expect(screen.getByText('Revise y confirme los datos de su organización')).toBeInTheDocument();
  });
});


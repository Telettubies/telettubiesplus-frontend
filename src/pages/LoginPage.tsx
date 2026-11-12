import React from 'react';
import { LoginForm } from '@/features/manageAuth/components/LoginForm';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

export const LoginPage: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Error en Inicio de Sesión">
      <LoginForm />
    </ErrorBoundary>
  );
};


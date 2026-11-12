import React from 'react';
import { RegisterCompanyForm } from '@/features/manageAuth/components/RegisterCompanyForm';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

export const RegisterCompanyPage: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Error en Registro de Organización">
      <RegisterCompanyForm />
    </ErrorBoundary>
  );
};


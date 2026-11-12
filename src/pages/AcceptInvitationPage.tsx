import React from 'react';
import { AcceptInviteForm } from '@/features/manageAuth/components/AcceptInviteForm';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

export const AcceptInvitationPage: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Error en Aceptación de Invitación">
      <AcceptInviteForm />
    </ErrorBoundary>
  );
};


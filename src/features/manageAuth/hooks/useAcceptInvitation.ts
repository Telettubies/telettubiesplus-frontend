import { useState, useMemo, useCallback } from 'react';
import { validateEnterprisePassword } from '../utils/authValidators';
import { MOCK_INVITATION_METADATA } from '../mockups/auth.mock';
import { useAuth, DEMO_REVISOR_PROFILE } from '@/shared/hooks/useAuth';

export type InvitationScreenState =
  | 'default'
  | 'weak_password'
  | 'expired_link'
  | 'provisioning'
  | 'configured';

export function useAcceptInvitation() {
  const { loginWithProfile } = useAuth();
  const [fullName, setFullName] = useState('Laura Gómez');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [screenState, setScreenState] = useState<InvitationScreenState>('default');

  const validation = useMemo(
    () => validateEnterprisePassword(password, confirmPassword),
    [password, confirmPassword]
  );

  const handleSubmitInvitation = useCallback(
    async (onCompletedRedirect?: () => void) => {
      if (screenState === 'expired_link') return;

      if (!validation.isValid) {
        setScreenState('weak_password');
        return;
      }

      setScreenState('provisioning');
      await new Promise((res) => setTimeout(res, 450));
      setScreenState('configured');
      loginWithProfile(
        {
          ...DEMO_REVISOR_PROFILE,
          nombre: fullName || DEMO_REVISOR_PROFILE.nombre,
        },
        'jwt-invited-revisor-token'
      );
      if (onCompletedRedirect) {
        setTimeout(onCompletedRedirect, 550);
      }
    },
    [fullName, loginWithProfile, screenState, validation.isValid]
  );

  return {
    metadata: MOCK_INVITATION_METADATA,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validation,
    screenState,
    setScreenState,
    handleSubmitInvitation,
  };
}


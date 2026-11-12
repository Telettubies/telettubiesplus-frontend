import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { useAuth, DEMO_ADMIN_PROFILE, DEMO_REVISOR_PROFILE } from '@/shared/hooks/useAuth';

export type LoginVisualState =
  | 'default'
  | 'verifying'
  | 'connecting_idp'
  | 'invalid_credentials'
  | 'session_expired';

export function useLogin(initialExpired = false) {
  const { loginWithProfile } = useAuth();
  const [email, setEmail] = useState('admin@constructoraandina.com.co');
  const [password, setPassword] = useState('Password123!');
  const [visualState, setVisualState] = useState<LoginVisualState>(
    initialExpired ? 'session_expired' : 'default'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitLogin = useCallback(
    async (onSuccessRedirect?: () => void) => {
      setVisualState('verifying');
      setErrorMessage(null);
      try {
        const result = await authService.signInWithEmail(email, password);
        loginWithProfile(result.profile, result.token);
        onSuccessRedirect?.();
      } catch (err: any) {
        setVisualState('invalid_credentials');
        setErrorMessage(
          err?.message ||
            'Invalid credentials or unauthorized organization domain. Please contact your company administrator.'
        );
      }
    },
    [email, password, loginWithProfile]
  );

  const quickDemoLogin = useCallback(
    (role: 'administrador' | 'revisor', onSuccessRedirect?: () => void) => {
      const profile = role === 'administrador' ? DEMO_ADMIN_PROFILE : DEMO_REVISOR_PROFILE;
      loginWithProfile(profile, 'jwt-demo-token');
      onSuccessRedirect?.();
    },
    [loginWithProfile]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    visualState,
    setVisualState,
    errorMessage,
    submitLogin,
    quickDemoLogin,
  };
}


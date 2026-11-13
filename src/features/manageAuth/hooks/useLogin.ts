import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { useState, useCallback, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { useAuth, DEMO_ADMIN_PROFILE, DEMO_REVISOR_PROFILE } from '@/shared/hooks/useAuth';

export type LoginVisualState = 'default' | 'verifying' | 'connecting_idp' | 'invalid_credentials' | 'session_expired';

export function useLogin(initialExpired = false) {
  const { loginWithProfile, reloadIdentity, accessToken, isLoading } = useAuth();
  const [email, setEmail] = useState(shouldUseMock() ? 'admin@constructoraandina.com.co' : '');
  const [password, setPassword] = useState(shouldUseMock() ? 'Password123!' : '');
  const [visualState, setVisualState] = useState<LoginVisualState>(initialExpired ? 'session_expired' : 'default');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busy = useRef(false);
  const pendingRedirect = useRef<(() => void) | null>(null);

  // Esperar la sesión y la identidad antes de entrar a las rutas privadas.
  useEffect(() => {
    if (!shouldUseMock() && accessToken && !isLoading && pendingRedirect.current) {
      const redirect = pendingRedirect.current;
      pendingRedirect.current = null;
      busy.current = false;
      setIsSubmitting(false);
      redirect();
    }
  }, [accessToken, isLoading, visualState]);

  const submitLogin = useCallback(async (onSuccessRedirect?: () => void) => {
    if (busy.current) return;
    busy.current = true;
    setIsSubmitting(true);
    setVisualState('verifying');
    setErrorMessage(null);
    setNotice(null);
    try {
      const result = await authService.signInWithEmail(email, password);
      if (result.profile) {
        loginWithProfile(result.profile, result.token);
        busy.current = false;
        setIsSubmitting(false);
        onSuccessRedirect?.();
      } else {
        pendingRedirect.current = onSuccessRedirect || (() => setVisualState('default'));
        reloadIdentity?.();
      }
    } catch (error) {
      pendingRedirect.current = null;
      busy.current = false;
      setIsSubmitting(false);
      setVisualState('invalid_credentials');
      setErrorMessage((error as Error).message || 'No se pudo iniciar sesión.');
    }
  }, [email, password, loginWithProfile, reloadIdentity]);

  const quickDemoLogin = useCallback((role: 'administrador' | 'revisor', onSuccessRedirect?: () => void) => {
    if (!shouldUseMock()) return;
    loginWithProfile(role === 'administrador' ? DEMO_ADMIN_PROFILE : DEMO_REVISOR_PROFILE, 'jwt-demo-token');
    onSuccessRedirect?.();
  }, [loginWithProfile]);

  const signInWithGoogle = async (onSuccessRedirect?: () => void, redirectPath?: string) => {
    if (busy.current) return;
    if (shouldUseMock()) { quickDemoLogin('administrador', onSuccessRedirect); return; }
    busy.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);
    setVisualState('connecting_idp');
    try { await authService.signInWithGoogle(redirectPath); }
    catch (error) { setErrorMessage((error as Error).message || 'No se pudo conectar con Google.'); setVisualState('invalid_credentials'); }
    finally { busy.current = false; setIsSubmitting(false); }
  };

  const resetPassword = async () => {
    if (shouldUseMock()) { setVisualState('session_expired'); return; }
    if (busy.current) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErrorMessage('Ingresa tu correo para recibir el enlace de recuperación.'); return; }
    busy.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);
    try {
      await authService.resetPassword(email);
      setVisualState('default');
      setNotice('Si el correo tiene una cuenta, recibirás un enlace para cambiar la contraseña.');
    } catch (error) { setErrorMessage((error as Error).message || 'No se pudo solicitar la recuperación.'); }
    finally { busy.current = false; setIsSubmitting(false); }
  };

  return { email, setEmail, password, setPassword, visualState, setVisualState, errorMessage, notice, isSubmitting, submitLogin, quickDemoLogin, signInWithGoogle, resetPassword };
}

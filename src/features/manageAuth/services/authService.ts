import { createClient } from '@supabase/supabase-js';
import { getEnvVar, shouldUseMock } from '@/shared/utils/mockSwitch';
import { MOCK_USERS } from '../mockups/auth.mock';
import { registerDemoAccount, signInDemoAccount } from './mockAccounts';
import type { PerfilMiembro } from '@/api/types';

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')?.trim() || 'https://org-co-8001.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')?.trim() || 'public-anon-key-placeholder';
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Solo lo que se persiste: el nombre de la organización (organizaciones.nombre) y la cuenta de
// Supabase Auth (correo, contraseña y nombre en user_metadata).
export interface RegistrationInput {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
}
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function requireConfiguration() {
  if (!getEnvVar('VITE_SUPABASE_URL')?.trim() || !getEnvVar('VITE_SUPABASE_ANON_KEY')?.trim()) throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el frontend para usar una cuenta real.');
}
function readableError(error: unknown): Error {
  const value = error as { code?: string; message?: string };
  const messages: Record<string, string> = {
    invalid_credentials: 'Correo o contraseña incorrectos.',
    email_not_confirmed: 'Confirma tu correo electrónico antes de iniciar sesión.',
    user_already_exists: 'Este correo ya tiene una cuenta. Inicia sesión.',
    signup_disabled: 'El registro de cuentas está deshabilitado en Supabase. Contacta al administrador.',
    provider_disabled: 'Este proveedor de acceso no está habilitado en Supabase.',
    over_email_send_rate_limit: 'Se alcanzó el límite de correos. Espera unos minutos antes de intentarlo de nuevo.',
    over_request_rate_limit: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
    email_provider_disabled: 'El registro con correo está deshabilitado en Supabase. Activa el proveedor Email en Authentication → Sign In / Providers.',
    email_address_invalid: 'El correo electrónico no es válido.',
    email_address_not_authorized: 'Supabase no puede enviar correos a esta dirección con su servidor de correo por defecto. Usa un correo del equipo del proyecto, configura un SMTP propio o desactiva "Confirm email" en Supabase.',
    weak_password: 'La contraseña es demasiado débil según la política de Supabase.',
    same_password: 'La nueva contraseña debe ser distinta de la anterior.',
    user_banned: 'Esta cuenta está bloqueada. Contacta al administrador.',
  };
  if (value.message?.toLowerCase().includes('fetch')) return new Error('No se pudo conectar con Supabase. Revisa su URL y tu conexión.');
  return new Error(messages[value.code || ''] || value.message || 'No se pudo completar la autenticación.');
}
export const authService = {
  async signInWithEmail(email: string, password: string): Promise<{ token: string; profile: PerfilMiembro | null }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) throw new Error('Ingresa tu correo y contraseña.');
    if (!EMAIL_PATTERN.test(cleanEmail)) throw new Error('Ingresa un correo electrónico válido.');
    if (shouldUseMock('VITE_MOCK_AUTH')) {
      const custom = await signInDemoAccount(cleanEmail, password);
      const matched = MOCK_USERS[cleanEmail];
      const profile = custom || (matched && (password === matched.password || password === 'demo') ? matched.profile : null);
      if (!profile) throw new Error('Correo o contraseña incorrectos.');
      return { token: 'jwt-demo-token', profile };
    }
    requireConfiguration();
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) throw error;
      if (!data.session) throw new Error('No se recibió una sesión. Confirma tu correo e inténtalo de nuevo.');
      return { token: data.session.access_token, profile: null };
    } catch (error) { throw readableError(error); }
  },

  async signUp(input: RegistrationInput): Promise<{ profile: PerfilMiembro | null; requiresEmailConfirmation: boolean }> {
    const email = input.email.trim().toLowerCase();
    if (shouldUseMock('VITE_MOCK_AUTH')) {
      const id = crypto.randomUUID();
      const name = input.adminName.trim();
      const profile: PerfilMiembro = {
        id: `mem-${id}`, user_id: `usr-${id}`, nombre: name,
        iniciales: name.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || '').join(''),
        correo: email, rol: 'administrador', organizacion_id: `org-${id}`,
        organizacion_nombre: input.companyName.trim(), organizacion_nit: '', tenant_codigo: `DEMO-${id.slice(0, 8)}`,
      };
      await registerDemoAccount(profile, input.password);
      return { profile, requiresEmailConfirmation: false };
    }
    requireConfiguration();
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email, password: input.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
          // Información de perfil, nunca permisos ni membresías autorizadas.
          data: { full_name: input.adminName.trim(), company_name: input.companyName.trim() },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('No se pudo crear la cuenta. Inténtalo de nuevo.');
      // Con confirmación de correo activa, Supabase no revela si el correo ya existía: devuelve un
      // usuario sin identidades.
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error('Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.');
      return { profile: null, requiresEmailConfirmation: !data.session };
    } catch (error) { throw readableError(error); }
  },

  async signInWithGoogle(redirectPath = '/licitaciones'): Promise<void> {
    requireConfiguration();
    const redirectTo = new URL('/login', window.location.origin);
    redirectTo.searchParams.set('redirect', redirectPath);
    const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo.href } });
    if (error) throw readableError(error);
  },

  async resetPassword(email: string): Promise<void> {
    requireConfiguration();
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/invitacion?recovery=1` });
    if (error) throw readableError(error);
  },

  async signOut(): Promise<void> {
    if (!shouldUseMock('VITE_MOCK_AUTH')) {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw readableError(error);
    }
  },
};

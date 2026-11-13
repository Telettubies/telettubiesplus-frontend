import type { PerfilMiembro } from '@/api/types';
import { MOCK_USERS } from '../mockups/auth.mock';

// Cuentas exclusivas de la demo. Nunca se utilizan para autenticar llamadas reales.
const storageKey = 'criterio_demo_accounts_v1';
interface DemoAccount { profile: PerfilMiembro; salt: string; passwordHash: string }
function accounts(): DemoAccount[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(value) ? value.filter(account => account?.profile?.correo && typeof account.salt === 'string' && typeof account.passwordHash === 'string') : [];
  } catch { return []; }
}
async function passwordHash(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 210000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function registerDemoAccount(profile: PerfilMiembro, password: string): Promise<void> {
  const email = profile.correo.toLowerCase();
  const saved = accounts();
  if (MOCK_USERS[email] || saved.some(account => account.profile.correo === email)) throw new Error('Este correo ya está registrado en la demo. Inicia sesión.');
  const salt = crypto.randomUUID();
  saved.push({ profile, salt, passwordHash: await passwordHash(password, salt) });
  localStorage.setItem(storageKey, JSON.stringify(saved));
}
export async function signInDemoAccount(email: string, password: string): Promise<PerfilMiembro | null> {
  const account = accounts().find(saved => saved.profile.correo === email);
  if (!account || await passwordHash(password, account.salt) !== account.passwordHash) return null;
  return account.profile;
}

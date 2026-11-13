import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/shared/hooks/useAuth';
import { services } from '../services';
import { supabaseClient } from '@/features/manageAuth/services/authService';
jest.mock('../services', () => ({ services: { identity: jest.fn() } }));
jest.mock('@/features/manageAuth/services/authService', () => ({ supabaseClient: { auth: { getSession: jest.fn(), onAuthStateChange: jest.fn(), signOut: jest.fn() } } }));
const auth = supabaseClient.auth as jest.Mocked<typeof supabaseClient.auth>;
const identity = services.identity as jest.Mock;
const member = (id: string) => ({ id, organizacion_id: id, usuario_id: 'user-real', email: 'real@example.com', rol: 'revisor', invitacion_pendiente: false, creado_en: '2026-11-13T00:00:00Z' });
const wrapper = ({ children }: {
    children: React.ReactNode;
}) => <AuthProvider>{children}</AuthProvider>;
let previous: string | undefined;
beforeEach(() => {
    previous = process.env.VITE_USE_MOCKS;
    process.env.VITE_USE_MOCKS = 'false';
    sessionStorage.clear();
    jest.clearAllMocks();
    auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } } as any);
    auth.signOut.mockResolvedValue({ error: null });
});
afterEach(() => { if (previous === undefined)
    delete process.env.VITE_USE_MOCKS;
else
    process.env.VITE_USE_MOCKS = previous; });
it('sin sesión real no concede perfil, token ni rol de demo', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(identity).not.toHaveBeenCalled();
});
it('varias membresías requieren elegir una devuelta por el servidor', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { access_token: 'real-test', user: { id: 'user-real' } } }, error: null } as any);
    identity.mockResolvedValue({ usuario_id: 'user-real', email: 'real@example.com', membresias: [member('org-a'), member('org-b')] });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.memberships).toHaveLength(2));
    expect(result.current.user).toBeNull();
    act(() => result.current.chooseOrganization?.('org-inventada'));
    expect(result.current.user).toBeNull();
    act(() => result.current.chooseOrganization?.('org-b'));
    expect(result.current.user?.organizacion_id).toBe('org-b');
    expect(result.current.user?.rol).toBe('revisor');
    act(() => result.current.switchDemoRole('administrador'));
    expect(result.current.user?.rol).toBe('revisor');
    expect(sessionStorage.getItem('tc_supabase_access_token')).toBeNull();
});
it('una sola membresía entra directamente y salir llama al SDK', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { access_token: 'real-test', user: { id: 'user-real' } } }, error: null } as any);
    identity.mockResolvedValue({ usuario_id: 'user-real', email: 'real@example.com', membresias: [member('org-a')] });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.organizacion_id).toBe('org-a'));
    await act(async () => result.current.logout());
    expect(auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
});

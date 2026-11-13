import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PerfilMiembro, RolOrganizacion } from '@/api/types';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { RealAuthProvider } from '@/features/connected/RealAuthProvider';
import type { Member } from '@/api/backend';
import { setTokenProvider } from '@/api/interceptors';

export const DEMO_ADMIN_PROFILE: PerfilMiembro = {
  id: 'mem-admin-01',
  user_id: 'usr-supabase-001',
  nombre: 'Mauricio Restrepo',
  iniciales: 'MR',
  correo: 'admin@constructoraandina.com.co',
  rol: 'administrador',
  organizacion_id: 'org-co-8001',
  organizacion_nombre: 'Constructora Andina S.A.S.',
  organizacion_nit: 'NIT 900.342.112-4',
  tenant_codigo: 'ORG-CO-8001',
};

export const DEMO_REVISOR_PROFILE: PerfilMiembro = {
  id: 'mem-rev-02',
  user_id: 'usr-supabase-002',
  nombre: 'Laura Gómez',
  iniciales: 'LG',
  correo: 'laura.gomez@constructoraandina.com.co',
  rol: 'revisor',
  organizacion_id: 'org-co-8001',
  organizacion_nombre: 'Constructora Andina S.A.S.',
  organizacion_nit: 'NIT 900.342.112-4',
  tenant_codigo: 'ORG-CO-8001',
};

export type TransversalOverlayState =
  | null
  | 'session_expired_401'
  | 'resource_404'
  | 'worker_interrupted_503'
  | 'offline_readonly';

export interface AuthContextValue {
  memberships?: Member[];
  chooseOrganization?: (id:string)=>void;
  authError?: string | null;
  reloadIdentity?: ()=>void;
  user: PerfilMiembro | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  transversalModal: TransversalOverlayState;
  setTransversalModal: (state: TransversalOverlayState) => void;
  loginWithProfile: (profile: PerfilMiembro, token?: string) => void;
  switchDemoRole: (rol: RolOrganizacion) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_USER_KEY = 'tc_active_profile_v1';
const STORAGE_TOKEN_KEY = 'tc_supabase_access_token';
const STORAGE_UNAUTH_KEY = 'tc_explicit_unauth';

const DemoAuthProvider: React.FC<{
  children: React.ReactNode;
  initialAuthenticated?: boolean;
  initialRole?: RolOrganizacion;
}> = ({ children, initialAuthenticated = true, initialRole = 'administrador' }) => {
  const [user, setUser] = useState<PerfilMiembro | null>(() => {
    if (!initialAuthenticated) return null;
    if (typeof window !== 'undefined') {
      if (window.sessionStorage.getItem(STORAGE_UNAUTH_KEY) === 'true') {
        return null;
      }
      const saved = window.sessionStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        try {
          return JSON.parse(saved) as PerfilMiembro;
        } catch {
          // ignore
        }
      }
    }
    return initialRole === 'revisor' ? DEMO_REVISOR_PROFILE : DEMO_ADMIN_PROFILE;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (!initialAuthenticated) return null;
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(STORAGE_UNAUTH_KEY) === 'true') {
      return null;
    }
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.supabase-session-jwt-org-co-8001';
  });

  const [isLoading] = useState(false);
  const [transversalModal, setTransversalModal] = useState<TransversalOverlayState>(null);

  useEffect(() => {
    setTokenProvider(() => accessToken);
  }, [accessToken]);

  const loginWithProfile = useCallback((profile: PerfilMiembro, token = 'jwt-supabase-verified-token') => {
    setUser(profile);
    setAccessToken(token);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_UNAUTH_KEY);
      window.sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
      window.sessionStorage.setItem(STORAGE_TOKEN_KEY, token);
    }
  }, []);

  const switchDemoRole = useCallback((rol: RolOrganizacion) => {
    const nextProfile = rol === 'administrador' ? DEMO_ADMIN_PROFILE : DEMO_REVISOR_PROFILE;
    setUser(nextProfile);
    setAccessToken('jwt-supabase-verified-token');
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_UNAUTH_KEY);
      window.sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextProfile));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_UNAUTH_KEY, 'true');
      window.sessionStorage.removeItem(STORAGE_USER_KEY);
      window.sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        transversalModal,
        setTransversalModal,
        loginWithProfile,
        switchDemoRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de un <AuthProvider>');
  }
  return ctx;
}


export const AuthProvider: React.FC<React.ComponentProps<typeof DemoAuthProvider>> = (props) => shouldUseMock() ? <DemoAuthProvider {...props} /> : <RealAuthProvider>{props.children}</RealAuthProvider>;

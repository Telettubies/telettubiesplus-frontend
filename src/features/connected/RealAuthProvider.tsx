import React, { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from '@/shared/hooks/useAuth';
import type { TransversalOverlayState } from '@/shared/hooks/useAuth';
import type { PerfilMiembro } from '@/api/types';
import type { Identity } from '@/api/backend';
import { supabaseClient } from '@/features/manageAuth/services/authService';
import { setOrganizationProvider, setTokenProvider, setUnauthorizedRedirectHandler } from '@/api/interceptors';
import { services } from './services';
import { clearConnectedPdfCache } from './pdfTransport';
const selectionKey = 'criterio_organization';
export const RealAuthProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [identity, setIdentity] = useState<Identity | null>(null);
    const [selected, setSelected] = useState(() => sessionStorage.getItem(selectionKey) || '');
    const [isLoading, setLoading] = useState(true);
    const [authReady, setAuthReady] = useState(false);
    const [authError, setError] = useState<string | null>(null);
    const [revision, reload] = useState(0);
    const [transversalModal, setTransversalModal] = useState<TransversalOverlayState>(null);
    const orgRef = useRef<string | null>(null);
    const sessionTokenRef = useRef<string | null>(null);
    const member = identity?.membresias.length === 1 ? identity.membresias[0] : identity?.membresias.find(m => m.organizacion_id === selected);
    orgRef.current = identity && identity.membresias.length > 1 && member ? member.organizacion_id : null;
    const user: PerfilMiembro | null = member ? {
        id: member.id, user_id: member.usuario_id, nombre: member.email, iniciales: member.email.slice(0, 2).toUpperCase(), correo: member.email, rol: member.rol,
        organizacion_id: member.organizacion_id, organizacion_nombre: member.organizacion_nombre || 'Mi organización', organizacion_nit: '', tenant_codigo: member.organizacion_id,
    } : null;
    useEffect(() => {
        let alive = true;
        setTokenProvider(async () => (await supabaseClient.auth.getSession()).data.session?.access_token || null);
        setOrganizationProvider(() => orgRef.current);
        setUnauthorizedRedirectHandler(() => {
            setSession(null);
            setIdentity(null);
            setError('La sesión ha caducado. Inicia sesión de nuevo.');
            clearConnectedPdfCache();
            void supabaseClient.auth.signOut({ scope: 'local' });
        });
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, next) => {
            if (alive) {
                setAuthReady(true);
                const token = next?.access_token || null;
                if (sessionTokenRef.current !== token) setLoading(!!next);
                sessionTokenRef.current = token;
                setSession(next);
            }
        });
        supabaseClient.auth.getSession().then(({ data, error }) => {
            if (!alive)
                return;
            if (error)
                setError(error.message);
            setAuthReady(true);
            sessionTokenRef.current = data.session?.access_token || null;
            setSession(data.session);
            setLoading(!!data.session);
        }).catch(() => {
            if (alive) {
                setAuthReady(true);
                setError('No se pudo recuperar la sesión.');
                setLoading(false);
            }
        });
        return () => { alive = false; subscription.unsubscribe(); setTokenProvider(() => null); setOrganizationProvider(() => null); };
    }, []);
    useEffect(() => {
        if (!authReady) return;
        let alive = true;
        setIdentity(null);
        setError(null);
        clearConnectedPdfCache();
        if (!session) {
            setLoading(false);
            return;
        }
        setLoading(true);
        services.identity(session.access_token).then(async data => {
            // Registro de empresa: quien se registró con un nombre de empresa y aún no tiene
            // membresía crea su organización y queda como administrador. Los invitados ya tienen
            // membresía y no pasan por aquí.
            const empresa = String(session.user.user_metadata?.company_name || '').trim();
            if (!data.membresias.length && empresa) {
                try {
                    await services.createOrganization(empresa, session.access_token);
                    void supabaseClient.auth.updateUser({ data: { company_name: null } });
                    data = await services.identity(session.access_token);
                }
                catch (e) {
                    if ((e as { status?: number }).status !== 409)
                        throw e;
                    data = await services.identity(session.access_token);
                }
            }
            if (!alive)
                return;
            setIdentity(data);
            if (!data.membresias.length)
                setError('Tu cuenta no tiene una membresía. Solicita acceso al administrador de tu organización.');
        }).catch(e => {
            if (alive)
                setError(e.message || 'No se pudo comprobar la membresía.');
        }).finally(() => {
            if (alive)
                setLoading(false);
        });
        return () => { alive = false; };
    }, [authReady, session?.access_token, revision]);
    const logout = () => {
        setSession(null);
        setIdentity(null);
        sessionTokenRef.current = null;
        setLoading(false);
        setSelected('');
        setError(null);
        sessionStorage.removeItem(selectionKey);
        clearConnectedPdfCache();
        void supabaseClient.auth.signOut().then(({ error }) => {
            if (error)
                setError('No se pudo cerrar la sesión remota. Vuelve a intentarlo.');
        });
    };
    return <AuthContext.Provider value={{ user, accessToken: session?.access_token || null, isLoading, isAuthenticated: !!user, authError,
            memberships: identity?.membresias || [], chooseOrganization: (id) => {
                if (!identity?.membresias.some(m => m.organizacion_id === id))
                    return;
                clearConnectedPdfCache();
                setSelected(id);
                sessionStorage.setItem(selectionKey, id);
            }, reloadIdentity: () => { setLoading(true); reload(n => n + 1); }, transversalModal, setTransversalModal,
            loginWithProfile: () => { void supabaseClient.auth.getSession().then(({ data }) => setSession(data.session)); },
            switchDemoRole: () => { }, logout }}>{children}</AuthContext.Provider>;
};

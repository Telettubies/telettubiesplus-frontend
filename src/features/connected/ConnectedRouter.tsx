import React, { useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { supabaseClient } from '@/features/manageAuth/services/authService';
import { getEnvVar } from '@/shared/utils/mockSwitch';
import { ErrorBox, Loading, useAction } from './common';
import { TenderList, Upload, ProgressPage, KnowledgePage, MembersPage } from './Management';
import { AnalysisPage } from './Analysis';
import './connected.css';
function Access({ invitation = false }: {
    invitation?: boolean;
}) {
    const auth = useAuth();
    const action = useAction();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [done, setDone] = useState(false);
    if (done || auth.user && !invitation) {
        const redirect = new URLSearchParams(location.search).get('redirect');
        return <Navigate to={redirect?.startsWith('/licitaciones') ? redirect : '/licitaciones'} replace/>;
    }
    const configured = !!getEnvVar('VITE_SUPABASE_URL') && !!getEnvVar('VITE_SUPABASE_ANON_KEY');
    return <div className="access card"><img src="/logo criterio.png" alt="CRITERIO" width="48"/><h1>{invitation ? 'Aceptar invitación' : 'Bienvenido a CRITERIO'}</h1>
    <p>{invitation ? 'Define tu contraseña usando el enlace de invitación recibido por correo.' : 'Accede con tu cuenta para revisar las licitaciones de tu organización.'}</p>
    {!configured && <p role="alert" className="notice error">Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para iniciar sesión.</p>}
    <form onSubmit={e => {
            e.preventDefault();
            void action.run(async () => {
                if (invitation) {
                    if (password !== confirm)
                        throw new Error('Las contraseñas no coinciden.');
                    const { data: { session } } = await supabaseClient.auth.getSession();
                    if (!session)
                        throw new Error('El enlace no es válido o ha caducado. Solicita otra invitación.');
                    const { error } = await supabaseClient.auth.updateUser({ password });
                    if (error)
                        throw error;
                    auth.reloadIdentity?.();
                    setDone(true);
                }
                else {
                    const { error } = await supabaseClient.auth.signInWithPassword({ email: email.trim(), password });
                    if (error)
                        throw new Error('No se pudo iniciar sesión. Comprueba tu correo y contraseña.');
                }
            });
        }}>
      {!invitation && <label>Correo<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)}/></label>}
      <label>Contraseña<input type="password" minLength={invitation ? 12 : 1} autoComplete={invitation ? 'new-password' : 'current-password'} required value={password} onChange={e => setPassword(e.target.value)}/></label>
      {invitation && <label>Confirmar contraseña<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e => setConfirm(e.target.value)}/><small>Usa al menos 12 caracteres.</small></label>}
      <ErrorBox error={action.error || auth.authError}/><button className="primary" disabled={action.busy || auth.isLoading || !configured}>{action.busy ? 'Verificando…' : invitation ? 'Guardar contraseña e ingresar' : 'Iniciar sesión'}</button>
    </form>{invitation && <Link to="/login">Volver al inicio de sesión</Link>}
  </div>;
}
export default function ConnectedRouter() {
    const auth = useAuth();
    const location = useLocation();
    if (location.pathname === '/invitacion')
        return <div className="connected"><Access invitation/></div>;
    if (auth.isLoading)
        return <div className="connected"><Loading /></div>;
    if (!auth.user && (auth.memberships?.length || auth.authError && auth.accessToken))
        return <div className="connected"><section className="card access"><h1>Acceso a tu organización</h1><ErrorBox error={auth.authError ? { message: auth.authError } : null}/>
    {auth.memberships?.map(m => <button key={m.id} onClick={() => auth.chooseOrganization?.(m.organizacion_id)}>Organización {m.organizacion_id} · {m.rol}</button>)}
    <button onClick={() => auth.reloadIdentity?.()}>Reintentar</button><button onClick={auth.logout}>Cerrar sesión</button></section></div>;
    if (!auth.user)
        return <div className="connected"><Routes><Route path="/registro" element={<section className="access card"><h1>Acceso por invitación</h1><p>El administrador debe crear la organización y asignarte una membresía antes de acceder.</p><Link to="/login">Iniciar sesión</Link></section>}/><Route path="/login" element={<Access />}/><Route path="*" element={<Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace/>}/></Routes></div>;
    const scope = auth.user.user_id + ':' + auth.user.organizacion_id;
    return <div className="connected"><header className="app-header"><Link className="brand" to="/licitaciones"><img src="/logo criterio.png" alt=""/>CRITERIO</Link><nav><Link to="/licitaciones">Licitaciones</Link><Link to="/licitaciones/nueva">Cargar pliego</Link>{auth.user.rol === 'administrador' && <><Link to="/configuracion/conocimiento">Conocimiento</Link><Link to="/configuracion/miembros">Miembros</Link></>}</nav><div className="account"><span>{auth.user.correo} · {auth.user.rol}</span>{(auth.memberships?.length || 0) > 1 && <label>Organización<select aria-label="Organización" value={auth.user.organizacion_id} onChange={e => auth.chooseOrganization?.(e.target.value)}>{auth.memberships?.map(m => <option key={m.id} value={m.organizacion_id}>{m.organizacion_id}</option>)}</select></label>}<button onClick={auth.logout}>Cerrar sesión</button></div></header>
    <main key={scope} className="workspace"><Routes>
      <Route path="/licitaciones" element={<TenderList />}/><Route path="/licitaciones/nueva" element={<Upload />}/>
      <Route path="/licitaciones/:id/progreso" element={<ProgressPage />}/><Route path="/licitaciones/:id" element={<AnalysisPage />}/><Route path="/licitaciones/:id/visor-enfocado" element={<AnalysisPage />}/>
      <Route path="/configuracion/conocimiento" element={auth.user.rol === 'administrador' ? <KnowledgePage /> : <p role="alert">Esta sección requiere permisos de administrador.</p>}/>
      <Route path="/configuracion/miembros" element={auth.user.rol === 'administrador' ? <MembersPage /> : <p role="alert">Esta sección requiere permisos de administrador.</p>}/>
      <Route path="*" element={<Navigate to="/licitaciones" replace/>}/>
    </Routes></main></div>;
}

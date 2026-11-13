import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { services } from './services';
import { Badge, ErrorBox, Loading, date, useAction, useResource } from './common';
import { useAuth } from '@/shared/hooks/useAuth';
import type { Member, Progress } from '@/api/backend';
const active = (s: string) => s === 'en_cola' || s === 'en_ejecucion';
export function TenderList() {
    const list = useResource(useCallback((signal: AbortSignal) => services.tenders(signal), []));
    const limits = useResource(useCallback((signal: AbortSignal) => services.limits(signal), []));
    const [search, setSearch] = useState('');
    const [state, setState] = useState('');
    const rows = list.data?.filter(t => (!state || t.estado === state) && `${t.titulo} ${t.nombre_archivo}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    return <><div className="section-top"><div><h1>Licitaciones</h1><p className="muted">Retoma los análisis y revisa las recomendaciones de tu organización.</p></div><Link className="button primary" to="/licitaciones/nueva">Cargar pliego</Link></div>
    {limits.data && <p className="notice">Análisis utilizados: {limits.data.analisis.usados} de {limits.data.analisis.cuota} en las últimas {limits.data.ventana_horas} horas.</p>}
    <ErrorBox error={limits.error}/><section className="card"><div className="row"><input aria-label="Buscar licitación" placeholder="Buscar por título o archivo…" value={search} onChange={e => setSearch(e.target.value)}/><select aria-label="Estado" value={state} onChange={e => setState(e.target.value)}><option value="">Todos los estados</option><option value="pendiente">Pendiente</option><option value="procesando">Procesando</option><option value="completada">Completada</option><option value="fallida">Fallida</option></select><button onClick={list.refresh}>Actualizar</button></div>
      <ErrorBox error={list.error}/>{list.loading && <Loading />}{!list.loading && !list.error && !rows?.length && <p className="notice">No hay licitaciones que coincidan. Puedes cargar un primer pliego.</p>}
      {!!rows?.length && <div className="table-wrap"><table><thead><tr><th>Licitación</th><th>Estado</th><th>Recomendación</th><th>Fecha de carga</th><th /></tr></thead><tbody>{rows.map(t => <tr key={t.id}><td><strong>{t.titulo}</strong><p className="muted">{t.nombre_archivo}</p></td><td><Badge value={t.estado}/></td><td>{t.recomendacion ? <Badge value={t.recomendacion}/> : 'Pendiente de análisis'}</td><td>{date(t.creado_en)}</td><td><Link to={`/licitaciones/${t.id}${t.estado === 'completada' ? '' : '/progreso'}`}>Abrir →</Link></td></tr>)}</tbody></table></div>}
    </section></>;
}
export function Upload() {
    const navigate = useNavigate();
    const limits = useResource(useCallback((s: AbortSignal) => services.limits(s), []));
    const action = useAction();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const choose = (f: File | undefined) => {
        action.setError(null);
        if (!f)
            return;
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            action.setError(new Error('Selecciona un archivo PDF.'));
            return;
        }
        if (limits.data && f.size > limits.data.max_pdf_mb * 1024 * 1024) {
            action.setError(new Error(`El archivo supera ${limits.data.max_pdf_mb} MB.`));
            return;
        }
        setFile(f);
    };
    return <><h1>Cargar pliego</h1><p className="muted">Sube el PDF oficial para extraer requisitos y contrastarlos con la información de tu empresa.</p><section className="card"><ErrorBox error={limits.error}/>{limits.loading ? <Loading /> : <form onSubmit={e => {
                e.preventDefault();
                void action.run(async () => {
                    if (!file)
                        throw new Error('Selecciona un PDF.');
                    const r = await services.upload(file, title.trim());
                    navigate(`/licitaciones/${r.licitacion.id}${r.licitacion.estado === 'completada' ? '' : '/progreso'}`, { state: { duplicada: r.duplicada } });
                });
            }}>
    <label>Título opcional<input maxLength={300} value={title} onChange={e => setTitle(e.target.value)} placeholder="Se usará el nombre del archivo si lo dejas vacío"/></label>
    <div className="drop" onDragOver={e => e.preventDefault()} onDrop={e => {
                e.preventDefault();
                if (!action.busy)
                    choose(e.dataTransfer.files[0]);
            }}><label>Arrastra el pliego o selecciona un archivo<input type="file" accept="application/pdf,.pdf" disabled={action.busy} onChange={e => choose(e.target.files?.[0])}/></label>{file && <p>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}</div>
    {limits.data && <p>Máximo {limits.data.max_pdf_mb} MB y {limits.data.max_pdf_paginas} páginas. Las páginas se comprobarán al procesar el PDF. Cuota disponible: {Math.max(0, limits.data.analisis.cuota - limits.data.analisis.usados)} análisis.</p>}
    <p className="notice">Si el mismo archivo ya existe en tu organización, se abrirá el análisis anterior sin crear otro.</p><ErrorBox error={action.error}/><button className="primary" disabled={!file || !limits.data || action.busy}>{action.busy ? 'Subiendo…' : 'Iniciar análisis'}</button>
  </form>}</section></>;
}
export function ProgressCard({ value }: {
    value: Progress;
}) {
    return <section className="card"><div className="section-top"><h2>Progreso del análisis</h2><Badge value={value.estado}/></div><progress max={100} value={value.progreso}/><p>{value.progreso}% · {value.etapas.find(e => e.clave === value.etapa_actual)?.nombre || 'Esperando inicio'}</p>
    {value.secciones && <p>Secciones procesadas: {value.secciones.procesadas} de {value.secciones.total}</p>}
    {value.error && <ErrorBox error={{ message: value.error }}/>}<ol className="grid">{value.etapas.map(e => <li key={e.clave} className="metric" aria-current={e.clave === value.etapa_actual ? 'step' : undefined}>{e.clave === value.etapa_actual ? '→ ' : ''}{e.nombre}<small style={{ display: 'block' }}>{e.porcentaje}%</small></li>)}</ol><p className="muted">Última actualización: {date(value.actualizado_en)}. Puedes salir y volver sin perder el progreso.</p></section>;
}
export function ProgressPage() { const { id = '' } = useParams(); return <ProgressContent key={id} id={id}/>; }
function ProgressContent({ id }: {
    id: string;
}) {
    const navigate = useNavigate();
    const action = useAction();
    const resource = useResource(useCallback((s: AbortSignal) => services.progress(id, s), [id]), v => active(v.estado));
    useEffect(() => {
        if (resource.data?.estado === 'completado')
            navigate(`/licitaciones/${id}`, { replace: true });
    }, [resource.data?.estado, id, navigate]);
    return <><h1>Procesando tu pliego</h1><ErrorBox error={resource.error || action.error}/>{resource.loading && <Loading />}{resource.data && <ProgressCard value={resource.data}/>}<div className="row"><button onClick={resource.refresh}>Actualizar</button>{resource.data?.estado === 'fallido' && <button className="primary" disabled={action.busy} onClick={() => void action.run(async () => { await services.retry(id); resource.refresh(); })}>Reintentar análisis</button>}<Link to="/licitaciones">Volver al listado</Link></div></>;
}
export function KnowledgePage() {
    const summary = useResource(useCallback((s: AbortSignal) => services.knowledge(s), []), v => !!v.indexacion && active(v.indexacion.estado));
    const sources = useResource(useCallback((s: AbortSignal) => services.sources(s), []));
    const action = useAction();
    const [file, setFile] = useState<File | null>(null);
    const [replace, setReplace] = useState(false);
    return <><h1>Base de conocimiento</h1><p className="muted">Información estructurada compartida por los análisis de tu organización.</p><ErrorBox error={summary.error || sources.error || action.error}/>{summary.loading && <Loading />}
    <section className="card"><h2>Cargar información de la empresa</h2><p>Selecciona un JSON con empresa, indicadores financieros, contratos, personas, certificaciones y capacidades.</p><p><a href="/base-conocimiento-ejemplo.json" download>Descargar ejemplo sintético</a></p>
    <p className="notice warning">Cada carga reemplaza por completo la base anterior y vuelve a indexarla. Los archivos PDF, ZIP y hojas de cálculo no son compatibles con esta carga.</p>
    <form onSubmit={e => {
            e.preventDefault();
            void action.run(async () => {
                if (!file)
                    throw new Error('Selecciona el archivo JSON.');
                JSON.parse(await file.text());
                await services.uploadKnowledge(file);
                summary.refresh();
                sources.refresh();
                setFile(null);
                setReplace(false);
            });
        }}>
      <label>Archivo JSON<input key={file ? 'selected' : 'empty'} type="file" accept=".json,application/json" disabled={action.busy} onChange={e => setFile(e.target.files?.[0] || null)}/></label>
      <label className="row"><input type="checkbox" checked={replace} onChange={e => setReplace(e.target.checked)}/>Entiendo que esta carga reemplaza la base de conocimiento actual.</label>
      <button className="primary" disabled={!file || !replace || action.busy}>{action.busy ? 'Cargando…' : 'Cargar e indexar'}</button>
    </form></section>
    {summary.data && <section className="card"><div className="section-top"><h2>{summary.data.empresa || 'Sin información cargada'}</h2><button onClick={() => { summary.refresh(); sources.refresh(); }}>Actualizar</button></div><div className="grid">{[['Contratos', summary.data.contratos], ['Personas', summary.data.personas], ['Certificaciones', summary.data.certificaciones], ['Capacidades', summary.data.capacidades], ['Años financieros', summary.data.anios_financieros], ['Fragmentos indexados', summary.data.fragmentos_indexados]].map(([k, v]) => <div className="metric" key={k}><strong>{v}</strong>{k}</div>)}</div><p>Última carga: {date(summary.data.cargada_en)}</p>
      {summary.data.indexacion && <><p>Indexación: <Badge value={summary.data.indexacion.estado}/></p><progress max={100} value={summary.data.indexacion.progreso}/><ErrorBox error={summary.data.indexacion.error ? { message: summary.data.indexacion.error } : null}/></>}
      <button disabled={action.busy || !summary.data.cargada || !!summary.data.indexacion && active(summary.data.indexacion.estado)} onClick={() => void action.run(async () => { await services.reindex(); summary.refresh(); })}>Volver a indexar</button>
    </section>}
    <section className="card"><h2>Fuentes cargadas</h2>{!sources.data?.length ? <p>No hay fuentes cargadas.</p> : <ul>{sources.data.map(s => <li key={s.id}>{s.titulo} · {s.tipo}</li>)}</ul>}</section>
  </>;
}
export function MembersPage() {
    const auth = useAuth();
    const members = useResource(useCallback((s: AbortSignal) => services.members(s), []));
    const action = useAction();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Member['rol']>('revisor');
    const [notice, setNotice] = useState('');
    return <><h1>Miembros de la organización</h1><ErrorBox error={members.error || action.error}/>{notice && <p role="status" className="notice">{notice}</p>}<section className="card"><h2>Invitar miembro</h2><form onSubmit={e => { e.preventDefault(); void action.run(async () => { await services.invite(email.trim(), role); setEmail(''); setNotice('Invitación enviada. El usuario debe aceptar el enlace de su correo.'); members.refresh(); }); }}><div className="row"><label>Correo<input type="email" required value={email} onChange={e => setEmail(e.target.value)}/></label><label>Rol<select value={role} onChange={e => setRole(e.target.value as Member['rol'])}><option value="revisor">Revisor</option><option value="administrador">Administrador</option></select></label><button className="primary" disabled={action.busy}>Enviar invitación</button></div></form></section>
    <section className="card"><div className="section-top"><h2>Equipo</h2><button onClick={members.refresh}>Actualizar</button></div>{members.loading && <Loading />}<div className="table-wrap"><table><thead><tr><th>Correo</th><th>Rol</th><th>Invitación</th><th>Acciones</th></tr></thead><tbody>{members.data?.map(m => <tr key={m.id}><td>{m.email}</td><td>{m.rol}</td><td>{m.invitacion_pendiente ? 'Pendiente' : 'Aceptada'}</td><td><div className="row"><button disabled={action.busy} onClick={() => {
                const next = m.rol === 'revisor' ? 'administrador' : 'revisor';
                if (window.confirm(`¿Cambiar el rol de ${m.email} a ${next}?`))
                    void action.run(async () => {
                        await services.role(m.id, next);
                        members.refresh();
                        if (m.usuario_id === auth.user?.user_id)
                            auth.reloadIdentity?.();
                    });
            }}>Cambiar rol</button><button disabled={action.busy} onClick={() => {
                if (window.confirm(`¿Retirar el acceso de ${m.email}?`))
                    void action.run(async () => {
                        await services.remove(m.id);
                        members.refresh();
                        if (m.usuario_id === auth.user?.user_id)
                            auth.reloadIdentity?.();
                    });
            }}>Retirar</button></div></td></tr>)}</tbody></table></div></section></>;
}

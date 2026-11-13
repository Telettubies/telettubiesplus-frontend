import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { Matrix, MatrixItem, Decision, Draft, ChatReply } from '@/api/backend';
import { services } from './services';
import { Badge, ErrorBox, Loading, date, download, label, useAction, useResource } from './common';
import { ProgressCard } from './Management';
import { RealPdf } from './RealPdf';
export function AnalysisPage() { const { id = '' } = useParams(); return <Analysis key={id} id={id}/>; }
function Analysis({ id }: {
    id: string;
}) {
    const location = useLocation();
    const result = useResource(useCallback((s: AbortSignal) => services.result(id, s), [id]), r => r.kind === 'pending');
    const [matrix, setMatrix] = useState<Matrix | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [tab, setTab] = useState(location.pathname.endsWith('visor-enfocado') ? 'pliego' : 'resumen');
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [jump, setJump] = useState<number | null>(null);
    const action = useAction();
    const jobs = useResource(useCallback((s: AbortSignal) => services.jobs(id, s), [id]));
    useEffect(() => {
        if (result.data?.kind === 'ready')
            setMatrix(result.data.value);
    }, [result.data]);
    const busy = result.loading || result.data?.kind === 'pending';
    const ready = result.data?.kind === 'ready' && !result.loading && !result.error;
    const item = matrix?.items.find(i => i.id === selected) || null;
    const refresh = () => { result.refresh(); jobs.refresh(); };
    const open = (i: MatrixItem) => { setSelected(i.id); setJump(null); setTab('pliego'); };
    const rows = matrix?.items.filter(i => (!filter || i.estado === filter) && (!category || i.categoria === category) && `${i.numeral} ${i.descripcion_item} ${i.texto_requisito_literal}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    return <><Link to="/licitaciones">← Licitaciones</Link><div className="section-top"><div><h1>{matrix?.nombre || 'Resultado del análisis'}</h1>{matrix && <p className="muted">{matrix.pdf_nombre} · {date(matrix.fecha_carga)}</p>}</div><div className="row"><button onClick={refresh} disabled={result.loading}>Actualizar</button><button disabled={!ready || action.busy} onClick={() => void action.run(async () => {
            if (matrix?.resumen_estados.revision && !window.confirm(`Hay ${matrix.resumen_estados.revision} ítems pendientes de revisión. ¿Descargar de todos modos?`))
                return;
            download(await services.excel(id), `matriz-${id}.xlsx`);
        })}>Descargar Excel</button></div></div>
    {location.state?.duplicada && <p role="status" className="notice">Este PDF ya existía en tu organización. Se ha abierto su análisis anterior.</p>}
    <ErrorBox error={result.error || action.error}/>{result.loading && !matrix && <Loading />}
    {result.data && result.data.kind !== 'ready' && <><ProgressCard value={result.data.value}/>{result.data.kind === 'failed' && <button disabled={action.busy} onClick={() => void action.run(async () => { await services.retry(id); refresh(); })}>Reintentar procesamiento</button>}</>}
    {matrix && <>{!ready && <p className="notice warning">El resultado mostrado corresponde a la última versión recibida. Las modificaciones están deshabilitadas hasta confirmar el resultado actualizado.</p>}
      <div className="tabs" role="tablist" aria-label="Vista del análisis">{[['resumen', 'Resumen'], ['matriz', 'Matriz y brechas'], ['pliego', 'Pliego y evidencia'], ['revision', `Revisión (${matrix.resumen_estados.revision})`], ['chat', 'Chat y observaciones']].map(([key, name]) => <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>{name}</button>)}</div>
      {tab === 'resumen' && <><section className="card"><h2>Recomendación</h2><Badge value={matrix.recomendacion}/><p className="literal">{matrix.justificacion}</p><div className="grid">{Object.entries(matrix.resumen_estados).map(([k, v]) => <button className="metric" key={k} onClick={() => { setFilter(k); setTab('matriz'); }}><strong>{v}</strong>{label(k)}</button>)}</div><p>Cobertura: {matrix.cobertura.secciones_procesadas} de {matrix.cobertura.secciones_total} secciones procesadas.</p>{!!matrix.cobertura.numerales_no_procesados.length && <p className="notice warning">Numerales sin procesar: {matrix.cobertura.numerales_no_procesados.join(', ')}</p>}{matrix.resumen_estados.revision > 0 && <p className="notice warning">Quedan ítems pendientes de revisión. La recomendación puede cambiar al resolverlos.</p>}</section><section className="card"><h2>Categorías</h2><div className="grid">{Object.entries(matrix.categorias).map(([key, counts]) => <button className="metric" key={key} onClick={() => { setCategory(key); setFilter(''); setTab('matriz'); }}><h3>{key}</h3>{Object.entries(counts).map(([s, n]) => <p key={s}>{label(s)}: {n}</p>)}</button>)}</div></section></>}
      {tab === 'matriz' && <><section className="card"><div className="section-top"><h2>Brechas prioritarias</h2><span>{matrix.brechas.length} ítems</span></div>{!matrix.brechas.length ? <p>No se registran brechas.</p> : matrix.brechas.map(i => <p key={i.id}><button onClick={() => open(i)}>Numeral {i.numeral} · {i.categoria}</button> {i.faltante || i.descripcion_item}</p>)}</section><section className="card"><h2>Matriz de cobertura</h2><div className="row"><input aria-label="Buscar requisito" placeholder="Buscar numeral o texto" value={search} onChange={e => setSearch(e.target.value)}/><select aria-label="Filtrar estado" value={filter} onChange={e => setFilter(e.target.value)}><option value="">Todos los estados</option>{Object.keys(matrix.resumen_estados).map(k => <option key={k} value={k}>{label(k)}</option>)}</select><select aria-label="Filtrar categoría" value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas las categorías</option>{Object.keys(matrix.categorias).map(k => <option key={k}>{k}</option>)}</select></div><div className="table-wrap"><table><thead><tr><th>Numeral</th><th>Ítem verificable</th><th>Categoría</th><th>Estado</th><th /></tr></thead><tbody>{rows?.map(i => <tr key={i.id} className={i.id === selected ? 'selected' : ''}><td>{i.numeral}</td><td>{i.descripcion_item}</td><td>{i.categoria}</td><td><Badge value={i.estado}/></td><td><button onClick={() => open(i)}>Ver pliego y evidencia</button></td></tr>)}</tbody></table></div>{!rows?.length && <p>No hay ítems que coincidan con los filtros.</p>}</section></>}
      <div style={{ display: tab === 'pliego' ? 'block' : 'none' }}><div className="split"><section className="card"><h2>Requisitos del pliego</h2><label>Seleccionar ítem<select value={selected || ''} onChange={e => { setSelected(e.target.value || null); setJump(null); }}><option value="">Selecciona un requisito</option>{matrix.items.map(i => <option key={i.id} value={i.id}>{i.numeral} · {i.descripcion_item.slice(0, 100)}</option>)}</select></label>{item && <ItemDetail item={item}/>}</section><RealPdf id={id} url={matrix.pdf_url_temporal} item={item} jump={jump}/></div></div>
      {tab === 'revision' && <section className="card"><h2>Revisión humana</h2>{matrix.items.filter(i => i.estado === 'revision').map(i => <details key={i.id}><summary>{i.numeral} · {i.descripcion_item}</summary><ItemDetail item={i}/><button onClick={() => open(i)}>Abrir en el pliego</button>{i.resultado_id ? <ReviewForm key={i.resultado_id} item={i} disabled={!ready} onSaved={refresh}/> : <p className="notice warning">Este ítem todavía no tiene un resultado verificable que pueda revisarse.</p>}</details>)}{matrix.resumen_estados.revision === 0 && <p>No hay ítems pendientes de revisión.</p>}</section>}
      <div style={{ display: tab === 'chat' ? 'block' : 'none' }}><ChatAndDraft id={id} matrix={matrix} disabled={!ready} onJump={(page) => { setSelected(null); setJump(page); setTab('pliego'); }}/></div>
      <details className="card"><summary>Trabajos de procesamiento</summary><ErrorBox error={jobs.error}/><button onClick={jobs.refresh}>Actualizar trabajos</button>{jobs.data?.map(j => <p key={j.id}>{j.tipo} · <Badge value={j.estado}/> · {j.progreso}%{j.error && ` · ${j.error}`}</p>)}</details>
    </>}{!matrix && !result.loading && result.error && <button onClick={result.refresh}>Reintentar consulta</button>}</>;
}
function ItemDetail({ item }: {
    item: MatrixItem;
}) {
    return <div className="stack" style={{ marginTop: 20 }}><div><Badge value={item.estado}/><p>{item.descripcion_item}</p></div><div><h3>Texto literal del requisito · numeral {item.numeral}</h3><p className="literal">{item.texto_requisito_literal}</p>{item.texto_requisito_verificado === false && <p className="notice warning">El texto del requisito no pudo verificarse contra la fuente.</p>}</div>{item.motivo_revision && <p className="notice warning">{item.motivo_revision}</p>}{item.estado === 'revision' && item.estado_propuesto && <p>Estado propuesto: {label(item.estado_propuesto)}</p>}{item.faltante && <p><strong>Faltante: </strong>{item.faltante}</p>}{item.confianza !== null && <p>Confianza de la evaluación: {(item.confianza * 100).toFixed(0)}%</p>}
    <div><h3>Evidencia</h3>{!item.evidencias.length ? <p>No hay evidencia vinculada.</p> : item.evidencias.map((e, i) => <blockquote className="notice" key={i}><strong>{e.fuente_nombre || 'Fuente sin nombre'}</strong><p className="literal">{e.cita_literal}</p><p>{e.cita_verificada ? 'Cita verificada' : 'Cita no verificada'}</p>{!e.cita_verificada && <p className="warning">Contrasta esta cita antes de tomar una decisión.</p>}{e.similitud !== null && <small>Similitud de la cita: {(e.similitud * 100).toFixed(0)}% — no es probabilidad de cumplimiento.</small>}</blockquote>)}</div>
    {!!item.revisiones.length && <div><h3>Historial de revisiones</h3>{item.revisiones.map(r => <div className="notice" key={r.id}><strong>{r.autor_email || r.usuario_id}</strong> · {date(r.creado_en)}<p>{label(r.estado_anterior)} → {label(r.estado_nuevo)}</p><p className="literal">{r.comentario}</p></div>)}</div>}</div>;
}
function ReviewForm({ item, disabled, onSaved }: {
    item: MatrixItem;
    disabled: boolean;
    onSaved: () => void;
}) {
    const [state, setState] = useState<Decision>(item.estado_propuesto || 'cumple');
    const [comment, setComment] = useState('');
    const [notice, setNotice] = useState('');
    const action = useAction();
    return <form style={{ margin: '20px 0' }} onSubmit={e => {
            e.preventDefault();
            void action.run(async () => {
                if (!comment.trim())
                    throw new Error('El comentario es obligatorio.');
                await services.review(item.resultado_id!, state, comment.trim());
                setNotice('Revisión guardada. Se ha encolado la reevaluación de la recomendación.');
                onSaved();
            });
        }}><label>Decisión<select value={state} onChange={e => setState(e.target.value as Decision)}><option value="cumple">Cumple</option><option value="cumple_parcialmente">Cumple parcialmente</option><option value="no_cumple">No cumple</option></select></label><label>Justificación obligatoria<textarea required maxLength={4000} value={comment} onChange={e => setComment(e.target.value)}/></label><ErrorBox error={action.error}/>{notice && <p role="status" className="notice">{notice}</p>}<button className="primary" disabled={disabled || action.busy}>Guardar revisión y reevaluar</button></form>;
}
function ChatAndDraft({ id, matrix, disabled, onJump }: {
    id: string;
    matrix: Matrix;
    disabled: boolean;
    onJump: (page: number) => void;
}) {
    const limits = useResource(useCallback((s: AbortSignal) => services.limits(s), []));
    const chat = useAction();
    const draftAction = useAction();
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<{
        question: string;
        reply: ChatReply;
    }[]>([]);
    const ambiguous = matrix.items.filter((i, index, items) => i.es_ambiguo && items.findIndex(o => o.requisito_id === i.requisito_id) === index);
    const [req, setReq] = useState('');
    const [draft, setDraft] = useState<Draft | null>(null);
    const [copied, setCopied] = useState(false);
    return <div className="split"><section className="card"><h2>Chat de la licitación</h2><p className="muted">Consulta el pliego y el resultado. La conversación se conserva mientras permanezcas en esta vista.</p>{limits.data && <p>Preguntas usadas: {limits.data.chat.usados}/{limits.data.chat.cuota} en {limits.data.ventana_horas} horas.</p>}<ErrorBox error={limits.error}/>
    {!messages.length && <p className="notice">¿Qué requisitos habilitantes no cumple la empresa?</p>}{messages.map((m, i) => <article key={i}><p><strong>Tú: </strong>{m.question}</p><div className="chat-message"><strong>Asistente</strong><p>{m.reply.respuesta}</p>{!m.reply.encontrado && <small>No se encontró información suficiente en el contexto.</small>}{m.reply.citas.map((c, j) => c.pagina ? <button key={j} onClick={() => onJump(c.pagina!)}>Numeral {c.numeral} · pág. {c.pagina}</button> : <span key={j}>Numeral {c.numeral}</span>)}</div></article>)}
    <form onSubmit={e => {
            e.preventDefault();
            void chat.run(async () => {
                const q = question.trim();
                if (!q)
                    return;
                const reply = await services.chat(id, q);
                setMessages(m => [...m, { question: q, reply }]);
                setQuestion('');
                limits.refresh();
            });
        }}><label>Pregunta<textarea required maxLength={limits.data?.chat_max_caracteres} value={question} onChange={e => setQuestion(e.target.value)}/></label><ErrorBox error={chat.error}/><button className="primary" disabled={disabled || chat.busy || !question.trim() || !limits.data}>{chat.busy ? 'Consultando…' : 'Enviar pregunta'}</button></form>
  </section><section className="card"><h2>Borrador de observación</h2><p className="muted">Genera una solicitud de aclaración para un requisito ambiguo. Revisa el texto antes de utilizarlo; no se envía a la entidad.</p><label>Requisito ambiguo<select value={req} onChange={e => { setReq(e.target.value); setDraft(null); setCopied(false); }}><option value="">Selecciona un requisito</option>{ambiguous.map(i => <option key={i.requisito_id} value={i.requisito_id}>{i.numeral} · {i.descripcion_item.slice(0, 100)}</option>)}</select></label>{!ambiguous.length && <p>No hay requisitos marcados como ambiguos.</p>}
    <button disabled={!req || disabled || draftAction.busy} onClick={() => void draftAction.run(async () => { setCopied(false); setDraft(await services.draft(id, req)); })}>{draftAction.busy ? 'Generando…' : 'Generar borrador'}</button><ErrorBox error={draftAction.error}/>{draft && <><h3>{draft.asunto}</h3><label>Texto editable<textarea style={{ minHeight: 360 }} value={draft.texto} onChange={e => { setDraft({ ...draft, texto: e.target.value }); setCopied(false); }}/></label><button onClick={() => void draftAction.run(async () => { await navigator.clipboard.writeText(draft.texto); setCopied(true); })}>{copied ? 'Copiado' : 'Copiar borrador'}</button></>}
  </section></div>;
}

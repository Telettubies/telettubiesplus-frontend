import schemas from '@/api/backend.schemas.json';
import React, { useCallback, useEffect, useState } from 'react';
import { axiosClient as api } from '@/api/axiosClient';
import { ErrorBox, useAction, useResource } from './common';

type Datos = Record<string, any>;
type Candidato = { tipo: string; pagina: number; cita: string; datos: Datos };
type Documento = { id: string; nombre: string; estado: string; error?: string; candidatos: Candidato[]; paginas: { numero: number; texto: string }[] };
const grupos: Record<string, string> = { empresa: 'empresa', financiero: 'financiero', contrato: 'contratos', hoja_de_vida: 'personas', certificacion: 'certificaciones', capacidad: 'capacidades' };

export function combinarBase(base: Datos, candidatos: Candidato[]): Datos {
  const salida = JSON.parse(JSON.stringify(base));
  for (const candidato of candidatos) {
    const grupo = grupos[candidato.tipo];
    if (!grupo) throw new Error('Tipo de documento desconocido');
    if (grupo === 'empresa') salida.empresa = { ...salida.empresa, ...candidato.datos };
    else {
      const filas = salida[grupo] || [];
      const clave = (dato: Datos) => dato.id ?? dato.anio ?? dato.nombre;
      const indice = filas.findIndex((dato: Datos) => clave(dato) !== undefined && clave(dato) === clave(candidato.datos));
      if (indice >= 0) filas[indice] = { ...filas[indice], ...candidato.datos };
      else filas.push(candidato.datos);
      salida[grupo] = filas;
    }
  }
  return salida;
}

const modelos: Record<string, string> = { empresa: 'Empresa', financiero: 'IndicadoresFinancieros', contrato: 'ContratoEjecutado', hoja_de_vida: 'Persona', certificacion: 'Certificacion', capacidad: 'Capacidad' };
function esquema(value: any): any { if (value?.$ref) return (schemas as any)[value.$ref.split('/').pop()]; return value?.anyOf ? esquema(value.anyOf.find((v: any) => v.type !== 'null')) : value || {}; }
function completar(value: any, schema: any): any {
  schema = esquema(schema);
  if (schema.type === 'object') return Object.fromEntries(Object.entries(schema.properties || {}).map(([key, prop]) => [key, completar(value?.[key], prop)]));
  if (schema.type === 'array') return (value || []).map((item: any) => completar(item, schema.items));
  return value ?? schema.default ?? null;
}
function Campos({ value, schema = {}, onChange }: { value: any; schema?: any; onChange: (value: any) => void }) {
  schema = esquema(schema);
  if (Array.isArray(value)) return <div>{value.map((item, index) => <fieldset key={index}><legend>Registro {index + 1}</legend><Campos value={item} schema={schema.items} onChange={next => onChange(value.map((v, i) => i === index ? next : v))}/><button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))}>Quitar registro</button></fieldset>)}<button type="button" onClick={() => onChange([...value, completar(undefined, schema.items)])}>Agregar registro</button></div>;
  if (value !== null && typeof value === 'object') return <div className="stack">{Object.entries(value).map(([key, item]) => <label key={key}>{key.replaceAll('_', ' ')}<Campos value={item} schema={schema.properties?.[key]} onChange={next => onChange({ ...value, [key]: next })}/></label>)}</div>;
  const numeric = ['number', 'integer'].includes(schema.type) || typeof value === 'number';
  return <input className="block w-full rounded-lg border border-slate-300 p-2 text-sm" value={value ?? ''} type={numeric ? 'number' : 'text'} step="any" onChange={event => onChange(event.target.value === '' ? null : numeric ? Number(event.target.value) : event.target.value)}/>;
}

export function CompanyDocuments({ canEdit, onChanged, organizacionId, documentoId, soloRevision = false }: { canEdit: boolean; onChanged?: () => void; organizacionId?: string; documentoId?: string; soloRevision?: boolean }) {
  const action = useAction();
  const limites = useResource(useCallback(async (signal: AbortSignal) => (await api.get<{max_documentos:number;max_paginas:number;max_mb:number}>('/conocimiento/documentos/limites', {signal})).data, []));
  const documentos = useResource(useCallback(async (signal: AbortSignal) => (await api.get<Documento[]>('/conocimiento/documentos', { signal })).data, [organizacionId]), rows => rows.some(d => ['en_cola', 'procesando', 'indexando', 'retirando'].includes(d.estado)));
  const [selected, setSelected] = useState<Documento | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [incluidos, setIncluidos] = useState<boolean[]>([]);
  const [empresa, setEmpresa] = useState<Datos>({ razon_social: '', nit: '' });
  const [base, setBase] = useState<Datos>({});
  const [version, setVersion] = useState('legacy');
  const [url, setUrl] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  useEffect(() => { setSelected(null); setUrl(''); setConfirmado(false); }, [organizacionId]);
  useEffect(() => {
    if (!documentoId) return;
    void action.run(async () => {
      const documento = (await api.get<Documento>(`/conocimiento/documentos/${documentoId}`)).data;
      const { _version, ...actual } = (await api.get('/conocimiento/documentos/base/actual')).data;
      setVersion(_version); setBase(actual); setEmpresa(actual.empresa);
      setSelected(canEdit && documento.estado === 'revision' ? documento : null);
      setCandidatos(documento.candidatos.map(c => ({ ...c, datos: completar(c.datos, (schemas as any)[modelos[c.tipo]]) })));
      setIncluidos(documento.candidatos.map(() => true)); setConfirmado(false);
      setUrl((await api.get(`/conocimiento/documentos/${documentoId}/pdf-url`)).data.url);
    });
  }, [documentoId, organizacionId]);
  const refrescar = () => { documentos.refresh(); setSelected(null); setUrl(''); setConfirmado(false); onChanged?.(); };
  return <section className="card rounded-2xl border border-slate-200 bg-white p-5 space-y-4">{!soloRevision && <><h2>Documentos de la empresa</h2><p>Carga certificados, contratos, estados financieros y hojas de vida. Revisa los datos extraídos antes de incorporarlos a la base. La versión activa se conserva hasta completar la indexación nueva.</p>
    <ErrorBox error={action.error || documentos.error || limites.error}/>{limites.data?.max_mb && <p>Hasta {limites.data.max_mb} MB y {limites.data.max_paginas} p?ginas por PDF. L?mite: {limites.data.max_documentos} documentos por organizaci?n.</p>}
    {canEdit && <label>Agregar PDF<input type="file" accept="application/pdf,.pdf" disabled={action.busy} onChange={event => { const file = event.target.files?.[0]; if (file) void action.run(async () => { const form = new FormData(); form.append('archivo', file); await api.post('/conocimiento/documentos', form, { headers: { 'Content-Type': 'multipart/form-data' } }); documentos.refresh(); }); event.target.value = ''; }}/></label>}
    <button onClick={documentos.refresh}>Actualizar documentos</button>
    <ul>{documentos.data?.map(doc => <li key={doc.id}><strong>{doc.nombre}</strong> · {doc.estado} <button disabled={action.busy} onClick={() => void action.run(async () => { setUrl((await api.get(`/conocimiento/documentos/${doc.id}/pdf-url`)).data.url); })}>Abrir PDF</button>
      {canEdit && doc.estado === 'aprobado' && <button disabled={action.busy} onClick={() => { if (window.confirm('?Retirar los datos de este documento de la base activa? Se conservar? el historial.')) void action.run(async () => { await api.post(`/conocimiento/documentos/${doc.id}/retirar`); documentos.refresh(); onChanged?.(); }); }}>Retirar de la base activa</button>}
      {canEdit && doc.estado === 'indexacion_fallida' && <button disabled={action.busy} onClick={() => void action.run(async () => { await api.post('/conocimiento/indexacion'); documentos.refresh(); })}>Reintentar indexaci?n</button>}
      {canEdit && doc.estado === 'fallido' && <button disabled={action.busy} onClick={() => void action.run(async () => { await api.post(`/conocimiento/documentos/${doc.id}/reintentar`); documentos.refresh(); })}>Reintentar extracción</button>}
      {canEdit && doc.estado === 'revision' && <button onClick={() => void action.run(async () => { await api.post(`/conocimiento/documentos/${doc.id}/rechazar`); refrescar(); })}>Rechazar documento</button>}
      {canEdit && doc.estado === 'revision' && <button disabled={action.busy} onClick={() => void action.run(async () => { const documento = (await api.get<Documento>(`/conocimiento/documentos/${doc.id}`)).data; const { _version, ...actual } = (await api.get('/conocimiento/documentos/base/actual')).data; setVersion(_version); setBase(actual); setEmpresa(actual.empresa); setSelected(documento); setCandidatos(documento.candidatos.map(c => ({ ...c, datos: completar(c.datos, (schemas as any)[modelos[c.tipo]]) }))); setIncluidos(documento.candidatos.map(() => true)); setConfirmado(false); setUrl((await api.get(`/conocimiento/documentos/${doc.id}/pdf-url`)).data.url); })}>Revisar datos</button>}
    </li>)}</ul></>}
    {soloRevision && <ErrorBox error={action.error}/>}
    {url && <iframe title="Documento empresarial original" src={url} style={{ width: '100%', height: 500, border: 0 }}/>} 
    {selected && <form className="space-y-4" onSubmit={event => { event.preventDefault(); void action.run(async () => { const aprobados = candidatos.filter((_, i) => incluidos[i]); const combinada = combinarBase({ ...base, empresa }, aprobados); await api.post(`/conocimiento/documentos/${selected.id}/aprobar`, { base: combinada, procedencia: aprobados, version_base: version }); refrescar(); }); }}>
      <h3>Revisión de {selected.nombre}</h3><p>Comprueba los valores contra el PDF. Los registros con el mismo identificador, año o nombre actualizarán los datos existentes al publicarse la nueva versión.</p>
      <fieldset><legend>Identificación de la empresa</legend><Campos value={empresa} schema={(schemas as any).Empresa} onChange={setEmpresa}/></fieldset>
      {candidatos.map((c, i) => <fieldset className="border border-slate-200 rounded-xl p-4 space-y-3" key={i}><legend>{c.tipo} · Página {c.pagina}</legend><label>Tipo de registro<select value={c.tipo} onChange={e => setCandidatos(candidatos.map((v,j) => j === i ? { ...v, tipo: e.target.value, datos: completar(undefined, (schemas as any)[modelos[e.target.value]]) } : v))}>{Object.keys(grupos).map(tipo => <option key={tipo} value={tipo}>{tipo.replaceAll("_", " ")}</option>)}</select></label><blockquote>{c.cita}</blockquote><label><input type="checkbox" checked={incluidos[i]} onChange={e => setIncluidos(incluidos.map((v, j) => j === i ? e.target.checked : v))}/>Incorporar este registro</label><Campos value={c.datos} schema={(schemas as any)[modelos[c.tipo]]} onChange={datos => setCandidatos(candidatos.map((v, j) => j === i ? { ...v, datos } : v))}/></fieldset>)}
      {!candidatos.length && <p>No se encontraron datos verificables. Conserva este documento como pendiente y revisa si el PDF es legible.</p>}
      <label><input type="checkbox" checked={confirmado} onChange={e => setConfirmado(e.target.checked)}/>Revisé los datos, las evidencias y los posibles reemplazos.</label>
      <button className="primary" disabled={action.busy || !confirmado || !incluidos.some(Boolean)}>Aprobar e indexar</button><button type="button" onClick={refrescar}>Cerrar revisión</button>
    </form>}
  </section>;
}

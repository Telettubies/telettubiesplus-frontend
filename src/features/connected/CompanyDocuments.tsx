import schemas from '@/api/backend.schemas.json';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiExternalLink,
  FiFileText,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';
import { axiosClient as api } from '@/api/axiosClient';
import { ErrorBox, useAction, useResource } from './common';

type Datos = Record<string, any>;
type Candidato = { tipo: string; pagina: number; cita: string; datos: Datos };
type Documento = { id: string; nombre: string; estado: string; error?: string; candidatos: Candidato[]; paginas: { numero: number; texto: string }[] };

const grupos: Record<string, string> = { empresa: 'empresa', financiero: 'financiero', contrato: 'contratos', hoja_de_vida: 'personas', certificacion: 'certificaciones', capacidad: 'capacidades' };
const modelos: Record<string, string> = { empresa: 'Empresa', financiero: 'IndicadoresFinancieros', contrato: 'ContratoEjecutado', hoja_de_vida: 'Persona', certificacion: 'Certificacion', capacidad: 'Capacidad' };
const nombresTipo: Record<string, string> = { empresa: 'Datos de la empresa', financiero: 'Indicadores financieros', contrato: 'Contrato ejecutado', hoja_de_vida: 'Hoja de vida', certificacion: 'Certificación', capacidad: 'Capacidad' };

const etiquetas: Record<string, string> = {
  razon_social: 'Razón social', nit: 'NIT', ciudad: 'Ciudad', representante_legal: 'Representante legal',
  anio: 'Año', indice_liquidez: 'Índice de liquidez', indice_endeudamiento: 'Índice de endeudamiento',
  razon_cobertura_intereses: 'Razón de cobertura de intereses', capital_trabajo_cop: 'Capital de trabajo (COP)',
  patrimonio_cop: 'Patrimonio (COP)', rentabilidad_patrimonio: 'Rentabilidad del patrimonio (ROE)', rentabilidad_activo: 'Rentabilidad del activo (ROA)',
  id: 'Identificador', objeto: 'Objeto', entidad_contratante: 'Entidad contratante', fecha_inicio: 'Fecha de inicio', fecha_fin: 'Fecha de terminación',
  valor_cop: 'Valor (COP)', valor_smmlv: 'Valor (SMMLV)', codigos_unspsc: 'Códigos UNSPSC', porcentaje_participacion: 'Participación (%)', descripcion: 'Descripción',
  nombre: 'Nombre', profesion: 'Profesión', anios_experiencia_general: 'Años de experiencia general', titulos: 'Títulos académicos', experiencias: 'Experiencia laboral',
  certificaciones: 'Certificaciones', nivel: 'Nivel', titulo: 'Título', institucion: 'Institución', cargo: 'Cargo', entidad: 'Entidad',
  alcance: 'Alcance', entidad_emisora: 'Entidad emisora', fecha_expedicion: 'Fecha de expedición', fecha_vencimiento: 'Fecha de vencimiento',
};
const camposLargos = new Set(['objeto', 'descripcion', 'alcance']);

const estados: Record<string, { texto: string; clase: string }> = {
  en_cola: { texto: 'En cola', clase: 'bg-slate-100 text-slate-700 border-slate-200' },
  procesando: { texto: 'Procesando', clase: 'bg-blue-50 text-blue-700 border-blue-200' },
  indexando: { texto: 'Indexando', clase: 'bg-blue-50 text-blue-700 border-blue-200' },
  retirando: { texto: 'Retirando', clase: 'bg-blue-50 text-blue-700 border-blue-200' },
  revision: { texto: 'Pendiente de revisión', clase: 'bg-amber-50 text-amber-800 border-amber-200' },
  aprobado: { texto: 'Aprobado', clase: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rechazado: { texto: 'Rechazado', clase: 'bg-slate-100 text-slate-600 border-slate-200' },
  retirado: { texto: 'Retirado', clase: 'bg-slate-100 text-slate-600 border-slate-200' },
  fallido: { texto: 'Extracción fallida', clase: 'bg-red-50 text-red-700 border-red-200' },
  indexacion_fallida: { texto: 'Indexación fallida', clase: 'bg-red-50 text-red-700 border-red-200' },
};

const btn = 'inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
const btnPrimario = `${btn} bg-brand-primary text-white shadow-sm hover:bg-brand-hover`;
const btnSecundario = `${btn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const btnPeligro = `${btn} border border-red-200 bg-white text-red-700 hover:bg-red-50`;
const inputClase = 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20';

const etiqueta = (clave: string) => etiquetas[clave] ?? clave.replaceAll('_', ' ').replace(/^\w/, c => c.toUpperCase());

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

function esquema(value: any): any {
  if (value?.$ref) return (schemas as any)[value.$ref.split('/').pop()];
  return value?.anyOf ? esquema(value.anyOf.find((v: any) => v.type !== 'null')) : value || {};
}

function completar(value: any, schema: any): any {
  schema = esquema(schema);
  if (schema.type === 'object') return Object.fromEntries(Object.entries(schema.properties || {}).map(([key, prop]) => [key, completar(value?.[key], prop)]));
  if (schema.type === 'array') return (value || []).map((item: any) => completar(item, schema.items));
  return value ?? schema.default ?? null;
}

function EstadoBadge({ estado }: { estado: string }) {
  const info = estados[estado] ?? { texto: estado, clase: 'bg-slate-100 text-slate-700 border-slate-200' };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${info.clase}`}>{info.texto}</span>;
}

function Valor({ value, schema, onChange, nombre }: { value: any; schema: any; onChange: (value: any) => void; nombre: string }) {
  schema = esquema(schema);
  const numerico = ['number', 'integer'].includes(schema.type) || typeof value === 'number';
  if (camposLargos.has(nombre)) {
    return <textarea aria-label={etiqueta(nombre)} className={`${inputClase} min-h-[84px]`} value={value ?? ''} onChange={e => onChange(e.target.value === '' ? null : e.target.value)}/>;
  }
  return <input aria-label={etiqueta(nombre)} className={inputClase} value={value ?? ''} step="any"
    type={numerico ? 'number' : schema.format === 'date' ? 'date' : 'text'}
    onChange={e => onChange(e.target.value === '' ? null : numerico ? Number(e.target.value) : e.target.value)}/>;
}

function Campos({ value, schema = {}, onChange }: { value: any; schema?: any; onChange: (value: any) => void }) {
  schema = esquema(schema);
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  return <div className="grid gap-3 sm:grid-cols-2">
    {Object.entries(value).map(([key, item]) => {
      const propiedad = esquema(schema.properties?.[key]);
      const cambiar = (next: any) => onChange({ ...value, [key]: next });
      if (propiedad.type === 'array' || Array.isArray(item)) {
        const itemSchema = esquema(propiedad.items);
        const lista: any[] = Array.isArray(item) ? item : [];
        if (itemSchema.type !== 'object') {
          return <label key={key} className="sm:col-span-2 grid gap-1.5 text-xs font-semibold text-slate-600">
            {etiqueta(key)} <span className="font-normal text-slate-400">(separados por coma)</span>
            <input className={inputClase} value={lista.join(', ')} onChange={e => cambiar(e.target.value.split(',').map(v => v.trim()).filter(Boolean))}/>
          </label>;
        }
        return <div key={key} className="sm:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{etiqueta(key)}</span>
            <button type="button" className={btnSecundario} onClick={() => cambiar([...lista, completar(undefined, itemSchema)])}><FiPlus/>Agregar</button>
          </div>
          {!lista.length && <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">Sin registros.</p>}
          {lista.map((fila, indice) => <div key={indice} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{etiqueta(key)} · {indice + 1}</span>
              <button type="button" aria-label="Quitar registro" className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => cambiar(lista.filter((_, i) => i !== indice))}><FiTrash2/></button>
            </div>
            <Campos value={fila} schema={itemSchema} onChange={next => cambiar(lista.map((v, i) => i === indice ? next : v))}/>
          </div>)}
        </div>;
      }
      return <label key={key} className={`grid gap-1.5 text-xs font-semibold text-slate-600 ${camposLargos.has(key) ? 'sm:col-span-2' : ''}`}>
        {etiqueta(key)}
        <Valor nombre={key} value={item} schema={propiedad} onChange={cambiar}/>
      </label>;
    })}
  </div>;
}

export function CompanyDocuments({ canEdit, onChanged, onClose, organizacionId, documentoId, soloRevision = false }: { canEdit: boolean; onChanged?: () => void; onClose?: () => void; organizacionId?: string; documentoId?: string; soloRevision?: boolean }) {
  const action = useAction();
  const limites = useResource(useCallback(async (signal: AbortSignal) => (await api.get<{ max_documentos: number; max_paginas: number; max_mb: number }>('/conocimiento/documentos/limites', { signal })).data, []));
  const documentos = useResource(useCallback(async (signal: AbortSignal) => (await api.get<Documento[]>('/conocimiento/documentos', { signal })).data, [organizacionId]), rows => rows.some(d => ['en_cola', 'procesando', 'indexando', 'retirando'].includes(d.estado)));
  const [abierto, setAbierto] = useState<Documento | null>(null);
  const [selected, setSelected] = useState<Documento | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [incluidos, setIncluidos] = useState<boolean[]>([]);
  const [empresa, setEmpresa] = useState<Datos>({ razon_social: '', nit: '' });
  const [base, setBase] = useState<Datos>({});
  const [version, setVersion] = useState('legacy');
  const [url, setUrl] = useState('');
  const [confirmado, setConfirmado] = useState(false);

  const limpiar = () => { setSelected(null); setAbierto(null); setUrl(''); setConfirmado(false); };
  useEffect(limpiar, [organizacionId]);

  const abrirPdf = async (doc: Documento) => {
    setSelected(null); setAbierto(doc); setConfirmado(false);
    setUrl((await api.get(`/conocimiento/documentos/${doc.id}/pdf-url`)).data.url);
  };

  const cargarRevision = async (id: string) => {
    const documento = (await api.get<Documento>(`/conocimiento/documentos/${id}`)).data;
    const { _version, ...actual } = (await api.get('/conocimiento/documentos/base/actual')).data;
    setVersion(_version); setBase(actual); setEmpresa(actual.empresa ?? { razon_social: '', nit: '' });
    setAbierto(documento);
    setSelected(canEdit && documento.estado === 'revision' ? documento : null);
    setCandidatos(documento.candidatos.map(c => ({ ...c, datos: completar(c.datos, (schemas as any)[modelos[c.tipo]]) })));
    setIncluidos(documento.candidatos.map(() => true));
    setConfirmado(false);
    setUrl((await api.get(`/conocimiento/documentos/${id}/pdf-url`)).data.url);
  };

  useEffect(() => { if (documentoId) void action.run(() => cargarRevision(documentoId)); }, [documentoId, organizacionId]);

  const refrescar = () => { documentos.refresh(); limpiar(); onChanged?.(); };
  const cerrar = () => { if (soloRevision) onClose?.(); else limpiar(); };
  const aprobar = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    void action.run(async () => {
      const aprobados = candidatos.filter((_, i) => incluidos[i]);
      const combinada = combinarBase({ ...base, empresa }, aprobados);
      await api.post(`/conocimiento/documentos/${selected.id}/aprobar`, { base: combinada, procedencia: aprobados, version_base: version });
      refrescar();
    });
  };

  const visor = url
    ? <iframe title="Documento empresarial original" src={url} className="h-full min-h-[420px] w-full rounded-xl border border-slate-200 bg-slate-100"/>
    : <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">{action.busy ? 'Cargando documento…' : 'El PDF no está disponible.'}</div>;

  const revision = (selected || (soloRevision && abierto)) && <div className={soloRevision ? 'flex min-h-0 flex-1 flex-col' : 'flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm'}>
    <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-600 ring-1 ring-red-200">PDF</div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">Revisar datos extraídos</h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="truncate font-medium text-slate-700">{(selected || abierto)?.nombre}</span>
            {(selected || abierto) && <EstadoBadge estado={(selected || abierto)!.estado}/>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {url && <a href={url} target="_blank" rel="noreferrer" className={btnSecundario}><FiExternalLink/>Abrir en pestaña</a>}
        <button type="button" aria-label="Cerrar revisión" onClick={cerrar} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><FiX className="h-5 w-5"/></button>
      </div>
    </header>

    <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:overflow-hidden">
      <div className="min-h-[420px] lg:h-full">{visor}</div>

      {selected ? <form id="revision-documento" onSubmit={aprobar} className="min-h-0 space-y-4 pr-1 lg:overflow-y-auto">
        <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
          <FiInfo className="mt-0.5 h-4 w-4 shrink-0"/>
          <p>Compara cada valor con el PDF antes de aprobar. Los registros con el mismo identificador, año o nombre reemplazan a los existentes cuando se publique la nueva versión. La empresa debe tener razón social y NIT válidos.</p>
        </div>
        <ErrorBox error={action.error}/>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <h4 className="text-sm font-semibold text-slate-800">Identificación de la empresa</h4>
          <Campos value={empresa} schema={(schemas as any).Empresa} onChange={setEmpresa}/>
        </section>

        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-800">Registros encontrados <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{candidatos.length}</span></h4>
          <span className="text-xs text-slate-500">{incluidos.filter(Boolean).length} seleccionados</span>
        </div>

        {!candidatos.length && <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/>
          <p>No se encontraron datos verificables. Conserva el documento pendiente y comprueba que el PDF sea legible, o intenta de nuevo la indexación automática.</p>
        </div>}

        {candidatos.map((c, i) => <section key={i} className={`rounded-2xl border p-4 shadow-sm space-y-3 transition-opacity ${incluidos[i] ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50 opacity-60'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label="Tipo de registro" value={c.tipo} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700"
                onChange={e => setCandidatos(candidatos.map((v, j) => j === i ? { ...v, tipo: e.target.value, datos: completar(undefined, (schemas as any)[modelos[e.target.value]]) } : v))}>
                {Object.keys(grupos).map(tipo => <option key={tipo} value={tipo}>{nombresTipo[tipo]}</option>)}
              </select>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Página {c.pagina}</span>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-[var(--color-brand-primary,#1E3A5F)]" checked={incluidos[i]} onChange={e => setIncluidos(incluidos.map((v, j) => j === i ? e.target.checked : v))}/>
              Incorporar este registro
            </label>
          </div>
          {c.cita && <blockquote className="rounded-r-lg border-l-4 border-amber-300 bg-amber-50/60 px-3 py-2 text-xs italic leading-relaxed text-slate-600">“{c.cita}”</blockquote>}
          <Campos value={c.datos} schema={(schemas as any)[modelos[c.tipo]]} onChange={datos => setCandidatos(candidatos.map((v, j) => j === i ? { ...v, datos } : v))}/>
        </section>)}
      </form> : <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <FiInfo className="mt-0.5 h-4 w-4 shrink-0"/>
        <p>{action.busy ? 'Cargando datos del documento…' : canEdit ? 'Este documento no tiene datos pendientes de revisión.' : 'Solo los administradores pueden revisar y aprobar datos extraídos.'}</p>
      </div>}
    </div>

    {selected && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-3">
      <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={confirmado} onChange={e => setConfirmado(e.target.checked)}/>
        Revisé los datos, las evidencias y los posibles reemplazos.
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnPeligro} disabled={action.busy} onClick={() => void action.run(async () => { await api.post(`/conocimiento/documentos/${selected.id}/rechazar`); refrescar(); })}>Rechazar documento</button>
        <button type="button" className={btnSecundario} disabled={action.busy} onClick={() => void action.run(async () => { await api.post(`/conocimiento/documentos/${selected.id}/reintentar`); refrescar(); })}><FiRefreshCw/>Indexación automática</button>
        <button type="submit" form="revision-documento" className={btnPrimario} disabled={action.busy || !confirmado || !incluidos.some(Boolean)}><FiCheckCircle/>Aprobar e indexar</button>
      </div>
    </footer>}
  </div>;

  if (soloRevision) {
    return <section className="flex max-h-[94vh] min-h-0 flex-1 flex-col">
      {revision || <div className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0 flex-1"><ErrorBox error={action.error}/>{!action.error && <p className="text-sm text-slate-500">{action.busy ? 'Cargando documento…' : 'No se pudo abrir el documento.'}</p>}</div>
        <button type="button" aria-label="Cerrar revisión" onClick={cerrar} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><FiX className="h-5 w-5"/></button>
      </div>}
    </section>;
  }

  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Documentos de la empresa</h2>
        <p className="mt-1 text-sm text-slate-500">Carga certificados, contratos, estados financieros y hojas de vida. Revisa los datos extraídos antes de incorporarlos a la base. La versión activa se conserva hasta completar la nueva indexación.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnSecundario} onClick={documentos.refresh}><FiRefreshCw/>Actualizar</button>
        {canEdit && <label className={`${btnPrimario} cursor-pointer`}>
          <FiUploadCloud/>Agregar PDF
          <input aria-label="Agregar PDF" className="sr-only" type="file" accept="application/pdf,.pdf" disabled={action.busy} onChange={event => {
            const file = event.target.files?.[0];
            if (file) void action.run(async () => { const form = new FormData(); form.append('archivo', file); await api.post('/conocimiento/documentos', form, { headers: { 'Content-Type': 'multipart/form-data' } }); documentos.refresh(); });
            event.target.value = '';
          }}/>
        </label>}
      </div>
    </div>

    {limites.data?.max_mb && <p className="text-xs text-slate-500">Hasta {limites.data.max_mb} MB y {limites.data.max_paginas} páginas por PDF. Límite de {limites.data.max_documentos} documentos por organización.</p>}
    <ErrorBox error={action.error || documentos.error || limites.error}/>

    <div className="overflow-hidden rounded-xl border border-slate-200">
      {!documentos.data?.length && <p className="px-4 py-8 text-center text-sm text-slate-400">{documentos.loading ? 'Cargando documentos…' : 'Aún no hay documentos cargados.'}</p>}
      <ul className="divide-y divide-slate-100">
        {documentos.data?.map(doc => <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/60">
          <div className="flex min-w-0 items-center gap-3">
            <FiFileText className="h-5 w-5 shrink-0 text-slate-400"/>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">{doc.nombre}</p>
              {doc.error && <p className="truncate text-xs text-red-600">{doc.error}</p>}
            </div>
            <EstadoBadge estado={doc.estado}/>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={btnSecundario} disabled={action.busy} onClick={() => void action.run(() => abrirPdf(doc))}>Abrir PDF</button>
            {canEdit && doc.estado === 'revision' && <button type="button" className={btnPrimario} disabled={action.busy} onClick={() => void action.run(() => cargarRevision(doc.id))}>Revisar datos</button>}
            {canEdit && doc.estado === 'revision' && <button type="button" className={btnPeligro} disabled={action.busy} onClick={() => void action.run(async () => { await api.post(`/conocimiento/documentos/${doc.id}/rechazar`); refrescar(); })}>Rechazar</button>}
            {canEdit && doc.estado === 'aprobado' && <button type="button" className={btnPeligro} disabled={action.busy} onClick={() => { if (window.confirm('¿Retirar los datos de este documento de la base activa? Se conservará el historial.')) void action.run(async () => { await api.post(`/conocimiento/documentos/${doc.id}/retirar`); documentos.refresh(); onChanged?.(); }); }}>Retirar de la base activa</button>}
            {canEdit && doc.estado === 'indexacion_fallida' && <button type="button" className={btnSecundario} disabled={action.busy} onClick={() => void action.run(async () => { await api.post('/conocimiento/indexacion'); documentos.refresh(); })}><FiRefreshCw/>Reintentar indexación</button>}
            {canEdit && doc.estado === 'fallido' && <button type="button" className={btnSecundario} disabled={action.busy} onClick={() => void action.run(async () => { await api.post(`/conocimiento/documentos/${doc.id}/reintentar`); documentos.refresh(); })}><FiRefreshCw/>Reintentar extracción</button>}
          </div>
        </li>)}
      </ul>
    </div>

    {(selected || (abierto && url)) && (selected ? revision : <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{abierto?.nombre}</p>
        <button type="button" className={btnSecundario} onClick={limpiar}><FiX/>Cerrar</button>
      </div>
      <div className="h-[560px]">{visor}</div>
    </div>)}
  </section>;
}

// DTO HTTP de docs/openapi.json. No son los modelos visuales de la demo.
import schemas from './backend.schemas.json';
import type { RolOrganizacion, EstadoCumplimiento, CategoriaRequisito, RecomendacionLicitacion } from './types';
export type Decision = Exclude<EstadoCumplimiento, 'revision'>;
export type WorkState = 'en_cola' | 'en_ejecucion' | 'completado' | 'fallido';
export interface Member {
    id: string;
    organizacion_id: string;
    usuario_id: string;
    email: string;
    rol: RolOrganizacion;
    invitacion_pendiente: boolean;
    creado_en: string;
    organizacion_nombre?: string;
}
export interface Identity {
    usuario_id: string;
    email: string | null;
    membresias: Member[];
}
export interface Job {
    id: string;
    tipo: 'analisis' | 'indexacion' | 'reevaluacion';
    estado: WorkState;
    etapa_actual: string | null;
    progreso: number;
    error: string | null;
    detalle: Record<string, unknown> | null;
    creado_en: string;
    iniciado_en: string | null;
    finalizado_en: string | null;
}
export interface Tender {
    id: string;
    titulo: string;
    nombre_archivo: string;
    estado: 'pendiente' | 'procesando' | 'completada' | 'fallida';
    recomendacion: string | null;
    creado_en: string;
}
export interface CreatedTender {
    licitacion: Tender;
    trabajo: Job;
    duplicada?: boolean;
}
export interface Progress {
    licitacion_id: string;
    estado_licitacion: Tender['estado'];
    trabajo_id: string;
    estado: WorkState;
    etapa_actual: string | null;
    progreso: number;
    secciones: {
        procesadas: number;
        total: number;
    } | null;
    error: string | null;
    intentos: number;
    iniciado_en: string | null;
    finalizado_en: string | null;
    actualizado_en: string;
    etapas: {
        clave: string;
        nombre: string;
        porcentaje: number;
    }[];
}
export interface Evidence {
    fuente_id: string | null;
    fuente_nombre: string | null;
    cita_literal: string;
    cita_verificada: boolean;
    similitud: number | null;
}
export interface Revision {
    id: string;
    usuario_id: string;
    autor_email?: string | null;
    estado_anterior: Decision;
    estado_nuevo: Decision;
    comentario: string;
    creado_en: string;
}
export interface MatrixItem {
    id: string;
    requisito_id: string;
    resultado_id: string | null;
    codigo_req: string;
    numeral: string;
    categoria: CategoriaRequisito;
    texto_requisito_literal: string;
    texto_requisito_verificado: boolean | null;
    descripcion_item: string;
    estado: EstadoCumplimiento;
    estado_propuesto: Decision | null;
    motivo_revision: string | null;
    es_ambiguo: boolean;
    evidencia: Evidence | null;
    evidencias: Evidence[];
    faltante: string | null;
    confianza: number | null;
    ubicacion: {
        pagina: number;
        precision: 'exacta' | 'aproximada' | 'solo_pagina';
        zonas: {
            pagina: number;
            x: number;
            y: number;
            width: number;
            height: number;
        }[];
    };
    revisiones: Revision[];
}
export interface Matrix {
    licitacion_id: string;
    nombre: string;
    fecha_carga: string;
    pdf_nombre: string;
    pdf_paginas: number | null;
    pdf_url_temporal: string;
    recomendacion: RecomendacionLicitacion;
    justificacion: string;
    cobertura: {
        secciones_procesadas: number;
        secciones_total: number;
        numerales_no_procesados: string[];
    };
    resumen_estados: Record<EstadoCumplimiento, number>;
    categorias: Record<CategoriaRequisito, Record<EstadoCumplimiento, number>>;
    items: MatrixItem[];
    brechas: MatrixItem[];
}
export interface Knowledge {
    cargada: boolean;
    empresa: string | null;
    cargada_en: string | null;
    anios_financieros: number;
    contratos: number;
    personas: number;
    certificaciones: number;
    capacidades: number;
    fragmentos_indexados: number;
    indexacion: Job | null;
}
export interface Source {
    id: string;
    tipo: string;
    titulo: string;
    creado_en: string;
}
export interface Limits {
    max_pdf_mb: number;
    max_pdf_paginas: number;
    chat_max_caracteres: number;
    ventana_horas: number;
    analisis: {
        usados: number;
        cuota: number;
    };
    chat: {
        usados: number;
        cuota: number;
    };
}
export interface ChatReply {
    respuesta: string;
    encontrado: boolean;
    citas: {
        numeral: string;
        pagina: number | null;
    }[];
}
export interface Draft {
    requisito_id: string;
    numeral: string;
    asunto: string;
    texto: string;
}
type Schema = {
    $ref?: string;
    anyOf?: Schema[];
    type?: string;
    enum?: unknown[];
    required?: string[];
    properties?: Record<string, Schema>;
    items?: Schema;
    additionalProperties?: boolean | Schema;
};
function matches(schema: Schema, value: unknown): boolean {
    if (schema.$ref)
        return matches((schemas as Record<string, Schema>)[schema.$ref.split('/').pop()!], value);
    if (schema.anyOf)
        return schema.anyOf.some(s => matches(s, value));
    if (schema.enum && !schema.enum.includes(value))
        return false;
    if (schema.type === 'null')
        return value === null;
    if (schema.type === 'string')
        return typeof value === 'string';
    if (schema.type === 'boolean')
        return typeof value === 'boolean';
    if (schema.type === 'integer')
        return typeof value === 'number' && Number.isInteger(value);
    if (schema.type === 'number')
        return typeof value === 'number' && Number.isFinite(value);
    if (schema.type === 'array')
        return Array.isArray(value) && value.every(v => !schema.items || matches(schema.items, v));
    if (schema.type === 'object') {
        if (!value || typeof value !== 'object' || Array.isArray(value))
            return false;
        const obj = value as Record<string, unknown>;
        if (schema.required?.some(k => !(k in obj)))
            return false;
        return Object.entries(obj).every(([k, v]) => schema.properties?.[k] ? matches(schema.properties[k], v) : typeof schema.additionalProperties === 'object' ? matches(schema.additionalProperties, v) : schema.additionalProperties !== false);
    }
    return true;
}
export function decode<T>(name: keyof typeof schemas, value: unknown): T {
    if (!matches(schemas[name] as Schema, value))
        throw new Error('La respuesta del servidor no coincide con el contrato de ' + name + '.');
    return value as T;
}
export function decodeList<T>(name: keyof typeof schemas, value: unknown): T[] {
    if (!Array.isArray(value))
        throw new Error('Se esperaba una lista del servidor.');
    return value.map(v => decode<T>(name, v));
}

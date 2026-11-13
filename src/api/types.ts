export type RolOrganizacion = 'administrador' | 'revisor';

export type EstadoCumplimiento =
  | 'cumple'
  | 'cumple_parcialmente'
  | 'no_cumple'
  | 'revision';

export type CategoriaRequisito =
  | 'habilitante'
  | 'tecnico'
  | 'experiencia'
  | 'plazo';

export type RecomendacionLicitacion =
  | 'presentarse'
  | 'presentarse_con_riesgo'
  | 'no_presentarse'
  | 'condicionada';

export type RecomendacionEstado = RecomendacionLicitacion;

export type PrecisionUbicacion = 'exacta' | 'aproximada' | 'solo_pagina';

export interface ResolucionHumanaPayload {
  estado: EstadoCumplimiento;
  comentario: string;
}

export interface ZonaCoordenada {
  x: number; // Normalizado [0, 1] respecto al ancho de página
  y: number; // Normalizado [0, 1] respecto al alto de página
  width: number; // Normalizado [0, 1]
  height: number; // Normalizado [0, 1]
}

export interface UbicacionPliego {
  pagina: number;
  precision: 'exacta' | 'aproximada' | 'solo_pagina';
  zonas: ZonaCoordenada[];
}

export interface EvidenciaItem {
  fuente_id: string;
  fuente_nombre: string;
  cita_literal: string;
  cita_verificada: boolean; // False dispara advertencia visual (HU-B18 / HU-F09)
  similitud?: number; // Ej. 0.78 (78%)
}

export interface HistorialRevision {
  id: string;
  autor_nombre: string;
  fecha: string;
  estado_anterior: EstadoCumplimiento;
  estado_nuevo: EstadoCumplimiento;
  comentario: string;
}

export interface ItemVerificable {
  backend_item?: import('./backend').MatrixItem;
  resultado_id?: string | null;
  estado_propuesto?: Exclude<EstadoCumplimiento, 'revision'> | null;
  id: string;
  codigo_req: string; // Ej. "REQ-014"
  codigo?: string;
  requisito_id?: string;
  numeral: string; // Ej. "3.2.1"
  capitulo?: string; // Ej. "Capítulo Jurídico"
  categoria: CategoriaRequisito | 'habilitantes' | 'tecnicos';
  es_habilitante?: boolean;
  texto_requisito_literal?: string;
  cita_literal_pliego?: string;
  descripcion_item?: string; // Unidad verificable atómica
  requisito_resumido?: string;
  es_ambiguo?: boolean;
  motivo_revision?: string; // Ej. "Cita No Verificada <85%" | "Redacción Ambigua"
  estado: EstadoCumplimiento;
  cita_verificada?: boolean;
  evidencia?: EvidenciaItem;
  evidencia_vinculada?: string;
  evidencia_fuente?: string;
  evidencia_fragmento?: string;
  faltante?: string; // Obligatorio si estado !== 'cumple'
  brecha_identificada?: string;
  confianza?: number; // 0 a 1
  subsanable?: boolean | null;
  ubicacion: UbicacionPliego;
  revisiones?: HistorialRevision[];
}

export interface EtapaPipeline {
  numero: string; // "01" .. "08"
  titulo: string;
  subtitulo: string;
  estado: 'en_cola' | 'en_proceso' | 'completado' | 'error';
  detalle_error?: string;
}

export interface ProgresoAnalisis {
  trabajo_id: string;
  licitacion_id: string;
  estado: 'pendiente' | 'procesando' | 'completado' | 'error';
  etapa_actual: string;
  etapa_indice: number;
  etapas_total: number;
  porcentaje: number;
  secciones_procesadas?: number;
  secciones_total?: number;
  mensaje_error?: string;
  checkpoint_etapa?: number;
  checkpoint_fecha?: string;
  etapas: EtapaPipeline[];
  resumen_final?: {
    requisitos_extraidos: number;
    secciones_validadas: number;
    duracion_texto: string;
  };
}

export interface ResultadoLicitacion {
  licitacion_id: string;
  codigo_proceso: string; // Ej. "LP-MIN-001-2026"
  entidad: string; // Ej. "Ministerio de Transporte"
  nombre: string;
  fecha_carga: string;
  fecha_cierre?: string;
  dias_al_cierre?: number;
  riesgos_habilitantes_criticos?: number;
  pdf_nombre: string;
  pdf_paginas: number;
  pdf_url_temporal: string;
  recomendacion: RecomendacionLicitacion;
  justificacion: string;
  cobertura: {
    secciones_procesadas: number;
    secciones_total: number;
    numerales_no_procesados: string[];
  };
  resumen_estados: Record<EstadoCumplimiento, number>;
  metricas_ejecucion?: {
    duracion_segundos: number;
    costo_estimado_usd: number;
  };
  items: ItemVerificable[];
  brechas: ItemVerificable[]; // Ordenadas con 'habilitante' primero
}

export interface PerfilMiembro {
  id: string;
  user_id: string;
  nombre: string;
  iniciales: string;
  correo: string;
  rol: RolOrganizacion;
  organizacion_id: string;
  organizacion_nombre: string;
  organizacion_nit: string;
  tenant_codigo: string;
}

export interface MiembroOrganizacion {
  id: string;
  nombre?: string;
  correo: string;
  rol: RolOrganizacion;
  estado: 'activo' | 'pendiente';
  fecha_invitacion?: string;
}

export interface ErrorValidacionConocimiento {
  linea?: number;
  ubicacion?: (string | number)[];
  campo: string;
  detalle: string;
}

export interface ResumenBaseConocimiento {
  contratos_indexados: number;
  ultimo_contrato_fecha: string;
  perfiles_acreditados: number;
  certificaciones_iso: number;
  smmlv_base: number;
  capacidad_residual: 'Validada' | 'Pendiente';
  fragmentos_activos: number;
  porcentaje_indexado: number;
  estado_indexacion: 'indexado' | 'sin_indexar' | 'indexando' | 'rechazado';
  ultima_carga_fecha: string;
  archivo_nombre: string;
  validaciones: {
    criterio: string;
    resultado: string;
    estado: 'Verificado' | 'Sin datos' | 'Falló' | 'Parcial' | 'En proceso' | 'En cola';
  }[];
  errores_validacion?: ErrorValidacionConocimiento[];
}

export interface LicitacionPortafolioItem {
  id: string;
  codigo_proceso: string;
  entidad: string;
  objeto: string;
  categoria_dominio: 'Infraestructura' | 'Tecnología' | 'Sin clasificar';
  fecha_cierre: string;
  dias_restantes: number;
  estado_pipeline: 'Completado' | 'En Extracción 65%' | 'En Extracción 30%' | 'Fallido' | 'Nuevo Trabajo Registrado';
  recomendacion?: RecomendacionLicitacion;
  fecha_carga: string;
  destacado?: boolean;
}

export interface EnlaceNumeralChat {
  etiqueta: string;
  numeral?: string;
  pagina: number;
}

export type ReferenciaPliegoChat = EnlaceNumeralChat;

export interface MensajeChat {
  id: string;
  rol: 'usuario' | 'asistente' | 'error_429' | 'fuera_alcance' | 'FueraDeAlcance';
  contenido: string;
  contexto?: string;
  timestamp?: string;
  creado_en?: string;
  enlaces?: EnlaceNumeralChat[];
  referencias?: EnlaceNumeralChat[];
}

export interface BorradorObservacion {
  id?: string;
  requisito_id: string;
  requisito_label?: string;
  clausula_origen?: string;
  codigo_req?: string;
  numeral?: string;
  titulo_corto?: string;
  cita_pliego?: string;
  texto_completo?: string;
  destinatario: string;
  hecho_clausula?: string;
  hecho_cuestionado?: string;
  sustento_juridico: string;
  solicitud_concreta: string;
}

export interface ApiErrorStandard {
  status: number;
  code: 'UNAUTHORIZED' | 'RESOURCE_UNAVAILABLE' | 'VALIDATION_ERROR' | 'RATE_LIMIT_EXCEEDED' | 'SERVER_ERROR';
  message: string;
  redirectPath?: string;
  validationErrors?: ErrorValidacionConocimiento[];
  traceId?: string;
}

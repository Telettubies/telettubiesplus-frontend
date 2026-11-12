import type { ProgresoAnalisis, EtapaPipeline } from '@/api/types';

export const BASE_ETAPAS_PIPELINE: EtapaPipeline[] = [
  {
    numero: '01',
    titulo: 'Lectura del documento',
    subtitulo: 'Reconocimiento de texto y tablas (Pág. 1–74)',
    estado: 'en_cola',
  },
  {
    numero: '02',
    titulo: 'Organización por secciones',
    subtitulo: 'Identificación de capítulos y numerales del pliego',
    estado: 'en_cola',
  },
  {
    numero: '03',
    titulo: 'Revisión preliminar de contenido',
    subtitulo: 'Selección de secciones con requisitos obligatorios',
    estado: 'en_cola',
  },
  {
    numero: '04',
    titulo: 'Identificación de requisitos',
    subtitulo: 'Desglose detallado de las condiciones exigidas',
    estado: 'en_cola',
  },
  {
    numero: '05',
    titulo: 'Ubicación en el documento',
    subtitulo: 'Asociación de cada requisito con su página en el PDF',
    estado: 'en_cola',
  },
  {
    numero: '06',
    titulo: 'Revisión de cobertura',
    subtitulo: 'Confirmación de lectura de todas las secciones',
    estado: 'en_cola',
  },
  {
    numero: '07',
    titulo: 'Comparación con documentos propios',
    subtitulo: 'Contraste con contratos, equipo y soportes de la organización',
    estado: 'en_cola',
  },
  {
    numero: '08',
    titulo: 'Resultado y recomendación',
    subtitulo: 'Consolidación de brechas y sugerencia de participación',
    estado: 'en_cola',
  },
];

export const MOCK_PROGRESO_IDLE: ProgresoAnalisis = {
  trabajo_id: 'job-idle-001',
  licitacion_id: 'LP-MIN-001-2026',
  estado: 'pendiente',
  etapa_actual: 'Esperando archivo para inicializar el orquestador de análisis.',
  etapa_indice: 0,
  etapas_total: 8,
  porcentaje: 0,
  etapas: BASE_ETAPAS_PIPELINE,
};

export const MOCK_PROGRESO_EN_CURSO_ETAPA_4: ProgresoAnalisis = {
  trabajo_id: 'job-live-004',
  licitacion_id: 'LP-MIN-001-2026',
  estado: 'procesando',
  etapa_actual: 'Extracción y Atomización de Requisitos',
  etapa_indice: 4,
  etapas_total: 7,
  porcentaje: 68,
  secciones_procesadas: 38,
  secciones_total: 52,
  etapas: BASE_ETAPAS_PIPELINE.map((et, idx) => {
    if (idx < 3) return { ...et, estado: 'completado' };
    if (idx === 3) {
      return {
        ...et,
        subtitulo: 'Procesando Numeral 3.4.2... (Sección 38/52)',
        estado: 'en_proceso',
      };
    }
    return et;
  }),
};

export const MOCK_PROGRESO_ERROR_ETAPA_4: ProgresoAnalisis = {
  trabajo_id: 'job-err-004',
  licitacion_id: 'LP-MIN-001-2026',
  estado: 'error',
  etapa_actual: 'Extracción y Atomización de Requisitos',
  etapa_indice: 4,
  etapas_total: 7,
  porcentaje: 57,
  secciones_procesadas: 29,
  secciones_total: 52,
  mensaje_error: 'Error de Ejecución: Límite de tokens o timeout de API',
  checkpoint_etapa: 3,
  checkpoint_fecha: '2026-11-11 16:01:14',
  etapas: BASE_ETAPAS_PIPELINE.map((et, idx) => {
    if (idx < 3) return { ...et, estado: 'completado' };
    if (idx === 3) {
      return {
        ...et,
        estado: 'error',
        detalle_error: 'Error de Ejecución: Límite de tokens o timeout de API',
      };
    }
    return et;
  }),
};

export const MOCK_PROGRESO_COMPLETADO: ProgresoAnalisis = {
  trabajo_id: 'job-done-008',
  licitacion_id: 'LP-MIN-001-2026',
  estado: 'completado',
  etapa_actual: 'Determinación de Brechas y Recomendación',
  etapa_indice: 8,
  etapas_total: 8,
  porcentaje: 100,
  secciones_procesadas: 52,
  secciones_total: 52,
  resumen_final: {
    requisitos_extraidos: 142,
    secciones_validadas: 52,
    duracion_texto: '1m 42s',
  },
  etapas: BASE_ETAPAS_PIPELINE.map((et) => ({ ...et, estado: 'completado' })),
};


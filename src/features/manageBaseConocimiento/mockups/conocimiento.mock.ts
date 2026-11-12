import type { ResumenBaseConocimiento } from '@/api/types';

export const MOCK_CONOCIMIENTO_VERIFICADO: ResumenBaseConocimiento = {
  contratos_indexados: 42,
  ultimo_contrato_fecha: '2026-10-14',
  perfiles_acreditados: 18,
  certificaciones_iso: 6,
  smmlv_base: 2026,
  capacidad_residual: 'Validada',
  fragmentos_activos: 512,
  porcentaje_indexado: 100,
  estado_indexacion: 'indexado',
  ultima_carga_fecha: 'Última carga: 2026-10-14 11:22 -05:00 · contratos.json v0.3',
  archivo_nombre: 'contratos.json v0.3',
  validaciones: [
    { criterio: 'Esquema contratos.json v0.3', resultado: 'Válido', estado: 'Verificado' },
    { criterio: 'Contratos procesados', resultado: '42 / 42', estado: 'Verificado' },
    { criterio: 'Restricciones financieras verificadas', resultado: '8 / 8', estado: 'Verificado' },
    { criterio: 'Códigos de experiencia UNSPSC emparejados', resultado: '126 / 126', estado: 'Verificado' },
  ],
};

export const MOCK_CONOCIMIENTO_VACIO: ResumenBaseConocimiento = {
  contratos_indexados: 0,
  ultimo_contrato_fecha: '—',
  perfiles_acreditados: 0,
  certificaciones_iso: 0,
  smmlv_base: 0,
  capacidad_residual: 'Pendiente',
  fragmentos_activos: 0,
  porcentaje_indexado: 0,
  estado_indexacion: 'sin_indexar',
  ultima_carga_fecha: 'Sin cargas previas',
  archivo_nombre: 'contratos.json v0.3',
  validaciones: [
    { criterio: 'Esquema contratos.json v0.3', resultado: '—', estado: 'Sin datos' },
    { criterio: 'Contratos procesados', resultado: '0', estado: 'Sin datos' },
    { criterio: 'Restricciones financieras verificadas', resultado: '—', estado: 'Sin datos' },
    { criterio: 'Códigos de experiencia UNSPSC emparejados', resultado: '0', estado: 'Sin datos' },
  ],
};

export const MOCK_CONOCIMIENTO_RECHAZADO_422: ResumenBaseConocimiento = {
  ...MOCK_CONOCIMIENTO_VERIFICADO,
  estado_indexacion: 'rechazado',
  validaciones: [
    { criterio: 'Esquema contratos.json v0.3', resultado: '2 errores', estado: 'Falló' },
    { criterio: 'Contratos procesados', resultado: '41 / 42', estado: 'Parcial' },
    { criterio: 'Restricciones financieras verificadas', resultado: '1 / 1', estado: 'Verificado' },
    { criterio: 'Códigos de experiencia UNSPSC emparejados', resultado: '117 / 118', estado: 'Falló' },
  ],
  errores_validacion: [
    {
      linea: 42,
      campo: 'valor_contrato_smmlv',
      detalle: "Línea 42: Campo 'valor_contrato_smmlv' debe ser numérico positivo.",
    },
    {
      linea: 118,
      campo: 'codigo_unspsc',
      detalle: "Línea 118: Código UNSPSC '8110150' inválido (debe tener 8 dígitos).",
    },
  ],
};

export const MOCK_CONOCIMIENTO_INDEXANDO: ResumenBaseConocimiento = {
  ...MOCK_CONOCIMIENTO_VERIFICADO,
  porcentaje_indexado: 43,
  estado_indexacion: 'indexando',
  validaciones: [
    { criterio: 'Esquema contratos.json v0.3', resultado: 'en curso', estado: 'En proceso' },
    { criterio: 'Contratos procesados', resultado: '— / 42', estado: 'En cola' },
    { criterio: 'Restricciones financieras verificadas', resultado: '—', estado: 'En cola' },
    { criterio: 'Códigos de experiencia UNSPSC emparejados', resultado: '—', estado: 'En cola' },
  ],
};


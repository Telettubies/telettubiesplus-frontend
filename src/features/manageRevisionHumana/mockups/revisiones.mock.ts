import type { ItemVerificable } from '@/api/types';

export interface ConflictReviewItem extends ItemVerificable {
  codigo: string;
  es_habilitante: boolean;
  requisito_resumido: string;
  cita_literal_pliego: string;
  evidencia_fragmento: string;
  motivo_badge: 'Requiere verificación' | 'Redacción ambigua';
  capitulo_label: string;
  similitud_porcentaje: number;
  pliego_resaltado_fragmento?: string;
}

export const MOCK_REVISIONES_PENDIENTES: ConflictReviewItem[] = [
  {
    id: 'rev-019',
    codigo_req: 'REQ-019',
    codigo: 'REQ-019',
    numeral: 'Numeral 3.4.2',
    categoria: 'habilitantes',
    es_habilitante: true,
    requisito_resumido:
      '"El proponente deberá acreditar disponibilidad de maquinaria pesada propia o bajo arrendamiento financiero..."',
    cita_literal_pliego:
      '3.4.2 El proponente deberá acreditar disponibilidad de maquinaria pesada propia o bajo arrendamiento financiero, con antigüedad no superior a cinco (5) años.',
    pliego_resaltado_fragmento: 'disponibilidad de maquinaria pesada propia',
    estado: 'revision',
    cita_verificada: false,
    similitud_porcentaje: 78,
    motivo_badge: 'Requiere verificación',
    capitulo_label: 'Capítulo Jurídico · Pág. 22 del Pliego',
    evidencia_vinculada: 'Contrato Obra Vial 2024-C08 (Pág. 12)',
    evidencia_fuente: 'Contrato Obra Vial 2024-C08 (Pág. 12)',
    evidencia_fragmento:
      '"Contrato Obra Vial 2024-C08 (Pág. 12): suministro de pavimentadora y compactadores bajo arrendamiento operativo, 18 meses..."',
    ubicacion: {
      pagina: 22,
      precision: 'exacta',
      zonas: [{ x: 0.06, y: 0.28, width: 0.88, height: 0.14 }],
    },
  },
  {
    id: 'rev-022',
    codigo_req: 'REQ-022',
    codigo: 'REQ-022',
    numeral: 'Numeral 5.2',
    categoria: 'tecnicos',
    es_habilitante: false,
    requisito_resumido: '"Plan de gestión ambiental y SST aprobado por la entidad..."',
    cita_literal_pliego:
      '5.2 El proponente presentará un plan de gestión ambiental y SST aprobado por la entidad antes de la firma del acta de inicio.',
    pliego_resaltado_fragmento: 'plan de gestión ambiental y SST aprobado por la entidad',
    estado: 'revision',
    cita_verificada: false,
    similitud_porcentaje: 71,
    motivo_badge: 'Redacción ambigua',
    capitulo_label: 'Capítulo Técnico · Pág. 31 del Pliego',
    evidencia_vinculada: 'Plan_SST_2025.pdf (Pág. 4)',
    evidencia_fuente: 'Plan_SST_2025.pdf (Pág. 4)',
    evidencia_fragmento:
      '"Plan_SST_2025.pdf (Pág. 4): programa de gestión ambiental y seguridad en obra, vigente a 2026..."',
    ubicacion: {
      pagina: 31,
      precision: 'aproximada',
      zonas: [{ x: 0.06, y: 0.34, width: 0.88, height: 0.14 }],
    },
  },
  {
    id: 'rev-017',
    codigo_req: 'REQ-017',
    codigo: 'REQ-017',
    numeral: 'Numeral 3.3.2',
    categoria: 'habilitantes',
    es_habilitante: true,
    requisito_resumido: '"Director de obra con posgrado y ocho (8) años de experiencia..."',
    cita_literal_pliego:
      '3.3.2 Director de obra. Ingeniero civil con título de posgrado en gerencia de obras o afines y experiencia profesional mínima de ocho (8) años como director de obras civiles.',
    pliego_resaltado_fragmento: 'posgrado en gerencia de obras o afines y experiencia profesional mínima de ocho (8) años',
    estado: 'revision',
    cita_verificada: false,
    similitud_porcentaje: 81,
    motivo_badge: 'Requiere verificación',
    capitulo_label: 'Capítulo Jurídico · Pág. 15 del Pliego',
    evidencia_vinculada: 'HV_Dir_Obra_Castro.pdf (Pág. 2)',
    evidencia_fuente: 'HV_Dir_Obra_Castro.pdf (Pág. 2)',
    evidencia_fragmento:
      '"HV_Dir_Obra_Castro.pdf (Pág. 2): Director de obra, 2016–2025 (9 años). Especialización en Gerencia de Obras Civiles..."',
    ubicacion: {
      pagina: 15,
      precision: 'aproximada',
      zonas: [{ x: 0.06, y: 0.36, width: 0.88, height: 0.14 }],
    },
  },
  {
    id: 'rev-024',
    codigo_req: 'REQ-024',
    codigo: 'REQ-024',
    numeral: 'Numeral 6.3',
    categoria: 'habilitantes',
    es_habilitante: true,
    requisito_resumido: '"Póliza de seriedad de la oferta por el 10 % del presupuesto..."',
    cita_literal_pliego:
      '6.3 Garantía de seriedad de la oferta. El proponente deberá constituir póliza de seriedad por el diez por ciento (10 %) del presupuesto oficial estimado.',
    pliego_resaltado_fragmento: 'póliza de seriedad por el diez por ciento (10 %)',
    estado: 'revision',
    cita_verificada: false,
    similitud_porcentaje: 68,
    motivo_badge: 'Redacción ambigua',
    capitulo_label: 'Capítulo Jurídico · Pág. 38 del Pliego',
    evidencia_vinculada: 'Cupo_Aseguradora_SegurosEstado.pdf',
    evidencia_fuente: 'Cupo_Aseguradora_SegurosEstado.pdf (Pág. 1)',
    evidencia_fragmento:
      '"Certificación de cupo preaprobado de garantías contractuales hasta por 8.500 SMMLV..."',
    ubicacion: {
      pagina: 38,
      precision: 'solo_pagina',
      zonas: [],
    },
  },
];

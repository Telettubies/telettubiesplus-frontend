import type { UbicacionPliego } from '@/api/types';

export const MOCK_UBICACIONES_PDF: Record<string, UbicacionPliego> = {
  exacta: {
    pagina: 14,
    precision: 'exacta',
    zonas: [{ x: 0.055, y: 0.25, width: 0.89, height: 0.16 }],
  },
  aproximada: {
    pagina: 15,
    precision: 'aproximada',
    zonas: [{ x: 0.08, y: 0.39, width: 0.84, height: 0.14 }],
  },
  solo_pagina: {
    pagina: 38,
    precision: 'solo_pagina',
    zonas: [],
  },
};

export interface PageContentMock {
  pagina: number;
  header: string;
  sectionTitle: string;
  introParagraph: string;
  clauses: {
    numeral: string;
    reqCode?: string;
    text: string;
  }[];
  footerSectionTitle?: string;
  footerText?: string;
}

export const MOCK_PLIEGO_PAGES_CONTENT: Record<number, PageContentMock> = {
  8: {
    pagina: 8,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 8',
    sectionTitle: '2.0 CAPACIDAD JURÍDICA Y CONDICIONES HABILITANTES',
    introParagraph:
      'Los proponentes deberán demostrar que a la fecha de cierre del proceso cuentan con la personería jurídica y facultades estatutarias suficientes.',
    clauses: [
      {
        numeral: '2.4',
        reqCode: 'REQ-011',
        text: '2.4 Capacidad Jurídica. El proponente deberá acreditar capacidad jurídica, existencia y representación legal con fecha de expedición no mayor a treinta (30) días calendario contados antes del cierre del proceso.',
      },
    ],
    footerSectionTitle: '2.5 INHABILIDADES E INCOMPATIBILIDADES',
    footerText:
      'El proponente declarará bajo la gravedad de juramento que no se halla incurso en causales de inhabilidad.',
  },
  11: {
    pagina: 11,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 11',
    sectionTitle: '3.1 REQUISITOS HABILITANTES RUP',
    introParagraph:
      'La verificación de la inscripción y firmeza de la información se efectuará con el certificado RUP expedido por la Cámara de Comercio.',
    clauses: [
      {
        numeral: '3.1.2',
        reqCode: 'REQ-012',
        text: '3.1.2 Registro Único de Proponentes. Presentar RUP vigente y en firme con clasificación en el código UNSPSC 72101500 (Servicios de apoyo para la construcción y edificación).',
      },
    ],
  },
  12: {
    pagina: 12,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 12',
    sectionTitle: '3.1.4 PAGOS AL SISTEMA DE SEGURIDAD SOCIAL Y PARAFISCALES',
    introParagraph:
      'En cumplimiento del artículo 50 de la Ley 789 de 2002, se acreditará el pago de aportes correspondientes a la nómina de trabajadores.',
    clauses: [
      {
        numeral: '3.1.4',
        reqCode: 'REQ-013',
        text: '3.1.4 Aportes Parafiscales. Certificar el pago de aportes a seguridad social y parafiscales de los últimos seis (6) meses suscrito por el Revisor Fiscal o Representante Legal.',
      },
    ],
  },
  14: {
    pagina: 14,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 14',
    sectionTitle: '3.2 EXPERIENCIA DEL PROPONENTE',
    introParagraph:
      'La experiencia se verificará con base en el Registro Único de Proponentes (RUP) y los soportes adicionales que la Entidad estime necesarios para la evaluación de las ofertas.',
    clauses: [
      {
        numeral: '3.2.1',
        reqCode: 'REQ-014',
        text: '3.2.1 Experiencia específica. El proponente deberá acreditar, mediante máximo tres (3) contratos ejecutados y terminados en los últimos diez (10) años, la construcción o mejoramiento de mínimo cuatro mil metros cuadrados (4.000 m²) de pavimentación asfáltica en vías primarias.',
      },
      {
        numeral: '3.2.2',
        reqCode: 'REQ-015',
        text: '3.2.2 Valor acumulado. Los contratos aportados deberán sumar un valor igual o superior a seis mil (6.000) SMMLV, expresado a la fecha de terminación de cada contrato.',
      },
      {
        numeral: '3.2.3',
        text: '3.2.3 No se aceptarán contratos ejecutados en consorcio o unión temporal cuando la participación del proponente sea inferior al treinta por ciento (30 %).',
      },
    ],
    footerSectionTitle: '3.3 PERSONAL CLAVE MÍNIMO',
    footerText:
      'El proponente deberá presentar las hojas de vida del equipo de trabajo con los soportes de formación y experiencia profesional.',
  },
  15: {
    pagina: 15,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 15',
    sectionTitle: '3.3 PERSONAL CLAVE MÍNIMO (CONTINUACIÓN)',
    introParagraph:
      '3.3.1 Ingeniero residente. Profesional en ingeniería civil con experiencia profesional mínima de cinco (5) años, de los cuales tres (3) deberán corresponder a obras de infraestructura vial.',
    clauses: [
      {
        numeral: '3.3.1',
        reqCode: 'REQ-016',
        text: '3.3.1 Personal Clave - Ingeniero Residente. Acreditar un (1) ingeniero residente en ingeniería civil o vías con mínimo cinco (5) años de experiencia específica en proyectos viales.',
      },
      {
        numeral: '3.3.2',
        reqCode: 'REQ-017',
        text: '3.3.2 Director de obra. Ingeniero civil con título de posgrado en gerencia de obras o afines y experiencia profesional mínima de ocho (8) años como director de obras civiles.',
      },
      {
        numeral: '3.3.3',
        text: '3.3.3 Los profesionales deberán acreditar matrícula profesional vigente y no tener sanciones disciplinarias a la fecha de presentación de la oferta.',
      },
    ],
    footerSectionTitle: '3.4 REQUISITOS ADICIONALES',
    footerText:
      'Los documentos aportados en idioma extranjero deberán presentarse con traducción oficial y apostilla cuando corresponda.',
  },
  19: {
    pagina: 19,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 19',
    sectionTitle: '4.0 CAPACIDAD FINANCIERA Y ORGANIZACIONAL',
    introParagraph:
      'Los indicadores financieros se verificarán con corte al 31 de diciembre del año inmediatamente anterior con base en la información en firme del RUP.',
    clauses: [
      {
        numeral: '4.2',
        reqCode: 'REQ-018',
        text: '4.2 Capacidad Financiera — Índice de Liquidez. El proponente deberá contar con un índice de liquidez (Activo Corriente / Pasivo Corriente) mayor o igual a 1,5.',
      },
      {
        numeral: '4.3',
        reqCode: 'REQ-019',
        text: '4.3 Nivel de Endeudamiento. El proponente deberá acreditar un índice de endeudamiento menor o igual al sesenta por ciento (60 %).',
      },
    ],
  },
  20: {
    pagina: 20,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 20',
    sectionTitle: '4.4 CAPITAL DE TRABAJO MÍNIMO',
    introParagraph:
      'El capital de trabajo respalda la capacidad de maniobra y flujo operativo para el inicio de las actividades contractuales.',
    clauses: [
      {
        numeral: '4.4',
        reqCode: 'REQ-020',
        text: '4.4 Capital de Trabajo. El capital de trabajo acreditado en el RUP deberá ser igual o superior a tres mil (3.000) SMMLV al momento del cierre de la convocatoria.',
      },
    ],
  },
  28: {
    pagina: 28,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 28',
    sectionTitle: '5.0 SISTEMAS DE GESTIÓN Y CALIDAD',
    introParagraph:
      'Se evaluará la adopción de estándares internacionales en aseguramiento de calidad técnica para obras de pavimentación.',
    clauses: [
      {
        numeral: '5.1',
        reqCode: 'REQ-021',
        text: '5.1 Sistemas de Gestión de Calidad. Certificación ISO 9001:2015 vigente a la fecha de cierre del proceso en alcance de construcción de obras civiles o viales.',
      },
    ],
  },
  31: {
    pagina: 31,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 31',
    sectionTitle: '5.2 PLAN DE GESTIÓN AMBIENTAL Y SST',
    introParagraph:
      'Disposiciones de cumplimiento en seguridad laboral, salud en el trabajo y mitigación de impacto ambiental.',
    clauses: [
      {
        numeral: '5.2',
        reqCode: 'REQ-022',
        text: '5.2 El proponente presentará un plan de gestión ambiental y SST aprobado por la entidad antes de la firma del acta de inicio.',
      },
    ],
  },
  35: {
    pagina: 35,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 35',
    sectionTitle: '6.0 PLAZO Y EJECUCIÓN DEL CONTRATO',
    introParagraph:
      'Condiciones temporales para el cumplimiento de los hitos y cronograma general de pavimentación.',
    clauses: [
      {
        numeral: '6.1',
        reqCode: 'REQ-023',
        text: '6.1 Plazo de Ejecución. El plazo máximo de ejecución de las obras será de dieciocho (18) meses calendario contados a partir del acta de inicio.',
      },
    ],
  },
  38: {
    pagina: 38,
    header: 'LICITACIÓN PÚBLICA No. LP-MIN-001-2026 · PLIEGO DE CONDICIONES · PÁG. 38',
    sectionTitle: '6.3 GARANTÍAS CONTRACTUALES',
    introParagraph:
      'Constitución de amparos para garantizar la seriedad de la oferta y cumplimiento posterior.',
    clauses: [
      {
        numeral: '6.3',
        reqCode: 'REQ-024',
        text: '6.3 Garantía de Seriedad. Póliza de seriedad de la oferta por el diez por ciento (10 %) del presupuesto oficial y vigencia de tres (3) meses contados a partir del cierre.',
      },
    ],
  },
};

import type { BorradorObservacion, MensajeChat } from '@/api/types';

export const MOCK_CHAT_HISTORIAL: MensajeChat[] = [
  {
    id: 'msg-1',
    rol: 'usuario',
    contexto: 'Numeral 2.3.1 — Garantía de seriedad (Pág. 11)',
    contenido:
      '¿Cuál es la vigencia requerida para la garantía de seriedad de la oferta y qué porcentaje del presupuesto exige?',
    creado_en: '2026-11-11T16:10:00Z',
  },
  {
    id: 'msg-2',
    rol: 'asistente',
    contenido:
      'La garantía de seriedad debe tener una vigencia de tres (3) meses contados a partir del cierre del proceso, por un valor equivalente al diez por ciento (10%) del presupuesto oficial estimado.',
    creado_en: '2026-11-11T16:10:03Z',
    referencias: [
      { etiqueta: 'Numeral 2.3.1', pagina: 11 },
      { etiqueta: 'Anexo 3 - Pólizas', pagina: 48 },
    ],
  },
  {
    id: 'msg-3',
    rol: 'usuario',
    contexto: 'Numeral 1.8 — Plazos del cronograma (Pág. 6)',
    contenido: '¿Qué plazo tiene la entidad para responder las observaciones al pliego?',
    creado_en: '2026-11-11T16:11:10Z',
  },
  {
    id: 'msg-4',
    rol: 'asistente',
    contenido:
      'La entidad responderá las observaciones presentadas dentro del término fijado en el cronograma del proceso, previo al cierre de la audiencia de aclaraciones.',
    creado_en: '2026-11-11T16:11:14Z',
    referencias: [{ etiqueta: 'Numeral 1.8', pagina: 6 }],
  },
];

export const MOCK_SUGGESTED_QUESTIONS: string[] = [
  '¿Cuáles son los criterios de desempate?',
  '¿Qué multas por mora contempla el contrato?',
  '¿Se permite la experiencia de socios?',
];

export const MOCK_BORRADORES_OBSERVACION: Record<string, BorradorObservacion> = {
  'REQ-019': {
    id: 'obs-019',
    requisito_id: 'REQ-019',
    requisito_label: 'REQ-019 (Numeral 3.4.2 - Maquinaria y Equipos Propios)',
    clausula_origen:
      '"3.4.2 El proponente deberá acreditar disponibilidad de maquinaria pesada propia o bajo arrendamiento financiero..."',
    destinatario: 'Señores Ministerio de Transporte - Comité Evaluador',
    hecho_cuestionado:
      'El Numeral 3.4.2 limita la acreditación de maquinaria a la propiedad o al arrendamiento financiero.',
    sustento_juridico:
      'La restricción afecta la libre concurrencia y el principio de proporcionalidad previstos en la Ley 80 de 1993 y la Ley 1150 de 2007, conforme a las guías de Colombia Compra Eficiente.',
    solicitud_concreta:
      'Se solicita a la entidad modificar el Numeral 3.4.2 para permitir contratos de arrendamiento operativo sin restricción de antigüedad.',
  },
  'REQ-022': {
    id: 'obs-022',
    requisito_id: 'REQ-022',
    requisito_label: 'REQ-022 (Numeral 5.2 - Plan de Gestión Ambiental y SST)',
    clausula_origen:
      '"5.2 El proponente presentará un plan de gestión ambiental y SST aprobado por la entidad..."',
    destinatario: 'Señores Ministerio de Transporte - Comité Evaluador',
    hecho_cuestionado:
      'El Numeral 5.2 no precisa si la aprobación del plan SST es requisito habilitante al cierre o requisito de ejecución contractual.',
    sustento_juridico:
      'Conforme al principio de selección objetiva (Ley 1150 de 2007, Art. 5), las obligaciones posteriores a la adjudicación no constituyen requisitos habilitantes.',
    solicitud_concreta:
      'Se solicita aclarar mediante adenda que el Plan SST será exigible únicamente al adjudicatario previo a la suscripción del acta de inicio.',
  },
};


import React from 'react';
import type { Step } from 'react-joyride';

export interface TourStepData {
  route?: string;
}

export interface TourStepCardProps {
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  exampleCaption?: string;
}

export const TourStepCard: React.FC<TourStepCardProps> = ({
  description,
  imageSrc,
  imageAlt = 'Visualización',
  exampleCaption,
}) => {
  return (
    <div className="space-y-3 font-sans text-left">
      <p className="text-xs text-slate-700 leading-relaxed font-normal">
        {description}
      </p>

      {imageSrc && (
        <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-900/5 shadow-2xs">
          <div className="relative group">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-32 sm:h-36 object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />
            {exampleCaption && (
              <div className="px-2.5 py-1.5 bg-slate-900/85 backdrop-blur-xs text-[10px] text-white flex items-center">
                <span className="font-medium tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  {exampleCaption}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Recorrido guiado inicial de inducción al sistema para un primer usuario (estado inicial limpio).
 * Se enfoca exclusivamente en la interfaz real de la aplicación, destacando los componentes activos
 * sin imágenes redundantes ni pasos prematuros a licitaciones inexistentes.
 */
export const FULL_SYSTEM_TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="sidebar-nav"]',
    title: '1. Menú Lateral de Navegación',
    content: (
      <TourStepCard
        description="Desde este panel izquierdo te desplazas entre las secciones principales: Portafolio de Licitaciones, Carga de Pliegos, Base de Conocimiento y Gestión de Equipo."
      />
    ),
    disableBeacon: true,
    placement: 'right',
    data: { route: '/licitaciones' },
  },
  {
    target: '[data-tour="topbar-actions"]',
    title: '2. Barra Superior: Rol y Sesión',
    content: (
      <TourStepCard
        description="En la barra superior puedes alternar tu perfil entre Administrador y Revisor para probar permisos, consultar tu usuario activo o cerrar sesión."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
    data: { route: '/licitaciones' },
  },
  {
    target: '[data-tour="portfolio-kpis"]',
    title: '3. Portafolio — Indicadores Ejecutivos',
    content: (
      <TourStepCard
        description="Tu portafolio arranca en estado inicial limpio. Una vez proceses pliegos de contratación, este resumen consolidará los procesos viables para presentarse, en riesgo con consorcio o descartados."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
    data: { route: '/licitaciones' },
  },
  {
    target: '[data-tour="portfolio-filters"]',
    title: '4. Portafolio — Búsqueda, Filtros y Nuevo Pliego',
    content: (
      <TourStepCard
        description="Filtra licitaciones por código de proceso, entidad, categoría o estado de habilitación, o inicia rápidamente la carga de un nuevo pliego en formato PDF."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
    data: { route: '/licitaciones' },
  },
  {
    target: '[data-tour="portfolio-table"]',
    title: '5. Portafolio — Listado de Licitaciones',
    content: (
      <TourStepCard
        description="Tu espacio está listo para recibir tu primer pliego. Al procesar un documento oficial, cada fila mostrará el avance del pipeline, la fecha límite y la recomendación generada por la IA."
      />
    ),
    disableBeacon: true,
    placement: 'top',
    data: { route: '/licitaciones' },
  },
  {
    target: '[data-tour="upload-dropzone"]',
    title: '6. Carga de Pliego en PDF',
    content: (
      <TourStepCard
        description="Aquí seleccionas o arrastras el documento PDF del pliego de condiciones de SECOP para iniciar la extracción automatizada de numerales y requisitos."
      />
    ),
    disableBeacon: true,
    placement: 'right',
    data: { route: '/licitaciones/nueva' },
  },
  {
    target: '[data-tour="upload-stepper"]',
    title: '7. Etapas del Análisis del Pliego',
    content: (
      <TourStepCard
        description="Sigue en tiempo real las fases del pipeline: lectura de texto OCR, extracción de numerales, contrastación con la experiencia de la empresa y consolidación de la matriz."
      />
    ),
    disableBeacon: true,
    placement: 'left',
    data: { route: '/licitaciones/nueva' },
  },
  {
    target: '[data-tour="knowledge-kpis"]',
    title: '8. Fichero Corporativo — Capacidad y Almacenamiento',
    content: (
      <TourStepCard
        description="Muestra las métricas de carpetas, almacenamiento y estado de sincronización con el motor de IA para contraste de pliegos."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
    data: { route: '/configuracion/conocimiento' },
  },
  {
    target: '[data-tour="knowledge-editable-records"]',
    title: '9. Fichero Corporativo — Carpetas y Documentos',
    content: (
      <TourStepCard
        description="Organiza la información de tu empresa estilo Google Drive: crea carpetas, sube contratos, certificados RUP y hojas de vida, o arrastra archivos directamente."
      />
    ),
    disableBeacon: true,
    placement: 'top',
    data: { route: '/configuracion/conocimiento' },
  },
  {
    target: '[data-tour="team-members-section"]',
    title: '10. Gestión de Equipo y Permisos',
    content: (
      <TourStepCard
        description="Invita a los integrantes de tu equipo técnico, financiero y legal. Asigna roles de Administrador o Revisor para colaborar en la toma de decisiones sobre las licitaciones."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
    data: { route: '/configuracion/miembros' },
  },
  {
    target: '[data-tour="portfolio-table"]',
    title: '11. ¡Todo listo para tu primer pliego!',
    content: (
      <TourStepCard
        description="Has completado la introducción a CRITERIO. Al cargar tu primer pliego oficial, el sistema habilitará el recorrido avanzado por la Matriz de Requisitos, Estados y Gráficas, Revisión Humana, Asistente Legal y el Visor Enfocado a Pantalla Completa."
      />
    ),
    disableBeacon: true,
    placement: 'top',
    data: { route: '/licitaciones' },
  },
];

/**
 * Recorrido guiado especializado para cuando el usuario ingresa a una licitación ya analizada.
 */
export const ANALYSIS_TENDER_TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="subnav-tabs"]',
    title: '1. Pestañas de Análisis de la Licitación',
    content: (
      <TourStepCard
        description="La licitación se organiza en 4 secciones especializadas: Estados y Gráficas (con la Matriz completa), Visor del Pliego, Revisión Humana y Asistente Legal."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-graficas"]',
    title: '2. Estados, Gráficas y Matriz de Requisitos',
    content: (
      <TourStepCard
        description="Primera sección analítica: veredicto ejecutivo, gráficos de cobertura y la tabla matriz completa de requisitos con sus evidencias vinculadas."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-matriz"]',
    title: '3. Visor del Pliego de Condiciones',
    content: (
      <TourStepCard
        description="Inspección dedicada del documento PDF oficial en vista larga continua, con índice lateral sincronizado y redactor de observaciones."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-revision"]',
    title: '4. Bandeja de Revisión Humana',
    content: (
      <TourStepCard
        description="Audita discrepancias, resuelve ambigüedades jurídicas y toma decisiones de validación con trazabilidad completa de firma."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-chat"]',
    title: '5. Asistente Legal del Pliego',
    content: (
      <TourStepCard
        description="Consulta dudas normativas adjuntando cláusulas como contexto directo (al estilo de Gemini y ChatGPT) y genera observaciones técnicas."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="btn-visor-enfocado"]',
    title: '6. Visor a Pantalla Completa',
    content: (
      <TourStepCard
        description="Abre el pliego a pantalla completa en una nueva pestaña para trabajar con máxima concentración, índice lateral sincronizado y panel de evidencias."
      />
    ),
    disableBeacon: true,
    placement: 'bottom',
  },
];

export const TENDER_ANALYSIS_TOUR_STEPS = FULL_SYSTEM_TOUR_STEPS;

export function getStartStepIndexForPath(pathname: string): number {
  if (pathname.includes('/licitaciones/nueva') || pathname.includes('/progreso')) {
    return 5;
  }
  if (pathname.includes('/configuracion/conocimiento')) {
    return 7;
  }
  if (pathname.includes('/configuracion/miembros')) {
    return 9;
  }
  return 0;
}

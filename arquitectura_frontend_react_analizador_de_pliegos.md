# Arquitectura Frontend en React — Analizador de Pliegos y Matriz de Cobertura

Este documento establece la estructura modular, los estándares de diseño, la gestión de estados UX, el sistema de mockups intercambiables y la estrategia de pruebas para el cliente web del **Analizador de pliegos y matriz de cobertura**, asegurando fidelidad total con el **DAS v0.3** y las historias de usuario (`HU-F01` a `HU-F16`).

---

## 1. Stack Tecnológico Confirmado

* **Core:** React + TypeScript (SPA).
* **Estilos y Diseño:** Tailwind CSS con configuración de tokens personalizados y soporte para temas/variantes visuales.
* **Conexión Backend (FastAPI):** `axios` con instancia centralizada e interceptores JWT.
* **Autenticación:** `@supabase/supabase-js` (exclusivamente con `VITE_SUPABASE_ANON_KEY`; jamás se expone la `service_role_key`).
* **Visor de PDF (`RF-26`):** `react-pdf` con capa de renderizado de coordenadas normalizadas (`UbicacionPliego`).
* **Iconografía:** `react-icons` (estándar único en toda la aplicación para garantizar accesibilidad semántica junto a texto y color).
* **Animaciones Interactivas:** `framer-motion` (transiciones fluidas entre niveles del dashboard, microinteracciones, aparición de resaltados y estados de carga animados).
* **Guía Interactiva de Usuario:** `react-joyride` con persistencia provisional del estado mediante cookies del navegador (`js-cookie`).
* **Testing:** `Jest` + `React Testing Library` (pruebas unitarias y de componentes/hooks) y `Playwright` (pruebas End-to-End de flujos completos).

---

## 2. Estructura de Directorios del Proyecto

La arquitectura sigue una separación estricta de responsabilidades: las páginas (`pages/`) actúan **únicamente como orquestadores visuales**, mientras que toda la lógica de dominio, estado, servicios, mockups, estilos y pruebas vive encapsulada dentro de cada módulo en `features/manage<NombreDelPage>/`.

```text
frontend/
├── e2e/                                      # Pruebas End-to-End globales con Playwright
│   ├── fixtures/                             # PDFs de prueba y datos sintéticos
│   ├── auth-y-roles.spec.ts                  # Flujo login, rutas privadas y permisos admin/revisor
│   ├── carga-y-progreso.spec.ts              # Subida de pliego, polling y redirección
│   └── matriz-y-visor-pdf.spec.ts            # Salto de página, resaltado amarillo y revisión humana
│
├── src/
│   ├── api/                                  # 1. CONEXIÓN GENERAL AL BACKEND (FastAPI + Axios)
│   │   ├── axiosClient.ts                    # Instancia base de Axios (baseURL, timeout, headers)
│   │   ├── interceptors.ts                   # Inyección de Bearer JWT de Supabase y manejo 401/403/404/429
│   │   ├── endpoints.ts                      # Diccionario centralizado de rutas REST de FastAPI
│   │   └── types.ts                          # Contratos globales de respuesta HTTP y errores estandarizados
│   │
│   ├── routes/                               # 2. RUTAS PRIVADAS Y CONTROL DE ACCESO
│   │   ├── AppRouter.tsx                     # Definición central de rutas públicas y privadas
│   │   ├── PrivateRoute.tsx                  # Guard de sesión activa (redirige a /login?redirect=...)
│   │   ├── RoleRoute.tsx                     # Guard por rol desde entidad Miembro ('administrador' | 'revisor')
│   │   └── routePaths.ts                     # Constantes de rutas tipadas
│   │
│   ├── shared/                               # 3. RECURSOS COMPARTIDOS Y SISTEMA DE DISEÑO
│   │   ├── components/                       # Componentes UI reutilizables y transversales
│   │   │   ├── feedback/                     # Estados UX estandarizados
│   │   │   │   ├── SkeletonLoader.tsx        # Esqueletos de carga estructurales (tarjetas, tablas, visor)
│   │   │   │   ├── CalmingSpinner.tsx        # Ícono animado (react-icons + framer-motion) con mensaje tranquilizador
│   │   │   │   ├── StatusBanner.tsx          # Alertas de Success, Warning, Error e Info
│   │   │   │   ├── EmptyState.tsx            # Estados vacíos guiados con CTA claro (HU-F15)
│   │   │   │   └── ErrorBoundary.tsx         # Aislamiento de fallos por panel (HU-F15)
│   │   │   ├── badges/                       # Badges accesibles (Color + Ícono react-icons + Texto obligatorio)
│   │   │   │   ├── ComplianceBadge.tsx       # Cumple | Cumple parcialmente | No cumple | En revisión
│   │   │   │   ├── RecommendationBadge.tsx   # Presentarse | Con riesgo | No presentarse | Condicionada
│   │   │   │   └── CategoryBadge.tsx         # Habilitante | Técnico | Experiencia | Plazo
│   │   │   ├── layout/                       # Estructura base (Navbar, Sidebar por rol, SplitPane)
│   │   │   ├── modals/                       # Modal de confirmación reutilizable (acciones destructivas/críticas)
│   │   │   └── tour/                         # Guía de usuario con react-joyride
│   │   │       ├── GuidedTourProvider.tsx    # Orquestador de react-joyride
│   │   │       └── tourSteps.ts              # Definición de pasos del recorrido guiado
│   │   ├── hooks/                            # Hooks transversales (useAuth, useCookieState, useDebounce)
│   │   ├── utils/                            # Utilidades compartidas
│   │   │   ├── cookieStorage.ts              # Lectura/escritura segura de cookies para react-joyride
│   │   │   ├── sanitizeText.ts               # Prevención XSS (S-11): limpieza de texto plano/Markdown
│   │   │   ├── formatters.ts                 # Formato de fechas, SMMLV, porcentajes y numerales
│   │   │   └── mockSwitch.ts                 # Helper para alternar mockups globalmente o por feature
│   │   ├── styles/                           # Diseño personalizado Tailwind y tokens
│   │   │   ├── tailwind.tokens.css           # Variables CSS (--color-primary, --surface-card, etc.)
│   │   │   └── custom-themes.css             # Opciones de temas personalizados (Claro / Alto Contraste)
│   │   └── tests/                            # Pruebas compartidas con Jest
│   │       ├── setupTests.ts                 # Configuración global de Jest y mocks de navegador
│   │       ├── badges.test.tsx               # Verifica que todo estado tenga ícono + texto además de color
│   │       └── interceptors.test.ts          # Verifica redirección 401 y opacidad 403/404
│   │
│   ├── pages/                                # 4. ORQUESTADORES DE PÁGINA (Sin lógica de negocio)
│   │   ├── LoginPage.tsx                     # Orquesta manageAuth
│   │   ├── AcceptInvitationPage.tsx          # Orquesta manageAuth (flujo invitación)
│   │   ├── MembersManagementPage.tsx         # Orquesta manageMiembros (Solo Admin)
│   │   ├── KnowledgeBasePage.tsx             # Orquesta manageBaseConocimiento (Solo Admin)
│   │   ├── TendersListPage.tsx               # Orquesta managePanelLicitaciones
│   │   ├── TenderUploadPage.tsx              # Orquesta manageCargaYProgreso (subida)
│   │   ├── TenderProgressPage.tsx            # Orquesta manageCargaYProgreso (polling)
│   │   └── TenderAnalysisPage.tsx            # Orquesta Dashboard 3 Niveles + Visor PDF + Revisión + Chat
│   │
│   └── features/                             # 5. MÓDULOS DE DOMINIO (manage<NombreDelPage>)
│       ├── manageAuth/                       # HU-F01, HU-F02
│       │   ├── components/                   # LoginForm, AcceptInviteForm, PasswordRulesChecklist
│       │   ├── hooks/                        # useLogin, useAcceptInvitation
│       │   ├── services/                     # authService.ts (Supabase Auth + GET /me en FastAPI)
│       │   ├── mockups/                      # auth.mock.ts (usuarios admin y revisor de prueba)
│       │   ├── utils/                        # authValidators.ts
│       │   ├── styles/                       # auth.animations.css
│       │   └── tests/                        # LoginForm.test.tsx, useLogin.test.ts (Jest)
│       │
│       ├── manageMiembros/                   # HU-F03 (Solo Administrador)
│       │   ├── components/                   # MembersTable, InviteMemberModal, RoleChangeConfirmModal
│       │   ├── hooks/                        # useOrganizationMembers
│       │   ├── services/                     # miembrosService.ts
│       │   ├── mockups/                      # miembros.mock.ts
│       │   ├── utils/                        # memberPermissions.ts (protección último administrador)
│       │   ├── styles/                       # miembros.styles.css
│       │   └── tests/                        # MembersTable.test.tsx (Jest)
│       │
│       ├── manageBaseConocimiento/           # HU-F04 (Solo Administrador)
│       │   ├── components/                   # KnowledgeUploader, ReplaceWarningBanner, ValidationErrorsList, IndexingSummaryCard
│       │   ├── hooks/                        # useKnowledgeBaseUpload
│       │   ├── services/                     # conocimientoService.ts
│       │   ├── mockups/                      # conocimiento.mock.ts (respuesta éxito y respuesta 422 multi-error)
│       │   ├── utils/                        # filePrecheck.ts
│       │   ├── styles/                       # conocimiento.animations.css
│       │   └── tests/                        # KnowledgeUploader.test.tsx (Jest)
│       │
│       ├── managePanelLicitaciones/          # HU-F14
│       │   ├── components/                   # TendersTable, TenderRowCard, TendersFilterBar
│       │   ├── hooks/                        # useTendersList
│       │   ├── services/                     # licitacionesListService.ts
│       │   ├── mockups/                      # licitacionesList.mock.ts
│       │   ├── utils/                        # sortTenders.ts
│       │   ├── styles/                       # panel.styles.css
│       │   └── tests/                        # TendersTable.test.tsx (Jest)
│       │
│       ├── manageCargaYProgreso/             # HU-F05, HU-F06
│       │   ├── components/                   # PdfDropzone, PipelineStepper, SectionsProgressCounter, ErrorRetryCard
│       │   ├── hooks/                        # usePdfUpload, useAnalysisPolling (detención automática)
│       │   ├── services/                     # cargaProgresoService.ts
│       │   ├── mockups/                      # progreso.mock.ts (simula avance etapa por etapa en vivo)
│       │   ├── utils/                        # pdfClientValidation.ts (tamaño y MIME)
│       │   ├── styles/                       # stepper.animations.css
│       │   └── tests/                        # useAnalysisPolling.test.ts, PdfDropzone.test.tsx (Jest)
│       │
│       ├── manageDashboardMatriz/            # HU-F07, HU-F08, HU-F09, HU-F16
│       │   ├── components/                   # RecommendationHeroCard (Nivel 1), GapsPriorityList (Nivel 2), CategoryAccordion (Nivel 2), ItemDetailDrawer (Nivel 3), CitationVerificationBadge, ExportExcelButton
│       │   ├── hooks/                        # useTenderMatrix, useMatrixFilters, useKeyboardMatrixNav
│       │   ├── services/                     # matrizService.ts
│       │   ├── mockups/                      # matrizResultado.mock.ts (pliego SECOP completo con brechas y citas)
│       │   ├── utils/                        # sortGapsHabilitantesFirst.ts, countVerification.ts
│       │   ├── styles/                       # matrix.animations.css
│       │   └── tests/                        # DashboardLevels.test.tsx, GapsPriorityList.test.tsx (Jest)
│       │
│       ├── manageVisorPliego/                # HU-F10, RF-26
│       │   ├── components/                   # PdfViewerContainer, HighlightOverlayLayer, PrecisionAlertBadge, AssignedEvidenceSidebar, ViewerToolbar
│       │   ├── hooks/                        # usePdfBlobCache (descarga única + renovación silenciosa de URL S3), usePdfJumpAndHighlight
│       │   ├── services/                     # visorPdfService.ts
│       │   ├── mockups/                      # ubicacionesPdf.mock.ts (coordenadas exacta, aproximada y solo_pagina)
│       │   ├── utils/                        # normalizeBoxCoordinates.ts
│       │   ├── styles/                       # pdfHighlight.css (animación de pulso amarillo semitransparente)
│       │   └── tests/                        # HighlightOverlayLayer.test.tsx, usePdfBlobCache.test.ts (Jest)
│       │
│       ├── manageRevisionHumana/             # HU-F11
│       │   ├── components/                   # ReviewInboxDrawer, ReviewDecisionForm, RecommendationChangeModal, ReviewAuditTimeline
│       │   ├── hooks/                        # useHumanReview
│       │   ├── services/                     # revisionService.ts
│       │   ├── mockups/                      # revisiones.mock.ts
│       │   ├── utils/                        # detectRecommendationShift.ts
│       │   ├── styles/                       # review.styles.css
│       │   └── tests/                        # ReviewDecisionForm.test.tsx (Jest)
│       │
│       └── manageChatYObservaciones/         # HU-F12, HU-F13
│           ├── components/                   # TenderChatPanel, ClickableNumeralText, ObservationDraftModal, CopyClipboardButton
│           ├── hooks/                        # useTenderChat, useObservationDraft
│           ├── services/                     # chatObservacionesService.ts
│           ├── mockups/                      # chatObservaciones.mock.ts
│           ├── utils/                        # parseNumeralLinks.ts
│           ├── styles/                       # chat.animations.css
│           └── tests/                        # TenderChatPanel.test.tsx, ObservationDraftModal.test.tsx (Jest)
```

---

## 3. Reglas de Orquestación (`pages/` vs `features/`)

Para mantener el código limpio y fácil de mantener durante la hackatón:

1. **Los archivos en `src/pages/` no contienen llamadas a Axios, ni `useState` complejos, ni lógica de negocio.** Su única función es componer los componentes exportados por los `features` dentro de un layout compartido (`SplitPane` o `MainLayout`) y conectar eventos entre módulos (por ejemplo: pasar la fila seleccionada en `manageDashboardMatriz` hacia `manageVisorPliego`).
2. **Aislamiento por `ErrorBoundary`:** Cada bloque funcional dentro de una página (Matriz, Visor PDF, Chat) va envuelto en `<ErrorBoundary>` para garantizar `HU-F15` (un fallo de renderizado en el chat o en el visor jamás deja en blanco toda la pantalla).

```tsx
// Ejemplo conceptual de src/pages/TenderAnalysisPage.tsx (Orquestador puro)
export function TenderAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedItem, setSelectedItem] = useState<ItemVerificable | null>(null);

  return (
    <MainLayout>
      <GuidedTourProvider tourKey="tender-analysis-tour" />
      <ErrorBoundary fallbackTitle="Error al cargar el resumen ejecutivo">
        <RecommendationHeroCard licitacionId={id!} onJumpToItem={setSelectedItem} />
      </ErrorBoundary>

      <SplitPane
        left={
          <ErrorBoundary fallbackTitle="Error en la matriz de cobertura">
            <MatrixAndGapsContainer
              licitacionId={id!}
              selectedItemId={selectedItem?.id}
              onSelectItem={setSelectedItem}
            />
          </ErrorBoundary>
        }
        right={
          <ErrorBoundary fallbackTitle="Error en el visor del documento">
            <PdfViewerContainer
              licitacionId={id!}
              activeItem={selectedItem}
            />
          </ErrorBoundary>
        }
      />
    </MainLayout>
  );
}
```

---

## 4. Sistema de Mockups Intercambiables (`mockups/`)

Cada carpeta `features/manage<NombreDelPage>/mockups/` contiene datos sintéticos realistas (pliegos de SECOP, contratos con códigos UNSPSC, coordenadas PDF y estados de progreso) para desarrollar y probar la interfaz sin depender de que el backend o los créditos de IA estén activos.

### Conmutación Global o Granular (`src/shared/utils/mockSwitch.ts`)

Permite cambiar entre datos simulados y el backend real de FastAPI mediante variables de entorno (`.env`) en todo el proyecto o módulo por módulo:

```dotenv
# .env.local
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Interruptor global (true = todo usa mockups; false = usa FastAPI real)
VITE_USE_MOCKS=false

# Interruptores granulares por feature (sobrescriben el global si se definen)
VITE_MOCK_AUTH=false
VITE_MOCK_MATRIZ=true
VITE_MOCK_VISOR=true
VITE_MOCK_CHAT=false
```

```typescript
// src/shared/utils/mockSwitch.ts
export function shouldUseMock(featureFlag?: string): boolean {
  if (featureFlag !== undefined && featureFlag !== '') {
    return featureFlag === 'true';
  }
  return import.meta.env.VITE_USE_MOCKS === 'true';
}
```

Dentro de cada `services/<feature>Service.ts`, el servicio decide de forma transparente si retorna el mockup con un retardo simulado realista (para validar los *Skeleton Loaders*) o ejecuta la petición con `axiosClient`:

```typescript
// Ejemplo en features/manageDashboardMatriz/services/matrizService.ts
import { axiosClient } from '@/api/axiosClient';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { MOCK_RESULTADO_LICITACION } from '../mockups/matrizResultado.mock';

export const matrizService = {
  async getResultadoLicitacion(licitacionId: string) {
    if (shouldUseMock(import.meta.env.VITE_MOCK_MATRIZ)) {
      await new Promise((res) => setTimeout(res, 650)); // Permite probar Skeletons
      return MOCK_RESULTADO_LICITACION;
    }
    const { data } = await axiosClient.get(`/licitaciones/${licitacionId}/resultado`);
    return data;
  },
};
```

---

## 5. Conexión General al Backend (`src/api/`) y Rutas Privadas (`src/routes/`)

### 5.1 Cliente Axios e Interceptores (`src/api/`)
* **Inyección Automática de Token (`HU-F01`):** Antes de cada petición, el interceptor obtiene el `access_token` vigente de Supabase Auth (`supabase.auth.getSession()`) y lo adjunta en `Authorization: Bearer <token>`.
* **Cero envío de identidad manual (`S-04`):** Ningún servicio envía `organizacion_id` ni `rol`; FastAPI los resuelve desde la tabla `Miembro` en PostgreSQL.
* **Manejo Centralizado de Respuestas HTTP (`HU-F15`):**
  * `401 Unauthorized`: Cierra la sesión local expirada y redirige a `/login?redirect=<ruta_actual>`.
  * `403 Forbidden` / `404 Not Found`: Normaliza el error a *"Recurso no disponible"* para evitar enumeración entre organizaciones (`S-03`).
  * `422 Unprocessable Entity`: Preserva el arreglo completo de errores de validación de campo (esencial para `HU-F04`).
  * `429 Too Many Requests`: Traduce la cuota excedida a un mensaje claro indicando que se alcanzó el límite diario de análisis o preguntas (`HU-B26` / `HU-F12`).

### 5.2 Rutas Privadas y Control de Roles (`src/routes/`)
* `PrivateRoute`: Verifica sesión en Supabase; mientras valida el estado inicial muestra un `SkeletonLoader` de pantalla completa.
* `RoleRoute`: Verifica el rol obtenido desde `GET /me`. Protege `/configuracion/miembros` (`HU-F03`) y `/configuracion/conocimiento` (`HU-F04`) exclusivamente para `rol === 'administrador'`.

---

## 6. Estándares de Diseño Tailwind, Iconografía y Estados UX

### 6.1 Personalización de Tailwind CSS (`src/shared/styles/`)
Se definen tokens semánticos mediante variables CSS mapeadas en `tailwind.config.js`, permitiendo personalización rápida de marca o cambio de tema (estándar institucional vs. alto contraste):

* `--color-brand-primary`: Azul institucional profundo (confianza y rigor jurídico).
* `--color-status-success`: Verde esmeralda (`#059669`) — *Cumple / Presentarse*.
* `--color-status-warning`: Ámbar cálido (`#D97706`) — *Cumple parcialmente / Presentarse con riesgo / Cita no verificada*.
* `--color-status-danger`: Rojo carmesí (`#DC2626`) — *No cumple / No presentarse*.
* `--color-status-info`: Índigo/Cian (`#2563EB`) — *En revisión humana / Condicionada*.
* `--color-pdf-highlight`: Amarillo resaltador (`rgba(255, 235, 59, 0.42)` con borde `#F59E0B`).

### 6.2 Accesibilidad Obligatoria con `react-icons`
Cumpliendo la subcaracterística `[Capacidad de interacción]` de ISO/IEC 25010:2023 definida en las historias de usuario, **ningún estado ni recomendación se comunica solo con color**. Todo indicador combina **Color + Ícono de `react-icons` + Etiqueta Textual**:

| Estado / Recomendación | Ícono (`react-icons`) | Texto Visible Obligatorio |
| :--- | :--- | :--- |
| `cumple` | `FiCheckCircle` | **Cumple** |
| `cumple_parcialmente` | `FiAlertTriangle` | **Cumple parcialmente** |
| `no_cumple` | `FiXCircle` | **No cumple** |
| `revision` | `FiHelpCircle` / `FiEye` | **Requiere revisión humana** |
| `presentarse` | `FiAward` / `FiCheckSquare` | **Presentarse** |
| `presentarse_con_riesgo` | `FiAlertOctagon` | **Presentarse con riesgo** |
| `no_presentarse` | `FiSlash` | **No presentarse** |
| `condicionada` | `FiClock` | **Recomendación condicionada** |

### 6.3 Gestión de Estados UX: Loading Tranquilizador, Success, Warning y Error

1. **Estado Loading (Regla Estricta):**
   * **Prohibido** usar pantallas en blanco o spinners genéricos sin contexto.
   * **Carga de vistas y tablas (`SkeletonLoader`):** Renderizar esqueletos animados (`animate-pulse`) que imitan exactamente la silueta de las tarjetas de recomendación, las filas de la matriz y el lienzo del visor PDF.
   * **Procesamiento activo de IA (`CalmingSpinner`):** Ícono animado con `framer-motion` + `react-icons` (`FiCpu`, `FiFileSearch`, `FiShield`) acompañado siempre de **mensajes tranquilizadores** que explican al usuario qué está ocurriendo y reducen la ansiedad durante el análisis de cientos de páginas:
     * *Etapa Lectura/OCR:* `"Leyendo documento página por página y extrayendo tablas sin omitir anexos..."`
     * *Etapa Filtrado:* `"Identificando capítulos con obligaciones y descartando secciones informativas..."`
     * *Etapa Extracción:* `"Analizando sección 18 de 45: desagregando cada requisito con su numeral exacto..."`
     * *Etapa Verificación:* `"Contrastando requisitos contra tus contratos, hojas de vida y certificaciones..."`
     * *Etapa Localización:* `"Mapeando coordenadas exactas en el PDF para habilitar el salto visual..."`
2. **Estado Warning (`StatusBanner` ámbar + `FiAlertTriangle`):**
   * Cita de evidencia no verificada automáticamente (`cita_verificada: false` en `HU-F09`).
   * Ubicación en PDF aproximada o solo por página (`precision !== 'exacta'` en `HU-F10`).
   * Advertencia previa a reemplazar la base de conocimiento (`HU-F04`).
   * Aviso de que el borrador de observación **no** se envía automáticamente a la entidad (`HU-F13`).
3. **Estado Error (`StatusBanner` rojo + `FiAlertCircle`):**
   * Siempre redactado en lenguaje claro y accionable, sin trazas técnicas ni rutas internas, acompañado de un botón de recuperación (`Reintentar` o `Volver`).
4. **Estado Success (`StatusBanner` / Toast verde + `FiCheckCircle`):**
   * Confirmación con resumen cuantitativo tras cargar la base de conocimiento (`"Se cargaron 14 contratos, 22 hojas de vida y 8 certificaciones"`), guardar una revisión humana o copiar una observación al portapapeles.

### 6.4 Animaciones Interactivas (`framer-motion`)
* **Divulgación Progresiva (`RF-12`):** Expansión y contracción fluida (`AnimatePresence` + `layout`) de los acordeones de categorías (Nivel 2) y del detalle de ítems con evidencia (Nivel 3).
* **Resaltado en Visor PDF (`RF-26`):** Al saltar a una página tras hacer clic en una fila de la matriz, los rectángulos amarillos (`HighlightOverlayLayer`) ejecutan una animación suave de aparición y pulso breve para guiar inmediatamente la mirada del revisor hacia el párrafo exacto.

---

## 7. Guía Interactiva de Usuario con `react-joyride` y Cookies

Para facilitar tanto la incorporación de nuevos revisores como la demostración ante el jurado de la hackatón, se integra `react-joyride` en `src/shared/components/tour/`:

* **Persistencia Provisional en Cookies (`cookieStorage.ts`):**
  * Se almacena el estado del recorrido en la cookie `pliegos_guided_tour_v1` (con expiración configurable, ej. 7 días, `SameSite=Lax`).
  * Si la cookie no existe o es `pending`, el tour se inicia automáticamente al entrar por primera vez al Dashboard de Análisis (`TenderAnalysisPage`).
  * Incluye un botón permanente **"Ver guía rápida"** (`FiCompass`) en la barra superior que borra/reinicia la cookie y relanza el tour en cualquier momento durante la demo.
* **Pasos del Recorrido Guiado (`tourSteps.ts`):**
  1. **Nivel 1 — Veredicto Ejecutivo:** Explica la recomendación calculada por reglas y la cobertura verificada del pliego.
  2. **Nivel 2 — Brechas Habilitantes:** Señala los incumplimientos eliminatorios ordenados primero.
  3. **Salto y Resaltado en el Pliego (`RF-26`):** Invita a hacer clic en una fila para ver cómo el visor PDF salta y subraya el requisito en amarillo junto a su evidencia.
  4. **Bandeja de Revisión Humana (`HU-F11`):** Muestra dónde resolver requisitos ambiguos con comentario obligatorio.
  5. **Chat y Borrador de Observaciones (`HU-F12`, `HU-F13`):** Señala el panel lateral para consultar el pliego y redactar observaciones formales.

---

## 8. Estrategia de Pruebas (`Jest` + `Playwright`)

### 8.1 Pruebas Unitarias y de Integración por Módulo (`Jest` + React Testing Library)
Ubicadas dentro de `features/manage<NombreDelPage>/tests/` y `src/shared/tests/`:

* **Validación de Estados y Accesibilidad:** Verificar que `ComplianceBadge` y `RecommendationBadge` rendericen siempre texto e ícono accesible junto al color.
* **Polling Seguro (`useAnalysisPolling.test.ts`):** Comprobar con `jest.useFakeTimers()` que el polling consulta el endpoint periódicamente y **se detiene inmediatamente** al recibir estado `completado`, `error` o al desmontar el componente (`HU-F06`).
* **Cálculo de Coordenadas y Degradación (`HighlightOverlayLayer.test.tsx`):** Verificar que las coordenadas normalizadas (`x, y, width, height`) se transforman en porcentajes CSS exactos y que `precision: 'solo_pagina'` no dibuja cuadros pero sí muestra el aviso correspondiente (`HU-F10`).
* **Prevención de XSS (`sanitizeText.test.ts`):** Asegurar que cadenas con etiquetas `<script>` o HTML malicioso provenientes de documentos o respuestas del chat se rendericen como texto plano escapado (`S-11`).
* **Revisión Humana (`ReviewDecisionForm.test.tsx`):** Validar que el botón de guardar permanezca deshabilitado mientras el campo de comentario obligatorio esté vacío (`HU-F11`).

### 8.2 Pruebas End-to-End (`Playwright` en `/e2e`)
* **`auth-y-roles.spec.ts`:** Verifica redirección de rutas privadas sin sesión, redirección tras login y bloqueo de vistas administrativas para el rol `revisor`.
* **`carga-y-progreso.spec.ts`:** Simula arrastrar un archivo inválido (rechazo inmediato en cliente), subir un PDF válido, visualizar el progreso por secciones y aterrizar en el dashboard.
* **`matriz-y-visor-pdf.spec.ts`:** Verifica el flujo estrella completo: abrir licitación, descargar PDF una sola vez (interceptando red para confirmar que no hay re-descargas al cambiar de fila), hacer clic en una brecha habilitante, comprobar el salto de página y el resaltado amarillo visible en pantalla.

---

## 9. Matriz de Trazabilidad Completa (HUs y Seguridad -> Arquitectura Frontend)

| Historia / Control | Prioridad | Página Orquestadora (`pages/`) | Feature (`features/`) | Responsabilidad Clave en Frontend |
| :--- | :--- | :--- | :--- | :--- |
| **HU-F01** Iniciar/cerrar sesión | Must | `LoginPage` | `manageAuth` | Login Supabase (`anon` key), `GET /me`, ocultar menús admin a revisores |
| **HU-F02** Aceptar invitación | Should | `AcceptInvitationPage` | `manageAuth` | Definir contraseña con reglas visibles y manejo de enlace expirado |
| **HU-F03** Gestionar miembros | Should | `MembersManagementPage` | `manageMiembros` | Listar, invitar, cambiar rol y retirar con modal de confirmación |
| **HU-F04** Cargar base conocimiento | Must | `KnowledgeBasePage` | `manageBaseConocimiento` | Advertencia de reemplazo total, listado completo de errores 422 y resumen |
| **HU-F05** Cargar pliego PDF | Must | `TenderUploadPage` | `manageCargaYProgreso` | Drag & drop, validación previa MIME/tamaño y redirección si ya existe |
| **HU-F06** Ver progreso análisis | Must | `TenderProgressPage` | `manageCargaYProgreso` | Polling con mensajes tranquilizadores, contador secciones y limpieza al salir |
| **HU-F07** Resumen y recomendación | Must | `TenderAnalysisPage` | `manageDashboardMatriz` | Nivel 1: Veredicto con color + ícono + texto, justificación y alerta revisión |
| **HU-F08** Categorías y brechas | Must | `TenderAnalysisPage` | `manageDashboardMatriz` | Nivel 2: Lista de brechas (habilitantes primero), acordeones y filtros |
| **HU-F09** Detalle ítem y evidencia | Must | `TenderAnalysisPage` | `manageDashboardMatriz` | Nivel 3: Numeral, cita literal, badge cita verificada, faltante y auditoría |
| **HU-F10 / RF-26** Visor PDF + salto | Must | `TenderAnalysisPage` | `manageVisorPliego` | Split-view, descarga única PDF S3, salto de página, resaltado amarillo y teclado |
| **HU-F11** Revisión humana | Should | `TenderAnalysisPage` | `manageRevisionHumana` | Bandeja ítems en revisión, comentario obligatorio y recálculo sin recargar |
| **HU-F12** Chat licitación | Should | `TenderAnalysisPage` | `manageChatYObservaciones` | Panel lateral, numerales clicables hacia visor PDF y manejo de cuota 429 |
| **HU-F13** Borrador observación | Should | `TenderAnalysisPage` | `manageChatYObservaciones` | Editor de observación formal, botón copiar y aviso de no envío automático |
| **HU-F14** Panel licitaciones | Should | `TendersListPage` | `managePanelLicitaciones` | Tabla general de procesos de la organización con badges accesibles |
| **HU-F15** Errores y sesión expirada | Must | Transversal | `api/` + `shared/` | Interceptor 401 con redirect, opacidad 403/404, ErrorBoundaries y EmptyStates |
| **HU-F16** Exportar matriz Excel | Could | `TenderAnalysisPage` | `manageDashboardMatriz` | Descarga `.xlsx` con advertencia si existen ítems pendientes de revisión |
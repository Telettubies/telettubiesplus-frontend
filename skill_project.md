---
name: analizador-pliegos-context
description: Contexto arquitectónico completo y guía de implementación para el proyecto "Analizador de pliegos y matriz de cobertura", con especificación profunda del Frontend (React) y visión estructural del Backend (FastAPI + Workers).
---
```markdown
---
name: analizador-pliegos-context
description: Contexto arquitectónico completo y guía de implementación para el proyecto "Analizador de pliegos y matriz de cobertura", con especificación profunda del Frontend (React) y visión estructural del Backend (FastAPI + Workers).
---

# Contexto del Proyecto: Analizador de Pliegos y Matriz de Cobertura

Eres un asistente experto en ingeniería de software trabajando en el desarrollo del sistema **Analizador de pliegos y matriz de cobertura** (Reto 12 de Hackatón — Licitaciones y preventa, en colaboración con NVIDIA). Tu enfoque principal es construir un **Frontend en React** robusto, accesible, seguro y de alta precisión visual, comprendiendo exactamente cómo consume y se sincroniza con la arquitectura asíncrona del **Backend**.

---

## 1. Visión del Producto y Dominio

* **Problema que resuelve:** Evaluar un pliego de condiciones de contratación pública en Colombia toma días de lectura manual de cientos de páginas. El riesgo crítico no es la velocidad, sino pasar por alto un requisito habilitante que descalifique la oferta.
* **Solución:** Aplicación web multiorganización que ingesta un pliego en PDF, extrae y desagrega cada requisito en ítems verificables con su numeral exacto, los contrasta contra la base de conocimiento de la empresa oferente (capacidades, contratos, hojas de vida, indicadores financieros, certificaciones) y produce una **matriz de cobertura** con brechas, evidencia citada, bandeja de revisión humana y una **recomendación justificada** de participar o no.
* **Funcionalidad Estrella de la Demo (`RF-26`):** Vista dividida donde al seleccionar cualquier fila de la matriz de cobertura, el visor de PDF salta instantáneamente a la página exacta del pliego, resalta el texto del requisito mediante coordenadas normalizadas y muestra al lado la evidencia documental que respalda el cumplimiento.
* **Ámbito Normativo y de Datos:** Contratación pública colombiana regulada (SECOP, datos.gov.co, Colombia Compra Eficiente, Ley 80, Ley 1150, Decreto 1082 de 2015, clasificador UNSPSC, valores expresados en SMMLV). Los datos de oferentes son sintéticos o anonimizados.
* **Restricciones de Ejecución:** Hackatón de 3 días (equipo de 4 integrantes: P1 Infraestructura/Orquestación, P2 Lectura/Extracción, P3 Evidencia/Verificación, P4 Frontend). Despliegue en VM de AWS sin GPU (2 vCPU, 8 GB RAM) mediante Docker Compose; todos los modelos de IA se consumen por API externa.

---

## 2. Arquitectura General del Backend (Perspectiva de Consumo)

El frontend no se comunica con modelos de IA ni con almacenamiento de objetos directamente para mutaciones; todo pasa por una API REST desacoplada de un pipeline de procesamiento en segundo plano:

* **API Gateway / Backend (`FastAPI` en Python):**
  * Expone endpoints REST protegidos por JWT.
  * Valida archivos subidos, gestiona usuarios/organizaciones, publica trabajos en cola, consulta estados en base de datos, atiende el chat contextual y genera URLs prefirmadas de lectura para los PDFs.
* **Autenticación vs. Autorización (`ADR-008`, `ADR-014`):**
  * **Autenticación:** Gestionada por **Supabase Auth**. El frontend inicia sesión con Supabase y envía `Authorization: Bearer <access_token>` en cada petición a FastAPI.
  * **Autorización:** Gestionada en **PostgreSQL** mediante la entidad `Miembro` (`user_id` + `organizacion_id` + `rol`: `administrador` o `revisor`).
  * **Regla estricta:** El frontend **nunca** debe enviar `organizacion_id` ni `rol` en headers, query params o cuerpos JSON para intentar determinar permisos; la API los resuelve internamente a partir del token verificado.
* **Procesamiento Asíncrono (`RabbitMQ` + `Worker LangGraph`):**
  * Al subir un pliego o actualizar la base de conocimiento, FastAPI guarda el archivo en **AWS S3** (bucket privado), registra la entidad en PostgreSQL y publica un mensaje en **RabbitMQ**.
  * Un **Worker en Python + LangGraph** consume un trabajo a la vez y ejecuta un pipeline de 11 etapas:
    1. Lectura de PDF y tablas (`PyMuPDF` / `pdfplumber` + OCR para páginas escaneadas).
    2. División estructural por secciones y numerales.
    3. Filtrado de secciones sin requisitos (modelo **NVIDIA Nemotron**).
    4. Extracción y atomización de requisitos e ítems verificables (modelo **Anthropic Claude**).
    4b. Localización espacial en el PDF: cálculo por código de `pagina`, `precision` y cajas de coordenadas relativas (`UbicacionPliego`).
    5. Comprobación de cobertura total de secciones (`ADR-012`).
    6. Vectorización en `pgvector` y recuperación de evidencia (**NVIDIA Embeddings** + Reranker opcional).
    7. Verificación de cumplimiento (reglas numéricas en código + evaluación cualitativa con **Claude**).
    8. Validación difusa de citas contra el texto fuente (anti-alucinación).
    9. Cálculo determinista en código de brechas y recomendación (`presentarse`, `presentarse con riesgo`, `no presentarse`, `condicionada`).
    10. Redacción de justificación citando numerales (**Claude**).
    11. Cierre y actualización final.
* **Fuente Única de Verdad del Estado (`ADR-015`):**
  * RabbitMQ solo transporta mensajes. El estado y porcentaje de avance de cada análisis residen exclusivamente en **PostgreSQL** (`Trabajo de procesamiento`), que es lo que consulta el frontend mediante polling.
* **Acceso Seguro a PDFs (`P-14`, `S-10`):**
  * El bucket de AWS S3 es completamente privado. Cuando el frontend abre los resultados de una licitación, FastAPI verifica que pertenezca a la organización del usuario y devuelve una **URL prefirmada temporal** de vigencia corta (pocos minutos) para descargar el PDF desde el navegador.

---

## 3. Arquitectura Detallada del Frontend (React SPA)

### 3.1 Stack y Librerías Clave
* **Framework:** React (SPA) con enrutamiento protegido por sesión y rol.
* **Cliente de Identidad:** `@supabase/supabase-js` configurado **únicamente** con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (jamás incluir la `service_role_key` en el bundle o variables del cliente).
* **Visor de PDF:** `react-pdf` (basado en PDF.js) para renderizar páginas en canvas/SVG y superponer capas absolutas de resaltado sincronizadas con el zoom y el redimensionamiento de ventana.
* **Renderizado Seguro de Texto:** Renderizado plano para citas y fragmentos de pliegos. Si el chat utiliza Markdown, debe configurarse con bloqueo estricto de HTML incrustado (`S-11` / prevención de XSS).

### 3.2 Principios Transversales de Diseño, Calidad y Seguridad (ISO/IEC 25010)
1. **Accesibilidad Semántica (`Capacidad de interacción`):** Ningún estado o recomendación (`cumple`, `parcial`, `no_cumple`, `revisión`, `presentarse`, etc.) se comunica únicamente mediante color. Siempre debe incluir etiqueta textual explícita e ícono diferenciador.
2. **Prevención de XSS (`Confidencialidad` / `S-11`):** Todo texto proveniente de pliegos, evidencias o respuestas de modelos LLM (Claude/NVIDIA) se trata como texto no confiable. Prohibido usar `dangerouslySetInnerHTML`.
3. **Aislamiento y Opacidad ante IDOR (`S-03`):** Si la API responde `403` o `404` al consultar una licitación o recurso por ID, el frontend muestra un mensaje uniforme de *"Recurso no disponible"* sin revelar si el identificador pertenece a otra organización.
4. **Control de Recursos en Cliente:** Detener cualquier intervalo de polling (`setInterval` / React Query `refetchInterval`) inmediatamente cuando el trabajo alcance estado terminal (`completado` o `error`) o al desmontar la vista.
5. **Tolerancia a Fallos Parciales (`HU-F15`):** Implementar React Error Boundaries alrededor de paneles independientes (Visor PDF, Matriz, Chat) para que un error de renderizado en un componente no deje la pantalla en blanco.

---

## 4. Contratos de Datos del Frontend (Modelos de Referencia)

Alineados con las entidades del DAS (Sección 6.3) y los criterios de aceptación de las historias de usuario:

```typescript
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

export interface ZonaCoordenada {
  x: number;      // Normalizado [0, 1] respecto al ancho de página
  y: number;      // Normalizado [0, 1] respecto al alto de página
  width: number;  // Normalizado [0, 1]
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
  id: string;
  requisito_id: string;
  numeral: string;                 // Ej. "3.4.2"
  categoria: CategoriaRequisito;
  texto_requisito_literal: string;
  descripcion_item: string;        // Unidad verificable atómica
  es_ambiguo: boolean;
  motivo_revision?: string;
  estado: EstadoCumplimiento;
  evidencia?: EvidenciaItem;
  faltante?: string;               // Obligatorio si estado !== 'cumple'
  confianza: number;               // 0 a 1
  subsanable?: boolean | null;
  ubicacion: UbicacionPliego;
  revisiones: HistorialRevision[];
}

export interface ProgresoAnalisis {
  trabajo_id: string;
  licitacion_id: string;
  estado: 'pendiente' | 'procesando' | 'completado' | 'error';
  etapa_actual: string;
  porcentaje: number;
  secciones_procesadas?: number;
  secciones_total?: number;
  mensaje_error?: string;
}

export interface ResultadoLicitacion {
  licitacion_id: string;
  nombre: string;
  fecha_carga: string;
  fecha_cierre?: string;
  dias_al_cierre?: number;
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

```

---

## 5. Especificación Funcional por Módulo (`HU-F01` a `HU-F16`)

### 5.1 Acceso, Invitaciones y Gestión de Miembros (`HU-F01`, `HU-F02`, `HU-F03`)

* **Login (`HU-F01` - Must):**
* Autenticación con correo y contraseña mediante `supabase.auth.signInWithPassword()`.
* Ante error de credenciales, mostrar mensaje genérico (*"Credenciales inválidas"*) sin revelar si el correo está registrado.
* Tras autenticar, consultar el perfil/membresía en FastAPI (`GET /me`) para conocer `organizacion` y `rol` y configurar la navegación. Ocultar menús de administración a usuarios con rol `revisor`.
* Cerrar sesión ejecuta `supabase.auth.signOut()`, limpia estado en memoria y redirige a `/login`.


* **Aceptar Invitación (`HU-F02` - Should):**
* Vista pública accesible desde el enlace del correo de invitación.
* Mostrar reglas de complejidad de contraseña antes de enviar. Al confirmar, autenticar automáticamente con el rol asignado.
* Si el enlace expiró o ya fue usado, mostrar mensaje claro explicando cómo solicitar una nueva invitación al administrador.


* **Gestión de Miembros (`HU-F03` - Should — Solo Administrador):**
* Tabla con correo, rol (`administrador` / `revisor`) y estado (`activo` / `invitación pendiente`).
* Formulario para invitar por correo seleccionando rol.
* Diálogo de confirmación obligatorio antes de cambiar rol o retirar a un miembro.
* Mostrar mensaje claro si el backend rechaza la acción (ej. impedir degradar o eliminar al último administrador de la organización).



### 5.2 Carga de Base de Conocimiento (`HU-F04` - Must — Solo Administrador)

* Interfaz para cargar el archivo estructurado de capacidades de la empresa (contratos, códigos UNSPSC, datos financieros, certificaciones) y documentos de soporte (hojas de vida).
* **Advertencia previa obligatoria:** Mostrar banner visible indicando que *una nueva carga reemplaza por completo la base de conocimiento anterior*.
* **Validación exhaustiva:** Si la API devuelve errores de validación (HTTP 422), listar **todos** los errores a la vez indicando el campo exacto y su ubicación en el archivo.
* **Confirmación post-carga:** Mostrar resumen con conteo de contratos, personas/hojas de vida y certificaciones cargadas, junto al estado de la indexación vectorial en segundo plano.

### 5.3 Panel General de Licitaciones (`HU-F14` - Should)

* Tabla principal de procesos de la organización con columnas: Nombre, Estado del análisis, Recomendación (badge con color + texto), Fecha de carga y Fecha de cierre (si existe).
* Hacer clic en una fila navega a `/licitaciones/:id` (si está completada) o `/licitaciones/:id/progreso` (si está en curso o fallida).
* Estado vacío guiado con instrucciones y botón directo para cargar el primer pliego.

### 5.4 Carga de Pliego y Progreso en Tiempo Real (`HU-F05`, `HU-F06` - Must)

* **Carga (`HU-F05`):**
* Input de archivo y zona Drag & Drop. Indicar explícitamente límites máximos de tamaño (MB) y número de páginas antes de subir.
* Validación previa en navegador: rechazar archivos que no sean `.pdf` o excedan el peso máximo antes de iniciar la subida (la validación definitiva por magic-bytes ocurre en backend).
* Si el backend detecta por hash que el mismo PDF ya fue analizado en la organización, informar al usuario y redirigir directamente al resultado existente sin consumir créditos.


* **Progreso (`HU-F06`):**
* Polling automático periódico (`GET /licitaciones/{id}/progreso`) sin recargar la página.
* Visualizar lista de etapas del pipeline resaltando la actual y barra de porcentaje global.
* Durante la etapa de extracción, mostrar el indicador dinámico: `"X de Y secciones procesadas"`.
* Al pasar a `completado`, redirigir automáticamente al Dashboard de resultados.
* Si falla (`error`), mostrar mensaje comprensible (sin trazas internas) y botón de reintento.
* Permitir salir de la pantalla y volver más tarde manteniendo el estado; detener el polling inmediatamente al salir o finalizar.



### 5.5 Dashboard de Decisión en 3 Niveles (`HU-F07`, `HU-F08`, `HU-F09` - Must)

Implementa divulgación progresiva (`RF-12`): información ejecutiva arriba, detalle técnico expandible bajo demanda.

* **Nivel 1 — Recomendación y Resumen Ejecutivo (`HU-F07`):**
* Tarjeta superior destacada con la recomendación (`Presentarse`, `Presentarse con riesgo`, `No presentarse`, `Condicionada`) acompañada de color accesible, texto explícito y la justificación redactada con referencia a los numerales clave.
* Contadores totales por estado (`Cumple`, `Cumple parcialmente`, `No cumple`, `En revisión`) y métrica de cobertura del pliego (`X de Y secciones procesadas`).
* Banner de alerta prominente con enlace directo si existen secciones sin procesar o ítems pendientes de revisión humana.
* Indicadores complementarios si existen: días al cierre, duración del análisis y costo estimado.


* **Nivel 2 — Categorías y Lista de Brechas (`HU-F08`):**
* **Lista de Brechas (`Brechas` primero):** Sección dedicada con todos los ítems en `no_cumple` o `cumple_parcialmente`, ordenados estrictamente poniendo los **Habilitantes primero**, e indicando si son subsanables cuando el dato esté disponible.
* **Tarjetas por Categoría:** Acordeones expandibles/contraíbles para `Habilitante`, `Técnico`, `Experiencia` y `Plazo`, cada uno con barra de cobertura y conteos por estado. Las categorías sin ítems deben mostrarse explícitamente como vacías (nunca ocultarse).
* **Filtros combinables:** Filtrar la matriz por `estado` y por `categoría`. La suma de ítems debe coincidir siempre con los conteos del Nivel 1.


* **Nivel 3 — Detalle de Ítem y Evidencia (`HU-F09`):**
* Al expandir una fila o ítem se visualiza: `numeral`, `pagina`, texto literal del requisito, ítem verificable desagregado, estado, evidencia citada (documento fuente + cita literal), `faltante` (si no cumple o es parcial) y nivel de confianza.
* **Indicador de verificación de cita:** Mostrar si la cita fue verificada contra la fuente (`cita_verificada: true`). Si es `false`, mostrar advertencia clara de cita no verificada.
* **Trazabilidad humana:** Si fue editado por un usuario, mostrar autor, fecha y comentario de revisión. Si está en estado `revision`, mostrar el motivo exacto.



### 5.6 Visor Interactivo Split-View y Salto con Resaltado (`HU-F10` / `RF-26` - Must)

* **Disposición Split-Screen:** Matriz de cobertura / brechas a la izquierda; Visor de PDF + panel lateral de evidencia asignada a la derecha.
* **Gestión de Descarga y Caché del PDF:**
* Descargar el archivo PDF **una sola vez** al abrir la licitación usando `pdf_url_temporal` y almacenarlo como `Blob` / `ArrayBuffer` en memoria del cliente.
* Cambiar entre filas de la matriz **jamás** debe volver a descargar el PDF ni realizar peticiones HTTP al backend.
* Si la URL temporal caduca antes de completar la descarga o al refrescar el documento, solicitar silenciosamente una nueva URL a la API manteniendo la página actual del visor.


* **Salto de Página y Renderizado de Resaltados:**
* Al hacer clic en una fila de la matriz:
1. El visor navega instantáneamente a `ubicacion.pagina`.
2. Sobre el contenedor relativo de la página renderizada (`react-pdf`), dibujar capas `<div>` absolutas con fondo amarillo semitransparente (`rgba(255, 235, 59, 0.4)`) usando las coordenadas normalizadas:
* `left: `${zona.x * 100}%``
* `top: `${zona.y * 100}%``
* `width: `${zona.width * 100}%``
* `height: `${zona.height * 100}%``
*(Usar porcentajes CSS garantiza que los resaltados escalen automáticamente con el zoom y el redimensionamiento de ventana).*


3. **Manejo de degradación según `ubicacion.precision`:**
* `exacta`: Salta a la página y dibuja los resaltados normalmente.
* `aproximada`: Salta a la página, dibuja los resaltados y muestra badge informativo (*"Ubicación aproximada"*).
* `solo_pagina`: Salta a la página sin dibujar recuadros y muestra aviso (*"No se encontró el texto exacto; mostrando página de la sección"*).






* **Accesibilidad por Teclado:** Permitir recorrer las filas de la matriz usando las teclas de flecha (`ArrowUp` / `ArrowDown`) sincronizando automáticamente el visor.

### 5.7 Revisión Humana y Recálculo (`HU-F11` - Should)

* Bandeja o vista filtrada con todos los ítems marcados en estado `revision`, mostrando su motivo (ambigüedad, cita no verificada o baja confianza).
* Cada ítem permite saltar directamente a su ubicación en el visor PDF (`HU-F10`) y consultar la evidencia recuperada.
* Formulario de resolución: selector de nuevo estado (`cumple`, `cumple_parcialmente`, `no_cumple`) + **campo de comentario obligatorio** (botón de guardar deshabilitado si el comentario está vacío).
* Mostrar diálogo de confirmación antes de guardar si la modificación cambia la recomendación general de la licitación.
* Al guardar (`POST /licitaciones/{id}/items/{item_id}/revisar`), actualizar dinámicamente los conteos, brechas, recomendación y justificación en la interfaz sin recargar toda la página, y mostrar el historial inalterable de revisiones del ítem.

### 5.8 Chat Contextual de la Licitación (`HU-F12` - Should)

* Panel lateral colapsable con historial de conversación acotado exclusivamente a la licitación actual.
* **Enlaces interactivos a numerales:** Detectar referencias a numerales en las respuestas del asistente (ej. `3.2.1`) y renderizarlas como enlaces clicables que hacen saltar el visor PDF (`HU-F10`) a dicha sección.
* Bloquear el envío de nuevas preguntas y mostrar indicador de carga mientras se espera respuesta.
* Si el backend devuelve HTTP `429` (cuota diaria alcanzada), informar claramente al usuario.
* Renderizar respuestas sin permitir HTML incrustado (`S-11`).

### 5.9 Borrador de Observaciones al Pliego (`HU-F13` - Should)

* En ítems marcados como ambiguos (`es_ambiguo: true`), habilitar el botón *"Generar observación"*.
* Invocar al backend (`POST /licitaciones/{id}/items/{item_id}/observacion`) y abrir un modal/panel con un `<textarea>` editable que contiene el texto formal generado (con numeral, asunto y cita literal).
* Botón *"Copiar al portapapeles"* con confirmación visual.
* **Aviso obligatorio de prevención de errores:** Indicar explícitamente que *el sistema solo genera el borrador y no lo envía ni radica ante la entidad contratante*.

### 5.10 Manejo de Errores, Estados Vacíos y Exportación (`HU-F15` - Must, `HU-F16` - Could)

* **Sesión Expirada (`HU-F15`):** Interceptor HTTP que, ante HTTP `401`, redirige a `/login?redirect=<ruta_actual>` para restaurar la vista tras iniciar sesión.
* **Errores de Red/Servidor (`HU-F15`):** Mensajes claros en español con acción de recuperación (*Reintentar* / *Volver*).
* **Exportación a Excel (`HU-F16` - Could):** Botón en el dashboard que descarga el archivo `.xlsx` generado por el backend (`GET /licitaciones/{id}/exportar`). Si existen ítems pendientes en `revision`, mostrar una advertencia antes de descargar.

---

## 6. Lista de Verificación de Seguridad para Código Frontend

Al escribir cualquier componente, servicio HTTP o manejador de estado en React, verifica siempre:

1. **Cero secretos privados (`S-06`):** Jamás referenciar `SUPABASE_SERVICE_ROLE_KEY`, claves de AWS, Anthropic o NVIDIA en el código cliente.
2. **Identidad delegada al token (`S-04`):** Nunca enviar `organizacion_id` o `rol` en payloads de creación/consulta; confiar exclusivamente en el header `Authorization: Bearer <token>`.
3. **Sanitización estricta (`S-11`):** Jamás renderizar HTML crudo proveniente de los PDFs, citas de evidencia o respuestas del chat.
4. **Manejo opaco de permisos (`S-03`):** Tratar errores `403` y `404` de recursos individuales de forma idéntica en la UI (*"No disponible"*).
5. **URLs temporales de S3 (`S-10`):** No cachear `pdf_url_temporal` en `localStorage` entre sesiones; solicitarla al abrir el dashboard y renovarla bajo demanda si expira.

---

## 7. Priorización MoSCoW para Desarrollo (Orden de Implementación)

Construye y valida las funcionalidades siguiendo estrictamente este orden de prioridad para garantizar el éxito de la demostración:

1. **Prioridad `Must` (Imprescindibles para la Demo — Días 1 y 2):**
* `HU-F01`: Iniciar y cerrar sesión (Supabase Auth + interceptor JWT).
* `HU-F04`: Cargar base de conocimiento (Admin, con validación múltiple y advertencia de reemplazo).
* `HU-F05`: Cargar pliego PDF (Drag & drop, validación previa y detección de duplicados).
* `HU-F06`: Ver progreso del análisis en vivo (polling con limpieza al salir y contador de secciones).
* `HU-F07`: Dashboard Nivel 1 (Recomendación con color + texto, justificación, conteos y alerta de cobertura/revisión).
* `HU-F08`: Dashboard Nivel 2 (Brechas con habilitantes primero, tarjetas por categoría y filtros).
* `HU-F09`: Dashboard Nivel 3 (Detalle de ítem, cita verificada/advertencia, faltante y auditoría).
* `HU-F10`: Split-view con visor PDF (`react-pdf`), descarga única, salto por fila y resaltado amarillo por coordenadas normalizadas (`RF-26`).
* `HU-F15`: Manejo transversal de errores, estados vacíos, Error Boundaries y redirección por sesión expirada.


2. **Prioridad `Should` (Confirmadas para después de las Must — Día 2):**
* `HU-F11`: Bandeja de revisión humana con comentario obligatorio y recálculo dinámico.
* `HU-F12`: Chat contextual de licitación con enlaces clicables a numerales en el visor.
* `HU-F13`: Generador y editor de borrador de observaciones para requisitos ambiguos.
* `HU-F14`: Panel general de licitaciones de la organización.
* `HU-F02` & `HU-F03`: Aceptar invitación y gestión de miembros por administrador.


3. **Prioridad `Could` (Solo si sobra tiempo antes de congelar código el Día 3):**
* `HU-F16`: Botón de exportación de la matriz a Excel.


4. **Fuera de Alcance (`Won't` ahora — Hoja de ruta futura):**
* No implementar recepción por correo (`RF-17`), múltiples documentos/anexos por proceso (`RF-28`), comparación de adendas (`RF-34`), estado "cumple con consorcio" (`RF-31`), detector de pliegos sastre (`RF-32`) ni monitoreo automático de SECOP (`RF-25`).



```

```
# Contexto del Proyecto: Analizador de Pliegos y Matriz de Cobertura

Eres un asistente experto en ingeniería de software trabajando en el desarrollo del sistema **Analizador de pliegos y matriz de cobertura** (Reto 12 de Hackatón — Licitaciones y preventa, en colaboración con NVIDIA). Tu enfoque principal es construir un **Frontend en React** robusto, accesible, seguro y de alta precisión visual, comprendiendo exactamente cómo consume y se sincroniza con la arquitectura asíncrona del **Backend**.

---

## 1. Visión del Producto y Dominio

* **Problema que resuelve:** Evaluar un pliego de condiciones de contratación pública en Colombia toma días de lectura manual de cientos de páginas. El riesgo crítico no es la velocidad, sino pasar por alto un requisito habilitante que descalifique la oferta.
* **Solución:** Aplicación web multiorganización que ingesta un pliego en PDF, extrae y desagrega cada requisito en ítems verificables con su numeral exacto, los contrasta contra la base de conocimiento de la empresa oferente (capacidades, contratos, hojas de vida, indicadores financieros, certificaciones) y produce una **matriz de cobertura** con brechas, evidencia citada, bandeja de revisión humana y una **recomendación justificada** de participar o no.
* **Funcionalidad Estrella de la Demo (`RF-26`):** Vista dividida donde al seleccionar cualquier fila de la matriz de cobertura, el visor de PDF salta instantáneamente a la página exacta del pliego, resalta el texto del requisito mediante coordenadas normalizadas y muestra al lado la evidencia documental que respalda el cumplimiento.
* **Ámbito Normativo y de Datos:** Contratación pública colombiana regulada (SECOP, datos.gov.co, Colombia Compra Eficiente, Ley 80, Ley 1150, Decreto 1082 de 2015, clasificador UNSPSC, valores expresados en SMMLV). Los datos de oferentes son sintéticos o anonimizados.
* **Restricciones de Ejecución:** Hackatón de 3 días (equipo de 4 integrantes: P1 Infraestructura/Orquestación, P2 Lectura/Extracción, P3 Evidencia/Verificación, P4 Frontend). Despliegue en VM de AWS sin GPU (2 vCPU, 8 GB RAM) mediante Docker Compose; todos los modelos de IA se consumen por API externa.

---

## 2. Arquitectura General del Backend (Perspectiva de Consumo)

El frontend no se comunica con modelos de IA ni con almacenamiento de objetos directamente para mutaciones; todo pasa por una API REST desacoplada de un pipeline de procesamiento en segundo plano:

* **API Gateway / Backend (`FastAPI` en Python):**
  * Expone endpoints REST protegidos por JWT.
  * Valida archivos subidos, gestiona usuarios/organizaciones, publica trabajos en cola, consulta estados en base de datos, atiende el chat contextual y genera URLs prefirmadas de lectura para los PDFs.
* **Autenticación vs. Autorización (`ADR-008`, `ADR-014`):**
  * **Autenticación:** Gestionada por **Supabase Auth**. El frontend inicia sesión con Supabase y envía `Authorization: Bearer <access_token>` en cada petición a FastAPI.
  * **Autorización:** Gestionada en **PostgreSQL** mediante la entidad `Miembro` (`user_id` + `organizacion_id` + `rol`: `administrador` o `revisor`).
  * **Regla estricta:** El frontend **nunca** debe enviar `organizacion_id` ni `rol` en headers, query params o cuerpos JSON para intentar determinar permisos; la API los resuelve internamente a partir del token verificado.
* **Procesamiento Asíncrono (`RabbitMQ` + `Worker LangGraph`):**
  * Al subir un pliego o actualizar la base de conocimiento, FastAPI guarda el archivo en **AWS S3** (bucket privado), registra la entidad en PostgreSQL y publica un mensaje en **RabbitMQ**.
  * Un **Worker en Python + LangGraph** consume un trabajo a la vez y ejecuta un pipeline de 11 etapas:
    1. Lectura de PDF y tablas (`PyMuPDF` / `pdfplumber` + OCR para páginas escaneadas).
    2. División estructural por secciones y numerales.
    3. Filtrado de secciones sin requisitos (modelo **NVIDIA Nemotron**).
    4. Extracción y atomización de requisitos e ítems verificables (modelo **Anthropic Claude**).
    4b. Localización espacial en el PDF: cálculo por código de `pagina`, `precision` y cajas de coordenadas relativas (`UbicacionPliego`).
    5. Comprobación de cobertura total de secciones (`ADR-012`).
    6. Vectorización en `pgvector` y recuperación de evidencia (**NVIDIA Embeddings** + Reranker opcional).
    7. Verificación de cumplimiento (reglas numéricas en código + evaluación cualitativa con **Claude**).
    8. Validación difusa de citas contra el texto fuente (anti-alucinación).
    9. Cálculo determinista en código de brechas y recomendación (`presentarse`, `presentarse con riesgo`, `no presentarse`, `condicionada`).
    10. Redacción de justificación citando numerales (**Claude**).
    11. Cierre y actualización final.
* **Fuente Única de Verdad del Estado (`ADR-015`):**
  * RabbitMQ solo transporta mensajes. El estado y porcentaje de avance de cada análisis residen exclusivamente en **PostgreSQL** (`Trabajo de procesamiento`), que es lo que consulta el frontend mediante polling.
* **Acceso Seguro a PDFs (`P-14`, `S-10`):**
  * El bucket de AWS S3 es completamente privado. Cuando el frontend abre los resultados de una licitación, FastAPI verifica que pertenezca a la organización del usuario y devuelve una **URL prefirmada temporal** de vigencia corta (pocos minutos) para descargar el PDF desde el navegador.

---

## 3. Arquitectura Detallada del Frontend (React SPA)

### 3.1 Stack y Librerías Clave
* **Framework:** React (SPA) con enrutamiento protegido por sesión y rol.
* **Cliente de Identidad:** `@supabase/supabase-js` configurado **únicamente** con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (jamás incluir la `service_role_key` en el bundle o variables del cliente).
* **Visor de PDF:** `react-pdf` (basado en PDF.js) para renderizar páginas en canvas/SVG y superponer capas absolutas de resaltado sincronizadas con el zoom y el redimensionamiento de ventana.
* **Renderizado Seguro de Texto:** Renderizado plano para citas y fragmentos de pliegos. Si el chat utiliza Markdown, debe configurarse con bloqueo estricto de HTML incrustado (`S-11` / prevención de XSS).

### 3.2 Principios Transversales de Diseño, Calidad y Seguridad (ISO/IEC 25010)
1. **Accesibilidad Semántica (`Capacidad de interacción`):** Ningún estado o recomendación (`cumple`, `parcial`, `no_cumple`, `revisión`, `presentarse`, etc.) se comunica únicamente mediante color. Siempre debe incluir etiqueta textual explícita e ícono diferenciador.
2. **Prevención de XSS (`Confidencialidad` / `S-11`):** Todo texto proveniente de pliegos, evidencias o respuestas de modelos LLM (Claude/NVIDIA) se trata como texto no confiable. Prohibido usar `dangerouslySetInnerHTML`.
3. **Aislamiento y Opacidad ante IDOR (`S-03`):** Si la API responde `403` o `404` al consultar una licitación o recurso por ID, el frontend muestra un mensaje uniforme de *"Recurso no disponible"* sin revelar si el identificador pertenece a otra organización.
4. **Control de Recursos en Cliente:** Detener cualquier intervalo de polling (`setInterval` / React Query `refetchInterval`) inmediatamente cuando el trabajo alcance estado terminal (`completado` o `error`) o al desmontar la vista.
5. **Tolerancia a Fallos Parciales (`HU-F15`):** Implementar React Error Boundaries alrededor de paneles independientes (Visor PDF, Matriz, Chat) para que un error de renderizado en un componente no deje la pantalla en blanco.

---

## 4. Contratos de Datos del Frontend (Modelos de Referencia)

Alineados con las entidades del DAS (Sección 6.3) y los criterios de aceptación de las historias de usuario:

```typescript
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

export interface ZonaCoordenada {
  x: number;      // Normalizado [0, 1] respecto al ancho de página
  y: number;      // Normalizado [0, 1] respecto al alto de página
  width: number;  // Normalizado [0, 1]
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
  id: string;
  requisito_id: string;
  numeral: string;                 // Ej. "3.4.2"
  categoria: CategoriaRequisito;
  texto_requisito_literal: string;
  descripcion_item: string;        // Unidad verificable atómica
  es_ambiguo: boolean;
  motivo_revision?: string;
  estado: EstadoCumplimiento;
  evidencia?: EvidenciaItem;
  faltante?: string;               // Obligatorio si estado !== 'cumple'
  confianza: number;               // 0 a 1
  subsanable?: boolean | null;
  ubicacion: UbicacionPliego;
  revisiones: HistorialRevision[];
}

export interface ProgresoAnalisis {
  trabajo_id: string;
  licitacion_id: string;
  estado: 'pendiente' | 'procesando' | 'completado' | 'error';
  etapa_actual: string;
  porcentaje: number;
  secciones_procesadas?: number;
  secciones_total?: number;
  mensaje_error?: string;
}

export interface ResultadoLicitacion {
  licitacion_id: string;
  nombre: string;
  fecha_carga: string;
  fecha_cierre?: string;
  dias_al_cierre?: number;
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

```

---

## 5. Especificación Funcional por Módulo (`HU-F01` a `HU-F16`)

### 5.1 Acceso, Invitaciones y Gestión de Miembros (`HU-F01`, `HU-F02`, `HU-F03`)

* **Login (`HU-F01` - Must):**
* Autenticación con correo y contraseña mediante `supabase.auth.signInWithPassword()`.
* Ante error de credenciales, mostrar mensaje genérico (*"Credenciales inválidas"*) sin revelar si el correo está registrado.
* Tras autenticar, consultar el perfil/membresía en FastAPI (`GET /me`) para conocer `organizacion` y `rol` y configurar la navegación. Ocultar menús de administración a usuarios con rol `revisor`.
* Cerrar sesión ejecuta `supabase.auth.signOut()`, limpia estado en memoria y redirige a `/login`.


* **Aceptar Invitación (`HU-F02` - Should):**
* Vista pública accesible desde el enlace del correo de invitación.
* Mostrar reglas de complejidad de contraseña antes de enviar. Al confirmar, autenticar automáticamente con el rol asignado.
* Si el enlace expiró o ya fue usado, mostrar mensaje claro explicando cómo solicitar una nueva invitación al administrador.


* **Gestión de Miembros (`HU-F03` - Should — Solo Administrador):**
* Tabla con correo, rol (`administrador` / `revisor`) y estado (`activo` / `invitación pendiente`).
* Formulario para invitar por correo seleccionando rol.
* Diálogo de confirmación obligatorio antes de cambiar rol o retirar a un miembro.
* Mostrar mensaje claro si el backend rechaza la acción (ej. impedir degradar o eliminar al último administrador de la organización).



### 5.2 Carga de Base de Conocimiento (`HU-F04` - Must — Solo Administrador)

* Interfaz para cargar el archivo estructurado de capacidades de la empresa (contratos, códigos UNSPSC, datos financieros, certificaciones) y documentos de soporte (hojas de vida).
* **Advertencia previa obligatoria:** Mostrar banner visible indicando que *una nueva carga reemplaza por completo la base de conocimiento anterior*.
* **Validación exhaustiva:** Si la API devuelve errores de validación (HTTP 422), listar **todos** los errores a la vez indicando el campo exacto y su ubicación en el archivo.
* **Confirmación post-carga:** Mostrar resumen con conteo de contratos, personas/hojas de vida y certificaciones cargadas, junto al estado de la indexación vectorial en segundo plano.

### 5.3 Panel General de Licitaciones (`HU-F14` - Should)

* Tabla principal de procesos de la organización con columnas: Nombre, Estado del análisis, Recomendación (badge con color + texto), Fecha de carga y Fecha de cierre (si existe).
* Hacer clic en una fila navega a `/licitaciones/:id` (si está completada) o `/licitaciones/:id/progreso` (si está en curso o fallida).
* Estado vacío guiado con instrucciones y botón directo para cargar el primer pliego.

### 5.4 Carga de Pliego y Progreso en Tiempo Real (`HU-F05`, `HU-F06` - Must)

* **Carga (`HU-F05`):**
* Input de archivo y zona Drag & Drop. Indicar explícitamente límites máximos de tamaño (MB) y número de páginas antes de subir.
* Validación previa en navegador: rechazar archivos que no sean `.pdf` o excedan el peso máximo antes de iniciar la subida (la validación definitiva por magic-bytes ocurre en backend).
* Si el backend detecta por hash que el mismo PDF ya fue analizado en la organización, informar al usuario y redirigir directamente al resultado existente sin consumir créditos.


* **Progreso (`HU-F06`):**
* Polling automático periódico (`GET /licitaciones/{id}/progreso`) sin recargar la página.
* Visualizar lista de etapas del pipeline resaltando la actual y barra de porcentaje global.
* Durante la etapa de extracción, mostrar el indicador dinámico: `"X de Y secciones procesadas"`.
* Al pasar a `completado`, redirigir automáticamente al Dashboard de resultados.
* Si falla (`error`), mostrar mensaje comprensible (sin trazas internas) y botón de reintento.
* Permitir salir de la pantalla y volver más tarde manteniendo el estado; detener el polling inmediatamente al salir o finalizar.



### 5.5 Dashboard de Decisión en 3 Niveles (`HU-F07`, `HU-F08`, `HU-F09` - Must)

Implementa divulgación progresiva (`RF-12`): información ejecutiva arriba, detalle técnico expandible bajo demanda.

* **Nivel 1 — Recomendación y Resumen Ejecutivo (`HU-F07`):**
* Tarjeta superior destacada con la recomendación (`Presentarse`, `Presentarse con riesgo`, `No presentarse`, `Condicionada`) acompañada de color accesible, texto explícito y la justificación redactada con referencia a los numerales clave.
* Contadores totales por estado (`Cumple`, `Cumple parcialmente`, `No cumple`, `En revisión`) y métrica de cobertura del pliego (`X de Y secciones procesadas`).
* Banner de alerta prominente con enlace directo si existen secciones sin procesar o ítems pendientes de revisión humana.
* Indicadores complementarios si existen: días al cierre, duración del análisis y costo estimado.


* **Nivel 2 — Categorías y Lista de Brechas (`HU-F08`):**
* **Lista de Brechas (`Brechas` primero):** Sección dedicada con todos los ítems en `no_cumple` o `cumple_parcialmente`, ordenados estrictamente poniendo los **Habilitantes primero**, e indicando si son subsanables cuando el dato esté disponible.
* **Tarjetas por Categoría:** Acordeones expandibles/contraíbles para `Habilitante`, `Técnico`, `Experiencia` y `Plazo`, cada uno con barra de cobertura y conteos por estado. Las categorías sin ítems deben mostrarse explícitamente como vacías (nunca ocultarse).
* **Filtros combinables:** Filtrar la matriz por `estado` y por `categoría`. La suma de ítems debe coincidir siempre con los conteos del Nivel 1.


* **Nivel 3 — Detalle de Ítem y Evidencia (`HU-F09`):**
* Al expandir una fila o ítem se visualiza: `numeral`, `pagina`, texto literal del requisito, ítem verificable desagregado, estado, evidencia citada (documento fuente + cita literal), `faltante` (si no cumple o es parcial) y nivel de confianza.
* **Indicador de verificación de cita:** Mostrar si la cita fue verificada contra la fuente (`cita_verificada: true`). Si es `false`, mostrar advertencia clara de cita no verificada.
* **Trazabilidad humana:** Si fue editado por un usuario, mostrar autor, fecha y comentario de revisión. Si está en estado `revision`, mostrar el motivo exacto.



### 5.6 Visor Interactivo Split-View y Salto con Resaltado (`HU-F10` / `RF-26` - Must)

* **Disposición Split-Screen:** Matriz de cobertura / brechas a la izquierda; Visor de PDF + panel lateral de evidencia asignada a la derecha.
* **Gestión de Descarga y Caché del PDF:**
* Descargar el archivo PDF **una sola vez** al abrir la licitación usando `pdf_url_temporal` y almacenarlo como `Blob` / `ArrayBuffer` en memoria del cliente.
* Cambiar entre filas de la matriz **jamás** debe volver a descargar el PDF ni realizar peticiones HTTP al backend.
* Si la URL temporal caduca antes de completar la descarga o al refrescar el documento, solicitar silenciosamente una nueva URL a la API manteniendo la página actual del visor.


* **Salto de Página y Renderizado de Resaltados:**
* Al hacer clic en una fila de la matriz:
1. El visor navega instantáneamente a `ubicacion.pagina`.
2. Sobre el contenedor relativo de la página renderizada (`react-pdf`), dibujar capas `<div>` absolutas con fondo amarillo semitransparente (`rgba(255, 235, 59, 0.4)`) usando las coordenadas normalizadas:
* `left: `${zona.x * 100}%``
* `top: `${zona.y * 100}%``
* `width: `${zona.width * 100}%``
* `height: `${zona.height * 100}%``
*(Usar porcentajes CSS garantiza que los resaltados escalen automáticamente con el zoom y el redimensionamiento de ventana).*


3. **Manejo de degradación según `ubicacion.precision`:**
* `exacta`: Salta a la página y dibuja los resaltados normalmente.
* `aproximada`: Salta a la página, dibuja los resaltados y muestra badge informativo (*"Ubicación aproximada"*).
* `solo_pagina`: Salta a la página sin dibujar recuadros y muestra aviso (*"No se encontró el texto exacto; mostrando página de la sección"*).






* **Accesibilidad por Teclado:** Permitir recorrer las filas de la matriz usando las teclas de flecha (`ArrowUp` / `ArrowDown`) sincronizando automáticamente el visor.

### 5.7 Revisión Humana y Recálculo (`HU-F11` - Should)

* Bandeja o vista filtrada con todos los ítems marcados en estado `revision`, mostrando su motivo (ambigüedad, cita no verificada o baja confianza).
* Cada ítem permite saltar directamente a su ubicación en el visor PDF (`HU-F10`) y consultar la evidencia recuperada.
* Formulario de resolución: selector de nuevo estado (`cumple`, `cumple_parcialmente`, `no_cumple`) + **campo de comentario obligatorio** (botón de guardar deshabilitado si el comentario está vacío).
* Mostrar diálogo de confirmación antes de guardar si la modificación cambia la recomendación general de la licitación.
* Al guardar (`POST /licitaciones/{id}/items/{item_id}/revisar`), actualizar dinámicamente los conteos, brechas, recomendación y justificación en la interfaz sin recargar toda la página, y mostrar el historial inalterable de revisiones del ítem.

### 5.8 Chat Contextual de la Licitación (`HU-F12` - Should)

* Panel lateral colapsable con historial de conversación acotado exclusivamente a la licitación actual.
* **Enlaces interactivos a numerales:** Detectar referencias a numerales en las respuestas del asistente (ej. `3.2.1`) y renderizarlas como enlaces clicables que hacen saltar el visor PDF (`HU-F10`) a dicha sección.
* Bloquear el envío de nuevas preguntas y mostrar indicador de carga mientras se espera respuesta.
* Si el backend devuelve HTTP `429` (cuota diaria alcanzada), informar claramente al usuario.
* Renderizar respuestas sin permitir HTML incrustado (`S-11`).

### 5.9 Borrador de Observaciones al Pliego (`HU-F13` - Should)

* En ítems marcados como ambiguos (`es_ambiguo: true`), habilitar el botón *"Generar observación"*.
* Invocar al backend (`POST /licitaciones/{id}/items/{item_id}/observacion`) y abrir un modal/panel con un `<textarea>` editable que contiene el texto formal generado (con numeral, asunto y cita literal).
* Botón *"Copiar al portapapeles"* con confirmación visual.
* **Aviso obligatorio de prevención de errores:** Indicar explícitamente que *el sistema solo genera el borrador y no lo envía ni radica ante la entidad contratante*.

### 5.10 Manejo de Errores, Estados Vacíos y Exportación (`HU-F15` - Must, `HU-F16` - Could)

* **Sesión Expirada (`HU-F15`):** Interceptor HTTP que, ante HTTP `401`, redirige a `/login?redirect=<ruta_actual>` para restaurar la vista tras iniciar sesión.
* **Errores de Red/Servidor (`HU-F15`):** Mensajes claros en español con acción de recuperación (*Reintentar* / *Volver*).
* **Exportación a Excel (`HU-F16` - Could):** Botón en el dashboard que descarga el archivo `.xlsx` generado por el backend (`GET /licitaciones/{id}/exportar`). Si existen ítems pendientes en `revision`, mostrar una advertencia antes de descargar.

---

## 6. Lista de Verificación de Seguridad para Código Frontend

Al escribir cualquier componente, servicio HTTP o manejador de estado en React, verifica siempre:

1. **Cero secretos privados (`S-06`):** Jamás referenciar `SUPABASE_SERVICE_ROLE_KEY`, claves de AWS, Anthropic o NVIDIA en el código cliente.
2. **Identidad delegada al token (`S-04`):** Nunca enviar `organizacion_id` o `rol` en payloads de creación/consulta; confiar exclusivamente en el header `Authorization: Bearer <token>`.
3. **Sanitización estricta (`S-11`):** Jamás renderizar HTML crudo proveniente de los PDFs, citas de evidencia o respuestas del chat.
4. **Manejo opaco de permisos (`S-03`):** Tratar errores `403` y `404` de recursos individuales de forma idéntica en la UI (*"No disponible"*).
5. **URLs temporales de S3 (`S-10`):** No cachear `pdf_url_temporal` en `localStorage` entre sesiones; solicitarla al abrir el dashboard y renovarla bajo demanda si expira.

---

## 7. Priorización MoSCoW para Desarrollo (Orden de Implementación)

Construye y valida las funcionalidades siguiendo estrictamente este orden de prioridad para garantizar el éxito de la demostración:

1. **Prioridad `Must` (Imprescindibles para la Demo — Días 1 y 2):**
* `HU-F01`: Iniciar y cerrar sesión (Supabase Auth + interceptor JWT).
* `HU-F04`: Cargar base de conocimiento (Admin, con validación múltiple y advertencia de reemplazo).
* `HU-F05`: Cargar pliego PDF (Drag & drop, validación previa y detección de duplicados).
* `HU-F06`: Ver progreso del análisis en vivo (polling con limpieza al salir y contador de secciones).
* `HU-F07`: Dashboard Nivel 1 (Recomendación con color + texto, justificación, conteos y alerta de cobertura/revisión).
* `HU-F08`: Dashboard Nivel 2 (Brechas con habilitantes primero, tarjetas por categoría y filtros).
* `HU-F09`: Dashboard Nivel 3 (Detalle de ítem, cita verificada/advertencia, faltante y auditoría).
* `HU-F10`: Split-view con visor PDF (`react-pdf`), descarga única, salto por fila y resaltado amarillo por coordenadas normalizadas (`RF-26`).
* `HU-F15`: Manejo transversal de errores, estados vacíos, Error Boundaries y redirección por sesión expirada.


2. **Prioridad `Should` (Confirmadas para después de las Must — Día 2):**
* `HU-F11`: Bandeja de revisión humana con comentario obligatorio y recálculo dinámico.
* `HU-F12`: Chat contextual de licitación con enlaces clicables a numerales en el visor.
* `HU-F13`: Generador y editor de borrador de observaciones para requisitos ambiguos.
* `HU-F14`: Panel general de licitaciones de la organización.
* `HU-F02` & `HU-F03`: Aceptar invitación y gestión de miembros por administrador.


3. **Prioridad `Could` (Solo si sobra tiempo antes de congelar código el Día 3):**
* `HU-F16`: Botón de exportación de la matriz a Excel.


4. **Fuera de Alcance (`Won't` ahora — Hoja de ruta futura):**
* No implementar recepción por correo (`RF-17`), múltiples documentos/anexos por proceso (`RF-28`), comparación de adendas (`RF-34`), estado "cumple con consorcio" (`RF-31`), detector de pliegos sastre (`RF-32`) ni monitoreo automático de SECOP (`RF-25`).


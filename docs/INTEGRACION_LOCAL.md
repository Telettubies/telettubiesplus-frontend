# Integración local con FastAPI

El modo conectado se activa con `VITE_USE_MOCKS=false`. El modo de demostración mantiene las pantallas y mocks anteriores con `true`. Los estados vacíos, errores y permisos del modo conectado proceden del servidor; no se simula éxito si una petición falla.

## Configuración

Crear `.env.local` en la raíz del frontend:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
VITE_USE_MOCKS=false
```

La URL y clave son públicas y deben pertenecer al proyecto Supabase configurado en el backend. Nunca usar service_role, claves de IA o credenciales de PostgreSQL en el frontend. Vite solo serializa variables VITE_. Reiniciar Vite tras cambiar el entorno.

En backend: `CORS_ORIGINS=http://localhost:5173`. API y worker deben estar activos; Docker de desarrollo debe tener PostgreSQL y RabbitMQ sanos. La cuenta de Supabase debe tener una membresía en PostgreSQL. El alta inicial de organización/administrador sigue siendo `analizador-cli crear-organizacion` (consultar README del backend).

```powershell
# Backend, terminal 1
uv sync --locked
docker compose -f docker-compose.dev.yml up -d --wait
uv run analizador-api
# Backend, terminal 2
uv run analizador-worker
# Frontend, terminal 3
npm ci
npm run dev
```

Abrir http://localhost:5173. La sesión y refresco son de supabase-js. `/api/yo` resuelve membresías; si hay varias, la interfaz exige selección de una. El encabezado X-Organizacion-Id solo selecciona esa membresía; los permisos los comprueba FastAPI.

## Flujos conectados

| Pantalla | Operaciones FastAPI |
|---|---|
| Acceso | GET /api/yo; sesión/contraseña/invitación mediante Supabase Auth |
| Licitaciones | GET /api/licitaciones; GET /api/limites |
| Carga | POST /api/licitaciones; IDs anidados y duplicada |
| Progreso | GET /api/licitaciones/{id}/progreso; POST reintentar; catálogo y estados del servidor |
| Resultado | GET /api/licitaciones/{id}/resultado (200/202/409); GET trabajos |
| PDF | URL firmada del resultado y GET pdf-url; descarga sin JWT externo; Blob por usuario/organización/documento |
| Revisión | POST /api/resultados/{resultado_id}/revisiones; espera de reevaluación en resultado |
| Conocimiento | GET/POST /api/conocimiento; GET fuentes; POST indexacion |
| Miembros | GET /api/miembros; POST invitaciones; PATCH rol; DELETE miembro |
| Chat | POST chat; citas/numerales y cuotas reales; historial en memoria de la vista |
| Observaciones | POST observaciones por requisito UUID ambiguo; asunto/texto editables, sin envío a entidad |
| Excel | GET exportar; XLSX del servidor |

`src/api/backend.ts` contiene DTO separados de los tipos visuales de demo. `backend.schemas.json` copia los esquemas del OpenAPI publicado y valida respuestas en ejecución. `node scripts/check-backend-contract.mjs` comprueba que no se hayan quedado desactualizados. Cambiar contratos requiere actualizar DTO, esquemas y pruebas, no adaptar el backend a los mocks.

No se han implementado nuevas capacidades de backend: drive de carpetas, carga corporativa ZIP/Word/PDF individuales, registro público de organizaciones, cronograma, costo ni subsanabilidad. Conocimiento se carga mediante JSON completo, reemplazando la versión anterior con confirmación. Hay ejemplo sintético descargable. La interfaz no inventa metadatos ausentes.

## Verificación reproducible

```powershell
node scripts/check-backend-contract.mjs
node_modules/.bin/tsc.cmd --noEmit
npm test -- --runInBand
npm run build
```

Prueba de humo de modo conectado:

1. Ejecutar desde la raíz del frontend: `../telettubiesplus-backend/.venv/Scripts/python.exe -u scripts/smoke-backend.py`. Requiere PostgreSQL local y dependencias del backend. Crea una base nueva `analizador_smoke_<aleatorio>_test` y aplica migraciones; nunca usa la base de trabajo para los datos de prueba.
2. En otra terminal, configurar variables **solo para ese proceso**:

```powershell
$env:VITE_USE_MOCKS='false'
$env:VITE_API_BASE_URL='http://127.0.0.1:18001/api'
$env:VITE_SUPABASE_URL='https://proyecto-test.supabase.co'
$env:VITE_SUPABASE_ANON_KEY='synthetic-public-key'
node_modules/.bin/vite.cmd --host 127.0.0.1 --port 5181 --strictPort
```

3. Usar Playwright CLI con sesión propia: abrir http://localhost:5181 y ejecutar `run-code --filename scripts/smoke-browser.js`. La skill local Playwright incluye su wrapper. El script recorre login, listado, PDF y resaltado, revisión y reevaluación, chat, observaciones, Excel, miembros, JSON y carga/progreso. Usa solo datos sintéticos; las confirmaciones se aceptan en el navegador de prueba.
4. Al terminar, hacer POST a `http://127.0.0.1:18001/__smoke/shutdown`; apaga el servidor de humo y elimina su base temporal. Detener también el Vite de 5181. El nombre temporal queda en `test-results/smoke-database.txt` si una terminación forzada impide la limpieza; no borrar ninguna otra base.

Este humo usa FastAPI y PostgreSQL reales, JWT firmado con clave de pruebas, SDK Supabase con respuestas Auth interceptadas y almacenamiento/cola/IA simulados. Verifica contrato, navegación y persistencia, no la conectividad con proveedores externos ni un pipeline IA real. No ejecutar contra EC2 ni con datos de clientes.

## Comprobaciones de revisiones anteriores

- Tipos: comprobación completa sin errores.
- Frontend: 57 pruebas pasadas; el build incluye el worker PDF local.
- Humo navegador: recorrido conectado verificado contra FastAPI/PostgreSQL desechables.
- Los cambios previos del usuario en package.json/package-lock.json y el worker backend se conservan.
- No se han realizado commits, push, despliegues, invitaciones reales ni llamadas de IA de pago.

## Volver al diseño y funciones mock originales

Cambiar `VITE_USE_MOCKS=true` en el archivo de entorno que utilices y reiniciar Vite. El interruptor global tiene prioridad sobre los flags por feature: `true` activa toda la demo y `false` activa la integración real. Si no se define, los flags granulares siguen disponibles. No mantener un valor contrario en `.env.local`, porque Vite le da prioridad sobre `.env`.

El modo mock mantiene las páginas, navegación, estilos, login, registro de organización de cuatro pasos, invitaciones, selector de rol, tour y datos simulados originales. No necesita el backend ni una sesión real de Supabase. Ambos modos utilizan las pantallas originales; la interfaz alternativa de `.connected` ya no se monta.

## Integración sobre el diseño original

Las rutas de ambos modos utilizan ahora las páginas originales (login, registro, sidebar, portafolio, carga, matriz, visor, revisión, chat y fichero corporativo). La antigua pantalla alternativa de `features/connected/ConnectedRouter.tsx` no se monta. Se reutilizan de ese módulo los DTO, servicios, sesión y transporte PDF.

El modo real consulta los datos del servidor dentro de los hooks originales. Las opciones sin contrato —registro de organizaciones, carpetas persistidas y eliminación individual de fuentes— permanecen visibles y explican su estado al utilizarlas. El alta de membresía inicial sigue el procedimiento del backend. La carga de conocimiento admite el JSON completo y avisa del reemplazo; no simula subidas de ZIP, Word o PDF corporativo.

En este cambio, por petición expresa del usuario, no se han ejecutado tests, build, comprobaciones de tipos, navegador ni llamadas de prueba. Los resultados de verificación registrados arriba corresponden a revisiones anteriores y no validan estos últimos cambios.

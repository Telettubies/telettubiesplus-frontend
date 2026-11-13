# TenderComply - Analizador de Pliegos (Frontend)

Plataforma web frontend para el analisis inteligente de pliegos licitatorios, matrices de cobertura y cumplimiento normativo. La solucion permite gestionar documentos licitatorios, procesar archivos PDF con visualizacion interactiva y resaltado de evidencias, y coordinar flujos de trabajo de revision humana con trazabilidad y roles de acceso.

## Caracteristicas Principales

- Autenticacion y administracion de usuarios: Registro empresarial, recepcion de invitaciones, validaciones de seguridad y control de acceso basado en roles (RBAC).
- Carga y procesamiento de pliegos: Ingestion de archivos, barra de progreso y estado de procesamiento en tiempo real.
- Panel de control de licitaciones: Tablero centralizado para seguimiento del estado de cada proceso licitatorio.
- Matriz de evaluacion y dashboard: Visualizacion de metricas clave, recomendaciones de participacion y desglose de cumplimiento.
- Visor interactivo de pliegos en PDF: Lectura sincronizada, resaltado visual de requerimientos y consulta de evidencias vinculadas.
- Flujo de revision humana: Aprobacion y modificacion de sugerencias del sistema con registro de auditoria y justificaciones.
- Base de conocimiento empresarial: Organizacion de repositorios documentales corporativos para indexacion y analisis contextual.
- Gestion de miembros del equipo: Asignacion de roles operativos, auditores y administradores.

## Tecnologias Utilizadas

### Nucleo y Construccion
- React 18
- TypeScript 5
- Vite 6

### Enrutamiento y Gestion de Estado
- React Router DOM 6
- Context API y Hooks personalizados
- js-cookie (almacenamiento de sesion en cookies)

### Estilos y Presentacion Visual
- Tailwind CSS 3
- Framer Motion (animaciones fluidas)
- React Icons
- React Joyride (tours interactivos guiados)

### Procesamiento de Documentos y Red
- React-PDF (renderizado e interaccion sobre archivos PDF)
- Axios (cliente HTTP centralizado con interceptores)
- Supabase JS Client

### Calidad de Codigo y Pruebas
- Jest y React Testing Library (pruebas unitarias y de componentes)
- Playwright (pruebas de extremo a extremo / E2E)
- PostCSS y Autoprefixer

## Estructura del Proyecto

La arquitectura sigue un patron modular orientado a caracteristicas (Feature-Driven Architecture):

```text
frontend/
├── .agent/                  Configuraciones y directrices de agentes
├── e2e/                     Suites de pruebas E2E con Playwright
├── public/                  Archivos estaticos publicos
├── scripts/                 Scripts auxiliares y de utileria
├── src/
│   ├── api/                 Cliente Axios, tipos y definicion de endpoints
│   ├── features/            Modulos funcionales independientes
│   │   ├── manageAuth/                 Autenticacion, login y registro
│   │   ├── manageBaseConocimiento/     Base documental y carpetas
│   │   ├── manageCargaYProgreso/       Carga de archivos y seguimiento
│   │   ├── manageChatYObservaciones/   Conversaciones y notas en linea
│   │   ├── manageDashboardMatriz/      Metricas y matriz de cobertura
│   │   ├── manageMiembros/             Invitaciones y control de equipo
│   │   ├── managePanelLicitaciones/    Listado y gestion de licitaciones
│   │   ├── manageRevisionHumana/       Aprobacion y auditoria de decisiones
│   │   └── manageVisorPliego/          Visor PDF y capa de resaltado
│   ├── pages/               Vistas principales asociadas a rutas
│   ├── routes/              Definicion de rutas publicas, privadas y protegidas
│   └── shared/              Componentes comunes, diseno base, badges y utilidades
├── .env.example             Plantilla de variables de entorno
├── .gitignore               Reglas de exclusion para Git
├── index.html               Punto de entrada HTML
├── jest.config.cjs          Configuracion de Jest
├── package.json             Dependencias y scripts del proyecto
├── playwright.config.ts     Configuracion de Playwright
├── tailwind.config.js       Configuracion de Tailwind CSS
├── tsconfig.json            Configuracion del compilador TypeScript
└── vite.config.ts           Configuracion del empaquetador Vite
```

## Requisitos Previos

- Node.js (version 18.x o superior recomendada)
- Gestor de paquetes npm (o pnpm / yarn)

## Instalacion y Ejecucion

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Telettubies/telettubiesplus-frontend.git
   cd telettubiesplus-frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Copie el archivo de ejemplo y ajuste las claves correspondientes segun su entorno de ejecucion:
   ```bash
   cp .env.example .env
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El entorno quedara disponible en `http://localhost:5173`.

5. Construir la version de produccion:
   ```bash
   npm run build
   ```

6. Previsualizar la version de produccion construida:
   ```bash
   npm run preview
   ```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local con recarga en caliente (HMR).
- `npm run build`: Compila y genera los artefactos optimizados de produccion en la carpeta `dist`.
- `npm run preview`: Levanta un servidor local para inspeccionar la version compilada.
- `npm run test`: Ejecuta el conjunto de pruebas unitarias con Jest.
- `npm run test:e2e`: Ejecuta las pruebas de integracion end-to-end con Playwright.

## Produccion con Docker Compose

El frontend dispone de Dockerfile y Compose propios, como el backend. La imagen
compila con Node 22 y sirve `dist` con Caddy en el puerto interno 8080. El proxy
compartido del backend termina HTTPS y dirige las peticiones a `frontend:8080`.
Los dos Compose comparten la red `analizador_interna`; solo el proxy publica puertos.
Levantar primero el backend para crear esa red (ADR-016).

### Entorno en la VM

Guardar el entorno publico en `~/analizador-frontend/.env.production`, junto al Compose del
frontend. Copiar `.env.prod.example` y completar las URLs HTTPS y la clave publica
Supabase. Nunca copiar el `.env` privado del backend a esta carpeta.
`VITE_API_BASE_URL` debe ser `https://<dominio-api>/api` (sin `/v1`):
el backend registra sus rutas bajo `/api` y Caddy conserva ese prefijo.

```bash
cd ~/analizador-frontend
cp .env.prod.example .env.production
nano .env.production
chmod 600 .env.production
```

El contenedor genera `/runtime-config.js` antes de iniciar el servidor. La aplicacion
lee esta configuracion antes que las variables compiladas por Vite. Solo publica
`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y fuerza
`VITE_USE_MOCKS=false`. Las URLs deben usar HTTPS y la clave debe ser publishable o
anon. Las claves secret y service_role se rechazan. Este archivo no se almacena en
cache. Cambiar el entorno requiere recrear el contenedor, sin recompilar la imagen:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --no-build --force-recreate --wait frontend
```

### Construccion local o imagen publicada

Con el codigo fuente completo en esa carpeta, usar una imagen local:

```bash
FRONTEND_IMAGE=analizador-frontend FRONTEND_TAG=local docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build --wait
```

Para operar solo con archivos de despliegue, configurar `FRONTEND_IMAGE` y
`FRONTEND_TAG` en `.env.production` con una imagen ya publicada en GHCR. Usar el SHA permite
fijar una version. Si el paquete es privado, ejecutar antes `docker login ghcr.io`
con una cuenta autorizada para leerlo.

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml pull frontend
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --no-build --wait
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 frontend
```

No ejecutar estos comandos desde `~/analizador`: ese Compose corresponde al backend.
`BACKEND_NETWORK` permite cambiar la red externa si tiene otro nombre. El alias
`frontend` debe ser unico en esa red.

### Migracion del proxy compartido

Los cambios en `telettubiesplus-backend/deploy/Caddyfile` y su Compose sustituyen
el montaje de archivos por `reverse_proxy frontend:8080`. Mantener en el `.env`
del backend `FRONTEND_DOMAIN=app.ejemplo.com` y
`CORS_ORIGINS=https://app.ejemplo.com`, con el dominio real. Con el frontend ya
iniciado y ambos archivos actualizados en la VM, recrear el proxy una sola vez:

```bash
cd ~/analizador
docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate caddy
```

Las carpetas antiguas `releases` y `current` dejan de utilizarse; no se borran.
La configuracion del backend y de su CD permanece independiente.

### CD con imagen

El workflow [CD](.github/workflows/cd.yml) publica imagenes `:<sha>` y `:latest`
en GHCR al recibir cambios en `main`, o al ejecutarse manualmente sobre `main`.
Despues copia el Compose a la VM y recrea el frontend con la imagen del commit.
Conserva SSH con identidad verificada, comprueba el SHA servido por HTTPS y
restaura la imagen anterior si falla y existe una version previa. El `.env.production`
permanece en la VM y no se sobrescribe. El historial de esta migracion esta en
[deploy/CD-propuesto.md](deploy/CD-propuesto.md).

Los secretos SSH actuales son `EC2_HOST`, `EC2_USUARIO`,
`EC2_LLAVE_SSH` y `EC2_KNOWN_HOSTS`. Las variables de Actions son
`EC2_DIRECTORIO` (predeterminado `analizador-frontend`), `FRONTEND_URL` y
`PLATAFORMA` (`linux/amd64` o `linux/arm64`). Las variables VITE se leen del `.env.production`
de la VM y ya no son necesarias en GitHub.

Verificaciones locales sin servicios externos:

```bash
node --test scripts/runtime-config.test.mjs
npm run build
```

## Licencia

Este proyecto se encuentra publicado bajo los terminos de la Licencia MIT.

```text
MIT License

Copyright (c) 2026 Telettubies

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```



## Backend real en local

Para iniciar sesión y trabajar con FastAPI en lugar de datos de demostración, consulta [Integración local](docs/INTEGRACION_LOCAL.md).

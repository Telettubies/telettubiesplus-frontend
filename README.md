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

## CI/CD del frontend

El workflow [CI](.github/workflows/ci.yml) instala las dependencias con `npm ci`
y construye el frontend en cada PR hacia `main`, con configuracion ficticia y sin secretos.

El workflow [CD](.github/workflows/cd.yml) construye el frontend en GitHub al recibir
cambios en `main` y copia el build por SSH a `~/analizador-frontend` en la EC2
existente. El Caddy compartido sirve los archivos directamente por HTTPS.
El build de produccion desactiva los mocks. Este despliegue estatico implementa
la responsabilidad de C-12 y la ubicacion del frontend descritas en el DAS 6.5;
el proxy sigue ejecutandose con Docker Compose (ADR-016).

En este repositorio, configurar los siguientes secretos de Actions (de repositorio
o del environment `produccion`):

- `EC2_HOST`: IP o DNS SSH de la VM existente, sin protocolo ni ruta.
- `EC2_USUARIO`: usuario SSH con permiso de escritura en la carpeta del frontend.
- `EC2_LLAVE_SSH`: contenido completo de la llave privada, guardado en GitHub Secrets.
- `EC2_KNOWN_HOSTS`: identidad publica SSH verificada del servidor, con formato
  `<mismo valor de EC2_HOST> ssh-ed25519 <clave publica del servidor>`.

Variable de repositorio obligatoria en Actions:

- `VITE_SUPABASE_ANON_KEY`: clave publica `publishable` o `anon` del proyecto
  Supabase. Su valor se configura en GitHub Variables, fuera del codigo versionado.
  Es configuracion publica del navegador; nunca usar `service_role` ni claves privadas.

Variables de repositorio opcionales:

- `EC2_DIRECTORIO`: `analizador-frontend` por defecto, distinto de la carpeta del backend.
- `FRONTEND_URL`: `https://criterio.duckdns.org` por defecto.
- `VITE_API_BASE_URL`: `https://telettubies-api.duckdns.org/api/v1` por defecto.
- `VITE_SUPABASE_URL`: permite reemplazar la URL publica del proyecto conectado.

Las variables antiguas `BACKEND_NETWORK` y `PLATAFORMA` ya no se utilizan.

### Configuracion unica del Caddy existente

En la VM, crear la carpeta como el usuario SSH antes de montar el volumen:

```bash
mkdir -p "$HOME/analizador-frontend/releases"
```

En el `docker-compose.prod.yml` del backend, agregar este volumen al servicio
`caddy`, conservando los existentes:

```yaml
- ${FRONTEND_DIRECTORIO:-../analizador-frontend}:/srv/frontend:ro
```

La ruta predeterminada supone que el backend esta en `~/analizador`. Si el
frontend se publica en otra carpeta, definir `FRONTEND_DIRECTORIO` con esa ruta
absoluta en el `.env` del backend y `EC2_DIRECTORIO` con la misma ruta en Actions.
Se monta la carpeta padre para que Caddy pueda seguir el enlace `current` al cambiarlo.

En el Caddyfile, reemplazar el sitio anterior del frontend por:

```caddyfile
{$FRONTEND_DOMAIN:http://frontend.localhost} {
    encode zstd gzip
    root * /srv/frontend/current
    handle /assets/* {
        header Cache-Control "public, max-age=31536000, immutable"
        file_server
    }
    handle /version.txt {
        header Cache-Control "no-store"
        file_server
    }
    handle {
        header Cache-Control "no-cache"
        try_files {path} /index.html
        file_server
    }
}
```

El `.env` del backend debe contener `FRONTEND_DOMAIN=criterio.duckdns.org` y
`CORS_ORIGINS=https://criterio.duckdns.org`. Mantener el bloque existente de la API.
Los ajustes completos del proxy, incluidas las cabeceras de seguridad, estan en
`telettubiesplus-backend/deploy/Caddyfile` y `docker-compose.prod.yml`; conservarlos
en su repositorio para que el siguiente CD del backend mantenga la configuracion.

Una vez actualizados ambos archivos en la VM, aplicar el montaje desde la carpeta
del backend. Este paso recrea solo el proxy y puede interrumpir el acceso brevemente:

```bash
cd "$HOME/analizador"
docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate caddy
```

El volumen requiere esa recreacion inicial; los siguientes CD del frontend solo
cambian los archivos y el enlace `current`, sin reiniciar el proxy. Antes de la
primera publicacion, el dominio del frontend puede responder 404.

Para publicar, abrir un PR de la rama de trabajo hacia `main`, esperar el CI y
fusionar. En Actions, el CD debe completar el trabajo de build y publicacion.
Una ejecucion manual del CD tambien debe seleccionar `main`.

La logica de despliegue esta integrada en `.github/workflows/cd.yml`. El CD crea
`releases/<sha>-<ejecucion>-<intento>` y cambia atomicamente el enlace relativo
`current` a esa carpeta, despues de copiar el build completo. Se conservan las
versiones anteriores. El frontend no necesita `.env` en la VM: su configuracion
publica se incorpora al JavaScript durante el build.

La comprobacion HTTPS exige que `/version.txt` devuelva el SHA publicado. Si falla,
el CD restaura el enlace a la version anterior cuando existe y termina con error.
En la primera publicacion no hay una version anterior que recuperar. Este chequeo
confirma la publicacion y el acceso por Caddy; no ejercita los flujos de negocio.

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

# CD del frontend en la EC2 del backend

El frontend tiene sus propios workflows: `ci.yml` comprueba el build en PR hacia
`main`, y `cd.yml` publica la imagen y despliega al llegar a `main`. El CI usa
configuracion ficticia y no requiere secretos. Ninguno ejecuta Jest ni Playwright.

El flujo sigue el CD del backend: un push a `main` (o una ejecucion manual desde
`main`) construye la imagen, la publica en GHCR con el SHA del commit y `latest`,
y la despliega por SSH en EC2 con Docker Compose. No ejecuta Jest ni Playwright.
El contenedor debe quedar saludable y Caddy debe servir el frontend por HTTPS para
que el despliegue termine correctamente.

El build corre en GitHub, no en la VM. Nginx sirve los archivos estaticos sin root,
con soporte para recargar rutas de React Router. Caddy, que ya pertenece al backend,
sigue siendo la entrada por los puertos 80/443 y administra HTTPS.

## Configuracion necesaria en GitHub

En el repositorio **telettubiesplus-frontend**, abrir **Settings > Secrets and
variables > Actions**. Los secretos de un repositorio no se comparten automaticamente
con el otro. Pueden usarse secretos de organizacion habilitados para ambos repositorios.

Secretos (de repositorio o del environment `produccion`):

- `EC2_HOST`: misma IP elastica o DNS de la EC2 usada por el backend.
- `EC2_USUARIO`: mismo usuario SSH, con acceso a Docker sin `sudo`.
- `EC2_LLAVE_SSH`: contenido completo de la llave privada autorizada en esa EC2.
  Configurar directamente en GitHub Secrets; no subirla a Git ni pegarla en el chat.
- `EC2_KNOWN_HOSTS`: entrada de `known_hosts` para ese mismo host. Desde una conexion
  confiable a la EC2, consultar la clave publica del servidor:

  ```bash
  cat /etc/ssh/ssh_host_ed25519_key.pub
  ```

  Conservar algoritmo y clave, y anteponer el valor exacto de `EC2_HOST`. Ejemplo:
  `ec2.ejemplo.com ssh-ed25519 AAAA...`. Es una clave publica de servidor; no es la
  clave privada `.pem` ni la de `authorized_keys`. Si se obtiene con `ssh-keyscan`,
  verificar su huella por un canal confiable antes de guardarla. El workflow exige
  que coincida; no acepta automaticamente una identidad nueva.

Las variables **de repositorio** siguientes son opcionales: el workflow ya contiene
los dominios indicados y la configuracion publica obtenida del proyecto conectado
`telettubiesplus's Project`. Se pueden reemplazar sin editar el archivo de CD:

- `VITE_SUPABASE_URL`: por defecto `https://etedmckzqceqygbdkzng.supabase.co`.
- `VITE_SUPABASE_ANON_KEY`: por defecto la clave `publishable` activa de ese proyecto,
  obtenida mediante el conector. Aunque conserva el nombre de variable de la aplicacion,
  es una clave publica moderna. Nunca usar `service_role` ni `sb_secret_`.
- `VITE_API_BASE_URL`: por defecto `https://telettubies-api.duckdns.org/api/v1`,
  sin barra final. `/health` es un endpoint de estado, no la base de la API.
  Nunca `localhost` ni `api:8000`: la peticion sale del navegador de cada usuario.
- `FRONTEND_URL`: por defecto `https://criterio.duckdns.org`, sin ruta adicional.
  Se usa para comprobar el acceso publico al terminar.
- `EC2_DIRECTORIO`: directorio de este despliegue, por defecto `analizador-frontend`,
  relativo al home SSH o absoluto. Debe ser **distinto** del directorio del backend;
  no usar `analizador`. El workflow admite letras, numeros, guiones, guion bajo y `/`.
- `BACKEND_NETWORK`: red Docker que contiene Caddy; por defecto `analizador_interna`,
  que corresponde al Compose actual del backend (`name: analizador`, red `interna`).
- `PLATAFORMA`: `linux/amd64` por defecto o `linux/arm64` si la EC2 es Graviton.

GitHub genera `GITHUB_TOKEN` automaticamente. El job de imagen tiene `packages: write`
y el de despliegue `packages: read`; la imagen debe estar vinculada a este repositorio
y permitir acceso desde sus Actions. No hace falta guardar un token personal en la EC2.

## Preparacion inicial de la VM y del proxy

Estos pasos son de activacion en produccion. Preparar los archivos localmente no los
ejecuta ni cambia la EC2.

1. La EC2 debe tener Docker y Compose v2 con soporte para `up --wait`, el backend
   desplegado y su red disponible. El usuario SSH debe poder ejecutar `docker`.
   Debe existir conectividad SSH desde el runner autorizado, salida HTTPS para
   descargar imagenes de GHCR y entrada publica por 80/443 para Caddy.
2. Los registros DNS A de `criterio.duckdns.org` y `telettubies-api.duckdns.org`
   deben apuntar a la IP de la misma EC2, como indica la configuracion prevista.
   No publicar un AAAA que no tenga conectividad IPv6 funcional.
3. Configurar una vez el proxy Caddy que ya corre en la EC2. Su Caddyfile debe
   conservar el sitio actual de la API y contener tambien este bloque:

   ```caddyfile
   criterio.duckdns.org {
       encode zstd gzip
       reverse_proxy frontend:8080
   }
   ```

   La integracion versionada esta preparada en `telettubiesplus-backend/deploy/Caddyfile`
   y `docker-compose.prod.yml`: usan `FRONTEND_DOMAIN` con fallback local para los
   entornos que todavia no tienen frontend. Son configuracion del proxy compartido;
   los workflows existentes del backend se conservan.
   Caddy selecciona el sitio por el hostname de la peticion (y SNI en HTTPS):
   `telettubies-api.duckdns.org` va a `api:8000` y `criterio.duckdns.org` va a
   `frontend:8080`, aunque ambos dominios resuelvan a la misma IP.
4. Para activarlo sin desplegar de nuevo el backend, actualizar solo el Caddyfile
   existente de la VM (`~/analizador/deploy/Caddyfile`) y recargar el proxy. Si el
   archivo ya contiene un sitio para ese dominio, actualizar ese sitio en vez de
   duplicarlo. Al modificar el archivo montado, escribir sobre el mismo archivo
   para conservar su inode; `cat >>` permite agregar el bloque sin reemplazarlo.
   Desde `~/analizador`, ejecutar:

   ```bash
   docker compose -f docker-compose.prod.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
   ```

   Conservar tambien los ajustes versionados de Caddy y Compose en el backend
   para que su siguiente CD mantenga la ruta. El `.env` de la VM debe contener
   `FRONTEND_DOMAIN=criterio.duckdns.org` para esa configuracion versionada.
5. El `.env` **del backend en EC2** debe permitir el origen del frontend:

   ```dotenv
   CORS_ORIGINS=https://criterio.duckdns.org
   ```

   Si ya lo configuraste, este paso esta listo. Si cambia, la API debe volver a
   cargar su configuracion en su siguiente despliegue. El bloque literal anterior
   permite activar la ruta de Caddy de forma independiente del despliegue del backend.
6. Configurar en Supabase Auth la Site URL y las Redirect URLs que use la aplicacion
   con el dominio definitivo del frontend (por ejemplo para las invitaciones).
7. Configurar los secretos y los overrides necesarios, incorporar el frontend en `main`
   y dejar correr **Actions > CD**. Para ejecucion manual, seleccionar la rama `main`.
   No hace falta copiar un `.env` de build a la VM.

## Comportamiento del despliegue

- El build fuerza `VITE_USE_MOCKS=false`. Cambiar las variables publicas requiere
  reconstruir y desplegar la imagen, porque Vite las incorpora al JavaScript.
- La carpeta del frontend tiene su propio Compose (`analizador-frontend`); cada CD
  actualiza solo su servicio `frontend`. No ejecuta migraciones, `down`, eliminacion
  de huerfanos ni limpieza global de imagenes del backend.
- Los dos proyectos comparten la red existente `analizador_interna`, con el alias
  `frontend` para Nginx. El frontend no publica puertos de host.
- El tag desplegado queda en `analizador-frontend/.env` para operacion manual. Ese
  archivo solo contiene imagen, tag y nombre de red, no las credenciales de la API.
- Si el contenedor nuevo no queda saludable, se intenta levantar la imagen anterior
  y el workflow falla. En el primer despliegue no hay imagen anterior que recuperar.
- Si falla la comprobacion HTTPS publica, el workflow falla y mantiene la imagen
  que ya quedo saludable; revisar DNS, Caddy y las variables antes de reintentar.
  La URL publica debe devolver en `/version.txt` el SHA exacto recien desplegado,
  para detectar que Caddy haya quedado sirviendo una version anterior u otro sitio.
  Este chequeo no ejercita los flujos de negocio de la aplicacion.

## Operacion manual

Desde el directorio del frontend en EC2, despues de un despliegue correcto:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail 100 frontend
```

Para volver a un SHA anterior, usar una imagen que ya exista en la VM. Si no existe,
autenticarse primero en GHCR por un canal seguro y descargarla con `compose pull`:

```bash
FRONTEND_TAG=<sha-anterior> docker compose -f docker-compose.prod.yml up -d --no-build --wait frontend
```

Despues actualizar `FRONTEND_TAG` en el `.env` del frontend para conservar la seleccion
en futuras operaciones manuales. El siguiente CD volvera al SHA de `main` que despliegue.

## Referencias

- [Publicar imagenes desde GitHub Actions](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images).
- [Redes entre proyectos de Docker Compose](https://docs.docker.com/compose/how-tos/networking/).
- [Variables de Vite y su exposicion en el cliente](https://vite.dev/guide/env-and-mode).
- [Recargar la configuracion de Caddy](https://caddyserver.com/docs/command-line#caddy-reload).
- [Claves publicas y privadas de Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

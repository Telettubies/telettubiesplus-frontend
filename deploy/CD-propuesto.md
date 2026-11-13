# Propuesta de CD con imagen

Propuesta autorizada y aplicada en `.github/workflows/cd.yml`. Este documento
se conserva como referencia y no se ejecuta. Conserva los secretos SSH existentes y necesita `.env.production` en la VM.
Publica `:<sha>` y `:latest` en GHCR al recibir un push a `main`; despues despliega
solo el frontend en `~/analizador-frontend`, sobre la red del backend.

En el workflow actual se conservarian el disparador, la concurrencia, el environment
`produccion`, la validacion de entradas y la configuracion SSH con known_hosts.
Se sustituirian las etapas de construccion y publicacion estatica por estas:

```yaml
# Nuevo job anterior al despliegue:
imagen:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  permissions:
    contents: read
    packages: write
  outputs:
    imagen: ${{ steps.nombre.outputs.imagen }}
  steps:
    - uses: actions/checkout@v6
    - name: Nombre de imagen
      id: nombre
      run: echo "imagen=ghcr.io/${GITHUB_REPOSITORY,,}" >> "$GITHUB_OUTPUT"
    - uses: docker/setup-qemu-action@v4
      if: ${{ vars.PLATAFORMA == 'linux/arm64' }}
    - uses: docker/setup-buildx-action@v4
    - uses: docker/login-action@v4
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    - uses: docker/build-push-action@v7
      with:
        context: .
        platforms: ${{ vars.PLATAFORMA || 'linux/amd64' }}
        push: true
        build-args: REVISION=${{ github.sha }}
        tags: |
          ${{ steps.nombre.outputs.imagen }}:${{ github.sha }}
          ${{ steps.nombre.outputs.imagen }}:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

El job `despliegue` dependeria de `imagen`, con permisos `contents: read` y
`packages: read`. Quitaria setup-node, npm ci, build, tar y cambios de enlaces de
releases. Tras configurar SSH, ejecutaria estos pasos:

```yaml
- name: Copiar Compose sin sobrescribir el entorno
  run: |
    set -euo pipefail
    ssh ec2 "bash -s -- $(printf '%q ' "$DIRECTORIO")" <<'EOF'
    set -euo pipefail
    directorio=$(realpath -m -- "$1")
    [[ "$directorio" != / && "$directorio" != "$HOME" ]] || exit 1
    if [[ -f "$directorio/docker-compose.prod.yml" ]] && grep -q BACKEND_IMAGE "$directorio/docker-compose.prod.yml"; then
      echo 'EC2_DIRECTORIO apunta al backend; elegir una carpeta separada.' >&2
      exit 1
    fi
    mkdir -p -- "$directorio"
    EOF
    scp docker-compose.prod.yml .env.prod.example "ec2:$DIRECTORIO/"
- name: Descargar, recrear y verificar version
  env:
    IMAGEN: ${{ needs.imagen.outputs.imagen }}
    TAG: ${{ github.sha }}
    GHCR_USUARIO: ${{ github.actor }}
    GHCR_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    set -euo pipefail
    printf '%s' "$GHCR_TOKEN" | ssh ec2 "docker login ghcr.io -u '$GHCR_USUARIO' --password-stdin"
    ssh ec2 "bash -s -- $(printf '%q ' "$DIRECTORIO" "$IMAGEN" "$TAG" "$FRONTEND_URL")" <<'EOF'
    set -euo pipefail
    cd "$1"
    trap 'docker logout ghcr.io >/dev/null' EXIT
    test -f .env.production || { echo 'Falta .env.production del frontend en la VM.' >&2; exit 1; }
    export FRONTEND_IMAGE="$2" FRONTEND_TAG="$3"
    COMPOSE='docker compose --env-file .env.production -f docker-compose.prod.yml'
    anterior=$($COMPOSE ps -q frontend | xargs -r docker inspect --format '{{.Config.Image}}')
    $COMPOSE pull frontend
    if $COMPOSE up -d --no-build --wait --wait-timeout 120; then
      for _ in $(seq 1 12); do
        if [[ "$(curl --fail --silent --show-error --max-time 15 --proto '=https' "${4%/}/version.txt")" == "$3" ]]; then
          echo "Desplegado $2:$3"
          exit 0
        fi
        sleep 5
      done
    fi
    $COMPOSE logs --tail=100 frontend
    if [[ -n "$anterior" ]]; then
      export FRONTEND_IMAGE="${anterior%:*}" FRONTEND_TAG="${anterior##*:}"
      $COMPOSE up -d --no-build --wait --wait-timeout 120
      echo 'Restaurada la imagen anterior; se conserva el .env.production actual.'
    fi
    echo '::error::Fallo del despliegue o de HTTPS; revisar Caddy, red y .env.'
    exit 1
    EOF
```

Se conservaria la limpieza de la llave SSH con `if: always()`. La configuracion
publica dejaria de venir de Variables de GitHub: se leeria del `.env.production` de la VM.
La comprobacion exige que HTTPS sirva el SHA nuevo; ante fallo restaura la imagen
anterior si existe. No restaura el `.env.production` ni reconfigura el proxy del backend.

#!/usr/bin/env bash
# Ejecutado por CD en la EC2, nunca durante la preparacion local.
set -euo pipefail

cd "$1"
export FRONTEND_IMAGE="$2" FRONTEND_TAG="$3" BACKEND_NETWORK="$4" DOCKER_CONFIG="$5"
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

docker network inspect "$BACKEND_NETWORK" >/dev/null || {
  echo 'Falta la red del backend. Desplegar primero el backend y revisar BACKEND_NETWORK.' >&2
  exit 1
}

compose=(docker compose -f docker-compose.prod.yml)
# Guardar el tag que esta corriendo antes de reemplazarlo, para recuperarlo si no arranca.
contenedor=$("${compose[@]}" ps -q frontend)
imagen_anterior=''
if [[ -n "$contenedor" ]]; then
  imagen_anterior=$(docker inspect --format '{{.Config.Image}}' "$contenedor")
fi

"${compose[@]}" pull --quiet frontend
if ! "${compose[@]}" up -d --no-build --no-deps --wait --wait-timeout 120 frontend; then
  "${compose[@]}" ps -a
  "${compose[@]}" logs --no-color --tail 50 frontend
  if [[ -n "$imagen_anterior" ]]; then
    export FRONTEND_IMAGE="${imagen_anterior%:*}" FRONTEND_TAG="${imagen_anterior##*:}"
    echo 'Recuperando la imagen anterior del frontend.'
    "${compose[@]}" up -d --no-build --no-deps --wait --wait-timeout 120 frontend
  fi
  exit 1
fi

# Conservar el SHA desplegado para operaciones manuales y tras reinicios de la VM.
umask 077
printf 'FRONTEND_IMAGE=%s\nFRONTEND_TAG=%s\nBACKEND_NETWORK=%s\n' \
  "$FRONTEND_IMAGE" "$FRONTEND_TAG" "$BACKEND_NETWORK" > .env
echo "Desplegado $FRONTEND_IMAGE:$FRONTEND_TAG"

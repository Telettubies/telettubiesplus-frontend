FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build
ARG REVISION=local
RUN printf '%s\n' "$REVISION" > dist/version.txt

FROM caddy:2.10-alpine
# Node serializa la configuracion publica al arrancar; no ejecuta Vite en produccion.
RUN apk add --no-cache nodejs
COPY --from=build /app/dist /srv/frontend
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY scripts/runtime-config.mjs /app/runtime-config.mjs
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["/bin/sh", "-ec", "node /app/runtime-config.mjs && exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]

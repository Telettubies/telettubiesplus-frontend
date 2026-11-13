# syntax=docker/dockerfile:1.7
# El build recibe solo configuracion publica; las credenciales SSH/GHCR no entran aqui.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev

COPY index.html vite.config.ts tsconfig.json postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src

ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_USE_MOCKS=false

RUN test -n "$VITE_API_BASE_URL" \
    && test -n "$VITE_SUPABASE_URL" \
    && test -n "$VITE_SUPABASE_ANON_KEY"

# Evitar que una clave privilegiada se incorpore accidentalmente al JavaScript publico.
RUN node <<'JS'
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!key.startsWith("sb_publishable_")) {
    const payload = JSON.parse(Buffer.from(key.split(".")[1] || "", "base64url").toString());
    if (payload.role !== "anon") throw new Error("Usar solo una clave publica anon o publishable");
}
JS

RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
ARG APP_REVISION=local
RUN printf '%s\n' "$APP_REVISION" > /usr/share/nginx/html/version.txt

USER nginx
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/index.html || exit 1

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]

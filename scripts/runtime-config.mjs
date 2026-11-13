import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Lista explicita: nunca publicar el entorno completo ni secretos del backend (S-06).
export function createRuntimeConfig(env) {
  const config = {};
  for (const key of ['VITE_API_BASE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']) {
    if (!env[key]?.trim()) throw new Error(`Falta ${key} en el .env del frontend`);
    config[key] = env[key];
  }
  for (const key of ['VITE_API_BASE_URL', 'VITE_SUPABASE_URL']) {
    const url = new URL(config[key]);
    if (url.protocol !== 'https:') throw new Error(`${key} debe usar HTTPS en produccion`);
  }
  // El proxy conserva la ruta; FastAPI expone /api, sin /v1.
  const apiUrl = new URL(config.VITE_API_BASE_URL);
  if (apiUrl.pathname.replace(/\/+$/, '') !== '/api' || apiUrl.search || apiUrl.hash) {
    throw new Error('VITE_API_BASE_URL debe terminar en /api, sin /v1, query ni fragmento');
  }
  const key = config.VITE_SUPABASE_ANON_KEY;
  if (!key.startsWith('sb_publishable_')) {
    const payload = JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString());
    if (payload.role !== 'anon') throw new Error('Usar una clave publica anon o publishable');
  }
  // El contenedor de produccion siempre consume servicios reales.
  config.VITE_USE_MOCKS = 'false';
  return config;
}

export function serializeRuntimeConfig(config) {
  return `globalThis.__RUNTIME_ENV__ = ${JSON.stringify(config).replace(/</g, '\\u003c')};\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync('/srv/frontend/runtime-config.js', serializeRuntimeConfig(createRuntimeConfig(process.env)));
}

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import axios from 'axios';
import { createRuntimeConfig, serializeRuntimeConfig } from './runtime-config.mjs';

const env = {
  VITE_API_BASE_URL: 'https://api.ejemplo.com/api',
  VITE_SUPABASE_URL: 'https://proyecto.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'sb_publishable_prueba',
};
test('publica solo la configuracion permitida y desactiva mocks en produccion', () => {
  const config = createRuntimeConfig({ ...env, SUPABASE_SERVICE_ROLE_KEY: 'secreto', VITE_USE_MOCKS: 'true', VITE_OTRO: 'privado' });
  assert.deepEqual(config, { ...env, VITE_USE_MOCKS: 'false' });
});
test('rechaza configuracion ausente, HTTP y claves privilegiadas', () => {
  assert.throws(() => createRuntimeConfig({}), /Falta/);
  assert.throws(() => createRuntimeConfig({ ...env, VITE_API_BASE_URL: 'http://api.ejemplo.com' }), /HTTPS/);
  const jwt = `cabecera.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.firma`;
  assert.throws(() => createRuntimeConfig({ ...env, VITE_SUPABASE_ANON_KEY: jwt }), /publica/);
  assert.throws(() => createRuntimeConfig({ ...env, VITE_SUPABASE_ANON_KEY: 'sb_secret_prueba' }));
});
test('admite una clave anon y serializa comillas sin ejecutar contenido', () => {
  const key = `cabecera.${Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url')}.firma`;
  assert.equal(createRuntimeConfig({ ...env, VITE_SUPABASE_ANON_KEY: key }).VITE_SUPABASE_ANON_KEY, key);
  const value = '</script>";throw new Error("inyectado");';
  const script = serializeRuntimeConfig({ prueba: value });
  const context = {};
  vm.runInNewContext(script, context);
  assert.equal(context.__RUNTIME_ENV__.prueba, value);
  assert.ok(!script.includes('</script>'));
});

test('el navegador usa el entorno de la VM antes que el incorporado en el build', () => {
  const source = readFileSync(new URL('../src/shared/utils/mockSwitch.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const context = {
    exports: {},
    __VITE_ENV__: { VITE_API_BASE_URL: 'https://antigua.ejemplo.com', VITE_USE_MOCKS: 'true' },
    __RUNTIME_ENV__: createRuntimeConfig(env),
  };
  vm.runInNewContext(outputText, context);
  assert.equal(context.exports.getEnvVar('VITE_API_BASE_URL'), env.VITE_API_BASE_URL);
  assert.equal(context.exports.shouldUseMock('VITE_MOCK_AUTH'), false);
  delete context.__RUNTIME_ENV__;
  assert.equal(context.exports.getEnvVar('VITE_API_BASE_URL'), 'https://antigua.ejemplo.com');
  assert.equal(context.exports.shouldUseMock(), true);
});

test('la URL de licitaciones usa /api una sola vez y rechaza /api/v1', () => {
  const config = createRuntimeConfig(env);
  const source = readFileSync(new URL('../src/api/endpoints.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const context = { exports: {} };
  vm.runInNewContext(outputText, context);
  const client = axios.create({ baseURL: config.VITE_API_BASE_URL });
  assert.equal(client.getUri({ url: context.exports.API_ENDPOINTS.LICITACIONES.LIST }), 'https://api.ejemplo.com/api/licitaciones');
  for (const suffix of ['', '/api/v1', '/api/api', '/api?version=1', '/api#version']) {
    assert.throws(() => createRuntimeConfig({ ...env, VITE_API_BASE_URL: `https://api.ejemplo.com${suffix}` }), /terminar en \/api/);
  }
  assert.equal(createRuntimeConfig({ ...env, VITE_API_BASE_URL: `${env.VITE_API_BASE_URL}/` }).VITE_API_BASE_URL, `${env.VITE_API_BASE_URL}/`);
});

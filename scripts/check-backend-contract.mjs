import fs from 'node:fs';
import assert from 'node:assert/strict';
const published = JSON.parse(fs.readFileSync(new URL('../../telettubiesplus-backend/docs/openapi.json', import.meta.url), 'utf8'));
const consumed = JSON.parse(fs.readFileSync(new URL('../src/api/backend.schemas.json', import.meta.url), 'utf8'));
assert.deepEqual(consumed, published.components.schemas, 'Los esquemas consumidos no coinciden con OpenAPI. Sincroniza el contrato y sus DTO antes de integrar cambios.');
console.log('Contrato frontend sincronizado con OpenAPI del backend.');

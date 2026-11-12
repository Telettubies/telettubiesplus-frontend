import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import fs from 'fs';
import path from 'path';

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}

if (typeof window !== 'undefined' && !window.URL.createObjectURL) {
  window.URL.createObjectURL = () => 'blob:http://localhost:5173/mock-pdf-blob';
  window.URL.revokeObjectURL = () => {};
}

// Cargar variables de entorno en tests para compatibilidad
try {
  const envPath = path.resolve(__dirname, '../../../../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && process.env[k.trim()] === undefined) {
          process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  }
} catch {
  // ignore
}

(globalThis as any).__VITE_ENV__ = process.env;


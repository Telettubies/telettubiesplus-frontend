declare const __VITE_ENV__: Record<string, string> | undefined;

/**
 * Helper seguro para leer variables de entorno tanto en Vite (navegador) como en Jest/Node.
 */
export function getEnvVar(key: string): string | undefined {
  try {
    if (typeof __VITE_ENV__ !== 'undefined' && __VITE_ENV__ && __VITE_ENV__[key] !== undefined) {
      return String(__VITE_ENV__[key]);
    }
  } catch {
    // ignore
  }
  const viteEnv = (globalThis as any).__VITE_ENV__;
  if (viteEnv && viteEnv[key] !== undefined) {
    return String(viteEnv[key]);
  }
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return String(process.env[key]);
  }
  return undefined;
}

/**
 * Helper para alternar entre datos de prueba (mockups) y la API real de FastAPI.
 * Respeta el interruptor global VITE_USE_MOCKS de .env y los interruptores granulares VITE_MOCK_*.
 */
export function shouldUseMock(featureFlagOrEnvKey?: string): boolean {
  if (featureFlagOrEnvKey === 'true' || featureFlagOrEnvKey === 'false') {
    return featureFlagOrEnvKey === 'true';
  }

  const globalFlag = getEnvVar('VITE_USE_MOCKS');

  // Si el interruptor global en .env está apagado (false), se desactivan todos los mockups (estado vacío / FastAPI real)
  if (globalFlag === 'false') {
    return false;
  }

  // Si se consulta un flag granular específico (ej. VITE_MOCK_PANEL, VITE_MOCK_CONOCIMIENTO)
  if (featureFlagOrEnvKey && featureFlagOrEnvKey.startsWith('VITE_')) {
    const val = getEnvVar(featureFlagOrEnvKey);
    if (val !== undefined && val !== '') {
      return val === 'true';
    }
  }

  // Si el interruptor global es 'true', se activan los mockups
  if (globalFlag === 'true') {
    return true;
  }

  // Por defecto en desarrollo sin backend se asume true
  return true;
}

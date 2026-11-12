import type { AxiosError } from 'axios';
import { normalizeApiError, setUnauthorizedRedirectHandler } from '@/api/interceptors';

describe('Interceptores y Normalización Centralizada de Errores HTTP (HU-F15, S-03)', () => {
  it('redirige a /login preservando ruta actual cuando recibe HTTP 401', () => {
    const mockRedirect = jest.fn();
    setUnauthorizedRedirectHandler(mockRedirect);

    const error401 = {
      response: { status: 401, data: {} },
    } as unknown as AxiosError;

    const result = normalizeApiError(error401, '/licitaciones/LP-MIN-001-2026');
    expect(result.status).toBe(401);
    expect(result.code).toBe('UNAUTHORIZED');
    expect(mockRedirect).toHaveBeenCalledWith('/licitaciones/LP-MIN-001-2026');
  });

  it('normaliza HTTP 403 y 404 a mensaje opaco "Recurso no disponible" para prevenir IDOR (S-03)', () => {
    const error403 = {
      response: { status: 403, data: {} },
    } as unknown as AxiosError;
    const error404 = {
      response: { status: 404, data: {} },
    } as unknown as AxiosError;

    const res403 = normalizeApiError(error403);
    const res404 = normalizeApiError(error404);

    expect(res403.code).toBe('RESOURCE_UNAVAILABLE');
    expect(res404.code).toBe('RESOURCE_UNAVAILABLE');
    expect(res403.message).toContain('Recurso no disponible');
    expect(res404.message).toBe(res403.message);
  });

  it('preserva lista completa de errores de campo en HTTP 422 (HU-F04)', () => {
    const error422 = {
      response: {
        status: 422,
        data: {
          errors: [
            { linea: 42, campo: 'valor_contrato_smmlv', detalle: 'Debe ser numérico positivo' },
          ],
        },
      },
    } as unknown as AxiosError;

    const res422 = normalizeApiError(error422);
    expect(res422.code).toBe('VALIDATION_ERROR');
    expect(res422.validationErrors).toHaveLength(1);
    expect(res422.validationErrors?.[0].campo).toBe('valor_contrato_smmlv');
  });
});


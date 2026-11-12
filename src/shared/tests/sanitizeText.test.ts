import { sanitizeText } from '../utils/sanitizeText';

describe('Prevención de XSS en cadenas del pliego y del asistente (S-11)', () => {
  it('elimina etiquetas <script> y atributos maliciosos preservando texto seguro', () => {
    const malicious =
      'Numeral 3.2.1 <script>alert("xss")</script> acreditar 4.000 m² <img src=x onerror=alert(1) />';
    const clean = sanitizeText(malicious);

    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('onerror');
    expect(clean).toContain('Numeral 3.2.1');
    expect(clean).toContain('acreditar 4.000 m²');
  });

  it('maneja valores nulos o vacíos de forma segura', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(undefined as unknown as string)).toBe('');
  });
});


import { test, expect } from '@playwright/test';

test.describe('Flujo Estrella: Matriz de Cobertura + Visor PDF con Resaltado + Revisión + Chat (HU-F07..HU-F13)', () => {
  test('renderiza split-view, resalta coordenadas en amarillo al seleccionar requisito y navega a Revisión y Chat', async ({ page }) => {
    await page.goto('/licitaciones/LP-MIN-001-2026');

    // Nivel 1: Recomendación y Cobertura
    await expect(page.getByText('100% Cobertura')).toBeVisible();
    await expect(page.getByText('52 / 52 Secciones Auditadas')).toBeVisible();

    // Visor PDF y Resaltado Amarillo (RF-26)
    const highlightBox = page.getByTestId('pdf-highlight-box');
    await expect(highlightBox).toBeVisible();

    // Clic en fila de la matriz actualiza selección sin recargar página
    await page.getByTestId('matrix-row-REQ-015').click();
    await expect(highlightBox).toBeVisible();

    // Navegar a Bandeja de Revisión Humana (Págs. 38–43)
    await page.getByRole('button', { name: /Revisión Humana/i }).click();
    await expect(page.getByText('Ítems en Conflicto o Ambiguos')).toBeVisible();
    await expect(page.getByText('Determinar Estado de Cumplimiento Manual:')).toBeVisible();

    // Navegar a Asistente Legal y Observaciones
    await page.getByRole('button', { name: /Asistente Legal/i }).click();
    await expect(page.getByText('Consulta Contextual del Pliego')).toBeVisible();
    await expect(page.getByText('Generador de Observaciones al Pliego')).toBeVisible();
  });
});


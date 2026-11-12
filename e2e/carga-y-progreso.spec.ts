import { test, expect } from '@playwright/test';

test.describe('Carga de Pliego PDF y Progreso del Pipeline LangGraph (HU-F05, HU-F06)', () => {
  test('renderiza vista de carga de pliego PDF e inicia progreso por secciones', async ({ page }) => {
    await page.goto('/licitaciones/nueva');

    await expect(page.getByText('Cargar Pliego de Condiciones')).toBeVisible();
    await expect(page.getByText('Progreso del Análisis del Pliego')).toBeVisible();
    await expect(page.getByText('Protección Antifraude Activa')).toBeVisible();

    // Iniciar análisis con el pliego seleccionado por defecto
    await page.getByTestId('start-analysis-btn').click();
    await expect(page.getByText(/Analizando sección/i)).toBeVisible();
  });
});


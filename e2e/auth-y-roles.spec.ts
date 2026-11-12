import { test, expect } from '@playwright/test';

test.describe('Autenticación, Invitaciones y Control de Roles (HU-F01, HU-F02, HU-F03, HU-F04)', () => {
  test('renderiza Login con Google SSO y validación de credenciales', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('TenderComply')).toBeVisible();
    await expect(page.getByText('Continue with Google')).toBeVisible();

    await page.getByLabel('Contraseña', { exact: true }).fill('wrong');
    await page.getByTestId('login-submit-button').click();
    await expect(page.getByTestId('login-error-banner')).toBeVisible();
  });

  test('renderiza flujo de Aceptar Invitación con reglas de contraseña en tiempo real', async ({ page }) => {
    await page.goto('/invitacion');
    await expect(page.getByText('Set up your profile')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Constructora Andina S.A.S.' })).toBeVisible();
    await expect(page.getByText('12+ characters')).toBeVisible();
  });

  test('permite acceso a Base de Conocimiento editable y separa Miembros del Equipo en su propia página', async ({ page }) => {
    await page.goto('/configuracion/conocimiento');
    await expect(page.getByText('Carga de Datos Maestros de la Organización')).toBeVisible();
    await expect(page.getByText('Archivos Fuente y Trazabilidad de Origen')).toBeVisible();
    await expect(page.getByText('Información Detallada y Editable de la Organización')).toBeVisible();
    await expect(page.getByText('Miembros del Equipo')).toHaveCount(0);

    await page.goto('/configuracion/miembros');
    await expect(page.getByText('Miembros del Equipo')).toBeVisible();
  });
});


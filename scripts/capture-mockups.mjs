import { preview } from 'vite';
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/samue/.gemini/antigravity/brain/ed057a3a-0d59-4623-b103-63a8fd54f16a/capturas';
const PUBLIC_DIR = path.resolve('public/mockups');

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

async function run() {
  console.log('Iniciando servidor Vite preview...');
  const server = await preview({
    preview: {
      port: 4173,
      host: 'localhost',
    },
  });

  const baseUrl = 'http://localhost:4173';
  console.log(`Servidor preview iniciado en ${baseUrl}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  // Evitar que el tour emergente tape las capturas
  await context.addCookies([
    {
      name: 'criterio_guided_tour_v1',
      value: 'completed',
      domain: 'localhost',
      path: '/',
    },
  ]);

  const page = await context.newPage();

  const pagesToCapture = [
    {
      name: 'captura-portafolio',
      url: `${baseUrl}/licitaciones`,
      selector: '[data-tour="portfolio-table"]',
    },
    {
      name: 'captura-carga-pliego',
      url: `${baseUrl}/licitaciones/nueva`,
      selector: '[data-tour="upload-dropzone"]',
    },
    {
      name: 'captura-matriz-analisis',
      url: `${baseUrl}/licitaciones/LP-MIN-001-2026`,
      selector: '#tour-step-pdf-viewer',
    },
    {
      name: 'captura-pantalla-completa',
      url: `${baseUrl}/licitaciones/LP-MIN-001-2026/visor-enfocado`,
      selector: '[data-tour="focused-header"]',
    },
    {
      name: 'captura-base-conocimiento',
      url: `${baseUrl}/configuracion/conocimiento`,
      selector: '[data-tour="knowledge-editable-records"]',
    },
    {
      name: 'captura-gestion-equipo',
      url: `${baseUrl}/configuracion/miembros`,
      selector: '[data-tour="team-members-section"]',
    },
  ];

  for (const item of pagesToCapture) {
    console.log(`Capturando ${item.name} desde ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
      if (item.selector) {
        await page.waitForSelector(item.selector, { timeout: 10000 }).catch(() => {});
      }
      await page.waitForTimeout(1000);

      const publicPath = path.join(PUBLIC_DIR, `${item.name}.png`);
      const artifactPath = path.join(ARTIFACT_DIR, `${item.name}.png`);

      await page.screenshot({ path: publicPath, fullPage: false });
      fs.copyFileSync(publicPath, artifactPath);
      console.log(`✓ Guardada captura: ${item.name}.png`);
    } catch (err) {
      console.error(`Error capturando ${item.name}:`, err);
    }
  }

  await browser.close();
  server.httpServer.close();
  console.log('Capturas completadas exitosamente.');
}

run().catch((err) => {
  console.error('Fallo en la captura de mockups:', err);
  process.exit(1);
});


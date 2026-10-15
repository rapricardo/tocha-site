import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-home-lab.mjs [url] [output]
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:4325';
const output = resolve(process.argv[3] || '/tmp/tocha-rooms-check');
await mkdir(output, { recursive: true });
const results = { url: base, at: new Date().toISOString(), checks: [], errors: [] };
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
async function pageFor(options = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ...options });
  await page.route(/googletagmanager|google-analytics|apolo-lead-proxy/, route => route.abort());
  page.on('pageerror', error => results.errors.push(String(error)));
  return page;
}
async function arrived(page, index) {
  await page.locator(`.lab-home[data-room="${index}"][data-transition=false]`).waitFor();
  assert.equal(await page.locator('.room.is-active').count(), 1);
  assert.equal(await page.locator('.room.is-active').getAttribute('aria-hidden'), 'false');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}
const check = name => results.checks.push(name);
try {
  const page = await pageFor();
  assert.equal((await page.goto(base)).status(), 200);
  await page.locator('#lab-viewport.is-rendered canvas').waitFor();
  assert.equal((await page.locator('#home-title').innerText()).replace(/\s+/g,' ').trim(), 'Sistemas de gestão comercial sob medida.');
  assert.equal(await page.locator('#form-contato').count(), 0);
  await page.screenshot({ path: `${output}/entrada.png` });
  await page.getByRole('link', { name: 'Explorar o laboratório', exact: true }).click();
  await arrived(page, 1);
  assert.equal(await page.locator('.benefit-list li').count(), 3);
  await page.getByRole('link', { name: 'Ir para O que eu faço', exact: true }).click();
  await arrived(page, 2);
  await page.locator('.not-work summary').click();
  assert.equal(await page.locator('.not-work[open] li').count(), 3);
  check('Entrada, porta projetada, conteúdo do trabalho e limites expansíveis');
  await page.getByRole('link', { name: '03 Athena', exact: true }).press('Enter');
  await arrived(page, 3);
  assert.equal(await page.getByRole('link', { name: 'Conhecer o Athena', exact: true }).getAttribute('href'), 'https://athena.app.br/');
  await page.getByRole('link', { name: '04 Como eu trabalho', exact: true }).click();
  await arrived(page, 4);
  await page.locator('.method-step').filter({ hasText: 'Construo' }).locator('summary').click();
  assert.equal(await page.locator('.method-step[open]').count(), 1);
  assert.ok((await page.locator('.method-step[open]').innerText()).includes('Integro as ferramentas'));
  await page.goBack();
  await arrived(page, 3);
  await page.goForward();
  await arrived(page, 4);
  check('Teclado, Athena, etapas, voltar e avançar do navegador');
  await page.locator('#lab-motion').click();
  assert.equal(await page.locator('#lab-motion').getAttribute('aria-pressed'), 'true');
  await page.getByRole('link', { name: '05 Como começar', exact: true }).click();
  await arrived(page, 5);
  assert.equal(await page.locator('.lab-home').getAttribute('data-motion'), 'paused');
  assert.equal(await page.locator('#contato a[data-whatsapp-cta]').count(), 1);
  await page.screenshot({ path: `${output}/contato.png` });
  check('Movimento pausado, navegação sem voo e contato somente por WhatsApp');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await arrived(page, 5);
  assert.equal(await page.locator('#lab-motion').getAttribute('aria-pressed'), 'true');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (let i = 0; i < 5; i++) {
      await page.locator('[data-room-link]').nth(i).click();
      await arrived(page, i + 1);
    }
    await page.screenshot({ path: `${output}/celular-${width}.png` });
  }
  check('Movimento reduzido, links diretos e cinco ambientes em duas larguras de celular');
  const fallback = await pageFor();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.startsWith('webgl') ? null : original.call(this, type, ...args); };
  });
  await fallback.goto(base);
  await fallback.locator('.lab-home[data-render=static]').waitFor();
  await fallback.getByRole('link', { name: 'Explorar o laboratório', exact: true }).click();
  await arrived(fallback, 1);
  await fallback.getByRole('link', { name: '05 Como começar', exact: true }).click();
  await arrived(fallback, 5);
  check('Sem WebGL: apresentação estática e navegação em HTML');
  const noJs = await pageFor({ javaScriptEnabled: false });
  await noJs.goto(base);
  for (const id of ['inicio','laboratorio','o-que-faco','athena','como-trabalho','contato']) assert.equal(await noJs.locator(`#${id}`).isVisible(), true);
  check('Sem JavaScript: seis seções em fluxo normal');
  assert.deepEqual(results.errors, []);
  results.status = 'passed';
} catch (error) {
  results.status = 'failed'; results.failure = String(error); process.exitCode = 1;
} finally {
  await writeFile(`${output}/check.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2)); await browser.close();
}

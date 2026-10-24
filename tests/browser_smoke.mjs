#!/usr/bin/env node
// Independent behavior checks; this does not invoke either model or GitHub writes.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const modulePath = process.env.PLAYWRIGHT_MODULE;
let chromium;
try {
  ({ chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright'));
} catch (error) {
  throw new Error('Playwright is required. Install it outside this repository, then set PLAYWRIGHT_MODULE to its index.mjs.', { cause: error });
}

const html = await readFile(new URL('../web-test/index.html', import.meta.url));
const server = createServer((request, response) => {
  if (request.url !== '/') {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(html);
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

let browser;
let checks = 0;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox'],
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const passed = name => { checks += 1; console.log(`PASS ${viewport.width}px: ${name}`); };
    try {
      const response = await page.goto(origin, { waitUntil: 'load' });
      assert.equal(response.status(), 200);
      assert.equal(await page.title(), '§wyrlz Web Playground');
      assert.equal(await page.locator('#count').textContent(), '0');
      assert.equal(await page.locator('#task-total').textContent(), '0 tasks');
      passed('initial page and state');

      await page.getByRole('button', { name: 'Increase counter', exact: true }).click();
      assert.equal(await page.locator('#count').textContent(), '1');
      await page.getByRole('button', { name: 'Decrease counter', exact: true }).click();
      await page.getByRole('button', { name: 'Decrease counter', exact: true }).click();
      assert.equal(await page.locator('#count').textContent(), '-1');
      await page.getByRole('button', { name: 'Reset', exact: true }).click();
      assert.equal(await page.locator('#count').textContent(), '0');
      passed('counter increments, decrements below zero and resets');

      await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
      await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      passed('theme round trip and accessible labels');

      await page.getByRole('textbox', { name: 'New task', exact: true }).fill('   ');
      await page.getByRole('button', { name: 'Add', exact: true }).click();
      assert.equal(await page.locator('#task-list li').count(), 0);
      passed('blank task rejected');

      await page.getByRole('textbox', { name: 'New task', exact: true }).fill('  Build a small project  ');
      await page.getByRole('button', { name: 'Add', exact: true }).click();
      const task = page.locator('#task-list li');
      assert.equal(await task.locator('span').textContent(), 'Build a small project');
      assert.equal(await page.locator('#task-total').textContent(), '1 task');
      assert.equal(await page.getByRole('textbox', { name: 'New task', exact: true }).inputValue(), '');
      await task.getByRole('checkbox').check();
      assert.match(await task.getAttribute('class'), /\bdone\b/);
      await task.getByRole('checkbox').uncheck();
      assert.doesNotMatch(await task.getAttribute('class'), /\bdone\b/);
      await page.getByRole('button', { name: 'Remove Build a small project', exact: true }).click();
      assert.equal(await page.locator('#task-list li').count(), 0);
      assert.equal(await page.locator('#task-total').textContent(), '0 tasks');
      assert.equal(await page.locator('#task-message').textContent(), 'No tasks yet. Add one to get started.');
      passed('task add, trim, toggle and remove');

      const markup = '<img src=x onerror="window.taskInjection=true">';
      await page.getByRole('textbox', { name: 'New task', exact: true }).fill(markup);
      await page.getByRole('button', { name: 'Add', exact: true }).click();
      assert.equal(await page.locator('#task-list li span').textContent(), markup);
      assert.equal(await page.locator('#task-list img').count(), 0);
      assert.equal(await page.evaluate(() => window.taskInjection), undefined);
      passed('untrusted task markup remains literal text');

      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      assert.deepEqual(errors, []);
      passed('viewport fits with no browser script errors');

      await page.reload({ waitUntil: 'load' });
      assert.equal(await page.locator('#task-list li').count(), 0);
      assert.equal(await page.locator('#count').textContent(), '0');
      passed('refresh preserves documented ephemeral behavior');
    } finally {
      await context.close();
    }
  }
  console.log(`PASS ${checks} browser behavior checks; no model or provider acceptance claimed`);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}

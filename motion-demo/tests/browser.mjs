import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch();
const errors = [];
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
const sample = (selector, duration = 750) => page.locator(selector).evaluate((element, ms) => new Promise(resolve => {
  const values = [];
  const start = performance.now();
  function frame() {
    const css = getComputedStyle(element);
    const matrix = new DOMMatrixReadOnly(css.transform);
    values.push({ x: matrix.m41, y: matrix.m42, scale: matrix.a, opacity: Number(css.opacity) });
    if (performance.now() - start < ms) requestAnimationFrame(frame);
    else resolve(values);
  }
  frame();
}), duration);
const moving = values => values.some(v => Math.abs(v.x) > 1 || Math.abs(v.y) > 1 || Math.abs(v.scale - 1) > .005);
const still = values => values.every(v => Math.abs(v.x) < .1 && Math.abs(v.y) < .1 && Math.abs(v.scale - 1) < .001);
await mkdir('output/playwright', { recursive: true });
try {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: 'Spela rubriken igen' }).click();
  const title = await sample('h1');
  assert(moving(title), 'Heading must move');
  assert(title.some(v => v.y < -.1), 'Spring must overshoot');
  assert(Math.abs(title.at(-1).y) < 1, 'Spring must settle');
  for (let i = 0; i < 3; i++) {
    await page.locator('.card').nth(i).hover();
    const hover = await sample(`article:nth-child(${i + 1}) .card`, 400);
    assert(hover.some(v => v.y < -5), `Card ${i + 1} must lift`);
  }
  await page.getByRole('button', { name: 'Byt ordning ⇄', exact: true }).click();
  assert(moving(await sample('article:first-child', 850)), 'Layout must animate');
  assert.match(await page.locator('article:first-child').innerText(), /03/);
  assert.equal(await page.locator('.reveal').evaluate(el => getComputedStyle(el).opacity), '0');
  await page.locator('.reveal').scrollIntoViewIfNeeded();
  const reveal = await sample('.reveal');
  assert(reveal.some(v => v.opacity > 0 && v.opacity < 1), 'Reveal must fade');
  assert.equal(reveal.at(-1).opacity, 1);
  await page.screenshot({ path: 'output/playwright/desktop.png', fullPage: true });
  console.log('PASS animations: spring overshoot/settle, 3 hover lifts, layout movement, scroll opacity');

  await page.reload();
  await page.waitForTimeout(900);
  await page.keyboard.press('Tab');
  assert.match(await page.locator(':focus').innerText(), /Spela/);
  await page.keyboard.press('Tab');
  assert.match(await page.locator(':focus').innerText(), /Byt ordning/);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  assert.match(await page.locator(':focus').innerText(), /03/);
  assert.equal(await page.locator(':focus').evaluate(el => getComputedStyle(el).outlineWidth), '3px');
  await page.keyboard.press('Space');
  assert.equal(await page.locator(':focus').getAttribute('aria-pressed'), 'true');
  await page.locator('.reveal').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(axe.violations, [], JSON.stringify(axe.violations));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.getByText('Minskad rörelse aktiv').waitFor();
  assert.equal(await page.locator('.reveal').evaluate(el => getComputedStyle(el).opacity), '1');
  await page.getByRole('button', { name: 'Spela rubriken igen' }).click();
  assert(still(await sample('h1', 400)), 'Reduced heading must stay still');
  for (let i = 0; i < 3; i++) {
    await page.locator('.card').nth(i).hover();
    assert(still(await sample(`article:nth-child(${i + 1}) .card`, 200)), 'Reduced hover must stay still');
  }
  await page.getByRole('button', { name: 'Byt ordning ⇄', exact: true }).click();
  assert(still(await sample('article:first-child', 400)), 'Reduced layout must stay still');
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No mobile horizontal overflow');
  const mobileAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(mobileAxe.violations, [], JSON.stringify(mobileAxe.violations));
  await page.screenshot({ path: 'output/playwright/mobile-reduced.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS accessibility: keyboard, visible focus, reduced motion, mobile overflow, axe desktop/mobile (0 violations)');
  console.log('PASS runtime: 0 page errors');
} finally {
  await browser.close();
}

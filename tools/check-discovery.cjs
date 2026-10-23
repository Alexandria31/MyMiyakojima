// Local checks; inquiry responses are mocked and no messages are sent.
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const url = file => 'file:///' + path.join(root, file).replaceAll('\\', '/');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const failures = [];
  let activeFile;
  page.on('pageerror', e => failures.push(`${activeFile}: ${e.message}`));
  await page.route('https://**', route => route.abort());
  const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const file of files) {
      activeFile = file;
      await page.goto(url(file), { waitUntil: 'domcontentloaded' });
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        headingCount: document.querySelectorAll('h1').length,
        discoveryScripts: [...document.scripts].filter(s => s.src.includes('island-discovery.js')).length,
        pixelBlocks: [...document.scripts].filter(s => s.textContent.includes("fbq('init', '4448563795393123')")).length
      }));
      if (state.overflow || state.headingCount !== 1 || state.discoveryScripts !== 1 || state.pixelBlocks !== 1) failures.push({ file, width, ...state });
    }
  }
  await page.goto(url('recommended.html?area=shimoji#islandAreaBrowser'));
  const areaNames = await page.locator('.area-browser-results a').allTextContents();
  if (areaNames.length !== 1 || !areaNames[0].includes('Pono')) failures.push('Shimoji area filter mismatch');
  await page.selectOption('[name=finderArea]', 'north');
  await page.locator('#finderForm button[type=submit]').click();
  if (await page.locator('.finder-result-card').count() !== 2) failures.push('North finder should include Caldo and I Love Miyakojima');
  await page.locator('[data-save-href="caldo-de-cana.html"]').click();
  if (await page.locator('[data-save-href="caldo-de-cana.html"]').getAttribute('aria-pressed') !== 'true') failures.push('Caldo save failed');
  await page.locator('[data-save-href="miyakojima-tours.html#ilove-miyakojima"]').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mymiyakojima-saved-places')));
  if (!saved.includes('miyakojima-tours.html#ilove-miyakojima')) failures.push('Tour save failed');
  await page.goto(url('index.html'));
  if (!await page.locator('#islandFinds').isVisible() || await page.locator('#islandFinds .island-discovery-card').count() !== 3) failures.push('Weekly edit missing');
  await page.goto(url('contact.html'));
  await page.route('https://formspree.io/f/xdargydl', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.locator('[name=name]').fill('Local preview test');
  await page.locator('[name=business]').fill('Local preview');
  await page.selectOption('[name=category]', { index: 1 });
  await page.locator('[name=email]').fill('preview@example.com');
  await page.locator('[name=message]').fill('Mocked browser check. No inquiry is sent.');
  await page.locator('.business-form-button').click();
  await page.locator('.business-form-status.is-success').waitFor();
  if (!await page.evaluate(() => dataLayer.some(entry => entry[0] === 'event' && entry[1] === 'generate_lead'))) failures.push('Successful inquiry event missing');
  await page.goto(url('umioto-log.html'));
  const video = await page.locator('#umiotoVideo').evaluate(v => ({ autoplay: v.autoplay, controls: v.controls, preload: v.preload }));
  if (video.autoplay || !video.controls || video.preload !== 'none') failures.push('Video should be tap-to-play');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [file, selector, name] of [
      ['index.html', '#islandFinds', 'finds'],
      ['recommended.html?area=hirara#islandAreaBrowser', '#islandAreaBrowser', 'areas'],
      ['lomilomi-pono.html', '.visitor-summary', 'visitor'],
      ['contact.html', '.feature-process', 'inquiry']
    ]) {
      await page.goto(url(file));
      if (selector === '.feature-process') await page.locator('.feature-process summary').click();
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(process.env.TEMP, `island-discovery-${name}-${width}.png`) });
    }
  }
  console.log(JSON.stringify({ pages: files.length, widths: [390, 1440], failures, inquiry: 'Mocked only; no email sent', video }, null, 2));
  await browser.close();
  if (failures.length) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });

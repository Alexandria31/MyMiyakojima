const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const fileUrl = file => 'file:///' + path.join(root, file).replaceAll('\\', '/');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const failures = [];
  await page.route('https://**', route => route.abort());
  const files = fs.readdirSync(root).filter(file => file.endsWith('.html'));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const file of files) {
      await page.goto(fileUrl(file), { waitUntil: 'domcontentloaded' });
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        refined: document.body.classList.contains('refined-controls'),
        stylesheet: !!document.querySelector('link[href^="refinements.css"]'),
        clipped: [...document.querySelectorAll('.map-button, .email-button, .business-form-button, .learn-more, .client-inquiry-button')]
          .filter(x => x.getBoundingClientRect().width && x.scrollWidth > x.clientWidth + 2)
          .map(x => x.textContent.trim())
      }));
      const interior = file !== 'index.html';
      if (state.overflow || state.refined !== interior || state.stylesheet !== interior || state.clipped.length) failures.push({ file, width, ...state });
    }
    await page.goto(fileUrl('collaborations.html'));
    if (await page.locator('.portrait-current .spotlight-card').count() !== 1 || await page.locator('.portrait-index a').count() !== 8) failures.push({ width, portraits: 'Missing portrait' });
    if (await page.locator('.portrait-index-photo').count() !== 8) failures.push({ width, images: 'Missing compact portraits' });
    for (const image of await page.locator('.portrait-index-photo').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(x => x.decode());
      if (!await image.evaluate(x => x.naturalWidth > 0 && x.clientWidth <= 96)) failures.push({ width, images: 'Portrait thumbnail failed' });
    }
    const menuStyle = () => page.locator('.menu-toggle').evaluate(x => {
      const s = getComputedStyle(x);
      return [s.display, s.color, s.backgroundColor, s.borderRadius, s.padding, s.fontSize].join('|');
    });
    const before = await menuStyle();
    await page.locator('link[href^="refinements.css"]').evaluate(x => x.remove());
    if (before !== await menuStyle()) failures.push({ width, menu: 'Main menu styling changed' });
  }
  await browser.close();
  console.log(JSON.stringify({ pages: files.length, widths: [320, 390, 768, 1440], failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });

const path = require('path');
const { chromium } = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const url = file => 'file:///' + path.join(root, file).replaceAll('\\', '/');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const failures = [];
  for (const [time, visible, label] of [
    ['2026-10-30T03:00:00Z', 2, 'This Week'],
    ['2026-10-31T15:01:00Z', 2, 'Today'],
    ['2026-11-02T03:00:00Z', 1, 'Tomorrow'],
    ['2026-11-04T03:00:00Z', 0, null]
  ]) {
    const context = await browser.newContext({ timezoneId: 'America/Los_Angeles' });
    await context.addInitScript(timestamp => {
      const OriginalDate = Date;
      window.Date = class extends OriginalDate {
        constructor(...args) { super(...(args.length ? args : [timestamp])); }
        static now() { return timestamp; }
      };
    }, Date.parse(time));
    const page = await context.newPage();
    await page.route('https://**', route => route.abort());
    await page.goto(url('events.html'));
    const cards = page.locator('.events-card:visible');
    if (await cards.count() !== visible) failures.push({ time, visible: await cards.count() });
    if (label && !(await cards.first().locator('.events-status').textContent()).includes(label)) failures.push({ time, label });
    if (await page.locator('.events-grid .island-calendar-empty').isVisible() !== !visible) failures.push({ time, empty: true });
    await context.close();
  }
  const page = await browser.newPage();
  await page.route('https://**', route => route.abort());
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const file of ['index.html', 'events.html', 'recommended.html', 'toppuri.html', 'maho-terraces.html', 'pine-rentacar.html', 'weather.html']) {
      await page.goto(url(file));
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) failures.push({ file, width, overflow: true });
      if (await page.locator('h1').count() !== 1) failures.push({ file, width, heading: true });
      if (['index.html', 'events.html', 'weather.html'].includes(file) && await page.locator('.storm-notice, [data-event-status="cancelled"]').count()) failures.push({ file, width, staleBanner: true });
    }
  }
  await page.goto(url('index.html'));
  if (await page.locator('.storm-notice').count()) failures.push('Old homepage alert remains');
  if (await page.locator('.mm25-creative-button').getAttribute('href') !== 'creative-daiki-nakashima.html') failures.push('October portrait changed');
  await browser.close();
  console.log(JSON.stringify({ dates: 'Tokyo date boundaries verified from a non-Japan timezone', widths: [320, 390, 768, 1440], failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });

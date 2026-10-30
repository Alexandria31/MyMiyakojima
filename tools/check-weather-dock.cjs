const path = require('path');
const { chromium } = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const home = 'file:///' + path.resolve(__dirname, '../index.html').replaceAll('\\', '/');
const forecast = {
  current: { temperature_2m: 27, weather_code: 2, wind_speed_10m: 12 },
  daily: { time: ['2026-10-24'], weather_code: [2], temperature_2m_max: [28], temperature_2m_min: [24], precipitation_probability_max: [20], wind_speed_10m_max: [16] }
};
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const failures = [];
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.addInitScript(data => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, options) => String(input).includes('api.open-meteo.com')
        ? Promise.resolve(new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }))
        : originalFetch(input, options);
    }, forecast);
    page.on('pageerror', error => failures.push({ width, error: error.message }));
    await page.route('https://**', route => route.request().url().includes('api.open-meteo.com')
      ? route.fulfill({ json: forecast }) : route.abort());
    await page.goto(home);
    const dock = page.locator('.weather-dock');
    await page.locator('#miyakoWeatherTemp').filter({ hasText: '27°C' }).waitFor();
    const before = await dock.boundingBox();
    await page.waitForTimeout(1100);
    const after = await dock.boundingBox();
    if (Math.abs(before.x - after.x) > 1 || Math.abs(before.y - after.y) > 1) failures.push({ width, drifting: true });
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }));
    await page.waitForTimeout(300);
    if (width < 761 && !await dock.evaluate(x => x.classList.contains('is-compact'))) failures.push({ width, compact: false });
    const overlaps = await dock.evaluate(x => {
      const a = x.getBoundingClientRect();
      return [...document.querySelectorAll('.site-back-top.is-visible, .saved-places-trigger')].some(y => {
        const b = y.getBoundingClientRect();
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      });
    });
    if (overlaps) failures.push({ width, overlaps: true });
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
    await page.waitForTimeout(300);
    if (await dock.evaluate(x => x.classList.contains('is-compact'))) failures.push({ width, expanded: false });
    if (width < 761) {
      await page.locator('#menuToggle').click();
      if (await dock.isVisible()) failures.push({ width, menu: 'Weather obscures menu' });
      await page.locator('#menuToggle').click();
    }
    await page.locator('.weather-dock-link').click();
    await page.waitForURL('**/weather.html');
    await page.goBack();
    if (!await dock.isVisible()) failures.push({ width, back: false });
    await page.locator('.weather-dock-dismiss').click();
    if (await dock.isVisible()) failures.push({ width, dismiss: false });
    await page.reload();
    if (await dock.isVisible()) failures.push({ width, persistence: false });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify({ widths: [320, 390, 1440], weather: 'Mocked forecast; not live conditions', failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });

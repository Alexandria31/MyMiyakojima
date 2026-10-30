const path = require('path');
const { chromium } = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const home = 'file:///' + path.join(root, 'index.html').replaceAll('\\', '/');
const endpoint = 'https://formspree.io/f/xdargydl';
const fixture = { current: { temperature_2m: 27, weather_code: 2, wind_speed_10m: 12 }, daily: { time: ['2026-10-30'], weather_code: [2] } };
function assert(value, message) { if (!value) throw new Error(message); }
async function fillForm(page) {
  await page.locator('[name=name]').fill('Local preview test');
  await page.locator('[name=business]').fill('Preview only');
  await page.selectOption('[name=category]', { index: 1 });
  await page.locator('[name=email]').fill('preview@example.com');
  await page.locator('[name=message]').fill('Mocked inquiry. No real message is sent.');
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [320, 390, 430, 1440]) {
      const mobile = width < 600;
      const context = await browser.newContext({
        viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile,
        ...(mobile ? { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram' } : {})
      });
      const page = await context.newPage();
      await page.clock.install({ time: new Date('2026-10-30T03:00:00Z') });
      await page.addInitScript(data => {
        const original = window.fetch.bind(window);
        window.fetch = (url, options) => String(url).includes('api.open-meteo.com')
          ? Promise.resolve(new Response(JSON.stringify(data), { status: 200 })) : original(url, options);
      }, fixture);
      await page.route('https://**', route => route.request().url() === endpoint
        ? route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }) : route.abort());
      await page.goto(home);
      assert(await page.locator('.weekend-edit-card:visible').count() === 3, `${width}: weekend choices missing`);
      assert(await page.locator('#weekendEdit').isVisible(), `${width}: weekend feature hidden`);
      assert(await page.locator('.home-credibility-inquiry').isVisible(), `${width}: business link hidden`);
      assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), `${width}: horizontal overflow`);
      for (const category of ['food', 'wellness']) {
        await page.locator(`.weekend-edit-card[href="recommended.html#${category}"]`).click();
        await page.waitForURL(`**/recommended.html#${category}`);
        assert(await page.locator(`#${category}`).isVisible(), `${width}: category link failed`);
        await page.goBack();
        assert(await page.locator('h1').isVisible(), `${width}: back returned a blank page`);
      }
      await page.locator('.home-credibility-inquiry').click();
      await page.waitForURL('**/contact.html#business-inquiry');
      await fillForm(page);
      await page.locator('.business-form-button').click();
      await page.locator('.business-form-status.is-success').waitFor();
      await fillForm(page);
      await page.evaluate(url => {
        const original = window.fetch.bind(window);
        window.fetch = (input, options) => String(input) === url
          ? new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
          : original(input, options);
      }, endpoint);
      await page.locator('.business-form-button').click();
      await page.clock.runFor(15100);
      await page.locator('.business-form-status.is-error').waitFor();
      assert(await page.locator('.business-form-button').isEnabled(), `${width}: form stuck after timeout`);
      assert(await page.locator('[name=business]').inputValue() === 'Preview only', `${width}: failed inquiry lost its text`);
      assert(await page.locator('.business-form-status a').getAttribute('href') === 'mailto:hello@mymiyakojima.com', `${width}: missing email fallback`);
      console.log(`${width}: choices, category navigation, Back, inquiry success, and timeout passed`);
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Pacific/Honolulu' });
    const page = await context.newPage();
    await page.route('https://**', route => route.abort());
    await page.clock.install({ time: new Date('2026-11-01T14:59:55Z') });
    await page.goto(home);
    assert(await page.locator('[data-weekend-event]').isVisible(), 'Sunday event missing before Tokyo midnight');
    await page.clock.runFor(6200);
    assert(!await page.locator('[data-weekend-event]').isVisible(), 'Sunday event remained after Tokyo midnight');
    assert(await page.locator('[data-weekend-fallback]').isVisible(), 'Monday fallback missing');
    assert(await page.locator('.weekend-edit-card:visible').count() === 3, 'Monday has an empty choice');
    assert(!(await page.locator('#weekend-edit-title').textContent()).includes('Weekend'), 'Weekend headline remained on Monday');
    console.log('Tokyo midnight rollover passed while page remained open');
    console.log('All enquiries mocked. Mobile tests emulate an Instagram-style user agent, not the actual Instagram app.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

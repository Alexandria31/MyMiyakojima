const path = require('path');
const { chromium } = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage();
  await page.route('https://**', route => route.request().url().includes('toppri.jp/assets/top/video/') ? route.continue() : route.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const results = [];
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [file, selector] of [['index.html', '#islandFilm'], ['umioto-log.html', '.feature-video'], ['toppuri.html', '.island-film-feature'], ['creative-masa.html', '.masa-video-section']]) {
      await page.goto('file:///' + path.join(root, file).replaceAll('\\', '/'));
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      const before = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, videos: [...document.querySelectorAll('video')].map(v => ({ paused: v.paused, preload: v.preload, muted: v.muted, ready: v.readyState })), youtubeFrames: document.querySelectorAll('[data-youtube-film] iframe').length }));
      await page.screenshot({ path: path.join(process.env.TEMP, `miyako-film-${file}-${width}.png`) });
      if (file === 'creative-masa.html') {
        await page.locator('[data-youtube-film] button').click();
        const frame = page.locator('[data-youtube-film] iframe');
        if (await frame.count() !== 1) errors.push('YouTube player was not created after click');
      } else {
        await page.locator(`${selector} .island-film-play`).click();
        try {
          await page.waitForFunction(() => [...document.querySelectorAll('video')].some(v => !v.paused && v.currentTime > 0), { timeout: 10000 });
        } catch { errors.push(`Playback did not start: ${file}, ${width}`); }
        const active = page.locator(`${selector} video`);
        results.push({ file, width, before, playback: await active.evaluate(v => ({ paused: v.paused, time: v.currentTime, error: v.error?.message })) });
        await active.evaluate(v => v.pause());
        continue;
      }
      results.push({ file, width, before });
    }
  }
  console.log(JSON.stringify({ results, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });

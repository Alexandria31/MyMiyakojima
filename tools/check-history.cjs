const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'msedge', headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: { width: mobile ? 390 : 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
      await context.route('https://**', route => route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      async function visible() {
        await page.waitForFunction(() => !document.body.classList.contains('site-page-leaving') && Number(getComputedStyle(document.body).opacity) > .99);
      }
      await page.goto(origin + '/index.html');
      await visible();
      await page.locator('.mm25-guide-button').click();
      await page.waitForURL('**/recommended.html');
      await visible();
      await page.evaluate(() => history.back());
      await page.waitForURL(origin + '/index.html', { waitUntil: 'commit' });
      await visible();
      assert.equal(new URL(page.url()).pathname, '/index.html');
      await page.evaluate(() => history.forward());
      await page.waitForURL(origin + '/recommended.html', { waitUntil: 'commit' });
      await visible();
      await page.evaluate(() => {
        document.body.classList.add('site-page-leaving');
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      });
      await visible();
      await page.evaluate(() => document.querySelector('.main-nav a.active').click());
      await page.waitForTimeout(400);
      await visible();
      await page.evaluate(() => {
        history.pushState(null, '', '#food');
        document.body.classList.add('site-page-leaving');
      });
      await page.evaluate(() => history.back());
      await page.waitForFunction(() => !location.hash);
      await visible();
      assert.deepEqual(errors, []);
      console.log(`${mobile ? 'Mobile' : 'Desktop'}: Back, Forward, cached pageshow, same-page navigation, and hash history passed.`);
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });

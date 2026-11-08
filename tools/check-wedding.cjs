const path = require('path');
const { chromium } = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const url = file => 'file:///' + path.join(root, file).replaceAll('\\', '/');
const assert = (value, message) => { if (!value) throw Error(message); };
(async () => {
  const browser = await chromium.launch({channel:'msedge', headless:true});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**', route => route.abort());
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      for (const file of ['creative-mutsumi-kouno.html','kounotori-wedding.html','collaborations.html','recommended.html','index.html']) {
        await page.goto(url(file));
        assert(await page.locator('h1').count() === 1, `${file}: H1`);
        assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), `${file} ${width}: overflow`);
        for (const img of await page.locator('img[src*="kounotori-"]').all()) {
          if (!['creative-mutsumi-kouno.html','kounotori-wedding.html'].includes(file)) continue;
          if (!await img.isVisible()) continue;
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(img => img.decode());
          assert(await img.evaluate(img => img.complete && img.naturalWidth > 0), `${file}: broken photo`);
        }
        if ([390,1440].includes(width) && file !== 'recommended.html') {
          await page.evaluate(() => scrollTo(0,0));
          await page.waitForTimeout(300);
          await page.screenshot({path:path.join(root,'tools',`wedding-${file}-${width}.png`)});
        }
      }
      await page.goto(url('recommended.html'));
      await page.locator('a.cat-weddings').click();
      assert(await page.locator('#weddings').isVisible(), 'Wedding category hidden');
      const card = page.locator('#weddings .recommend-card');
      const save = card.locator('button');
      assert(await save.count() > 0, 'Wedding save button missing');
      await save.first().click();
      assert(await page.evaluate(() => localStorage.getItem('mymiyakojima-saved-places').includes('kounotori-wedding.html')), 'Wedding not saved');
      await page.evaluate(() => localStorage.removeItem('mymiyakojima-saved-places'));
      await card.locator('.learn-more').click();
      assert(page.url().endsWith('kounotori-wedding.html'), 'Business card opens portrait');
      await page.goBack();
      assert(await page.locator('body').evaluate(el => getComputedStyle(el).opacity !== '0'), 'Blank Back page');
    }
    assert(errors.length === 0, errors.join('\n'));
    console.log('Wedding portrait, photos, responsive layouts, category, Save and Back checks passed.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});

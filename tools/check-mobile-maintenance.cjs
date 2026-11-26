const path = require('path');
const {chromium} = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url='file:///'+path.resolve(__dirname,'../index.html').replaceAll('\\','/');
const assert=(value,message)=>{if(!value)throw Error(message);};
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    for(const width of [320,390,430,1440]) {
      const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:2});
      await page.route('https://**',route=>route.abort());
      await page.goto(url);
      await page.evaluate(()=>{initializeIslandFinds();initializeIslandFinds();});
      assert(await page.locator('#islandFinds .island-discovery-card').count()===3,'Duplicated finds');
      for(const image of await page.locator('.mobile-island-scenes img').all()) {
        if(width>760)continue;
        await image.evaluate(x=>x.decode());
        assert((await image.evaluate(x=>x.currentSrc)).includes('mobile-'),'Full-size mobile image');
      }
      let yielded=0;
      for(let top=0;top<14000;top+=500) {
        await page.evaluate(top=>scrollTo({top,behavior:'instant'}),top);
        await page.waitForTimeout(80);
        const result=await page.locator('.weather-dock').evaluate(dock=>{
          const a=dock.getBoundingClientRect();
          const overlap=[...document.querySelectorAll('main a[href],main button')].some(x=>{
            const b=x.getBoundingClientRect();return b.width&&b.height&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
          });
          return {overlap,visible:getComputedStyle(dock).visibility!=='hidden',yielding:dock.classList.contains('is-yielding')};
        });
        assert(!(result.overlap&&result.visible),`${width}: weather covers a control at ${top}`);
        if(result.yielding)yielded++;
      }
      assert(yielded>0,`${width}: collision guard not exercised`);
      let returned=false;
      for(let top=0;top<=2400;top+=100){
        await page.evaluate(top=>scrollTo({top,behavior:'instant'}),top);
        await page.waitForTimeout(100);
        if(await page.locator('.weather-dock').isVisible()){returned=true;break;}
      }
      assert(returned,'Weather did not return in clear space');
      assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'Horizontal overflow');
      await page.close();
      console.log(`${width}px: responsive photos, idempotent highlights and non-obstructing weather passed`);
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

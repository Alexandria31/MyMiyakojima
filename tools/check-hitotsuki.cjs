const path=require('path');
const {chromium}=require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const url=file=>'file:///'+path.join(root,file).replaceAll('\\','/');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();
  await page.route('https://**',route=>route.abort());
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto(url('hitotsuki.html'));
   const photos=page.locator('.hitotsuki-opening img,.hitotsuki-gallery img');
   if(await photos.count()!==8)throw Error('Expected eight restaurant photos');
   for(const photo of await photos.all())await photo.evaluate(image=>{image.loading='eager';return image.decode();});
   if(!(await page.locator('.hitotsuki-lead-photo img').getAttribute('src')).includes('entrance'))throw Error('Entrance is not the hero');
   const sources=await photos.evaluateAll(images=>images.map(image=>image.src));
   if(new Set(sources).size!==8)throw Error('Duplicated restaurant photos');
   await page.waitForTimeout(650);
   await page.screenshot({path:path.join(root,'tools',`hitotsuki-${width}.png`)});
   await page.goto(url('recommended.html'));
   const card=page.locator('.recommend-card').filter({has:page.locator('a[href="hitotsuki.html"]')});
   await card.scrollIntoViewIfNeeded();
   await card.locator('img').evaluate(image=>image.decode());
   const save=card.locator('[data-save-href="hitotsuki.html"]');
   if(await save.getAttribute('aria-pressed')!=='true')await save.click();
   if(!await page.evaluate(()=>JSON.parse(localStorage.getItem('mymiyakojima-saved-places')).includes('hitotsuki.html')))throw Error('Save failed');
   await card.locator('.learn-more').click();
   if(!page.url().endsWith('/hitotsuki.html'))throw Error('Wrong destination');
   await page.goBack();
   if(!await page.locator('h1').isVisible())throw Error('Blank Back page');
   console.log(`${width}px: new restaurant page, name image, Save and business navigation passed`);
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

const path=require('path');
const {chromium}=require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('https://**',route=>route.abort());
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto('file:///'+path.resolve(__dirname,'../hitotsuki.html').replaceAll('\\','/'));
   const buttons=page.locator('main .map-button,.page-nav a');
   for(const button of await buttons.all()){
    const normal=await button.evaluate(x=>({bg:getComputedStyle(x).backgroundColor,color:getComputedStyle(x).color,shadow:getComputedStyle(x).boxShadow}));
    if(normal.bg!=='rgb(169, 189, 177)'||normal.color!=='rgb(36, 77, 73)'||normal.shadow!=='none')throw Error(JSON.stringify(normal));
    await button.focus();
    if(await button.evaluate(x=>getComputedStyle(x).color)!=='rgb(36, 77, 73)')throw Error('Focus text contrast');
   }
   if(width===1440){
    const button=page.locator('.hitotsuki-opening .map-button');
    await button.hover();
    await page.waitForTimeout(250);
    if(await button.evaluate(x=>getComputedStyle(x).backgroundColor)!=='rgb(150, 174, 159)')throw Error('Hover is not muted');
    await button.screenshot({path:path.resolve(__dirname,'hitotsuki-button-muted.png')});
   }
   console.log(`${width}px: all contact and section buttons use muted backgrounds and dark text`);
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

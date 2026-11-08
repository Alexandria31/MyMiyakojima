const fs = require('fs');
const path = require('path');
const {chromium} = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname,'..');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const failures = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => failures.push({script:error.message}));
    await page.route('https://**', route => route.abort());
    const requested = process.argv.slice(2);
    const files = fs.readdirSync(root).filter(file => file.endsWith('.html') && (!requested.length || requested.includes(file)));
    for (const width of [320,360,390,430,1440]) {
      await page.setViewportSize({width,height:900});
      for (const file of files) {
        await page.goto('file:///' + path.join(root,file).replaceAll('\\','/'),{waitUntil:'domcontentloaded'});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(180);
        const state = await page.evaluate(() => {
          const jp = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
          const segmenter = new Intl.Segmenter('ja',{granularity:'grapheme'});
          const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
          const orphans = [];
          while(walker.nextNode()) {
            const node=walker.currentNode, parent=node.parentElement, text=node.textContent.trimEnd();
            if(!parent || parent.closest('script,style,noscript,select,textarea,.jp-keep-tail') || !jp.test(text) || !parent.getClientRects().length) continue;
            const parts=[...segmenter.segment(text)];
            if(parts.length<4) continue;
            let top; const tail=[]; const range=document.createRange();
            for(let i=parts.length-1;i>=Math.max(0,parts.length-8);i--) {
              const part=parts[i];range.setStart(node,part.index);range.setEnd(node,part.index+part.segment.length);
              const r=range.getBoundingClientRect();if(!r.width||!r.height)continue;
              if(top===undefined)top=r.top;if(Math.abs(r.top-top)>3)break;tail.unshift(part.segment);
            }
            const letters=tail.filter(s=>! /^[\s\p{Punctuation}]+$/u.test(s));
            if(letters.length===1 && jp.test(letters[0])) orphans.push(text.slice(-70));
          }
          const clipped=[...document.querySelectorAll('a,button,h1,h2,h3,[lang="ja"]')].filter(el=>el.clientWidth && el.scrollWidth>el.clientWidth+2 && !['auto','scroll'].includes(getComputedStyle(el).overflowX)).map(el=>el.textContent.trim().slice(0,90));
          return {overflow:document.documentElement.scrollWidth>innerWidth+1,orphans,clipped};
        });
        if(state.overflow||state.orphans.length||state.clipped.length)failures.push({file,width,...state});
      }
      console.log(`Checked ${files.length} pages at ${width}px`);
    }
    console.log(JSON.stringify({failures},null,2));
    if(failures.length)process.exitCode=1;
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const path = require('path');
const {chromium} = require('C:/Users/lexym/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname,'..');
const url = file => 'file:///' + path.join(root,file).replaceAll('\\','/');
const endpoint = 'https://formspree.io/f/xdargydl';
const assert = (value,message) => {if(!value)throw Error(message);};
async function fill(page) {
  await page.locator('[name="name"]').fill('Private Test Name');
  await page.locator('[name="business"]').fill('Private Test Business');
  await page.selectOption('[name="category"]',{index:1});
  await page.locator('[name="email"]').fill('private-test@example.com');
  await page.locator('[name="message"]').fill('Private test message, not for analytics');
}
async function spy(page, throws = false) {
  await page.evaluate(throws => {
    window.testEvents=[];
    window.gtag=(...args)=>{testEvents.push(['ga',...args]);if(throws)throw Error('Analytics blocked');};
    window.fbq=(...args)=>{testEvents.push(['meta',...args]);if(throws)throw Error('Pixel blocked');};
  },throws);
}
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    for(const width of [320,390,430,1440]) {
      const page=await browser.newPage({viewport:{width,height:900}});
      let status=200;
      const waitForRequest = async () => {
        await page.waitForFunction(()=>typeof window.resolveTestSubmission==='function');
      };
      await page.route('https://**',route=>route.abort());
      await page.addInitScript(endpoint=>{
        const original=window.fetch.bind(window);
        window.testFetchCount=0;
        window.fetch=(input,options)=>{
          if(String(input)!==endpoint)return original(input,options);
          window.testFetchCount++;
          return new Promise((resolve,reject)=>{
            window.resolveTestSubmission=status=>{
              window.resolveTestSubmission=null;
              resolve(new Response(status===200?'{}':'{"errors":[{"message":"Preview failure"}]}',{status,headers:{'Content-Type':'application/json'}}));
            };
            options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
          });
        };
      },endpoint);
      await page.goto(url('index.html')+'?utm_source=instagram&utm_medium=paid_social&utm_campaign=november_2026');
      await spy(page);
      await page.locator('.home-credibility-inquiry').evaluate(a=>a.addEventListener('click',event=>event.preventDefault(),{once:true}));
      await page.locator('.home-credibility-inquiry').click();
      assert((await page.evaluate(()=>testEvents)).filter(x=>x[2]==='business_inquiry_click'&&x[3].placement==='homepage_top').length===1,'Homepage CTA click not tracked once');
      await page.locator('.home-credibility-inquiry').click();
      await page.waitForURL('**/contact.html#business-inquiry');
      assert(await page.locator('#business-inquiry-title').isVisible(),'Missing inquiry destination');
      await spy(page);
      await page.locator('.business-form-button').click();
      assert(await page.evaluate(()=>testFetchCount)===0,'Invalid form submitted');
      await fill(page);
      await page.evaluate(()=>{const form=document.getElementById('businessInquiryForm');form.requestSubmit();form.requestSubmit();});
      await page.waitForFunction(()=>document.querySelector('.business-form-button').disabled);
      await waitForRequest();
      assert(await page.evaluate(()=>testFetchCount)===1,'Duplicate request');await page.evaluate(status=>resolveTestSubmission(status),status);
      await page.locator('.business-form-status.is-success').waitFor();
      const events=await page.evaluate(()=>testEvents);
      assert(events.filter(x=>x[0]==='ga'&&x[2]==='generate_lead').length===1,'GA lead not counted once');
      assert(events.filter(x=>x[0]==='meta'&&x[2]==='Lead').length===1,'Meta lead not counted once');
      assert(!/Private|private-test|example.com/.test(JSON.stringify(events)),'Personal form data in analytics');
      status=500;await spy(page);await fill(page);await page.locator('.business-form-button').click();
      await waitForRequest();await page.evaluate(status=>resolveTestSubmission(status),status);
      await page.locator('.business-form-status.is-error').waitFor();
      assert((await page.evaluate(()=>testEvents)).length===0,'Failed submission counted as lead');
      assert(await page.locator('[name="message"]').inputValue()==='Private test message, not for analytics','Failure lost text');
      status=200;await spy(page,true);await page.locator('.business-form-button').click();
      await waitForRequest();await page.evaluate(status=>resolveTestSubmission(status),status);
      await page.locator('.business-form-status.is-success').waitFor();
      assert(!await page.locator('.business-form-status.is-error').count(),'Analytics blocked successful delivery');
      assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'Contact overflow');
      await page.goBack();
      assert(await page.locator('h1').isVisible(),'Blank Back page');
      await spy(page);
      await page.locator('.home-credibility-inquiry').click();
      await page.waitForURL('**/contact.html#business-inquiry');
      assert(await page.evaluate(()=>testFetchCount)===0,'Navigation submitted the form');
      assert(await page.evaluate(()=>!dataLayer.some(event=>event[1]==='generate_lead') && !fbq.queue.some(event=>event[1]==='Lead')),'Navigation counted as lead');
      await page.close();
      console.log(`${width}px: inquiry navigation, validation, duplicate guard, success, failure, privacy and blocked analytics passed`);
    }
  } finally {await browser.close();}
  console.log('All submissions mocked. No real enquiries or analytics events sent. Instagram-style responsive testing is not a test inside the actual Instagram app.');
})().catch(error=>{console.error(error);process.exitCode=1;});

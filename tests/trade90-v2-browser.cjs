const assert = require("node:assert/strict");
const {chromium} = require("playwright");

(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
   const page=await browser.newPage({viewport:{width:1366,height:850}});
   await page.goto("http://127.0.0.1:4321/",{waitUntil:"networkidle"});
   await page.getByRole("heading",{name:"Central Bank Rate Divergence",exact:true}).waitFor();
   const brand = page.locator(".topbar .brand");
   assert.equal((await brand.innerText()).replace(/\s+/g, ""), "TRADE90", "original wordmark preserved");
   assert.equal(await page.locator(".topbar .brand span").evaluate(el=>getComputedStyle(el).color), "rgb(16, 185, 129)", "original TRADE90 emerald 90");
   assert.equal(await page.locator("body").evaluate(el=>getComputedStyle(el).backgroundColor), "rgb(15, 23, 42)", "original slate-dark background");
   assert.equal(await page.locator(".board").evaluate(el=>getComputedStyle(el).backgroundColor), "rgb(17, 28, 48)", "dark dashboard surface");
   assert.equal(await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute("href"), "/favicon.svg", "original TRADE90 favicon retained");
   const rows=page.locator(".board tbody tr");
   assert.equal(await rows.count(),28,"home current rates show all 28 pair rows");
   assert.match(await rows.first().innerText(),/AUD\/CHF/);
   assert.match(await rows.first().innerText(),/460/);
   await page.getByRole("button",{name:"Expected rate gaps"}).click();
   assert.equal(await page.locator(".board tbody tr").count(),28,"expected shows 28 entries");
   await page.getByText("Published rate-pricing observations").waitFor();
   assert.equal(await page.locator(".outlook-card").count(),8,"expected view shows sourced reports for all eight banks");
   assert.ok((await page.getByText(/72% probability of holding rates/).count())>=1,"reported Fed odds shown");
   await page.getByRole("button",{name:"Market pricing",exact:true}).click();
   assert.equal(await page.locator(".outlook-card").count(),3,"filter is restricted to reported market pricing");
   await page.getByRole("button",{name:"What changed"}).click();
   assert.ok((await page.getByText("Latest verified central-bank decisions").count())>=1);
   assert.equal(await page.locator(".outlook-card").count(),2,"dated CPI/RBA repricing cards visible");
   await page.getByRole("button",{name:"Currency pair details"}).click();
   await page.locator(".detailselect select").selectOption("EURUSD");
   assert.match(await page.locator(".interpretation").innerText(),/-137.5/);
   await page.goto("http://127.0.0.1:4321/methodology/",{waitUntil:"domcontentloaded"});
   await page.getByRole("heading",{name:"Rate Gap Methodology"}).waitFor();
   await page.goto("http://127.0.0.1:4321/learn/",{waitUntil:"domcontentloaded"});
   await page.getByRole("heading",{name:"Understand Central Bank Rate Gaps"}).waitFor();
   const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
   await mobile.goto("http://127.0.0.1:4321/",{waitUntil:"networkidle"});
   await mobile.getByRole("heading",{name:"Central Bank Rate Divergence",exact:true}).waitFor();
   assert.equal(await mobile.locator(".board tbody tr").count(),28);
   const widths=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
   assert.ok(widths.scroll<=widths.viewport+4,"no document-level horizontal overflow: "+JSON.stringify(widths));
   await mobile.screenshot({path:"/tmp/trade90-v2-mobile.png",fullPage:true});
   console.log("V2 browser checks passed: original TRADE90 branding, dark theme, desktop 28 pair ranking, all four views, rate details, methodology, learn and mobile width.");
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

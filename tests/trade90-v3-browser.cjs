const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const {readFileSync}=require("node:fs");
const snapshot=JSON.parse(readFileSync("src/data/trade90-policy-snapshot.json","utf8"));
const outlook=JSON.parse(readFileSync("public/data/policy-outlook.json","utf8"));
const bank=c=>snapshot.banks.find(x=>x.code===c);
const base="http://127.0.0.1:4321";
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:850}});
  await page.goto(base+"/",{waitUntil:"networkidle"});
  await page.getByRole("heading",{name:/Which forex interest-rate gaps could/i}).waitFor();
  assert.equal((await page.locator(".topbar .brand").innerText()).replace(/\s/g,""),"TRADE90");
  assert.equal(await page.locator("#trade90-pair-search").count(),1);
  assert.equal(await page.locator(".outlook-summary strong").count(),4,"Four coverage counters must be visible");
  assert.ok(await page.locator(".outlook-grid a").count()>0,"Show available research pairs");
  assert.equal(await page.locator(".board tbody tr").count(),0,"Do not embed full rate terminal on homepage");
  assert.equal(await page.locator('.desktop-links a[href="/tools/position-size-calculator/"]').count(),1);
  for(const theme of ["light","dark"]){
   await page.locator("#trade90-theme").selectOption(theme);
   assert.equal(await page.locator("html").getAttribute("data-theme"),theme);
  }
  await page.locator("#trade90-pair-search").fill("eurusd");
  const eurLink=page.locator('#trade90-pair-results a[href="/pairs/eur-usd/"]').first();
  await eurLink.waitFor();
  await eurLink.click();
  await page.waitForURL("**/pairs/eur-usd/");
  await page.getByRole("heading",{name:/EUR\/USD Interest Rate Differential/i}).waitFor();
  const hero=page.locator(".outlook-hero");
  assert.equal(await hero.count(),1);
  assert.match(await hero.locator("[data-outlook-label]").innerText(),/WIDENING|NARROWING|UNCERTAIN|UNCHANGED BIAS|UNAVAILABLE/);
  assert.equal(await page.locator(".comparison .bank-card").count(),2);
  const positions=await page.evaluate(()=>({hero:document.querySelector(".outlook-hero").getBoundingClientRect().top+scrollY,rates:document.querySelector(".comparison").getBoundingClientRect().top+scrollY}));
  assert.ok(positions.hero<positions.rates,"Policy conclusion should precede rate details");
  const displayedGap=Number((await page.locator(".gap-value").innerText()).replace(/[^0-9+.-]/g,""));
  assert.ok(Math.abs(displayedGap-(bank("EUR").rate-bank("USD").rate)*100)<0.05,"Rate gap must equal verified benchmark difference");
  assert.equal(await page.locator(".bank-card a[href^='https://']").count(),2,"Both bank cards need official sources");
  assert.equal(await page.locator('#policy-evidence').count(),1,"Evidence deep link must resolve");
  assert.equal(await page.locator('.outlook-hero a[href="#policy-evidence"]').count(),1);
  await page.locator("#policy-evidence > summary").click();
  assert.equal(await page.locator("#policy-evidence .bank").count(),2,"Evidence details should include both banks");
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"),"https://tradeninety.com/pairs/eur-usd/");
  assert.ok((await page.locator('script[type="application/ld+json"]').count())>=2);
  for(const route of ["/pairs/usd-jpy/","/pairs/aud-chf/","/pairs/nzd-cad/","/pairs/chf-jpy/"]){
   await page.goto(base+route,{waitUntil:"networkidle"});
   const symbol=route.split("/")[2].replace("-","").toUpperCase();
   assert.equal(await page.locator(".outlook-hero").count(),1,route);
   assert.equal(await page.locator(".comparison .bank-card").count(),2,route);
   assert.equal(await page.locator("#policy-evidence").count(),1,route);
   assert.ok(outlook.pairs[symbol],"Missing model output "+symbol);
  }
  await page.goto(base+"/rate-gaps/",{waitUntil:"networkidle"});
  assert.equal(await page.locator(".full-table tbody tr").count(),28);
  await page.goto(base+"/pairs/",{waitUntil:"networkidle"});
  assert.equal(await page.locator("section .grid a").count(),28);
  await page.goto(base+"/central-banks/",{waitUntil:"networkidle"});
  assert.equal(await page.locator(".banktiles a").count(),8);
  await page.goto(base+"/decisions/",{waitUntil:"networkidle"});
  assert.ok(await page.getByRole("heading",{name:/Next Major Interest Rate Decisions/}).isVisible());
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  for(const route of ["/","/rate-gaps/","/pairs/eur-usd/","/central-banks/","/decisions/"]){
   await mobile.goto(base+route,{waitUntil:"networkidle"});
   const size=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
   assert.ok(size.scroll<=size.viewport+4,"Mobile overflow: "+route+" "+JSON.stringify(size));
  }
  await mobile.goto(base+"/",{waitUntil:"networkidle"});
  await mobile.locator(".mobile-menu summary").click();
  assert.ok(await mobile.locator('.mobile-menu nav a[href="/pairs/"]').isVisible());
  console.log("Current V3 browser passed: actual homepage, policy evidence, benchmark math, 28 pairs, eight bank hubs, mobile and theme.");
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});

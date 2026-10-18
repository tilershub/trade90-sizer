const assert = require("node:assert/strict");
const {chromium}=require("playwright");
const origin="http://127.0.0.1:4321";
const cash=s=>Number(s.replace(/[^0-9.-]/g,""));
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  await page.goto(origin+"/",{waitUntil:"networkidle"});
  await page.locator('.desktop-links a[href="/tools/position-size-calculator/"]').waitFor();
  await page.locator('.desktop-links a[href="/tools/position-size-calculator/"]').click();
  await page.waitForURL("**/tools/position-size-calculator/");
  await page.getByRole("heading",{name:"Know Your Risk Before You Trade"}).waitFor();
  await page.locator(".risk-calculator .lots").waitFor();
  assert.equal(await page.locator("main h1").count(),1);
  assert.match(await page.locator(".risk-calculator .lots").innerText(),/0.28/);
  await page.locator("#size-stop").fill("50");
  assert.match(await page.locator(".risk-calculator .lots").innerText(),/0.20/);
  assert.equal(cash(await page.locator(".numbers>div").nth(0).locator("strong").innerText()),100);
  assert.equal(cash(await page.locator(".numbers>div").nth(1).locator("strong").innerText()),100);
  await page.locator("#size-symbol").selectOption("USDJPY");
  await page.locator("#size-stop").fill("50");
  await page.locator("#size-entry").fill("150");
  assert.match(await page.locator(".risk-calculator .lots").innerText(),/0.30/);
  await page.locator("#size-symbol").selectOption("EURGBP");
  await page.locator("#size-quote-usd").fill("1.3");
  await page.locator("#size-stop").fill("40");
  assert.match(await page.locator(".risk-calculator .lots").innerText(),/0.19/);
  await page.locator("#size-symbol").selectOption("XAUUSD");
  assert.equal(await page.locator("#size-stop").inputValue(),"10");
  await page.locator("#size-stop").fill("5");
  assert.match(await page.locator(".risk-calculator .lots").innerText(),/0.20/);
  await page.locator("#size-stop").fill("0");
  await page.getByRole("alert").waitFor();
  assert.match(await page.getByRole("alert").innerText(),/Stop distance/);
  await page.locator(".risk-calculator .reset").click();
  assert.equal(await page.locator("#size-symbol").inputValue(),"EURUSD");
  assert.equal(await page.locator("#size-stop").inputValue(),"35");
  await page.locator("#trade90-theme").selectOption("light");
  assert.equal(await page.locator(".risk-calculator").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(255, 255, 255)");
  assert.equal(await page.locator(".risk-calculator .calc-form").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(248, 250, 252)");
  assert.equal(await page.locator(".risk-calculator .numbers strong").first().evaluate(el=>getComputedStyle(el).color),"rgb(16, 32, 51)");
  await page.locator("#trade90-theme").selectOption("dark");
  assert.equal(await page.locator(".risk-calculator").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(17, 28, 48)");
  await page.goto(origin+"/tools/",{waitUntil:"networkidle"});
  await page.getByRole("heading",{name:"Know Your Risk Before You Trade"}).waitFor();
  await page.locator('a[href="/tools/position-size-calculator/"]').last().click();
  await page.waitForURL("**/tools/position-size-calculator/");
  for(const viewport of [{width:390,height:844},{width:320,height:760}]){
   const mobile=await browser.newPage({viewport,isMobile:true,hasTouch:true});
   for(const route of ["/tools/","/tools/position-size-calculator/"]){
    await mobile.goto(origin+route,{waitUntil:"networkidle"});
    let width=await mobile.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(width.document<=width.viewport+4,"Horizontal overflow "+JSON.stringify({route,...width}));
    await mobile.locator("#trade90-theme").selectOption("light");
    width=await mobile.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(width.document<=width.viewport+4,"Light mobile horizontal overflow "+JSON.stringify({route,...width}));
   }
   await mobile.goto(origin+"/",{waitUntil:"networkidle"});
   await mobile.locator(".mobile-menu summary").click();
   assert.ok(await mobile.locator('.mobile-menu nav a[href="/tools/position-size-calculator/"]').isVisible());
   await mobile.close();
  }
  console.log("Trading Tools browser passed: menu entry, all instrument modes, no-risk rounding, validation, light/dark & mobile.");
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exit(1)});

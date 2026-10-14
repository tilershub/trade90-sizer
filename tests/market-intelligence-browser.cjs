// Browser regression for a loader that was hidden via the hidden property but
// still displayed because a component CSS rule overrode the browser stylesheet.
const assert = require("node:assert/strict");
const {chromium} = require("playwright");

const BASE = process.env.TRADE90_TEST_URL || "http://127.0.0.1:4321";
const observed = "2026-10-14T09:00:00+00:00";
const gold = {
  symbol:"XAU/USD",name:"Gold",asset_class:"Commodity",price:4201.5,
  price_basis:"COMEX futures",decimals:2,quality_grade:"A",
  price_observed_at:observed,regime:"High volatility",volatility_annualized:17,
  events:{level:"Unknown",coverage:"Unknown — provider unavailable"},
  support20:4180,resistance20:4220,atr20:21.5,price_note:"Not a broker execution price.",
  chart:[{date:"2026-10-13",close:4190},{date:"2026-10-14",close:4201.5}],
  warnings:["Event calendar unavailable."],snapshot_old:false,
  score_bias_conflict:false,validation:{lift_pp:-3,accuracy_pct:50,baseline_pct:53,observations:110,message:"No validation edge."},
  frequency_margin:1,drivers:[{name:"US real yield",contribution:-12}],
  model_thesis:"Historical research only.",model_score:-8,
  published_bias:"Neutral",scenario_frequencies:{bullish:41,bearish:40},
  positioning:{available:false},news:[],cross_asset_driver:"US dollar index"
};
const euro = {...gold,symbol:"EUR/USD",name:"Euro / US Dollar",price:1.1211,
  price_basis:"FX aggregated reference",decimals:5,support20:1.11,resistance20:1.13,
  chart:[{date:"2026-10-13",close:1.1200},{date:"2026-10-14",close:1.1211}]};
const good = {status:"ok",generated_at:observed,snapshot_age_hours:1,markets:[gold,euro]};

(async function main(){
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.route("**/api/market-intelligence",route=>route.fulfill({
    status:200,contentType:"application/json",body:JSON.stringify(good)
  }));
  await page.route("**/api/market-intraday?*",route=>route.fulfill({
    status:503,contentType:"application/json",
    body:JSON.stringify({status:"not_configured",detail:"Provider not licensed"})
  }));
  await page.route("**/widgets.tradingview-widget.com/**",route=>route.abort());
  await page.goto(BASE+"/market-intelligence/",{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>document.getElementById("mi-loading")===null,undefined,{timeout:10000});
  assert.equal(await page.locator("#mi-symbol").textContent(),"Gold · XAU/USD");
  assert.equal(await page.locator("#mi-content").isVisible(),true,"Briefing must visibly render");
  assert.equal(await page.getByText("Loading the latest published research briefing…").count(),0,"Loading panel must be removed");
  await page.waitForFunction(()=>document.getElementById("mi-intraday-state")?.textContent.includes("licensed provider access required"),undefined,{timeout:10000});
  assert.equal(await page.locator("#mi-intraday-state").textContent(),"Live intraday analysis not connected: licensed provider access required.");
  await page.locator("#mi-selector").selectOption("EUR/USD");
  await page.waitForFunction(()=>document.getElementById("mi-symbol").textContent.includes("EUR/USD"));
  assert.equal(await page.locator("#mi-symbol").textContent(),"Euro / US Dollar · EUR/USD");
  assert.deepEqual(errors,[],"Page scripts must not throw on successful data");

  // API outage case should show an informative failure, never a permanent spinner.
  await page.unroute("**/api/market-intelligence");
  await page.route("**/api/market-intelligence",route=>route.fulfill({
    status:503,contentType:"application/json",
    body:JSON.stringify({status:"unavailable",detail:"Research source unavailable"})
  }));
  await page.reload({waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>document.getElementById("mi-loading")?.classList.contains("error"),undefined,{timeout:10000});
  assert.match(await page.locator("#mi-loading").textContent(),/Research source unavailable/);
  assert.equal(await page.locator("#mi-loading").isVisible(),true);
  assert.equal(await page.locator("#mi-content").isVisible(),false);
  await browser.close();
  console.log("PASS: briefing replaces loading panel, mobile market switch works, API outage shows failure.");
})().catch(error=>{console.error(error);process.exitCode=1});

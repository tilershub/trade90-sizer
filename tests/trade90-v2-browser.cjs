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
   assert.equal(await page.locator(".section-shortcuts a").count(),3,"Fast navigation to the three major sections");
   assert.deepEqual(await page.locator(".section-shortcuts a").evaluateAll(nodes=>nodes.map(n=>n.hash)),["#policy-divergences","#policy-outlook","#next-decisions"]);
   assert.equal(await page.locator(".divergence-grid .divergence-card").count(),6,"Home displays six objectively largest policy gaps");
   await page.getByRole("heading",{name:"Most Important Divergences for Forex Traders Right Now"}).waitFor();
   await page.getByRole("heading",{name:"Central Bank Policy Outlook & Forward Guidance"}).waitFor();
   assert.equal(await page.locator(".guidance-grid .mini-guidance").count(),8,"Home guidance covers all eight banks");
   await page.getByRole("heading",{name:"Next Major Decisions to Watch"}).waitFor();
   assert.equal(await page.locator(".decision-grid .decision-card").count(),6,"Home decision watch displays next six banks");
   assert.equal(await page.locator(".mini-guidance a[href^='https://']").count(),8,"All guidance cards link official sources");
   await page.getByRole("button",{name:"Expected rate gaps"}).click();
   await page.locator('table[aria-label="Expected interest-rate gaps across 28 pairs"] tbody tr').first().waitFor();
   assert.equal(await page.locator('table[aria-label="Expected interest-rate gaps across 28 pairs"] tbody tr').count(),28,"forward engine preserves all 28 pair rows");
   await page.getByText("Numeric feed not connected").waitFor();
   assert.equal(await page.locator('table[aria-label="Expected interest-rate gaps across 28 pairs"] tbody tr .value').filter({hasText:"—"}).count(),28,"never invent future rate gaps");
   await page.getByText("Published rate-pricing observations").waitFor();
   assert.equal(await page.locator(".outlook-card").count(),8,"expected view shows sourced reports for all eight banks");
   assert.ok((await page.getByText(/72% probability of holding rates/).count())>=1,"reported Fed odds shown");
   await page.getByRole("button",{name:"Market pricing",exact:true}).click();
   assert.equal(await page.locator(".outlook-card").count(),3,"filter is restricted to reported market pricing");
   await page.getByRole("button",{name:"What changed"}).click();
   assert.ok((await page.getByText("Latest verified central-bank decisions").count())>=1);
   assert.equal(await page.locator(".outlook-card").count(),2,"dated CPI/RBA repricing cards visible");
   await page.getByText(/No verified current dataset or historical snapshots/).waitFor();
   await page.getByRole("button",{name:"Currency pair details"}).click();
   await page.locator(".detailselect select").selectOption("EURUSD");
   assert.match(await page.locator(".interpretation").innerText(),/-137.5/);
   const pairUpdates = page.locator(".pair-policy-updates .update-card");
   await page.getByRole("heading",{name:"Next Major Decisions to Watch",exact:true}).waitFor();
   const watchCards = page.locator(".decision-watch .watch-card");
   assert.equal(await watchCards.count(),2,"EUR/USD should show only two next bank decisions");
   assert.deepEqual(await watchCards.locator(".watch-card-top strong").allTextContents(),["USD · Fed","EUR · ECB"]);
   assert.deepEqual(await watchCards.locator(".event-date time").evaluateAll(nodes=>nodes.map(n=>n.dateTime)),["2026-10-28","2026-10-29"]);
   assert.equal(await watchCards.locator('a[href^="https://"]').count(),2,"Both watch cards must link to official calendars");
   assert.equal(await page.locator(".guidance .item").count(),2,"Pair outlook displays exactly two bank statements");
   assert.deepEqual(await page.locator(".guidance .line strong").allTextContents(),["EUR · ECB","USD · Fed"]);
   assert.equal(await page.locator(".guidance .item a[href^='https://']").count(),2);
   assert.equal(await page.locator(".overview").count(),0,"Home global divergence and guidance sections must not leak into pair details");
   await page.getByRole("heading",{name:"Central Bank Policy Updates · EUR/USD"}).waitFor();
   assert.equal(await pairUpdates.count(),4,"EUR/USD must display only ECB and Fed policy publications");
   assert.deepEqual(new Set(await pairUpdates.locator(".currency").allTextContents()).size,2);
   for (const label of await pairUpdates.locator(".currency").allTextContents()){
     assert.ok(/^(EUR · ECB|USD · Fed)$/.test(label.trim()),"Only ECB/Fed updates allowed: "+label);
   }
   assert.equal(await page.locator(".pair-policy-updates .policy-controls").count(),0,"Pair view must not offer global eight-bank filtering");
   assert.equal(await page.locator(".pair-policy-updates .related").count(),0,"Pair view must not show unrelated seven-pair lists");
   assert.equal(await page.locator(".centralbank .bankcard").count(),2,"Only selected banks should appear in pair details");
   await page.locator(".detailselect select").selectOption("AUDCHF");
   assert.deepEqual(await watchCards.locator(".watch-card-top strong").allTextContents(),["AUD · RBA","CHF · SNB"]);
   assert.deepEqual(await watchCards.locator(".event-date time").evaluateAll(nodes=>nodes.map(n=>n.dateTime)),["2026-11-03","2026-12-10"]);
   assert.deepEqual(await page.locator(".guidance .line strong").allTextContents(),["AUD · RBA","CHF · SNB"]);
   await page.getByRole("heading",{name:"Central Bank Policy Updates · AUD/CHF"}).waitFor();
   assert.equal(await pairUpdates.count(),2,"AUD/CHF must display only RBA and SNB publications");
   for (const label of await pairUpdates.locator(".currency").allTextContents()){
     assert.ok(/^(AUD · RBA|CHF · SNB)$/.test(label.trim()),"Only RBA/SNB updates allowed: "+label);
   }
   assert.equal(await page.locator(".centralbank .bankcard").count(),2);
   await page.locator(".detailselect select").selectOption("USDJPY");
   assert.deepEqual(await watchCards.locator(".watch-card-top strong").allTextContents(),["USD · Fed","JPY · BoJ"]);
   assert.deepEqual(await watchCards.locator(".event-date time").evaluateAll(nodes=>nodes.map(n=>n.dateTime)),["2026-10-28","2026-10-30"]);
   assert.deepEqual(await page.locator(".guidance .line strong").allTextContents(),["USD · Fed","JPY · BoJ"]);
   await page.getByRole("heading",{name:"Central Bank Policy Updates · USD/JPY"}).waitFor();
   assert.equal(await pairUpdates.count(),3,"USD/JPY must display only Fed and BoJ publications");
   for (const label of await pairUpdates.locator(".currency").allTextContents()){
     assert.ok(/^(USD · Fed|JPY · BoJ)$/.test(label.trim()),"Only Fed/BoJ updates allowed: "+label);
   }
   assert.equal(await page.locator(".centralbank .bankcard").count(),2);

   assert.equal(await page.locator(".policy-section.compact .update-card").count(),4,"homepage shows four latest policy publications");
   assert.ok((await page.locator('.topbar nav a[href="/central-banks/"]').count())===1,"policy updates linked in header");
   await page.goto("http://127.0.0.1:4321/central-banks/",{waitUntil:"networkidle"});
   await page.getByRole("heading",{name:"Central Bank Policy Updates",level:1,exact:true}).waitFor();
   assert.equal(await page.locator(".policy-section .update-card").count(),12,"12 verified official bank publications");
   await page.locator('select[aria-label="Filter policy updates by currency"]').selectOption("USD");
   assert.equal(await page.locator(".policy-section .update-card").count(),2,"Fed decision and meeting minutes filter correctly");
   await page.locator(".policy-section .related button").first().click();
   assert.equal(await page.locator(".policy-section .related .pairs span").count(),7,"all seven related FX pairs shown");
   await page.locator('select[aria-label="Filter policy updates by currency"]').selectOption("ALL");
   await page.locator('select[aria-label="Filter by publication type"]').selectOption("Rate decision");
   assert.equal(await page.locator(".policy-section .update-card").count(),8,"eight central bank rate decisions displayed");
   for (const href of await page.locator(".policy-section .source-link").evaluateAll(nodes=>nodes.map(node=>node.href))) {
     assert.ok(href.startsWith("https://"),"policy item links to primary secure official source");
   }
   await page.goto("http://127.0.0.1:4321/methodology/",{waitUntil:"domcontentloaded"});
   await page.getByRole("heading",{name:"Rate Gap Methodology"}).waitFor();
   await page.goto("http://127.0.0.1:4321/learn/",{waitUntil:"domcontentloaded"});
   await page.getByRole("heading",{name:"Understand Central Bank Rate Gaps"}).waitFor();
   const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
   await mobile.goto("http://127.0.0.1:4321/",{waitUntil:"networkidle"});
   await mobile.getByRole("heading",{name:"Central Bank Rate Divergence",exact:true}).waitFor();
   assert.equal(await mobile.locator(".board tbody tr").count(),28);
   assert.equal(await mobile.locator(".divergence-grid .divergence-card").count(),6);
   assert.equal(await mobile.locator(".guidance-grid .mini-guidance").count(),8);
   await mobile.getByRole("button",{name:"Currency pair details"}).click();
   await mobile.locator(".detailselect select").selectOption("EURUSD");
   assert.equal(await mobile.locator(".pair-policy-updates .update-card").count(),4,"Pair-specific bank updates should work on mobile");
   assert.equal(await mobile.locator(".decision-watch .watch-card").count(),2,"Mobile must show two relevant next policy meetings");
   await mobile.locator(".detailselect select").selectOption("AUDCHF");
   assert.equal(await mobile.locator(".pair-policy-updates .update-card").count(),2,"Mobile bank filter must react to pair change");
   const widths=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
   assert.ok(widths.scroll<=widths.viewport+4,"no document-level horizontal overflow: "+JSON.stringify(widths));
   await mobile.goto("http://127.0.0.1:4321/central-banks/",{waitUntil:"networkidle"});
   await mobile.getByRole("heading",{name:"Central Bank Policy Updates",level:1,exact:true}).waitFor();
   assert.equal(await mobile.locator(".policy-section .update-card").count(),12);
   const policyWidths=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
   assert.ok(policyWidths.scroll<=policyWidths.viewport+4,"policy updates mobile page must not overflow");
   await mobile.screenshot({path:"/tmp/trade90-v2-mobile.png",fullPage:true});
   console.log("V2 browser checks passed: original TRADE90 branding, dark theme, desktop 28 pair ranking, all four views, central bank policy updates, rate details, methodology, learn and mobile width.");
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const origin="http://127.0.0.1:4321";
const lowContrast=[];
function luminance([r,g,b]){
 const values=[r,g,b].map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return values[0]*.2126+values[1]*.7152+values[2]*.0722;
}
function rgb(s){
 const m=s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
 return m?[+m[1],+m[2],+m[3]]:null;
}
function contrast(a,b){
 const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);
 return (hi+.05)/(lo+.05);
}
async function inspect(page,selector,route){
 const e=page.locator(selector).first();
 await e.waitFor({state:"visible"});
 const data=await e.evaluate(el=>{
  const style=getComputedStyle(el);
  let p=el,bg=null;
  while(p){
   const c=getComputedStyle(p).backgroundColor;
   if(c.startsWith("rgb(") || (c.startsWith("rgba(")&&!c.endsWith(", 0)"))){bg=c;break;}
   p=p.parentElement;
  }
  return {text:style.color,bg:bg||getComputedStyle(document.body).backgroundColor,value:el.textContent?.trim().slice(0,70)};
 });
 const fg=rgb(data.text),bg=rgb(data.bg);
 assert.ok(fg&&bg,"Could not determine text/background colors for "+selector+" on "+route+": "+JSON.stringify(data));
 const ratio=contrast(fg,bg);
 if(ratio<4.5)lowContrast.push("Unreadable text: "+route+" "+selector+" "+ratio.toFixed(2)+":1 "+JSON.stringify(data));
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const viewport of [{width:1366,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
   for(const [route,selectors] of Object.entries({
    "/":[
      ".home .hero h1",".home .hero p",".home .metric span:first-child",
      ".home .metric strong",".home .metric span:last-child",".home .pair-card strong",
      ".home .pair-card .pair-top",".home .pair-bottom span:first-child",
      ".home .decision span",".home .decision strong",".home .decision small",
      ".home .section-head p",".home .policy-section .update-card h3",
      ".home .policy-section .update-card>p",".home .policy-section .source-link",
      ".home .guides strong",".home .guides span",".home .data-status",
      ".home .data-status>strong",".home .data-status>span:not(.statusdot)",".home .data-status a"
    ],
    "/pairs/eur-usd/":[
      ".pair-head h1",".pair-page .bank-card h2",".pair-page .bank-card p",
      ".pair-page .bank-card .value",".pair-page .gap-card p",
      ".pair-page .data-footnote",".pair-page .section-heading p",
      "#decisions .watch-head p","#decisions .watch-card h3",
      "#decisions .watch-for p","#guidance .item>p","#guidance .watch p",
      "#updates .update-card>p","#updates .update-card h3",
      "#updates .source-link","#explanation p"
    ],
    "/rate-gaps/":[".full-table th",".full-table td",".full-table .showing",".full-table .tools label"],
    "/central-banks/fed/":[".hub .details p",".hub .part h2",".hub .news p",".hub .pairs span"],
    "/data-policy/":[
      ".reading-policy .page-intro p",".reading-policy .status-overview span",
      ".reading-policy .status-overview strong",".reading-policy .critical",
      ".reading-policy h2",".reading-policy .class p",
      ".reading-policy table th",".reading-policy table td",
      ".reading-policy .backlinks a"
    ]
   })){
    await page.goto(origin+route,{waitUntil:"networkidle"});
    await page.locator("#trade90-theme").selectOption("light");
    assert.equal(await page.locator("html").getAttribute("data-theme"),"light");
    for(const selector of selectors)await inspect(page,selector,route);
    if(route==="/" && viewport.width<500){
      const cardLayout=await page.locator(".home .pair-grid").evaluate(el=>getComputedStyle(el).gridTemplateColumns);
      const columns=cardLayout.trim().split(/\s+/);
      assert.equal(columns.length,1,"Pair cards on iPhone must use one readable column: "+cardLayout);
      const decisionLayout=await page.locator(".home .decision-grid").evaluate(el=>getComputedStyle(el).gridTemplateColumns);
      assert.equal(decisionLayout.trim().split(/\s+/).length,1,"Decision cards must use one readable column: "+decisionLayout);
    }
    const horizontal=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    assert.ok(horizontal.scroll<=horizontal.width+4,"Horizontal overflow in light mode "+route+" "+JSON.stringify(horizontal));
   }
   // Check the opposite theme still preserves its legibility.
   await page.goto(origin+"/",{waitUntil:"networkidle"});
   await page.locator("#trade90-theme").selectOption("dark");
   for(const selector of [".home .hero h1",".home .hero p",".home .metric span:first-child",".home .metric strong",".home .pair-card strong",".home .policy-section .update-card>p"])await inspect(page,selector,"dark /");
   await page.close();
  }
  const doc=await browser.newPage();
  await doc.goto(origin+"/data-policy/",{waitUntil:"domcontentloaded"});
  assert.equal(await doc.locator("h1").innerText(),"TRADE90 Data Sources & Update Policy");
  const body=await doc.locator("main").innerText();
  for(const statement of ["not continuously refreshing","No automated hourly, daily or per-minute ingestion","not a promise","Numeric data provider not connected","Copyright, permissions and lawful data use","Quick answers for forex traders","Official source and market-data terms","Verified snapshot"]){
   assert.ok(body.includes(statement),"Data transparency statement missing: "+statement);
  }
  for(const route of ["/","/pairs/eur-usd/","/methodology/","/disclaimer/","/editorial-policy/"]){
   await doc.goto(origin+route);
   assert.ok(await doc.locator('a[href="/data-policy/"]').count()>0,"Missing transparency link on "+route);
  }
  assert.equal(await doc.locator("body a[href='https://www.cmegroup.com/market-data/license-data.html']").count(),1,"Primary CME redistribution licensing reference required");
  assert.equal(lowContrast.length,0,"Low-contrast content ("+lowContrast.length+" samples):\n"+lowContrast.slice(0,65).join("\n"));
  console.log("Readability verified: high-contrast Light & Dark across trader pages on mobile and desktop; accurate data-policy disclosures and internal links.");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

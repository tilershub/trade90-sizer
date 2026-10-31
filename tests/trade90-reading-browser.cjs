const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const origin="http://127.0.0.1:4321";
function rgb(s){const m=s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);return m?[+m[1],+m[2],+m[3]]:null;}
function luminance(color){const [r,g,b]=color.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return r*.2126+g*.7152+b*.0722;}
function contrast(a,b){const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05);}
async function inspect(page,selector,route){
 const el=page.locator(selector).first();
 await el.waitFor({state:"visible",timeout:12000});
 const data=await el.evaluate(node=>{
  const color=getComputedStyle(node).color;
  let background=null;
  for(let parent=node;parent;parent=parent.parentElement){
   const candidate=getComputedStyle(parent).backgroundColor;
   if(candidate.startsWith("rgb(")||(/rgba\(/.test(candidate)&&!/,\s*0\)$/.test(candidate))){
    background=candidate;break;
   }
  }
  return {text:color,bg:background||getComputedStyle(document.body).backgroundColor};
 });
 const fg=rgb(data.text),bg=rgb(data.bg);
 assert.ok(fg&&bg,"Cannot inspect contrast of "+selector+" "+route);
 const ratio=contrast(fg,bg);
 assert.ok(ratio>=4.5,"Low contrast "+route+" "+selector+": "+ratio.toFixed(2)+":1 "+JSON.stringify(data));
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  const routes={
   "/":[".home .hero p",".home .data-status > a",".home .section-head p",".home .outlook-grid .outlook-card strong",".home .guides a strong"],
   "/pairs/eur-usd/":[".pair-head p",".outlook-hero .reasoning p",".outlook-hero .bank-biases strong",".pair-page .bank-card p",".pair-page .data-footnote"],
   "/rate-gaps/":[".page-intro p",".full-table th",".full-table td"],
   "/central-banks/":[".page-intro p",".bankdirectory .banktiles strong"],
   "/data-policy/":[".page-intro p"]
  };
  for(const viewport of [{width:1366,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
   for(const theme of ["light","dark"]){
    for(const [route,selectors] of Object.entries(routes)){
     await page.goto(origin+route,{waitUntil:"networkidle"});
     await page.locator("#trade90-theme").selectOption(theme);
     assert.equal(await page.locator("html").getAttribute("data-theme"),theme);
     for(const selector of selectors)await inspect(page,selector,theme+" "+route);
     const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
     assert.ok(widths.scroll<=widths.width+4,"Overflow "+theme+" "+route+": "+JSON.stringify(widths));
    }
   }
   await page.close();
  }
  const doc=await browser.newPage();
  await doc.goto(origin+"/data-policy/",{waitUntil:"domcontentloaded"});
  assert.ok((await doc.locator("h1").innerText()).includes("Data Sources"));
  assert.equal(await doc.locator('a[href="https://www.cmegroup.com/market-data/license-data.html"]').count(),1,"Data licensing attribution must stay available");
  for(const route of ["/","/pairs/eur-usd/","/methodology/","/disclaimer/"]){
   await doc.goto(origin+route);
   assert.ok(await doc.locator('a[href="/data-policy/"]').count()>0,"Missing transparency link on "+route);
  }
  console.log("Reading check passed: primary text, model explanation and rate data in both themes, desktop/mobile, legal source transparency.");
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exit(1)});

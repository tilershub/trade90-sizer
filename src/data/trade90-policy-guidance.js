// Curated and source-checked statements as of 2026-10-16.
// These are ANALYST SUMMARIES of official communications, NOT projected rates,
// market-implied pricing, trading signals or promises about future policy.
export const policyGuidanceReviewedAt = "2026-10-16";
export const policyGuidance = {
  USD:{
    currency:"USD",bank:"Federal Reserve",short:"Fed",
    publishedDate:"2026-09-16",stance:"Recent rate increase · No fixed future path",
    headline:"Inflation remains elevated after September rate increase",
    guidance:"The FOMC increased its target range to 3.75–4.00% and emphasized its 2% inflation objective. The statement did not promise a specific move at the next meeting.",
    watch:"US CPI and employment trends; the next FOMC statement and economic projections",
    source:"https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm",
    evidence:"Official FOMC statement",notMarketPricing:true
  },
  EUR:{
    currency:"EUR",bank:"European Central Bank",short:"ECB",
    publishedDate:"2026-09-10",stance:"Data-dependent · Meeting by meeting",
    headline:"ECB commits to inflation target, not a predetermined rate path",
    guidance:"The Governing Council assesses inflation and economic data at each meeting; its communication does not commit to a specific future policy-rate trajectory.",
    watch:"Euro-area inflation, wage growth and the ECB's updated projections",
    source:"https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.en.html",
    evidence:"Official monetary policy decisions",notMarketPricing:true
  },
  GBP:{
    currency:"GBP",bank:"Bank of England",short:"BoE",
    publishedDate:"2026-09-17",stance:"Rate hold · Upside inflation risks",
    headline:"Six MPC members held; three preferred a 25 bp hike",
    guidance:"The September MPC maintained Bank Rate at 3.75% by 6–3. It highlighted energy-driven upside inflation risks and said it stood ready to act if necessary.",
    watch:"UK CPI, wage-setting effects from energy prices, jobs and MPC votes",
    source:"https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/september-2026",
    evidence:"MPC summary and minutes",notMarketPricing:true
  },
  JPY:{
    currency:"JPY",bank:"Bank of Japan",short:"BoJ",
    publishedDate:"2026-07-31",stance:"Conditional further tightening",
    headline:"BoJ July outlook described scope to continue raising rates",
    guidance:"The BoJ's July outlook said it would continue adjusting accommodation by raising rates in response to economic activity, prices and financial conditions. This is conditional guidance, not a dated hike promise.",
    watch:"Japan's wage and inflation trend, financial conditions and the October Outlook Report",
    source:"https://www.boj.or.jp/en/mopo/outlook/highlight/ten202607.htm",
    evidence:"Official July Outlook Report summary",notMarketPricing:true
  },
  AUD:{
    currency:"AUD",bank:"Reserve Bank of Australia",short:"RBA",
    publishedDate:"2026-09-29",stance:"Further tightening possible if needed",
    headline:"RBA raised its cash target and left room for another increase",
    guidance:"After raising its cash-rate target to 4.60%, the RBA said inflation was still too high and that it could increase rates further if necessary. Its next decision remains data-dependent.",
    watch:"Australian inflation, wages, employment and evidence of slowing demand",
    source:"https://www.rba.gov.au/media-releases/2026/mr-26-27.html",
    evidence:"Official Monetary Policy Board decision",notMarketPricing:true
  },
  NZD:{
    currency:"NZD",bank:"Reserve Bank of New Zealand",short:"RBNZ",
    publishedDate:"2026-09-02",stance:"Conditional further tightening projected",
    headline:"RBNZ projections allowed for further OCR increases",
    guidance:"The September Monetary Policy Statement projected further OCR increases conditional on its central economic outlook, to bring inflation back toward 2%. This is the bank's conditional projection, not a market-implied quote.",
    watch:"New Zealand CPI, demand and labour-market data; new OCR path in the next policy statement",
    source:"https://www.rbnz.govt.nz/monetary-policy/monetary-policy-statement/monetary-policy-statement-filtered-listing-page/2026/sep-0209/monetary-policy-statement-september-2026/web-version",
    evidence:"Official Monetary Policy Statement",notMarketPricing:true
  },
  CAD:{
    currency:"CAD",bank:"Bank of Canada",short:"BoC",
    publishedDate:"2026-09-02",stance:"Rate hold · Watching inflation upside",
    headline:"BoC held at 2.25%, with more uncertainty around inflation",
    guidance:"The Governing Council kept its overnight target unchanged, said upside inflation risks had increased, and remained prepared to adjust policy as needed. It did not announce a precommitted hike.",
    watch:"Canadian inflation excluding energy, recovery durability and trade-policy effects",
    source:"https://www.bankofcanada.ca/2026/09/fad-press-release-2026-09-02/",
    evidence:"Official rate decision press release",notMarketPricing:true
  },
  CHF:{
    currency:"CHF",bank:"Swiss National Bank",short:"SNB",
    publishedDate:"2026-09-24",stance:"Rate hold · Conditional inflation outlook",
    headline:"SNB held at zero as its conditional inflation forecast stayed in target",
    guidance:"The SNB maintained a 0% policy rate. Its published inflation forecast assumed a constant policy rate and was within its price-stability range; that assumption is not a promise to hold future rates.",
    watch:"Swiss inflation, franc exchange-rate developments and global uncertainty",
    source:"https://www.snb.ch/en/publications/communication/press-releases-restricted/pre_20260924",
    evidence:"Official monetary policy assessment",notMarketPricing:true
  }
};

export const guidanceCurrencies = ["USD","EUR","GBP","JPY","AUD","NZD","CAD","CHF"];
export function getGuidanceForPair(pair){
  const base=pair?.base || (typeof pair==="string"?pair.slice(0,3):"");
  const quote=pair?.quote || (typeof pair==="string"?pair.slice(3,6):"");
  return base!==quote && policyGuidance[base] && policyGuidance[quote] ? [policyGuidance[base],policyGuidance[quote]] : [];
}
export function validatePolicyGuidance(){
  const codes=Object.keys(policyGuidance);
  if(codes.length!==8 || guidanceCurrencies.some(c=>!codes.includes(c)))return {valid:false,reason:"Missing bank guidance"};
  for(const c of codes){
    const item=policyGuidance[c];
    if(item.currency!==c||!/^2026-\d\d-\d\d$/.test(item.publishedDate)||item.publishedDate>policyGuidanceReviewedAt)return {valid:false,reason:"Invalid guidance date"};
    if(!/^https:\/\//.test(item.source)||item.guidance.length<65||item.headline.length<20||item.watch.length<25||item.notMarketPricing!==true)return {valid:false,reason:"Incomplete sourced guidance"};
  }
  return {valid:true,count:codes.length};
}

import { contextFresh, relevantIndicators, safeSource, finite } from './market-research.js';
export const PLAN_KEY='t90.research-plan.v2';
export const LEGACY_KEY='t90.plan';
export const MARKETS=['USD/JPY','EUR/USD','GBP/USD','USD/CHF','USD/CAD','AUD/USD','NZD/USD','XAU/USD','BTC/USD'];
export const FIELDS=[
 ['scope','Research scope','Which instrument, research horizon and next review time?'],
 ['conditions','Current conditions','Compare monetary and fiscal policy, expected rate paths, yields, growth, inflation, employment and geopolitical developments. Distinguish confirmed facts from reports.'],
 ['participation','Positioning and price behaviour','Describe CFTC and retail samples separately, volume coverage, price structure, liquidity proxies and volatility. Record each observation date and limitation.'],
 ['interpretation','Supporting and conflicting evidence','What supports your assessment? What contradicts it? Separate your interpretation from observed facts.'],
 ['uncertainty','Unknowns and missing data','Which sources are stale, unavailable or incomplete? What could already be priced in?'],
 ['scenarios','Alternative scenarios','Describe at least two plausible developments, their observable conditions and what you would reassess. Do not assign unsupported probabilities.'],
 ['invalidation','What would change your view?','Name the evidence or event that would invalidate your assessment, and when you will check again.'],
 ['decisionReason','Reason for your decision','Why wait, research further, or consider a trade? What evidence is still needed?'],
 ['sessions','Sessions and schedule','When would you review or act? Which releases, market closures or volatility conditions would make you wait?'],
 ['setups','Optional execution criteria','Only if considering a trade: define your own entry conditions and no-trade conditions.'],
 ['risk','Optional risk limits','If considering a trade: define loss limits, position sizing inputs, event exposure and your response if conditions change.'],
 ['management','Optional trade management','If considering a trade: record invalidation, exit rules and how you will handle gaps, spread changes or slippage.'],
 ['review','Decision review','Was the evidence reliable? Did you follow your process? What changed? Review waiting decisions as well as trades.']
];
const decisions=['undecided','wait','research','consider'];
export function normalizePlan(value) {
 const p=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const text=v=>typeof v==='string'?v:'';
 return {version:2,market:MARKETS.includes(p.market)?p.market:'USD/JPY',decision:decisions.includes(p.decision)?p.decision:'undecided',fields:Object.fromEntries(FIELDS.map(([id])=>[id,text(p.fields?.[id])])),evidence:text(p.evidence),updatedAt:text(p.updatedAt)};
}
export function migrateLegacy(legacy) {
 const p=normalizePlan(null);
 if(!legacy||typeof legacy!=='object'||Array.isArray(legacy))return p;
 for(const id of ['sessions','setups','risk','management','review'])if(typeof legacy[id]==='string')p.fields[id]=legacy[id];
 if(typeof legacy.markets==='string')p.fields.scope=legacy.markets;
 return p;
}
export function evidenceText(context,market,now=Date.now()) {
 if(context?.schema_version!==1||context?.methodology!=='research-context-1'||!Array.isArray(context.indicators)||!contextFresh(context,now))throw Error('Research feed is unavailable, invalid or beyond its refresh window. Existing evidence is unchanged.');
 const rows=relevantIndicators(context,market).filter(r=>r&&typeof r==='object');
 if(!rows.length)throw Error('No relevant indicators returned. Existing evidence is unchanged.');
 return [
 `Market: ${market}`,`Snapshot generated: ${context.generated_at}`,`Imported: ${new Date(now).toISOString()}`,
 'Captured source observations, not a recommendation. Latest-vintage data may be revised.',
 market==='USD/JPY'?'Coverage: US, Japan and global macro.':'Coverage: US/global macro only; full asset-specific research is incomplete.',
 'This import includes macro indicators only. Add policy communications, event expectations, positioning, technical evidence and their original sources separately.',
 ...rows.map(r=>`${r.country} · ${r.label}: ${finite(r.value)?r.value:'Unavailable'} ${r.unit??''} | observation: ${r.observed_at??'Unknown'} | status: ${r.status??'Unknown'} | ${safeSource(r.source_url)??'Source URL unavailable'}`)
 ].join('\n');
}
export function planMarkdown(plan) {
 const p=normalizePlan(plan);
 return ['# TRADE90 Research and Decision Plan','',`Market: ${p.market}`,`Decision: ${{undecided:'Undecided',wait:'Wait / no trade',research:'Research further',consider:'Consider a trade'}[p.decision]}`,`Last saved: ${p.updatedAt||'Not saved'}`,'','Completeness is not confidence or a probability of success.','','## Captured evidence',p.evidence||'No evidence captured.','',...FIELDS.flatMap(([id,title])=>[`## ${title}`,p.fields[id]||'Not recorded.',''])].join('\n');
}

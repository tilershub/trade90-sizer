import {displayRate,displayBenchmark} from './trade90-rate-display.js';

export function evidenceLabel(tier){
 return {reviewed_qualitative:'Reviewed policy evidence',automated_provisional:'Automated provisional evidence',exploratory_macro:'Exploratory · macro evidence only',conflicting_evidence:'Conflicting evidence'}[tier]||'Direction unresolved';
}

// The current decision and historical editorial interpretation are independent.
// Derive this every build, so a new decision cannot inherit an older summary.
export function policyContext(bank,benchmark,now=Date.now()){
 const guidance=bank?.guidance;
 const auto=bank?.automatedAssessment;
 const newer=auto?.evidence?.newerOfficialDecision;
 const current=bank?.policyEvidenceReviewed===true&&Date.parse(bank.expiresAt)>now&&
   guidance?.publishedDate>=benchmark?.decisionDate&&(!newer||newer.date<=guidance.publishedDate);
 const action=benchmark?.decision?.startsWith('Hike')?'raised':benchmark?.decision?.startsWith('Cut')?'lowered':benchmark?.decision==='Hold'?'held':null;
 return {
  current,
  historicalLabel:guidance&&[benchmark?.decisionDate,newer?.date].some(d=>d>guidance.publishedDate)?'Historical guidance · superseded':'Historical guidance · review expired',
  headline:benchmark?`${benchmark.short} ${action||'published'} ${displayBenchmark(benchmark).toLowerCase()} ${action==='raised'||action==='lowered'?'to':'at'} ${displayRate(benchmark)}`:'Decision evidence unavailable',
  decisionDate:benchmark?.decisionDate,source:benchmark?.source,effectiveDate:benchmark?.effectiveDate,
  newer,
  label:current?'Current reviewed interpretation':auto?.status==='assessed'?'Automated provisional assessment':'Policy interpretation unresolved',
  interpretation:current?guidance.guidance:auto?.reason||'Current policy interpretation is unavailable.',
  checkedAt:auto?.checkedAt,
  guidance
 };
}

export function explainPair(outlook,banks){
 const base=banks?.[outlook?.base],quote=banks?.[outlook?.quote];
 const pillars=[['inflation','Inflation'],['employment','Employment'],['growth','Growth']];
 const rows=pillars.map(([key,label])=>({key,label,base:base?.scoreComponents?.[key]??null,quote:quote?.scoreComponents?.[key]??null}));
 const difference=outlook?.macroComparison?.scoreDifference??(Number.isFinite(base?.score)&&Number.isFinite(quote?.score)?base.score-quote.score:null);
 const direction=Math.sign(difference||0);
 const supporting=rows.filter(r=>Number.isFinite(r.base)&&Number.isFinite(r.quote)&&(r.base-r.quote)*direction>0).map(r=>r.label.toLowerCase());
 const opposing=rows.filter(r=>Number.isFinite(r.base)&&Number.isFinite(r.quote)&&(r.base-r.quote)*direction<0).map(r=>r.label.toLowerCase());
 const stronger=direction>0?outlook?.base:outlook?.quote,other=direction>0?outlook?.quote:outlook?.base;
 const summary=direction&&supporting.length?`${supporting.join(' and ')} contribute more tightening pressure to ${stronger} than ${other}.`:'The three economic pillars do not establish a clear relative pressure advantage.';
 return {rows,summary:summary[0].toUpperCase()+summary.slice(1),
  counter:!direction?'Neither currency has a relative score advantage. Matching pressure does not imply matching future rate moves.':opposing.length?`${opposing.join(' and ')} offset that relative pressure advantage.`:'No scored pillar offsets the relative advantage; that does not establish either bank’s next decision.',
  conditions:outlook?.evidenceTier==='exploratory_macro'?'This macro-only direction disappears if the score difference falls below 2 points, reverses if relative pressure reverses, and is withheld when required data expires. New policy evidence may support, override or conflict with the screen.':'New inflation, employment or growth observations, or a newer policy decision, can change this assessment. Conflicting policy and macro evidence removes the directional view.'};
}

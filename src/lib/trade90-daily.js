// Compare what a visitor actually viewed, without treating fetch timestamps as news.
export const outlookLabels={widening:'Widening bias',narrowing:'Narrowing bias',unchanged:'Broadly unchanged bias',unclear:'Direction uncertain',unavailable:'Current evidence unavailable'};
export function effectiveState(pair,now=Date.now()) {
 return pair && Number.isFinite(Date.parse(pair.expiresAt)) && Date.parse(pair.expiresAt)>now ? pair.state : 'unavailable';
}
export function captureView(data,now=Date.now()) {
 return {version:1,viewedAt:new Date(now).toISOString(),modelVersion:data.modelVersion,
 pairs:Object.fromEntries(Object.entries(data.pairs||{}).map(([s,p])=>[s,{state:effectiveState(p,now),gap:p.signedGap}])),
 banks:Object.fromEntries(Object.entries(data.banks||{}).map(([c,b])=>[c,{
 drivers:(b.drivers||[]).map(d=>({metric:d.metric,latest:d.latest,text:d.text,source:d.source})),
 guidance: b.guidance ? {source:b.guidance.source,text:b.guidance.guidance,assessment:b.guidance.assessment} : null
 }]))};
}
export function changesSince(previous,current,symbols) {
 if(previous?.version!==1||!previous.pairs||!previous.banks)return [];
 const result=[];
 if(previous.modelVersion!==current.modelVersion)result.push({title:'Model version changed',text:`${previous.modelVersion} → ${current.modelVersion}. Changes may reflect methodology as well as evidence.`});
 for(const s of symbols){const a=previous.pairs[s],b=current.pairs[s];if(!a||!b)continue;
 if(a.state!==b.state)result.push({title:s.slice(0,3)+'/'+s.slice(3),text:`${outlookLabels[a.state]||a.state} → ${outlookLabels[b.state]||b.state}. Open the pair research for the explanation.`,symbol:s});
 if(a.gap!==b.gap)result.push({title:s.slice(0,3)+'/'+s.slice(3)+' rate gap',text:`Signed policy gap: ${a.gap} → ${b.gap} percentage points.`,symbol:s});
 }
 const codes=[...new Set(symbols.flatMap(s=>[s.slice(0,3),s.slice(3)]))];
 for(const c of codes){const a=previous.banks[c],b=current.banks[c];if(!a||!b)continue;
 for(const d of b.drivers){const old=a.drivers?.find(x=>x.metric===d.metric);if(JSON.stringify(old)!==JSON.stringify(d))result.push({title:`${c} · ${d.metric}`,text:`${old?.latest?.value??'Unavailable'} (${old?.latest?.date?.slice(0,7)||'no prior observation'}) → ${d.latest.value} (${d.latest.date.slice(0,7)}). ${d.text}. May include revisions or source changes.`,source:d.source});}
 if(JSON.stringify(a.guidance)!==JSON.stringify(b.guidance))result.push({title:`${c} · Policy context updated`,text:'The published guidance or its reviewed interpretation changed. Read the latest bank evidence.'});
 }
 return result;
}
export function upcomingDecisions(events,codes,today){return events.filter(e=>codes.includes(e.currency)&&e.date>=today).sort((a,b)=>a.date.localeCompare(b.date));}

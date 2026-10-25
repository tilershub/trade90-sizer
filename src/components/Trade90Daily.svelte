<script>
 import {onMount} from 'svelte';
 import {getAuthClient} from '../lib/trade90-auth.js';
 import {loadDashboard,saveDashboard,sanitizeDashboard} from '../lib/trade90-dashboard-sync.js';
 import {outlookLabels,effectiveState,captureView,changesSince,upcomingDecisions,evidenceBrief} from '../lib/trade90-daily.js';
 import {officialPolicyDecisionCalendar,decisionCalendarReviewedAt} from '../data/trade90-decision-calendar.js';
 export let initialData;
 let data=initialData, selected=[], previous=null, ready=false, busy=false, error='', storageError=false, now=Date.now(), feed=null;
 let user=null,accountReady=false,cloudVersion=null,cloudLoaded=false,syncBusy=false,syncMessage='',syncError=false,authClient=null;
 const watchKey='trade90-daily-pairs-v1',viewKey='trade90-daily-view-v1';
 const link=s=>'/pairs/'+s.slice(0,3).toLowerCase()+'-'+s.slice(3).toLowerCase()+'/#policy-outlook';
 const label=s=>s.slice(0,3)+'/'+s.slice(3);
 const stamp=d=>d?new Date(d).toLocaleString('en-GB',{timeZone:'UTC'})+' UTC':'Unavailable';
 $: symbols=Object.keys(data.pairs||{}).sort();
 $: codes=[...new Set(selected.flatMap(s=>[s.slice(0,3),s.slice(3)]))];
 $: changes=changesSince(previous,captureView(data,now),selected);
 $: evidence=evidenceBrief(previous,captureView(data,now),selected);
 $: changedPairs=changes.filter(c=>c.symbol&&c.title.indexOf("rate gap")===-1).length;
 $: events=upcomingDecisions(officialPolicyDecisionCalendar,codes,new Date(now).toISOString().slice(0,10));
 $: publications=(feed?.items||[]).filter(i=>codes.includes(i.code)&&Date.parse(i.firstSeenAt)<=now&&(!previous||Date.parse(i.firstSeenAt)>Date.parse(previous.viewedAt))).sort((a,b)=>b.firstSeenAt.localeCompare(a.firstSeenAt)).slice(0,8);
 function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{storageError=true;}}
 function markReviewed(){if(user){syncMessage='Use Save dashboard to update your account baseline.';return;}previous=captureView(data,Date.now());save(viewKey,previous);}
 function toggle(s){if(user&&!cloudLoaded)return;selected=selected.includes(s)?selected.filter(x=>x!==s):[...selected,s];if(!user)save(watchKey,selected);else syncMessage='Unsaved watchlist changes. Save to your account.';}
 async function refresh(){if(busy)return;busy=true;error='';now=Date.now();
 const results=await Promise.allSettled(['/data/policy-outlook.json','/data/official-release-feed.json'].map(async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error();return r.json();}));
 const outlook=results[0];if(outlook.status==='fulfilled'&&outlook.value.schemaVersion===2&&outlook.value.pairs&&outlook.value.banks&&Date.parse(outlook.value.generatedAt)<=now+300000){data=outlook.value;}else error='Could not refresh policy research. The dated snapshot below is retained; expired outlooks are hidden.';
 const releases=results[1];if(releases.status==='fulfilled'&&Array.isArray(releases.value.items))feed=releases.value;else feed=null;
 busy=false;
 }

 async function initAccount(){
  authClient=getAuthClient();
  try{
   const {data:session,error}=await authClient.auth.getSession();if(error)throw error;
   user=session.session?.user||null;
   if(user){
    const remote=await loadDashboard(authClient,user.id);cloudVersion=remote?.workspace_version??null;
    const saved=sanitizeDashboard(remote?.daily_dashboard,symbols);
    if(saved){selected=saved.pairs;previous=saved.view;}
    else {selected=[];previous=null;}
    cloudLoaded=true;syncMessage=saved?'Account dashboard loaded.':'Choose pairs and save to start your account dashboard.';
   }
  }catch{syncError=true;syncMessage='Account dashboard could not load. Reload to try again; no cloud data has been overwritten.';}
  accountReady=true;await refresh();
 }
 async function saveAccount(){
  if(!user||!cloudLoaded||syncBusy)return;syncBusy=true;syncError=false;
  try{
   const {data:session}=await authClient.auth.getSession();if(session.session?.user.id!==user.id)throw Error('Your session changed. Reload this page before saving.');
   cloudVersion=await saveDashboard(authClient,user.id,cloudVersion,{version:1,pairs:selected,view:captureView(data,Date.now())});syncMessage='Dashboard saved to your account.';
  }catch{syncError=true;syncMessage='Could not save. Your session or dashboard may have changed on another device. Reload before trying again.';}
  finally{syncBusy=false;}
 }
 async function logout(){
  const {error}=await authClient.auth.signOut({scope:'local'});
  if(error){syncError=true;syncMessage='Sign-out failed. Please try again.';return;}
  user=null;previous=null;selected=[];window.location.replace('/daily/');
 }
 onMount(()=>{try{const stored=JSON.parse(localStorage.getItem(watchKey)||'null');selected=Array.isArray(stored)?[...new Set(stored.filter(s=>symbols.includes(s)))]:['EURUSD','AUDCHF','USDJPY'];const v=JSON.parse(localStorage.getItem(viewKey)||'null');if(v?.version===1&&Date.parse(v.viewedAt)<=Date.now())previous=v;}catch{storageError=true;selected=['EURUSD','AUDCHF','USDJPY'];}ready=true;initAccount();const {data:authListener}=getAuthClient().auth.onAuthStateChange((_event,session)=>{if(accountReady&&(session?.user?.id||null)!==(user?.id||null)){user=null;selected=[];previous=null;cloudLoaded=false;accountReady=false;setTimeout(()=>window.location.reload(),0);}});const timer=setInterval(()=>{now=Date.now();if(!document.hidden)refresh();},300000);return()=>{clearInterval(timer);authListener.subscription.unsubscribe();};});
</script>
<div class="daily">
 <section aria-label="Account"><div class="toolbar"><div><strong>{user?'Your account dashboard':'Make this dashboard yours'}</strong><p>{user?'Your account watchlist is separate from this browser’s guest watchlist. Save after editing pairs or reviewing research to update your cross-device baseline.':'Sign in or create an account with Google to save a dashboard across devices. Guest mode remains available.'}</p></div>{#if !accountReady}<span>Checking account…</span>{:else if user}<div><button on:click={saveAccount} disabled={!cloudLoaded||syncBusy||busy}>{syncBusy?'Saving…':'Save dashboard'}</button> <button on:click={logout} disabled={syncBusy}>Sign out</button></div>{:else}<a href="/sign-in/">Sign in / Create account →</a>{/if}</div>{#if syncMessage}<p role="status" class:notice={syncError}>{syncMessage}</p>{/if}</section>
 <div class="toolbar"><p>90-day policy research · Experimental · Accuracy not yet established</p><button on:click={refresh} disabled={!ready||busy}>{busy?'Checking…':'Check for updates'}</button></div>
 <p class="meta">Published model run: {stamp(data.generatedAt)}. Checks this dashboard every five minutes while visible; upstream macro data refreshes daily and official-source checks run hourly. Policy interpretations require dated review.</p>
 {#if error}<p role="status" class="notice">{error}</p>{/if}
 {#if storageError}<p class="notice">Browser storage is unavailable or invalid. Your selections or visit history may not persist.</p>{/if}
 <section><h2>My pairs</h2><p>Choose your pairs. Guest selections stay in this browser. Signed-in traders can save their watchlist and comparison baseline to their account.</p>
 <details><summary>Edit watchlist · {selected.length} pairs</summary><div class="choices">{#each symbols as s}<button disabled={!accountReady||(user&&!cloudLoaded)||syncBusy} aria-pressed={selected.includes(s)} on:click={()=>toggle(s)}>{selected.includes(s)?'✓ ':''}{label(s)}</button>{/each}</div></details>
 {#if !ready}<p>Loading your daily research…</p>{:else if !selected.length}<p>Select a pair above to start your daily routine.</p>{:else}<div class="pairgrid">{#each selected as s}{@const p=data.pairs[s]}{@const state=effectiveState(p,now)}<a class="pair" href={link(s)}><h3>{label(s)}</h3><strong class:positive={state!=='unavailable'&&p.tone==='positive'} class:negative={state!=='unavailable'&&p.tone==='negative'}>{state==='unavailable'?'—':p.direction>0?'↑':p.direction<0?'↓':'—'} {outlookLabels[state]}</strong><p>{state==='unavailable'?'Fresh evidence is required before showing a directional outlook.':p.reason}</p><span>Read evidence & what could change →</span></a>{/each}</div>{/if}
 <p class="meta">Green means the signed policy gap moves towards the first currency; red towards the second. These are not currency-price signals.</p></section>
 <section class="brief"><div class="toolbar"><div><h2>My daily decision brief</h2><p>Review changes before updating your baseline. A refreshed timestamp is not a new economic signal.</p></div>{#if !user}<button on:click={markReviewed} disabled={!ready||busy}>Mark research reviewed</button>{:else}<span class="meta">Use Save dashboard after reviewing to set your next comparison baseline.</span>{/if}</div><div class="brief-stats"><div><strong>{selected.length}</strong><span>Followed pairs</span></div><div><strong>{previous?changedPairs:"—"}</strong><span>Changed outlooks</span></div><div><strong>{previous?evidence.filter(e=>e.status==="review").length:"—"}</strong><span>Currencies with new or revised evidence</span></div></div>{#if !previous}<p>No comparison baseline yet. Save your dashboard or mark this research reviewed to begin tracking changes.</p>{:else}<h3>Evidence requiring review</h3>{#if evidence.some(e=>e.status==="review")}<ul>{#each evidence.filter(e=>e.status==="review") as item}<li><strong>{item.code} · Evidence changed</strong><p>{item.summary}</p>{#if item.changed?.length}<p>New observations: {item.changed.join(", ")}</p>{/if}{#if item.revised?.length}<p>Revisions or interpretations: {item.revised.join(", ")}</p>{/if}{#if item.guidanceChanged}<p>Central-bank guidance or its recorded assessment changed.</p>{/if}</li>{/each}</ul>{:else}<p>No tracked macroeconomic evidence changes detected for your watchlist.</p>{/if}{/if}<p class="meta">Evidence changes are not automatically classified as supportive or contradictory. Check original sources and the pair analysis before changing a trading thesis.</p></section>
 <section><h2>Since your last visit</h2>{#if !previous}<p>{user?'Save dashboard to establish your account baseline. Return and save after reviewing research to update it.':'Your first visit establishes a baseline. Return to compare published evidence with what you saw here today.'}</p>{:else}<p>Compared with your dashboard visit at {stamp(previous.viewedAt)}. Changes below are for your current watchlist.</p>{#if changes.length}<ul>{#each changes as change}<li><strong>{change.title}</strong><p>{change.text}</p>{#if change.symbol}<a href={link(change.symbol)}>View research →</a>{:else if change.source}<a href={change.source} target="_blank" rel="noopener noreferrer">Original data source ↗</a>{/if}</li>{/each}</ul>{:else}<p class="notice">No change detected in the tracked outlooks or displayed evidence since your previous visit. This does not mean no economic news has occurred.</p>{/if}{/if}</section>
 <div class="columns"><section><h2>Next policy decisions</h2><p>Dates from official bank calendars, reviewed {decisionCalendarReviewedAt}. Announcement times and a complete calendar of economic releases and speeches are not yet included.</p>{#if events.length}<ul>{#each events.slice(0,8) as e}<li><strong>{e.date} · {e.currency} · {e.bank}</strong><p>{e.title}</p><p>{e.watch}</p><a href={e.source} target="_blank" rel="noopener noreferrer">Confirm on official calendar ↗</a></li>{/each}</ul>{:else}<p>No upcoming decision is listed for your selection. This is not confirmation that no events are scheduled.</p>{/if}</section>
 <section><h2>{previous?'Newly detected official links':'Official source watch'}</h2><p>Discovery time is not publication time. Links may refer to older material and do not automatically change the model.</p><p class="meta">Last source scan: {stamp(feed?.lastSourceScanAt)}{#if !feed?.lastSourceScanAt||now-Date.parse(feed.lastSourceScanAt)>30*3600000} · Feed unavailable or potentially stale{/if}</p>{#if publications.length}<ul>{#each publications as item}<li><strong>{item.code} · Detected {stamp(item.firstSeenAt)}</strong><p><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&')} ↗</a></p></li>{/each}</ul>{:else}<p>No newly detected links available for your selection. Check the original central-bank sources for complete coverage.</p>{/if}</section></div>
 <section><h2>What to watch in your currencies</h2><div class="pairgrid">{#each codes as c}{@const bank=data.banks[c]}<article><h3>{c}</h3><p><strong>{Date.parse(bank.expiresAt)>now?bank.label:'Assessment expired'}</strong></p><p>{bank.watch}</p><details><summary>Evidence & counter-evidence</summary>{#each bank.drivers||[] as d}<p><strong>{d.metric}:</strong> {d.text} · {d.latest.value}% ({d.latest.date.slice(0,7)}) · <a href={d.source} target="_blank" rel="noopener noreferrer">Source</a></p>{/each}{#each bank.cautions||[] as c}<p>{c}</p>{/each}<p>These observations may cover different periods. See the pair research for definitions, freshness and policy context.</p></details></article>{/each}</div></section>
 <p><a href="/policy-model/">Read the model rules and limitations →</a></p>
</div>
<style>
.daily{--ink:#e2e8f0;--muted:#b8c7d7;--surface:#111c30;--soft:#17253b;--line:#3e5068;--accent:#93c5fd;color:var(--ink)}:global(html[data-theme='light']) .daily{--ink:#102033;--muted:#475569;--surface:#fff;--soft:#f1f5f9;--line:#cbd5e1;--accent:#1d4ed8}section{border-top:1px solid var(--line);padding:24px 0}h2{font-size:1.4rem;margin:0 0 12px}h3{margin:0 0 12px;font-size:1.2rem}p{color:var(--muted);line-height:1.65;font-size:.92rem}a{color:var(--accent)}button{background:var(--soft);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:10px 13px;cursor:pointer}button[aria-pressed='true']{border:2px solid var(--accent)}button:disabled{opacity:.65}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:15px}.meta{font-size:.78rem}.choices{display:flex;flex-wrap:wrap;gap:8px;padding:16px 0}summary{cursor:pointer;color:var(--accent);padding:8px 0}.pairgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:18px}.pair,article{display:block;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:20px;color:var(--ink);text-decoration:none;min-width:0}.pair span{color:var(--accent);font-size:.85rem}.positive{color:#93c5fd}.negative{color:#fca5a5}:global(html[data-theme='light']) .positive{color:#1d4ed8}:global(html[data-theme='light']) .negative{color:#b91c1c}.columns{display:grid;grid-template-columns:1fr 1fr;gap:28px}ul{list-style:none;padding:0}li{padding:14px 0;border-bottom:1px solid var(--line)}li p{margin:5px 0}.notice{background:var(--soft);padding:16px;border-radius:8px}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:3px}@media(max-width:650px){.columns{grid-template-columns:1fr;gap:0}.toolbar{align-items:start;flex-direction:column}.pairgrid{grid-template-columns:1fr}.pair,article{padding:16px}}
.brief{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:20px;margin-top:18px}.brief-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}.brief-stats>div{padding:14px;background:var(--soft);border-radius:10px}.brief-stats strong{font-size:1.45rem;display:block}.brief-stats span{font-size:.75rem;color:var(--muted)}@media(max-width:650px){.brief{padding:14px}.brief-stats{grid-template-columns:1fr 1fr}.brief-stats>div:last-child{grid-column:1/-1}}
</style>

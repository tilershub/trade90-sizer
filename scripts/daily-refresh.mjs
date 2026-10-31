// One daily transaction: retrieve, verify, calculate, audit, then publish together.
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const startedAt=new Date().toISOString();
const steps=[
 ['macro',process.env.PYTHON||'python3',['scripts/update-macro-history.py']],
 ['policyInputs',process.env.PYTHON||'python3',['scripts/update-policy-inputs.py']],
 ['officialSources',process.execPath,['scripts/monitor-official-sources.mjs']],
 ['officialRates',process.execPath,['scripts/auto-policy-rates.mjs']],
 ['yields',process.execPath,['scripts/refresh-yield-curves.mjs']],
 ['model',process.execPath,['scripts/build-policy-outlook.mjs']],
 ['freshness',process.execPath,['scripts/build-refresh-status.mjs']]
];
const results=[];
for(const [name,command,args] of steps){
 const began=new Date().toISOString();
 const run=spawnSync(command,args,{stdio:'inherit',timeout:10*60*1000});
 results.push({name,startedAt:began,finishedAt:new Date().toISOString(),success:run.status===0,error:run.error?.message||null});
}
const report={schemaVersion:1,startedAt,completedAt:new Date().toISOString(),status:results.every(x=>x.success)?'completed':'partial',steps:results};
writeFileSync('public/data/daily-update.json',JSON.stringify(report,null,2)+'\n');
// The workflow commits the failure report before failing, so visitors can see failures.
console.log('Daily refresh completed:',report.status);

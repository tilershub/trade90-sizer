import {readFileSync} from 'node:fs';
const expected=JSON.parse(readFileSync('public/data/daily-update.json','utf8')).completedAt;
const endpoint='https://tradeninety.com/data/daily-update.json';
const deadline=Date.now()+15*60*1000;
while(Date.now()<deadline){
 try{
  const response=await fetch(endpoint+'?verify='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(response.ok){
   const live=await response.json();
   if(live.schemaVersion===1&&Date.parse(live.completedAt)>=Date.parse(expected)){
    console.log('Verified daily data deployment:',live.completedAt);process.exit(0);
   }
  }
 }catch(error){console.log('Waiting for deployment:',error.message);}
 await new Promise(resolve=>setTimeout(resolve,30000));
}
throw Error('Daily data was committed but did not reach production within 15 minutes');

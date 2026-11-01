import fs from 'node:fs/promises';
import {evaluateYieldIntegration} from '../src/lib/trade90-yield-evaluation.js';
const curve=JSON.parse(await fs.readFile('src/data/trade90-yield-curves.json','utf8'));
const history=JSON.parse(await fs.readFile('public/data/official-rate-history.json','utf8'));
const result=evaluateYieldIntegration(curve,history);
await fs.writeFile('public/data/yield-model-evaluation.json',JSON.stringify(result,null,2)+'\n');
console.log('Yield integration evaluation:',result.status,'verified outcomes:',result.completedBacktestOutcomes);

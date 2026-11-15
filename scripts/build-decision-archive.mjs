// Record each verified decision from the live snapshot in an append-only archive.
// Runs in the daily refresh (committed with public/data/) and before every build.
import fs from 'node:fs';
import { mergeDecisionArchive } from '../src/lib/trade90-decision-archive.js';
const read = (path, fallback) => fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : fallback;
const OUT = 'public/data/decision-archive.json';
const snapshot = read('src/data/trade90-policy-snapshot.json', null);
if (!snapshot || !Array.isArray(snapshot.banks)) throw new Error('Policy snapshot unavailable');
const history = read('public/data/official-rate-history.json', []);
const { changed, archive } = mergeDecisionArchive(read(OUT, null), snapshot, Array.isArray(history) ? history : []);
if (changed) fs.writeFileSync(OUT, JSON.stringify(archive, null, 2) + '\n');
console.log('Decision archive:', archive.decisions.length, 'decisions', changed ? '(updated)' : '(unchanged)');

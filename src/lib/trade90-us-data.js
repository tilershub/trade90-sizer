// Build-time loader for the US context (reads the published JSON files).
import { readFileSync } from 'node:fs';
import { usContext } from './trade90-us-context.js';
import snapshot from '../data/trade90-policy-snapshot.json';
import yields from '../data/trade90-yield-curves.json';
import { decisionArchive, contentNow } from './trade90-content-data.js';
let cached = null;
export function loadUsContext() {
  if (cached) return cached;
  const macro = JSON.parse(readFileSync('public/data/macro-history.json', 'utf8'));
  cached = usContext({ snapshot, macro, yields, archive: decisionArchive(), nowMs: contentNow() });
  return cached;
}

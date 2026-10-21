import assert from 'node:assert/strict';
import {sanitizeDashboard,saveDashboard} from '../src/lib/trade90-dashboard-sync.js';
assert.deepEqual(sanitizeDashboard({version:1,pairs:['AUDCHF','BAD','AUDCHF'],view:null},['AUDCHF']),{version:1,pairs:['AUDCHF'],view:null});
assert.equal(sanitizeDashboard({},['AUDCHF']),null);
const calls=[];const query={eq(k,v){calls.push([k,v]);return this},select(){return this},async maybeSingle(){return {data:null,error:null}}};
const client={from(table){assert.equal(table,'member_workspaces');return {update(value){assert.deepEqual(Object.keys(value),['daily_dashboard']);return query}}}};
await assert.rejects(saveDashboard(client,'owner-id',4,{version:1,pairs:[]}),/another device/);
assert.deepEqual(calls,[['user_id','owner-id'],['workspace_version',4]]);
console.log('Dashboard sanitization, owner filter, field isolation and conflict handling passed');

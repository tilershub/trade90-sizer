import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {lessons} from '../src/data/v2-lessons.js';
const root=new URL('../dist/',import.meta.url);
for(const lesson of lessons){
 const html=readFileSync(new URL(`learn/${lesson.slug}/index.html`,root),'utf8');
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const article=schemas.find(s=>s['@type']==='Article');
 assert.ok(article,lesson.slug+' Article schema');
 assert.equal(article.headline,lesson.title);
 assert.equal(article.dateModified,lesson.updated);
 assert.equal(article.author['@type'],'Organization');
 assert.ok(html.includes(`datetime="${article.dateModified}"`));
 assert.equal(article.citation.length,lesson.sources.length);
 assert.ok(html.includes('Quick answer:'));
 assert.ok(html.includes('href="/"'));
 assert.ok(html.includes('href="/disclaimer/"'));
 const faq=schemas.find(s=>s['@type']==='FAQPage');
 const questions=lesson.sections.filter(s=>s.heading.endsWith('?'));
 if(questions.length){assert.equal(faq.mainEntity.length,questions.length);for(const [i,q] of questions.entries()){assert.equal(faq.mainEntity[i].name,q.heading);assert.equal(faq.mainEntity[i].acceptedAnswer.text,q.paragraphs.join(' '));}}
 for(const match of html.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){
  const path=match[1];if(!path.endsWith('/')) continue;
  assert.ok(existsSync(new URL(path.slice(1)+'index.html',root)),lesson.slug+' broken link '+path);
 }
}
const removed=readFileSync(new URL('learn/expected-rate-gaps/index.html',root),'utf8');
assert.doesNotMatch(removed,/will display the 3-, 6- and 12-month/);
console.log(`Learning SEO passed: ${lessons.length} guides, schema-visible content parity, dates and internal routes.`);

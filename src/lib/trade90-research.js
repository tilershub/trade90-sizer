import registry from "../data/trade90-research-articles.json" with {type:"json"};
const validDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
export function approvedResearch(){
 return (registry.articles || []).filter(a =>
  a.status === "approved" && a.approvedBy && validDate(a.approvedAt) &&
  validDate(a.publishedAt) && a.publishedAt <= new Date().toISOString().slice(0,10) &&
  /^[A-Z]{6}$/.test(a.symbol || "") && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug || "") &&
  typeof a.title === "string" && typeof a.description === "string" &&
  typeof a.summary === "string" && Array.isArray(a.sections) && a.sections.length >= 2 &&
  a.sections.every(s => s.heading && Array.isArray(s.paragraphs) && s.paragraphs.length) &&
  Array.isArray(a.sources) && a.sources.length >= 2 &&
  a.sources.every(s => /^https:\/\//.test(s.url || "") && s.title)
 ).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
export const researchUrl = article => "/pairs/"+article.symbol.slice(0,3).toLowerCase()+"-"+article.symbol.slice(3).toLowerCase()+"/research/"+article.slug+"/";
export const researchForPair = symbol => approvedResearch().filter(a=>a.symbol===symbol);

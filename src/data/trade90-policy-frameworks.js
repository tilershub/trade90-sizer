// Official objectives are context, not mechanical instructions to raise/cut rates.
// Point targets use a disclosed +/-0.25pp model buffer, not an official tolerance band.
const point=(measure,source,description='2% medium-term objective')=>({measure,reference:2,low:1.75,high:2.25,description,source});
export const policyFrameworks={
 USD:point('Headline PCE','https://www.federalreserve.gov/faqs/economy_14400.htm','2% longer-run headline PCE objective'),
 EUR:point('Headline HICP','https://www.ecb.europa.eu/mopo/strategy/pricestab/html/index.en.html'),
 GBP:point('Headline CPI','https://www.bankofengland.co.uk/monetary-policy/inflation'),
 JPY:point('Headline CPI','https://www.boj.or.jp/en/mopo/outline/target.htm'),
 CAD:point('Headline CPI','https://www.bankofcanada.ca/core-functions/monetary-policy/','2% midpoint of the 1–3% control range'),
 NZD:point('Headline CPI','https://www.rbnz.govt.nz/monetary-policy/about-monetary-policy/history-of-the-remit-and-policy-targets-agreement','1–3% medium-term range, focused on 2%'),
 AUD:{measure:'Monthly headline CPI',reference:2.5,low:2,high:3,description:'2–3% inflation target, focused on the midpoint',source:'https://www.rba.gov.au/education/resources/explainers/australias-inflation-target.html'},
 CHF:{measure:'Headline CPI',reference:1,low:0,high:2,description:'Price stability: non-negative inflation below 2%',source:'https://www.snb.ch/en/the-snb/mandates-goals/monetary-policy/strategy'}
};

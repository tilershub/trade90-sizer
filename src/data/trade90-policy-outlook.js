// Dated published observations. NOT live quotes, licensed futures/OIS data, or full 3/6/12-month curves.
// No implied forward policy-rate value should be synthesized from these observations.
export const outlookAsOf = "2026-10-15";
export const outlookReports = [
  {
    currency:"USD", bank:"Fed",
    kind:"Reported market pricing",
    published:"2026-10-15",
    headline:"72% probability of holding rates",
    horizon:"October 27–28 FOMC meeting",
    detail:"Reuters reported CME FedWatch pricing of roughly 72% for no change at the October meeting. This is a dated reported probability, not a live quote or a 3-month rate forecast.",
    source:"https://www.reuters.com/world/asia-pacific/dollar-retreats-18-month-high-despite-hot-cpi-fed-officials-temper-hike-bets-2026-10-15/",
    value:{type:"hold_probability",percent:72,precision:"approximately",meetingDate:"2026-10-28"}
  },
  {
    currency:"AUD", bank:"RBA",
    kind:"Reported market pricing",
    published:"2026-10-15",
    headline:"Nearly 90% probability of holding",
    horizon:"November RBA decision",
    detail:"Reuters reported the market-implied probability of the RBA keeping the cash-rate target unchanged in November increased from about 66% to nearly 90% after weak Australian employment data.",
    source:"https://www.reuters.com/world/asia-pacific/australia-employment-slides-39300-september-jobless-47-2026-10-15/",
    value:{type:"hold_probability",percent:90,precision:"nearly",previousPercent:66,meetingDate:null}
  },
  {
    currency:"GBP", bank:"BoE",
    kind:"Economist survey — not a market price",
    published:"2026-10-15",
    headline:"Economists' November median call: 4.00%",
    horizon:"November 2026",
    detail:"A Reuters poll reported a majority of economists expected Bank Rate to increase to 4.00% in November. Survey forecasts must not be confused with derivatives-implied probabilities.",
    source:"https://www.reuters.com/world/uk/boe-raise-rates-4-november-economists-narrowly-expect-hold-there-2026-10-15/",
    value:{type:"economist_forecast",rate:4,month:"2026-11"}
  },
  {
    currency:"EUR", bank:"ECB",
    kind:"Reported market pricing",
    published:"2026-10-08",
    headline:"October policy hold was market-priced",
    horizon:"October 29 ECB decision",
    detail:"Reuters reported that October hold expectations among economists broadly matched market pricing. No exact meeting probability or comparable forward rate was provided in that report.",
    source:"https://www.reuters.com/business/ecb-hike-rates-again-december-inflation-almost-doubles-2-target-2026-10-08/",
    value:null
  },
  {
    currency:"NZD", bank:"RBNZ",
    kind:"Older bank research — not a current quote",
    published:"2026-09-01",
    headline:"Older report: roughly 3.0% OCR at year-end",
    horizon:"End of 2026",
    detail:"BNZ research published in September described market pricing near 3.0% by year-end. This observation may be stale after subsequent data; no October 15 pricing timestamp is available from the report.",
    source:"https://www.bnz.co.nz/institutional-banking/research/publications/outlook-for-borrowers",
    value:null
  },
  {
    currency:"JPY", bank:"BoJ",
    kind:"Policymaker commentary — not market pricing",
    published:"2026-10-15",
    headline:"BoJ official discussed timely rate adjustment",
    horizon:"October 29–30 BoJ meeting",
    detail:"Reuters reported a BoJ board member said rates should be adjusted in response to economic and price conditions. This does not supply a quantitative market-implied rate or hike probability.",
    source:"https://www.reuters.com/world/asia-pacific/boj-should-not-be-overly-cautious-raising-rates-board-member-koeda-says-2026-10-15/",
    value:null
  },
  {
    currency:"CAD", bank:"BoC",
    kind:"Official decision calendar — not market pricing",
    published:"2026-10-15",
    headline:"Next decision scheduled for October 28",
    horizon:"October 28 Bank of Canada",
    detail:"The official Bank of Canada rate calendar identifies the next scheduled rate decision. A sufficiently current derivatives-implied outcome probability is not yet supplied.",
    source:"https://www.bankofcanada.ca/core-functions/monetary-policy/key-interest-rate/",
    value:null
  },
  {
    currency:"CHF", bank:"SNB",
    kind:"Official policy guidance — not market pricing",
    published:"2026-09-24",
    headline:"SNB maintained a 0% policy rate",
    horizon:"September 24 SNB assessment",
    detail:"The SNB's September assessment held its policy rate at zero and discussed the inflation outlook. The statement is not itself a numerical market-pricing forecast.",
    source:"https://www.snb.ch/en/publications/communication/press-releases-restricted/pre_20260924",
    value:null
  }
];
export const repricingReports = [
  {
    id:"fed-cpi-2026-10-14",currency:"USD",date:"2026-10-14",
    title:"US CPI triggered an initial repricing of Fed hike odds",
    before:"Roughly 22% chance of October hike before CPI",
    after:"47.1% reported shortly after CPI",
    detail:"Reuters cited CME FedWatch following the inflation release. Later pricing moved again as Fed officials commented. These are two reported observations, not continuously tracked ticks.",
    source:"https://www.reuters.com/business/citi-turns-hawkish-fed-after-inflation-surprise-expects-december-rate-hike-2026-10-14/",
    type:"Dated market-pricing change"
  },
  {
    id:"rba-employment-2026-10-15",currency:"AUD",date:"2026-10-15",
    title:"Weak Australian jobs data raised the probability of an RBA hold",
    before:"About 66% probability of November hold before release",
    after:"Nearly 90% probability of November hold after release",
    detail:"Reuters reported the shift following September employment data. The values are approximate point-in-time reporting, not streaming futures-derived probabilities.",
    source:"https://www.reuters.com/world/asia-pacific/australia-employment-slides-39300-september-jobless-47-2026-10-15/",
    type:"Dated market-pricing change"
  }
];

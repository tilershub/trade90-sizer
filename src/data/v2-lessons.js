export const lessons = [
{
  "slug": "forex-fundamental-analysis",
  "title": "Forex Fundamental Analysis: A Two-Country Checklist",
  "description": "Compare interest rates, inflation, unemployment and GDP for a currency pair. Learn how to check release dates, distinguish growth measures and avoid misleading comparisons.",
  "sections": [
    {
      "heading": "Start with both sides of the currency pair",
      "paragraphs": [
        "Forex fundamental analysis examines the economic and policy conditions behind a currency. For a pair such as AUD/CHF, analyse Australia and Switzerland together: AUD is the base currency and CHF is the quote currency. A rise in AUD/CHF means one Australian dollar buys more Swiss francs. A positive Australian release alone does not establish which currency will outperform.",
        "Use a repeatable sequence: identify each central bank’s benchmark, compare inflation trends, check labour-market conditions, then compare real economic growth. Record the observation period and publication date for every figure. Distinguish what the data shows from what you think policymakers or markets might do next."
      ]
    },
    {
      "heading": "1. Compare policy rates and their definitions",
      "paragraphs": [
        "An interest-rate differential is the selected base-currency policy rate minus the selected quote-currency policy rate. In a hypothetical example, 4.00% minus 2.50% equals 1.50 percentage points, or 150 basis points. Reversing the pair reverses the sign.",
        "The underlying benchmarks are not always identical: one bank may publish a target range while another publishes a single deposit rate or cash-rate target. Read the definition before comparing. The current differential is not your broker’s swap rate, and it does not reveal the future path of either policy rate."
      ]
    },
    {
      "heading": "2. Read inflation as a trend, with the right period",
      "paragraphs": [
        "Headline CPI measures changes in a consumer price basket. A year-on-year reading compares prices with the same period a year earlier; a month-on-month reading compares adjacent months. Do not plot those two growth measures together as though they mean the same thing. Euro-area HICP also differs in coverage from national CPI measures.",
        "For example, inflation falling from 4% to 3% means prices are rising more slowly relative to a year earlier. It does not mean the overall price level fell. A change may reflect current prices, a change in the comparison period a year earlier, or both. Keep quarterly readings quarterly and check whether a series has been discontinued or rebased."
      ]
    },
    {
      "heading": "3. Check unemployment without mixing definitions",
      "paragraphs": [
        "The unemployment rate measures unemployed people as a share of the labour force under a particular statistical definition. It is not the share of the entire population without a job. Survey coverage, age groups and seasonal adjustment can differ across economies.",
        "Compare the latest available period for each country and inspect the direction over several observations. One economy may publish monthly data while another publishes quarterly data. A falling rate can coincide with changes in labour-force participation, so it is not a complete description of labour-market strength."
      ]
    },
    {
      "heading": "4. Compare real GDP growth on the same basis",
      "paragraphs": [
        "Real GDP adjusts economic output for price changes. For a cross-country growth comparison, distinguish quarter-on-quarter growth, year-on-year growth and annualised quarterly growth. A 0.5% quarterly increase is approximately 2.02% at an annualised pace: (1.005 to the fourth power minus 1) multiplied by 100. These describe the same hypothetical quarter using different conventions.",
        "Trade90’s comparison charts label quarterly growth without annualising it. Read the source notes for revisions and changes in geographical composition. Comparing a large economy’s GDP in dollars with a small economy’s GDP in dollars answers a different question from comparing their growth rates."
      ]
    },
    {
      "heading": "5. Separate the release from the market reaction",
      "paragraphs": [
        "The observation period, release date and retrieval date answer different questions. “August CPI” describes August prices; it may be released in September and downloaded later. A fresh download timestamp does not make an old observation current.",
        "Actual-versus-consensus surprises require a separately sourced consensus estimate. Historical charts alone cannot establish whether a release beat expectations, how traders were positioned or what is priced into interest-rate markets. Do not label a currency bullish or bearish solely because one chart rose or fell."
      ]
    },
    {
      "heading": "Turn the comparison into a research note",
      "paragraphs": [
        "Write a short note with four parts: the relative economic picture, the dated evidence supporting it, the next releases that could change it, and the information you still lack. For AUD/CHF, keep both the RBA and SNB policy context visible alongside both countries’ inflation, unemployment and GDP observations.",
        "Then keep risk sizing separate from the research view. A position-size calculation needs account currency, stop distance, contract size and conversion assumptions. The calculation is only as reliable as those inputs; neither a macroeconomic view nor a stop order guarantees an execution price or a profitable outcome."
      ]
    }
  ],
  "sources": [
    {
      "name": "OECD consumer prices methodology and data",
      "url": "https://data-explorer.oecd.org/vis?df[ag]=OECD.SDD.TPS&df[id]=DSD_PRICES@DF_PRICES_ALL"
    },
    {
      "name": "OECD real gross domestic product",
      "url": "https://www.oecd.org/en/data/indicators/real-gross-domestic-product-gdp.html"
    },
    {
      "name": "OECD Employment Database",
      "url": "https://www.oecd.org/en/data/datasets/oecd-employment-database.html"
    },
    {
      "name": "Federal Reserve monetary policy",
      "url": "https://www.federalreserve.gov/monetarypolicy.htm"
    }
  ]
},
  {
    slug:"what-is-interest-rate-divergence",
    title:"What Is Interest Rate Divergence in Forex?",
    description:"Learn how traders compare central-bank policy rates, calculate spreads and avoid mistaking a high-rate currency for a guaranteed profitable trade.",
    sections:[
      {heading:"What does rate divergence mean?",paragraphs:["Interest rate divergence refers to a difference between the monetary-policy rates set by two central banks. If one central bank sets a higher policy rate than another, its currency has a higher nominal policy-rate benchmark.","Central banks choose different policy benchmarks, so a simple comparison is a useful macroeconomic reference rather than an exact estimate of investable yields."]},
      {heading:"How do you calculate a rate gap?",paragraphs:["Subtract the quote currency's policy rate from the base currency's policy rate. Multiply the result in percentage points by 100 to express it in basis points.","For example, if the base benchmark is 4.00% and the quote benchmark is 2.50%, the signed difference is +150 basis points. If the quote has the higher rate instead, the signed result is negative. Trade90 ranks pairs by the absolute size of the gap while preserving the base-minus-quote sign."]},
      {heading:"Why does the difference matter?",paragraphs:["Relative interest rates can affect funding costs, investor allocations and the incentives behind some currency carry strategies. Currency prices, however, respond to expectations about future policy, inflation, growth and risk appetite as well as current rates.","A gap can remain unchanged for weeks between policy decisions even while the market's view of future rates changes substantially. That is why current gaps and expected gaps should be analyzed separately."]},
      {heading:"What the gap does not tell you",paragraphs:["It is not a broker's overnight swap rate. Funding spreads, margin, roll conventions and product terms affect realized financing charges. It also is not a forward FX quote or a probability that a currency will rise.","A large positive gap may be offset by an adverse exchange-rate move. Use the rate comparison as context, not an automatic buy or sell signal."]}
    ],
    sources:[{name:"Federal Reserve monetary policy",url:"https://www.federalreserve.gov/monetarypolicy.htm"},{name:"ECB key interest rates",url:"https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html"}]
  },
  {
    slug:"expected-rate-gaps",
    title:"How Markets Price Expected Interest Rate Gaps",
    description:"Understand market-implied rate expectations, policy-rate futures, OIS markets and why forward divergence can change before central banks make decisions.",
    sections:[
      {heading:"Current policy is not the whole story",paragraphs:["Today's official rate gap uses two already-announced central-bank benchmarks. The expected gap asks what those two benchmarks may be at a future horizon, based on appropriate market pricing rather than unsupported predictions.","The distinction matters because exchange rates often adjust to new information about future decisions long before any central bank changes its policy rate."]},
      {heading:"Where do market expectations come from?",paragraphs:["Market participants trade instruments whose prices are linked to future short-term interest rates, including overnight-indexed swaps and certain short-term interest-rate futures. Those prices may be transformed into an implied forward rate path using instrument-specific conventions.","That is not identical to a published central-bank forecast. A market-implied path can also contain term premiums, liquidity effects, convexity and other technical factors."]},
      {heading:"Calculating a projected divergence",paragraphs:["First estimate both central banks' comparable policy-rate levels for a shared horizon and observation time. Then calculate the signed base-minus-quote difference and compare it with the current signed policy-rate spread.","For example, a hypothetical +150 bp gap that moves to +100 bp is narrowing by 50 bp. If a gap crosses zero, the leadership of the higher-rate currency reverses. A projected widening or narrowing is not by itself a currency price forecast."]},
      {heading:"How to read Trade90's expected gaps",paragraphs:["Trade90 will display the 3-, 6- and 12-month projected values only after a suitably licensed and validated market source is available for both currencies. Every forecast must carry a pricing timestamp, data source and methodology.","If the necessary data cannot be verified, the expected value stays unavailable rather than being filled in by a language model or an analyst's guess."]}
    ],
    sources:[{name:"New York Fed reference rates",url:"https://www.newyorkfed.org/markets/reference-rates"},{name:"CME Group interest rates education",url:"https://www.cmegroup.com/education.html"}]
  },
  {
    slug:"high-interest-rates-currency-strength",
    title:"Do Higher Interest Rates Mean a Stronger Currency?",
    description:"Understand why a higher policy rate does not guarantee exchange-rate appreciation, and distinguish monetary-policy comparisons from realized carry returns.",
    sections:[
      {heading:"Higher rates are not a guaranteed buy signal",paragraphs:["A higher interest rate may attract capital, but the effect on currencies depends on why rates are high and how the outlook differs from market expectations. Inflation, political risks, economic activity and risk appetite all matter.","If an expected rate increase is already priced, the announcement itself may not strengthen the currency. Surprises relative to expectations frequently matter more than the rate level alone."]},
      {heading:"Nominal rate spreads versus real returns",paragraphs:["The difference between two policy rates is only a nominal benchmark. Inflation differences influence real purchasing power, while transaction costs, derivatives pricing, rollover fees and exchange-rate moves influence an investor's actual returns.","Holding a higher-yielding currency against a lower-yielding currency can lose money when the higher-yielding currency depreciates. Leveraged trades can amplify both gains and losses."]},
      {heading:"Rate convergence and rate divergence",paragraphs:["When a previously higher-rate central bank is expected to cut while the other is expected to hold or hike, the future gap can narrow even before the official gap changes.","A trader can use that shifting outlook to structure research questions: which decisions are expected, what new data could change them, and has the exchange rate already adjusted? It still does not determine a suitable entry, stop or direction."]},
      {heading:"Use policy gaps as context",paragraphs:["Start with the current rates, examine expected changes from verifiable market prices, check the latest bank communications and identify relevant data releases. Then assess whether the resulting uncertainty fits your risk limits.","Trade90 is intended to make those comparisons transparent. It does not certify trade profitability or provide investment advice."]}
    ],
    sources:[{name:"BIS research and publications",url:"https://www.bis.org/publ/"},{name:"Bank of England: interest rates",url:"https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate/"}]
  }
];
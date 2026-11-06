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
    ],
    "updated": "2026-11-06",
    "answer": "Forex fundamental analysis compares the economic and policy conditions on both sides of a currency pair. Begin with benchmark rates, then check dated inflation, employment and growth evidence before forming a conditional view.",
    "relatedPairs": [
      "eur-usd",
      "aud-usd"
    ],
    "related": [
      "what-is-interest-rate-divergence",
      "central-bank-policy-divergence-checklist"
    ]
  },
  {
    "slug": "what-is-interest-rate-divergence",
    "title": "What Is Interest Rate Divergence in Forex?",
    "description": "Learn how traders compare central-bank policy rates, calculate spreads and avoid mistaking a high-rate currency for a guaranteed profitable trade.",
    "sections": [
      {
        "heading": "What does rate divergence mean?",
        "paragraphs": [
          "Interest rate divergence refers to a difference between the monetary-policy rates set by two central banks. If one central bank sets a higher policy rate than another, its currency has a higher nominal policy-rate benchmark.",
          "Central banks choose different policy benchmarks, so a simple comparison is a useful macroeconomic reference rather than an exact estimate of investable yields."
        ]
      },
      {
        "heading": "How do you calculate a rate gap?",
        "paragraphs": [
          "Subtract the quote currency's policy rate from the base currency's policy rate. Multiply the result in percentage points by 100 to express it in basis points.",
          "For example, if the base benchmark is 4.00% and the quote benchmark is 2.50%, the signed difference is +150 basis points. If the quote has the higher rate instead, the signed result is negative. Trade90 ranks pairs by the absolute size of the gap while preserving the base-minus-quote sign."
        ]
      },
      {
        "heading": "Why does the difference matter?",
        "paragraphs": [
          "Relative interest rates can affect funding costs, investor allocations and the incentives behind some currency carry strategies. Currency prices, however, respond to expectations about future policy, inflation, growth and risk appetite as well as current rates.",
          "A gap can remain unchanged for weeks between policy decisions even while the market's view of future rates changes substantially. That is why current gaps and expected gaps should be analyzed separately."
        ]
      },
      {
        "heading": "What the gap does not tell you",
        "paragraphs": [
          "It is not a broker's overnight swap rate. Funding spreads, margin, roll conventions and product terms affect realized financing charges. It also is not a forward FX quote or a probability that a currency will rise.",
          "A large positive gap may be offset by an adverse exchange-rate move. Use the rate comparison as context, not an automatic buy or sell signal."
        ]
      },
      {
        "heading": "What is a signed interest rate gap in forex?",
        "paragraphs": [
          "A signed gap preserves currency order: base policy rate minus quote policy rate. A negative EUR/USD gap means the US benchmark exceeds the euro-area benchmark; it does not by itself forecast a fall in EUR/USD.",
          "For a hypothetical change from −150 to −100 basis points, the signed spread rises by 50 basis points while the absolute gap narrows by 50. Record both the sign and the absolute magnitude when describing divergence."
        ]
      }
    ],
    "sources": [
      {
        "name": "Federal Reserve monetary policy",
        "url": "https://www.federalreserve.gov/monetarypolicy.htm"
      },
      {
        "name": "ECB key interest rates",
        "url": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html"
      }
    ],
    "updated": "2026-11-06",
    "answer": "An interest rate differential is the base currency’s selected policy rate minus the quote currency’s rate. Divergence describes a difference or separation in policy paths; the signed spread and the absolute gap must be distinguished.",
    "relatedPairs": [
      "eur-usd",
      "aud-usd"
    ],
    "related": [
      "central-bank-policy-divergence-checklist"
    ]
  },
  {
    "slug": "expected-rate-gaps",
    "title": "Policy Scenarios vs Market-Implied Interest Rate Expectations",
    "description": "Distinguish published policy rates, conditional macro scenarios and market-implied pricing. Understand what Trade90’s 90-day outlook measures.",
    "sections": [
      {
        "heading": "Current policy is not the whole story",
        "paragraphs": [
          "Today's official rate gap uses two already-announced central-bank benchmarks. The expected gap asks what those two benchmarks may be at a future horizon, based on appropriate market pricing rather than unsupported predictions.",
          "The distinction matters because exchange rates often adjust to new information about future decisions long before any central bank changes its policy rate."
        ]
      },
      {
        "heading": "Where do market expectations come from?",
        "paragraphs": [
          "Market participants trade instruments whose prices are linked to future short-term interest rates, including overnight-indexed swaps and certain short-term interest-rate futures. Those prices may be transformed into an implied forward rate path using instrument-specific conventions.",
          "That is not identical to a published central-bank forecast. A market-implied path can also contain term premiums, liquidity effects, convexity and other technical factors."
        ]
      },
      {
        "heading": "Calculating a projected divergence",
        "paragraphs": [
          "First estimate both central banks' comparable policy-rate levels for a shared horizon and observation time. Then calculate the signed base-minus-quote difference and compare it with the current signed policy-rate spread.",
          "For example, a hypothetical +150 bp gap that moves to +100 bp is narrowing by 50 bp. If a gap crosses zero, the leadership of the higher-rate currency reverses. A projected widening or narrowing is not by itself a currency price forecast.",
          "Always state whether widening refers to the absolute distance between rates or a rise in the signed base-minus-quote spread. For a negative gap, these move in opposite directions."
        ]
      },
      {
        "heading": "What does Trade90’s 90-day outlook measure?",
        "paragraphs": [
          "Trade90 uses macroeconomic observations and central-bank evidence to form conditional 90-day widening, narrowing or uncertain assessments. It does not publish a market-implied forward-rate assessment or require a licensed forward-pricing feed for this model.",
          "A macro score is neither an implied policy rate nor a probability of a rate decision. Check the evidence tier, dated inputs and counterevidence on each pair page. Missing or contradictory evidence can justify an uncertain result; it is not a reason to invent a directional forecast."
        ]
      }
    ],
    "sources": [
      {
        "name": "New York Fed reference rates",
        "url": "https://www.newyorkfed.org/markets/reference-rates"
      },
      {
        "name": "CME Group interest rates education",
        "url": "https://www.cmegroup.com/education.html"
      }
    ],
    "updated": "2026-11-06",
    "answer": "A published rate gap measures existing policy benchmarks. A macro scenario is conditional research based on economic and central-bank evidence; a market-implied rate path is a separate calculation from financial-market instruments.",
    "relatedPairs": [
      "eur-usd",
      "aud-usd"
    ],
    "related": [
      "what-is-interest-rate-divergence",
      "central-bank-policy-divergence-checklist"
    ]
  },
  {
    "slug": "high-interest-rates-currency-strength",
    "title": "Do Higher Interest Rates Mean a Stronger Currency?",
    "description": "Understand why a higher policy rate does not guarantee exchange-rate appreciation, and distinguish monetary-policy comparisons from realized carry returns.",
    "sections": [
      {
        "heading": "Higher rates are not a guaranteed buy signal",
        "paragraphs": [
          "A higher interest rate may attract capital, but the effect on currencies depends on why rates are high and how the outlook differs from market expectations. Inflation, political risks, economic activity and risk appetite all matter.",
          "If an expected rate increase is already priced, the announcement itself may not strengthen the currency. Surprises relative to expectations frequently matter more than the rate level alone."
        ]
      },
      {
        "heading": "Nominal rate spreads versus real returns",
        "paragraphs": [
          "The difference between two policy rates is only a nominal benchmark. Inflation differences influence real purchasing power, while transaction costs, derivatives pricing, rollover fees and exchange-rate moves influence an investor's actual returns.",
          "Holding a higher-yielding currency against a lower-yielding currency can lose money when the higher-yielding currency depreciates. Leveraged trades can amplify both gains and losses."
        ]
      },
      {
        "heading": "Rate convergence and rate divergence",
        "paragraphs": [
          "When a previously higher-rate central bank is expected to cut while the other is expected to hold or hike, the future gap can narrow even before the official gap changes.",
          "A trader can use that shifting outlook to structure research questions: which decisions are expected, what new data could change them, and has the exchange rate already adjusted? It still does not determine a suitable entry, stop or direction."
        ]
      },
      {
        "heading": "Use policy gaps as context",
        "paragraphs": [
          "Start with the current rates, examine expected changes from verifiable market prices, check the latest bank communications and identify relevant data releases. Then assess whether the resulting uncertainty fits your risk limits.",
          "Trade90 is intended to make those comparisons transparent. It does not certify trade profitability or provide investment advice."
        ]
      }
    ],
    "sources": [
      {
        "name": "BIS research and publications",
        "url": "https://www.bis.org/publications/research"
      },
      {
        "name": "Bank of England: interest rates",
        "url": "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
      }
    ],
    "updated": "2026-11-06",
    "answer": "No. A higher policy rate does not guarantee a stronger currency or a profitable carry trade. Exchange-rate changes, expectations, inflation, risk and financing costs can outweigh the nominal rate advantage.",
    "relatedPairs": [
      "eur-usd",
      "aud-usd"
    ],
    "related": [
      "what-is-interest-rate-divergence",
      "central-bank-policy-divergence-checklist"
    ]
  },
  {
    "slug": "central-bank-policy-divergence-checklist",
    "title": "Central Bank Policy Divergence: A Research Checklist",
    "description": "A repeatable framework for comparing policy decisions, macro evidence and competing scenarios across a forex pair.",
    "sections": [
      {
        "heading": "How do you analyse central bank policy divergence?",
        "paragraphs": [
          "Compare the two banks’ current benchmarks, the dated evidence that might change each policy stance, and the next decisions that could test your view. Separate a conditional research scenario from a trade entry or a market-implied forecast.",
          "The aim is a note you can revise when evidence changes. Start with a single pair and a shared horizon, rather than selecting whichever indicator supports a preferred direction."
        ]
      },
      {
        "heading": "1. Record the starting gap",
        "paragraphs": [
          "Write down the base and quote currencies, benchmark definitions and effective dates. Calculate the signed gap and its absolute size before describing a possible widening or narrowing.",
          "Hypothetical EUR/CAD example: EUR at 3.00% and CAD at 2.50% gives +50 basis points. If EUR falls to 2.75% while CAD stays unchanged, the gap becomes +25 basis points. This is a scenario calculation, not a forecast or a statement of current rates."
        ]
      },
      {
        "heading": "2. Build two evidence columns",
        "paragraphs": [
          "For each economy, record the latest inflation, employment and growth observations alongside the central bank’s own statement. Keep release dates separate from observation periods so an old quarter is not mistaken for fresh news.",
          "Use equivalent measures where possible. If data frequency or definitions differ, state the limitation. Include a contrary observation: for example, easing inflation may support a lower-rate scenario while resilient employment argues against rapid easing."
        ]
      },
      {
        "heading": "3. Define what would change your view",
        "paragraphs": [
          "Specify the next evidence that could strengthen or invalidate the scenario. “Narrowing if base-country inflation eases and the quote bank maintains its stance” is testable; “the pair must rise” is not a policy research conclusion.",
          "A decision can leave rates unchanged but alter the stated conditions for future action. Compare the new statement with its predecessor before describing a shift. Do not turn an automated source check into a claim of expert review."
        ]
      },
      {
        "heading": "4. Keep a decision log",
        "paragraphs": [
          "Save the initial gap, supporting evidence, counterevidence, next release and revision date. After the release, record what actually changed and whether the original scenario still applies.",
          "A useful note has five fields: question; dated evidence; conditional conclusion; invalidation condition; next check. The 28-pair dashboard helps locate comparisons; the pair page provides the detail needed to write this note."
        ]
      },
      {
        "heading": "Can this become a trading strategy?",
        "paragraphs": [
          "A policy hypothesis alone is not a complete trading strategy. Entry, exit, sizing, execution costs and an independently tested risk process are separate requirements.",
          "Unexpected events and exchange-rate moves can overwhelm a rate advantage. Evaluate a strategy across different conditions before attributing any result to the policy gap alone."
        ]
      }
    ],
    "sources": [
      {
        "name": "Federal Reserve monetary policy and FOMC publications",
        "url": "https://www.federalreserve.gov/monetarypolicy.htm"
      },
      {
        "name": "ECB monetary policy strategy",
        "url": "https://www.ecb.europa.eu/mopo/strategy/html/index.en.html"
      }
    ],
    "relatedPairs": [
      "eur-cad",
      "gbp-jpy"
    ],
    "related": [
      "what-is-interest-rate-divergence",
      "forex-fundamental-analysis",
      "expected-rate-gaps"
    ],
    "updated": "2026-11-06",
    "answer": "Compare the two banks’ current benchmarks, the dated evidence that might change each policy stance, and the next decisions that could test your view. Separate a conditional research scenario from a trade entry or a market-implied forecast."
  },
  {
    "slug": "yield-curves-and-currency-trends",
    "title": "Yield Curves and Currency Trends: What to Compare",
    "description": "Learn the difference between a yield-curve slope and a cross-country yield differential, with worked examples and limits for FX research.",
    "sections": [
      {
        "heading": "Can yield curves predict currency trends?",
        "paragraphs": [
          "A yield curve summarises government bond yields across maturities. Its shape can inform research about financing conditions, but it is not a standalone currency-direction signal.",
          "For FX, distinguish a slope within one economy from a yield difference between two economies. The policy-rate gap is a third measure: it compares central-bank benchmarks rather than bond yields."
        ]
      },
      {
        "heading": "How do you calculate a curve slope?",
        "paragraphs": [
          "A 10-year minus 2-year slope subtracts the 2-year yield from the 10-year yield in the same economy. Hypothetical yields of 4.10% and 4.40% produce −0.30 percentage points, or −30 basis points.",
          "Use the same observation date and a consistent series definition. A missing maturity is unavailable, not zero. Record whether yields are fitted estimates or observations from specific bonds."
        ]
      },
      {
        "heading": "How does a cross-country differential differ?",
        "paragraphs": [
          "A cross-country differential compares matching maturities across economies. If hypothetical US and Japanese 2-year yields are 4.00% and 1.00%, the US-minus-Japan differential is +300 basis points.",
          "A USD/JPY policy gap, a 2-year yield differential and the US curve slope answer different questions. Avoid substituting one for another or combining observations from different dates without a visible qualification."
        ]
      },
      {
        "heading": "Why can the curve steepen for different reasons?",
        "paragraphs": [
          "A curve steepens when the long-minus-short spread increases. This may happen because short yields fall, long yields rise, or both change at different speeds.",
          "Hypothetical example A: the 2-year falls from 4.40% to 4.00% while the 10-year stays at 4.10%; the slope moves from −30 to +10 basis points. Example B: the 10-year rises to 4.50% while the 2-year stays at 4.40%; the slope also becomes +10. The same final slope hides different underlying moves."
        ]
      },
      {
        "heading": "How should you use the comparison?",
        "paragraphs": [
          "Check each maturity’s change, the observation date and the matching policy commentary before forming a currency hypothesis. Bond yields reflect more than an expected policy path, including compensation for holding longer maturities.",
          "Write the explanation as a hypothesis to investigate, not proof of causality. In Trade90, consult Yield Curve Intelligence for available dated curves, then return to the pair’s policy and macro evidence. Never read an unavailable series as a neutral signal."
        ]
      }
    ],
    "sources": [
      {
        "name": "RBA: Bonds and the yield curve",
        "url": "https://www.rba.gov.au/education/resources/explainers/bonds-and-the-yield-curve.html"
      }
    ],
    "relatedPairs": [
      "usd-jpy",
      "gbp-jpy"
    ],
    "related": [
      "expected-rate-gaps",
      "central-bank-policy-divergence-checklist"
    ],
    "updated": "2026-11-06",
    "answer": "A yield curve summarises government bond yields across maturities. Its shape can inform research about financing conditions, but it is not a standalone currency-direction signal."
  },
  {
    "slug": "fed-vs-ecb-policy-divergence",
    "title": "Fed vs ECB Policy Stance: How to Research EUR/USD",
    "description": "Compare Fed and ECB benchmarks, calculate the signed EUR/USD rate gap and build conditional policy scenarios without confusing them with currency forecasts.",
    "sections": [
      {
        "heading": "How do you compare the Fed and ECB?",
        "paragraphs": [
          "Compare their selected policy benchmarks and effective dates, then examine each bank’s policy statement and economic evidence. For EUR/USD, subtract the US benchmark from the euro-area benchmark because EUR is the base currency.",
          "Use the EUR/USD research page for the latest recorded rates and their sources. This guide uses hypothetical numbers so its examples are not mistaken for a current policy decision."
        ]
      },
      {
        "heading": "Which policy rates belong in the calculation?",
        "paragraphs": [
          "The Fed publishes a target range for the federal funds rate; Trade90 uses its midpoint for the comparison. The ECB publishes several key rates; the selected euro-area benchmark on Trade90 is the deposit facility rate.",
          "These are different instruments, so the result is a transparent comparison convention rather than an investable yield. A comparison should show the original range and benchmark labels as well as the calculated spread."
        ]
      },
      {
        "heading": "Worked example: EUR/USD versus USD/EUR",
        "paragraphs": [
          "With a hypothetical ECB deposit rate of 2.50% and a Fed range of 3.75%–4.00%, the Fed midpoint is 3.875%. EUR/USD’s signed gap is (2.50 − 3.875) × 100 = −137.5 basis points.",
          "Reversing currency order gives +137.5 basis points for USD/EUR. The absolute distance remains 137.5 basis points. A headline about a USD–EUR gap must identify its convention before it can be compared with an EUR/USD page."
        ]
      },
      {
        "heading": "Compare policy objectives and evidence",
        "paragraphs": [
          "The Fed’s policy framework includes employment and price stability objectives, while the ECB aims for 2% inflation over the medium term. Read each bank’s own framework rather than assuming identical responses to a single inflation number.",
          "Build a dated comparison of inflation, labour-market conditions and growth. Identify which observation is new since each bank’s last meeting and whether the bank itself changed its assessment."
        ]
      },
      {
        "heading": "What would narrowing look like?",
        "paragraphs": [
          "In the hypothetical example above, a 25-basis-point Fed cut with the ECB unchanged would move EUR/USD’s gap from −137.5 to −112.5 basis points. The signed spread rises while its absolute size narrows.",
          "An ECB cut of the same size with the Fed unchanged would instead move the gap to −162.5 basis points, widening the absolute difference. Neither calculation establishes how much of the decision was anticipated or which way EUR/USD will move."
        ]
      },
      {
        "heading": "What should your next research step be?",
        "paragraphs": [
          "Open both banks’ latest source publications and note the next scheduled decisions. Separate a confirmed rate action, a conditional macro scenario and an unknown market expectation in your notes.",
          "The EUR/USD pair page connects those observations. Use the wider 28-pair dashboard to compare alternatives, while keeping evidence quality and missing inputs visible."
        ]
      }
    ],
    "sources": [
      {
        "name": "Federal Reserve monetary policy and FOMC publications",
        "url": "https://www.federalreserve.gov/monetarypolicy.htm"
      },
      {
        "name": "ECB monetary policy strategy",
        "url": "https://www.ecb.europa.eu/mopo/strategy/html/index.en.html"
      },
      {
        "name": "ECB key interest rates",
        "url": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html"
      }
    ],
    "relatedPairs": [
      "eur-usd"
    ],
    "related": [
      "what-is-interest-rate-divergence",
      "expected-rate-gaps",
      "forex-fundamental-analysis"
    ],
    "updated": "2026-11-06",
    "answer": "Compare their selected policy benchmarks and effective dates, then examine each bank’s policy statement and economic evidence. For EUR/USD, subtract the US benchmark from the euro-area benchmark because EUR is the base currency."
  }
];

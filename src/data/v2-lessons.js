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
  },
  {
    "slug": "forex-carry-trade-explained",
    "title": "What Is a Carry Trade in Forex? Returns, Risks and Rate Gaps",
    "description": "A carry trade earns the interest-rate gap between two currencies but carries exchange-rate risk. Learn how carry works, what swap rates change and why carry trades unwind.",
    "answer": "A forex carry trade means holding a higher-interest-rate currency funded by a lower-interest-rate currency to earn the rate gap. The interest is small and steady; the exchange-rate risk is large and sudden, so a carry trade can lose far more from a currency move than it earns in interest.",
    "sections": [
      {
        "heading": "What is a carry trade in forex?",
        "paragraphs": [
          "A carry trade is a position that is long a currency with a higher interest rate and short a currency with a lower interest rate. The trader aims to collect the difference between the two rates for as long as the position is held. The low-rate currency is called the funding currency and the high-rate currency is called the target or investment currency.",
          "In a hypothetical example, if one currency has a policy rate of 4.00% and another has a policy rate of 0.50%, the policy-rate gap is 3.50 percentage points, or 350 basis points. That gap is the starting point for carry, not the amount a retail trader actually receives."
        ]
      },
      {
        "heading": "How the return on a carry trade is built",
        "paragraphs": [
          "The total return has two parts: the interest earned from the rate gap and the change in the exchange rate. The interest part accrues slowly, day by day. The exchange-rate part can move by more in a single session than the interest earns in several months.",
          "With leverage, both parts are multiplied. A position leveraged ten times earns ten times the interest on the trader’s own capital, but a 2% adverse currency move becomes a 20% loss on that capital. Carry is therefore a risk-taking strategy that is paid a small premium, not a low-risk income stream."
        ]
      },
      {
        "heading": "Why retail carry is smaller than the policy-rate gap",
        "paragraphs": [
          "Retail forex positions held overnight are charged or credited a swap, also called rollover. Swap rates are derived from short-term money-market rates and forward pricing, and brokers add their own markup. The credit on the long high-rate side is usually smaller than the headline policy-rate gap, and the charge on the opposite side is usually larger.",
          "It is possible for both the long and the short swap on a pair to be negative. Always read the broker’s contract specification for the current long and short swap before assuming a position earns interest. Because spot forex settles two business days after the trade, many brokers apply a triple rollover midweek to cover the weekend."
        ]
      },
      {
        "heading": "Why do carry trades unwind suddenly?",
        "paragraphs": [
          "Carry trades tend to be crowded: many participants hold the same high-rate currencies against the same funding currencies. When risk appetite falls, or when the funding-currency central bank signals higher rates, traders close positions at the same time. The high-rate currency falls and the funding currency rises, which forces further closures.",
          "The pattern is often described as gains that build gradually and losses that arrive quickly. A period of low volatility can make carry look safe until the unwind begins, which is why position size and a defined exit matter more in carry than the size of the rate gap."
        ]
      },
      {
        "heading": "Does a wider interest-rate gap make a carry trade safer?",
        "paragraphs": [
          "No. A wider gap increases the interest earned, but it does not reduce exchange-rate risk. Very high interest rates frequently exist because inflation is high or because investors demand compensation for currency or political risk. Economic theory, through uncovered interest parity, suggests that a higher-rate currency should on average depreciate by enough to offset its rate advantage. In practice that relationship is unreliable over short periods, which is why carry sometimes pays and sometimes fails badly.",
          "What matters for the future of a carry trade is how the gap is expected to change. A gap that is narrowing because the high-rate central bank is cutting, or because the funding-currency central bank is tightening, removes the reason for holding the position."
        ]
      },
      {
        "heading": "A research checklist before considering carry",
        "paragraphs": [
          "Identify the policy benchmark and its effective date for both currencies. Calculate the signed gap in basis points. Check whether each central bank’s recent guidance points towards a wider or narrower gap. Compare inflation in both economies, because a high nominal rate with higher inflation may offer no real advantage. Finally, read your broker’s actual long and short swap, your margin requirement and the pair’s recent daily range.",
          "TRADE90 publishes the policy-rate gap and a conditional 90-day policy outlook for 28 pairs. These are research inputs. They are not swap quotes, forecasts of exchange rates or recommendations to hold a position."
        ]
      }
    ],
    "sources": [
      {
        "name": "BIS research and publications",
        "url": "https://www.bis.org/publications/research"
      },
      {
        "name": "New York Fed reference rates",
        "url": "https://www.newyorkfed.org/markets/reference-rates"
      },
      {
        "name": "Federal Reserve monetary policy and FOMC publications",
        "url": "https://www.federalreserve.gov/monetarypolicy.htm"
      },
      {
        "name": "ECB key interest rates",
        "url": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html"
      }
    ],
    "relatedPairs": [
      "aud-jpy",
      "nzd-jpy",
      "usd-jpy",
      "usd-chf"
    ],
    "related": [
      "what-is-interest-rate-divergence",
      "high-interest-rates-currency-strength",
      "forex-swap-rates-vs-central-bank-rates"
    ],
    "updated": "2026-11-13"
  },
  {
    "slug": "how-interest-rates-affect-forex",
    "title": "How Do Interest Rates Affect Forex? A Trader’s Guide",
    "description": "Interest rates move currencies mainly through expectations. Learn the mechanism, why priced-in decisions can disappoint and which rate measures forex traders compare.",
    "answer": "Interest rates affect forex because they change the return on holding a currency. Markets move mainly when the expected path of rates changes, not when an already-expected decision is announced. A rate rise that was fully anticipated can leave a currency unchanged or even weaker.",
    "sections": [
      {
        "heading": "How do interest rates affect exchange rates?",
        "paragraphs": [
          "A currency’s interest rate is the return available on short-term deposits and bonds in that currency. When a country’s rates rise relative to another’s, assets in that currency become more attractive to hold, which can increase demand for the currency. When its rates fall relative to another’s, the opposite pressure applies.",
          "The important word is relative. A forex pair always compares two economies, so a central bank raising rates does not automatically strengthen its currency if the other central bank is raising rates faster."
        ]
      },
      {
        "heading": "Expectations matter more than the decision",
        "paragraphs": [
          "Exchange rates respond to new information. Traders and investors form a view of each central bank’s future rate path well before a meeting, and that view is reflected in prices. If a central bank delivers exactly what was expected, there is little new information and the reaction is often small.",
          "The largest moves usually follow a surprise: a decision that differs from expectations, or guidance that changes how many further rises or cuts are expected. This is why a currency can fall after a rate increase when the accompanying statement suggests the increases are finished."
        ]
      },
      {
        "heading": "Policy rates, market rates and bond yields",
        "paragraphs": [
          "The policy rate is the benchmark a central bank sets or targets, such as the federal funds target range or the ECB deposit facility rate. Market rates, including overnight reference rates and interest-rate futures, show where traders expect policy to go. Government bond yields reflect expected policy over longer periods plus compensation for risk.",
          "Forex traders commonly compare two-year government yields between two economies because that maturity is sensitive to the expected policy path over the next couple of years. The current policy-rate gap describes today; yield gaps describe what the market expects."
        ]
      },
      {
        "heading": "Why inflation changes the picture",
        "paragraphs": [
          "A nominal interest rate does not show how much purchasing power a holder gains. If a currency pays 5% while its inflation runs at 6%, the real return is negative. Central banks also raise rates because inflation is high, so a high rate can be a sign of a problem as well as an attraction.",
          "Comparing rates alongside inflation, unemployment and growth gives a more complete view of whether a central bank is likely to tighten, hold or ease from here."
        ]
      },
      {
        "heading": "Why can a currency fall after a rate hike?",
        "paragraphs": [
          "There are three common reasons. First, the increase was already priced in, so traders who bought in anticipation take profit. Second, the statement or press conference signalled fewer future increases than expected, sometimes called a dovish hike. Third, the increase raised concern about economic growth or financial stability, reducing demand for the currency’s assets.",
          "The reverse also happens: a currency can rise after a cut if the central bank signals that the cut is not the start of a longer easing cycle."
        ]
      },
      {
        "heading": "Is the interest-rate differential enough to predict a currency?",
        "paragraphs": [
          "No. The differential is one input. Trade flows, government finances, political events, commodity prices and global risk appetite also move exchange rates, and they can dominate for long periods. Safe-haven currencies can strengthen during market stress even when their interest rates are low.",
          "Use the differential to frame research questions: is the gap widening or narrowing, why, and is that change already expected? TRADE90’s pair pages show the current policy-rate gap and the evidence for each central bank so the two sides can be compared on the same basis."
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
        "name": "Bank of England: interest rates",
        "url": "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
      },
      {
        "name": "RBA education explainers",
        "url": "https://www.rba.gov.au/education/resources/explainers/"
      },
      {
        "name": "BIS research and publications",
        "url": "https://www.bis.org/publications/research"
      }
    ],
    "relatedPairs": [
      "eur-usd",
      "gbp-usd",
      "usd-jpy",
      "aud-usd"
    ],
    "related": [
      "high-interest-rates-currency-strength",
      "what-is-interest-rate-divergence",
      "real-interest-rates-forex",
      "hawkish-vs-dovish-central-banks"
    ],
    "updated": "2026-11-13"
  },
  {
    "slug": "forex-swap-rates-vs-central-bank-rates",
    "title": "Forex Swap Rates vs Central Bank Rates: Why Your Rollover Differs",
    "description": "Broker swap (rollover) rates are not the central bank rate gap. Learn how swaps are calculated, why both sides can be negative and what triple-swap day means.",
    "answer": "A forex swap, or rollover, is the daily interest adjustment on a position held overnight. It is based on short-term market rates for the two currencies plus your broker’s markup, not directly on central bank policy rates. That is why your swap is usually less favourable than the policy-rate gap and can be negative in both directions.",
    "sections": [
      {
        "heading": "What is a swap rate in forex?",
        "paragraphs": [
          "When a spot forex position is held past the broker’s daily cut-off, it is rolled to the next value date. The rollover involves an interest adjustment: in principle you earn interest on the currency you are long and pay interest on the currency you are short. The net amount credited to or debited from the account is the swap.",
          "Brokers quote swaps per lot, in points or in account currency, with a separate value for long and short positions. The values change as market interest rates change and can be revised at any time."
        ]
      },
      {
        "heading": "How swap rates are derived",
        "paragraphs": [
          "Wholesale rollover pricing comes from the forward market, where the cost of moving a position by one day is expressed in forward points. Those points reflect the difference between short-term money-market rates in the two currencies, which usually sit close to, but not exactly at, the central bank policy rates.",
          "A retail broker then applies its own adjustment. The result is that the credit on the favourable side is reduced and the charge on the unfavourable side is increased. Two brokers can quote noticeably different swaps on the same pair on the same day."
        ]
      },
      {
        "heading": "Why is my swap negative on both long and short?",
        "paragraphs": [
          "When the interest-rate gap between two currencies is small, the broker’s markup can be larger than the gap itself. The favourable side then becomes a charge as well, so both long and short positions pay. This is common on pairs where the two policy rates are close together.",
          "It also happens on instruments where the broker applies a financing charge on the full position value regardless of direction. The contract specification is the only reliable place to check."
        ]
      },
      {
        "heading": "Triple-swap day and holidays",
        "paragraphs": [
          "Spot forex normally settles two business days after the trade date. A position rolled on Wednesday moves its value date from Friday to Monday, which covers three calendar days, so many brokers apply three days of swap on Wednesday. Some instruments and some brokers use a different day.",
          "Public holidays in either currency’s home market can add further days to a single rollover. A position that looks inexpensive to hold on a normal night can cost several times more around holidays."
        ]
      },
      {
        "heading": "Policy rate, market rate and swap compared",
        "paragraphs": [
          "The policy rate is set or targeted by the central bank and changes only at policy decisions. Short-term market rates are set by trading and move daily with expectations. The broker swap is a retail price built on market rates with a markup. Each step moves further from the published central bank figure.",
          "TRADE90 publishes policy-rate gaps because they are official, dated and comparable across 28 pairs. They show the direction and approximate size of the interest advantage between two currencies. They do not tell you what your broker will credit or charge."
        ]
      },
      {
        "heading": "Can I estimate my swap from the policy-rate gap?",
        "paragraphs": [
          "Only roughly. The sign of the policy-rate gap usually indicates which direction is more likely to earn a credit, and a wider gap usually means a larger credit on that side. The exact amount depends on market rates, the broker’s markup, the position size and the number of days in the rollover.",
          "Before holding a position for more than a few days, check the current long and short swap in your trading platform and multiply by the number of nights, including the triple-swap day. Islamic or swap-free accounts replace swaps with other fees, which should be compared on the same basis."
        ]
      }
    ],
    "sources": [
      {
        "name": "New York Fed reference rates",
        "url": "https://www.newyorkfed.org/markets/reference-rates"
      },
      {
        "name": "BIS research and publications",
        "url": "https://www.bis.org/publications/research"
      },
      {
        "name": "CME Group interest rates education",
        "url": "https://www.cmegroup.com/education.html"
      },
      {
        "name": "ECB key interest rates",
        "url": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html"
      }
    ],
    "relatedPairs": [
      "eur-usd",
      "usd-jpy",
      "eur-chf",
      "aud-jpy"
    ],
    "related": [
      "forex-carry-trade-explained",
      "what-is-interest-rate-divergence",
      "basis-points-vs-pips"
    ],
    "updated": "2026-11-13"
  },
  {
    "slug": "hawkish-vs-dovish-central-banks",
    "title": "Hawkish vs Dovish: How to Read Central Bank Language",
    "description": "Hawkish means leaning towards higher rates; dovish means leaning towards lower rates. Learn to read statements, votes and projections without over-interpreting them.",
    "answer": "Hawkish describes a central bank or policymaker leaning towards higher interest rates to control inflation. Dovish describes leaning towards lower rates to support growth and employment. Markets react to whether the tone is more hawkish or more dovish than expected, not to the label itself.",
    "sections": [
      {
        "heading": "What do hawkish and dovish mean?",
        "paragraphs": [
          "A hawkish stance prioritises bringing inflation down and accepts higher interest rates, or rates staying high for longer, to achieve it. A dovish stance places more weight on supporting economic activity and employment and is more willing to lower rates or delay increases.",
          "The terms describe a direction of lean, not a fixed position. The same policymaker can sound hawkish when inflation is rising and dovish when unemployment is rising. A neutral stance means the bank sees the risks as roughly balanced."
        ]
      },
      {
        "heading": "Where the tone appears",
        "paragraphs": [
          "The policy statement is the first source: compare its wording with the previous statement and note what was added, removed or changed. The press conference then shows how the head of the central bank answers questions about the next move. Minutes, published some weeks later by several banks, reveal how much disagreement there was.",
          "Some banks publish additional signals. The Federal Reserve releases policymakers’ rate projections four times a year, often called the dot plot. The Bank of England publishes how each member of its nine-person committee voted, so a 5–4 decision carries a different message from a 9–0 decision."
        ]
      },
      {
        "heading": "What is a hawkish cut or a dovish hike?",
        "paragraphs": [
          "A hawkish cut is a rate reduction accompanied by guidance that further cuts are unlikely or will be slow. A dovish hike is a rate increase accompanied by guidance that it may be the last. In both cases the guidance pulls in the opposite direction from the decision.",
          "Currencies often respond more to the guidance than to the decision, because the guidance changes the expected path of rates over the following months while the decision itself was usually anticipated."
        ]
      },
      {
        "heading": "Common phrases and what they usually signal",
        "paragraphs": [
          "Phrases such as ‘inflation remains too high’, ‘further tightening may be appropriate’ and ‘higher for longer’ lean hawkish. Phrases such as ‘risks to growth have increased’, ‘policy is restrictive’ and ‘inflation is returning to target’ lean dovish. ‘Data dependent’ and ‘meeting by meeting’ signal that the bank is avoiding a commitment.",
          "Treat these as indications, not rules. The meaning depends on what the same bank said last time. A phrase that sounded hawkish six months ago can be dovish today if it replaces stronger wording."
        ]
      },
      {
        "heading": "Mistakes to avoid when reading central banks",
        "paragraphs": [
          "Do not judge tone from a headline. Read the actual statement and compare it with the previous one. Do not treat one policymaker’s speech as the committee’s view. Do not assume that hawkish means the currency will rise; if markets expected an even more hawkish message, the currency can fall.",
          "Avoid mixing the two sides of a pair. For EUR/USD, a hawkish ECB matters only relative to the Federal Reserve’s stance at the same time."
        ]
      },
      {
        "heading": "How does TRADE90 classify central bank stance?",
        "paragraphs": [
          "TRADE90 records each bank’s latest decision and published guidance with its date and official source, then combines that with inflation, unemployment and growth evidence to describe a conditional policy direction for each currency. When the evidence is incomplete, out of date or mixed, the outlook is shown as uncertain or unavailable instead of being forced into a hawkish or dovish label.",
          "The classification is experimental research based on published information. It is not a prediction of the next decision and it is not a trading signal."
        ]
      }
    ],
    "sources": [
      {
        "name": "Federal Reserve: FOMC meeting calendars and statements",
        "url": "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
      },
      {
        "name": "ECB monetary policy strategy",
        "url": "https://www.ecb.europa.eu/mopo/strategy/html/index.en.html"
      },
      {
        "name": "Bank of England: interest rates",
        "url": "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
      },
      {
        "name": "Federal Reserve monetary policy and FOMC publications",
        "url": "https://www.federalreserve.gov/monetarypolicy.htm"
      }
    ],
    "relatedPairs": [
      "eur-usd",
      "gbp-usd",
      "usd-jpy"
    ],
    "related": [
      "how-to-prepare-for-central-bank-rate-decisions",
      "central-bank-policy-divergence-checklist",
      "fed-vs-ecb-policy-divergence",
      "how-interest-rates-affect-forex"
    ],
    "updated": "2026-11-13"
  },
  {
    "slug": "basis-points-vs-pips",
    "title": "Basis Points vs Pips: What Forex Traders Need to Know",
    "description": "A basis point measures interest rates (0.01 percentage point); a pip measures price (usually 0.0001). Learn the difference, with conversions and worked examples.",
    "answer": "A basis point is one hundredth of a percentage point (0.01%) and is used for interest rates and yields. A pip is the standard unit of price movement in a currency pair, 0.0001 for most pairs and 0.01 for yen pairs. Basis points describe rate gaps; pips describe exchange-rate moves.",
    "sections": [
      {
        "heading": "What is a basis point?",
        "paragraphs": [
          "A basis point, written bp or bps, equals 0.01 percentage point. One hundred basis points equal one percentage point. A central bank that moves its policy rate from 4.00% to 4.25% has raised it by 25 basis points.",
          "Basis points remove ambiguity. Saying a 4% rate rose ‘by 1%’ could mean it became 5% or 4.04%. Saying it rose by 100 basis points can only mean it became 5%."
        ]
      },
      {
        "heading": "What is a pip in forex?",
        "paragraphs": [
          "A pip is the conventional smallest whole unit of price change in a currency pair. For most pairs it is the fourth decimal place, so a move in EUR/USD from 1.1000 to 1.1001 is one pip. For pairs quoted against the Japanese yen it is the second decimal place, so a move in USD/JPY from 150.00 to 150.01 is one pip.",
          "Most platforms quote one further decimal place, called a pipette or fractional pip, which is one tenth of a pip. On a standard lot of 100,000 units, one pip is worth 10 units of the quote currency; on a mini lot of 10,000 units it is worth 1 unit."
        ]
      },
      {
        "heading": "How rate gaps are expressed in basis points",
        "paragraphs": [
          "An interest-rate differential is the base currency’s rate minus the quote currency’s rate. In a hypothetical example, a base rate of 2.50% and a quote rate of 3.75% give a gap of −1.25 percentage points, or −125 basis points. The negative sign means the quote currency has the higher rate.",
          "When a central bank publishes a target range, a single number is needed for the calculation. TRADE90 uses the midpoint of the Federal Reserve’s target range, so a range of 3.75% to 4.00% is treated as 3.875%."
        ]
      },
      {
        "heading": "Percent versus percentage points",
        "paragraphs": [
          "A change from 2% to 3% is an increase of one percentage point, or 100 basis points. It is also a 50% increase in the rate itself. Mixing these two descriptions is one of the most common errors in financial writing, and it produces very different impressions of the same change.",
          "When you read that rates ‘rose 0.5%’, check whether the writer means 50 basis points. In central bank reporting it almost always does."
        ]
      },
      {
        "heading": "Can you convert basis points into pips?",
        "paragraphs": [
          "No, not directly. Basis points measure interest rates and pips measure exchange-rate prices, so there is no fixed conversion between them. A 25 basis point rate change has moved a currency pair by more than 100 pips on some occasions and by almost nothing on others, depending on whether the change was expected.",
          "The one place the two meet is in forward and swap pricing, where an interest-rate gap over a period of time is translated into forward points, which are quoted in pips. That calculation depends on the spot rate and the number of days, so it is not a constant ratio."
        ]
      },
      {
        "heading": "How many basis points is a typical central bank move?",
        "paragraphs": [
          "Most major central banks change rates in steps of 25 basis points. Moves of 50 basis points or more are used when a bank wants to act more quickly, and some banks have used smaller steps when rates were very low. The size of a move is itself a signal: a larger-than-usual step is read as urgency.",
          "The decision calendar and central bank pages on TRADE90 list each bank’s latest decision and current benchmark so the size and date of recent changes can be checked against the official source."
        ]
      }
    ],
    "sources": [
      {
        "name": "Federal Reserve monetary policy and FOMC publications",
        "url": "https://www.federalreserve.gov/monetarypolicy.htm"
      },
      {
        "name": "ECB key interest rates",
        "url": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html"
      },
      {
        "name": "Bank of England: interest rates",
        "url": "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
      },
      {
        "name": "CME Group interest rates education",
        "url": "https://www.cmegroup.com/education.html"
      }
    ],
    "relatedPairs": [
      "eur-usd",
      "usd-jpy",
      "gbp-usd"
    ],
    "related": [
      "what-is-interest-rate-divergence",
      "forex-swap-rates-vs-central-bank-rates",
      "forex-fundamental-analysis"
    ],
    "updated": "2026-11-13"
  },
  {
    "slug": "how-to-prepare-for-central-bank-rate-decisions",
    "title": "How to Prepare for a Central Bank Rate Decision",
    "description": "A step-by-step research routine for Fed, ECB, BoE and other rate decisions: expectations, statement changes, projections, press conference and execution risk.",
    "answer": "Before a rate decision, know the exact release time, the current rate, what the market expects, and what would count as a surprise. During the release, compare the decision and statement with those expectations. Spreads widen and prices gap around the announcement, so decide in advance whether you will hold, reduce or stay out.",
    "sections": [
      {
        "heading": "Step 1: confirm the schedule from the official source",
        "paragraphs": [
          "Every major central bank publishes its meeting dates in advance. Check the date and the time in your own time zone, including daylight-saving changes. Note whether the decision comes with a press conference, new economic projections or a monetary policy report, because those meetings carry more information.",
          "Announcement times follow each bank’s routine. The Federal Reserve typically releases its statement at 2:00 pm Eastern Time with a press conference at 2:30 pm. The ECB typically announces at 14:15 Central European Time with a press conference at 14:45. The Bank of England typically announces at 12:00 noon UK time. Always confirm on the bank’s own calendar."
        ]
      },
      {
        "heading": "Step 2: establish what is expected",
        "paragraphs": [
          "Find the consensus forecast for the decision and, where available, the probability implied by interest-rate futures. If a 25 basis point cut is almost fully priced, the cut itself is not news. The question becomes what the bank says about the following meetings.",
          "Write down three scenarios before the release: more hawkish than expected, in line, and more dovish than expected. For each one, note what the decision and the key statement wording would look like. This prevents interpreting the outcome after seeing the price move."
        ]
      },
      {
        "heading": "Step 3: review the evidence the bank is watching",
        "paragraphs": [
          "Read the previous statement and identify the conditions the bank attached to its next move. Then check the data published since: inflation, unemployment, wages and growth. A bank that said it needed ‘further evidence of inflation returning to target’ will be judged against the inflation releases that followed.",
          "Do the same for the other currency in the pair. A decision moves a pair through the change in the gap between the two expected rate paths, so the other central bank’s stance is half of the analysis."
        ]
      },
      {
        "heading": "Step 4: read the release in order",
        "paragraphs": [
          "Start with the decision and the vote, if it is published. Next compare the statement with the previous one, line by line; changes in wording about inflation, growth and future policy are the signal. Then look at any projections for rates, inflation and growth. Finally, follow the press conference, where answers frequently move markets more than the statement.",
          "The first price move is not always the lasting one. Initial reactions to the headline are often reversed once the statement and the press conference are absorbed."
        ]
      },
      {
        "heading": "What happens to spreads and execution during a rate decision?",
        "paragraphs": [
          "Liquidity falls in the seconds around the announcement. Spreads widen, sometimes to many times their normal size, and prices can jump past stop-loss levels so that orders are filled at a worse price than requested. Pending orders placed close to the market can be triggered by the spread alone.",
          "These are execution risks that exist regardless of whether the directional view is right. Many traders reduce position size, widen or remove nearby orders, or wait until the press conference has finished before acting."
        ]
      },
      {
        "heading": "Should you trade the decision or wait?",
        "paragraphs": [
          "That depends on your method and risk tolerance; there is no universally correct answer. Trading the release offers the largest moves and the worst execution. Waiting gives up the first move in exchange for normal spreads and a clearer picture of the bank’s message. Holding an existing position through the release means accepting gap risk on its full size.",
          "Whatever you choose, decide before the announcement and record the reason. TRADE90’s decision calendar lists upcoming meetings for the eight major central banks with links to each official schedule, and each pair page shows the current rate gap going into the decision."
        ]
      }
    ],
    "sources": [
      {
        "name": "Federal Reserve: FOMC meeting calendars and statements",
        "url": "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
      },
      {
        "name": "ECB Governing Council meeting calendar",
        "url": "https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html"
      },
      {
        "name": "Bank of England: interest rates",
        "url": "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
      },
      {
        "name": "CME Group interest rates education",
        "url": "https://www.cmegroup.com/education.html"
      }
    ],
    "relatedPairs": [
      "eur-usd",
      "gbp-usd",
      "usd-jpy",
      "aud-usd"
    ],
    "related": [
      "hawkish-vs-dovish-central-banks",
      "central-bank-policy-divergence-checklist",
      "how-interest-rates-affect-forex"
    ],
    "updated": "2026-11-13"
  },
  {
    "slug": "real-interest-rates-forex",
    "title": "Real Interest Rates in Forex: Why Inflation Changes the Rate Gap",
    "description": "The real interest rate is the nominal rate minus inflation. Learn how to compare real rate gaps between two currencies and the pitfalls of mixing inflation measures.",
    "answer": "A real interest rate is the nominal interest rate minus inflation. In forex, comparing real rates shows whether a currency’s interest advantage survives after inflation. A currency with a high nominal rate but higher inflation can have a lower real rate than a low-rate currency.",
    "sections": [
      {
        "heading": "What is a real interest rate?",
        "paragraphs": [
          "The nominal interest rate is the published rate, such as a central bank’s policy rate. The real interest rate adjusts it for the change in prices. As an approximation, the real rate equals the nominal rate minus the inflation rate. A policy rate of 4.00% with inflation of 3.00% gives a real rate of about 1.00%.",
          "A positive real rate means savings grow faster than prices. A negative real rate means prices are rising faster than the interest earned, so purchasing power falls even though interest is paid."
        ]
      },
      {
        "heading": "Backward-looking and forward-looking real rates",
        "paragraphs": [
          "Subtracting the latest year-on-year inflation figure gives a backward-looking, or ex post, real rate. It is easy to calculate from published data but describes the past twelve months. Subtracting expected inflation gives a forward-looking, or ex ante, real rate, which is closer to what matters for decisions but depends on which measure of expectations is used.",
          "Be clear about which one you are using. During periods when inflation is falling quickly, the backward-looking real rate understates how restrictive policy has become."
        ]
      },
      {
        "heading": "How to calculate a real rate differential for a pair",
        "paragraphs": [
          "Calculate the real rate for each currency, then subtract the quote currency’s real rate from the base currency’s. In a hypothetical example, the base currency has a policy rate of 4.00% and inflation of 3.50%, giving a real rate of 0.50%. The quote currency has a policy rate of 2.00% and inflation of 1.00%, giving a real rate of 1.00%.",
          "The nominal gap is +200 basis points in favour of the base currency, but the real gap is −50 basis points in favour of the quote currency. The nominal comparison and the real comparison point in opposite directions."
        ]
      },
      {
        "heading": "Why does the real rate matter for currencies?",
        "paragraphs": [
          "Inflation erodes the value of a currency over time. A country with persistently higher inflation tends to see its currency lose value against countries with lower inflation, which can offset or exceed its nominal interest advantage. Real rates combine both effects in one measure.",
          "Real rates also indicate how tight policy is. A central bank with a clearly positive real rate is restraining its economy and may have room to cut; one with a negative real rate while inflation is above target may need to tighten further. Both observations feed into the expected path of the nominal gap."
        ]
      },
      {
        "heading": "Pitfalls when comparing real rates",
        "paragraphs": [
          "Use the same type of inflation measure on both sides. Headline and core inflation can differ substantially, and the euro area’s HICP is constructed differently from national CPI measures. Use the same period basis: do not subtract a quarterly inflation figure from one country and a monthly figure from another without noting the difference in timing.",
          "Check the dates. A policy rate from this month combined with an inflation reading from four months ago can give a misleading real rate, particularly after a large rate change."
        ]
      },
      {
        "heading": "Is a higher real interest rate always better for a currency?",
        "paragraphs": [
          "No. A higher real rate is supportive in principle, but it can also reflect weak growth, financial stress or a central bank that is expected to cut soon. Exchange rates respond to how the real rate gap is expected to change, and to factors outside interest rates altogether.",
          "TRADE90 shows each economy’s policy benchmark alongside its inflation, unemployment and growth observations with their dates and sources, so nominal and real comparisons can be made from the same page. The figures are research inputs, not forecasts."
        ]
      }
    ],
    "sources": [
      {
        "name": "OECD consumer prices methodology and data",
        "url": "https://data-explorer.oecd.org/vis?df[ag]=OECD.SDD.TPS&df[id]=DSD_PRICES@DF_PRICES_ALL"
      },
      {
        "name": "Federal Reserve monetary policy and FOMC publications",
        "url": "https://www.federalreserve.gov/monetarypolicy.htm"
      },
      {
        "name": "ECB monetary policy strategy",
        "url": "https://www.ecb.europa.eu/mopo/strategy/html/index.en.html"
      },
      {
        "name": "RBA education explainers",
        "url": "https://www.rba.gov.au/education/resources/explainers/"
      }
    ],
    "relatedPairs": [
      "eur-usd",
      "usd-jpy",
      "gbp-usd",
      "usd-chf"
    ],
    "related": [
      "how-interest-rates-affect-forex",
      "forex-fundamental-analysis",
      "high-interest-rates-currency-strength"
    ],
    "updated": "2026-11-13"
  },
  {
    "slug": "major-central-banks-forex-guide",
    "title": "The 8 Major Central Banks Every Forex Trader Should Know",
    "description": "A reference guide to the Fed, ECB, BoE, BoJ, SNB, BoC, RBA and RBNZ: each bank’s currency, policy benchmark, inflation goal and meeting frequency.",
    "answer": "The eight major central banks in forex are the Federal Reserve (USD), European Central Bank (EUR), Bank of England (GBP), Bank of Japan (JPY), Swiss National Bank (CHF), Bank of Canada (CAD), Reserve Bank of Australia (AUD) and Reserve Bank of New Zealand (NZD). Their currencies form the 28 major and cross pairs.",
    "sections": [
      {
        "heading": "Which central banks matter most for forex?",
        "paragraphs": [
          "Eight central banks issue the currencies that make up the major and cross pairs most retail traders use. Each sets a policy interest rate that anchors short-term borrowing costs in its currency. Combining the eight currencies in pairs produces 28 distinct pairs, from EUR/USD to NZD/CHF.",
          "Each bank has its own benchmark, its own inflation goal and its own meeting schedule. Comparing two of them correctly starts with knowing what each one actually publishes."
        ]
      },
      {
        "heading": "Federal Reserve (USD) and European Central Bank (EUR)",
        "paragraphs": [
          "The Federal Reserve’s policy committee, the FOMC, sets a target range for the federal funds rate, published as a lower and an upper bound. It has a dual mandate of maximum employment and stable prices, with a longer-run inflation goal of 2%. The FOMC has eight scheduled meetings a year and publishes policymakers’ projections at four of them.",
          "The European Central Bank’s Governing Council sets three key rates for the euro area; the deposit facility rate is the one that steers market rates. The ECB targets inflation of 2% over the medium term and normally holds eight monetary policy meetings a year, each followed by a press conference."
        ]
      },
      {
        "heading": "Bank of England (GBP) and Bank of Japan (JPY)",
        "paragraphs": [
          "The Bank of England’s Monetary Policy Committee sets Bank Rate. Its inflation target of 2% is set by the UK government. The nine-member committee meets eight times a year and publishes how each member voted, along with minutes, at the time of the decision.",
          "The Bank of Japan’s Policy Board sets a short-term policy interest rate and has a price stability target of 2%. It holds eight monetary policy meetings a year. After a long period of very low and negative rates, changes in Bank of Japan policy receive close attention because the yen has frequently been used as a funding currency."
        ]
      },
      {
        "heading": "Swiss National Bank (CHF) and Bank of Canada (CAD)",
        "paragraphs": [
          "The Swiss National Bank sets the SNB policy rate and defines price stability as annual inflation of less than 2%. It conducts scheduled monetary policy assessments four times a year, fewer than the other major banks, which makes each one more significant. The SNB has also been willing to intervene in currency markets.",
          "The Bank of Canada sets a target for the overnight rate. Its inflation target is 2%, the midpoint of a 1% to 3% control range. It has eight fixed announcement dates a year and publishes a Monetary Policy Report with four of them."
        ]
      },
      {
        "heading": "Reserve Bank of Australia (AUD) and Reserve Bank of New Zealand (NZD)",
        "paragraphs": [
          "The Reserve Bank of Australia sets the cash rate target and aims to keep inflation between 2% and 3%. It moved to eight meetings a year in 2024, each followed by a press conference. The Australian dollar is also sensitive to commodity prices and to economic conditions in Asia.",
          "The Reserve Bank of New Zealand sets the Official Cash Rate. Its target is inflation between 1% and 3%, with a focus on the 2% midpoint. It normally makes seven scheduled decisions a year."
        ]
      },
      {
        "heading": "How should you compare two central banks?",
        "paragraphs": [
          "First compare like with like: note whether each benchmark is a single rate or a range, and record its effective date. Second, calculate the signed gap as the base currency’s rate minus the quote currency’s rate. Third, compare each bank’s position relative to its own inflation goal, because a bank with inflation above target is under different pressure from one with inflation below target. Fourth, check the meeting calendars: the bank that meets next can change the gap first.",
          "Mandates, targets and meeting schedules are reviewed from time to time, so confirm details on each bank’s own website. TRADE90’s central bank pages list the current benchmark, latest decision and next scheduled decision for all eight, each linked to the official source."
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
        "name": "Bank of England: interest rates",
        "url": "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
      },
      {
        "name": "Bank of Japan: monetary policy",
        "url": "https://www.boj.or.jp/en/mopo/index.htm"
      },
      {
        "name": "Swiss National Bank",
        "url": "https://www.snb.ch/en/"
      },
      {
        "name": "Bank of Canada: monetary policy",
        "url": "https://www.bankofcanada.ca/core-functions/monetary-policy/"
      },
      {
        "name": "Reserve Bank of Australia: monetary policy",
        "url": "https://www.rba.gov.au/monetary-policy/"
      },
      {
        "name": "Reserve Bank of New Zealand: monetary policy",
        "url": "https://www.rbnz.govt.nz/monetary-policy"
      }
    ],
    "relatedPairs": [
      "eur-usd",
      "gbp-usd",
      "usd-jpy",
      "usd-chf",
      "usd-cad",
      "aud-usd",
      "nzd-usd"
    ],
    "related": [
      "central-bank-policy-divergence-checklist",
      "fed-vs-ecb-policy-divergence",
      "how-to-prepare-for-central-bank-rate-decisions"
    ],
    "updated": "2026-11-13"
  }
];

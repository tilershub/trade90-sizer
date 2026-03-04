export interface InstrumentConfig {
  symbol: string;
  name: string;
  fullName: string;
  pip: number;
  cat: 'Forex Majors' | 'Forex Crosses' | 'Metals' | 'Indices' | 'Crypto' | 'Commodities';
  metaDescription: string;
  intro: string;
  facts: string[];
  relatedSymbols: string[];
}

export const INSTRUMENTS: Record<string, InstrumentConfig> = {
  // ── FOREX MAJORS ────────────────────────────────────────────────────────────
  EURUSD: {
    symbol: 'EURUSD', name: 'EUR/USD', fullName: 'Euro / US Dollar',
    pip: 0.0001, cat: 'Forex Majors',
    metaDescription: 'Free EUR/USD position size calculator. Enter your account balance, risk %, entry, stop loss and take profit to get the exact lot size for EUR/USD trades.',
    intro: 'EUR/USD is the world\'s most liquid currency pair, accounting for roughly 28% of daily Forex volume. Its tight spreads and predictable volatility make precise position sizing essential — a single pip on a standard lot is worth $10.00.',
    facts: [
      'Pip value: $10 per standard lot (0.0001 price increment)',
      'Best trading sessions: London open (08:00 GMT) and New York overlap (13:00–17:00 GMT)',
      'Average daily range: 70–100 pips in normal conditions',
      'Key drivers: ECB and Fed policy decisions, Eurozone GDP, US Non-Farm Payrolls',
    ],
    relatedSymbols: ['GBPUSD', 'EURGBP', 'EURJPY', 'USDCHF'],
  },
  GBPUSD: {
    symbol: 'GBPUSD', name: 'GBP/USD', fullName: 'British Pound / US Dollar',
    pip: 0.0001, cat: 'Forex Majors',
    metaDescription: 'Calculate your exact GBP/USD (Cable) lot size. Input your risk parameters and let the TRADE90 position sizer compute the precise position size in standard lots.',
    intro: 'GBP/USD — known as "Cable" — is the third most traded Forex pair. It carries higher volatility than EUR/USD, with average daily ranges of 90–130 pips. Accurate lot size calculation is critical to surviving its fast price moves.',
    facts: [
      'Pip value: $10 per standard lot (0.0001 price increment)',
      'Best sessions: London open and London/New York overlap',
      'Average daily range: 90–130 pips',
      'Key drivers: Bank of England decisions, UK inflation data, Brexit-era risk events',
    ],
    relatedSymbols: ['EURUSD', 'EURGBP', 'GBPJPY', 'GBPAUD'],
  },
  USDJPY: {
    symbol: 'USDJPY', name: 'USD/JPY', fullName: 'US Dollar / Japanese Yen',
    pip: 0.01, cat: 'Forex Majors',
    metaDescription: 'USD/JPY position size calculator. Get your exact lot size for Yen pairs — the calculator automatically uses the correct $1000/pip JPY pip value formula.',
    intro: 'USD/JPY is the most traded Yen pair and a bellwether for risk sentiment in Asia. Because the Yen has a different pip structure (0.01), its pip value per standard lot is approximately $1,000 ÷ current rate — our calculator handles this automatically.',
    facts: [
      'Pip value: ~$6.50–$9 per standard lot depending on USD/JPY rate (0.01 increment)',
      'Best sessions: Tokyo open (00:00 GMT) and New York session',
      'Average daily range: 50–80 pips',
      'Key drivers: Bank of Japan interventions, US Treasury yields, risk-on/off flows',
    ],
    relatedSymbols: ['EURUSD', 'EURJPY', 'GBPJPY', 'AUDJPY'],
  },
  USDCHF: {
    symbol: 'USDCHF', name: 'USD/CHF', fullName: 'US Dollar / Swiss Franc',
    pip: 0.0001, cat: 'Forex Majors',
    metaDescription: 'USD/CHF position size calculator. Calculate your Swiss Franc lot size using institutional risk management formulas. Set your SL, TP, and account risk instantly.',
    intro: 'USD/CHF is the primary safe-haven Forex pair. The Swiss Franc strengthens during global uncertainty, creating sharp, directional moves. Correct position sizing prevents outsized losses when the SNB intervenes unexpectedly.',
    facts: [
      'Pip value: ~$10 per standard lot (varies slightly with CHF rate)',
      'Moves inversely to EUR/USD roughly 90% of the time',
      'Average daily range: 50–70 pips',
      'Key drivers: SNB rate decisions, risk-off events, EUR/USD correlation',
    ],
    relatedSymbols: ['EURUSD', 'EURCHF', 'GBPCHF', 'AUDCHF'],
  },
  AUDUSD: {
    symbol: 'AUDUSD', name: 'AUD/USD', fullName: 'Australian Dollar / US Dollar',
    pip: 0.0001, cat: 'Forex Majors',
    metaDescription: 'AUD/USD position size calculator. Instantly compute your Aussie Dollar lot size based on your account balance, risk percentage, and stop loss distance.',
    intro: 'AUD/USD is a commodity-linked currency pair highly sensitive to Chinese economic data, iron ore prices, and RBA policy. Its daily range of 50–90 pips rewards disciplined risk-per-trade management.',
    facts: [
      'Pip value: $10 per standard lot',
      'Best sessions: Sydney/Tokyo open, London/New York overlap',
      'Average daily range: 50–90 pips',
      'Key drivers: RBA decisions, Chinese PMI, commodity prices (iron ore, copper)',
    ],
    relatedSymbols: ['NZDUSD', 'EURAUD', 'GBPAUD', 'AUDJPY'],
  },
  USDCAD: {
    symbol: 'USDCAD', name: 'USD/CAD', fullName: 'US Dollar / Canadian Dollar',
    pip: 0.0001, cat: 'Forex Majors',
    metaDescription: 'USD/CAD position size calculator. Calculate precise Loonie lot sizes for your account. Uses institutional-grade risk formulas favored by FTMO funded traders.',
    intro: 'USD/CAD — "the Loonie" — correlates strongly with WTI crude oil prices. When oil rises, CAD tends to strengthen, pushing USD/CAD lower. Accurate position sizing is vital given oil\'s sudden volatility during OPEC events.',
    facts: [
      'Pip value: ~$7.50 per standard lot (varies with CAD rate)',
      'Average daily range: 50–80 pips',
      'Negative correlation with oil prices',
      'Key drivers: Bank of Canada decisions, US/Canada trade relations, crude oil',
    ],
    relatedSymbols: ['EURUSD', 'AUDCAD', 'NZDCAD', 'GBPCAD'],
  },
  NZDUSD: {
    symbol: 'NZDUSD', name: 'NZD/USD', fullName: 'New Zealand Dollar / US Dollar',
    pip: 0.0001, cat: 'Forex Majors',
    metaDescription: 'NZD/USD position size calculator. Enter your balance, risk %, and stop loss to get the exact Kiwi Dollar lot size for your next trade.',
    intro: 'NZD/USD — "the Kiwi" — tracks AUD/USD closely but with greater sensitivity to dairy prices and RBNZ policy. Its smaller daily range (40–70 pips) rewards precise stop placement and proper lot sizing.',
    facts: [
      'Pip value: $10 per standard lot',
      'High correlation with AUD/USD (0.85+)',
      'Average daily range: 40–70 pips',
      'Key drivers: RBNZ decisions, dairy commodity prices, Chinese demand data',
    ],
    relatedSymbols: ['AUDUSD', 'NZDJPY', 'EURNZD', 'GBPNZD'],
  },

  // ── FOREX CROSSES ───────────────────────────────────────────────────────────
  EURGBP: {
    symbol: 'EURGBP', name: 'EUR/GBP', fullName: 'Euro / British Pound',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'EUR/GBP position size calculator. Determine exact lot sizes for Euro vs Pound trades, accounting for spread, stop distance, and risk percentage.',
    intro: 'EUR/GBP is the primary European cross pair, capturing divergences between ECB and BoE policy. Its tight range (30–60 pips/day) demands precision — a poorly sized position erases the edge very quickly.',
    facts: [
      'Pip value: ~$12–$13 per standard lot (denominated in GBP, converted to USD)',
      'Average daily range: 30–60 pips — tighter than majors',
      'Sensitive to Brexit-era UK-EU trade negotiations',
      'Key drivers: ECB vs BoE policy divergence, UK/EU economic releases',
    ],
    relatedSymbols: ['EURUSD', 'GBPUSD', 'EURJPY', 'GBPJPY'],
  },
  EURJPY: {
    symbol: 'EURJPY', name: 'EUR/JPY', fullName: 'Euro / Japanese Yen',
    pip: 0.01, cat: 'Forex Crosses',
    metaDescription: 'EUR/JPY position size calculator. Correctly size your Yen cross trades with automatic JPY pip value conversion for the EUR/JPY pair.',
    intro: 'EUR/JPY is a high-volatility cross favored by swing traders for its wide daily range (80–120 pips). As a "synthetic" of EUR/USD × USD/JPY, it amplifies moves from both central banks. JPY pip values are calculated automatically.',
    facts: [
      'Pip value: ~$6–9 per standard lot (JPY-denominated, rate-dependent)',
      'Average daily range: 80–120 pips',
      'Acts as a global risk sentiment barometer',
      'Key drivers: ECB + BoJ combined policy, risk appetite flows',
    ],
    relatedSymbols: ['EURUSD', 'USDJPY', 'GBPJPY', 'AUDJPY'],
  },
  EURAUD: {
    symbol: 'EURAUD', name: 'EUR/AUD', fullName: 'Euro / Australian Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'EUR/AUD position size calculator. Calculate lot sizes for Euro/Aussie Dollar trades with precise pip value calculations and institutional risk formulas.',
    intro: 'EUR/AUD offers wide swings (100–150 pips/day) driven by the contrast between European stagnation and commodity-driven Australian growth. Its higher volatility means accurate position sizing is non-negotiable.',
    facts: [
      'Pip value: ~$6–7 per standard lot (AUD-denominated)',
      'Average daily range: 100–150 pips',
      'One of the more volatile G10 crosses',
      'Key drivers: ECB policy, RBA decisions, China growth, commodity prices',
    ],
    relatedSymbols: ['EURUSD', 'AUDUSD', 'GBPAUD', 'AUDNZD'],
  },
  EURNZD: {
    symbol: 'EURNZD', name: 'EUR/NZD', fullName: 'Euro / New Zealand Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'EUR/NZD position size calculator. Get accurate lot sizes for Euro/Kiwi trades. High volatility cross — proper risk sizing is essential.',
    intro: 'EUR/NZD is one of the widest-ranging G10 crosses, frequently moving 150+ pips in a session. It rewards patient breakout traders but punishes incorrect lot sizes — one oversized trade can wipe a week of profits.',
    facts: [
      'Pip value: ~$6 per standard lot (NZD-denominated)',
      'Average daily range: 120–180 pips',
      'Lower liquidity creates wider spreads — factor into stop distance',
      'Key drivers: ECB, RBNZ, dairy prices, risk sentiment',
    ],
    relatedSymbols: ['EURUSD', 'NZDUSD', 'AUDNZD', 'GBPNZD'],
  },
  EURCAD: {
    symbol: 'EURCAD', name: 'EUR/CAD', fullName: 'Euro / Canadian Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'EUR/CAD position size calculator. Calculate your exact lot size for Euro/Loonie trades using professional risk management parameters.',
    intro: 'EUR/CAD bridges European monetary policy with Canada\'s oil-linked economy. Its daily range of 70–110 pips and oil correlation create trending opportunities that require sound position sizing to exploit effectively.',
    facts: [
      'Pip value: ~$7–8 per standard lot (CAD-denominated)',
      'Average daily range: 70–110 pips',
      'Correlation with crude oil via the Canadian Dollar',
      'Key drivers: ECB, BoC, oil prices, US economic data',
    ],
    relatedSymbols: ['EURUSD', 'USDCAD', 'GBPCAD', 'AUDCAD'],
  },
  EURCHF: {
    symbol: 'EURCHF', name: 'EUR/CHF', fullName: 'Euro / Swiss Franc',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'EUR/CHF position size calculator. Size your Swiss Franc cross trades correctly — critical during SNB intervention risk periods.',
    intro: 'EUR/CHF historically hugged parity before the SNB floor removal shocked the market in 2015. It remains prone to sudden, extreme moves during risk-off episodes — making position sizing discipline a survival skill.',
    facts: [
      'Pip value: ~$11–12 per standard lot (CHF-denominated)',
      'SNB interventions can move price 200+ pips instantly',
      'Average daily range: 30–60 pips in normal conditions',
      'Key drivers: SNB policy, EU-Swiss relations, risk sentiment',
    ],
    relatedSymbols: ['USDCHF', 'EURUSD', 'GBPCHF', 'AUDCHF'],
  },
  GBPJPY: {
    symbol: 'GBPJPY', name: 'GBP/JPY', fullName: 'British Pound / Japanese Yen',
    pip: 0.01, cat: 'Forex Crosses',
    metaDescription: 'GBP/JPY position size calculator — the "Widow Maker" pair. Calculate lot sizes for this high-volatility pair with automatic JPY pip value adjustment.',
    intro: 'GBP/JPY — nicknamed the "Widow Maker" — regularly moves 150–200 pips in a single session. It combines the volatility of Cable with Yen carry-trade dynamics. Incorrect lot sizing here is the fastest path to a blown account.',
    facts: [
      'Pip value: ~$6–8 per standard lot (rate-dependent JPY calculation)',
      'Average daily range: 130–200 pips',
      'Extremely volatile during UK and Japan news events',
      'Key drivers: BoE, BoJ, UK economic data, global risk sentiment',
    ],
    relatedSymbols: ['GBPUSD', 'USDJPY', 'EURJPY', 'AUDJPY'],
  },
  GBPAUD: {
    symbol: 'GBPAUD', name: 'GBP/AUD', fullName: 'British Pound / Australian Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'GBP/AUD position size calculator. Get the correct lot size for Pound/Aussie trades using accurate pip values and professional risk formulas.',
    intro: 'GBP/AUD is a wide-ranging cross driven by UK economic sentiment and Australian commodity exposure. Daily ranges of 130–180 pips make it attractive for breakout traders — but only with precise risk management.',
    facts: [
      'Pip value: ~$6–7 per standard lot (AUD-denominated)',
      'Average daily range: 130–180 pips',
      'Lower liquidity than GBP/USD — spreads are wider',
      'Key drivers: BoE, RBA, commodity prices, UK economic data',
    ],
    relatedSymbols: ['GBPUSD', 'AUDUSD', 'EURAUD', 'AUDNZD'],
  },
  GBPNZD: {
    symbol: 'GBPNZD', name: 'GBP/NZD', fullName: 'British Pound / New Zealand Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'GBP/NZD position size calculator. One of Forex\'s most volatile crosses — calculate your exact lot size to protect your account from outsized moves.',
    intro: 'GBP/NZD is among the most volatile G10 crosses, often moving 150–220 pips per day. It suits experienced traders seeking big moves but demands iron risk discipline — an oversized position in this pair is a serious threat to your account.',
    facts: [
      'Pip value: ~$6 per standard lot (NZD-denominated)',
      'Average daily range: 150–220 pips',
      'Wide spreads — factor at least 3–5 pips into your SL',
      'Key drivers: BoE, RBNZ, UK/NZ economic releases, dairy prices',
    ],
    relatedSymbols: ['GBPUSD', 'NZDUSD', 'EURNZD', 'AUDNZD'],
  },
  GBPCAD: {
    symbol: 'GBPCAD', name: 'GBP/CAD', fullName: 'British Pound / Canadian Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'GBP/CAD position size calculator. Calculate your Pound/Loonie lot size with precision — key for trading oil-correlated currency pairs.',
    intro: 'GBP/CAD fuses UK economic dynamics with Canada\'s oil-sensitive currency. Trending well during divergent BoE/BoC policy cycles, this pair\'s 100–150 pip daily range rewards proper position sizing.',
    facts: [
      'Pip value: ~$7–8 per standard lot (CAD-denominated)',
      'Average daily range: 100–150 pips',
      'Strong correlation with crude oil via CAD',
      'Key drivers: BoE, BoC, UK economic data, oil prices',
    ],
    relatedSymbols: ['GBPUSD', 'USDCAD', 'EURCAD', 'AUDCAD'],
  },
  GBPCHF: {
    symbol: 'GBPCHF', name: 'GBP/CHF', fullName: 'British Pound / Swiss Franc',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'GBP/CHF position size calculator. Accurately size Pound/Franc positions — this pair is subject to SNB intervention risk and Brexit-era volatility.',
    intro: 'GBP/CHF captures the divergence between UK economic conditions and Swiss safe-haven flows. SNB interventions can create gap risk, making conservative position sizing an important risk mitigation tool.',
    facts: [
      'Pip value: ~$11–12 per standard lot (CHF-denominated)',
      'Average daily range: 80–120 pips',
      'SNB intervention risk creates sudden gap moves',
      'Key drivers: BoE, SNB, risk-off flows, UK data',
    ],
    relatedSymbols: ['GBPUSD', 'USDCHF', 'EURCHF', 'AUDCHF'],
  },
  AUDJPY: {
    symbol: 'AUDJPY', name: 'AUD/JPY', fullName: 'Australian Dollar / Japanese Yen',
    pip: 0.01, cat: 'Forex Crosses',
    metaDescription: 'AUD/JPY position size calculator. Calculate Aussie/Yen lot sizes with automatic JPY pip value adjustment for accurate risk management.',
    intro: 'AUD/JPY is a key risk-sentiment barometer — it rises when markets are bullish and falls sharply in risk-off events. Its 70–110 pip daily range and JPY carry dynamics make correct lot sizing vital.',
    facts: [
      'Pip value: ~$6–8 per standard lot (rate-dependent JPY calculation)',
      'Average daily range: 70–110 pips',
      'Primary carry trade proxy in G10 Forex',
      'Key drivers: RBA, BoJ, Chinese data, global risk appetite',
    ],
    relatedSymbols: ['AUDUSD', 'USDJPY', 'EURJPY', 'GBPJPY'],
  },
  AUDNZD: {
    symbol: 'AUDNZD', name: 'AUD/NZD', fullName: 'Australian Dollar / New Zealand Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'AUD/NZD position size calculator. Precisely size your Aussie/Kiwi trades — useful for trading RBA vs RBNZ policy divergence.',
    intro: 'AUD/NZD is a tightly range-bound pair under normal conditions (30–60 pips/day), but it spikes around RBA vs RBNZ policy divergence. Tight stop placement requires precise position sizing to maintain a viable R:R ratio.',
    facts: [
      'Pip value: ~$6–7 per standard lot (NZD-denominated)',
      'Average daily range: 30–60 pips — smallest in G10 crosses',
      'Tends to mean-revert; suited to range strategies',
      'Key drivers: RBA vs RBNZ rate differential, AUS/NZ economic data',
    ],
    relatedSymbols: ['AUDUSD', 'NZDUSD', 'EURNZD', 'GBPNZD'],
  },
  AUDCAD: {
    symbol: 'AUDCAD', name: 'AUD/CAD', fullName: 'Australian Dollar / Canadian Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'AUD/CAD position size calculator. Both currencies are commodity-linked — size your trades correctly during commodity cycle inflections.',
    intro: 'AUD/CAD pairs two commodity currencies — Australian iron ore and Canadian oil. Divergences between these commodity cycles drive 50–80 pip daily moves, rewarding traders who correctly size positions during trend phases.',
    facts: [
      'Pip value: ~$7–8 per standard lot (CAD-denominated)',
      'Average daily range: 50–80 pips',
      'Both currencies positively correlated with global growth',
      'Key drivers: RBA, BoC, iron ore vs crude oil price divergence',
    ],
    relatedSymbols: ['AUDUSD', 'USDCAD', 'GBPCAD', 'NZDCAD'],
  },
  AUDCHF: {
    symbol: 'AUDCHF', name: 'AUD/CHF', fullName: 'Australian Dollar / Swiss Franc',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'AUD/CHF position size calculator. A risk-sensitive pair — calculate lot sizes accurately to navigate its sharp reversals during global risk events.',
    intro: 'AUD/CHF is a classic risk-on/risk-off pair: AUD rises with growth sentiment while CHF strengthens in crises. Sharp reversals during global risk events make disciplined position sizing a priority.',
    facts: [
      'Pip value: ~$11–12 per standard lot (CHF-denominated)',
      'Average daily range: 50–80 pips',
      'Sharp gap risk during major risk-off events',
      'Key drivers: RBA, SNB, global risk sentiment, Chinese data',
    ],
    relatedSymbols: ['AUDUSD', 'USDCHF', 'EURCHF', 'GBPCHF'],
  },
  NZDJPY: {
    symbol: 'NZDJPY', name: 'NZD/JPY', fullName: 'New Zealand Dollar / Japanese Yen',
    pip: 0.01, cat: 'Forex Crosses',
    metaDescription: 'NZD/JPY position size calculator. Calculate Kiwi/Yen lot sizes with automatic JPY pip conversion for accurate risk-per-trade management.',
    intro: 'NZD/JPY tracks AUD/JPY closely but with New Zealand\'s dairy-export sensitivity. As a carry pair it can trend strongly, making precise position sizing the difference between capitalizing on a trend and getting stopped out prematurely.',
    facts: [
      'Pip value: ~$6–7 per standard lot (rate-dependent JPY calculation)',
      'Average daily range: 50–80 pips',
      'Positive correlation with AUD/JPY (~0.90)',
      'Key drivers: RBNZ, BoJ, dairy prices, global risk appetite',
    ],
    relatedSymbols: ['NZDUSD', 'USDJPY', 'AUDJPY', 'EURJPY'],
  },
  NZDCAD: {
    symbol: 'NZDCAD', name: 'NZD/CAD', fullName: 'New Zealand Dollar / Canadian Dollar',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'NZD/CAD position size calculator. Size your Kiwi/Loonie trades accurately using the TRADE90 risk formula.',
    intro: 'NZD/CAD pairs New Zealand\'s dairy economy with Canada\'s oil economy. Policy divergence between RBNZ and BoC creates trending moves of 40–70 pips/day that reward correctly sized trend-following positions.',
    facts: [
      'Pip value: ~$7–8 per standard lot (CAD-denominated)',
      'Average daily range: 40–70 pips',
      'Lower liquidity — wider spreads increase effective stop distance',
      'Key drivers: RBNZ, BoC, dairy and oil price cycles',
    ],
    relatedSymbols: ['NZDUSD', 'USDCAD', 'AUDCAD', 'AUDNZD'],
  },
  NZDCHF: {
    symbol: 'NZDCHF', name: 'NZD/CHF', fullName: 'New Zealand Dollar / Swiss Franc',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'NZD/CHF position size calculator. Accurately size this risk-sensitive cross and protect your account from sudden safe-haven flows into the Franc.',
    intro: 'NZD/CHF swings between risk-on (Kiwi demand) and risk-off (Franc demand) environments. Its 40–70 pip daily range can spike violently during global crises, making proper lot sizing a core defensive tool.',
    facts: [
      'Pip value: ~$11–12 per standard lot (CHF-denominated)',
      'Average daily range: 40–70 pips',
      'Gap risk during SNB interventions and major risk events',
      'Key drivers: RBNZ, SNB, dairy prices, risk sentiment',
    ],
    relatedSymbols: ['NZDUSD', 'USDCHF', 'EURCHF', 'AUDCHF'],
  },
  CADJPY: {
    symbol: 'CADJPY', name: 'CAD/JPY', fullName: 'Canadian Dollar / Japanese Yen',
    pip: 0.01, cat: 'Forex Crosses',
    metaDescription: 'CAD/JPY position size calculator. Get the correct lot size for Canadian Dollar/Yen trades with automatic JPY pip value adjustment.',
    intro: 'CAD/JPY blends Canadian oil sensitivity with Yen carry dynamics. Rising oil prices tend to push CAD/JPY higher; risk-off events pull it sharply lower. Average daily ranges of 60–90 pips reward trend followers with correct position sizes.',
    facts: [
      'Pip value: ~$6–8 per standard lot (rate-dependent JPY calculation)',
      'Average daily range: 60–90 pips',
      'Positive correlation with crude oil prices',
      'Key drivers: BoC, BoJ, oil prices, global risk appetite',
    ],
    relatedSymbols: ['USDCAD', 'USDJPY', 'AUDJPY', 'EURJPY'],
  },
  CADCHF: {
    symbol: 'CADCHF', name: 'CAD/CHF', fullName: 'Canadian Dollar / Swiss Franc',
    pip: 0.0001, cat: 'Forex Crosses',
    metaDescription: 'CAD/CHF position size calculator. Calculate your Canadian Dollar/Franc lot size using institutional risk management formulas.',
    intro: 'CAD/CHF is a niche cross pitting Canada\'s oil economy against Switzerland\'s safe-haven currency. Low liquidity means wider spreads, so accurate position sizing must account for the increased effective stop loss distance.',
    facts: [
      'Pip value: ~$11–12 per standard lot (CHF-denominated)',
      'Average daily range: 30–55 pips',
      'Low liquidity — factor wider spreads into your risk model',
      'Key drivers: BoC, SNB, oil prices, global risk sentiment',
    ],
    relatedSymbols: ['USDCAD', 'USDCHF', 'EURCHF', 'AUDCHF'],
  },
  CHFJPY: {
    symbol: 'CHFJPY', name: 'CHF/JPY', fullName: 'Swiss Franc / Japanese Yen',
    pip: 0.01, cat: 'Forex Crosses',
    metaDescription: 'CHF/JPY position size calculator. Both safe-haven currencies — calculate lot sizes accurately for this JPY-denominated pair.',
    intro: 'CHF/JPY is a rare safe-haven-vs-safe-haven cross. During risk-off episodes both currencies strengthen, but relative BoJ/SNB policy divergence drives persistent trends. JPY pip values are automatically adjusted in our calculator.',
    facts: [
      'Pip value: ~$8–10 per standard lot (rate-dependent JPY calculation)',
      'Average daily range: 60–90 pips',
      'Both currencies strengthen during global crises — spread matters',
      'Key drivers: SNB, BoJ, global risk sentiment, EUR/CHF flows',
    ],
    relatedSymbols: ['USDCHF', 'USDJPY', 'EURCHF', 'EURJPY'],
  },

  // ── METALS ──────────────────────────────────────────────────────────────────
  XAUUSD: {
    symbol: 'XAUUSD', name: 'XAU/USD', fullName: 'Gold / US Dollar',
    pip: 0.1, cat: 'Metals',
    metaDescription: 'Gold (XAU/USD) position size calculator. Calculate exact lot sizes for gold trading. Each $1 move = $100 per standard lot — precise sizing is critical.',
    intro: 'Gold is the world\'s premier safe-haven asset and the most-traded commodity in Forex markets. A $1 move in XAU/USD equals $100 profit or loss on a standard lot, making it one of the highest-stakes instruments to size correctly.',
    facts: [
      'Point value: $100 per standard lot per $1 move ($10 per 0.1 pip)',
      'Average daily range: $15–$40 (1,500–4,000 pips at 0.1 pip resolution)',
      'Moves sharply on USD data, inflation prints, and geopolitical events',
      'Key drivers: Federal Reserve rates, real yields, inflation, USD strength, geopolitics',
    ],
    relatedSymbols: ['XAGUSD', 'EURUSD', 'USDCHF', 'USOIL'],
  },
  XAGUSD: {
    symbol: 'XAGUSD', name: 'XAG/USD', fullName: 'Silver / US Dollar',
    pip: 0.01, cat: 'Metals',
    metaDescription: 'Silver (XAG/USD) position size calculator. Calculate lot sizes for silver trading — a volatile precious metal with industrial and safe-haven demand.',
    intro: 'Silver combines precious-metal safe-haven appeal with significant industrial demand (solar panels, electronics). XAG/USD typically moves 2–3× gold\'s percentage daily range, creating large risk-adjusted opportunities that require careful lot sizing.',
    facts: [
      'Point value: $50 per standard lot per $1 move',
      'Volatility is 2–3× gold in percentage terms',
      'Gold/Silver ratio trades between 70–90 historically',
      'Key drivers: Gold price, industrial demand, Fed policy, USD strength',
    ],
    relatedSymbols: ['XAUUSD', 'EURUSD', 'USOIL', 'AUDUSD'],
  },

  // ── COMMODITIES ─────────────────────────────────────────────────────────────
  USOIL: {
    symbol: 'USOIL', name: 'WTI Oil', fullName: 'WTI Crude Oil',
    pip: 0.01, cat: 'Commodities',
    metaDescription: 'WTI Crude Oil (USOIL) position size calculator. Calculate your oil trading lot size based on your account risk, stop loss distance, and point value.',
    intro: 'WTI Crude Oil is the US benchmark for energy markets. A $1 move in oil equals $1,000 per standard lot in most brokers (1 lot = 1,000 barrels). OPEC meetings, US inventory data, and geopolitical events can move oil $2–$5 in minutes.',
    facts: [
      'Point value: ~$10 per standard lot per $0.01 move (broker-dependent)',
      'Average daily range: $1–$3 ($100–$300 per mini lot)',
      'OPEC decisions and EIA inventory reports cause sharp spikes',
      'Key drivers: OPEC+ decisions, US inventory data, geopolitics, USD, demand forecasts',
    ],
    relatedSymbols: ['UKOIL', 'XAUUSD', 'USDCAD', 'CADJPY'],
  },
  UKOIL: {
    symbol: 'UKOIL', name: 'Brent Oil', fullName: 'Brent Crude Oil',
    pip: 0.01, cat: 'Commodities',
    metaDescription: 'Brent Crude Oil (UKOIL) position size calculator. Get the correct lot size for Brent oil trades based on your stop loss, account size, and risk tolerance.',
    intro: 'Brent Crude is the global benchmark for oil pricing, typically trading at a $1–$5 premium to WTI. It is more sensitive to Middle East geopolitics and European supply disruptions. Accurate position sizing is essential given its headline-driven volatility.',
    facts: [
      'Point value: ~$10 per standard lot per $0.01 move (broker-dependent)',
      'Brent typically trades $1–$5 above WTI',
      'More geopolitically sensitive than WTI',
      'Key drivers: Middle East tensions, OPEC+, European demand, USD strength',
    ],
    relatedSymbols: ['USOIL', 'XAUUSD', 'USDCAD', 'GBPUSD'],
  },

  // ── INDICES ─────────────────────────────────────────────────────────────────
  US30: {
    symbol: 'US30', name: 'US30', fullName: 'Dow Jones Industrial Average',
    pip: 1.0, cat: 'Indices',
    metaDescription: 'US30 (Dow Jones) position size calculator. Calculate exact lot sizes for Dow Jones index trading with correct point values and risk management formulas.',
    intro: 'The US30 (Dow Jones Industrial Average) tracks 30 large US companies. At $1 per point per standard lot for CFDs, a 300-point daily range creates significant profit and loss — making correct position sizing a fundamental discipline.',
    facts: [
      'Point value: $1 per point per standard lot (typical CFD structure)',
      'Average daily range: 200–500 points in normal conditions',
      'Blue-chip index — less volatile than NAS100',
      'Key drivers: Fed policy, US earnings, macroeconomic data, global risk sentiment',
    ],
    relatedSymbols: ['NAS100', 'SPX500', 'GER40', 'UK100'],
  },
  NAS100: {
    symbol: 'NAS100', name: 'NAS100', fullName: 'Nasdaq 100',
    pip: 1.0, cat: 'Indices',
    metaDescription: 'NAS100 (Nasdaq 100) position size calculator. Get the correct lot size for Nasdaq trading — one of the most volatile equity indices.',
    intro: 'The NAS100 (Nasdaq 100) is dominated by mega-cap tech stocks (Apple, Microsoft, Nvidia, Meta). Its daily range of 200–600 points and sensitivity to interest rate changes make precise position sizing critical for tech-index traders.',
    facts: [
      'Point value: $1 per point per standard lot',
      'Average daily range: 200–600 points — higher than Dow',
      'Top-heavy: top 10 stocks account for ~55% of index weight',
      'Key drivers: Fed rates, Big Tech earnings, AI/semiconductor news, inflation data',
    ],
    relatedSymbols: ['US30', 'SPX500', 'GER40', 'BTCUSD'],
  },
  SPX500: {
    symbol: 'SPX500', name: 'SPX500', fullName: 'S&P 500',
    pip: 1.0, cat: 'Indices',
    metaDescription: 'S&P 500 (SPX500) position size calculator. Calculate your lot size for S&P 500 index trades using institutional risk management parameters.',
    intro: 'The SPX500 (S&P 500) is the broadest benchmark of US large-cap stocks and the most closely watched equity index globally. Fed decisions, earnings seasons, and macro data drive its 30–80 point daily swings.',
    facts: [
      'Point value: $1 per point per standard lot',
      'Average daily range: 30–80 points (percentage basis: 0.7–2.0%)',
      'Broadest representation of US economy across all sectors',
      'Key drivers: Fed policy, US GDP, earnings seasons, inflation, global risk sentiment',
    ],
    relatedSymbols: ['NAS100', 'US30', 'GER40', 'UK100'],
  },
  GER40: {
    symbol: 'GER40', name: 'GER40', fullName: 'DAX 40 (Germany)',
    pip: 1.0, cat: 'Indices',
    metaDescription: 'GER40 (DAX 40) position size calculator. Calculate lot sizes for the German stock index with correct point values and account risk formulas.',
    intro: 'The GER40 (DAX 40) is Europe\'s premier stock index, tracking 40 of Germany\'s largest companies. It is highly sensitive to ECB policy and Eurozone economic data. Daily ranges of 100–300 points require careful position sizing for European session traders.',
    facts: [
      'Point value: $1 per point per standard lot (EUR-denominated — check broker conversion)',
      'Average daily range: 100–300 points',
      'Heavily weighted in industrials, autos, and financials',
      'Key drivers: ECB, Eurozone PMI, German factory orders, US equity sentiment',
    ],
    relatedSymbols: ['UK100', 'FRA40', 'SPX500', 'EURUSD'],
  },
  UK100: {
    symbol: 'UK100', name: 'UK100', fullName: 'FTSE 100 (United Kingdom)',
    pip: 1.0, cat: 'Indices',
    metaDescription: 'UK100 (FTSE 100) position size calculator. Size your FTSE 100 trades correctly using professional risk management — essential for London session traders.',
    intro: 'The UK100 (FTSE 100) tracks the 100 largest companies on the London Stock Exchange. Heavily weighted in energy and financials, it correlates with GBP/USD and commodity prices. Daily ranges of 50–150 points require precise lot sizing.',
    facts: [
      'Point value: $1 per point per standard lot (GBP-denominated — check broker conversion)',
      'Average daily range: 50–150 points',
      'Over 70% of FTSE revenue comes from outside the UK',
      'Key drivers: BoE, GBP strength, commodity prices, global risk sentiment',
    ],
    relatedSymbols: ['GER40', 'FRA40', 'SPX500', 'GBPUSD'],
  },
  FRA40: {
    symbol: 'FRA40', name: 'FRA40', fullName: 'CAC 40 (France)',
    pip: 1.0, cat: 'Indices',
    metaDescription: 'FRA40 (CAC 40) position size calculator. Calculate lot sizes for the French stock market index with professional risk parameters.',
    intro: 'The FRA40 (CAC 40) tracks 40 of France\'s largest companies including LVMH, TotalEnergies, and Airbus. It closely follows the GER40 and is driven by ECB policy and Eurozone economic conditions.',
    facts: [
      'Point value: $1 per point per standard lot (EUR-denominated)',
      'Average daily range: 80–200 points',
      'High correlation with GER40 (0.90+)',
      'Key drivers: ECB, Eurozone economic data, French corporate earnings',
    ],
    relatedSymbols: ['GER40', 'UK100', 'SPX500', 'EURUSD'],
  },
  JPN225: {
    symbol: 'JPN225', name: 'JPN225', fullName: 'Nikkei 225 (Japan)',
    pip: 1.0, cat: 'Indices',
    metaDescription: 'JPN225 (Nikkei 225) position size calculator. Size your Japan index trades correctly — particularly important given BoJ intervention risk.',
    intro: 'The JPN225 (Nikkei 225) tracks 225 of Japan\'s most prominent companies including Toyota, Sony, and SoftBank. It is closely tied to USD/JPY: a stronger Yen hurts Japanese exports and pushes the index lower. BoJ interventions create gap risk.',
    facts: [
      'Point value: $1 per point per standard lot (JPY-denominated — check broker)',
      'Average daily range: 200–500 points',
      'Strong negative correlation with Yen strength (USD/JPY)',
      'Key drivers: BoJ policy, USD/JPY rate, global tech sentiment, export demand',
    ],
    relatedSymbols: ['USDJPY', 'GER40', 'SPX500', 'HK50'],
  },
  HK50: {
    symbol: 'HK50', name: 'HK50', fullName: 'Hang Seng Index (Hong Kong)',
    pip: 1.0, cat: 'Indices',
    metaDescription: 'HK50 (Hang Seng) position size calculator. Calculate lot sizes for Hong Kong index trading — China-sensitive with high point volatility.',
    intro: 'The HK50 (Hang Seng Index) is the leading benchmark for Hong Kong equities and a key proxy for Chinese economic growth. It is highly sensitive to Beijing regulatory decisions and US-China relations, creating some of the widest daily ranges of any global index.',
    facts: [
      'Point value: $1 per point per standard lot (HKD-denominated — check broker)',
      'Average daily range: 300–800 points',
      'High sensitivity to China tech regulatory news',
      'Key drivers: China growth data, PBOC policy, US-China relations, Hong Kong politics',
    ],
    relatedSymbols: ['JPN225', 'GER40', 'SPX500', 'USDCNH'],
  },

  // ── CRYPTO ──────────────────────────────────────────────────────────────────
  BTCUSD: {
    symbol: 'BTCUSD', name: 'BTC/USD', fullName: 'Bitcoin / US Dollar',
    pip: 1.0, cat: 'Crypto',
    metaDescription: 'Bitcoin (BTC/USD) position size calculator. Manage crypto risk precisely — Bitcoin can move $1,000–$5,000 in a single session. Know your exact lot size.',
    intro: 'Bitcoin is the largest cryptocurrency by market cap and the most widely traded digital asset. It can move $1,000–$5,000+ in a single trading session — making rigorous position sizing the most critical element of any crypto risk strategy.',
    facts: [
      'Point value: $1 per point per standard lot (CFD structure)',
      'Average daily range: $1,000–$5,000+ depending on volatility regime',
      '24/7 trading — news can hit at any hour',
      'Key drivers: Fed policy/real rates, ETF flows, on-chain activity, regulatory news, macro sentiment',
    ],
    relatedSymbols: ['ETHUSD', 'SOLUSD', 'NAS100', 'XAUUSD'],
  },
  ETHUSD: {
    symbol: 'ETHUSD', name: 'ETH/USD', fullName: 'Ethereum / US Dollar',
    pip: 1.0, cat: 'Crypto',
    metaDescription: 'Ethereum (ETH/USD) position size calculator. Calculate your exact ETH lot size to avoid over-leveraged positions in this highly volatile asset.',
    intro: 'Ethereum is the leading smart-contract blockchain and the #2 cryptocurrency. ETH/USD typically moves 5–10% on major catalyst days, and its strong correlation with BTC means Bitcoin sell-offs usually drag ETH even harder.',
    facts: [
      'Point value: $1 per point per standard lot',
      'Average daily range: $50–$300+ depending on volatility regime',
      'Higher beta to Bitcoin — moves more in percentage terms',
      'Key drivers: ETH ETF flows, DeFi activity, Bitcoin price, staking yields, upgrades',
    ],
    relatedSymbols: ['BTCUSD', 'SOLUSD', 'NAS100', 'LINKUSD'],
  },
  SOLUSD: {
    symbol: 'SOLUSD', name: 'SOL/USD', fullName: 'Solana / US Dollar',
    pip: 0.01, cat: 'Crypto',
    metaDescription: 'Solana (SOL/USD) position size calculator. SOL is one of the most volatile major cryptos — calculate your exact lot size to protect your capital.',
    intro: 'Solana is the fastest-growing Layer-1 blockchain rival to Ethereum. SOL/USD experiences extreme volatility — 10–25% daily moves are not uncommon during altcoin season. Disciplined lot sizing is the only protection against account-wiping drawdowns.',
    facts: [
      'Point value: $1 per 0.01 move per standard lot',
      'Average daily range: $5–$30+ depending on market conditions',
      'High correlation with ETH during altcoin cycles',
      'Key drivers: Bitcoin price, Ethereum sentiment, Solana ecosystem growth, DEX volume',
    ],
    relatedSymbols: ['BTCUSD', 'ETHUSD', 'XRPUSD', 'ADAUSD'],
  },
  XRPUSD: {
    symbol: 'XRPUSD', name: 'XRP/USD', fullName: 'XRP / US Dollar',
    pip: 0.0001, cat: 'Crypto',
    metaDescription: 'XRP/USD position size calculator. Calculate your exact lot size for XRP trades — subject to regulatory catalysts and high short-term volatility.',
    intro: 'XRP (Ripple) is used for cross-border payments and is among the top 5 cryptocurrencies by market cap. XRP/USD is uniquely sensitive to SEC litigation news and Ripple partnership announcements, creating sharp news-driven spikes that punish oversized positions.',
    facts: [
      'Point value: $10 per 0.0001 move per standard lot',
      'Average daily range: $0.02–$0.15+ depending on volatility',
      'Uniquely sensitive to SEC regulatory outcomes',
      'Key drivers: Bitcoin price, SEC/Ripple legal status, payment network adoption',
    ],
    relatedSymbols: ['BTCUSD', 'ETHUSD', 'ADAUSD', 'LINKUSD'],
  },
  ADAUSD: {
    symbol: 'ADAUSD', name: 'ADA/USD', fullName: 'Cardano / US Dollar',
    pip: 0.0001, cat: 'Crypto',
    metaDescription: 'ADA/USD (Cardano) position size calculator. Manage your Cardano trade risk precisely — ADA moves sharply during altcoin season.',
    intro: 'Cardano (ADA) is a research-driven blockchain platform competing with Ethereum. ADA/USD tends to underperform in bear markets and outperform sharply during altcoin rallies, demanding careful lot sizing to navigate its high-amplitude swings.',
    facts: [
      'Point value: $10 per 0.0001 move per standard lot',
      'Tends to lag Bitcoin and ETH, then surge sharply in altcoin season',
      'Development roadmap updates can move ADA significantly',
      'Key drivers: Bitcoin price, ETH sentiment, Cardano protocol updates, staking yields',
    ],
    relatedSymbols: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD'],
  },
  DOTUSD: {
    symbol: 'DOTUSD', name: 'DOT/USD', fullName: 'Polkadot / US Dollar',
    pip: 0.01, cat: 'Crypto',
    metaDescription: 'Polkadot (DOT/USD) position size calculator. Calculate your exact lot size for DOT trades — a high-volatility altcoin with parachain-driven catalysts.',
    intro: 'Polkadot is a multi-chain blockchain protocol enabling interoperability between blockchains. DOT/USD is a high-beta altcoin that can double or halve in weeks during crypto cycle extremes, making position sizing discipline absolutely essential.',
    facts: [
      'Point value: $1 per 0.01 move per standard lot',
      'High beta to Bitcoin — amplifies both bull and bear moves',
      'Parachain auction results can create significant price catalysts',
      'Key drivers: Bitcoin price, DeFi sentiment, parachain ecosystem growth',
    ],
    relatedSymbols: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'LINKUSD'],
  },
  LINKUSD: {
    symbol: 'LINKUSD', name: 'LINK/USD', fullName: 'Chainlink / US Dollar',
    pip: 0.01, cat: 'Crypto',
    metaDescription: 'Chainlink (LINK/USD) position size calculator. Calculate exact lot sizes for LINK trades — oracle adoption news creates sharp price catalysts.',
    intro: 'Chainlink is the leading decentralized oracle network, connecting smart contracts to real-world data. LINK/USD is a mid-cap altcoin with high correlation to ETH and additional sensitivity to oracle adoption announcements.',
    facts: [
      'Point value: $1 per 0.01 move per standard lot',
      'Strong correlation with Ethereum (0.85+)',
      'Sensitive to DeFi TVL and oracle partnership announcements',
      'Key drivers: Bitcoin and ETH price, DeFi growth, Chainlink protocol updates',
    ],
    relatedSymbols: ['BTCUSD', 'ETHUSD', 'DOTUSD', 'SOLUSD'],
  },
};

export function getSlug(symbol: string): string {
  return symbol.toLowerCase();
}

export function getRelatedInstruments(symbol: string): InstrumentConfig[] {
  const inst = INSTRUMENTS[symbol];
  if (!inst) return [];
  return inst.relatedSymbols
    .map(s => INSTRUMENTS[s])
    .filter(Boolean)
    .slice(0, 4);
}

export function getInstrumentsByCategory(cat: InstrumentConfig['cat']): InstrumentConfig[] {
  return Object.values(INSTRUMENTS).filter(i => i.cat === cat);
}

export const CATEGORY_LABELS: Record<InstrumentConfig['cat'], string> = {
  'Forex Majors': 'Forex Major Pairs',
  'Forex Crosses': 'Forex Cross Pairs',
  'Metals': 'Precious Metals',
  'Indices': 'Stock Indices',
  'Crypto': 'Cryptocurrency',
  'Commodities': 'Commodities',
};

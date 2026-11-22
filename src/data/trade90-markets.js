// Rate-focused research pages for instruments US traders follow. Evergreen explanations only;
// every current figure on these pages comes from TRADE90's dated data, never from this file.
export const markets = [
  {
    slug: 'xauusd', symbol: 'XAUUSD', label: 'XAU/USD', name: 'Gold', longName: 'gold priced in US dollars',
    title: 'XAUUSD & Fed Rates: How Interest Rates Move Gold',
    h1: 'XAUUSD and Fed interest rates: how rates move gold',
    whatIs: 'XAU/USD is the price of one troy ounce of gold in US dollars. XAU is the ISO currency code for gold, and brokers usually list the market as XAUUSD.',
    lead: 'Gold pays no interest, so US interest rates set the opportunity cost of holding it.',
    mechanisms: [
      ['Opportunity cost', 'An ounce of gold earns nothing, while cash and Treasury bills earn close to the Fed funds rate. When US rates, and especially inflation-adjusted (real) yields, rise, holding gold costs more in forgone interest. When the Fed cuts or real yields fall, that cost shrinks.'],
      ['The dollar', 'Gold is priced in dollars. Higher US rates relative to other economies can support the dollar, which makes gold more expensive for buyers using other currencies and tends to weigh on XAU/USD. A weaker dollar works the other way.'],
      ['Inflation and safe-haven demand', 'Gold is also bought as a hedge against inflation, currency debasement and financial or geopolitical stress. Those motives can outweigh the interest-rate effect, which is why gold has at times risen even while US rates were high.']
    ],
    caveat: 'The link between gold and real yields is strong over long periods but not fixed. Central-bank gold buying, geopolitical demand and changes in inflation expectations can dominate for months at a time.',
    fedDay: ['Whether the decision matches expectations, since a surprise moves real yields first', 'Changes in the statement about inflation and future policy', 'The 2-year and 10-year Treasury yields and the dollar in the first hour', 'The dot plot at projection meetings, which shows how many cuts or hikes officials expect'],
    faq: [
      ['How do interest rates affect XAUUSD?', 'Higher US interest rates, and particularly higher real (inflation-adjusted) yields, raise the opportunity cost of holding gold, which pays no interest, and can strengthen the dollar it is priced in. Both tend to weigh on XAU/USD. Falling rates tend to have the opposite effect. Other forces, such as central-bank buying and safe-haven demand, can override this.'],
      ['What happens to gold when the Fed cuts rates?', 'A rate cut lowers the return on cash and often lowers real yields and the dollar, which is usually supportive for gold. If the cut was already fully expected, much of that effect may already be in the price, so the reaction depends on the guidance that comes with it.'],
      ['What is XAUUSD?', 'XAUUSD is the trading symbol for the price of one troy ounce of gold quoted in US dollars. XAU is gold’s ISO 4217 currency code.']
    ],
    relatedLearn: ['real-interest-rates-forex', 'how-to-prepare-for-central-bank-rate-decisions', 'hawkish-vs-dovish-central-banks'],
    relatedPairs: ['eur-usd', 'usd-jpy', 'usd-chf']
  },
  {
    slug: 'us100', symbol: 'US100', label: 'US100', name: 'Nasdaq 100', longName: 'the Nasdaq-100 index',
    title: 'US100 & Fed Rates: Nasdaq 100 Interest Rate Guide',
    h1: 'US100 and Fed interest rates: how rates move the Nasdaq 100',
    whatIs: 'US100 is the name many brokers use for contracts on the Nasdaq-100, an index of 100 of the largest non-financial companies listed on the Nasdaq stock market, weighted by market value. Technology and other growth companies make up a large share of it.',
    lead: 'Growth stocks are sensitive to interest rates because much of their value depends on profits expected far in the future.',
    mechanisms: [
      ['Discount rates and valuations', 'A share price reflects expected future profits discounted back to today. Higher interest rates raise the discount rate, which reduces the present value of distant profits more than near-term ones. Because the Nasdaq-100 is weighted towards growth companies, it often reacts more to changes in rate expectations than broader indices.'],
      ['Borrowing costs and investment', 'Higher rates make borrowing more expensive for companies and for the customers who buy their products, which can slow growth plans and spending.'],
      ['Risk appetite', 'Rate cuts and expectations of easier policy tend to support risk-taking, while unexpected tightening can push investors towards cash and bonds that now pay more.']
    ],
    caveat: 'Rates are one driver among several. Earnings of the largest constituents, which carry a heavy weight in the index, and themes such as artificial intelligence spending can dominate the effect of rates for long stretches.',
    fedDay: ['The decision against expectations and any change in guidance', 'The 2-year and 10-year Treasury yields: falling yields usually help growth stocks, rising yields usually weigh on them', 'The dot plot at projection meetings', 'Whether the reaction holds after the press conference, since first moves often reverse'],
    faq: [
      ['How do interest rates affect US100?', 'Higher rates and higher Treasury yields lower the present value of companies’ future profits, which matters most for growth companies that dominate the Nasdaq-100. Rising yields therefore often weigh on US100 and falling yields often support it, though earnings and other news can outweigh rates.'],
      ['What happens to the Nasdaq 100 when the Fed cuts rates?', 'Rate cuts and lower yields are usually supportive for growth stocks. The reaction on the day depends on whether the cut was expected and what the Fed signals about further moves; a cut made because the economy is weakening can come with falling profit expectations.'],
      ['What is US100?', 'US100 is a common broker name for contracts that track the Nasdaq-100 index of 100 large non-financial companies listed on Nasdaq. Prices can differ slightly from the cash index depending on whether the contract is based on the index or on futures.']
    ],
    relatedLearn: ['how-interest-rates-affect-forex', 'how-to-prepare-for-central-bank-rate-decisions', 'hawkish-vs-dovish-central-banks'],
    relatedPairs: ['usd-jpy', 'eur-usd', 'aud-usd']
  },
  {
    slug: 'us30', symbol: 'US30', label: 'US30', name: 'Dow Jones', longName: 'the Dow Jones Industrial Average',
    title: 'US30 & Fed Rates: Dow Jones Interest Rate Guide',
    h1: 'US30 and Fed interest rates: how rates move the Dow Jones',
    whatIs: 'US30 is the name many brokers use for contracts on the Dow Jones Industrial Average, an index of 30 large US companies. The Dow is price-weighted, so companies with higher share prices move it more, regardless of their overall size.',
    lead: 'The Dow holds more mature companies than the Nasdaq-100, so rates reach it mainly through the economic outlook rather than through growth valuations.',
    mechanisms: [
      ['Growth and earnings outlook', 'The Fed raises rates to slow demand and cuts to support it. Because the Dow includes industrial, consumer, healthcare and financial companies tied to the wider economy, it responds to what a Fed decision implies for growth and corporate profits.'],
      ['Valuations', 'Higher rates also raise the discount rate applied to future profits. Mature companies whose profits are earned sooner are usually less affected by this than long-duration growth stocks, which is one reason the Dow and the Nasdaq-100 can react differently to the same decision.'],
      ['Banks and financial members', 'Banks can earn wider lending margins when rates are higher, but tighter policy can also raise loan losses and slow lending. The net effect varies with the economic cycle.']
    ],
    caveat: 'Because the index is price-weighted and contains only 30 companies, news about a few high-priced members can move US30 more than a Fed decision does.',
    fedDay: ['The decision and statement against expectations', 'What the projections and press conference imply for growth, not only for rates', 'Treasury yields and the dollar for the broader risk reaction', 'Whether the move holds after the press conference'],
    faq: [
      ['How do interest rates affect US30?', 'Higher rates raise borrowing costs and are meant to slow the economy, which can weigh on the profits of the Dow’s companies, and they raise the discount rate on future earnings. The Dow is usually less sensitive to yield changes than the growth-heavy Nasdaq-100, but Fed surprises still move it.'],
      ['What happens to the Dow Jones when the Fed cuts rates?', 'Rate cuts usually support stocks by lowering borrowing costs and discount rates. The Dow’s reaction also depends on why the Fed is cutting: easing to prevent a slowdown is usually received better than cutting in response to a sharp downturn.'],
      ['What is US30?', 'US30 is a common broker name for contracts that track the Dow Jones Industrial Average, a price-weighted index of 30 large US companies.']
    ],
    relatedLearn: ['how-interest-rates-affect-forex', 'how-to-prepare-for-central-bank-rate-decisions', 'real-interest-rates-forex'],
    relatedPairs: ['usd-jpy', 'usd-cad', 'eur-usd']
  }
];
export const marketBySlug = slug => markets.find(m => m.slug === slug);

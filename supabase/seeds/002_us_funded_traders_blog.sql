-- Blog post: Best Prop Firms for US Traders 2026
-- Insert into blog_posts table in Supabase
-- Run this in the Supabase SQL editor or via CLI: supabase db push

INSERT INTO blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  feature_image,
  published_at,
  updated_at,
  status,
  tags,
  primary_tag,
  meta_title,
  meta_description,
  reading_time,
  author
) VALUES (
  gen_random_uuid(),
  'Best Prop Firms for US Traders 2026 — Pass the Funded Challenge With the 1% Rule',
  'best-prop-firms-us-traders-2026',
  'The US funded trading landscape shifted in 2023–2024. Which prop firms still accept American traders — and how do you pass a funded challenge using the 1% rule? The complete framework for US-based funded traders.',
  '<h2>Why US Traders Face Unique Challenges With Prop Firms</h2>
<p>Most forex prop firms operate outside the United States. That is not an accident — US financial regulation under the CFTC and NFA is among the strictest in the world. Several firms exited the US market or restricted American traders following regulatory pressure. That left thousands of US-based traders asking: which prop firms still accept Americans, and how do you actually pass one?</p>
<p>This guide covers the funded trading environment for US traders in 2026, which prop firms are still operating, and — most importantly — the exact risk management framework that consistently produces passes rather than failures.</p>

<h2>Prop Firms Still Accepting US Traders in 2026</h2>
<table>
<thead><tr><th>Firm</th><th>Challenge Type</th><th>Profit Share</th><th>US Friendly</th></tr></thead>
<tbody>
<tr><td>FTMO</td><td>1-phase, 2-phase</td><td>Up to 90%</td><td>Yes</td></tr>
<tr><td>The Funded Trader</td><td>Standard, Rapid</td><td>Up to 90%</td><td>Yes</td></tr>
<tr><td>MyFundedFX</td><td>1-step, 2-step</td><td>Up to 85%</td><td>Yes</td></tr>
<tr><td>Apex Trader Funding</td><td>Futures-focused</td><td>Up to 100%</td><td>Yes (futures)</td></tr>
<tr><td>Topstep</td><td>Futures-focused</td><td>Up to 90%</td><td>Yes (futures)</td></tr>
<tr><td>E8 Funding</td><td>Standard</td><td>Up to 80%</td><td>Yes</td></tr>
</tbody>
</table>
<p><strong>Note for US traders:</strong> Futures-focused firms like Apex and Topstep operate under a clearer regulatory framework in the US because futures markets fall under CFTC jurisdiction. If you trade indices or commodities, a US-based futures prop firm may offer the most frictionless path to funding.</p>

<h2>The Regulatory Reality US Funded Traders Must Understand</h2>
<p>Before depositing a challenge fee with any prop firm, US traders should understand: <strong>forex prop firms are not regulated brokers.</strong> Their challenge fees are not protected by SIPC or FDIC. If a firm closes, challenge fees are typically not recoverable.</p>
<p><strong>Due diligence checklist:</strong></p>
<ul>
<li>Check how long the firm has been operating (minimum 2 years)</li>
<li>Verify they have a track record of paying out funded traders</li>
<li>Read the terms around payout delays, scaling rules, and withdrawal conditions</li>
<li>Confirm they accept US payment methods</li>
</ul>
<p><strong>Tax considerations:</strong> Funded trading payouts received by US traders are taxable income. The tax treatment may differ from retail forex trading under IRC Section 1256. Consult a CPA familiar with trading income.</p>

<h2>The 1% Rule: Why It Is the Only Framework That Consistently Passes Challenges</h2>
<p>Regardless of which prop firm you choose, the evaluation criteria are nearly identical: 8–10% profit target, 4–5% maximum daily loss, and 8–10% maximum total drawdown. The challenge is not finding enough winning trades — it is keeping your drawdown clean while doing it.</p>
<p>This is where the <strong>0.5% institutional standard</strong> becomes the single most important number in your trading.</p>
<h3>The Math That Determines Pass or Fail</h3>
<table>
<thead><tr><th>Risk Per Trade</th><th>5 Consecutive Losses</th><th>Drawdown Impact</th><th>FTMO Status</th></tr></thead>
<tbody>
<tr><td>2.0%</td><td>-$10,000</td><td>-10%</td><td><strong>FAILED</strong></td></tr>
<tr><td>1.0%</td><td>-$5,000</td><td>-5%</td><td><strong>Borderline</strong></td></tr>
<tr><td>0.5%</td><td>-$2,500</td><td>-2.5%</td><td><strong>Safe</strong></td></tr>
<tr><td>0.25%</td><td>-$1,250</td><td>-1.25%</td><td><strong>Conservative</strong></td></tr>
</tbody>
</table>
<p>Losing streaks of five or more trades are not rare. Over a 30-day evaluation, most traders experience at least one cluster of three to five consecutive losses. At 2% risk, that cluster ends the challenge. At 0.5% risk, it costs 2.5% — painful, recoverable, and within challenge rules.</p>
<p><strong>The 1% rule is the ceiling. The institutional standard is 0.5%.</strong></p>

<h2>The Position Sizing Formula Used by Every Professional</h2>
<p>Every trade during a funded challenge must have a pre-calculated lot size:</p>
<p><code>Lot Size = (Account Balance × Risk%) ÷ (Stop Loss in Pips × Pip Value per Lot)</code></p>
<p><strong>Example — EUR/USD on a $100,000 challenge account:</strong></p>
<ul>
<li>Account: $100,000 | Risk: 0.5% = $500 | Stop loss: 25 pips</li>
<li>EUR/USD pip value: $10 per lot</li>
<li><strong>Lot size = $500 ÷ (25 × $10) = 2.00 lots</strong></li>
</ul>
<p><strong>Example — Gold (XAU/USD) on the same account:</strong></p>
<ul>
<li>Account: $100,000 | Risk: 0.5% = $500 | Stop loss: 80 points</li>
<li>Gold pip value: $1.00 per point per lot</li>
<li><strong>Lot size = $500 ÷ (80 × $1.00) = 0.625 lots → round to 0.62 lots</strong></li>
</ul>
<p>Use <a href="/">TRADE90''s position sizer</a> to handle this instantly across all 45+ instruments including forex, gold, indices, and crypto.</p>

<h2>The Complete US Trader Challenge Framework</h2>
<h3>Rule 1 — Risk 0.1% to 0.5% Per Trade Maximum</h3>
<p>Never exceed 0.5% per trade during any evaluation. This is not about being timid — it is about surviving long enough for your edge to produce results across a statistically meaningful sample of trades.</p>
<h3>Rule 2 — Two Trades Per Day Maximum</h3>
<p>Over-trading is the most common cause of challenge failure after oversizing. Two trades per day forces selectivity. After two trades — win, lose, or draw — close the platform.</p>
<h3>Rule 3 — Check the ADR Before Every Entry</h3>
<p>The Average Daily Range tells you how much room the pair has left to move. Calculate: <strong>Daily Range Consumed = (Today''s High − Today''s Low) ÷ ADR × 100</strong>. If the result is above 70%, pass on the trade.</p>
<h3>Rule 4 — Stop Outside Volatility Noise, Target Inside Remaining Range</h3>
<p>Your stop loss should be placed where, if hit, the original trade idea is genuinely wrong. Your target should be achievable within the remaining daily range.</p>

<h2>Instruments US Funded Traders Favor in 2026</h2>
<h3>Forex Majors</h3>
<p><strong>EUR/USD</strong> — Most liquid pair. ADR of 60–90 pips. Tight spreads, predictable volatility during London/New York overlap. Best for technical price action traders.</p>
<p><strong>GBP/USD</strong> — Higher ADR (80–120 pips). Better reward potential but requires wider stops.</p>
<p><strong>USD/JPY</strong> — Sensitive to US interest rate news and risk sentiment. ADR of 70–100 pips.</p>
<h3>Gold (XAU/USD)</h3>
<p>Gold remains the most popular instrument among US funded traders in 2026. Its $10 pip value per lot means tight stops translate to meaningful lot sizes. ADR of 1,500–2,500 points. Use the <a href="/calculator/xauusd/">TRADE90 gold position size calculator</a> before every entry.</p>
<h3>US Indices</h3>
<p><strong>NAS100 (Nasdaq)</strong> — Correlated with tech sector earnings and Fed rate expectations. ADR of 150–300 points at $1 per point.</p>
<p><strong>US30 (Dow Jones)</strong> — Lower volatility than NAS100 with strong intraday trends. ADR of 200–400 points at $1 per point.</p>

<h2>The Mindset Gap Between Traders Who Pass and Traders Who Fail</h2>
<p>Most traders who fail funded challenges are technically competent. The failure is almost always psychological — the inability to accept slow progress.</p>
<p>Traders who consistently pass share three traits:</p>
<ol>
<li><strong>They treat the evaluation as a process, not an event.</strong> Firms want consistency — not explosive weeks followed by catastrophic drawdowns.</li>
<li><strong>They do not chase the profit target.</strong> When close to the target with days remaining, the temptation to push harder is where most challenges fail in the final third of the evaluation.</li>
<li><strong>They have a pre-defined response to losing days.</strong> Before the trading day begins, they know exactly what they will do if they hit their personal daily loss limit. The answer is always: close the platform and return tomorrow.</li>
</ol>

<h2>Pre-Trade Checklist for US Funded Traders</h2>
<ul>
<li>Which prop firm rules apply today — have I reviewed the daily and max DD limits?</li>
<li>What is the ADR for this instrument today?</li>
<li>How much of the daily range has already been consumed?</li>
<li>Is my risk within 0.5% of the challenge account balance?</li>
<li>Have I calculated the exact lot size using the <a href="/">TRADE90 position sizer</a>?</li>
<li>Is my stop loss outside the intraday volatility noise?</li>
<li>Is my target within the remaining daily range?</li>
<li>Is this my first or second trade today?</li>
<li>What is my one-sentence reason this setup should work?</li>
</ul>

<h2>Summary</h2>
<p>Passing a funded trading challenge as a US trader in 2026 requires three things: choosing a reputable prop firm that accepts US traders, applying institutional risk management on every trade, and having the psychological discipline to execute consistently over 30 days.</p>
<p>The 1% rule — more precisely, the 0.5% institutional standard — is the framework that keeps your drawdown clean while your edge accumulates into a passing result. Use <a href="/">TRADE90''s free position size calculator</a> to verify your lot size across all 45+ instruments before every entry. The math protects your evaluation so your emotions do not have to.</p>
<hr>
<p><em>TRADE90 provides free institutional-grade risk tools for independent traders. All trading involves risk. Funded account challenges are not guaranteed to result in funded accounts. US traders should ensure compliance with applicable CFTC and NFA regulations and consult a qualified tax professional regarding the treatment of trading income.</em></p>',
  NULL,
  NOW(),
  NOW(),
  'published',
  ARRAY[
    'Funded Trading',
    'US Traders',
    'Prop Firms',
    'Risk Management',
    '1% Rule',
    'FTMO',
    'Position Sizing',
    'Challenge Strategy'
  ],
  'Funded Trading',
  'Best Prop Firms for US Traders 2026 — Pass the Challenge With the 1% Rule | TRADE90',
  'Which prop firms accept US traders in 2026? Full guide on FTMO alternatives, the 1% rule, and the exact risk framework that passes funded trading challenges. Free position sizing calculator included.',
  12,
  'TRADE90'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  updated_at = NOW(),
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  primary_tag = EXCLUDED.primary_tag,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  reading_time = EXCLUDED.reading_time;

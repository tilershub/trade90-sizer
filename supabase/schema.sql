-- ============================================================
-- TRADE90 Blog — Supabase Schema
-- Run this in the Supabase SQL editor to set up the blog.
-- ============================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  excerpt       TEXT,
  content       TEXT,                          -- Full HTML body
  feature_image TEXT,                          -- Absolute URL to cover image
  status        TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published')),
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  primary_tag   TEXT,                          -- First / most relevant tag
  meta_title    TEXT,                          -- SEO override (falls back to title)
  meta_description TEXT,                       -- SEO override (falls back to excerpt)
  reading_time  INT,                           -- Minutes (auto-calculated by app if NULL)
  author        TEXT        NOT NULL DEFAULT 'TRADE90',
  published_at  TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug       ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_pub ON blog_posts (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags       ON blog_posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_primary    ON blog_posts (primary_tag) WHERE status = 'published';

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Row Level Security (public read for published posts)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- ============================================================
-- 5. Seed — first post (converted from content/posts/)
-- ============================================================
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  status,
  tags,
  primary_tag,
  reading_time,
  published_at
) VALUES (
  'How US Forex Traders Pass Funded Account Challenges: The Volatility-Adjusted Risk Blueprint',
  'how-to-pass-funded-account-challenge',
  'Most funded account challenges are not won by finding better trades — they are won by surviving long enough to let the edge play out. This guide shows US-based forex traders exactly how to size, enter, and exit trades to keep drawdown clean and consistency scores high.',
  '<p>Most funded account challenges are not won by finding better trades. They are won by surviving long enough to let the edge play out. The majority of traders fail in the first two weeks — not because the market beat them, but because their own position sizing did.</p>

<p>This guide is built around one principle: <strong>slow, steady, and surgical</strong>. If you are a US-based forex trader preparing for a funded challenge, the framework below will show you exactly how to size, enter, and exit trades in a way that keeps your drawdown clean and your consistency score high.</p>

<hr>

<h2>The Rule Set That Keeps You In The Game</h2>

<p>Before you place a single trade, you need to lock in four non-negotiable rules. These are not suggestions. They are hard limits that exist specifically because funded evaluation firms track them.</p>

<h2>Rule 1 — Risk Per Trade: 0.1% to 0.5% Maximum</h2>

<p>This is the single most important number in your entire challenge.</p>

<p>Most retail traders risk 1–2% per trade. That feels reasonable in a demo account. In a funded evaluation, one losing streak of five trades at 2% risk wipes out 10% — and most challenges have a maximum daily drawdown of 4–5% and a maximum total drawdown of 8–10%. You are essentially one bad session away from failing at 2% risk per trade.</p>

<p><strong>The institutional standard is 0.1% to 0.5% per trade.</strong></p>

<table>
  <thead><tr><th>Risk Per Trade</th><th>5-Trade Losing Streak</th><th>Impact on $100k Account</th></tr></thead>
  <tbody>
    <tr><td>2.0%</td><td>5 losses</td><td>-$10,000 (-10%)</td></tr>
    <tr><td>1.0%</td><td>5 losses</td><td>-$5,000 (-5%)</td></tr>
    <tr><td>0.5%</td><td>5 losses</td><td>-$2,500 (-2.5%)</td></tr>
    <tr><td>0.25%</td><td>5 losses</td><td>-$1,250 (-1.25%)</td></tr>
  </tbody>
</table>

<p>At 0.5% risk, even five consecutive losses only cost you 2.5%. Your drawdown remains within challenge limits, your mindset stays disciplined, and you remain eligible to trade the next day.</p>

<p><strong>For a single trade idea — one setup, one entry — your maximum exposure is 0.5%.</strong> Do not add to a losing position. Do not pyramid beyond one entry per idea. One idea, one entry, 0.5% maximum.</p>

<hr>

<h2>Rule 2 — Maximum Two Trades Per Day</h2>

<p>Two. That is your daily limit.</p>

<p>This is not about being passive. It is about being selective. The market generates dozens of patterns each session, but the highest-probability setups that align with your system, the volatility context, and the institutional order flow are rare. When you cap yourself at two trades per day, you are forced to wait for only the best ones.</p>

<p><strong>What over-trading really costs:</strong></p>

<p>A trader who takes 6 trades per day at 0.3% risk per trade on a choppy day loses 1.8% in commissions, spread, and bad fills alone — before a single stop is hit. A trader who takes 2 trades per day on only the clearest setups loses 0.6% in overhead and dramatically increases the probability that each trade is genuinely high-conviction.</p>

<p><strong>Rule: When you hit two trades — whether winning, losing, or breakeven — you close the platform.</strong></p>

<hr>

<h2>Rule 3 — Calibrate Every Trade to the ADR</h2>

<p>ADR stands for <strong>Average Daily Range</strong>. It measures how far a currency pair typically moves in a single day, calculated as the average of the true daily ranges over the past 5 to 14 days.</p>

<p>Before entering any trade, you must know the ADR for that pair. Why? Because it tells you whether price has already moved enough for the day to justify the trade, or whether it still has room to run.</p>

<p><strong>How to use ADR before entry:</strong></p>
<ul>
  <li>Calculate the current day''s range (high minus low from the daily open)</li>
  <li>Divide it by the ADR to get the <strong>Daily Range Consumption</strong></li>
  <li>If the pair has already consumed more than 70–80% of its ADR before your entry, the trade is high-risk. Price is statistically likely to stall, reverse, or chop</li>
</ul>

<p><strong>Example — EUR/USD:</strong></p>

<table>
  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
  <tbody>
    <tr><td>14-day ADR</td><td>85 pips</td></tr>
    <tr><td>Today''s range so far</td><td>67 pips</td></tr>
    <tr><td>Daily range consumed</td><td>78.8%</td></tr>
    <tr><td>Verdict</td><td>High-risk entry — wait or skip</td></tr>
  </tbody>
</table>

<p>If EUR/USD has already traveled 67 pips of its 85-pip average range, entering a long position expecting another 30-pip move toward resistance means you are demanding price to move 35% beyond its statistical daily capacity. That setup fails far more often than it works.</p>

<p><strong>Lower daily range consumption = more room to run = higher probability trade.</strong></p>

<hr>

<h2>Rule 4 — Profit Targets Inside Volatility, Exits Away From It</h2>

<p>This is the concept that separates traders who consistently profit from those who consistently watch winning trades reverse.</p>

<p><strong>Set your profit target within the volatility zone.</strong></p>

<p>Your target should sit comfortably inside the ADR. If the ADR is 85 pips and the pair has consumed 30 pips today, a realistic profit target is 30–45 pips — something achievable within the remaining daily range. Targets beyond the ADR require exceptional, high-conviction confluences and should be reserved for trending market conditions only.</p>

<p><strong>Place your exit (stop loss) away from the volatility zone.</strong></p>

<p>Your stop loss should sit in a location where, if price reaches it, the original trade thesis is genuinely invalidated — not just shaken. A stop that is placed too tight inside the normal volatility range will be clipped by natural price noise before the trade ever has a chance to work.</p>

<ul>
  <li><strong>Target:</strong> 50–75% of the remaining daily range</li>
  <li><strong>Stop:</strong> Below/above the structural level that invalidates the trade idea — outside the noise of normal intraday volatility</li>
</ul>

<hr>

<h2>The Mindset: Returns Come Slowly, But Steadily</h2>

<p>Funded account challenges are designed to test patience. The evaluation period is typically 30–60 trading days. Firms want to see consistency, not a single massive winning week followed by a catastrophic drawdown week.</p>

<table>
  <thead><tr><th>Week</th><th>Trades</th><th>Avg Risk</th><th>Win Rate</th><th>Net P&amp;L</th></tr></thead>
  <tbody>
    <tr><td>Week 1</td><td>8 trades</td><td>0.35%</td><td>55%</td><td>+1.4%</td></tr>
    <tr><td>Week 2</td><td>7 trades</td><td>0.35%</td><td>57%</td><td>+1.2%</td></tr>
    <tr><td>Week 3</td><td>10 trades</td><td>0.35%</td><td>50%</td><td>+0.7%</td></tr>
    <tr><td>Week 4</td><td>8 trades</td><td>0.35%</td><td>62%</td><td>+1.8%</td></tr>
    <tr><td><strong>Month Total</strong></td><td><strong>33 trades</strong></td><td>—</td><td><strong>56%</strong></td><td><strong>+5.1%</strong></td></tr>
  </tbody>
</table>

<p>5.1% monthly return with a max daily loss that never exceeded 0.7% and a max total drawdown that stayed under 2.5%. That account passes most challenge evaluations and gets funded.</p>

<p><strong>The tortoise wins the funded challenge. Every time.</strong></p>

<hr>

<h2>Pre-Trade Checklist</h2>

<ul>
  <li>What is the ADR for this pair today?</li>
  <li>How much of the daily range has already been consumed?</li>
  <li>Is there enough range remaining to justify the target?</li>
  <li>Is my risk within 0.1%–0.5% of account balance?</li>
  <li>Is my stop loss placed outside normal intraday volatility?</li>
  <li>Is my target within the remaining daily range?</li>
  <li>Is this my first or second trade today?</li>
  <li>What is the one sentence reason this trade should work?</li>
</ul>

<p>If you cannot answer every item on that list confidently, do not enter the trade. Wait for the next session. There will always be another setup.</p>

<hr>

<h2>Summary</h2>

<p>Passing a funded account challenge as a US forex trader is a process, not an event. It rewards the trader who:</p>

<ul>
  <li>Risks <strong>0.1%–0.5% per trade</strong> — never more, never compounding a single idea beyond 0.5%</li>
  <li>Trades a <strong>maximum of two times per day</strong> — quality over quantity, always</li>
  <li>Checks <strong>ADR before every entry</strong> — knowing how much range the market has left</li>
  <li>Targets <strong>profits inside the volatility zone</strong> — realistic, achievable, consistent</li>
  <li>Places <strong>stops outside the volatility noise</strong> — where the thesis is genuinely wrong</li>
  <li>Accepts that <strong>returns accumulate slowly</strong> — 1–2% per week compounds to life-changing capital when managed consistently</li>
</ul>

<p>Use the TRADE90 position sizer before every trade to confirm your lot size, check the ADR consumption, and validate that your risk exposure stays within challenge limits. The math does the discipline so your emotions do not have to.</p>',
  'published',
  ARRAY['FTMO', 'Funded Trading', 'Risk Management', 'Forex', 'Position Sizing', 'USA'],
  'Funded Trading',
  8,
  now() - interval '7 days'
);

-- ============================================================
-- Environment variables required in .env / Vercel / Netlify:
--
--   PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
--   PUBLIC_SUPABASE_ANON_KEY = your-anon-key
-- ============================================================

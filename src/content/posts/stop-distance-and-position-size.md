---
title: "What Is Stop Distance and How Does It Determine Your Position Size?"
excerpt: "Two traders with the same account and the same risk percentage can end up with lot sizes that are 5× apart — simply because one uses a 20-pip stop and the other uses a 100-pip stop. Stop distance is the variable most traders underestimate. Here is how it works."
published_at: "2026-04-30"
updated_at: "2026-04-30"
tags:
  - "Stop Loss"
  - "Position Sizing"
  - "Risk Management"
  - "Forex"
  - "Stop Distance"
primary_tag: "Position Sizing"
meta_title: "What Is Stop Distance and How Does It Determine Your Position Size? | TRADE90"
meta_description: "Stop distance and position size explained: inverse relationship, worked examples, instrument ATR guide, and funded account daily risk caps. Free calculator."
reading_time: 9
author: "TRADE90"
---

Picture two traders. Both have $10,000 accounts. Both use 1% risk — a maximum of $100 per trade. Both are trading EUR/USD. One places their stop loss 20 pips from their entry. The other places it 100 pips away. Despite identical accounts and identical risk percentages, the first trader opens a position of 0.50 lots and the second opens 0.10 lots. Their positions are five times different in size. The only variable that changed was stop distance.

Stop distance is the most misunderstood component of position sizing, because it is the variable that traders most often choose for the wrong reasons. This guide explains what stop distance is, how it feeds into position size calculation, and why your stop should be placed at the right level first — then your lot size calculated from there, never the other way around.

---

## What Stop Distance Is

Stop distance is the number of pips (or points, or dollars, depending on the instrument) between your entry price and your stop loss order.

If you enter EUR/USD long at 1.08500 and place your stop at 1.08200, your stop distance is 30 pips. If you enter XAUUSD long at $2,350 and place your stop at $2,335, your stop distance is $15 (or 1,500 pips in gold's pip notation — but for position sizing, the dollar distance is what matters).

Stop distance serves a dual purpose:
1. It defines the price level at which your trade idea is invalidated — the point where the market has proven you wrong
2. It feeds directly into the position size formula to determine how many lots you should trade

Both purposes matter equally. Most traders focus only on the second without adequately addressing the first.

---

## How Stop Distance Feeds Into Position Size

The position size formula shows exactly how stop distance and lot size are connected:

```
Dollar Risk = Account Balance × Risk Percentage
Lot Size = Dollar Risk ÷ (Stop Loss in Pips × Pip Value per Lot)
```

Stop distance appears in the denominator. This means the relationship between stop distance and lot size is inverse: **as stop distance increases, lot size decreases by the same proportion.**

Double the stop distance → half the lot size.  
Cut the stop distance in half → double the lot size.

For EUR/USD where pip value per standard lot = $10:

```
Lot Size = ($10,000 × 0.01) ÷ (Stop Pips × $10)
Lot Size = $100 ÷ (Stop Pips × $10)
```

With a 50-pip stop: $100 ÷ $500 = 0.20 lots  
With a 100-pip stop: $100 ÷ $1,000 = 0.10 lots

The [TRADE90 position size calculator](/) computes this instantly — enter your balance, risk %, instrument, and stop distance to get the exact lot size.

---

## Stop Distance vs Lot Size — The Inverse Relationship in Numbers

Here is exactly how different stop distances translate to lot sizes on a $10,000 account at 1% risk on EUR/USD:

| Stop Distance (pips) | Dollar Risk (1%) | Pip Value (1 lot) | Resulting Lot Size | Dollar Risk per Pip |
|---|---|---|---|---|
| 20 pips | $100 | $10/pip | 0.50 lots | $5.00/pip |
| 50 pips | $100 | $10/pip | 0.20 lots | $2.00/pip |
| 100 pips | $100 | $10/pip | 0.10 lots | $1.00/pip |
| 150 pips | $100 | $10/pip | 0.067 lots | $0.67/pip |
| 200 pips | $100 | $10/pip | 0.05 lots | $0.50/pip |

The dollar risk ($100) is identical in every row — that is the entire point of percentage-based sizing. The lot size shrinks as stop distance widens because each pip is worth less money relative to the total risk budget.

This table illustrates something critical: going from a 20-pip stop to a 100-pip stop does not mean you are taking more risk — you are taking exactly the same dollar risk, just spread across more pips.

---

## The Trap — Tightening Your Stop to Trade Bigger

One of the most common and destructive position sizing errors is placing a tight stop in order to justify a larger position size.

The logic sounds reasonable: "If I move my stop from 50 pips to 25 pips, I can double my position size and still risk only 1%." Mathematically, this is correct. Practically, it is a path to consistent losses.

**Why tight stops fail:**

**Market noise exceeds the stop:** Every currency pair and instrument has a characteristic level of intraday noise — random price fluctuations that have nothing to do with whether your trade idea is correct. EUR/USD commonly moves 30–50 pips within a single hour without any trend. A 20-pip stop on an H1 chart will be triggered by noise the majority of the time, regardless of whether your directional bias was right.

**You are reversing the process:** The correct sequence is (1) identify where the trade is invalid, (2) place the stop there, (3) calculate position size. If you set the stop based on how large a position you want, you have skipped step 1 entirely and your stop has no market structure rationale.

**Win rate collapses:** Traders who systematically use stops that are too tight for the timeframe they are trading see their win rate drop to 30–35% even on strategies that should produce 50%+. The edge is not in the direction — it is in the stop placement.

The rule is simple: **place your stop where the trade is wrong, then calculate how many lots you can trade within your risk budget at that stop.**

---

## Structural Stops vs Arbitrary Stops

A structural stop is placed at a level where the market has given you clear information that your trade idea is incorrect. This is the only rational basis for stop placement.

**Examples of structural stop placement:**

- Long trade: stop placed below the nearest significant swing low or support level
- Short trade: stop placed above the nearest significant swing high or resistance level
- Breakout trade: stop placed back inside the range being broken (below the breakout candle's base)
- Trend continuation: stop placed below the most recent higher low in an uptrend

**Examples of arbitrary stop placement (avoid these):**

- "I want a 20-pip stop" → sized backward from a desired lot size
- "I always use 30 pips" → fixed regardless of structure
- "My broker minimum is 10 pips" → regulatory minimum as a trading decision
- "I'll move it to break even at +15 pips" → not a stop placement logic at all

Structural stops vary because market structure varies. Sometimes the nearest logical structure level is 25 pips away; sometimes it is 80 pips. This variation is not a problem — it is information. When a trade's structural stop requires more pips, your lot size automatically adjusts downward through the formula. You always risk the same dollar amount regardless.

---

## Average Stop Distances by Instrument and Timeframe

If you are new to an instrument, or returning after time away, these reference figures show typical structural stop distances across timeframes:

| Instrument | M15 Stop Range | H1 Stop Range | H4 Stop Range | D1 Stop Range |
|---|---|---|---|---|
| EUR/USD | 10–25 pips | 20–50 pips | 40–100 pips | 80–200 pips |
| GBP/USD | 15–35 pips | 30–70 pips | 60–130 pips | 100–250 pips |
| XAUUSD (Gold) | $2–$6 | $5–$15 | $12–$30 | $25–$80 |
| NAS100 | 30–80 pts | 60–150 pts | 120–300 pts | 250–600 pts |
| USD/JPY | 10–25 pips | 20–50 pips | 40–90 pips | 80–180 pips |

These are ranges for structural stop placement, not recommendations. Your actual stop in any trade should be based on the specific price structure visible on the chart. These figures tell you what to expect so you can assess whether a potential trade's stop placement is unusually tight (red flag) or appropriately set for the timeframe.

For gold-specific position sizing guidance, the [XAUUSD position sizing calculator](/calculator/xauusd/) handles the dollar-based pip value calculation automatically.

---

## How Volatility Affects the Minimum Viable Stop Distance

Stop distance should scale with volatility. When a market is moving more, you need more distance between entry and stop to avoid being shaken out by normal price action.

The **Average True Range (ATR)** indicator measures the average daily (or candle-by-candle) price range over a set period — typically 14 periods. A commonly used rule of thumb is that your stop loss should be at least 1× ATR on the timeframe you are trading, to ensure normal volatility does not trigger it before the trade has a chance to move in your direction.

```
Minimum Stop Distance = ATR(14) on your trading timeframe
```

For EUR/USD on H1 with an ATR of 15 pips, the minimum viable stop is approximately 15 pips — anything tighter will be routinely hit by normal price movement.

For XAUUSD on H1 with an ATR of $8, the minimum viable stop is $8–$10. This directly feeds into your position size calculation.

If structural analysis suggests a stop at 40 pips but the ATR is 50 pips, consider stepping up to the H4 timeframe where stop distances are wider and more appropriate for the current volatility environment.

---

## Stop Distance and Daily Risk Caps in Funded Accounts

In funded prop firm accounts, stop distance has an additional constraint: your daily loss limit effectively creates a maximum number of trades you can take at any given risk percentage.

For a $100,000 funded account with a 5% daily loss limit ($5,000):
- At 0.5% risk per trade ($500): 10 losing trades trigger the daily limit
- At 1% risk per trade ($1,000): 5 losing trades trigger the daily limit

But stop distance also affects this indirectly. Traders who use very tight stops on volatile instruments will get stopped out more frequently on normal days, consuming their daily limit faster even without taking more trades.

For funded accounts, the recommended practice is:
- Use stop distances appropriate to the timeframe (structural, not arbitrary)
- Ensure the stop is wide enough to survive at least 30 minutes of normal volatility post-entry
- Set a self-imposed daily limit of 2% (not the firm's 5%), giving buffer for unexpected losing days
- Calculate lot size using 0.5% risk maximum regardless of stop distance

---

## FAQ

**How do I calculate stop distance in pips?**

Stop distance is the number of pips between your entry price and stop loss price. For EUR/USD: if entry is 1.09000 and stop is 1.08950, distance = 5 pips. For JPY pairs, pips are measured at the second decimal place (e.g., USD/JPY 147.50 entry, 147.10 stop = 40 pips). For gold, stop distance is measured in dollars of price movement (e.g., $2,350 entry, $2,340 stop = $10 stop distance, or 1,000 pips in gold's technical notation).

**Should I use a tighter stop with a bigger position?**

No — this reverses the correct process. Your stop should be placed at the level where your trade idea is wrong, independent of position size. Position size is then calculated from that stop distance and your risk budget. Using a tight stop solely to justify a bigger position leads to systematic stop-out before moves develop, destroying win rate.

**What is the minimum stop loss in forex?**

Brokers typically enforce a minimum stop distance of 1–5 pips on most major pairs to prevent stop orders from clustering too close to current price. But the practical minimum for survivable trading on M15 is 15–20 pips for EUR/USD; on H1 it is 25–40 pips. Below these levels, market noise will trigger stops routinely.

**How does stop distance affect pip risk?**

Stop distance does not change your dollar risk — your risk percentage does that. What stop distance changes is your pip exposure (how much you lose per pip of adverse movement). A 20-pip stop with 0.50 lots = $5 per pip exposure. A 100-pip stop with 0.10 lots = $1 per pip exposure. Both lose $100 if stopped out — but the 20-pip stop position has 5× the per-pip sensitivity to price movement.

**What stop distance should I use for gold trading?**

Gold (XAUUSD) on H1 typically requires a stop distance of $5–$15 depending on where nearby support or resistance sits. On H4, stops of $12–$30 are common. Daily chart trades often require $25–$80 stops. Because gold moves fast in dollar terms, always calculate your lot size using the dollar amount of the stop (not pips) in the position size formula.

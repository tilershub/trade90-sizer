---
title: "How to Calculate Position Size for Your Stop Loss — The Correct Method"
excerpt: "Most traders set their stop loss after deciding their lot size. This is backwards — and the primary cause of oversizing. Here's the correct order and the formula that makes it automatic."
published_at: "2026-05-10"
updated_at: "2026-05-10"
tags:
  - "Stop Loss"
  - "Position Sizing"
  - "Formula"
  - "Forex"
  - "Risk Management"
primary_tag: "Position Sizing"
meta_title: "How to Calculate Position Size for Your Stop Loss — The Correct Method | TRADE90"
meta_description: "The correct order: stop loss first, position size second. Includes the formula, worked examples for forex and gold, ATR-based stops, and a free position size calculator."
reading_time: 9
author: "TRADE90"
---

The stop loss tells you where the trade is wrong. The position size tells you how much it costs to be wrong. Calculate the stop first — the position size is a mathematical consequence of that decision, not a separate choice.

---

## The Correct Order of Operations

Most retail traders do this:
1. Decide they want to trade 0.50 lots
2. Place a stop wherever it "fits" their P&L tolerance

Professional traders do this:
1. Identify where the trade is structurally invalidated → that is the stop
2. Calculate the position size that keeps risk at 0.5–1%
3. Enter the trade at the correct lot size

The difference: in the first approach, position size drives stop placement. In the second, market structure drives stop placement, and position size adapts. The second approach survives losing streaks. The first does not.

---

## The Position Size Formula (Stop-First)

```
Dollar Risk    = Account Balance × (Risk % ÷ 100)
Stop Pips      = |Entry Price − Stop Loss Price| ÷ Pip Size
Lot Size       = Dollar Risk ÷ (Stop Pips × Pip Value)
```

The stop loss distance (in pips) is the input. The lot size is the output. Never reverse this.

---

## Types of Stop Loss and How Each Affects Sizing

### 1. Structure-Based Stop (Most Common)

Place the stop below a key support level (long) or above a key resistance (short). The stop distance is determined by where the level is — not by how many pips you want to risk.

**EUR/USD long, $25,000 account, 0.5% risk ($125)**  
Entry: 1.08500 | Structure support: 1.08150 | Stop: 1.08100 (40-pip gap below support)

```
Stop Pips  = (1.08500 − 1.08100) ÷ 0.0001 = 40 pips
Lot Size   = $125 ÷ (40 × $10) = 0.31 lots → 0.30 lots
```

### 2. ATR-Based Stop

Average True Range (ATR) measures recent volatility. A common rule: stop = 1.5× to 2× the daily ATR.

**EUR/USD daily ATR = 80 pips. Stop = 1.5× ATR = 120 pips**  
$50,000 account, 0.5% risk ($250):

```
Lot Size = $250 ÷ (120 × $10) = 0.21 lots → 0.20 lots
```

### 3. Fixed-Pip Stop

Some strategies use a fixed pip stop regardless of market structure. This is acceptable if backtesting shows it works — but it must still feed into the position size formula.

**Fixed 50-pip stop, $10,000 account, 1% risk ($100):**

```
Lot Size = $100 ÷ (50 × $10) = 0.20 lots
```

### 4. Percentage-Based Stop

Stop is set at a fixed % move from entry. Common in stock and index trading.

**NAS100 long at 19,500, 2% stop = 390 points**  
$75,000 account, 0.5% risk ($375):

```
Lot Size = $375 ÷ (390 × $1) = 0.96 lots → 0.90 lots
```

---

## How Stop Distance Changes Everything: Worked Comparison

Same account ($50,000), same risk (0.5% = $250), EUR/USD — only the stop changes:

| Stop Distance | Stop in $ (at 1 lot) | Lot Size | Notes |
|---|---|---|---|
| 20 pips | $200 | 1.25 lots | Scalp — tight stop |
| 40 pips | $400 | 0.63 lots | Short-term intraday |
| 80 pips | $800 | 0.31 lots | Standard intraday |
| 150 pips | $1,500 | 0.17 lots | Wide intraday / swing |
| 250 pips | $2,500 | 0.10 lots | Multi-day position |

A 20-pip stop requires a 12.5× larger position than a 250-pip stop for the same dollar risk. This is why tightening your stop to "trade bigger" is a trap — you're exposed to more noise while taking on the same dollar risk.

---

## Stop Loss and Position Size for Gold (XAUUSD)

Gold requires wider stops than most forex pairs. Structure-based stops on XAUUSD typically range from 80–300 pips.

**$100,000 funded account, 0.5% risk ($500), 150-pip stop:**

```
Lot Size = $500 ÷ (150 × $10) = 0.33 lots
```

**$25,000 account, 0.5% risk ($125), 100-pip stop:**

```
Lot Size = $125 ÷ (100 × $10) = 0.13 lots
```

Gold stop distance reference by timeframe:

| Timeframe | Typical Structure Stop | Lot Size at $50k, 0.5% ($250) |
|---|---|---|
| M15 (scalp) | 40–80 pips | 0.31–0.63 lots |
| H1 (intraday) | 80–150 pips | 0.17–0.31 lots |
| H4 (swing intraday) | 150–250 pips | 0.10–0.17 lots |
| D1 (position) | 250–400 pips | 0.06–0.10 lots |

Use the [XAUUSD position size calculator](/calculator/xauusd/) for exact lot sizes on every gold setup.

---

## The Trap: Tightening the Stop to Trade Bigger

**Setup**: Structural stop is 100 pips from entry. At 0.5% risk on $50,000 ($250), the correct lot size is:
```
$250 ÷ (100 × $10) = 0.25 lots
```

A trader wants to trade 0.50 lots (bigger position). So they tighten the stop to 50 pips:
```
$250 ÷ (50 × $10) = 0.50 lots ← what they wanted
```

Result: the trade now stops out at a level that is NOT structurally meaningful. Price can retrace 50 pips and continue — which it frequently does. The trader gets stopped out before the move happens, then watches price go to their target without them.

**The rule**: stop placement is determined by market structure, period. If the correct stop produces a lot size that feels "too small," that is the correct lot size for your account.

---

## Using TRADE90 for Stop-Based Sizing

The [TRADE90 position size calculator](/) is designed for exactly this workflow:

1. Find your entry level and structural stop on the chart
2. Enter account balance and risk %
3. Enter the entry price
4. Enter the stop loss level (exact price, not pip count)
5. The calculator converts to pips automatically and outputs the lot size

No manual pip counting. No unit conversion errors. No guessing.

---

## Frequently Asked Questions

**How do I set position size for a stop loss?**
Calculate your dollar risk (balance × risk %). Measure your stop loss distance in pips. Divide dollar risk by (stop pips × pip value). The result is your lot size.

**Should stop loss determine position size?**
Yes — always. The stop is placed at a structural level first. Position size is calculated from that stop distance. Reversing this process leads to stops placed arbitrarily for lot size convenience.

**What is ATR-based stop sizing?**
ATR (Average True Range) measures average daily price movement. Using 1.5–2× ATR as your stop distance creates a volatility-adjusted stop that avoids normal price noise. Position size is then calculated from this ATR-based stop distance.

**How do I calculate pips between entry and stop loss?**
Subtract the stop loss price from the entry price (or vice versa for shorts). Divide by the pip size of the instrument (0.0001 for major pairs, 0.01 for JPY pairs and gold). The result is your stop distance in pips.

**Does stop loss distance always change my lot size?**
Yes. At the same risk percentage and account balance, a wider stop produces a smaller lot size. This relationship is mathematically unavoidable.

---
title: "How to Calculate Position Size in Forex — Step-by-Step With Worked Examples"
excerpt: "One mental-math error on a live chart can put 10× your intended risk on a single trade. Here's the exact step-by-step formula — with worked examples for every major pair and account size."
published_at: "2026-04-24"
updated_at: "2026-04-24"
tags:
  - "Position Sizing"
  - "Forex"
  - "Lot Size"
  - "How-To"
  - "Risk Management"
primary_tag: "Position Sizing"
meta_title: "How to Calculate Position Size in Forex — Step-by-Step Examples | TRADE90"
meta_description: "How to calculate position size in forex with worked examples. Step-by-step formula for EUR/USD, XAUUSD, NAS100, and JPY pairs. Free calculator included."
reading_time: 10
author: "TRADE90"
---

A trader watching a live EUR/USD chart estimates mentally: "Stop is about 40 pips away, I'll put on 0.5 lots — that feels about right." What they may not realize is that 0.5 lots with a 40-pip stop risks $200 on a $5,000 account — 4% of capital on a single trade. One standard losing streak later, they've drawn down 20% wondering what went wrong with their strategy. The strategy was fine. The sizing was not.

Calculating position size in forex requires three pieces of information and three arithmetic steps. This guide walks through each one, with full worked examples at multiple account sizes and stop distances, so you never have to guess again.

---

## The 3-Step Position Sizing Formula

```
Step 1 — Dollar Risk    = Account Balance × (Risk % ÷ 100)
Step 2 — SL in Pips     = |Entry Price – Stop Loss Price| ÷ Pip Size
Step 3 — Lot Size       = Dollar Risk ÷ (SL Pips × Pip Value per Standard Lot)
```

These three lines handle every major forex pair and most CFD instruments. The only variable that changes between instruments is the pip value in Step 3.

**Quick example** — $10,000 account, 1% risk, EUR/USD long entry at 1.0850, stop at 1.0800:

```
Dollar Risk  = $10,000 × 0.01 = $100
SL in Pips   = (1.0850 – 1.0800) ÷ 0.0001 = 50 pips
Lot Size     = $100 ÷ (50 × $10) = 0.20 lots
```

You enter a 0.20 lot long. If price falls 50 pips to 1.0800, you exit at your stop and lose exactly $100. Every cent of risk was intentional and predetermined.

Use the [TRADE90 position size calculator](/) to run this formula automatically for any instrument and stop distance — no arithmetic required on a live chart.

---

## What Each Variable Means

Before applying the formula, you need to know what each input represents:

**Account Balance**: Your current equity. Use the real-time figure, not your starting balance. After gains your risk budget is higher; after losses it is lower. Recalculate at the start of each session.

**Risk Percentage**: The portion of your account you're willing to lose if the trade hits the stop. Professional traders use 0.5–1%. Never use more than 2% on any single trade unless you have documented evidence of consistent profitability across a large sample.

**Entry Price**: The exact price at which your order fills. For market orders, use the current ask (for buys) or bid (for sells). For pending orders, use the order price.

**Stop Loss Price**: The price at which your position closes if the trade goes against you. Must be set based on market structure — not based on the dollar amount you want to risk.

**Pip Value**: The dollar value of one pip movement for one standard lot. This is fixed for USD-quoted pairs but varies for cross pairs and exotic instruments. See the reference table below.

---

## Pip Value Reference Table

This table shows the pip value for one standard lot (100,000 units) on the most commonly traded instruments. Mini lot (0.10) = 1/10 of these values; micro lot (0.01) = 1/100.

| Instrument | Pip Size | Pip Value (1 Standard Lot) | Notes |
|---|---|---|---|
| EUR/USD | 0.0001 | $10.00 | Quoted in USD |
| GBP/USD | 0.0001 | $10.00 | Quoted in USD |
| AUD/USD | 0.0001 | $10.00 | Quoted in USD |
| NZD/USD | 0.0001 | $10.00 | Quoted in USD |
| USD/JPY | 0.01 | ~$6.50–$7.50* | Varies with JPY rate |
| GBP/JPY | 0.01 | ~$6.50–$7.50* | Varies with JPY rate |
| EUR/JPY | 0.01 | ~$6.50–$7.50* | Varies with JPY rate |
| XAUUSD (Gold) | 0.01 | $10.00 | Per troy ounce × 100 |
| NAS100 | 1 point | $1.00 per point | Broker-dependent |

*JPY pair pip values are calculated as: (0.01 ÷ current USD/JPY rate) × 100,000. At USD/JPY = 150, pip value ≈ $6.67 per standard lot.

---

## Worked Examples: $10,000 Account at 1% Risk

Dollar risk = $100. Stop loss pips vary. EUR/USD pip value = $10.

| Stop Loss (pips) | Dollar Risk | Pip Value | Lot Size | Trade Size (units) |
|---|---|---|---|---|
| 20 pips | $100 | $10/pip | 0.50 lots | 50,000 units |
| 50 pips | $100 | $10/pip | 0.20 lots | 20,000 units |
| 80 pips | $100 | $10/pip | 0.13 lots | 13,000 units |
| 100 pips | $100 | $10/pip | 0.10 lots | 10,000 units |
| 150 pips | $100 | $10/pip | 0.07 lots | 7,000 units |

Notice that as the stop loss widens, the lot size decreases — keeping the dollar risk constant at $100. This is position sizing working correctly.

---

## How to Adjust for JPY Pairs and Cross Pairs

JPY pairs require a slight adjustment because their pip value is not fixed at $10.

**USD/JPY formula:**

```
Pip Value (USD/JPY) = (0.01 ÷ Current USD/JPY Rate) × Lot Size × 100,000
```

At USD/JPY = 150.00 with a 1-standard-lot position:

```
Pip Value = (0.01 ÷ 150.00) × 100,000 = $6.67 per pip
```

**GBP/JPY and EUR/JPY** (cross pairs priced in JPY): The pip value is calculated the same way — divide 0.01 by the current USD/JPY rate, then multiply by lot size × 100,000. The GBP or EUR component doesn't change the pip value calculation because the quote currency (JPY) is what determines the conversion to USD.

**Practical note**: Most trading platforms calculate JPY pip values automatically. If you're computing manually, check your broker's current USD/JPY rate and apply the formula above. The [TRADE90 calculator](/calculator/) handles JPY pairs automatically and updates the pip value in real time.

**Cross pairs (e.g., EUR/GBP)**: These require conversion because the profit is quoted in GBP, not USD. The effective pip value = standard pip value × current GBP/USD rate. At GBP/USD = 1.2700, EUR/GBP pip value per standard lot = $10 × 1.27 = $12.70 per pip.

---

## Full Worked Examples: $25,000 and $100,000 Accounts

### $25,000 Account — EUR/USD, 1% Risk ($250)

| Stop Loss (pips) | Lot Size | Risk if Stopped Out |
|---|---|---|
| 20 pips | 1.25 lots | $250 |
| 50 pips | 0.50 lots | $250 |
| 80 pips | 0.31 lots | $250 |
| 100 pips | 0.25 lots | $250 |
| 150 pips | 0.17 lots | $250 |

### $100,000 Account — EUR/USD, 1% Risk ($1,000)

| Stop Loss (pips) | Lot Size | Risk if Stopped Out |
|---|---|---|
| 20 pips | 5.00 lots | $1,000 |
| 50 pips | 2.00 lots | $1,000 |
| 80 pips | 1.25 lots | $1,000 |
| 100 pips | 1.00 lot | $1,000 |
| 150 pips | 0.67 lots | $1,000 |

For funded prop firm accounts at $100k with a 0.5% risk limit ($500):

| Stop Loss (pips) | Lot Size | Risk if Stopped Out |
|---|---|---|
| 20 pips | 2.50 lots | $500 |
| 50 pips | 1.00 lot | $500 |
| 100 pips | 0.50 lots | $500 |
| 150 pips | 0.33 lots | $500 |

---

## Manual Calculation vs. Using a Calculator

Here's an honest comparison of both approaches:

| | Manual Calculation | TRADE90 Calculator |
|---|---|---|
| Time required | 60–90 seconds | 5–10 seconds |
| Error rate | Moderate (especially JPY pairs) | Near zero |
| Works mid-session | Yes, with a pen and phone | Yes — mobile-optimised |
| Handles cross pairs | Requires extra conversion step | Automatic |
| Tracks daily risk used | No | Yes (funded account mode) |
| Requires internet | No | Yes |

For a single EUR/USD trade, the manual calculation is simple enough to do quickly. For JPY pairs, cross pairs, gold, and indices — or when you need to trade multiple positions in a live session — using the calculator is both faster and less error-prone.

The cost of a miscalculation is not just a bad trade. It can mean violating a funded firm's daily loss limit, or risking 10× your intended amount on a single position. Using a [position size calculator](/calculator/) is not a shortcut — it is professional practice.

---

## Frequently Asked Questions

**What is the formula for position size?**
The core formula is: Dollar Risk = Account Balance × Risk %, then Lot Size = Dollar Risk ÷ (Stop Loss Pips × Pip Value). This three-step formula works for any forex pair when you substitute the correct pip value for the instrument.

**How do I calculate forex lot size?**
Identify your account balance, choose a risk percentage (typically 1%), determine your stop loss in pips from your entry, then apply: Lot Size = (Account Balance × Risk %) ÷ (Stop Loss Pips × Pip Value per Lot). For EUR/USD with a $10,000 account at 1% risk and 50-pip stop: ($10,000 × 0.01) ÷ (50 × $10) = 0.20 lots.

**What is 1 pip worth in forex?**
For major USD-quoted pairs (EUR/USD, GBP/USD, AUD/USD), 1 pip = $10 per standard lot, $1 per mini lot (0.10), and $0.10 per micro lot (0.01). For USD/JPY at a rate of 150, 1 pip ≈ $6.67 per standard lot. Gold (XAUUSD) has a pip value of $10 per standard lot but a pip size of $0.01 in price terms.

**How much is 0.01 lot size in forex?**
A 0.01 lot (micro lot) = 1,000 currency units. On EUR/USD, 1 pip movement = $0.10. A 50-pip stop on a 0.01 lot position risks $5.00. This is the minimum lot size at most retail brokers and is suitable for accounts of $1,000 or less at 1% risk with typical stop distances.

**How to size positions for gold?**
Gold (XAUUSD) uses a pip size of $0.01 and a pip value of $10 per standard lot — identical pip value to EUR/USD per lot, but gold's stop losses are typically measured in much larger pip counts. Apply the same three-step formula: Dollar Risk ÷ (Gold SL Pips × $10). For a $10,000 account at 0.5% risk ($50) with a 100-pip gold stop: $50 ÷ (100 × $10) = 0.05 lots. See [What Is Position Sizing?](/blog/what-is-position-sizing/) for more on how the formula adapts across instruments.

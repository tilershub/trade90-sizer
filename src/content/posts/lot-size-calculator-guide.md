---
title: "Lot Size Calculator: How to Find the Right Lot Size for Any Trade"
excerpt: "The difference between a blown account and a profitable one often comes down to a single number: your lot size. This guide explains how a lot size calculator works, what inputs it needs, and how to use it correctly for forex, gold, and NAS100."
published_at: "2026-04-26"
updated_at: "2026-04-26"
tags:
  - "Lot Size"
  - "Calculator"
  - "Forex"
  - "Position Sizing"
  - "Risk Management"
primary_tag: "Lot Size"
meta_title: "Lot Size Calculator: Find the Right Lot Size for Any Trade | TRADE90"
meta_description: "How to use a lot size calculator for forex, gold, and NAS100. Step-by-step walkthroughs, pip value tables, and what to do when the lot size is too small. Free calculator."
reading_time: 9
author: "TRADE90"
---

Two traders use the same strategy. Same entry signals, same take profit, same stop loss levels. One doubles their account in six months. The other blows up in six weeks. The difference, almost always, isn't the strategy — it's the lot size. An oversized position on a losing streak is the mechanism behind the majority of blown accounts in retail forex. A lot size calculator eliminates this variable entirely, replacing guesswork with arithmetic.

This guide explains how a lot size calculator works, what each input means, and walks through step-by-step examples for EUR/USD, XAUUSD (gold), and NAS100 — three instruments with meaningfully different pip values and risk profiles.

---

## What a Lot Size Calculator Does

A lot size calculator takes your risk parameters as inputs and outputs the exact position size to enter in your broker's order window. The core function is simple:

**Inputs**:
1. Account balance (current equity)
2. Risk percentage (how much of the account to risk)
3. Entry price (where you plan to buy or sell)
4. Stop loss price (where the trade is closed if wrong)
5. Instrument (determines pip value)

**Output**: Lot size — the number to type into your broker's "volume" or "lot size" field.

The calculation happens in under a second. The value it provides is that you never have to guess, estimate, or memorize pip values. You input five numbers and get one answer.

The [TRADE90 position size calculator](/) handles this for all major forex pairs, XAUUSD, NAS100, and other common instruments. It runs the formula below every time you change an input.

---

## The Inputs Explained

### Account Balance

Use your current account equity — not the starting balance you deposited six months ago. If you've had gains, your risk budget is proportionally higher. If you've had losses, it's lower. Position sizing recalibrated to current balance is the mechanism that automatically reduces your lot size during drawdowns and expands it during growth.

**Example**: You started with $10,000, had a losing week, and your account is now $9,200. Use $9,200 as your balance. Your 1% dollar risk is now $92, not $100.

### Risk Percentage

The portion of your account you're willing to lose if the trade hits the stop. Standard guidelines:

- **0.5%**: Conservative — appropriate for funded prop firm accounts and volatile instruments like gold and NAS100
- **1.0%**: Standard — the most commonly recommended level for live trading with a tested strategy
- **2.0%**: Aggressive — acceptable for high-confidence setups with strong historical performance
- **Above 2%**: Rarely justified — the drawdown math becomes punishing quickly

### Entry Price

The price at which your order fills. For market orders, use the current ask price (for long positions) or the current bid price (for short positions). For pending limit orders, use the order price. The entry price is used only to verify the stop loss direction — whether you're long or short relative to your stop.

### Stop Loss Price

The price at which your position exits automatically if the trade goes against you. This must be set based on market structure — a level where the trade is clearly wrong. It is not chosen based on a dollar amount you want to risk. The formula converts your stop loss price into a pip distance, which then determines the lot size.

### Instrument

The instrument determines the pip value used in the calculation. EUR/USD has a different pip value than USD/JPY, XAUUSD, or NAS100. See the reference table below.

---

## The Formula Inside the Calculator

```
Dollar Risk  = Account Balance × (Risk % ÷ 100)
SL Distance  = |Entry Price – Stop Loss Price| ÷ Pip Size
Lot Size     = Dollar Risk ÷ (SL Distance × Pip Value per Standard Lot)
```

The calculator runs these three lines instantly. The only instrument-specific number is the pip value per standard lot, which varies as shown in the table below.

---

## Pip Value Reference Table

| Instrument | Lot Type | Units | Pip Value | Notes |
|---|---|---|---|---|
| EUR/USD | Standard (1.00) | 100,000 | $10.00/pip | Fixed |
| EUR/USD | Mini (0.10) | 10,000 | $1.00/pip | Fixed |
| EUR/USD | Micro (0.01) | 1,000 | $0.10/pip | Fixed |
| GBP/USD | Standard (1.00) | 100,000 | $10.00/pip | Fixed |
| GBP/USD | Mini (0.10) | 10,000 | $1.00/pip | Fixed |
| XAUUSD | Standard (1.00) | 100 oz | $10.00/pip | Pip = $0.01 price move |
| XAUUSD | Mini (0.10) | 10 oz | $1.00/pip | — |
| NAS100 | 1 lot | — | $1.00/point | Most prop firm brokers |
| NAS100 | 0.10 lots | — | $0.10/point | — |
| USD/JPY | Standard (1.00) | 100,000 | ~$6.50–$7.50/pip | Varies with JPY rate |
| USD/JPY | Mini (0.10) | 10,000 | ~$0.65–$0.75/pip | — |

For USD/JPY and other JPY-quoted pairs, the pip value changes as the exchange rate moves. At USD/JPY = 150, pip value per standard lot ≈ $6.67. The [TRADE90 calculator](/calculator/) uses the live rate to update this automatically.

---

## Step-by-Step: EUR/USD Trade Walkthrough

**Trade setup**: You spot a bullish engulfing candle at a key support zone on the H1 EUR/USD chart. The zone is at 1.0820, and you plan to enter on the next candle's open.

- **Account balance**: $15,000
- **Risk percentage**: 1%
- **Entry price**: 1.0835 (next candle open, estimated)
- **Stop loss**: 1.0795 (below the support zone and the engulfing candle's low)
- **Take profit**: 1.0955 (resistance — 120-pip target for 3:1 R:R)

**Calculation**:
- Dollar risk = $15,000 × 0.01 = **$150**
- Stop loss distance = (1.0835 – 1.0795) ÷ 0.0001 = **40 pips**
- Lot size = $150 ÷ (40 × $10) = $150 ÷ $400 = **0.375 lots**

Round to your broker's minimum step: **0.38 lots** (or 0.37, depending on your broker's lot step — most use 0.01 increments).

You enter 0.38 lots long. If stopped at 1.0795, you lose $152 (40 pips × $10 × 0.38). If your take profit hits at 1.0955, you gain approximately $456. The trade is correctly sized, well-defined, and will not surprise you with the loss amount.

---

## Step-by-Step: XAUUSD (Gold) Walkthrough

Gold requires attention because its pip scale is different from forex pairs. A move from $2,300.00 to $2,310.00 is a $10.00 price move — which equals 1,000 pips on gold (since pip size = $0.01). Many calculators accept the entry and stop loss price directly and handle the gold pip scale internally.

**Trade setup**: Short gold after a rejection wick at major resistance.

- **Account balance**: $20,000
- **Risk percentage**: 0.5% (conservative for gold's volatility)
- **Entry price**: $2,388.00 (short entry)
- **Stop loss**: $2,403.00 (above the wick high and resistance)
- **Take profit**: $2,343.00 (300-pip target, 2:1 R:R)

**Calculation**:
- Dollar risk = $20,000 × 0.005 = **$100**
- Price distance = $2,403.00 – $2,388.00 = **$15.00**
- In pip terms: $15.00 ÷ $0.01 = **1,500 pips** (or use: $15 × 10 = $150 per standard lot)
- Lot size = $100 ÷ $150 = **0.67 lots → round to 0.07 lots**

Wait — why 0.07, not 0.67? Because the dollar risk at 1 standard lot for a $15 gold move = $15 × 100 oz × $0.01/oz pip = $1,500? Let's use the practical shortcut:

**Gold lot size shortcut**:
- Dollar risk ÷ (Price move in dollars × 10) = Lot size
- $100 ÷ ($15.00 × 10) = $100 ÷ $150 = **0.667 lots**

But wait — that's 0.67 lots, not 0.07. The "$10 per pip per standard lot" on gold means: at 1 standard lot, a $1 gold price move = $100 profit/loss (since a $1 move = 100 pips × $10/pip × 1 lot / ... let's be direct).

**Direct approach**: At 1.00 lot XAUUSD, each $1.00 price move = $100.00 P&L (100 oz × $1). For a $15 stop: $100 ÷ ($15 × 100) = $100 ÷ $1,500 = **0.067 lots → round to 0.07 lots**.

Enter **0.07 lots** short. If stopped at $2,403, loss = 0.07 × 100 oz × $15 = **$105** (≈ 0.5% of $20,000). The [TRADE90 gold calculator](/calculator/) handles this automatically without requiring the manual conversion.

---

## Step-by-Step: NAS100 Walkthrough

NAS100 uses points, not pips, and most prop firm brokers set the contract value at $1 per point per lot.

**Trade setup**: Long NAS100 after a bounce off the daily moving average.

- **Account balance**: $50,000
- **Risk percentage**: 0.5%
- **Entry price**: 19,450 points
- **Stop loss**: 19,300 points (below the session low and MA support)
- **Take profit**: 19,750 points (300-point target, 2:1 R:R)

**Calculation**:
- Dollar risk = $50,000 × 0.005 = **$250**
- Stop distance = 19,450 – 19,300 = **150 points**
- Lot size = $250 ÷ (150 × $1) = $250 ÷ $150 = **1.67 lots**

Enter **1.67 lots** long NAS100. If stopped at 19,300: 150 points × $1 × 1.67 = **$250.50 loss** (≈ 0.5% of $50,000). If target hit at 19,750: 300 points × $1 × 1.67 = **$501 gain**.

Note: verify your broker's NAS100 contract value. Some brokers use $10 per point per lot (closer to the CME E-mini futures specification). If your broker uses $10/point: $250 ÷ (150 × $10) = 0.167 lots — approximately 10× smaller.

---

## When the Lot Size Comes Out Too Small

Sometimes the calculator outputs a lot size below your broker's minimum. This is a real scenario, especially on small accounts with wide stops.

**Example**: $500 account, 1% risk ($5), 100-pip stop on EUR/USD:
- Lot size = $5 ÷ (100 × $10) = **0.005 lots**
- Broker minimum: 0.01 lots

Your options:

**Option 1: Skip the trade.** If the correctly-sized position is below the minimum lot size your broker supports, the trade is too large for your account at the given stop distance. This is the correct answer if no other option is workable.

**Option 2: Tighten the stop — only if structurally valid.** If a shorter stop distance (50 pips) would bring the lot size to 0.01, and that stop is still a structurally reasonable placement, this may be acceptable. Never tighten a stop *only* to increase lot size — only if the tighter stop still makes technical sense.

**Option 3: Accept higher risk on the minimum lot.** 0.01 lots with a 100-pip stop risks $10 — 2% of a $500 account. This is above the 1% guideline but may be acceptable for a $500 account in controlled circumstances. Know explicitly that you're exceeding your target risk.

**Option 4: Move to a broker with smaller minimum lots.** Brokers that support nano lots (0.001 minimum) allow correct position sizing on accounts as small as $100–$200. This is often the cleanest solution for very small accounts.

---

## Frequently Asked Questions

**How do I use a lot size calculator?**
Enter your account balance, risk percentage, entry price, stop loss price, and select your instrument. The calculator outputs the lot size to enter in your broker's order window. Run it every time before placing a trade — never estimate position size from memory, especially on instruments like gold or NAS100 where pip values differ from standard forex pairs.

**What is the best lot size for a $1,000 account?**
It depends on your stop loss distance, not just your account size. At $1,000, 1% risk = $10 dollar risk. For a 50-pip stop on EUR/USD: $10 ÷ (50 × $10) = 0.02 lots. For a 20-pip stop: 0.05 lots. For a 100-pip stop: 0.01 lots (micro minimum). Always calculate — never default to a fixed "standard" lot size for $1,000 accounts.

**How do I calculate lot size manually?**
Three steps: (1) Dollar Risk = Account Balance × Risk %. (2) Stop Loss in pips = |Entry – Stop| ÷ Pip Size. (3) Lot Size = Dollar Risk ÷ (Stop Loss Pips × Pip Value per Standard Lot). For EUR/USD, pip value is $10/lot. For gold, $10/lot. For NAS100, $1/point/lot. For JPY pairs, ≈ $6.50–$7.50/lot depending on current USD/JPY rate.

**What is the lot size for 1% risk?**
At any account size, the 1% lot size = (Account Balance × 0.01) ÷ (Stop Loss Pips × Pip Value). For a $10,000 account, 1% = $100 dollar risk. With a 50-pip EUR/USD stop: 0.20 lots. With a 100-pip stop: 0.10 lots. The lot size changes with every different stop distance — see [How to Calculate Position Size in Forex](/blog/how-to-calculate-position-size-forex/) for a full worked example table.

**Does lot size calculator work for gold?**
Yes — the TRADE90 calculator is specifically built for XAUUSD and handles gold's unique pip scale (pip size = $0.01, contract = 100 oz, $10/pip per standard lot). Enter your entry and stop prices in dollar terms (e.g., 2,388 and 2,403) and the calculator outputs the correct lot size automatically. Manual gold calculations require knowing that a $1 gold price move = $100 per standard lot (100 oz × $1), which the calculator handles internally.

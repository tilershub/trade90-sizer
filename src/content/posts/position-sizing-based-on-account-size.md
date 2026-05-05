---
title: "Position Sizing Based on Account Size — How to Scale Your Lot Size Correctly"
excerpt: "A $1,000 account and a $100,000 account should not use the same lot size — yet most beginners trade fixed lots regardless of balance. Here's how to scale position size correctly at every account level."
published_at: "2026-05-01"
updated_at: "2026-05-01"
tags:
  - "Account Size"
  - "Position Sizing"
  - "Risk Management"
  - "Forex"
  - "Lot Size"
primary_tag: "Position Sizing"
meta_title: "Position Sizing Based on Account Size — How to Scale Lot Size Correctly | TRADE90"
meta_description: "How to scale your forex lot size based on account balance. Reference tables for every account size from $500 to $200k, with the 1% rule applied. Free position size calculator."
reading_time: 10
author: "TRADE90"
---

Most beginners use 0.10 lots on every trade regardless of their account balance — because that's what the tutorial used. A trader with $1,000 using 0.10 lots risks $10 per pip. A trader with $100,000 using 0.10 lots risks $10 per pip. The position is identical in dollar terms, but represents 1% of the small account and 0.01% of the large one. One is appropriate. The other is leaving 99% of the available edge on the table.

Position size must scale with your account balance.

---

## The Core Principle: Risk Percentage, Not Fixed Lots

Position sizing should always be expressed as a percentage of your current account balance — never as a fixed lot number.

```
Dollar Risk     = Account Balance × (Risk % ÷ 100)
Stop Loss Pips  = |Entry − Stop Loss| ÷ Pip Size
Lot Size        = Dollar Risk ÷ (Stop Loss Pips × Pip Value)
```

When your account grows from $10,000 to $20,000, your lot size doubles automatically at the same risk percentage. You don't need to manually adjust — the formula handles it.

---

## Position Size Reference Table — All Account Sizes

EUR/USD at 1% risk, 50-pip stop loss (pip value = $10 per standard lot):

| Account Balance | 0.5% Risk ($) | Lot Size (0.5%) | 1% Risk ($) | Lot Size (1%) | 2% Risk ($) | Lot Size (2%) |
|---|---|---|---|---|---|---|
| $500 | $2.50 | 0.005 lots | $5.00 | 0.01 lots | $10.00 | 0.02 lots |
| $1,000 | $5.00 | 0.01 lots | $10.00 | 0.02 lots | $20.00 | 0.04 lots |
| $5,000 | $25.00 | 0.05 lots | $50.00 | 0.10 lots | $100.00 | 0.20 lots |
| $10,000 | $50.00 | 0.10 lots | $100.00 | 0.20 lots | $200.00 | 0.40 lots |
| $25,000 | $125.00 | 0.25 lots | $250.00 | 0.50 lots | $500.00 | 1.00 lot |
| $50,000 | $250.00 | 0.50 lots | $500.00 | 1.00 lot | $1,000.00 | 2.00 lots |
| $100,000 | $500.00 | 1.00 lot | $1,000.00 | 2.00 lots | $2,000.00 | 4.00 lots |
| $200,000 | $1,000.00 | 2.00 lots | $2,000.00 | 4.00 lots | $4,000.00 | 8.00 lots |

---

## Small Account Sizing ($500 – $5,000)

The primary challenge with small accounts is that even micro lots may represent a higher-than-acceptable risk percentage depending on the stop distance.

**$1,000 account, 1% risk ($10), 30-pip stop**:
- Lot Size = $10 ÷ (30 × $10) = 0.033 lots → round to 0.03 lots

**$1,000 account, 1% risk ($10), 100-pip stop**:
- Lot Size = $10 ÷ (100 × $10) = 0.01 lots (minimum micro lot)

If the calculated lot size falls below your broker's minimum (typically 0.01 lots), you have two options:
1. Skip the trade — the risk math doesn't allow it at your account size
2. Use a broker with nano lot support (0.001 lots minimum)

Instruments to prioritize with small accounts: EUR/USD, GBP/USD (tight spreads, $10/pip on standard lot, micro lots available).

---

## Medium Account Sizing ($10,000 – $50,000)

At this level, you have enough flexibility to trade most instruments with proper sizing. Gold (XAUUSD) and NAS100 become practical at this account tier.

**$25,000 account, 0.5% risk ($125), 80-pip stop on XAUUSD**:
```
Dollar Risk     = $25,000 × 0.5% = $125
Stop Loss Pips  = 80 pips
Pip Value       = $10 per standard lot
Lot Size        = $125 ÷ (80 × $10) = 0.16 lots
```

**$25,000 account, 0.5% risk ($125), 150-point stop on NAS100**:
```
Dollar Risk     = $125
Pip/Point Value = $1 per standard lot
Lot Size        = $125 ÷ (150 × $1) = 0.83 lots
```

---

## Large Account Sizing ($100,000+) and Funded Accounts

At $100,000 and above — including funded prop firm accounts — the standard drops to **0.5% maximum per trade**. This is not conservatism; it's the mathematical requirement for surviving 20+ trade losing streaks within a 10% drawdown limit.

**$100,000 funded account, 0.5% risk ($500), 100-pip stop on EUR/USD**:
```
Lot Size = $500 ÷ (100 × $10) = 0.50 lots
```

**$100,000 funded account, 0.5% risk ($500), 100-pip stop on XAUUSD**:
```
Lot Size = $500 ÷ (100 × $10) = 0.50 lots
```

For funded traders, the [TRADE90 funded account calculator](/funded-trader-risk-calculator/) enforces the 0.5% per-trade cap and tracks daily risk budget automatically.

---

## The Scaling Principle: Balance Doubles, Lot Size Doubles

When your account grows, your lot size should increase proportionally — not your risk percentage.

| Growth Stage | Account | 1% Risk | Lot Size (50-pip stop, EUR/USD) |
|---|---|---|---|
| Starting | $5,000 | $50 | 0.10 lots |
| First milestone | $10,000 | $100 | 0.20 lots |
| Intermediate | $25,000 | $250 | 0.50 lots |
| Established | $50,000 | $500 | 1.00 lot |
| Professional | $100,000 | $1,000 | 2.00 lots |

The lot size doubled with each account doubling. The risk percentage stayed at 1% throughout.

---

## Common Mistakes When Scaling

**Mistake 1: Keeping the same lot size as the account grows**
Effective risk % drops as balance grows. A trader using 0.10 lots on a $50,000 account is risking 0.1% per trade — half the intended risk, unnecessarily limiting growth.

**Mistake 2: Increasing risk % instead of lot size when trying to grow faster**
Doubling your risk % from 1% to 2% to "grow faster" doubles your expected loss on each losing trade. It also doubles the chance of account-ending drawdowns. Double the lot size at the same 1% — not the percentage.

**Mistake 3: Not recalculating after significant drawdown**
If your account drops from $25,000 to $22,000 after a losing streak, your lot sizes must be recalculated based on $22,000 — not the original $25,000. Continuing to size as if you have $25,000 is a hidden form of oversizing.

---

## When to Recalculate Your Position Size

Recalculate on every trade using your current balance. The [TRADE90 position size calculator](/) runs the calculation in seconds — enter your current balance each session, not a fixed number from when you opened the account.

Triggers for recalculation:
- Any meaningful change in account balance (after each closed trade)
- After a week of no trading (to capture any overnight swaps or adjustments)
- After transitioning to a funded account at a new capital level
- After a significant drawdown that reduces available margin

---

## Position Sizing by Account Size — Gold and NAS100 Reference

| Account | 0.5% Risk | XAUUSD (100-pip stop) | NAS100 (100-point stop) |
|---|---|---|---|
| $10,000 | $50 | 0.05 lots | 0.50 lots |
| $25,000 | $125 | 0.13 lots | 1.25 lots |
| $50,000 | $250 | 0.25 lots | 2.50 lots |
| $100,000 | $500 | 0.50 lots | 5.00 lots |
| $200,000 | $1,000 | 1.00 lot | 10.00 lots |

---

## Frequently Asked Questions

**What lot size is good for a $1,000 account?**
At 1% risk ($10) with a 50-pip stop on EUR/USD: 0.02 lots. Start with micro lots (0.01) and size up only as your balance grows.

**What lot size for a $10,000 account?**
At 1% risk ($100) with a 50-pip stop on EUR/USD: 0.20 lots. At 0.5% risk ($50): 0.10 lots.

**Does lot size change as my account grows?**
Yes — it should. Position size must be recalculated on every trade based on your current balance. As your balance grows, your lot size grows proportionally at the same risk percentage.

**What position size for a $100,000 funded account?**
At 0.5% risk ($500) with a 100-pip stop on EUR/USD: 0.50 lots. The [TRADE90 funded account calculator](/funded-trader-risk-calculator/) handles this automatically.

**Can I use the same lot size for every trade?**
No. Stop loss distance varies by setup. A 30-pip stop requires a larger lot than a 100-pip stop at the same risk percentage. Always calculate fresh for each trade.

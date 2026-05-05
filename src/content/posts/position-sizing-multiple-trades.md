---
title: "Position Sizing for Multiple Simultaneous Trades — Controlling Total Portfolio Risk"
excerpt: "Taking 3 trades at 1% risk each isn't 1% risk — it's 3% risk, potentially more if the trades are correlated. Here's how to size correctly when running multiple positions at once."
published_at: "2026-05-16"
updated_at: "2026-05-16"
tags:
  - "Multiple Positions"
  - "Correlation"
  - "Risk Management"
  - "Position Sizing"
  - "Portfolio"
primary_tag: "Position Sizing"
meta_title: "Position Sizing for Multiple Simultaneous Trades — Portfolio Risk Control | TRADE90"
meta_description: "How to size positions when running multiple trades at once. Includes correlation table, total portfolio risk rules, daily cap management, and worked examples. Free calculator."
reading_time: 10
author: "TRADE90"
---

Every position sizing guide covers how to size a single trade. Almost none cover what happens when you have 3, 4, or 5 trades open at the same time. The rules are different — and ignoring them is one of the primary causes of unexpected large drawdowns in accounts that appear to have good per-trade risk management.

---

## Total Portfolio Risk: The Number That Matters

When multiple trades are open simultaneously, your actual risk is the SUM of all individual trade risks — not the risk of any single trade.

**Example**: 3 trades open, each at 1% risk
- EUR/USD long: 1% risk = $500 on a $50,000 account
- XAUUSD long: 1% risk = $500
- NAS100 long: 1% risk = $500
- **Total portfolio risk: $1,500 (3% of account)**

If all three stop losses trigger on the same day (possible during a major risk-off event), you lose 3% in one session — not 1%.

---

## The Portfolio Risk Rule

| Trader Type | Max Per-Trade Risk | Max Total Portfolio Risk | Rationale |
|---|---|---|---|
| Retail (learning) | 1% | 3% | Limits single-session damage |
| Retail (experienced) | 1% | 3–5% | Balanced growth vs risk |
| Funded account | 0.5% | 1% (Trade90 daily cap) | Inside firm's 4–5% daily limit |
| Professional / institutional | 0.25–0.5% | 2–3% | Drawdown survival over long careers |

For funded traders, total portfolio risk must stay inside the Trade90 1% daily cap — meaning a maximum of 2 trades at 0.5% each before stopping for the day.

---

## Correlation: Why 3 Trades Aren't Always 3× Independent Risks

Instrument correlation means related assets move together. Taking correlated trades multiplies your directional exposure without multiplying your instrument count.

**High correlation pairs (>0.7 typical correlation):**

| Pair 1 | Pair 2 | Correlation | Impact |
|---|---|---|---|
| EUR/USD | GBP/USD | +0.85 | Both long = 1.85× USD short exposure |
| EUR/USD | EUR/JPY | +0.75 | Related EUR exposure |
| XAUUSD | USD pairs | −0.70 | Gold long + EUR/USD long both rally vs USD |
| NAS100 | US30 | +0.80 | Both long = amplified US equity exposure |
| SPX500 | NAS100 | +0.90 | Nearly identical directional risk |

**Example of hidden correlation risk:**
- EUR/USD long at 1% risk
- GBP/USD long at 1% risk
- XAU/USD long at 1% risk

All three positions rally when USD weakens. They all decline when USD strengthens unexpectedly. This is effectively ~2.5× the risk of a single anti-USD trade, not 3 independent trades.

**Effective portfolio risk** = sum of individual risks × correlation adjustment.

---

## How to Size Individual Trades in a Multi-Position Portfolio

When planning to hold multiple positions simultaneously, divide your total risk budget across the positions:

**Total risk budget**: 3% of account ($1,500 on $50,000)  
**Planned positions**: 3 concurrent trades  
**Risk per trade**: $1,500 ÷ 3 = $500 = 1%

This works if trades are uncorrelated. If two are correlated:

**Adjusted allocation for 2 correlated + 1 independent trade:**
- Correlated pair combined: allocate 1.5% total ($750) → 0.75% each
- Independent trade: 1% ($500)
- Total: 1.5% + 1% = 2.5% (within 3% budget, accounting for correlation)

---

## The Daily Risk Cap and Multiple Trades

The Trade90 Safety System daily cap of 1% applies to ALL trades in a session — open, closed, or still forming.

**$100,000 funded account, 0.5% per trade, 1% daily cap:**

| Trade | Status | Risk Used | Remaining Cap |
|---|---|---|---|
| Trade 1 (EUR/USD) | Open | $500 | $500 |
| Trade 2 (XAUUSD) | Open | $500 | $0 |
| Trade 3 | Cannot open | — | Cap reached |

Once the daily cap is reached, no new positions are opened regardless of how good the next setup looks. This is non-negotiable for funded evaluation accounts.

The [TRADE90 funded account calculator](/funded-trader-risk-calculator/) tracks daily risk as you log trades, showing how much budget remains at all times.

---

## Pyramid Strategy: Adding to Winning Trades

Pyramiding — adding positions to a winning trade — is the only acceptable form of position scaling. It is the inverse of averaging down (adding to losers, which is prohibited).

**Correct pyramiding approach:**
1. Enter initial position at full risk (0.5% or 1%)
2. Move stop to breakeven when trade is 50%+ toward target
3. Add a second position at 50–75% of original size — with a stop at a new structural level
4. Effectively: risk on add-on position ≈ 0.25–0.5% additional
5. Total risk remains within budget because original stop is at breakeven (no longer at risk)

**Incorrect (not pyramiding):**
- Adding positions to a losing trade ("averaging down") — this multiplies risk as losses grow
- Adding a second full position before the first is in profit — doubles risk without the structure to support it

---

## Managing Multiple Positions: Practical Workflow

**Before the session:**
1. Calculate your daily risk budget (1% of balance for funded, 3% for retail)
2. Set a trade limit for the day based on risk per trade
3. Note highly correlated instruments and plan accordingly

**During the session:**
1. Before each new trade, calculate remaining daily risk budget
2. If two correlated positions are open, count them as amplified risk
3. Track all open positions against the total budget

**At session close:**
1. Close all open positions if approaching the daily limit
2. Record total risk used vs maximum allowed

---

## Worked Example: Full Day of Multiple Trades

$50,000 account, 1% daily cap ($500), 0.5% per trade ($250):

| Time | Trade | Instrument | Risk | Cumulative Risk | Budget Left |
|---|---|---|---|---|---|
| 09:30 | Enter long | EUR/USD | $250 | $250 | $250 |
| 10:15 | Trade 1 wins | +$500 | − | $250 (new) | $250 |
| 11:00 | Enter long | XAUUSD | $250 | $500 | $0 |
| 12:00 | Daily cap hit | STOP | — | — | 0 |

After the second trade, the daily cap is reached. No more trades — regardless of setups. Trade 1 winning doesn't "refill" the risk budget for the purpose of the daily cap; the cap counts risk taken, not net P&L.

---

## Frequently Asked Questions

**Can I have multiple positions at the same risk?**
Yes, but total portfolio risk is the sum of all individual trade risks. Three trades at 1% each = 3% total exposure for that session.

**How many trades can I have open at once?**
For funded accounts (Trade90 system): maximum 2 at 0.5% each (1% daily cap). For retail accounts: as many as your total portfolio risk budget allows, typically 3–5 with 1% each.

**Does correlation matter for position sizing?**
Yes. Highly correlated positions (EUR/USD and GBP/USD, for example) amplify directional exposure. Two 1% positions at 0.85 correlation represent approximately 1.85% effective directional risk.

**How do I track total portfolio risk?**
The [TRADE90 funded account calculator](/funded-trader-risk-calculator/) tracks daily risk as you log each trade. For retail accounts, keep a running tally of open trade dollar risk in a spreadsheet or trading journal.

**What is the maximum number of open trades?**
There is no universal maximum — it depends on your total risk budget and per-trade risk. The constraint is: (number of trades × risk per trade) ≤ total portfolio risk limit.

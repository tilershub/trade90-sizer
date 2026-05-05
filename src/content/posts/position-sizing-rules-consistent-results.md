---
title: "Position Sizing Rules for Consistent Trading Results — Build the Framework"
excerpt: "Consistent trading outcomes don't come from finding better setups. They come from applying the same rules on every trade without exception. Here are the 5 non-negotiable rules and how to implement them."
published_at: "2026-05-21"
updated_at: "2026-05-21"
tags:
  - "Rules"
  - "Consistency"
  - "Position Sizing"
  - "Risk Management"
  - "Trading System"
primary_tag: "Position Sizing"
meta_title: "Position Sizing Rules for Consistent Trading Results | TRADE90"
meta_description: "The 5 non-negotiable position sizing rules for consistent trading results. Includes a trade journal template, pre-trade routine, and violation consequences. Free calculator."
reading_time: 9
author: "TRADE90"
---

Traders who achieve consistent results are not better at predicting markets. They are better at executing the same process repeatedly. Consistency in trading outcomes is a function of consistent rule application — and position sizing is the most rule-breakable part of most trading plans.

---

## Rule 1: Always Use a Percentage, Never a Fixed Lot

Fixed lot sizes decouple your risk from your account balance. When the account grows, risk stays the same as a percentage of a larger balance — meaning you're effectively risking less. When the account shrinks from drawdown, fixed lots represent a larger-than-intended percentage.

**The rule**: every trade is sized as a fixed percentage of your current account balance.

```
Dollar Risk = Current Balance × Risk %
Lot Size    = Dollar Risk ÷ (Stop Pips × Pip Value)
```

Recalculate from your current balance before every trade — not from the balance you had last month.

---

## Rule 2: Stop Loss Is Placed Before Position Size Is Calculated

This is the most frequently violated rule in retail trading. The stop must come from market structure — not from what loss amount you're comfortable with.

**The correct workflow:**

| Step | Action | Note |
|---|---|---|
| 1 | Identify setup | Entry signal confirmed |
| 2 | Find structural stop level | Where is the trade invalidated? |
| 3 | Check R:R | Target distance ÷ stop distance ≥ 1.5 |
| 4 | Calculate lot size | Dollar risk ÷ (stop pips × pip value) |
| 5 | Enter trade | With the calculated lot size |

Steps 2–3 must happen before Step 4. No exceptions.

---

## Rule 3: Maximum 0.5–1% Risk Per Trade

This is the hard ceiling. No single trade risks more than 1% of account balance. For funded accounts: maximum 0.5%.

**Why this specific number:**

| Max Risk Per Trade | Consecutive Losses to 10% Drawdown | At 55% Win Rate — Max Drawdown Probability |
|---|---|---|
| 0.25% | 40 losses | <0.01% of simulations |
| 0.5% | 20 losses | ~0.1% |
| 1.0% | 10 losses | ~2% |
| 2.0% | 5 losses | ~15% |
| 5.0% | 2 losses | ~50% |

At 1% maximum risk: a 10-trade losing streak (which happens to every trader) costs 10%. At 0.5%: same losing streak costs 5%. The difference is an account that survives vs one that struggles to recover.

---

## Rule 4: Daily Risk Cap Is a Hard Stop

Define your maximum total risk per trading day before the session opens. When that cap is reached, close the platform.

**Daily cap by account type:**

| Account Type | Daily Risk Cap | Rationale |
|---|---|---|
| Funded account (FTMO style) | 1% (Trade90 Safety System) | Inside firm's 4–5% daily limit |
| Retail (learning) | 2% | Two 1% trades max |
| Retail (experienced) | 3% | Three 1% trades max |

The daily cap prevents emotional overtrading — the sequence of escalating losses that happens when traders try to recover a bad morning by taking increasingly large or frequent positions. When the cap is hit, the session is over.

---

## Rule 5: Never Average Down Into a Losing Trade

Averaging down (adding to a losing position) is the single most destructive behavior in retail trading. It violates position sizing discipline by multiplying exposure precisely when the market is signaling you are wrong.

**The compounding loss problem:**

| Entry | Position | Loss at Original Stop | Loss After Adding | Total Risk |
|---|---|---|---|---|
| 1.0850 | 0.30 lots | $150 (50 pips) | — | 0.3% of $50k |
| Added at 1.0820 | +0.30 lots | $150 (50 pips) | $90 additional | 0.48% |
| Stop moved to 1.0800 | 0.60 lots | $300 (new wider stop) | $330 total | 0.66% |

Each "average down" requires a wider stop to protect the new blended entry — which means even larger losses when that stop finally triggers. The pattern always ends the same way: a much larger loss than the original plan allowed.

**The rule**: if a trade is moving against you and approaches the stop, let the stop work. Exit at the predetermined level. Do not add.

---

## Building Your Position Sizing Rulebook

Your personal sizing rulebook should be written and reviewed before every session. It should contain:

1. **Risk % per trade**: _______% (fill in your number)
2. **Daily cap**: _______% 
3. **Maximum concurrent positions**: _______ trades
4. **Stop placement rule**: stop at structural level (not at dollar amount)
5. **Calculator rule**: TRADE90 calculator before every entry
6. **Averaging down**: PROHIBITED
7. **Drawdown reduction trigger**: reduce to half size when account drops _______% 

Laminate it. Put it next to your monitor. Every deviation is a rule violation that gets recorded in your journal.

---

## The Position Sizing Journal

Tracking sizing consistency is as important as tracking P&L. Add these fields to every trade record:

| Field | Example | Purpose |
|---|---|---|
| Account balance at entry | $48,750 | Ensures % calculated from current balance |
| Planned risk % | 0.5% | Your rule |
| Planned dollar risk | $243.75 | Calculated |
| Actual lot size entered | 0.13 lots | What you entered |
| Stop loss level | 1.07850 | Where |
| Stop pips | 47 pips | Distance |
| Actual dollar risk | $246.75 | Verify against planned |
| Rule violations | None | Record any deviation |

The last column is the most important. Track violations without judgment — the goal is to see patterns and eliminate them over time.

---

## What Happens When You Break Each Rule

| Rule Broken | Short-Term Effect | Long-Term Effect |
|---|---|---|
| Fixed lots instead of % | Inconsistent risk | Oversize as balance grows |
| Size before stop | Arbitrary stops | Premature exits, forced sizing |
| Risk > 1% | Normal losses cost more | Drawdowns that require 20–30% recovery |
| No daily cap | Revenge trading | Catastrophic single-session loss |
| Averaging down | Temporary comfort | Large losses that were preventable |

None of the rule violations provide lasting benefit. The short-term "upside" of breaking rules (trading bigger, feeling in control, not exiting at a loss) is always smaller than the long-term cost.

---

## Frequently Asked Questions

**What are the rules of position sizing?**
The five core rules: fixed % per trade (not fixed lots), stop placement before size calculation, maximum 0.5–1% per trade, a daily risk cap, and no averaging down into losers.

**How do I create consistent trading results?**
Apply the same position sizing rules on every trade without exception for 60+ days. Consistency in inputs produces consistency in outcomes. Measure your rule adherence rate, not just your P&L.

**Why do traders break their sizing rules?**
Emotional interference: fear (sizing too small on losing streaks), greed (sizing too large on winning streaks), and revenge trading (escalating size to recover losses). All three are prevented by written rules and a daily cap.

**What should I write in a trading journal?**
At minimum: date, instrument, entry, stop, lot size, dollar risk, actual risk %, outcome, and rule violations. The rule violations column is more valuable than the P&L column for long-term improvement.

**How do position sizing rules prevent losses?**
They don't prevent losses — losses are inherent to trading. They prevent LARGE losses: the kind that blow accounts, fail funded evaluations, and require months to recover from. Rules cap the downside so the strategy's positive expected value can accumulate on the upside.

---
title: "How to Use a Position Size Calculator — Complete Step-by-Step Guide"
excerpt: "Manual position size math on a live chart takes 30–60 seconds, requires three separate calculations, and introduces compounding error risk. A calculator eliminates all three problems in under 5 seconds."
published_at: "2026-05-02"
updated_at: "2026-05-02"
tags:
  - "Position Size Calculator"
  - "Tools"
  - "How-To"
  - "Position Sizing"
  - "Forex"
primary_tag: "Position Size Calculator"
meta_title: "How to Use a Position Size Calculator — Complete Step-by-Step Guide | TRADE90"
meta_description: "Learn how to use a position size calculator for forex, gold, and indices. Step-by-step walkthrough with worked examples. Free calculator at TRADE90."
reading_time: 9
author: "TRADE90"
---

Manual position size math on a live chart takes 30–60 seconds, requires three separate calculations, and introduces compounding error risk at every step. Most traders who skip sizing don't skip it because they don't know the formula — they skip it because the calculation feels too slow when price is moving. A purpose-built position size calculator eliminates all three problems and delivers your lot size in under 5 seconds.

This guide walks through every input, every output, and three complete worked examples so you can use the [TRADE90 position size calculator](/) with total confidence on your next trade.

---

## Why Manual Math Is Dangerous on Live Charts

When price is moving and you're about to enter, the mental environment is exactly wrong for arithmetic. You're managing FOMO, monitoring your entry level, watching for confirmation signals, and tracking news events — all simultaneously. Inserting a three-step calculation into that process is a recipe for errors.

The three specific failure points in manual calculation are:

1. **Pip value lookup error** — EUR/USD pip value and XAUUSD pip value are different. Gold is $10 per pip per standard lot. Getting this wrong by a factor of even 1.5× can double your intended risk.
2. **Stop distance miscalculation** — Counting pips from entry to stop sounds easy until you're doing it on a gold chart priced at 2,340 with a stop at 2,316. That's 240 pips, not 24. One decimal error gives you 10× the intended size.
3. **Division under pressure** — Dividing $500 dollar risk by (40 pips × $10) = 400 sounds simple, but traders under live-market stress consistently make errors in this final step.

A calculator accepts your raw inputs and handles all three steps instantly. The cognitive load drops from "solve a math problem" to "enter three numbers and read the result."

---

## The 5 Inputs Every Position Size Calculator Needs

Understanding what each input does makes you a better user of any calculator — including the [TRADE90 calculator](/calculator/).

### 1. Account Balance

Your current account equity in your account's base currency (usually USD, EUR, or GBP). Use your actual current balance, not your starting balance. If you've had a drawdown, your balance is lower — which means your dollar risk per trade should be lower too. This is automatic if you enter the correct current balance.

### 2. Risk Percentage

The percentage of your balance you're willing to lose if this trade hits stop. Professional traders and funded account rules typically set this at 0.5%–2%. For a $10,000 account:

- 0.5% = $50 at risk per trade
- 1.0% = $100 at risk per trade
- 2.0% = $200 at risk per trade

Most prop firm challenge rules cap daily drawdown at 4–5%, which means risking more than 1–2% on a single trade is genuinely dangerous during an evaluation.

### 3. Entry Price

Where you plan to enter the trade. On most calculators this is optional for the lot size calculation itself — what matters is the *distance* between entry and stop, not the absolute level. However, some calculators use it to auto-calculate the stop distance from a stop price input.

### 4. Stop Loss Level

The price level where you'll exit if wrong. This is converted internally to a pip or point distance from entry. Structure your stop at the level that invalidates your trade thesis — not at an arbitrary pip count from entry.

### 5. Instrument

EUR/USD, XAUUSD, NAS100, USD/JPY, and so on. The calculator uses the instrument to look up the correct pip value (in dollar terms per standard lot). This is the single biggest differentiator between a quality calculator and a bad one — pip values vary dramatically across instruments.

---

## Step-by-Step Walkthrough: EUR/USD Trade

**Scenario:** You have a $15,000 account and want to risk 1% on a EUR/USD long trade. Your entry is 1.0850, your stop is at 1.0810.

**Step 1:** Open the [TRADE90 calculator](/calculator/) and select EUR/USD as your instrument.

**Step 2:** Enter your account balance: `15000`

**Step 3:** Enter your risk percentage: `1` (for 1%)

**Step 4:** Enter your entry price: `1.0850`

**Step 5:** Enter your stop loss: `1.0810`

**Step 6:** Read the outputs.

The calculator computes:
- Stop distance: 40 pips
- Dollar risk: $150 (1% of $15,000)
- Pip value for EUR/USD: $10 per pip per standard lot
- Required lot size: $150 ÷ (40 × $10) = **0.375 lots**

Most brokers allow 0.37 or 0.38 lots. You'd enter 0.37 lots to stay slightly under your 1% threshold.

---

## Step-by-Step Walkthrough: XAUUSD (Gold) Trade

**Scenario:** You have a $25,000 funded account and want to risk 0.5% on a gold short. Entry: 2,345. Stop: 2,361.

**Step 1:** Select XAUUSD (Gold) as your instrument.

**Step 2:** Account balance: `25000`

**Step 3:** Risk percentage: `0.5`

**Step 4:** Entry: `2345`

**Step 5:** Stop loss: `2361`

**Step 6:** Read outputs.

The calculator computes:
- Stop distance: 16 pips (each pip = $1 price move on gold)
- Dollar risk: $125 (0.5% of $25,000)
- Pip value for XAUUSD: $10 per pip per standard lot
- Required lot size: $125 ÷ (16 × $10) = **0.78 lots**

Gold's wide spreads and fast moves make precise sizing critical here. At 0.78 lots, a stop hit costs exactly $125. At 1.0 lots (what a "round up" trader might use), the cost is $160 — 28% more than intended.

---

## Step-by-Step Walkthrough: NAS100 (Nasdaq) Trade

**Scenario:** You have a $50,000 account, risking 0.75%. Entry: 17,850. Stop: 17,790.

**Step 1:** Select NAS100 as your instrument.

**Step 2:** Account balance: `50000`

**Step 3:** Risk percentage: `0.75`

**Step 4:** Entry: `17850`

**Step 5:** Stop loss: `17790`

**Step 6:** Read outputs.

The calculator computes:
- Stop distance: 60 points
- Dollar risk: $375 (0.75% of $50,000)
- Point value for NAS100: $1 per point per standard lot (CFD)
- Required lot size: $375 ÷ (60 × $1) = **6.25 lots**

NAS100 CFDs have a $1 per point pip value — dramatically different from EUR/USD. A calculator that doesn't handle this correctly will give you a lot size 10× too small.

---

## Reading the Output: What Each Number Means

A good position size calculator shows more than just a lot size. TRADE90 outputs include:

| Output Field | What It Means |
|---|---|
| Lot Size | The number of standard lots (0.01 = micro, 0.1 = mini, 1.0 = standard) |
| Dollar Risk | The exact dollar amount you lose if stop is hit |
| R:R Ratio | Reward-to-risk ratio if you've entered a take profit level |
| Risk State | Color-coded indicator — green (safe), yellow (caution), red (over-limit) |

The risk state indicator is especially valuable for funded traders. If your daily drawdown limit is 4% and you've already used 2%, the calculator can flag that your next trade's risk brings you near the limit.

---

## Common Input Mistakes to Avoid

**Mistake 1: Using starting balance instead of current balance.** If your $10,000 account is now at $8,500 after drawdown, 1% should be $85 — not $100. Always use current equity.

**Mistake 2: Entering stop in price when calculator expects pips (or vice versa).** Some calculators take a stop price and auto-calculate pips. Others ask for the pip distance directly. Read the input label carefully.

**Mistake 3: Wrong instrument selected.** If you select EUR/USD but are trading GBP/USD, the pip value is close but not identical. For gold and indices the error would be catastrophic.

**Mistake 4: Forgetting spread.** Your entry price should ideally reflect the fill price including spread, not just the bid. For instruments with wide spreads (gold, indices), this can shift your effective stop distance by 1–3 pips.

**Mistake 5: Rounding up "for convenience."** If the calculator says 0.37 lots, rounding to 0.40 lots adds 8% extra risk. Use the exact output, or round down.

---

## Worked Examples: Three Trades, Three Instruments

| Trade | Account | Risk % | Entry | Stop | Stop Pips | Pip Value | Lot Size | Dollar Risk |
|---|---|---|---|---|---|---|---|---|
| EUR/USD Long | $10,000 | 1.0% | 1.0720 | 1.0680 | 40 | $10/pip | 0.25 lots | $100 |
| XAUUSD Short | $30,000 | 0.5% | 2,380 | 2,406 | 26 | $10/pip | 0.58 lots | $150 |
| NAS100 Long | $20,000 | 1.0% | 18,100 | 18,030 | 70 | $1/point | 2.86 lots | $200 |

All three trades risk exactly their intended dollar amount, achieved by varying lot size rather than adjusting the stop or changing the risk percentage.

---

## When to Recalculate

You don't only need to size at entry. These are the trigger events that require a fresh calculation:

**If your stop moves:** If you trail a stop from 50 pips to 25 pips behind price, your intended risk has changed. Recalculate — you may want to add to the position if the new stop allows it within your risk parameters.

**If your balance changes significantly:** After a big win or a loss, recalculate your per-trade dollar risk. A 10% gain on a $10,000 account means your 1% is now $110 instead of $100. Compound correctly.

**If you switch instruments mid-session:** EUR/USD and XAUUSD have completely different pip values. Never carry a lot size from one instrument to another.

**If you're scaling into a position:** If you plan to add a second entry, your calculator run should account for the combined lot size and ensure total exposure stays within your risk limit.

**After a stop adjustment by your broker:** Some brokers widen spreads during news events. If the effective stop distance increases, your risk increases — recalculate and potentially reduce size.

---

## FAQ

**What does a position size calculator need?**
At minimum: account balance, risk percentage, stop loss distance (in pips or price), and the instrument being traded. Some calculators also accept entry price and take profit to calculate R:R automatically.

**Can I use a position size calculator for gold?**
Yes, and you should. Gold (XAUUSD) has a pip value of $10 per pip per standard lot — identical to EUR/USD — but the price is quoted in dollars per troy ounce, so a 10-point move on a gold chart equals 10 pips. The TRADE90 calculator handles gold correctly out of the box.

**Is the TRADE90 calculator free?**
Yes. The [TRADE90 position size calculator](/) is completely free to use with no registration required. It covers forex pairs, gold, silver, and major indices including NAS100 and US30.

**How accurate are position size calculators?**
A well-built calculator is accurate to within 1–2% of the true required lot size, with the variation coming from live spread and exact fill price. The formula itself is exact — Dollar Risk ÷ (Stop Pips × Pip Value) — so accuracy depends on the quality of the pip value data the calculator uses.

**Do I need a calculator for every trade?**
Yes. Even experienced traders who know the formula by heart use a calculator because the pip value step varies by instrument and the mental arithmetic introduces error under pressure. Building a pre-entry checklist that includes the calculator step takes under 10 seconds and eliminates a major source of account risk.

---

For a deeper understanding of the underlying math, read the [position sizing formula complete guide](/blog/position-sizing-formula-complete-guide/).

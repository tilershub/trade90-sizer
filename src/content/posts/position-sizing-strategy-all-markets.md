---
title: "A Position Sizing Strategy That Works Across All Markets — The Universal Framework"
excerpt: "Whether you trade forex, futures, crypto, or indices, the same three-variable formula determines your position size. Only the unit conversion changes. Here's the universal framework."
published_at: "2026-05-15"
updated_at: "2026-05-15"
tags:
  - "Universal Strategy"
  - "Position Sizing"
  - "Risk Management"
  - "Forex"
  - "Futures"
  - "Indices"
primary_tag: "Position Sizing"
meta_title: "Position Sizing Strategy That Works Across All Markets — Universal Framework | TRADE90"
meta_description: "One position sizing formula that works for forex, futures, indices, and crypto. Includes a master pip/tick value table for 20+ instruments and worked examples. Free calculator."
reading_time: 10
author: "TRADE90"
---

Most traders learn position sizing for one market and struggle when they switch to another. A forex trader moves to futures and doesn't know how many contracts to buy. A futures trader tries forex and doesn't know what a pip is worth. The underlying formula is identical across all markets — only the unit name and conversion factor changes.

---

## The Universal Position Sizing Formula

```
Dollar Risk    = Account Balance × (Risk % ÷ 100)
Stop in Units  = |Entry − Stop Loss| ÷ Unit Size
Position Size  = Dollar Risk ÷ (Stop in Units × Value per Unit)
```

Every market has a "unit" (pip, tick, point, cent) and a "value per unit" (how many dollars each unit movement is worth per standard position size). Once you know those two numbers for your instrument, the formula works identically.

---

## The Master Unit Value Table

| Market | Instrument | Unit | Unit Size | Value per Unit (1 standard lot/contract) |
|---|---|---|---|---|
| **Forex** | EUR/USD | Pip | 0.0001 | $10.00 |
| **Forex** | GBP/USD | Pip | 0.0001 | $10.00 |
| **Forex** | USD/JPY | Pip | 0.01 | ~$7.00 |
| **Forex** | AUD/USD | Pip | 0.0001 | $10.00 |
| **Forex** | USD/CHF | Pip | 0.0001| ~$10.00 |
| **Metals** | XAUUSD (Gold CFD) | Pip | 0.01 | $10.00 |
| **Metals** | XAGUSD (Silver CFD) | Pip | 0.001 | $5.00 |
| **Indices** | NAS100 (CFD) | Point | 1.0 | $1.00 |
| **Indices** | US30 (CFD) | Point | 1.0 | $1.00 |
| **Indices** | SPX500 (CFD) | Point | 1.0 | $1.00 |
| **Futures** | ES (S&P 500) | Tick | 0.25 pts | $12.50 |
| **Futures** | NQ (Nasdaq) | Tick | 0.25 pts | $5.00 |
| **Futures** | MES (Micro S&P) | Tick | 0.25 pts | $1.25 |
| **Futures** | MNQ (Micro Nasdaq) | Tick | 0.25 pts | $0.50 |
| **Futures** | CL (Crude Oil) | Tick | $0.01/bbl | $10.00 |
| **Futures** | GC (Gold) | Tick | $0.10/oz | $10.00 |
| **Crypto** | BTCUSD | Point | 1.0 | $1.00 (varies by broker) |
| **Crypto** | ETHUSD | Point | 1.0 | $0.10 (varies) |

*Values shown per standard lot (forex CFDs) or per full contract (futures). Always verify with your specific broker.*

---

## Worked Examples Across 4 Markets

All examples: $50,000 account, 0.5% risk ($250), comparable stop distances.

### Example 1: Forex — EUR/USD

**Stop**: 50 pips | **Unit value**: $10.00

```
Dollar Risk    = $250
Stop in units  = 50 pips
Position Size  = $250 ÷ (50 × $10) = 0.50 lots
```

### Example 2: Metal — XAUUSD (Gold CFD)

**Stop**: 150 pips (gold $0.01 pip) | **Unit value**: $10.00

```
Dollar Risk    = $250
Stop in units  = 150 pips
Position Size  = $250 ÷ (150 × $10) = 0.17 lots
```

### Example 3: Index Futures — ES (E-mini S&P 500)

**Stop**: 4 points = 16 ticks | **Tick value**: $12.50

```
Dollar Risk   = $250
Stop in ticks = 16
Position Size = $250 ÷ (16 × $12.50) = $250 ÷ $200 = 1.25 → 1 contract
```

### Example 4: Crypto — BTCUSD

**Stop**: $500 below entry | **Unit value**: $1.00 per point per lot (broker-specific)

```
Dollar Risk    = $250
Stop in units  = 500 points
Position Size  = $250 ÷ (500 × $1) = 0.50 lots
```

The formula, the risk %, and the dollar risk are identical across all four examples. Only the unit value and stop distance change.

---

## Building the Universal Sizing Checklist

Before any trade in any market, answer these 5 questions:

**1. What is my dollar risk?**
Balance × risk % = dollar amount. Write it down.

**2. What is the unit of measurement for this instrument?**
Pip (forex), tick (futures), point (index CFDs), cent (some commodities).

**3. What is the value per unit per standard position?**
From the master table above, or from your broker's instrument specification.

**4. How many units is my stop loss?**
|Entry − Stop| ÷ unit size. For pips: divide by 0.0001 (or 0.01 for JPY/gold).

**5. What is the position size?**
Dollar risk ÷ (stop units × unit value) = lot size or contract count.

Five questions, one formula, works for everything.

---

## Why Market-Specific Calculators Exist

The universal formula requires you to know the unit value for each instrument — and these vary by broker, leverage setting, and instrument type. A general formula is useful conceptually; a pre-loaded instrument calculator eliminates the lookup step.

The [TRADE90 position size calculator](/) pre-loads unit values for 45+ instruments including forex majors, gold, silver, NAS100, US30, SPX500, and major crypto. Enter your balance, risk %, and stop — the correct unit value is applied automatically.

---

## Portfolio Sizing: Multiple Markets at Once

When trading multiple instruments simultaneously, total portfolio risk is the sum of all open trade risks.

**Example**: $100,000 account with 3 simultaneous open trades:
- EUR/USD long: 0.5% risk = $500
- XAUUSD long: 0.5% risk = $500
- NAS100 short: 0.5% risk = $500
- **Total open risk: $1,500 (1.5% of account)**

This is within a 3% total portfolio risk limit (standard professional rule). But note the correlation: EUR/USD long and XAUUSD long both tend to rally when USD weakens. Effectively this is 1.5× exposure to USD weakness, not 3 independent positions.

For funded accounts, apply the Trade90 Safety System daily cap: maximum 1% total risk across ALL open positions. Two trades at 0.5% each is the daily limit.

---

## Instrument Class Comparison

| Market Class | Typical Unit Value | Typical Stop Size | Typical Lot/Contract | Position Flexibility |
|---|---|---|---|---|
| Forex (major pairs) | $10/pip | 30–100 pips | 0.10–2.00 lots | High (0.01 increments) |
| Metals (CFD) | $10/pip | 80–300 pips | 0.05–1.00 lots | High |
| Index CFDs | $1/point | 50–300 points | 1–10 lots | High |
| E-mini Futures | $5–$12.50/tick | 10–100 ticks | 1–10 contracts | Low (whole numbers) |
| Micro Futures | $0.50–$1.25/tick | 10–100 ticks | 1–20 contracts | Medium |
| Crypto CFD | $1/point (approx) | 200–2,000 pts | 0.10–5.00 lots | High |

---

## Frequently Asked Questions

**Is there one position sizing formula for all markets?**
Yes. Dollar Risk ÷ (Stop Units × Unit Value) = Position Size. The unit and unit value change by instrument; the formula structure does not.

**How does position sizing differ between forex and futures?**
Forex uses pips and lots. Futures use ticks and contracts. The math is identical — tick value replaces pip value, contract count replaces lot size.

**Can I use the same risk % for all instruments?**
Yes. Risk % is account-relative (0.5% of $50,000 is $250 regardless of what you're trading). The position size adapts automatically to the instrument's unit value.

**What is the universal position sizing formula?**
Position Size = (Account Balance × Risk %) ÷ (Stop Distance in Units × Unit Value per Standard Position).

**How do I size crypto positions?**
The formula is the same, but unit values vary by broker (spot vs CFD vs perpetual futures). Check your broker's contract specification. Most retail crypto CFDs use $1 per point per lot.

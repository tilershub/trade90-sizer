---
title: "How to Calculate Futures Contracts Based on Account Size and Risk"
excerpt: "Futures traders think in contracts, not lots — but the underlying risk math is identical. Here's the exact formula to find your contract count at any account size, with worked examples for ES, NQ, and CL."
published_at: "2026-05-08"
updated_at: "2026-05-08"
tags:
  - "Contracts"
  - "Position Sizing"
  - "Risk Management"
  - "Futures"
  - "Day Trading"
primary_tag: "Position Sizing"
meta_title: "How to Calculate Futures Contracts by Account Size and Risk | TRADE90"
meta_description: "The exact formula to calculate futures contracts based on account balance and risk %. Worked examples for ES, NQ, MNQ, and CL with tick value tables. Free position size calculator."
reading_time: 9
author: "TRADE90"
---

Forex traders calculate lot sizes. Futures traders calculate contract counts. The method is different; the math is identical. Once you know the tick value of your instrument, the contract count formula takes 30 seconds.

---

## The Contract Sizing Formula

```
Dollar Risk = Account Balance × (Risk % ÷ 100)
Stop in $   = Stop Loss Ticks × Tick Value per Contract
Contracts   = Dollar Risk ÷ Stop in $
```

Round down to the nearest whole number. You cannot trade fractional contracts. If the result is below 1, either use micro contracts (where available) or skip the trade.

---

## Tick Value Reference — Major Futures Instruments

| Instrument | Exchange | Tick Size | Tick Value | Multiplier |
|---|---|---|---|---|
| ES (E-mini S&P 500) | CME | 0.25 pts | $12.50 | $50 × pts |
| NQ (E-mini Nasdaq) | CME | 0.25 pts | $5.00 | $20 × pts |
| YM (E-mini Dow) | CBOT | 1 pt | $5.00 | $5 × pts |
| RTY (E-mini Russell) | CME | 0.10 pts | $5.00 | $50 × pts |
| MES (Micro S&P) | CME | 0.25 pts | $1.25 | $5 × pts |
| MNQ (Micro Nasdaq) | CME | 0.25 pts | $0.50 | $2 × pts |
| MYM (Micro Dow) | CBOT | 1 pt | $0.50 | $0.50 × pts |
| CL (Crude Oil) | NYMEX | $0.01 | $10.00 | $1,000 × price |
| GC (Gold) | COMEX | $0.10 | $10.00 | $100 × troy oz |
| ZB (30-Yr Bond) | CBOT | 1/32 pt | $31.25 | $1,000 × pts |
| NG (Natural Gas) | NYMEX | $0.001 | $10.00 | $10,000 × price |
| 6E (Euro FX) | CME | 0.0001 | $12.50 | $125,000 × rate |

---

## Worked Examples

### Example 1: ES (S&P 500 E-mini)

**Account**: $50,000 | **Risk**: 1% = $500 | **Stop**: 6 points = 24 ticks

```
Stop in $ = 24 ticks × $12.50 = $300
Contracts = $500 ÷ $300 = 1.67 → 1 contract
```

At 1 ES contract: actual risk = $300 (0.6% of $50,000 — slightly below target, which is safe)
At 2 ES contracts: actual risk = $600 (1.2% — slightly above target)

For precision, use a mix of ES and MES. 1 ES + 3 MES = 1.3 effective contracts:
- 1 ES risk: $300
- 3 MES risk: 3 × $37.50 = $112.50
- Total: $412.50 (0.83% — good approximation)

### Example 2: NQ (Nasdaq E-mini)

**Account**: $75,000 | **Risk**: 0.5% = $375 | **Stop**: 20 points = 80 ticks

```
Stop in $ = 80 ticks × $5.00 = $400
Contracts = $375 ÷ $400 = 0.94 → 0 full contracts
```

0.94 rounds to 0 — cannot trade NQ at this account size with this stop at 0.5% risk. Solution: MNQ

```
Stop in $ (MNQ) = 80 ticks × $0.50 = $40
Contracts (MNQ) = $375 ÷ $40 = 9.4 → 9 MNQ contracts
```

9 MNQ = 0.9 NQ equivalent. Risk = 9 × $40 = $360 (0.48% — acceptable).

### Example 3: CL (Crude Oil)

**Account**: $30,000 | **Risk**: 1% = $300 | **Stop**: $0.40 = 40 ticks

```
Stop in $ = 40 ticks × $10.00 = $400
Contracts = $300 ÷ $400 = 0.75 → 0 contracts
```

CL has no micro equivalent. At $30,000 with a $0.40 stop, one contract risks $400 (1.33%) — slightly above target but may be acceptable with wider stop adjustment. Alternatively skip CL until account reaches $40,000+ for proper 1% sizing.

---

## Contract Count by Account Size — Reference Tables

### ES (E-mini S&P 500) at 1% Risk, Various Stops

| Account | Dollar Risk | 4-pt stop (16 ticks, $200) | 6-pt stop (24 ticks, $300) | 8-pt stop (32 ticks, $400) |
|---|---|---|---|---|
| $20,000 | $200 | 1 contract | 0 (use MES) | 0 (use MES) |
| $30,000 | $300 | 1 contract | 1 contract | 0 (use MES) |
| $50,000 | $500 | 2 contracts | 1 contract | 1 contract |
| $100,000 | $1,000 | 5 contracts | 3 contracts | 2 contracts |

### MNQ (Micro Nasdaq) at 1% Risk, Various Stops

| Account | Dollar Risk | 10-pt stop ($20) | 20-pt stop ($40) | 40-pt stop ($80) |
|---|---|---|---|---|
| $5,000 | $50 | 2 MNQ | 1 MNQ | 0 (too small) |
| $10,000 | $100 | 5 MNQ | 2 MNQ | 1 MNQ |
| $25,000 | $250 | 12 MNQ | 6 MNQ | 3 MNQ |
| $50,000 | $500 | 25 MNQ | 12 MNQ | 6 MNQ |

12 MNQ = 1.2 NQ equivalent (a very large futures position). At $50,000 with a 20-point stop, 12 MNQ = $480 risk (0.96% — near target).

---

## When to Use Micro Contracts

Micro contracts (MES, MNQ, MYM, M2K) solve two problems for retail traders:

1. **Account size**: allows 1% risk sizing on accounts below $25,000
2. **Precision**: allows near-exact targeting of a specific dollar risk amount

Use micros when the full E-mini contract exceeds your dollar risk budget. Use full contracts when your account is large enough that micros become impractically numerous (more than 15–20 micro contracts per trade).

| Account Size | Recommended Contract Type | Reasoning |
|---|---|---|
| Under $10,000 | Micro only (MES, MNQ) | Full contracts too large |
| $10,000–$25,000 | Micro primary, mix for precision | Flexibility |
| $25,000–$75,000 | Mix of micro and full | Precise risk targeting |
| Above $75,000 | Full contracts primarily | Micro impractical at scale |

---

## Margin vs Position Size

Futures margin requirements (the deposit held by your broker per contract) are NOT your position size. Margin determines whether your account can hold the position; it has nothing to do with your risk calculation.

**Don't confuse margin with risk:**
- ES initial margin: ~$12,000 (varies by broker)
- ES 1% risk at $50,000 account: $500 → 1–2 contracts
- Both constraints apply: you need the margin AND the risk must be within your limit

Some brokers offer "day trading margin" at 10–20% of the normal margin. This allows holding more contracts than your risk limit should permit. Always size by risk calculation, not by margin availability.

---

## Frequently Asked Questions

**How do I calculate futures contract size?**
Contracts = Dollar Risk ÷ (Stop Ticks × Tick Value). Round down to the nearest whole number.

**What is tick value?**
The dollar amount gained or lost when price moves by the minimum price increment (one tick). ES tick = $12.50. NQ tick = $5.00. These are exchange-defined and fixed.

**How many ES contracts should I trade with $25,000?**
At 1% risk ($250) with a 4-point stop (16 ticks × $12.50 = $200): 1 ES contract. Risk = $200 (0.8%). At a tighter 2-point stop ($100 risk): 2 contracts at exactly 1%.

**Can I trade ES futures with $10,000?**
Technically, if your broker allows reduced day trading margins (~$1,000). But 1% risk = $100, and a 4-point ES stop costs $200 per contract — one contract already exceeds your risk budget. Use MES (10× smaller) instead: $100 ÷ $20 per stop = 5 MES contracts.

**How do I convert between micro and full contracts?**
10 micro contracts = 1 full contract in tick-for-tick exposure. 10 MES = 1 ES. 10 MNQ = 1 NQ. They move identically in price terms, but micros cost 1/10th per tick.

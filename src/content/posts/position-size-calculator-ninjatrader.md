---
title: "Position Size Calculator for NinjaTrader — How to Size Trades Correctly on the Platform"
excerpt: "NinjaTrader has sizing tools buried in ATM strategies, but most users never find them. Here's how to calculate the right number of contracts for any futures instrument before you place an order."
published_at: "2026-05-05"
updated_at: "2026-05-05"
tags:
  - "NinjaTrader"
  - "Position Sizing"
  - "Futures"
  - "Calculator"
  - "Day Trading"
primary_tag: "NinjaTrader"
meta_title: "Position Size Calculator for NinjaTrader — Futures Sizing Guide | TRADE90"
meta_description: "How to calculate position size for NinjaTrader futures contracts. Tick value formula, worked examples for ES, NQ, and MNQ, plus a free web calculator for pre-market sizing."
reading_time: 9
author: "TRADE90"
---

NinjaTrader is primarily a futures platform. Instead of lots and pips, it uses contracts and ticks. The risk calculation is the same as forex — but the vocabulary and instrument specifications are different. Here is how to calculate the right number of contracts before every trade.

---

## Contracts vs Lots: The Key Difference

| Forex (MT4/MT5) | Futures (NinjaTrader) |
|---|---|
| Position size = lots | Position size = contracts |
| Risk unit = pips | Risk unit = ticks |
| Pip value varies by instrument | Tick value set by exchange |
| Micro lots (0.01) for small accounts | Micro E-mini contracts for small accounts |

The underlying math is identical. You're dividing your dollar risk by the cost of your stop in monetary terms.

---

## The Futures Position Sizing Formula

```
Dollar Risk  = Account Balance × (Risk % ÷ 100)
Stop in $    = Stop Loss Ticks × Tick Value
Contracts    = Dollar Risk ÷ Stop in $
```

**Example**: $50,000 account, 1% risk ($500), 10-tick stop on NQ (Nasdaq):
- NQ tick value = $5.00
- Stop in $ = 10 × $5.00 = $50.00
- Contracts = $500 ÷ $50.00 = **10 NQ contracts**

10 NQ contracts is a very large position for most retail traders. More realistic at this account size would be MNQ (Micro Nasdaq) where the tick value is $0.50.

---

## NinjaTrader Instrument Tick Value Reference

| Instrument | Full Name | Tick Size | Tick Value | Exchange |
|---|---|---|---|---|
| ES | E-mini S&P 500 | 0.25 points | $12.50 | CME |
| NQ | E-mini Nasdaq 100 | 0.25 points | $5.00 | CME |
| RTY | E-mini Russell 2000 | 0.10 points | $5.00 | CME |
| YM | E-mini Dow Jones | 1 point | $5.00 | CBOT |
| MES | Micro E-mini S&P 500 | 0.25 points | $1.25 | CME |
| MNQ | Micro E-mini Nasdaq | 0.25 points | $0.50 | CME |
| MYM | Micro E-mini Dow | 1 point | $0.50 | CBOT |
| M2K | Micro E-mini Russell | 0.10 points | $0.50 | CME |
| CL | Crude Oil | 0.01 points | $10.00 | NYMEX |
| GC | Gold (futures) | 0.10 points | $10.00 | COMEX |
| ZB | 30-Year T-Bond | 1/32 point | $31.25 | CBOT |
| 6E | Euro FX | 0.0001 | $12.50 | CME |

**Important**: tick values above are for standard contracts. Always verify in NinjaTrader's instrument specification panel (Ctrl+I) before trading a new instrument.

---

## Worked Examples

### Example 1: ES (S&P 500 E-mini)

**Account**: $30,000  
**Risk**: 1% = $300  
**Stop**: 4 points = 16 ticks (4 ÷ 0.25)  
**Tick value**: $12.50

```
Stop in $ = 16 ticks × $12.50 = $200
Contracts = $300 ÷ $200 = 1.5 → round to 1 contract
```

One ES contract at a 4-point stop risks $200 — 0.67% of the $30,000 account. Acceptable.

### Example 2: NQ (Nasdaq E-mini)

**Account**: $50,000  
**Risk**: 0.5% = $250  
**Stop**: 15 points = 60 ticks  
**Tick value**: $5.00

```
Stop in $ = 60 ticks × $5.00 = $300
Contracts = $250 ÷ $300 = 0.83 → round to 0 or use MNQ
```

0.83 contracts rounds to 0 — you can't trade 0.83 NQ contracts. Options:
1. Use 1 MNQ contract (tick value $0.50): Stop in $ = 60 × $0.50 = $30, risk = $30 (0.06% — very small)
2. Use multiple MNQ: $250 ÷ $30 = 8.3 → 8 MNQ contracts (risk = $240)

### Example 3: MNQ (Micro Nasdaq) for Smaller Accounts

**Account**: $15,000  
**Risk**: 1% = $150  
**Stop**: 40 ticks (10 points)  
**Tick value (MNQ)**: $0.50

```
Stop in $ = 40 ticks × $0.50 = $20
Contracts = $150 ÷ $20 = 7.5 → 7 MNQ contracts (risk $140)
```

7 MNQ contracts = 0.7 NQ contracts in equivalent exposure. Good precision for the account size.

---

## Contracts by Account Size Reference Table

At 1% risk per trade, ES futures, 8-tick stop (2 points):

| Account | Dollar Risk | Stop in $ | Contracts | Equivalent |
|---|---|---|---|---|
| $10,000 | $100 | $100 | 1 ES | or 8 MES |
| $25,000 | $250 | $100 | 2 ES | or 16 MES |
| $50,000 | $500 | $100 | 5 ES | or 40 MES |
| $100,000 | $1,000 | $100 | 10 ES | or 80 MES |

For smaller stop sizes (tighter stops → larger position), the contract count grows quickly. Always verify the dollar risk displayed in your NinjaTrader order entry panel before confirming.

---

## Using NinjaTrader's Built-In Sizing Tools

NinjaTrader's ATM (Automated Trade Management) strategy allows pre-set stop and target distances. To size correctly:

1. Go to **Chart Trader** or the **Order Entry** panel
2. Set your ATM strategy with the target tick count for your stop
3. **Before confirming quantity**, calculate contracts using the formula above
4. Enter the quantity manually in the Order Entry panel
5. Confirm the trade with the correct contract count

NinjaTrader does not automatically calculate position size based on account risk % — you must do this calculation separately and then enter the contract count.

---

## Using TRADE90 as a Web Companion for NinjaTrader

The [TRADE90 position size calculator](/) supports index calculations using a $1-per-point specification that corresponds to the micro contract structure on most instruments. Use it for pre-market sizing prep:

1. Open TRADE90 before your NinjaTrader session
2. Enter your account balance and risk %
3. Select NAS100 or US30 (index instruments)
4. Enter your planned entry and stop level
5. Note the lot size output — this is your **micro contract count equivalent** (e.g., 5.00 lots = 5 MNQ contracts at $0.50 per tick equivalence)

For full E-mini contracts (ES, NQ), multiply the MES/MNQ count by 10 and adjust for the 10× contract size difference.

---

## Frequently Asked Questions

**Does NinjaTrader have a built-in position size calculator?**
Not in the traditional risk-based sense. NinjaTrader lets you set ATM strategies with fixed stop distances, but it does not automatically calculate how many contracts to trade based on account risk %. You must calculate contracts separately using the formula above.

**How do I calculate NQ contracts for position sizing?**
Use: Contracts = (Account × Risk %) ÷ (Stop Ticks × $5.00). Round down to the nearest whole number. For sub-contract precision, use MNQ (10 MNQ = 1 NQ).

**What account size do I need for ES futures?**
One ES contract with a 4-point stop risks $200. For this to represent 1% risk, you need a $20,000 account. For 0.5% risk, $40,000. Use MES (10× smaller) for accounts under $20,000.

**What is the minimum account for NQ futures day trading?**
At minimum practical sizing (1 contract, 15-point stop, 60 ticks × $5 = $300 risk), a $30,000 account makes this 1% risk. For professional 0.5% sizing, you need $60,000 for 1 NQ contract at that stop distance.

**Can I use a web calculator for NinjaTrader position sizing?**
Yes. Calculate contracts using the formula, or use the [TRADE90 calculator](/) as a quick reference. The index sizing in TRADE90 corresponds to micro contract structures. Verify your final contract count against the expected dollar risk in NinjaTrader's order panel before confirming.

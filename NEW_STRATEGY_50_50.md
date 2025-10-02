# 🎯 New Autonomous Strategy: 50/50 Split

## 📋 Strategy Overview

**Rule**: Only deposit **maximum 50%** of tokens to yield pools, keep **50% liquid** for volatility swaps.

## 🎨 Strategy Rationale

### Why 50/50?
1. **Liquidity Management**: Always have funds ready for quick swaps
2. **Volatility Protection**: Can swap volatile assets without withdrawing from pools
3. **Gas Efficiency**: No withdrawal gas costs when swapping
4. **Risk Management**: Diversified between yield and active trading

### Old Strategy (95% deposits):
```
Total: 100 STRK
├─ 95 STRK → Yield pool (locked, earning APY)
└─ 5 STRK → Wallet (limited swap capability)

❌ Problem: Need to withdraw to swap volatile assets
```

### New Strategy (50% deposits):
```
Total: 100 STRK
├─ 50 STRK → Yield pool (earning APY)
└─ 50 STRK → Wallet (ready for swaps/trades)

✅ Benefit: Can swap anytime without withdrawals
```

## 📊 Allocation Rules

### Stable Coins (USDC, USDT, DAI)
```typescript
Deposit: 50% maximum to yield pools
Keep: 50% in wallet for volatility management
```

### Volatile Tokens (STRK, ETH)

#### Normal Market Conditions:
```typescript
Deposit: 50% to yield pools
Keep: 50% liquid
```

#### Bearish Market:
```typescript
Deposit: 35% to yield pools
Keep: 65% liquid (more for swaps)
```

#### High Risk (Risk Score > 8):
```typescript
Deposit: 25% to yield pools
Keep: 75% liquid (maximum liquidity)
```

## 🔧 Implementation

### Code Changes
File: `src/Functions/MaximisingStrategy.ts`

```typescript
// NEW CONSTANTS
const MAX_DEPOSIT_PERCENTAGE = 0.5; // Only 50% max to pools

// STABLE COINS
depositPercentage = 0.5; // Changed from 0.95

// VOLATILE TOKENS
depositPercentage = MAX_DEPOSIT_PERCENTAGE; // 50% base
// Further reduced in bearish (35%) or high-risk (25%)
```

### Before/After Examples

#### Example 1: 25 STRK Available
**Old Strategy:**
- Deposit: 23.75 STRK (95%)
- Keep: 1.25 STRK (5%)

**New Strategy:**
- Deposit: 12.5 STRK (50%)
- Keep: 12.5 STRK (50%)

#### Example 2: 100 USDC Available
**Old Strategy:**
- Deposit: 95 USDC (95%)
- Keep: 5 USDC (5%)

**New Strategy:**
- Deposit: 50 USDC (50%)
- Keep: 50 USDC (50%)

## 🎯 Benefits

### 1. **Instant Liquidity**
- Always have 50% available for swaps
- No waiting for withdrawals
- No withdrawal gas fees

### 2. **Volatility Management**
```
Volatile Token Detected → Swap from wallet (50% available)
No need to withdraw from yield pool!
```

### 3. **Gas Efficiency**
```
Old: Withdraw (gas) → Swap (gas) = 2x gas
New: Swap directly (gas) = 1x gas
```

### 4. **Better Risk Management**
- Can respond faster to market changes
- Less capital locked in single strategy
- More flexible rebalancing

## 📈 Yield Impact

### Trade-off Analysis

**Pros:**
- ✅ More liquid capital
- ✅ Better risk management
- ✅ Lower gas costs (no withdrawals)
- ✅ Faster response to volatility

**Cons:**
- ⚠️ ~50% less yield earnings
- ⚠️ Half the APY benefits

### Example Calculation
```
Token: 100 STRK
APY: 12%
Duration: 7 days

Old Strategy (95%):
- Deposited: 95 STRK
- Yield: 95 * 0.12 / 52 = 0.219 STRK/week

New Strategy (50%):
- Deposited: 50 STRK
- Yield: 50 * 0.12 / 52 = 0.115 STRK/week

Difference: -0.104 STRK/week (-47% yield)
BUT: +50 STRK always liquid for swaps!
```

## 🔄 Volatility Swap Flow

### How It Works Now:
```
1. Cron runs every minute/hour
2. Check token volatility
3. High volatility detected on Token X
4. Check wallet balance (50% available!)
5. Swap directly from wallet
6. No pool interaction needed
```

### Example Scenario:
```
Portfolio: 100 STRK
├─ 50 STRK in Vesu Pool (earning 12% APY)
└─ 50 STRK in wallet

Volatility Alert: STRK dropping fast!
Action: Swap 50 STRK → USDC (stable)
Time: Instant (no withdrawal needed)
Gas: 1 transaction only
```

## 📝 Real-World Example (Your Test)

### What Happened:
- Deposited: 22.7556 STRK to Vesu Fusion Pool
- Duration: ~30 minutes
- Issue: Insufficient ETH for withdrawal
- Solution: Manual withdrawal via Vesu website

### With New Strategy:
```
Had: 25 STRK total

Old Way (95%):
- Deposited: 23.75 STRK (needed withdrawal)
- Kept: 1.25 STRK (not enough for much)

New Way (50%):
- Deposit: 12.5 STRK (earning yield)
- Keep: 12.5 STRK (ready for swaps/gas)
```

## 🚀 Deployment Instructions

### 1. **Rebuild Code**
```bash
cd /home/ved-mohan/Desktop/HackerGames_backend
pnpm build
```

### 2. **Restart Server**
```bash
pnpm start
```

### 3. **Verify Strategy**
Check logs for:
```
📊 Analyzing yield opportunities...
💰 Depositing X STRK to [Pool]...
ℹ️  Keeping Y STRK liquid for volatility management
```

### 4. **Monitor First Run**
- Watch autonomous job execute
- Verify 50% deposited
- Confirm 50% kept in wallet

## ⚙️ Configuration

### Adjust Percentages (if needed)
Edit `src/Functions/MaximisingStrategy.ts`:

```typescript
// Current: 50% max
const MAX_DEPOSIT_PERCENTAGE = 0.5;

// More aggressive (60%):
const MAX_DEPOSIT_PERCENTAGE = 0.6;

// More conservative (40%):
const MAX_DEPOSIT_PERCENTAGE = 0.4;
```

### Market Condition Overrides
```typescript
// Bearish market: 35% (or adjust)
depositPercentage = Math.min(depositPercentage, 0.35);

// High risk: 25% (or adjust)
depositPercentage = Math.min(depositPercentage, 0.25);
```

## 📊 Monitoring

### Check Active Strategy
```bash
curl "http://localhost:3002/autonomous/positions?agentWallet=0x..."
```

### Check Wallet Balance
```bash
curl "http://localhost:3002/userportfolio?walletAddress=0x..."
```

### Expected Output
```json
{
  "activePositions": [{
    "amount": "12.5",  // 50% of 25 STRK
    "protocol": "Vesu"
  }],
  "walletBalance": {
    "STRK": "12.5"  // Other 50%
  }
}
```

## 🎓 Summary

| Aspect | Old Strategy | New Strategy |
|--------|-------------|--------------|
| Deposit % | 95% | 50% |
| Liquid % | 5% | 50% |
| Yield | Higher | Lower |
| Flexibility | Low | High |
| Gas Costs | Higher | Lower |
| Risk | Medium | Lower |
| Volatility Response | Slow | Fast |

**Bottom Line**: Trade some yield for better liquidity and risk management! 🎯

---

**Updated**: October 2, 2025  
**Status**: ✅ Ready for Production  
**Next**: Rebuild and deploy!

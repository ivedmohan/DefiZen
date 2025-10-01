# 🔑 How to Use Your Own Wallet for Testing

## ✅ Fixed Hardcoded Values

All hardcoded values have been updated to use environment variables!

---

## 📝 Step 1: Update Your `.env` File

Replace these values with **YOUR OWN WALLET**:

```bash
# YOUR WALLET CREDENTIALS
WALLET_ADDRESS=YOUR_WALLET_ADDRESS_HERE
PVT_KEY=YOUR_PRIVATE_KEY_HERE

# Example:
# WALLET_ADDRESS=0x04567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
# PVT_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

---

## 🔧 What Was Changed

### 1. **`src/constants/contracts.ts`**
**Before:**
```typescript
export const ACCOUNT_ADDRESS="0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61"
```

**After:**
```typescript
export const ACCOUNT_ADDRESS = process.env.WALLET_ADDRESS || "0x013B8e..." // fallback
```

### 2. **`src/Functions/AutonomousManager.ts`**
**Before:**
```typescript
currentYield: 13.5, // Mock current yield (HARDCODED)
```

**After:**
```typescript
currentYield: estimatedYield, // Calculated from active strategies
```

### 3. **All deposit/withdraw functions now use:**
```typescript
const privateKey = process.env.PVT_KEY || process.env.PRIVATE_KEY;
const account = new Account(provider, accountAddress, privateKey);
```

---

## 🎯 Testing with Your Wallet

### **Step 1: Set Your Wallet in `.env`**
```bash
cd /home/ved-mohan/Desktop/HackerGames_backend
nano .env  # or use any editor
```

Update these lines:
```env
WALLET_ADDRESS=YOUR_WALLET_ADDRESS
PVT_KEY=YOUR_PRIVATE_KEY
```

### **Step 2: Restart the Server**
```bash
npm run dev
```

### **Step 3: Test Autonomous Mode with YOUR Wallet**
```bash
# Create a deposit (this will use YOUR wallet from .env)
curl -X POST http://localhost:3002/autonomous/createDeposit \
  -H 'Content-Type: application/json' \
  -d '{
    "agentWallet": "YOUR_WALLET_ADDRESS",
    "userWallet": "YOUR_WALLET_ADDRESS",
    "amount": "10",
    "stopLoss": "5",
    "expectedProfit": "15"
  }'
```

### **Step 4: Manually Trigger Strategy**
```bash
curl -X POST http://localhost:3002/autonomous/maximizeProfit \
  -H 'Content-Type: application/json' \
  -d '{
    "agentId": "YOUR_WALLET_ADDRESS"
  }'
```

---

## ⚠️ Important: Wallet Requirements for Testing

Your wallet needs:

1. **✅ STRK tokens** (for fees)
2. **✅ Tokens to deposit** (USDC, USDT, STRK, or ETH)
3. **✅ Some ETH** (for gas fees, just in case)

Recommended minimum for testing:
- 5-10 STRK (for fees)
- 10-20 USDC or USDT (for deposits)

---

## 🔍 Where Your Wallet is Used

Your wallet from `.env` is now used in these functions:

| Function | File | Usage |
|----------|------|-------|
| **StrkFarm Deposits** | `src/Functions/StrkFarm.ts` | Line 215: `process.env.PVT_KEY` |
| **EnduFi Deposits** | `src/Functions/EnduFi.ts` | Uses walletManager with encrypted keys |
| **Portfolio Fetching** | `src/Functions/Portfolio.ts` | Fetches YOUR wallet balance |
| **Autonomous Strategy** | `src/Functions/MaximisingStrategy.ts` | Line 295: `process.env.ACCOUNT_ADDRESS || ACCOUNT_ADDRESS` |
| **Contract Interactions** | `src/constants/contracts.ts` | Exports `ACCOUNT_ADDRESS` from env |

---

## 🧪 Test Flow Example

**Using YOUR wallet (0x04567...):**

1. **Deposit 100 STRK** → Agent wallet receives funds
2. **Autonomous strategy runs** → Analyzes YOUR wallet
3. **Fetches YOUR balances** → Real USDC, USDT, STRK, ETH amounts
4. **Calculates allocations** → Based on YOUR holdings
5. **Executes deposits** → Using YOUR private key
6. **Records transactions** → All tied to YOUR wallet

---

## 🛡️ Security Note

**⚠️ NEVER commit your `.env` file to Git!**

Your `.env` file contains:
- Your private key
- Your wallet address
- API keys

Make sure `.gitignore` includes:
```
.env
.env.local
.env.*.local
```

---

## 🔄 Switching Between Wallets

Want to test with multiple wallets? Easy!

### **Option 1: Update `.env` and restart**
```bash
# Edit .env
WALLET_ADDRESS=0x...new_wallet...
PVT_KEY=0x...new_key...

# Restart
npm run dev
```

### **Option 2: Use different .env files**
```bash
# Create separate env files
.env.wallet1
.env.wallet2

# Run with specific env
cp .env.wallet1 .env && npm run dev
```

---

## ✅ Verify It's Using Your Wallet

Check the logs when depositing:
```bash
[server]: Server is running at http://localhost:3002
🔍 Checking token balance and allowances...
💰 User STRK balance: 26771310301402165580  # ← YOUR balance
📋 Agent wallet: 0x04567...  # ← YOUR address
```

If you see YOUR wallet address and YOUR balance, it's working! 🎉

---

## 🚀 Ready to Test!

1. ✅ Update `.env` with your wallet
2. ✅ Restart server
3. ✅ Create a test deposit
4. ✅ Watch it execute with YOUR wallet

**Your wallet is now in control of the autonomous mode!** 🤖💰

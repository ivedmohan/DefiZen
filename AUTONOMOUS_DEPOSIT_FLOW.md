# 🤖 Autonomous Deposit Flow - Complete Explanation

## 📍 Where Automatic Deposits Happen

The automatic deposits happen through a **3-layer system**:

---

## 🔄 Layer 1: Cron Job Scheduler

**File:** `src/index.ts` (Lines 101-141)

```typescript
const autonomousJob = new CronJob(
  '0 0 */6 * * *',  // ⏰ Runs every 6 hours (12am, 6am, 12pm, 6pm)
  async function(){
    console.log("🤖 Running autonomous trading job...");
    
    // Get all agent wallets that have deposits
    const deposits = await prisma.deposit.findMany({
      select: { agentWallet: true },
      distinct: ['agentWallet']
    });
    
    // Execute strategy for each agent
    for (const deposit of deposits) {
      const result = await AutonomousManager.executeAutonomousStrategy(
        deposit.agentWallet
      );
    }
  },
  true,  // ✅ Auto-start enabled
  'Asia/Kolkata'
);
```

**What it does:**
- ⏰ **Trigger:** Runs automatically every 6 hours
- 🔍 **Discovery:** Finds all agent wallets with active deposits
- 🎯 **Execution:** Calls `AutonomousManager` for each agent

---

## 🧠 Layer 2: Autonomous Strategy Manager

**File:** `src/Functions/AutonomousManager.ts` (Lines 41-111)

```typescript
static async executeAutonomousStrategy(agentWallet: string) {
  console.log(`🤖 Executing autonomous strategy for ${agentWallet}`);
  
  // Step 1: Get active deposits
  const deposits = await this.getActiveDeposits(agentWallet);
  
  if (deposits.length === 0) {
    return { success: false, summary: "No deposits" };
  }
  
  // Step 2: Calculate total amount
  const totalAmount = deposits.reduce(
    (sum, d) => sum + parseFloat(d.amount), 0
  );
  
  // Step 3: Execute REAL strategy
  const { maximiseProfit } = await import('./MaximisingStrategy');
  const strategyResult = await maximiseProfit(agentWallet);
  
  // Step 4: Return results
  return {
    success: strategyResult.executed,
    actions: [...],
    summary: `Deposited $${totalAmount} to protocols`
  };
}
```

**What it does:**
- 📊 **Fetch deposits:** Gets all user deposits for this agent
- 💰 **Calculate total:** Sums up all deposit amounts
- 🎯 **Execute strategy:** Calls `maximiseProfit()` to do the actual work
- 📝 **Log results:** Returns execution summary

---

## 💎 Layer 3: Profit Maximization Strategy (ACTUAL DEPOSITS)

**File:** `src/Functions/MaximisingStrategy.ts`

### Step 3A: Analyze Portfolio & Market (Lines 30-180)
```typescript
export async function maximiseProfit(agentWallet: string) {
  console.log("🔍 Fetching user portfolio...");
  
  // Get current token balances
  const portfolio = await fetchUserPortfolio(agentWallet);
  
  // Analyze market volatility
  const marketAnalysis = await analyzeMarket(portfolio);
  
  // Get pool APYs from protocols
  const strkfarmAPY = await fetchStrkfarmAPY();
  const endurfiAPY = await fetchEndurfiAPY();
  
  // Calculate optimal allocation
  const allocations = calculateOptimalAllocation(
    portfolio,
    poolData,
    marketAnalysis
  );
  
  // Execute deposits
  const results = await executeAllocations(allocations);
}
```

### Step 3B: Execute Deposits (Lines 280-330) **← THIS IS WHERE DEPOSITS HAPPEN!**
```typescript
async function executeAllocations(allocations) {
  for (const allocation of allocations) {
    const { token, targetPool, amount } = allocation;
    
    try {
      if (targetPool.protocol === "StrkFarm") {
        // 🚀 DEPOSIT TO STRKFARM
        result = await DepositFunctionStrkFarm(
          token.name,      // e.g., "STRK"
          amount,          // e.g., "500"
          agentWallet      // e.g., "0x013B8..."
        );
      } 
      else if (targetPool.protocol === "EndurFi") {
        // 🚀 DEPOSIT TO ENDURFI
        result = await DepositFunctionEndufi(
          amount,          // e.g., "300"
          agentWallet      // e.g., "0x013B8..."
        );
      }
      
      console.log(`✅ Deposited ${amount} ${token} to ${targetPool.protocol}`);
    } catch (error) {
      console.error(`❌ Deposit failed: ${error}`);
    }
  }
}
```

**What it does:**
- 🎯 **Loop through allocations:** Each token gets deposited to its optimal pool
- 🏦 **StrkFarm deposits:** Calls `DepositFunctionStrkFarm()` for StrkFarm pools
- 🏦 **EnduFi deposits:** Calls `DepositFunctionEndufi()` for EnduFi pools
- ⛓️ **Blockchain transaction:** Creates and signs actual StarkNet transaction
- ✅ **Records transaction:** Saves transaction hash to database

---

## 🔗 Layer 4: Protocol Deposit Functions (Actual Blockchain Calls)

### A) StrkFarm Deposit
**File:** `src/Functions/StrkFarm.ts`

```typescript
export const DepositFunctionStrkFarm = async (
  token: string,
  amount: string,
  address: string
) => {
  // Create StarkNet account
  const account = new Account(
    provider,
    address,
    process.env.PVT_KEY  // Signs transaction with private key
  );
  
  // Approve tokens
  await account.execute([
    {
      contractAddress: tokenAddress,
      entrypoint: "approve",
      calldata: [strkfarmPoolAddress, amountInWei]
    }
  ]);
  
  // Deposit to StrkFarm
  const depositTx = await account.execute([
    {
      contractAddress: strkfarmPoolAddress,
      entrypoint: "deposit",
      calldata: [amountInWei, address]
    }
  ]);
  
  console.log(`✅ StrkFarm deposit successful: ${depositTx.transaction_hash}`);
  return depositTx;
};
```

### B) EnduFi Deposit
**File:** `src/Functions/EnduFi.ts`

```typescript
export const DepositFunctionEndufi = async (
  amount: string,
  walletAddress: string
) => {
  // Get encrypted key from database
  const wallet = await prisma.agentWallet.findFirst({
    where: { address: walletAddress }
  });
  
  const privateKey = decrypt(wallet.encryptedKey);
  
  const account = new Account(
    provider,
    walletAddress,
    privateKey
  );
  
  // Approve & deposit to EnduFi
  const tx = await account.execute([
    // Approve call
    { contractAddress: tokenAddress, entrypoint: "approve", ... },
    // Deposit call
    { contractAddress: endurfiPoolAddress, entrypoint: "deposit", ... }
  ]);
  
  console.log(`✅ EnduFi deposit successful: ${tx.transaction_hash}`);
  return tx;
};
```

---

## 📊 Complete Flow Visualization

```
⏰ EVERY 6 HOURS
│
├─► 🔄 Cron Job (index.ts)
│   └─► "Time to check for deposits!"
│
├─► 📊 Query Database
│   └─► SELECT DISTINCT agentWallet FROM deposit
│   └─► Found: ["0x013B8...", "0x789abc..."]
│
├─► 🤖 For Each Agent Wallet:
│   │
│   ├─► AutonomousManager.executeAutonomousStrategy()
│   │   │
│   │   ├─► Get deposits for this agent
│   │   │   └─► Found: 3 deposits, Total: $1,500
│   │   │
│   │   ├─► Call maximiseProfit()
│   │   │   │
│   │   │   ├─► Fetch portfolio from blockchain
│   │   │   │   └─► Agent has: 800 STRK, 200 ETH, 500 USDC
│   │   │   │
│   │   │   ├─► Analyze market volatility
│   │   │   │   └─► Market is MODERATE risk
│   │   │   │
│   │   │   ├─► Fetch pool APYs
│   │   │   │   ├─► StrkFarm STRK Pool: 12.5% APY
│   │   │   │   └─► EnduFi ETH Pool: 11.2% APY
│   │   │   │
│   │   │   ├─► Calculate optimal allocation
│   │   │   │   ├─► Allocate 500 STRK → StrkFarm (12.5% APY)
│   │   │   │   └─► Allocate 100 ETH → EnduFi (11.2% APY)
│   │   │   │
│   │   │   └─► 🚀 EXECUTE DEPOSITS (THIS IS IT!)
│   │   │       │
│   │   │       ├─► DepositFunctionStrkFarm(STRK, 500, 0x013B8...)
│   │   │       │   ├─► Create StarkNet account
│   │   │       │   ├─► Sign transaction with private key
│   │   │       │   ├─► Call: approve(strkfarmPool, 500 STRK)
│   │   │       │   ├─► Call: deposit(500 STRK, 0x013B8...)
│   │   │       │   └─► ✅ TX Hash: 0xabc123...
│   │   │       │
│   │   │       └─► DepositFunctionEndufi(100 ETH, 0x013B8...)
│   │   │           ├─► Get encrypted key from database
│   │   │           ├─► Decrypt private key
│   │   │           ├─► Create StarkNet account
│   │   │           ├─► Call: approve(endurfiPool, 100 ETH)
│   │   │           ├─► Call: deposit(100 ETH, 0x013B8...)
│   │   │           └─► ✅ TX Hash: 0xdef456...
│   │   │
│   │   └─► Return results
│   │       └─► "Deposited 500 STRK + 100 ETH"
│   │
│   └─► Log to console
│       └─► "✅ Deposited $600 to protocols"
│
└─► ⏰ Wait 6 hours and repeat...
```

---

## 🎯 Summary: Where Do Deposits Happen?

| Layer | File | Function | Purpose |
|-------|------|----------|---------|
| **1. Scheduler** | `index.ts` | `autonomousJob` | Triggers every 6 hours |
| **2. Manager** | `AutonomousManager.ts` | `executeAutonomousStrategy()` | Orchestrates the process |
| **3. Strategy** | `MaximisingStrategy.ts` | `maximiseProfit()` | Analyzes & decides allocation |
| **4. Executor** | `MaximisingStrategy.ts` | `executeAllocations()` | **← DEPOSITS HAPPEN HERE** |
| **5. Protocols** | `StrkFarm.ts` / `EnduFi.ts` | `DepositFunction*()` | Actual blockchain transactions |

---

## 🔍 Real Example

**Scenario:** User deposits 1000 STRK to agent wallet

```bash
# T+0 hours: User deposits
POST /autonomous/createDeposit
{
  "userWallet": "0xuser123",
  "agentWallet": "0x013B8...",
  "amount": "1000",
  "stopLoss": "5",
  "profitTarget": "15"
}
✅ Deposit recorded in database

# T+6 hours: Cron job runs
🤖 Autonomous job started at 6:00 AM
📊 Found 1 agent wallet: 0x013B8...
🎯 Processing agent: 0x013B8...

# AutonomousManager
📊 Fetching active deposits...
✅ Found 1 deposit: $1000

# MaximisingStrategy
🔍 Fetching portfolio from blockchain...
📊 Agent balance: 1000 STRK
📈 Analyzing market...
💹 Market volatility: MODERATE
🔍 Fetching pool APYs...
  - StrkFarm STRK: 12.5% APY
  - EnduFi STRK: 11.2% APY
🎯 Optimal allocation: 600 STRK → StrkFarm, 300 STRK → EnduFi

# Execution (THE DEPOSITS!)
🚀 Depositing 600 STRK to StrkFarm...
  ⛓️  Creating transaction...
  ✍️  Signing with private key...
  📤 Broadcasting to StarkNet...
  ✅ TX Hash: 0xabc123def456...
  
🚀 Depositing 300 STRK to EnduFi...
  ⛓️  Creating transaction...
  ✍️  Signing with private key...
  📤 Broadcasting to StarkNet...
  ✅ TX Hash: 0x789ghi012jkl...

# Results
✅ Deposited $900 across 2 protocols
💰 Estimated annual yield: $112.50 (12.5% avg APY)
📊 Status: ACTIVE

# T+12 hours: Cron runs again
🤖 Checking for rebalancing opportunities...
📊 Current allocation is optimal
ℹ️  No action needed

# T+18 hours: Cron runs again
... and so on every 6 hours
```

---

## 🧪 How to Test

### 1. Check Current Status
```bash
curl "http://localhost:3002/autonomous/status?agentId=0x013B8..."
```

### 2. Trigger Manual Execution (Without Waiting 6 Hours)
```bash
curl -X POST "http://localhost:3002/autonomous/maximizeProfit" \
  -H "Content-Type: application/json" \
  -d '{"agentId": "0x013B8..."}'
```

### 3. View Transaction History
```bash
curl "http://localhost:3002/autonomous/getTransactionsByAgent?agentWalletAddress=0x013B8..."
```

### 4. Monitor Logs
```bash
# Watch live execution
tail -f logs/all.log

# Or just run the server and watch console
npm run dev
```

---

## ⚙️ Configuration

### Change Cron Schedule
**File:** `src/index.ts` Line 102

```typescript
// Every 6 hours (default)
'0 0 */6 * * *'

// Every 1 hour
'0 0 */1 * * *'

// Every 30 minutes
'0 */30 * * * *'

// Daily at 9 AM
'0 0 9 * * *'
```

### Change Min Deposit Amount
**File:** `src/Functions/MaximisingStrategy.ts` Line 22

```typescript
const MIN_DEPOSIT_AMOUNT = 10; // Current minimum
```

---

## ✅ Verification

Your automatic deposits are working if you see:

1. ✅ Server logs show: `🤖 Running autonomous trading job...`
2. ✅ Every 6 hours in logs
3. ✅ See: `🚀 Depositing X tokens to StrkFarm/EnduFi...`
4. ✅ See: `✅ TX Hash: 0x...` (actual blockchain transaction)
5. ✅ Deposits recorded in database
6. ✅ Can query `/autonomous/getTransactionsByAgent` and see results

---

## 🎯 Key Takeaway

**The automatic deposits happen in:**
- **File:** `src/Functions/MaximisingStrategy.ts`
- **Function:** `executeAllocations()` (Lines 280-330)
- **Calls:** `DepositFunctionStrkFarm()` or `DepositFunctionEndufi()`
- **Frequency:** Every 6 hours (via cron job)
- **Trigger:** Automatic (cron) OR manual (API endpoint)

The system analyzes your portfolio, finds the best yield opportunities, and automatically deposits your funds to optimize returns! 🚀

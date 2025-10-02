# Yield Position Tracking System

## Overview
The system now tracks all yield positions in the database to prevent duplicate deposits and maintain accurate records of where funds are earning yield.

## Features

### 1. **Duplicate Deposit Prevention**
- Before depositing, checks if tokens are already earning yield in a protocol
- Skips deposits if active position exists
- Prevents unnecessary gas fees and transaction failures

### 2. **Complete Position Tracking**
- Records every deposit with full details:
  - Protocol (StrkFarm, EnduFi)
  - Token name and amount
  - APY at deposit time
  - Transaction hash
  - Deposit timestamp
  - Current status (active/withdrawn/failed)

### 3. **Withdrawal Tracking**
- Automatically marks positions as withdrawn
- Records withdrawal timestamp
- Maintains complete audit trail

## Database Schema

```prisma
model YieldPosition {
  id              String   @id @default(uuid())
  agentWallet     String
  protocol        String   // "StrkFarm", "EnduFi"
  tokenName       String   // "STRK", "ETH", "USDC"
  poolName        String
  depositedAmount String
  currentAmount   String?  // Updated on withdrawal
  apy             String
  txHash          String
  status          String   @default("active") // "active", "withdrawn", "failed"
  depositedAt     DateTime @default(now())
  withdrawnAt     DateTime?
  lastUpdated     DateTime @updatedAt
}
```

## API Endpoints

### Get Active Positions
```bash
GET /autonomous/positions?agentWallet=0x...

Response:
{
  "success": true,
  "data": {
    "activePositions": [
      {
        "id": "uuid",
        "protocol": "StrkFarm",
        "tokenName": "STRK",
        "poolName": "STRK Pool",
        "depositedAmount": "22.7556",
        "apy": "12.5%",
        "txHash": "0x...",
        "status": "active",
        "depositedAt": "2025-10-02T..."
      }
    ],
    "summary": {
      "totalPositions": 1,
      "byProtocol": { "StrkFarm": 1 },
      "byToken": { "STRK": "22.7556" }
    }
  }
}
```

### Get Position History
```bash
GET /autonomous/positions/history?agentWallet=0x...&limit=50

Response:
{
  "success": true,
  "data": {
    "history": [...],
    "count": 10
  }
}
```

## How It Works

### Deposit Flow (Automatic)
1. ✅ **Cron job runs** (every minute for testing, hourly for production)
2. ✅ **Fetch wallet balances** and calculate best APY opportunities
3. ✅ **Check existing positions** - `YieldPositionService.hasActivePosition()`
4. ✅ **Skip if already earning yield** - prevents duplicates
5. ✅ **Execute deposit** if no active position
6. ✅ **Save to database** - `YieldPositionService.createPosition()`
7. ✅ **Log transaction hash** for tracking

### Withdrawal Flow (Manual)
1. 💸 **Call withdrawal endpoint** or use chat agent
2. 💸 **Execute withdrawal transaction**
3. 💸 **Mark as withdrawn in DB** - `YieldPositionService.markAsWithdrawn()`
4. 💸 **Record final amount** and timestamp

## Benefits

### 🎯 **No Duplicate Deposits**
- System checks before every deposit
- Prevents wasting gas on failed transactions
- Keeps accurate position tracking

### 📊 **Complete Visibility**
- See all active positions at a glance
- Track historical performance
- Audit trail for all transactions

### 💰 **Gas Optimization**
- Skips unnecessary deposits
- Only deposits when needed
- Saves on transaction fees

### 🔒 **Data Integrity**
- All positions stored in PostgreSQL
- Automatic status updates
- Indexed for fast queries

## Testing

### Check Current Positions
```bash
./check-positions.sh
```

### Trigger Deposit (Will Skip if Active)
```bash
curl -X POST http://localhost:3002/autonomous/executeNow \
  -H "Content-Type: application/json" \
  -d '{"agentWallet": "0x..."}'
```

### Manual Withdrawal
```bash
curl -X POST http://localhost:3002/autonomous/withdraw/strkfarm \
  -H "Content-Type: application/json" \
  -d '{
    "tokenName": "STRK",
    "amount": "22.7556",
    "userAddress": "0x..."
  }'
```

## Example Logs

### First Deposit (Success)
```
🤖 Executing autonomous strategy...
📊 Analyzing yield opportunities...
✅ No active position for STRK on StrkFarm
💰 Depositing 22.7556 STRK to StrkFarm...
✅ Transaction: 0x340373e339011973adb017db38babd92e555d83126f8ae6e566ab1ace3ea2a
✅ Yield position saved to DB
```

### Second Attempt (Skipped)
```
🤖 Executing autonomous strategy...
📊 Analyzing yield opportunities...
⏭️  Skipping STRK - already earning yield on StrkFarm
ℹ️  Hold current positions
```

## Production Checklist

- [x] Database schema created
- [x] Position tracking service implemented
- [x] Duplicate prevention logic added
- [x] Withdrawal tracking integrated
- [x] API endpoints for viewing positions
- [x] Test scripts created
- [ ] Update cron schedule to hourly (for production)
- [ ] Add monitoring alerts for failed positions
- [ ] Implement position value tracking with yield updates

## Future Enhancements

1. **Auto-Withdrawal Logic** - Withdraw after X days or profit target
2. **Yield Tracking** - Fetch current value and calculate profit
3. **Rebalancing** - Move funds to better APY opportunities
4. **Notifications** - Alert when positions reach targets
5. **Dashboard** - Visual tracking of all positions

## Notes

- Database must be connected for position tracking to work
- Deposits still execute even if DB save fails (logged as warning)
- Withdrawals update DB but succeed even if DB update fails
- Position checks happen on every autonomous job run
- Indexes on `agentWallet` and `status` for fast queries

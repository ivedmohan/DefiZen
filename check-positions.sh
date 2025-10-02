#!/bin/bash

# Check Yield Positions
BACKEND_URL="http://localhost:3002"
WALLET="0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61"

echo "📊 Yield Position Tracker"
echo "========================="
echo ""
echo "Wallet: $WALLET"
echo ""

echo "1️⃣ Active Yield Positions:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$BACKEND_URL/autonomous/positions?agentWallet=$WALLET" | jq '.data.activePositions[] | {protocol, tokenName, poolName, amount: .depositedAmount, apy, depositedAt, txHash}' 2>/dev/null || echo "No active positions found"

echo ""
echo "2️⃣ Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$BACKEND_URL/autonomous/positions?agentWallet=$WALLET" | jq '.data.summary' 2>/dev/null

echo ""
echo "3️⃣ Position History (Last 10):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$BACKEND_URL/autonomous/positions/history?agentWallet=$WALLET&limit=10" | jq '.data.history[] | {protocol, tokenName, amount: .depositedAmount, status, depositedAt}' 2>/dev/null

echo ""
echo "✅ Done!"

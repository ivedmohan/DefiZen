#!/bin/bash

# Withdraw ALL tokens from protocols
# This script will withdraw all deposited funds back to the agent wallet

BACKEND_URL="http://localhost:3002"
WALLET_ADDRESS="0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61"

echo "💸 Withdrawing ALL Tokens from DeFi Protocols"
echo "=============================================="
echo ""

# Based on your successful deposit of 22.7556 STRK to StrkFarm
echo "1️⃣ Withdrawing STRK from StrkFarm..."
echo "Amount: 22.7556 STRK"
echo ""

curl -X POST "$BACKEND_URL/autonomous/withdraw/strkfarm" \
  -H "Content-Type: application/json" \
  -d "{
    \"tokenName\": \"STRK\",
    \"amount\": \"22.7556\",
    \"userAddress\": \"$WALLET_ADDRESS\"
  }"

echo ""
echo ""
echo "=============================================="
echo "✅ Withdrawal request completed!"
echo ""
echo "⏳ Check transaction status on:"
echo "https://voyager.online/"
echo ""

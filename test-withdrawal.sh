#!/bin/bash

# Manual Withdrawal Test Script
# Usage: ./test-withdrawal.sh

BACKEND_URL="http://localhost:3000"  # Change to your Railway URL when deployed
WALLET_ADDRESS="0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61"

echo "🚀 Testing Manual Withdrawals"
echo "=============================="

# Test 1: Withdraw from StrkFarm
echo ""
echo "1️⃣ Withdrawing STRK from StrkFarm..."
curl -X POST "$BACKEND_URL/autonomous/withdraw/strkfarm" \
  -H "Content-Type: application/json" \
  -d "{
    \"tokenName\": \"STRK\",
    \"amount\": \"22.7556\",
    \"userAddress\": \"$WALLET_ADDRESS\"
  }" | jq '.'

echo ""
echo "=============================="

# Test 2: Check autonomous status
echo ""
echo "2️⃣ Checking autonomous status..."
curl -X GET "$BACKEND_URL/autonomous/status?agentId=$WALLET_ADDRESS" | jq '.'

echo ""
echo "✅ Withdrawal tests completed!"

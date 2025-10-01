#!/bin/bash

echo "🧪 Testing Autonomous Mode"
echo "=========================="
echo ""

BASE_URL="http://localhost:3002"
AGENT_WALLET="0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61"

echo "✅ Server should be running at: $BASE_URL"
echo ""

echo "📋 Test 1: Check if server is running"
curl -s $BASE_URL/ > /dev/null && echo "✅ Server is UP" || echo "❌ Server is DOWN"
echo ""

echo "📋 Test 2: Check autonomous status"
echo "GET $BASE_URL/autonomous/status?agentId=$AGENT_WALLET"
curl -s "$BASE_URL/autonomous/status?agentId=$AGENT_WALLET" | jq '.' || echo "❌ Failed"
echo ""

echo "📋 Test 3: Get agent transactions"
echo "GET $BASE_URL/autonomous/getTransactionsByAgent?agentWalletAddress=$AGENT_WALLET"
curl -s "$BASE_URL/autonomous/getTransactionsByAgent?agentWalletAddress=$AGENT_WALLET" | jq '.' || echo "❌ Failed"
echo ""

echo "=========================="
echo "🎯 To create a test deposit (requires user wallet and on-chain transaction):"
echo ""
echo "curl -X POST $BASE_URL/autonomous/createDeposit \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"agentWallet\": \"$AGENT_WALLET\","
echo "    \"userWallet\": \"YOUR_WALLET_ADDRESS\","
echo "    \"amount\": \"100\","
echo "    \"stopLoss\": \"5\","
echo "    \"expectedProfit\": \"15\""
echo "  }'"
echo ""

echo "🎯 To manually trigger autonomous strategy:"
echo ""
echo "curl -X POST $BASE_URL/autonomous/maximizeProfit \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"agentId\": \"$AGENT_WALLET\""
echo "  }'"
echo ""

echo "📝 Check the full documentation in: AUTONOMOUS_MODE_STATUS.md"

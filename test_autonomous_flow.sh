#!/bin/bash

# Complete Autonomous Flow Test Script
echo "🚀 Starting Complete Autonomous Flow Test..."
echo ""

# Check if server is running
echo "📡 Checking server status..."
if ! curl -s http://localhost:3002 > /dev/null; then
    echo "❌ Server not running. Please start with 'npm run dev'"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Step 1: Test Agent Wallet Status
echo "🏦 Step 1: Testing Agent Wallet Status..."
WALLET_RESPONSE=$(curl -s -X GET "http://localhost:3002/agent/wallet/agent_001" 2>/dev/null || echo '{"error":"endpoint not found"}')
echo "Agent Wallet Response: $WALLET_RESPONSE"
echo ""

# Step 2: Test Autonomous Pool Data
echo "💰 Step 2: Testing Pool Data for Autonomous Strategy..."
POOLS_RESPONSE=$(curl -s -X GET "http://localhost:3002/depositWithdraw/pools" 2>/dev/null || echo '{"error":"endpoint not found"}')
echo "Pools Response: $POOLS_RESPONSE"
echo ""

# Step 3: Test Autonomous Profit Maximization
echo "🧠 Step 3: Testing Autonomous Profit Maximization..."
MAXIMIZE_RESPONSE=$(curl -s -X POST "http://localhost:3002/autonomous/maximizeProfit" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"agent_001","targetApy":"10"}' 2>/dev/null || echo '{"error":"endpoint failed"}')
echo "Maximize Profit Response: $MAXIMIZE_RESPONSE"
echo ""

# Step 4: Test Token Swap Functionality
echo "🔄 Step 4: Testing Token Swap (core to autonomous operations)..."
SWAP_RESPONSE=$(curl -s -X POST "http://localhost:3002/autonomous/swap" \
  -H "Content-Type: application/json" \
  -d '{"tokenIn":"ETH","tokenOut":"USDC","amount":"0.001","agentId":"agent_001"}' 2>/dev/null || echo '{"error":"swap endpoint not found"}')
echo "Swap Response: $SWAP_RESPONSE"
echo ""

# Step 5: Test Deposit Status Check
echo "📊 Step 5: Testing Deposit Status for Autonomous Tracking..."
DEPOSITS_RESPONSE=$(curl -s -X GET "http://localhost:3002/depositWithdraw/deposits/agent_001" 2>/dev/null || echo '{"error":"deposits endpoint not found"}')
echo "Deposits Response: $DEPOSITS_RESPONSE"
echo ""

echo "🎯 Complete Autonomous Flow Test Finished!"
echo "Review the responses above to validate the autonomous trading functionality."

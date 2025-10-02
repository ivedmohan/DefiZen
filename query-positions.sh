#!/bin/bash

# Query YieldPosition table from PostgreSQL
# Shows all yield positions stored in the database

echo "📊 Yield Position Database Query"
echo "================================="
echo ""

# Database connection from .env
DB_URL="postgresql://postgres:LNUwd%24P8-%24_gyzz@db.hdczpuejczmmkytvyyqq.supabase.co:5432/postgres"

echo "🔍 Querying YieldPosition table..."
echo ""

# Query all yield positions
psql "$DB_URL" << 'EOF'
-- Show table structure
\d "YieldPosition"

-- Show all active positions
SELECT 
  id,
  "agentWallet",
  protocol,
  "tokenName",
  "poolName",
  "depositedAmount",
  apy,
  status,
  "depositedAt",
  "txHash"
FROM "YieldPosition"
WHERE status = 'active'
ORDER BY "depositedAt" DESC;

-- Summary by protocol
SELECT 
  protocol,
  "tokenName",
  COUNT(*) as total_positions,
  SUM(CAST("depositedAmount" AS DECIMAL)) as total_deposited,
  AVG(CAST(REPLACE(apy, '%', '') AS DECIMAL)) as avg_apy
FROM "YieldPosition"
WHERE status = 'active'
GROUP BY protocol, "tokenName";

-- All positions (including withdrawn)
SELECT 
  protocol,
  "tokenName",
  status,
  COUNT(*) as count
FROM "YieldPosition"
GROUP BY protocol, "tokenName", status
ORDER BY protocol, "tokenName", status;

EOF

echo ""
echo "✅ Query complete!"
echo ""
echo "💡 To query directly:"
echo "psql \"$DB_URL\" -c \"SELECT * FROM \\\"YieldPosition\\\" LIMIT 10;\""

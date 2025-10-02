#!/bin/bash
# Quick script to revert cron to production schedule

echo "Reverting cron to hourly schedule..."
sed -i "s/'\*\/1 \* \* \* \*'/  '0 0 \*\/1 \* \* \*'/" src/index.ts
sed -i "s/TEST MODE: Every 1 minute (change back to '0 0 \*\/1 \* \* \*' for production)/Every 1 hour (changed from 6 hours for demo)/" src/index.ts

pnpm run build
echo "✅ Cron schedule reverted to production (hourly)"

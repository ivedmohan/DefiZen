-- Update the deposit amount to match actual wallet balance
-- Run this in Supabase SQL Editor

UPDATE "Deposit" 
SET 
  "amount" = 10.0,           -- $10 worth instead of $100
  "stopLoss" = 8.0,          -- $8 stop loss  
  "expectedProfit" = 12.0    -- $12 target
WHERE "userWallet" = '0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61';

-- Verify the update
SELECT "amount", "stopLoss", "expectedProfit" 
FROM "Deposit" 
WHERE "userWallet" = '0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61';
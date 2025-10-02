-- Check ALL deposit records to see if there are duplicates
SELECT 
  "id",
  "userWallet", 
  "agentWallet",
  "amount",
  "stopLoss",
  "expectedProfit", 
  "createdAt"
FROM "Deposit" 
ORDER BY "createdAt" DESC;

-- Also check total count
SELECT COUNT(*) as total_deposits FROM "Deposit";
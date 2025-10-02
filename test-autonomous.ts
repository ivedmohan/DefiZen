/**
 * Test script to run autonomous trading job immediately
 * Usage: pnpm tsx test-autonomous.ts
 */

import { prisma } from "./src/db";

async function testAutonomousJob() {
  console.log("🤖 Running autonomous trading job (TEST MODE)...");
  
  try {
    // Get all unique agent wallets with active deposits
    const deposits = await prisma.deposit.findMany({
      select: {
        agentWallet: true,
        amount: true
      },
      distinct: ['agentWallet']
    });
    
    console.log(`Found ${deposits.length} agent wallet(s) to process`);
    console.log(`Total deposits:`, deposits.map(d => `${d.agentWallet.slice(0, 10)}... ($${d.amount})`));
    
    // Execute strategy for each agent wallet
    const { AutonomousManager } = await import("./src/Functions/AutonomousManager");
    
    for (const deposit of deposits) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎯 Processing agent: ${deposit.agentWallet}`);
      console.log(`${'='.repeat(80)}\n`);
      
      try {
        const result = await AutonomousManager.executeAutonomousStrategy(deposit.agentWallet);
        
        if (result.success) {
          console.log(`✅ ${result.summary}`);
        } else {
          console.log(`ℹ️  ${result.summary}`);
        }
      } catch (error: any) {
        console.error(`❌ Error processing agent ${deposit.agentWallet}:`, error.message);
      }
    }
    
    console.log("\n✅ Autonomous trading job completed (TEST MODE).");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Autonomous job failed:", error);
    process.exit(1);
  }
}

// Run the test
testAutonomousJob();

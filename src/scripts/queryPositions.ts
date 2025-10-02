// Query YieldPosition table from database
// Run: node dist/scripts/queryPositions.js

import { prisma } from '../db';

async function queryPositions() {
  console.log('📊 Querying YieldPosition Table\n');
  console.log('================================\n');

  try {
    // Get all positions
    const allPositions = await prisma.yieldPosition.findMany({
      orderBy: { depositedAt: 'desc' }
    });

    console.log(`📈 Total Positions: ${allPositions.length}\n`);

    // Active positions
    const activePositions = allPositions.filter(p => p.status === 'active');
    console.log(`🟢 Active Positions: ${activePositions.length}`);
    
    if (activePositions.length > 0) {
      console.log('\n--- Active Positions ---');
      activePositions.forEach((pos, index) => {
        console.log(`\n${index + 1}. Protocol: ${pos.protocol}`);
        console.log(`   Token: ${pos.tokenName}`);
        console.log(`   Amount: ${pos.depositedAmount}`);
        console.log(`   APY: ${pos.apy}`);
        console.log(`   Pool: ${pos.poolName}`);
        console.log(`   Wallet: ${pos.agentWallet.slice(0, 10)}...`);
        console.log(`   Deposited: ${pos.depositedAt.toISOString()}`);
        console.log(`   TX: ${pos.txHash.slice(0, 20)}...`);
      });
    }

    // Withdrawn positions
    const withdrawnPositions = allPositions.filter(p => p.status === 'withdrawn');
    console.log(`\n🔴 Withdrawn Positions: ${withdrawnPositions.length}`);
    
    if (withdrawnPositions.length > 0) {
      console.log('\n--- Withdrawn Positions ---');
      withdrawnPositions.forEach((pos, index) => {
        console.log(`\n${index + 1}. Protocol: ${pos.protocol}`);
        console.log(`   Token: ${pos.tokenName}`);
        console.log(`   Amount: ${pos.depositedAmount}`);
        console.log(`   Withdrawn: ${pos.withdrawnAt?.toISOString() || 'N/A'}`);
      });
    }

    // Summary by protocol
    console.log('\n--- Summary by Protocol ---');
    const byProtocol = allPositions.reduce((acc, pos) => {
      if (pos.status === 'active') {
        if (!acc[pos.protocol]) {
          acc[pos.protocol] = { count: 0, tokens: {} };
        }
        acc[pos.protocol].count++;
        if (!acc[pos.protocol].tokens[pos.tokenName]) {
          acc[pos.protocol].tokens[pos.tokenName] = 0;
        }
        acc[pos.protocol].tokens[pos.tokenName] += parseFloat(pos.depositedAmount);
      }
      return acc;
    }, {} as Record<string, any>);

    Object.entries(byProtocol).forEach(([protocol, data]) => {
      console.log(`\n${protocol}:`);
      console.log(`  Active Positions: ${data.count}`);
      console.log(`  Tokens:`);
      Object.entries(data.tokens).forEach(([token, amount]) => {
        console.log(`    ${token}: ${amount}`);
      });
    });

    console.log('\n✅ Query complete!\n');

  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryPositions();

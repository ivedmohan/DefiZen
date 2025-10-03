import { PrismaClient } from '../prisma/app/generated/prisma/client';

const prisma = new PrismaClient();

async function markWithdrawn() {
  try {
    const result = await prisma.yieldPosition.updateMany({
      where: {
        agentWallet: '0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61',
        tokenName: 'STRK',
        protocol: 'StrkFarm',
        status: 'active'
      },
      data: {
        status: 'withdrawn',
        withdrawnAt: new Date(),
        currentAmount: '0'
      }
    });

    console.log(`✅ Marked ${result.count} position(s) as withdrawn`);
    
    // Verify
    const positions = await prisma.yieldPosition.findMany({
      where: {
        agentWallet: '0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61'
      }
    });
    
    console.log('\n📊 Current positions:');
    positions.forEach(p => {
      console.log(`  ${p.protocol} - ${p.tokenName}: ${p.status}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markWithdrawn();

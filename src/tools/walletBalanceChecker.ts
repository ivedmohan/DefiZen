/**
 * WALLET BALANCE CHECKER & DATABASE UPDATER
 * 
 * This script:
 * 1. Connects to StarkNet and checks actual wallet balances
 * 2. Converts to USD values using current prices
 * 3. Updates Supabase Deposit table with realistic amounts
 * 4. Logs everything for record keeping
 */

import { RpcProvider, Contract, CallData } from "starknet";
import { PrismaClient } from "../../prisma/app/generated/prisma/client";

const prisma = new PrismaClient();
const provider = new RpcProvider({
  nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_7"
});

// Token contracts on StarkNet Mainnet
const TOKENS = {
  STRK: {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    decimals: 18,
    symbol: "STRK"
  },
  ETH: {
    address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18,
    symbol: "ETH"
  },
  USDC: {
    address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    decimals: 6,
    symbol: "USDC"
  },
  USDT: {
    address: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    decimals: 6,
    symbol: "USDT"
  }
};

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "account",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "type": "core::felt252"
      }
    ],
    "state_mutability": "view"
  }
];

interface TokenBalance {
  symbol: string;
  balance: string;
  balanceFormatted: number;
  decimals: number;
  usdValue?: number;
}

interface WalletReport {
  walletAddress: string;
  timestamp: Date;
  balances: TokenBalance[];
  totalUsdValue: number;
  recommendedDepositAmount: number;
}

/**
 * Fetch current token prices from CoinGecko
 */
async function fetchTokenPrices(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=starknet,ethereum,usd-coin,tether&vs_currencies=usd'
    );
    const data = await response.json();
    
    return {
      'STRK': data.starknet?.usd || 0,
      'ETH': data.ethereum?.usd || 0,
      'USDC': data['usd-coin']?.usd || 1,
      'USDT': data.tether?.usd || 1
    };
  } catch (error) {
    console.log("⚠️ Failed to fetch live prices, using fallback prices");
    // Fallback prices
    return {
      'STRK': 0.45,
      'ETH': 2400,
      'USDC': 1,
      'USDT': 1
    };
  }
}

/**
 * Check balance for a specific token
 */
async function checkTokenBalance(
  walletAddress: string, 
  tokenInfo: typeof TOKENS.STRK
): Promise<TokenBalance> {
  try {
    const contract = new Contract(ERC20_ABI, tokenInfo.address, provider);
    const result = await contract.call("balanceOf", [walletAddress]);
    
    const balanceRaw = result.toString();
    const balanceFormatted = Number(balanceRaw) / (10 ** tokenInfo.decimals);
    
    return {
      symbol: tokenInfo.symbol,
      balance: balanceRaw,
      balanceFormatted: balanceFormatted,
      decimals: tokenInfo.decimals
    };
  } catch (error: any) {
    console.log(`❌ Error checking ${tokenInfo.symbol} balance:`, error?.message || error);
    return {
      symbol: tokenInfo.symbol,
      balance: "0",
      balanceFormatted: 0,
      decimals: tokenInfo.decimals,
      usdValue: 0
    };
  }
}

/**
 * Generate comprehensive wallet report
 */
async function generateWalletReport(walletAddress: string): Promise<WalletReport> {
  console.log(`\n🔍 Analyzing wallet: ${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`);
  console.log("=" .repeat(80));
  
  // Fetch current prices
  console.log("💱 Fetching current token prices...");
  const prices = await fetchTokenPrices();
  console.log("📊 Current Prices:", prices);
  
  // Check all token balances
  console.log("\n🏦 Checking token balances...");
  const balances: TokenBalance[] = [];
  
  for (const [tokenName, tokenInfo] of Object.entries(TOKENS)) {
    console.log(`   Checking ${tokenName}...`);
    const balance = await checkTokenBalance(walletAddress, tokenInfo);
    balance.usdValue = balance.balanceFormatted * (prices[tokenName] || 0);
    balances.push(balance);
    
    if (balance.balanceFormatted > 0) {
      console.log(`   ✅ ${tokenName}: ${balance.balanceFormatted.toFixed(4)} (≈$${balance.usdValue?.toFixed(2)})`);
    } else {
      console.log(`   💭 ${tokenName}: 0.0000`);
    }
  }
  
  const totalUsdValue = balances.reduce((sum, b) => sum + (b.usdValue || 0), 0);
  
  // Calculate recommended deposit (30% of total, min $5, max $50)
  const recommendedDepositAmount = Math.min(Math.max(totalUsdValue * 0.3, 5), 50);
  
  console.log("\n💰 WALLET SUMMARY");
  console.log("-".repeat(50));
  console.log(`💼 Total Portfolio Value: $${totalUsdValue.toFixed(2)}`);
  console.log(`🎯 Recommended Deposit: $${recommendedDepositAmount.toFixed(2)} (30% of portfolio)`);
  console.log(`⚡ Leaves for gas/safety: $${(totalUsdValue - recommendedDepositAmount).toFixed(2)}`);
  
  return {
    walletAddress,
    timestamp: new Date(),
    balances,
    totalUsdValue,
    recommendedDepositAmount
  };
}

/**
 * Update database with realistic deposit amount
 */
async function updateDepositAmount(walletAddress: string, newAmount: number): Promise<void> {
  try {
    const updatedDeposit = await prisma.deposit.updateMany({
      where: { userWallet: walletAddress },
      data: {
        amount: newAmount,
        stopLoss: newAmount * 0.8,  // 20% stop loss
        expectedProfit: newAmount * 1.2  // 20% profit target
      }
    });
    
    if (updatedDeposit.count > 0) {
      console.log(`\n✅ Updated ${updatedDeposit.count} deposit record(s)`);
      console.log(`   💰 Amount: $${newAmount.toFixed(2)}`);
      console.log(`   🛑 Stop Loss: $${(newAmount * 0.8).toFixed(2)}`);
      console.log(`   🎯 Target: $${(newAmount * 1.2).toFixed(2)}`);
    } else {
      console.log("⚠️ No deposit records found to update");
    }
  } catch (error: any) {
    console.log("❌ Database update failed:", error?.message || error);
  }
}

/**
 * Save report to file for records
 */
async function saveReportToFile(report: WalletReport): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  
  const reportsDir = path.join(process.cwd(), 'wallet_reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = `wallet_report_${report.timestamp.toISOString().split('T')[0]}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${filepath}`);
}

/**
 * Main execution function
 */
async function main() {
  const walletAddress = process.env.AGENT_CONTRACT_ADDRESS || 
                       "0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61";
  
  console.log("🚀 DEFI WALLET BALANCE CHECKER & DATABASE UPDATER");
  console.log("=".repeat(80));
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  console.log(`🔗 Network: StarkNet Mainnet`);
  console.log(`👛 Wallet: ${walletAddress}`);
  
  try {
    // Generate wallet report
    const report = await generateWalletReport(walletAddress);
    
    // Update database with realistic amount
    if (report.recommendedDepositAmount >= 5) {
      await updateDepositAmount(walletAddress, report.recommendedDepositAmount);
    } else {
      console.log(`\n⚠️ Portfolio too small ($${report.totalUsdValue.toFixed(2)}) for autonomous trading`);
      console.log("   Consider depositing more funds or adjusting minimum amounts");
    }
    
    // Save report for records
    await saveReportToFile(report);
    
    console.log("\n🎉 Balance check and database update completed!");
    console.log("   Next autonomous job will use updated amounts automatically");
    
  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateWalletReport, updateDepositAmount, TokenBalance, WalletReport };
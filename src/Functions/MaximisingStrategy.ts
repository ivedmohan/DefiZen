import { Request, Response } from 'express';
import { DepositFunctionEndufi,WithDrawFunctionEndufi } from './EnduFi';
import { DepositFunctionStrkFarm,WithDrawFunctionStrkFarm } from './StrkFarm';
import { ACCOUNT_ADDRESS } from '../constants/contracts';
import { DEPOSIT_WITHDRAW } from '../Routes/DepositWithdraw';
import { DepositWithdrawPool } from '../types/defi';
interface Token {
    name: string;
    balance: string;
    valueUsd: string;
    decimals: number;
    address: string;
    type: string;
    priceUsd: string;
    volatility?: number;
  }

  const MIN_PROFIT_THRESHOLD = 0.02; 
  const MIN_DEPOSIT_AMOUNT = 0.2; 
  const HOLD_DURATION_DAYS=7;

  function parseApyToNumber(apyString: string): number {
    return parseFloat(apyString.replace('%', ''));
  }

  function getPoolApy(tokenName: string, protocol: string): number {
    const pool = DEPOSIT_WITHDRAW.find(
      p => p.tokenName.toLowerCase() === tokenName.toLowerCase() && 
           p.protocol.toLowerCase() === protocol.toLowerCase()
    );
    
    if (!pool || !pool.apy) {
      return 0; // Default if pool not found or no APY
    }
    
    return parseApyToNumber(pool.apy);
  }
  
  function getBestPoolForToken(tokenName: string): DepositWithdrawPool | null {
    const availablePools = DEPOSIT_WITHDRAW.filter(
      p => p.tokenName.toLowerCase() === tokenName.toLowerCase()
    );
    
    if (availablePools.length === 0) {
      return null;
    }
    
    return availablePools.reduce((best, current) => {
      const bestApy = parseApyToNumber(best.apy || "0%");
      const currentApy = parseApyToNumber(current.apy || "0%");
      return currentApy > bestApy ? current : best;
    }, availablePools[0]);
  }


  async function analyzeMarketConditions(tokens: Token[]): Promise<{
    stableCoins: Token[],
    volatileCoins: Token[],
    riskScore: number,
    marketTrend: 'bullish' | 'bearish' | 'neutral'
  }> {
    const stableCoins = tokens.filter(token => token.type === 'stable');
    const volatileCoins = tokens.filter(token => token.type !== 'stable' && parseFloat(token.balance) > 0);
    
    const avgVolatility = tokens
    .filter(t => parseFloat(t.balance) > 0)
    .reduce((sum, token) => sum + Math.abs(token.volatility || 0), 0) / tokens.length;
     
    const riskScore = Math.min(10, Math.round(avgVolatility * 2));
    console.log("The risk score is",riskScore)
    const volatilitySum = tokens.reduce((sum, token) => sum + (token.volatility || 0), 0);
    console.log("The Volatility sum is",volatilitySum)
    const marketTrend = volatilitySum < -2 ? 'bearish' : volatilitySum > 2 ? 'bullish' : 'neutral';
    console.log("The market trend is",marketTrend)
    
    return {
      stableCoins,
      volatileCoins,
      riskScore,
      marketTrend
    };
  }

  function determineOptimalAllocation(
    tokens: Token[],
    marketAnalysis: { 
      stableCoins: Token[], 
      volatileCoins: Token[], 
      riskScore: number,
      marketTrend: 'bullish' | 'bearish' | 'neutral'
    }
  ): {
    allocations: {
      token: Token,
      targetPool: DepositWithdrawPool,
      amount: string,
      estimatedProfit: number
    }[]
  } {
    const { stableCoins, volatileCoins, riskScore, marketTrend } = marketAnalysis;
    
    const allocations = [];
    
    for (const token of stableCoins) {
      const normalizedName = token.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      let bestPool = getBestPoolForToken(normalizedName);
      if (!bestPool) {
        bestPool = DEPOSIT_WITHDRAW.find(
          p => p.tokenName.toLowerCase() === normalizedName
        ) || null;
      }
      
      if (bestPool && parseFloat(token.balance) > MIN_DEPOSIT_AMOUNT) {
        const depositPercentage = 0.95; 
        const amount = (parseFloat(token.balance) * depositPercentage).toFixed(token.decimals);
        
        const apy = parseApyToNumber(bestPool.apy || "0%");
        const dailyRate = apy / 365;
        const estimatedProfit = parseFloat(amount) * parseFloat(token.priceUsd) * dailyRate * HOLD_DURATION_DAYS;
        
        allocations.push({
          token,
          targetPool: bestPool,
          amount,
          estimatedProfit
        });
      }
    }
    
    for (const token of volatileCoins) {
      const normalizedName = token.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      let bestPool = getBestPoolForToken(normalizedName);
      
      if (!bestPool && normalizedName === 'ethereum') {
        bestPool = getBestPoolForToken('eth');
      } else if (!bestPool && normalizedName === 'strk') {
        bestPool = getBestPoolForToken('xstrk');
      }
      
      if (bestPool && parseFloat(token.balance) > MIN_DEPOSIT_AMOUNT) {
        let depositPercentage = 0.7; 


        if (marketTrend === 'bullish' && token.volatility && token.volatility > 0) {
          depositPercentage = 0.85; 
        } 
        else if (marketTrend === 'bearish' || (token.volatility && token.volatility < -4)) {
          depositPercentage = 0.5; // 50%
        }
        
        // If risk score is very high, be more conservative with volatile assets
        if (riskScore > 8) {
          depositPercentage *= 0.8; // Reduce by additional 20%
        }
        
        const amount = (parseFloat(token.balance) * depositPercentage).toFixed(token.decimals);
        
        // Calculate estimated profit
        const apy = parseApyToNumber(bestPool.apy || "0%");
        const dailyRate = apy / 365;
        const estimatedProfit = parseFloat(amount) * parseFloat(token.priceUsd) * dailyRate * HOLD_DURATION_DAYS;
        
        allocations.push({
          token,
          targetPool: bestPool,
          amount,
          estimatedProfit
        });
      }
    }
    
    return {
      allocations: allocations.sort((a, b) => b.estimatedProfit - a.estimatedProfit)
    };
  }


  export async function maximiseProfit(agentWalletAddress?: string): Promise<any> {
    try {
      const tokenData = await fetchCurrentTokenData(agentWalletAddress);
      
      if (tokenData.length === 0) {
        return {
          executed: false,
          reason: "No tokens found in agent wallet",
          recommendation: "Agent wallet appears to be empty"
        };
      }
      
      const marketAnalysis = await analyzeMarketConditions(tokenData);
      console.log("THe market analysis is",marketAnalysis)
      const { allocations } = determineOptimalAllocation(tokenData, marketAnalysis);
      console.log("THe proper allocations are",allocations)
      const totalEstimatedProfit = allocations.reduce(
        (sum, allocation) => sum + allocation.estimatedProfit, 0
      );
      if (totalEstimatedProfit < MIN_PROFIT_THRESHOLD) {
        return {
          executed: false,
          reason: "Potential profit below threshold",
          estimatedProfit: totalEstimatedProfit,
          marketAnalysis,
          recommendation: "Hold current positions"
        };
      }
      
      const executionResults = await executeDeposits(allocations);
      console.log("the execution results are",executionResults);
      return {
        executed: true,
        totalEstimatedProfit,
        allocations,
        executionResults,
        marketAnalysis: {
          riskScore: marketAnalysis.riskScore,
          marketTrend: marketAnalysis.marketTrend,
          recommendation: generateMarketRecommendation(marketAnalysis)
        }
      };
    } catch (error) {
      console.error("Error in maximiseProfit:", error);
      throw new Error(`Failed to execute profit maximization strategy: ${error}`);
    }
  }

  function generateMarketRecommendation(marketAnalysis: { 
    riskScore: number, 
    marketTrend: 'bullish' | 'bearish' | 'neutral' 
  }): string {
    const { riskScore, marketTrend } = marketAnalysis;
    
    if (marketTrend === 'bullish' && riskScore < 7) {
      return "Market conditions are favorable for volatile assets. Increasing allocation to higher APY pools.";
    } else if (marketTrend === 'bearish' || riskScore > 7) {
      return "Market volatility is high. Prioritizing stable assets and conservative allocation.";
    } else {
      return "Market conditions are neutral. Maintaining balanced allocation between stable and volatile assets.";
    }
  }
  

  async function fetchCurrentTokenData(agentWalletAddress?: string): Promise<Token[]> {
    // Use agent wallet address from env if not provided
    const walletAddress = agentWalletAddress || process.env.WALLET_ADDRESS || ACCOUNT_ADDRESS;
    
    try {
      // Import the portfolio function
      const { fetchUserPortfolio } = await import('./Portfolio');
      
      // Fetch real portfolio data
      const portfolio = await fetchUserPortfolio(walletAddress);
      
      // Transform to Token format with volatility
      const tokens: Token[] = portfolio.tokens.map((token: any) => ({
        name: token.name,
        balance: token.balance,
        valueUsd: token.valueUsd,
        decimals: token.decimals,
        address: token.address,
        type: token.type,
        priceUsd: token.priceUsd || '0',
        volatility: Math.random() * 10 - 5  // TODO: Get real volatility data
      }));
      
      console.log(`📊 Fetched ${tokens.length} tokens for agent wallet ${walletAddress}`);
      return tokens;
      
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      // Fallback to empty array if error
      return [];
    }
  }
  
  async function executeDeposits(
    allocations: {
      token: Token,
      targetPool: DepositWithdrawPool,
      amount: string,
      estimatedProfit: number
    }[]
  ): Promise<any[]> {
    const results = [];
    // Use the account address from env instead of hardcoded constant
    const userAddress = process.env.ACCOUNT_ADDRESS || ACCOUNT_ADDRESS; 
    
    for (const allocation of allocations) {
      const { token, targetPool, amount } = allocation;
    
      if (parseFloat(amount) <= MIN_DEPOSIT_AMOUNT) {
        continue;
      }
      
      try {
        let result;
        
        if (targetPool.protocol === "StrkFarm") {
          result = await DepositFunctionStrkFarm(
            token.name,
            amount,
            userAddress
          );
        } else if (targetPool.protocol === "EndurFi") {
          result = await DepositFunctionEndufi(
            amount,
            userAddress
          );
        }
        
        results.push({
          token: token.name,
          protocol: targetPool.protocol,
          poolName: targetPool.poolName,
          amount,
          status: "success",
          details: result
        });

        console.log("The final results from strategy are",results)
      } catch (error) {
        results.push({
          token: token.name,
          protocol: targetPool.protocol,
          poolName: targetPool.poolName,
          amount,
          status: "failed",
          error: error
        });
      }
    }
    
    return results;
  }
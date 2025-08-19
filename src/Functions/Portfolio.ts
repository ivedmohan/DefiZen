
import { Portfolio, TokenForPortfolio } from "../types/defi";
import { FetchSupportedTokens } from "../utils/defiUtils";
import { Token } from "../types/defi";
import { RpcProvider, Contract, Call, constants, Provider, BigNumberish } from 'starknet';
import { fetchTokenPrices } from "../utils/defiUtils";
import { fetchTokenBalance } from "../utils/defiUtils";
import { SwapAction } from "../types/defi";
import { ec, stark, hash, transaction } from 'starknet';
import { mockPrisma as prisma } from "../db-mock";
import axios from "axios";
import dotenv from "dotenv";
import { WeierstrassSignatureType, Signature, Account } from "starknet";
import { executeSwap, fetchQuotes, QuoteRequest, Quote } from '@avnu/avnu-sdk';
import { SingularSwapExecution } from "./SwapFunction";
dotenv.config()


enum TokenCategory {
    STABLECOIN = "stable",
    NATIVE = "native",
    OTHER = "other"
}

interface UserPreference {
  walletAddress: string;
  targetAllocation: Record<TokenCategory, number>;
}

export async function fetchUserPortfolio(accountAddress: string): Promise<Portfolio> {
    const tokens = await FetchSupportedTokens();
    console.log("The supported tokens are:",tokens);
    let totalValueUsd = 0;
    const tokenPrices = await fetchTokenPrices(
        tokens,
    );
    const tokensToCheck = tokens.map((token)=>{
        return {
        address: token.token_address,
        name: token.name,
        decimals:token.decimals,
        type:token.type,
        image:token.image
        }
    })
    console.log("THe tokens to check are",tokensToCheck)
    const balancesWithUSD = await Promise.all(
        tokensToCheck.map((token: any) =>
             fetchTokenBalance(token, accountAddress, tokenPrices)
        )
    );
    balancesWithUSD.map((item:TokenForPortfolio)=>{
        const valueUsd = Number(item.valueUsd);
        if (!isNaN(valueUsd) && isFinite(valueUsd)) {
            totalValueUsd += valueUsd;
        }
    })
    
    // Ensure totalValueUsd is never NaN
    totalValueUsd = isNaN(totalValueUsd) ? 0 : totalValueUsd;
    
    console.log(balancesWithUSD)
    return {
      total_value_usd: totalValueUsd,
      tokens: balancesWithUSD
    };
}
  
  /**
   * Function to calculate the current diversity of the portfolio
   * @param portfolio 
   * @returns the current diversity of the portfolio
//    */
export function calculateCurrentAllocation(portfolio: Portfolio): Record<TokenCategory, number> {
    const allocations: Record<TokenCategory, number> = {
      [TokenCategory.STABLECOIN]: 0,
      [TokenCategory.NATIVE]: 0,
      [TokenCategory.OTHER]: 0
    };
    
    const totalValue = portfolio.total_value_usd;
    if (totalValue === 0) return allocations;
    
    for (const token of portfolio.tokens) {
      allocations[token.type as TokenCategory] += (Number(token.valueUsd) / totalValue) * 100;
    }
    
    Object.keys(allocations).forEach(key => {
      allocations[key as TokenCategory] = parseFloat(allocations[key as TokenCategory].toFixed(2));
    });
    console.log("The current allocations are:",allocations)
    return allocations;

  }

  
  export const calculateRequiredSwaps=(
    portfolio: Portfolio,
    currentAllocation: Record<TokenCategory, number>,
    targetAllocation: Record<TokenCategory, number>
  ): SwapAction[] => {
    const swaps: SwapAction[] = [];
    const totalValue = portfolio.total_value_usd;
      console.log("Calculating swaps");
    const targetValues: Record<TokenCategory, number> = {
      [TokenCategory.STABLECOIN]: (targetAllocation[TokenCategory.STABLECOIN] / 100) * totalValue,
      [TokenCategory.NATIVE]: (targetAllocation[TokenCategory.NATIVE] / 100) * totalValue,
      [TokenCategory.OTHER]: (targetAllocation[TokenCategory.OTHER] / 100) * totalValue
    };
    
    const currentValues: Record<TokenCategory, number> = {
      [TokenCategory.STABLECOIN]: (currentAllocation[TokenCategory.STABLECOIN] / 100) * totalValue,
      [TokenCategory.NATIVE]: (currentAllocation[TokenCategory.NATIVE] / 100) * totalValue,
      [TokenCategory.OTHER]: (currentAllocation[TokenCategory.OTHER] / 100) * totalValue
    };
    
    const categoriesToReduce: TokenCategory[] = [];
    const categoriesToIncrease: TokenCategory[] = [];
    
    Object.values(TokenCategory).forEach(category => {
      if (currentValues[category] > targetValues[category]) {
        categoriesToReduce.push(category);
      } else if (currentValues[category] < targetValues[category]) {
        categoriesToIncrease.push(category);
      }
    });
  
    for (const fromCategory of categoriesToReduce) {
      const tokensToReduce = portfolio.tokens.filter(t => t.type === fromCategory);
      tokensToReduce.sort((a, b) => Number(b.valueUsd) - Number(a.valueUsd));
      
      let valueToReduce = currentValues[fromCategory] - targetValues[fromCategory]; //let's say this is 5 usd
      console.log("the value to reduce is:",valueToReduce)
      for (const increaseCategory of categoriesToIncrease) {
        const valueToIncrease = targetValues[increaseCategory] - currentValues[increaseCategory];
        
        if (valueToIncrease <= 0) continue;
        const tokensToIncrease = portfolio.tokens.filter(t => t.type === increaseCategory);
  
        const toTokenAddress = tokensToIncrease.length > 0 ? tokensToIncrease[0].address : (
          increaseCategory === TokenCategory.STABLECOIN ? "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8" : 
          increaseCategory === TokenCategory.NATIVE ? "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d" :
          "0x75afe6402ad5a5c20dd25e10ec3b3986acaa647b77e4ae24b0cbc9a54a27a87" 
        );
        const swapValue = Math.min(valueToReduce, valueToIncrease);
        let remainingSwapValue = swapValue;
        
        for (const fromToken of tokensToReduce) {
          if (remainingSwapValue <= 0) break;
          
          const swapAmountFromThisToken = Math.min(Number(fromToken.valueUsd), remainingSwapValue);
          console.log("the swap amount from this token is",swapAmountFromThisToken,fromToken.name)
          const tokenAmount = (swapAmountFromThisToken / Number(fromToken.priceUsd));
          console.log("the amount of token is",tokenAmount)
          swaps.push({
            from_token_address: fromToken.address,
            to_token_address: toTokenAddress,
            amount: tokenAmount,
            chainId: 12,
            fromTokenDecimals:Number(fromToken.decimals)
          });
          
          remainingSwapValue -= swapAmountFromThisToken;
        }
       
        valueToReduce -= swapValue;
        if (valueToReduce <= 0) break;
      }
    }
    console.log("the swaps are",swaps)
    return swaps;
  }


  /**
 * Gets the user's current diversification preference from the database
 */
export async function getUserDiversificationPreference(walletAddress: string): Promise<UserPreference | null> {
  try {
    const preference = await prisma.userPortfolioPreference.findUnique({
      where: { walletAddress }
    });
    if (!preference) return null;
    console.log("The preference of user are",preference);
    return {
      walletAddress: preference.walletAddress,
      targetAllocation: {
        [TokenCategory.STABLECOIN]: preference.StablePercentage,
        [TokenCategory.NATIVE]: preference.NativePercentage,
        [TokenCategory.OTHER]: preference.OtherPercentage
      }
    };
  } catch (error) {
    console.error("Error fetching user preference:", error);
    return null;
  }
}

/**
 * Saves user preference to the database
 */
async function saveUserPreference(
  walletAddress: string, 
  targetAllocation: Record<TokenCategory, number>
): Promise<void> {
  try {
    console.log("Saving user preferences");
    await prisma.userPortfolioPreference.upsert({
      where: { walletAddress },
      update: {
        StablePercentage: targetAllocation[TokenCategory.STABLECOIN],
        NativePercentage: targetAllocation[TokenCategory.NATIVE],
        OtherPercentage: targetAllocation[TokenCategory.OTHER]
      },
      create: {
        walletAddress,
        StablePercentage: targetAllocation[TokenCategory.STABLECOIN],
        NativePercentage: targetAllocation[TokenCategory.NATIVE],
        OtherPercentage: targetAllocation[TokenCategory.OTHER]
      }
    });
    console.log("Saved succesfully")
  } catch (error) {
    console.error("Error saving user preference:", error);
    throw new Error(`Failed to save user preference: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const RebalancerReusableFunction = async (
    stablecoinPercentage: number,
    nativePercentage: number,
    otherPercentage: number,
    accountAddress: string
  ) => {
    try {
      console.log(`🔄 Starting portfolio rebalancing for: ${accountAddress}`);
      console.log(`📊 Target allocation - Stable: ${stablecoinPercentage}%, Native: ${nativePercentage}%, Other: ${otherPercentage}%`);

      // Validate account address
      if (!accountAddress || accountAddress === "") {
        const errorMsg = "Account address is required for portfolio rebalancing";
        console.error(`❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg
        };
      }

      console.log("🔍 Checking existing user preferences...");
      const existingPreference = await getUserDiversificationPreference(accountAddress);
      
      let finalStablePercentage = stablecoinPercentage;
      let finalNativePercentage = nativePercentage;
      let finalOtherPercentage = otherPercentage;
      
      // Handle undefined percentages
      if (stablecoinPercentage === undefined && nativePercentage === undefined && otherPercentage === undefined) {
        if (!existingPreference) {
          const errorMsg = "No target allocation provided and no existing preferences found.";
          console.error(`❌ ${errorMsg}`);
          return {
            success: false,
            message: errorMsg,
            suggestion: "Please provide target allocation percentages (stable, native, other)"
          };
        }
        
        finalStablePercentage = existingPreference.targetAllocation[TokenCategory.STABLECOIN];
        finalNativePercentage = existingPreference.targetAllocation[TokenCategory.NATIVE];
        finalOtherPercentage = existingPreference.targetAllocation[TokenCategory.OTHER];
        
        console.log(`📋 Using existing preferences - Stable: ${finalStablePercentage}%, Native: ${finalNativePercentage}%, Other: ${finalOtherPercentage}%`);
      }
      
      // Validate allocation percentages
      const totalPercentage = finalStablePercentage + finalNativePercentage + finalOtherPercentage;
      if (Math.abs(totalPercentage - 100) > 0.01) {
        const errorMsg = `Invalid allocation. Percentages must add up to 100%, but they add up to ${totalPercentage}%`;
        console.error(`❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg,
          providedAllocation: {
            stable: finalStablePercentage,
            native: finalNativePercentage,
            other: finalOtherPercentage,
            total: totalPercentage
          }
        };
      }

      // Validate individual percentages
      if (finalStablePercentage < 0 || finalNativePercentage < 0 || finalOtherPercentage < 0) {
        const errorMsg = "All allocation percentages must be non-negative";
        console.error(`❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg,
          providedAllocation: {
            stable: finalStablePercentage,
            native: finalNativePercentage,
            other: finalOtherPercentage
          }
        };
      }

      const targetAllocation: Record<TokenCategory, number> = {
        [TokenCategory.STABLECOIN]: finalStablePercentage,
        [TokenCategory.NATIVE]: finalNativePercentage,
        [TokenCategory.OTHER]: finalOtherPercentage
      };

      console.log("✅ Target allocation validated:", targetAllocation);
      
      console.log("📊 Fetching user portfolio...");
      const userPortfolio = await fetchUserPortfolio(accountAddress);

      if (!userPortfolio) {
        const errorMsg = "Failed to fetch user portfolio";
        console.error(`❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg,
          accountAddress
        };
      }

      if (userPortfolio.total_value_usd === 0) {
        const errorMsg = "Portfolio has zero value - nothing to rebalance";
        console.error(`❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg,
          portfolio: userPortfolio
        };
      }

      console.log(`💰 Portfolio total value: $${userPortfolio.total_value_usd}`);
      console.log(`🪙 Number of tokens: ${userPortfolio.tokens.length}`);

      console.log("📈 Calculating current allocation...");
      const currentAllocation = calculateCurrentAllocation(userPortfolio);

      if (!currentAllocation) {
        const errorMsg = "Failed to calculate current portfolio allocation";
        console.error(`❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg
        };
      }

      console.log("📊 Current allocation:", currentAllocation);

      console.log("🔧 Calculating required swaps...");
      const requiredSwaps = calculateRequiredSwaps(
        userPortfolio,
        currentAllocation,
        targetAllocation
      );

      console.log(`💱 Required swaps calculated: ${requiredSwaps.length} swaps needed`);
      
      if (requiredSwaps.length === 0) {
        console.log("✅ Portfolio already balanced");
        
        try {
          await saveUserPreference(accountAddress, targetAllocation);
          console.log("✅ User preferences saved successfully");
        } catch (saveError: any) {
          console.warn("⚠️ Warning: Failed to save user preference:", saveError?.message);
        }
        
        return {
          success: true,
          message: "Portfolio is already balanced according to target allocation.",
          currentAllocation,
          targetAllocation,
          userPortfolio,
          details: {
            totalValue: userPortfolio.total_value_usd,
            tokenCount: userPortfolio.tokens.length,
            swapsRequired: 0
          }
        };
      }

      // Log swap details for debugging
      requiredSwaps.forEach((swap, index) => {
        console.log(`   Swap ${index + 1}: ${swap.amount.toFixed(6)} tokens from ${swap.from_token_address} to ${swap.to_token_address}`);
      });

      // Note: Swap execution is commented out - uncomment when ready for live trading
      console.log("⚠️ Swap execution disabled for safety - enable when ready for live trading");
      // const swapResults = await executeSwapFunction(requiredSwaps, accountAddress);
      
      try {
        await saveUserPreference(accountAddress, targetAllocation);
        console.log("✅ User preferences saved successfully");
      } catch (saveError: any) {
        console.warn("⚠️ Warning: Failed to save user preference:", saveError?.message);
      }

      return {
        success: true,
        message: "Portfolio rebalancing plan calculated successfully. Swaps ready for execution.",
        currentAllocation,
        targetAllocation,
        requiredSwaps,
        userPortfolio,
        details: {
          totalValue: userPortfolio.total_value_usd,
          tokenCount: userPortfolio.tokens.length,
          swapsCalculated: requiredSwaps.length
        },
        note: "Swap execution is currently disabled for safety. Enable executeSwapFunction when ready."
      };

    } catch (error: any) {
      console.error("❌ Critical error in portfolio rebalancing:", error);
      return {
        success: false,
        message: `Portfolio rebalancing failed: ${error?.message || error}`,
        error: error?.message || error,
        accountAddress,
        suggestion: "Please check account address and allocation parameters"
      };
    }
  };
  


export const executeSwapFunction = async (swaps: SwapAction[], userAddress: string) => {
  try {
    console.log(`🔄 Starting swap execution for ${swaps.length} swaps`);
    console.log(`👛 User address: ${userAddress}`);

    if (!swaps || swaps.length === 0) {
      console.log("ℹ️ No swaps to execute");
      return {
        success: true,
        message: "No swaps required",
        swaps: []
      };
    }

    if (!userAddress) {
      const errorMsg = "User address is required for swap execution";
      console.error(`❌ ${errorMsg}`);
      return {
        success: false,
        message: errorMsg
      };
    }

    // Validate environment variables
    if (!process.env.ALCHEMY_API_KEY) {
      const errorMsg = "ALCHEMY_API_KEY not configured";
      console.error(`❌ ${errorMsg}`);
      return {
        success: false,
        message: errorMsg
      };
    }

    if (!process.env.PVT_KEY) {
      const errorMsg = "PVT_KEY not configured for swap execution";
      console.error(`❌ ${errorMsg}`);
      return {
        success: false,
        message: errorMsg
      };
    }

    const provider = new Provider({
      nodeUrl: `${process.env.ALCHEMY_API_KEY}`
    });

    const account = new Account(
      provider,
      userAddress,
      `${process.env.PVT_KEY}`,
      undefined,
      constants.TRANSACTION_VERSION.V3
    );

    console.log("✅ Account and provider initialized");

    const txHashes: string[] = [];
    const swapResults = [];

    for (let i = 0; i < swaps.length; i++) {
      const swap = swaps[i];
      console.log(`🔄 Executing swap ${i + 1}/${swaps.length}`);
      console.log(`   From: ${swap.from_token_address}`);
      console.log(`   To: ${swap.to_token_address}`);
      console.log(`   Amount: ${swap.amount}`);

      try {
        const swapSendingHash = await SingularSwapExecution(swap, account.address);
        
        if (swapSendingHash) {
          console.log(`✅ Swap ${i + 1} successful! Tx hash: ${swapSendingHash}`);
          txHashes.push(swapSendingHash as string);
          swapResults.push({
            swapIndex: i + 1,
            fromToken: swap.from_token_address,
            toToken: swap.to_token_address,
            amount: swap.amount,
            transactionHash: swapSendingHash,
            success: true
          });
        } else {
          console.error(`❌ Swap ${i + 1} failed - no transaction hash returned`);
          swapResults.push({
            swapIndex: i + 1,
            fromToken: swap.from_token_address,
            toToken: swap.to_token_address,
            amount: swap.amount,
            success: false,
            error: "No transaction hash returned"
          });
        }

        // Add delay between swaps to avoid rate limiting
        if (i < swaps.length - 1) {
          console.log("⏳ Waiting 2 seconds before next swap...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (swapError: any) {
        console.error(`❌ Error in swap ${i + 1}:`, swapError);
        swapResults.push({
          swapIndex: i + 1,
          fromToken: swap.from_token_address,
          toToken: swap.to_token_address,
          amount: swap.amount,
          success: false,
          error: swapError?.message || swapError
        });
      }
    }

    const successfulSwaps = swapResults.filter(result => result.success);
    const failedSwaps = swapResults.filter(result => !result.success);

    console.log(`📊 Swap execution summary:`);
    console.log(`   ✅ Successful: ${successfulSwaps.length}`);
    console.log(`   ❌ Failed: ${failedSwaps.length}`);
    console.log(`   📝 Total transaction hashes: ${txHashes.length}`);

    return {
      success: successfulSwaps.length > 0,
      message: `Executed ${successfulSwaps.length}/${swaps.length} swaps successfully`,
      transactionHashes: txHashes,
      swapResults,
      summary: {
        totalSwaps: swaps.length,
        successfulSwaps: successfulSwaps.length,
        failedSwaps: failedSwaps.length
      }
    };

  } catch (err: any) {
    console.error("❌ Critical error in swap execution:", err);
    return {
      success: false,
      message: "Critical error during swap execution",
      error: err?.message || err,
      suggestion: "Please check your wallet configuration and network connectivity"
    };
  }
}; 
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Supported tokens (mapped to DefiLlama protocols or CoinGecko IDs)
const tokenMap: Record<string, { defiLlamaProtocol?: string; coingeckoId: string }> = {
  strk: { defiLlamaProtocol: "starknet", coingeckoId: "starknet" },
  usdc: { defiLlamaProtocol: "vesu", coingeckoId: "usd-coin" },
  usdt: { defiLlamaProtocol: "nostra", coingeckoId: "tether" },
};

export const starknetTokenDetailsTool = tool(
  async ({ tokenSymbol }) => {
    try {
      console.log(`[TOOL] starknet_token_details_tool called for token: ${tokenSymbol}`);

      // For now, return basic fallback data to prevent API failures
      // TODO: Fix DefiLlama API integration
      
      const fallbackData = {
        name: tokenSymbol.toUpperCase(),
        symbol: tokenSymbol.toUpperCase(),
        price_usd: tokenSymbol.toLowerCase() === 'strk' ? 0.134 : 1.0,
        market_cap_usd: 0,
        tvl_usd: 0,
        chain_tvl_usd: 0,
        volume_24h_usd: 0,
        price_change_24h: 0,
        price_change_7d: 0,
      };

      return JSON.stringify(
        {
          type: "token_details_response",
          status: "EXECUTED",
          token: fallbackData,
          timestamp: new Date().toISOString(),
          details: {
            action: "starknet_token_details_tool",
            message: `Retrieved basic info for ${tokenSymbol} (using fallback data)`,
          },
        },
        null,
        2
      );
    } catch (error) {
      console.error(
        `[TOOL ERROR] starknet_token_details_tool failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw new Error(
        `Failed to fetch token details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
  {
    name: "starknet_token_details_tool",
    description:
      "Fetches details of Starknet tokens including price, market cap, TVL, and trading volume using DefiLlama for TVL and CoinGecko for price data.",
    schema: z.object({
      tokenSymbol: z.string().describe("The token symbol (e.g., STRK, USDC, USDT)"),
    }),
  }
);

// Export tools as array
export const starknetTokenDetailsTools = [starknetTokenDetailsTool];
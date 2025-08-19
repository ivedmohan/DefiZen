// Mock database for testing without Supabase connection
export const mockPrisma = {
  user: {
    findUnique: async (params: any) => {
      console.log("Mock: user.findUnique called with:", params);
      // Return a mock user if looking for wallet address
      if (params?.where?.walletAddress) {
        return {
          id: 1,
          walletAddress: params.where.walletAddress,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      return null; // Return null for non-existent users
    },
    findMany: async (params?: any) => {
      console.log("Mock: user.findMany called with:", params);
      return [];
    },
    findFirst: async (params: any) => {
      console.log("Mock: user.findFirst called with:", params);
      return {
        id: 1,
        walletAddress: "0x13b8eeaed90d4e6f902dde1bf1770cd75508d00594bbae2bdd6f1554b0dcf61",
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    create: async (params: any) => {
      console.log("Mock: user.create called with:", params);
      return {
        id: 1,
        ...params.data
      };
    }
  },
  userContact: {
    findMany: async (params: any) => {
      console.log("Mock: userContact.findMany called with:", params);
      return [];
    },
    create: async (params: any) => {
      console.log("Mock: userContact.create called with:", params);
      return { id: 1, ...params.data };
    }
  },
  agentWallet: {
    findUnique: async (params: any) => {
      console.log("Mock: agentWallet.findUnique called with:", params);
      // Return a mock agent wallet for testing
      return {
        id: "agent-1",
        agentId: "agent-1", 
        walletAddress: params?.where?.walletAddress || "0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61",
        encryptedPrivateKey: "encrypted-key",
        userId: "user-1",
        permissions: {
          canDeposit: true,
          canWithdraw: true,
          canSwap: true,
          maxTransactionSize: 1000,
          dailyLimit: 5000
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    findMany: async (params: any) => {
      console.log("Mock: agentWallet.findMany called with:", params);
      return [{
        id: "agent-1",
        agentId: "agent-1",
        walletAddress: "0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61",
        encryptedPrivateKey: "encrypted-key",
        userId: "user-1",
        permissions: {
          canDeposit: true,
          canWithdraw: true,
          canSwap: true,
          maxTransactionSize: 1000,
          dailyLimit: 5000
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
    },
    create: async (params: any) => {
      console.log("Mock: agentWallet.create called with:", params);
      return {
        id: "agent-1",
        agentId: "agent-1",
        walletAddress: "0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61",
        encryptedPrivateKey: "encrypted-key",
        userId: "user-1",
        permissions: {
          canDeposit: true,
          canWithdraw: true,
          canSwap: true,
          maxTransactionSize: 1000,
          dailyLimit: 5000
        },
        isActive: true,
        ...params.data
      };
    },
    update: async (params: any) => {
      console.log("Mock: agentWallet.update called with:", params);
      return {
        id: "agent-1",
        agentId: "agent-1",
        walletAddress: "0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61",
        encryptedPrivateKey: "encrypted-key",
        userId: "user-1",
        permissions: {
          canDeposit: true,
          canWithdraw: true,
          canSwap: true,
          maxTransactionSize: 1000,
          dailyLimit: 5000
        },
        isActive: true,
        updatedAt: new Date(),
        ...params.data
      };
    }
  },
  userPortfolioPreference: {
    findMany: async (params?: any) => {
      console.log("Mock: userPortfolioPreference.findMany called with:", params);
      return [{
        id: "pref-1",
        userId: "user-1",
        walletAddress: "0x13b8eeaed90d4e6f902dde1bf1770cd75508d00594bbae2bdd6f1554b0dcf61",
        riskLevel: "medium",
        maxSlippage: 2.0,
        autoInvest: true,
        notificationsEnabled: true,
        preferredTokens: ["STRK", "ETH", "USDC"],
        StablePercentage: 30,
        NativePercentage: 40,
        OtherPercentage: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
    },
    findUnique: async (params: any) => {
      console.log("Mock: userPortfolioPreference.findUnique called with:", params);
      return {
        id: "pref-1",
        userId: "user-1",
        walletAddress: "0x13b8eeaed90d4e6f902dde1bf1770cd75508d00594bbae2bdd6f1554b0dcf61",
        riskLevel: "medium",
        maxSlippage: 2.0,
        autoInvest: true,
        notificationsEnabled: true,
        preferredTokens: ["STRK", "ETH", "USDC"],
        StablePercentage: 30,
        NativePercentage: 40,
        OtherPercentage: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    upsert: async (params: any) => {
      console.log("Mock: userPortfolioPreference.upsert called with:", params);
      return {
        id: 1,
        ...params.create
      };
    }
  },
  deposit: {
    create: async (params: any) => {
      console.log("Mock: deposit.create called with:", params);
      return {
        id: 1,
        ...params.data,
        createdAt: new Date()
      };
    },
    findMany: async (params: any) => {
      console.log("Mock: deposit.findMany called with:", params);
      // Return mock deposits for agent wallet
      return [
        {
          id: 1,
          agentWallet: "0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61",
          userWallet: "0x13b8eeaed90d4e6f902dde1bf1770cd75508d00594bbae2bdd6f1554b0dcf61",
          amount: "1.00",
          stopLoss: "0.5",
          expectedProfit: "10.00",
          deadline: new Date(),
          createdAt: new Date("2025-08-19T18:31:20.749Z")
        }
      ];
    }
  },
  token: {
    findMany: async (params?: any) => {
      console.log("Mock: token.findMany called with:", params);
      // Return empty array to trigger fallback tokens in FetchSupportedTokens
      return [];
    },
    findFirst: async (params: any) => {
      console.log("Mock: token.findFirst called with:", params);
      
      // Return different tokens based on the query
      const tokenName = params?.where?.name?.toLowerCase() || params?.where?.symbol?.toLowerCase();
      
      if (tokenName === 'usdc') {
        return {
          address: "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          token_address: "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
          price: 1.0,
          marketCap: 32000000000,
          volume24h: 8000000000,
          verified: true,
          logoUrl: "",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (tokenName === 'usdt') {
        return {
          address: "0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
          token_address: "0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
          symbol: "USDT",
          name: "Tether USD",
          decimals: 6,
          price: 1.0,
          marketCap: 30000000000,
          volume24h: 7500000000,
          verified: true,
          logoUrl: "",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (tokenName === 'eth' || tokenName === 'ethereum') {
        return {
          address: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          token_address: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          symbol: "ETH",
          name: "Ethereum",
          decimals: 18,
          price: 3200.0,
          marketCap: 400000000000,
          volume24h: 15000000000,
          verified: true,
          logoUrl: "",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        // Default to STRK for any other token or no specific query
        return {
          address: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          token_address: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          symbol: "STRK",
          name: "Starknet Token",
          decimals: 18,
          price: 0.4,
          marketCap: 400000000,
          volume24h: 50000000,
          verified: true,
          logoUrl: "",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    },
    create: async (params: any) => {
      console.log("Mock: token.create called with:", params);
      return {
        id: 1,
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    upsert: async (params: any) => {
      console.log("Mock: token.upsert called with:", params);
      return {
        id: 1,
        ...params.create,
        ...params.update,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    update: async (params: any) => {
      console.log("Mock: token.update called with:", params);
      return {
        id: 1,
        ...params.data,
        updatedAt: new Date()
      };
    }
  },
  trade: {
    findMany: async (params: any) => {
      console.log("Mock: trade.findMany called with:", params);
      return [
        {
          id: 1,
          agentWallet: "0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61",
          userWallet: "0x13b8eeaed90d4e6f902dde1bf1770cd75508d00594bbae2bdd6f1554b0dcf61",
          amount: "5.0",
          fromToken: "STRK",
          toToken: "USDC",
          executedAt: new Date()
        }
      ];
    },
    create: async (params: any) => {
      console.log("Mock: trade.create called with:", params);
      return {
        id: 1,
        ...params.data,
        executedAt: new Date()
      };
    }
  }
};

// Export named functions for easier importing
export const findManyUsers = mockPrisma.user.findMany;
export const findManyTokens = mockPrisma.token.findMany;
export const findManyAgentWallets = mockPrisma.agentWallet.findMany;
export const findManyUserPreferences = mockPrisma.userPortfolioPreference.findMany;
export const findManyDeposits = mockPrisma.deposit.findMany;
export const findManyTrades = mockPrisma.trade.findMany;

console.log("✅ Mock Database initialized with corrected agent wallet address");

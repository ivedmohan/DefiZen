// Mock wallet manager for testing without blockchain connection
export interface MockWalletConfig {
  walletAddress: string;
  encryptedPrivateKey: string;
  permissions: {
    canDeposit: boolean;
    canWithdraw: boolean;
    canSwap: boolean;
    maxTransactionSize: number;
    dailyLimit: number;
  };
}

class MockWalletManager {
  async createAgentWallet(userId: string, permissions: any): Promise<MockWalletConfig> {
    console.log("Mock: Creating agent wallet for user:", userId);
    
    const walletConfig: MockWalletConfig = {
      walletAddress: `0x${Math.random().toString(16).substring(2, 50)}`, // Generate random address
      encryptedPrivateKey: "mock-encrypted-private-key",
      permissions: {
        canDeposit: permissions.canDeposit || false,
        canWithdraw: permissions.canWithdraw || false,
        canSwap: permissions.canSwap || false,
        maxTransactionSize: permissions.maxTransactionSize || 1000,
        dailyLimit: permissions.dailyLimit || 5000
      }
    };

    return walletConfig;
  }

  async getAccount(walletAddress: string, encryptedPrivateKey: string): Promise<any> {
    console.log("Mock: Getting account for wallet:", walletAddress);
    // Return a mock account object
    return {
      execute: async (calls: any[]) => {
        console.log("Mock: Executing transaction calls:", calls);
        return {
          transaction_hash: `0x${Math.random().toString(16).substring(2, 50)}`
        };
      },
      waitForTransaction: async (txHash: string, options?: any) => {
        console.log("Mock: Waiting for transaction:", txHash);
        // Simulate transaction confirmation
        return { status: "ACCEPTED_ON_L2" };
      }
    };
  }

  async validateTransaction(walletConfig: MockWalletConfig, amount: number, action: string): Promise<boolean> {
    console.log("Mock: Validating transaction:", { amount, action, permissions: walletConfig.permissions });
    
    // Check permissions
    if (action === 'deposit' && !walletConfig.permissions.canDeposit) return false;
    if (action === 'withdraw' && !walletConfig.permissions.canWithdraw) return false;
    if (action === 'swap' && !walletConfig.permissions.canSwap) return false;

    // Check transaction size limit
    if (amount > walletConfig.permissions.maxTransactionSize) return false;

    return true;
  }
}

export const mockWalletManager = new MockWalletManager();
export type { MockWalletConfig as WalletConfig };

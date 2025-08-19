import { DepositFunctionEndufi, WithDrawFunctionEndufi } from '../../Functions/EnduFi';
import { prisma } from '../../db';
import { walletManager } from '../../utils/walletManager';

// Mock Prisma
jest.mock('../../db', () => ({
  prisma: {
    agentWallet: {
      findUnique: jest.fn()
    }
  }
}));

// Mock wallet manager
jest.mock('../../utils/walletManager', () => ({
  walletManager: {
    validateTransaction: jest.fn(),
    getAccount: jest.fn()
  }
}));

describe('EnduFi Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DepositFunctionEndufi', () => {
    it('should successfully deposit with valid inputs', async () => {
      const mockAgentWallet = {
        walletAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
        encryptedPrivateKey: 'encrypted_key',
        permissions: {
          canDeposit: true,
          maxTransactionSize: 1000
        }
      };

      const mockAccount = {
        execute: jest.fn().mockResolvedValue({
          transaction_hash: '0xabc123'
        }),
        waitForTransaction: jest.fn().mockResolvedValue(true)
      };

      (prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue(mockAgentWallet);
      (walletManager.validateTransaction as jest.Mock).mockResolvedValue(true);
      (walletManager.getAccount as jest.Mock).mockResolvedValue(mockAccount);

      const result = await DepositFunctionEndufi('100', mockAgentWallet.walletAddress);

      expect(result).toEqual({
        success: true,
        transactionHash: '0xabc123',
        message: 'Deposit successful'
      });
    });

    it('should reject invalid amount', async () => {
      const result = await DepositFunctionEndufi('invalid', '0x1234567890123456789012345678901234567890123456789012345678901234');

      expect(result).toEqual({
        success: false,
        error: 'Invalid amount provided'
      });
    });

    it('should reject when agent wallet not found', async () => {
      (prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await DepositFunctionEndufi('100', '0x1234567890123456789012345678901234567890123456789012345678901234');

      expect(result).toEqual({
        success: false,
        error: 'Agent wallet not found'
      });
    });

    it('should reject when transaction not allowed', async () => {
      const mockAgentWallet = {
        walletAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
        encryptedPrivateKey: 'encrypted_key',
        permissions: {
          canDeposit: false,
          maxTransactionSize: 1000
        }
      };

      (prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue(mockAgentWallet);
      (walletManager.validateTransaction as jest.Mock).mockResolvedValue(false);

      const result = await DepositFunctionEndufi('100', mockAgentWallet.walletAddress);

      expect(result).toEqual({
        success: false,
        error: 'Transaction not allowed for this agent'
      });
    });
  });

  describe('WithDrawFunctionEndufi', () => {
    it('should successfully withdraw with valid inputs', async () => {
      const mockAgentWallet = {
        walletAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
        encryptedPrivateKey: 'encrypted_key',
        permissions: {
          canWithdraw: true,
          maxTransactionSize: 1000
        }
      };

      const mockContract = {
        call: jest.fn().mockResolvedValue('1000000000000000000') // 1 ETH in wei
      };

      const mockAccount = {
        execute: jest.fn().mockResolvedValue({
          transaction_hash: '0xdef456'
        }),
        waitForTransaction: jest.fn().mockResolvedValue(true)
      };

      (prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue(mockAgentWallet);
      (walletManager.validateTransaction as jest.Mock).mockResolvedValue(true);
      (walletManager.getAccount as jest.Mock).mockResolvedValue(mockAccount);

      const result = await WithDrawFunctionEndufi('ETH', '0.5', mockAgentWallet.walletAddress);

      expect(result).toEqual({
        success: true,
        transactionHash: '0xdef456',
        message: 'Withdrawal successful'
      });
    });

    it('should reject invalid amount', async () => {
      const result = await WithDrawFunctionEndufi('ETH', 'invalid', '0x1234567890123456789012345678901234567890123456789012345678901234');

      expect(result).toEqual({
        success: false,
        error: 'Invalid amount provided'
      });
    });
  });
}); 
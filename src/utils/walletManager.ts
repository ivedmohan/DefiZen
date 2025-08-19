import { Account, RpcProvider } from "starknet";
import { ec } from "starknet";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

interface WalletConfig {
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

class WalletManager {
  private provider: RpcProvider;
  private encryptionKey: string;

  constructor() {
    this.provider = new RpcProvider({ nodeUrl: process.env.ALCHEMY_API_KEY! });
    this.encryptionKey = process.env.ENCRYPTION_KEY || "default-key-change-in-production";
  }

  private encryptPrivateKey(privateKey: string): string {
  // Use createCipheriv with an IV for secure encryption
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(this.encryptionKey).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(privateKey, 'utf8')), cipher.final()]);
  // Prepend IV to ciphertext and return as hex
  return Buffer.concat([iv, encrypted]).toString('hex');
  }

  private decryptPrivateKey(encryptedPrivateKey: string): string {
  // Encrypted string contains IV (first 16 bytes) + ciphertext
  const encryptedBuffer = Buffer.from(encryptedPrivateKey, 'hex');
  const iv = encryptedBuffer.slice(0, 16);
  const ciphertext = encryptedBuffer.slice(16);
  const key = crypto.createHash('sha256').update(this.encryptionKey).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
  }

  async createAgentWallet(userId: string, permissions: any): Promise<WalletConfig> {
    // Generate new keypair
  const privateKeyUint8 = ec.starkCurve.utils.randomPrivateKey();
  const publicKeyUint8 = ec.starkCurve.getPublicKey(privateKeyUint8);
  const privateKey = Buffer.from(privateKeyUint8).toString('hex');
  const publicKey = Buffer.from(publicKeyUint8).toString('hex');
    
    // Encrypt private key
  const encryptedPrivateKey = this.encryptPrivateKey(privateKey);
    
    // Create wallet config
    const walletConfig: WalletConfig = {
  walletAddress: publicKey,
      encryptedPrivateKey,
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

  async getAccount(walletAddress: string, encryptedPrivateKey: string): Promise<Account> {
    const privateKey = this.decryptPrivateKey(encryptedPrivateKey);
    return new Account(this.provider, walletAddress, privateKey);
  }

  async validateTransaction(walletConfig: WalletConfig, amount: number, action: string): Promise<boolean> {
    // Check permissions
    if (action === 'deposit' && !walletConfig.permissions.canDeposit) return false;
    if (action === 'withdraw' && !walletConfig.permissions.canWithdraw) return false;
    if (action === 'swap' && !walletConfig.permissions.canSwap) return false;

    // Check transaction size limit
    if (amount > walletConfig.permissions.maxTransactionSize) return false;

    // TODO: Add daily limit checking
    return true;
  }
}

// Export both real and mock wallet managers
let walletManager: any;

try {
  walletManager = new WalletManager();
} catch (error) {
  console.log("⚠️  Wallet manager initialization failed, check your environment variables");
  // Import mock wallet manager as fallback
  const { mockWalletManager } = require('./walletManager-mock');
  walletManager = mockWalletManager;
}

export { walletManager };
export type { WalletConfig }; 
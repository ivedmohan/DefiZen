// Enhanced in-memory data store to replace all database operations
import { cacheManager } from '../utils/cache';

interface User {
  id: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Token {
  name: string;
  decimals: number;
  token_address: string;
  image: string;
  type: string;
  chain_id: number;
}

interface Portfolio {
  userId: string;
  tokens: any[];
  totalValue: number;
  lastUpdated: Date;
}

interface AgentWallet {
  id: string;
  agentId: string;
  walletAddress: string;
  encryptedPrivateKey: string;
  userId: string;
  permissions: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class DataStore {
  private users = new Map<string, User>();
  private tokens = new Map<string, Token>();
  private portfolios = new Map<string, Portfolio>();
  private agentWallets = new Map<string, AgentWallet>();
  private userContacts = new Map<string, any[]>();
  private trades = new Map<string, any>();
  private userPreferences = new Map<string, any>();

  constructor() {
    this.initializeDefaultData();
    this.startPeriodicBackup();
  }

  // Initialize with default data
  private initializeDefaultData() {
    // Add default tokens
    const defaultTokens: Token[] = [
      {
        name: "USDC",
        decimals: 6,
        token_address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        image: "/images/tokens/usdc.svg",
        type: "ERC20",
        chain_id: 1
      },
      {
        name: "USDT",
        decimals: 6,
        token_address: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
        image: "/images/tokens/usdt.svg",
        type: "ERC20",
        chain_id: 1
      },
      {
        name: "ETH",
        decimals: 18,
        token_address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        image: "/images/tokens/eth.svg",
        type: "ERC20",
        chain_id: 1
      },
      {
        name: "STRK",
        decimals: 18,
        token_address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        image: "/images/tokens/strk.svg",
        type: "ERC20",
        chain_id: 1
      },
      {
        name: "DAI",
        decimals: 18,
        token_address: "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
        image: "/images/tokens/dai.svg",
        type: "ERC20",
        chain_id: 1
      }
    ];

    defaultTokens.forEach(token => {
      this.tokens.set(token.token_address, token);
    });
  }

  // User operations
  async findUser(walletAddress: string): Promise<User | null> {
    const cached = cacheManager.get<User>(`user:${walletAddress}`);
    if (cached) return cached;

    for (const user of this.users.values()) {
      if (user.walletAddress === walletAddress) {
        cacheManager.set(`user:${walletAddress}`, user, 3600);
        return user;
      }
    }
    return null;
  }

  async createUser(walletAddress: string): Promise<User> {
    const user: User = {
      id: `user_${Date.now()}`,
      walletAddress,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(user.id, user);
    cacheManager.set(`user:${walletAddress}`, user, 3600);
    
    return user;
  }

  async findOrCreateUser(walletAddress: string): Promise<User> {
    let user = await this.findUser(walletAddress);
    if (!user) {
      user = await this.createUser(walletAddress);
    }
    return user;
  }

  // Token operations
  async getAllTokens(): Promise<Token[]> {
    const cached = cacheManager.get<Token[]>('all_tokens');
    if (cached) return cached;
    
    const tokens = Array.from(this.tokens.values());
    cacheManager.set('all_tokens', tokens, 300);
    return tokens;
  }

  async createToken(data: Omit<Token, 'id' | 'createdAt' | 'updatedAt'>): Promise<Token> {
    const token: Token = {
      ...data
    };
    
    this.tokens.set(token.token_address, token);
    cacheManager.del('all_tokens'); // Invalidate cache
    return token;
  }

  async upsertToken(tokenAddress: string, data: Partial<Token>): Promise<Token> {
    const existing = this.tokens.get(tokenAddress);
    
    if (existing) {
      const updated = { ...existing, ...data };
      this.tokens.set(tokenAddress, updated);
      cacheManager.del('all_tokens');
      return updated;
    } else {
      const newToken: Token = {
        token_address: tokenAddress,
        name: data.name || 'Unknown Token',
        decimals: data.decimals || 18,
        image: data.image || '',
        type: data.type || 'ERC20',
        chain_id: data.chain_id || 393402
      };
      this.tokens.set(tokenAddress, newToken);
      cacheManager.del('all_tokens');
      return newToken;
    }
  }

  async findToken(tokenAddress: string): Promise<Token | null> {
    return this.findTokenByAddress(tokenAddress);
  }  async findTokenByName(name: string): Promise<Token | null> {
    const cached = cacheManager.get<Token>(`token:${name.toUpperCase()}`);
    if (cached) return cached;

    for (const token of this.tokens.values()) {
      if (token.name.toUpperCase() === name.toUpperCase()) {
        cacheManager.set(`token:${name.toUpperCase()}`, token, 3600);
        return token;
      }
    }
    return null;
  }

  async findTokenByAddress(address: string): Promise<Token | null> {
    const cached = cacheManager.get<Token>(`token_addr:${address}`);
    if (cached) return cached;

    const token = this.tokens.get(address);
    if (token) {
      cacheManager.set(`token_addr:${address}`, token, 3600);
    }
    return token || null;
  }

  // Portfolio operations
  async getPortfolio(userId: string): Promise<Portfolio | null> {
    const cached = cacheManager.get<Portfolio>(`portfolio:${userId}`);
    if (cached) return cached;

    const portfolio = this.portfolios.get(userId);
    if (portfolio) {
      cacheManager.set(`portfolio:${userId}`, portfolio, 300); // 5 minutes
    }
    return portfolio || null;
  }

  async updatePortfolio(userId: string, portfolio: Portfolio): Promise<void> {
    portfolio.lastUpdated = new Date();
    this.portfolios.set(userId, portfolio);
    cacheManager.set(`portfolio:${userId}`, portfolio, 300);
  }

  // Agent wallet operations
  async findAgentWallet(walletAddress: string): Promise<AgentWallet | null> {
    const cached = cacheManager.get<AgentWallet>(`agent_wallet:${walletAddress}`);
    if (cached) return cached;

    for (const wallet of this.agentWallets.values()) {
      if (wallet.walletAddress === walletAddress) {
        cacheManager.set(`agent_wallet:${walletAddress}`, wallet, 3600);
        return wallet;
      }
    }
    return null;
  }

  async createAgentWallet(data: Omit<AgentWallet, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentWallet> {
    const wallet: AgentWallet = {
      ...data,
      id: `agent_wallet_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.agentWallets.set(wallet.id, wallet);
    cacheManager.set(`agent_wallet:${wallet.walletAddress}`, wallet, 3600);
    
    return wallet;
  }

  async updateAgentWallet(id: string, data: Partial<AgentWallet>): Promise<AgentWallet | null> {
    const wallet = this.agentWallets.get(id);
    if (!wallet) return null;

    const updatedWallet = { ...wallet, ...data, updatedAt: new Date() };
    this.agentWallets.set(id, updatedWallet);
    cacheManager.del(`agent_wallet:${wallet.walletAddress}`);
    
    return updatedWallet;
  }

  // User contacts operations
  async getUserContacts(userId: string): Promise<any[]> {
    const cached = cacheManager.get<any[]>(`contacts:${userId}`);
    if (cached) return cached;

    const contacts = this.userContacts.get(userId) || [];
    cacheManager.set(`contacts:${userId}`, contacts, 3600);
    return contacts;
  }

  async addUserContact(userId: string, contact: any): Promise<any> {
    const contacts = await this.getUserContacts(userId);
    const newContact = { 
      id: `contact_${Date.now()}`, 
      userId, 
      ...contact, 
      createdAt: new Date() 
    };
    
    contacts.push(newContact);
    this.userContacts.set(userId, contacts);
    cacheManager.del(`contacts:${userId}`);
    
    return newContact;
  }

  // Trade operations
  async createTrade(data: any): Promise<any> {
    const trade = {
      id: `trade_${Date.now()}`,
      ...data,
      executedAt: new Date()
    };
    
    this.trades.set(trade.id, trade);
    return trade;
  }

  async getTradesByAgent(agentWalletAddress: string): Promise<any[]> {
    const cached = cacheManager.get<any[]>(`trades:${agentWalletAddress}`);
    if (cached) return cached;

    const trades = Array.from(this.trades.values())
      .filter(trade => trade.agentWallet === agentWalletAddress);
    
    cacheManager.set(`trades:${agentWalletAddress}`, trades, 300);
    return trades;
  }

  // User preferences operations
  async getUserPreferences(): Promise<any[]> {
    const cached = cacheManager.get<any[]>('user_preferences');
    if (cached) return cached;

    const preferences = Array.from(this.userPreferences.values());
    cacheManager.set('user_preferences', preferences, 3600);
    return preferences;
  }

  async findUserPreference(userId: string): Promise<any | null> {
    const cached = cacheManager.get<any>(`preference:${userId}`);
    if (cached) return cached;

    const preference = this.userPreferences.get(userId);
    if (preference) {
      cacheManager.set(`preference:${userId}`, preference, 3600);
    }
    return preference || null;
  }

  async upsertUserPreference(userId: string, data: any): Promise<any> {
    const preference = {
      id: this.userPreferences.has(userId) ? this.userPreferences.get(userId)?.id : `pref_${Date.now()}`,
      userId,
      ...data,
      updatedAt: new Date()
    };
    
    this.userPreferences.set(userId, preference);
    cacheManager.del(`preference:${userId}`);
    
    return preference;
  }

  // Deposit operations
  async createDeposit(data: any): Promise<any> {
    const deposit = {
      id: `deposit_${Date.now()}`,
      ...data,
      createdAt: new Date()
    };
    return deposit;
  }

  // Backup and persistence
  async saveToFile(): Promise<void> {
    const fs = await import('fs').then(m => m.promises);
    const data = {
      users: Array.from(this.users.entries()),
      tokens: Array.from(this.tokens.entries()),
      portfolios: Array.from(this.portfolios.entries()),
      agentWallets: Array.from(this.agentWallets.entries()),
      userContacts: Array.from(this.userContacts.entries()),
      trades: Array.from(this.trades.entries()),
      userPreferences: Array.from(this.userPreferences.entries()),
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile('data_backup.json', JSON.stringify(data, null, 2));
    console.log('✅ Data backed up to file');
  }

  async loadFromFile(): Promise<void> {
    try {
      const fs = await import('fs').then(m => m.promises);
      const data = JSON.parse(await fs.readFile('data_backup.json', 'utf-8'));
      
      this.users = new Map(data.users);
      this.tokens = new Map(data.tokens);
      this.portfolios = new Map(data.portfolios);
      this.agentWallets = new Map(data.agentWallets);
      this.userContacts = new Map(data.userContacts);
      this.trades = new Map(data.trades);
      this.userPreferences = new Map(data.userPreferences);
      
      console.log('✅ Data loaded from backup file');
    } catch (error) {
      console.log('📝 No backup file found, starting with default data');
    }
  }

  private startPeriodicBackup(): void {
    // Backup every 10 minutes
    setInterval(() => {
      this.saveToFile().catch(console.error);
    }, 10 * 60 * 1000);
  }

  // Statistics and monitoring
  getStats() {
    return {
      users: this.users.size,
      tokens: this.tokens.size,
      portfolios: this.portfolios.size,
      agentWallets: this.agentWallets.size,
      trades: this.trades.size,
      cacheSize: cacheManager.keys().length,
      uptime: process.uptime()
    };
  }

  // Clear all data (for testing)
  clear(): void {
    this.users.clear();
    this.portfolios.clear();
    this.agentWallets.clear();
    this.userContacts.clear();
    this.trades.clear();
    this.userPreferences.clear();
    // Clear all cache keys
    const keys = cacheManager.keys();
    keys.forEach(key => cacheManager.del(key));
    this.initializeDefaultData();
  }
}

// Create singleton instance
export const dataStore = new DataStore();

// Initialize data on startup
dataStore.loadFromFile();

// Export the store for use throughout the application
export default dataStore;

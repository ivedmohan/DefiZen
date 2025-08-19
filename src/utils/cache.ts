import NodeCacheClass from 'node-cache';

interface CacheConfig {
  stdTTL: number; // Time to live in seconds
  checkperiod: number; // How often to check for expired keys
  maxKeys: number; // Maximum number of keys
}

class CacheManager {
  private cache: any;
  private defaultTTL: number = 300; // 5 minutes default

  constructor(config?: CacheConfig) {
  this.cache = new NodeCacheClass({
      stdTTL: config?.stdTTL || this.defaultTTL,
      checkperiod: config?.checkperiod || 600,
      maxKeys: config?.maxKeys || 1000,
    });
  }

  // Set a key-value pair with optional TTL
  set(key: string, value: any, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || this.defaultTTL);
  }

  // Get a value by key
  get<T>(key: string): T | undefined {
  return this.cache.get(key) as T | undefined;
  }

  // Delete a key
  del(key: string): number {
    return this.cache.del(key);
  }

  // Check if a key exists
  has(key: string): boolean {
    return this.cache.has(key);
  }

  // Get all keys
  keys(): string[] {
    return this.cache.keys();
  }

  // Clear all cache
  flush(): void {
    this.cache.flushAll();
  }

  // Get cache stats
  getStats() {
    return this.cache.getStats();
  }

  // Cache token prices
  async cacheTokenPrice(tokenAddress: string, price: number, ttl: number = 300): Promise<void> {
    const key = `token_price_${tokenAddress}`;
    this.set(key, { price, timestamp: Date.now() }, ttl);
  }

  // Get cached token price
  getCachedTokenPrice(tokenAddress: string): { price: number; timestamp: number } | null {
    const key = `token_price_${tokenAddress}`;
  return this.get(key) || null;
  }

  // Cache portfolio data
  async cachePortfolio(walletAddress: string, portfolio: any, ttl: number = 600): Promise<void> {
    const key = `portfolio_${walletAddress}`;
    this.set(key, { portfolio, timestamp: Date.now() }, ttl);
  }

  // Get cached portfolio
  getCachedPortfolio(walletAddress: string): { portfolio: any; timestamp: number } | null {
    const key = `portfolio_${walletAddress}`;
  return this.get(key) || null;
  }

  // Cache agent wallet data
  async cacheAgentWallet(agentId: string, walletData: any, ttl: number = 3600): Promise<void> {
    const key = `agent_wallet_${agentId}`;
    this.set(key, { walletData, timestamp: Date.now() }, ttl);
  }

  // Get cached agent wallet
  getCachedAgentWallet(agentId: string): { walletData: any; timestamp: number } | null {
    const key = `agent_wallet_${agentId}`;
  return this.get(key) || null;
  }

  // Cache transaction status
  async cacheTransactionStatus(txHash: string, status: any, ttl: number = 1800): Promise<void> {
    const key = `tx_status_${txHash}`;
    this.set(key, { status, timestamp: Date.now() }, ttl);
  }

  // Get cached transaction status
  getCachedTransactionStatus(txHash: string): { status: any; timestamp: number } | null {
    const key = `tx_status_${txHash}`;
  return this.get(key) || null;
  }

  // Cache API responses
  async cacheApiResponse(endpoint: string, params: any, response: any, ttl: number = 300): Promise<void> {
    const key = `api_${endpoint}_${JSON.stringify(params)}`;
    this.set(key, { response, timestamp: Date.now() }, ttl);
  }

  // Get cached API response
  getCachedApiResponse(endpoint: string, params: any): { response: any; timestamp: number } | null {
    const key = `api_${endpoint}_${JSON.stringify(params)}`;
  return this.get(key) || null;
  }

  // Invalidate cache by pattern
  invalidateByPattern(pattern: string): void {
    const keys = this.keys();
    const regex = new RegExp(pattern);
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.del(key);
      }
    });
  }

  // Cache with automatic refresh
  async cacheWithRefresh<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached) {
      return cached;
    }

    const data = await fetchFunction();
    this.set(key, data, ttl);
    return data;
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Export for convenience
export default cacheManager; 
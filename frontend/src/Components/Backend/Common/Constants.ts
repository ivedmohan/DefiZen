export const DEFAULT_STABLE = 50;
export const DEFAULT_NATIVE = 30;
export const DEFAULT_OTHER = 30;
export const ACCOUNT_ADDRESS ="0x5bafe2c53415743947065e902274f85e6300e9fb27d21bc29c2ce217ea0b37c2";

// removed remote ImageKit URL to avoid next/image host errors
export const DAPP_LOGO = "";

// toggle to hide remote logo globally
export const HIDE_REMOTE_LOGO = true;

// optional local fallback (add /public/images/logo-placeholder.svg)
export const DAPP_LOGO_LOCAL = "/images/logo-placeholder.svg";

// Backend URL - use localhost for development
export const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? "https://hackergames-backend.onrender.com"
  : "http://localhost:3002";

// Agent wallet management constants
export const AGENT_WALLET_PERMISSIONS = {
  CONSERVATIVE: {
    canDeposit: true,
    canWithdraw: true,
    canSwap: true,
    maxTransactionSize: 500,
    dailyLimit: 2000
  },
  AGGRESSIVE: {
    canDeposit: true,
    canWithdraw: true,
    canSwap: true,
    maxTransactionSize: 2000,
    dailyLimit: 10000
  },
  YIELD_FARMER: {
    canDeposit: true,
    canWithdraw: true,
    canSwap: true,
    maxTransactionSize: 1000,
    dailyLimit: 5000
  }
};

// Portfolio allocation presets
export const PORTFOLIO_PRESETS = {
  CONSERVATIVE: {
    stablePercentage: 60,
    nativePercentage: 20,
    otherPercentage: 20
  },
  BALANCED: {
    stablePercentage: 40,
    nativePercentage: 30,
    otherPercentage: 30
  },
  AGGRESSIVE: {
    stablePercentage: 20,
    nativePercentage: 50,
    otherPercentage: 30
  }
};

export const AGENT_CONTRACT_ADDRESS="0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61"

// Use local token images to avoid next/image host errors
export const USDT_LOGO = "/images/tokens/usdt.svg";
export const USDC_LOGO = "/images/tokens/usdc.png";

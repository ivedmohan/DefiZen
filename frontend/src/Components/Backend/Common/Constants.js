"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDC_LOGO = exports.USDT_LOGO = exports.AGENT_CONTRACT_ADDRESS = exports.PORTFOLIO_PRESETS = exports.AGENT_WALLET_PERMISSIONS = exports.BACKEND_URL = exports.DAPP_LOGO = exports.ACCOUNT_ADDRESS = exports.DEFAULT_OTHER = exports.DEFAULT_NATIVE = exports.DEFAULT_STABLE = void 0;
exports.DEFAULT_STABLE = 50;
exports.DEFAULT_NATIVE = 30;
exports.DEFAULT_OTHER = 30;
exports.ACCOUNT_ADDRESS = "0x5bafe2c53415743947065e902274f85e6300e9fb27d21bc29c2ce217ea0b37c2";
exports.DAPP_LOGO = "https://media-hosting.imagekit.io//d90e8f22145b401f/AgentLogo.jpg?Expires=1837107676&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Q3pK1cJZ03D5-7-Ctzpk6ce8kQnNgX6iEhA039Gwkt2AB8I1QEBcc1HjO7uVmK6deTqOp-QYWb4-nwLNgbCcqrekpUDunBPrV67icunZRDwTLJX4dJpHzBSwkfAvIRQSTx8TQ6inx0IMbknz-lk9Togq6d~dEt13mT7d~qWJY2p~urnAuYh0Gbp9IPz8CrbVMJWoNluAQrpQTO6hBdtiJ2s9kGFWXXUsF0huedX9rLbNpzllTK3hGCAkK3lznwmEqWUzvvEjpssCWfDgL8O6v92MGaZdPiZpqRGgcSV41vxsZssFmKkCRtvSHDoyTUSuGXJQNMxwlIRQwXUzhymaKg__";
// Backend URL - use localhost for development
exports.BACKEND_URL = process.env.NODE_ENV === 'production'
    ? "https://hackergames-backend.onrender.com"
    : "http://localhost:3002";
// Agent wallet management constants
exports.AGENT_WALLET_PERMISSIONS = {
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
exports.PORTFOLIO_PRESETS = {
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
exports.AGENT_CONTRACT_ADDRESS = "0x013B8eEAEd90D4E6F902ddE1BF1770cd75508D00594bBAE2bdd6f1554B0dCF61";
exports.USDT_LOGO = "https://media-hosting.imagekit.io/833bebb3e1304880/usdt.svg?Expires=1839217485&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=QrpbcbbQEboGDiRXWgAPN2U-jAybSqvU6hKuZJ0S8U~5CryBI6sBy7azuPLQWHfu0UlpUcTiB5plr8NmMPX6sw3daiGmUpb7RTZjSwKMHq2O1i6YSe4t3dHHyFFvAvIjiE9Egb-Cqg3-PVFvo4TEkmK7zo-Rh3eE6vMsgT~Lj9osoThVJSalKI7pRkXhUomiErYjd0nKm-YGmuRNDaw69eRFSkoPWO~NJBqJ7fmdlmC4hEmuv6r0rc~07M1HNU1VSsjrsv6bBKTSt17g1YH7BYa43WUBy~~Mv3ByQrtVNu0FuM2Y3CmqTpCYZjO0TUvYwnRLnzQiwrVem8jBzIbpuA__";
exports.USDC_LOGO = "https://media-hosting.imagekit.io/80e1e56fa0c943c7/usdc_new.png?Expires=1839217737&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=qXvClgWu67vLyWr7aqcLSbieKj5v6I3Vs2-Sq3U1OJJJgb~0tfcbba1E~hbqOfQtdRRJs3s~yGjhFQ59cZCrjJ0SrWCBAL2t~~fZBaBXwrdEU3PuW8o6Il~zGRB~RYmJ54pY6Ok0OmjBA0NjqHlK4ghEvk9PlHTZQBMenhIlS5wn2pcry6XLU2eA8KypE2lQnBOGa2~PsZGsizrLQHXrWk43v5ml10tVUTXJicKzvM5sojgLRUKDYdC03MCxqn1ocKpE4dZ~WvDu8FVA4YSQwoaPY~vumlRPkMIRVnu5luzF0YIYuwUqbNbeeuWu2wZRf59CnCZ573~brIqHvH7neA__";

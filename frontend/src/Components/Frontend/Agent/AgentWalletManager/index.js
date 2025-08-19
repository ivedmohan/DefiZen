"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentWalletManager = void 0;
const react_1 = __importStar(require("react"));
const agent_store_1 = require("@/store/agent-store");
const shallow_1 = require("zustand/react/shallow");
const Constants_1 = require("@/Components/Backend/Common/Constants");
const axios_1 = __importDefault(require("axios"));
require("./styles.scss");
const AgentWalletManager = () => {
    const { walletAddress, setAgentWalletAddress, setAgentKey } = (0, agent_store_1.useAgentStore)((0, shallow_1.useShallow)((state) => ({
        walletAddress: state.walletAddress,
        setAgentWalletAddress: state.setAgentWalletAddress,
        setAgentKey: state.setAgentKey
    })));
    const [formData, setFormData] = (0, react_1.useState)({
        agentName: "",
        agentType: 'CONSERVATIVE',
        portfolioPreset: 'BALANCED',
        maxTransactionSize: 1000,
        dailyLimit: 5000
    });
    const [isCreating, setIsCreating] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const [success, setSuccess] = (0, react_1.useState)("");
    const handleInputChange = (field, value) => {
        setFormData(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
    };
    const handleAgentTypeChange = (agentType) => {
        const permissions = Constants_1.AGENT_WALLET_PERMISSIONS[agentType];
        setFormData(prev => (Object.assign(Object.assign({}, prev), { agentType, maxTransactionSize: permissions.maxTransactionSize, dailyLimit: permissions.dailyLimit })));
    };
    const createAgentWallet = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!walletAddress) {
            setError("Please connect your wallet first");
            return;
        }
        if (!formData.agentName.trim()) {
            setError("Please enter an agent name");
            return;
        }
        setIsCreating(true);
        setError("");
        setSuccess("");
        try {
            // Create agent wallet via backend
            const response = yield axios_1.default.post(`${Constants_1.BACKEND_URL}/agent/wallet/create`, {
                userId: walletAddress,
                agentName: formData.agentName,
                permissions: Constants_1.AGENT_WALLET_PERMISSIONS[formData.agentType],
                portfolioPreset: Constants_1.PORTFOLIO_PRESETS[formData.portfolioPreset]
            });
            if (response.data.success) {
                setAgentWalletAddress(response.data.agentWallet.walletAddress);
                setAgentKey(response.data.agentWallet.agentId);
                setSuccess(`Agent "${formData.agentName}" created successfully!`);
                // Reset form
                setFormData({
                    agentName: "",
                    agentType: 'CONSERVATIVE',
                    portfolioPreset: 'BALANCED',
                    maxTransactionSize: 1000,
                    dailyLimit: 5000
                });
            }
            else {
                setError(response.data.error || "Failed to create agent wallet");
            }
        }
        catch (error) {
            console.error("Error creating agent wallet:", error);
            setError(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to create agent wallet");
        }
        finally {
            setIsCreating(false);
        }
    });
    return (<div className="AgentWalletManager">
      <div className="manager-container">
        <h2>🤖 Create Autonomous Agent</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-section">
          <div className="input-group">
            <label>Agent Name</label>
            <input type="text" value={formData.agentName} onChange={(e) => handleInputChange('agentName', e.target.value)} placeholder="Enter agent name (e.g., Conservative Trader)" disabled={isCreating}/>
          </div>

          <div className="input-group">
            <label>Agent Type</label>
            <div className="agent-type-buttons">
              <button className={`type-btn ${formData.agentType === 'CONSERVATIVE' ? 'active' : ''}`} onClick={() => handleAgentTypeChange('CONSERVATIVE')} disabled={isCreating}>
                🛡️ Conservative
                <small>Low risk, stable returns</small>
              </button>
              <button className={`type-btn ${formData.agentType === 'AGGRESSIVE' ? 'active' : ''}`} onClick={() => handleAgentTypeChange('AGGRESSIVE')} disabled={isCreating}>
                🚀 Aggressive
                <small>High risk, high returns</small>
              </button>
              <button className={`type-btn ${formData.agentType === 'YIELD_FARMER' ? 'active' : ''}`} onClick={() => handleAgentTypeChange('YIELD_FARMER')} disabled={isCreating}>
                🌾 Yield Farmer
                <small>Maximize APY across protocols</small>
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Portfolio Allocation</label>
            <div className="portfolio-preset-buttons">
              <button className={`preset-btn ${formData.portfolioPreset === 'CONSERVATIVE' ? 'active' : ''}`} onClick={() => handleInputChange('portfolioPreset', 'CONSERVATIVE')} disabled={isCreating}>
                60% Stable / 20% Native / 20% Other
              </button>
              <button className={`preset-btn ${formData.portfolioPreset === 'BALANCED' ? 'active' : ''}`} onClick={() => handleInputChange('portfolioPreset', 'BALANCED')} disabled={isCreating}>
                40% Stable / 30% Native / 30% Other
              </button>
              <button className={`preset-btn ${formData.portfolioPreset === 'AGGRESSIVE' ? 'active' : ''}`} onClick={() => handleInputChange('portfolioPreset', 'AGGRESSIVE')} disabled={isCreating}>
                20% Stable / 50% Native / 30% Other
              </button>
            </div>
          </div>

          <div className="limits-section">
            <div className="input-group">
              <label>Max Transaction Size (USD)</label>
              <input type="number" value={formData.maxTransactionSize} onChange={(e) => handleInputChange('maxTransactionSize', Number(e.target.value))} min="100" max="10000" disabled={isCreating}/>
            </div>

            <div className="input-group">
              <label>Daily Limit (USD)</label>
              <input type="number" value={formData.dailyLimit} onChange={(e) => handleInputChange('dailyLimit', Number(e.target.value))} min="500" max="50000" disabled={isCreating}/>
            </div>
          </div>

          <div className="permissions-summary">
            <h3>🔒 Agent Permissions</h3>
            <ul>
              <li>✅ Can Deposit: {Constants_1.AGENT_WALLET_PERMISSIONS[formData.agentType].canDeposit ? 'Yes' : 'No'}</li>
              <li>✅ Can Withdraw: {Constants_1.AGENT_WALLET_PERMISSIONS[formData.agentType].canWithdraw ? 'Yes' : 'No'}</li>
              <li>✅ Can Swap: {Constants_1.AGENT_WALLET_PERMISSIONS[formData.agentType].canSwap ? 'Yes' : 'No'}</li>
              <li>💰 Max Transaction: ${formData.maxTransactionSize}</li>
              <li>📊 Daily Limit: ${formData.dailyLimit}</li>
            </ul>
          </div>

          <button className="create-agent-btn" onClick={createAgentWallet} disabled={isCreating || !walletAddress}>
            {isCreating ? "Creating Agent..." : "🤖 Create Autonomous Agent"}
          </button>

          {!walletAddress && (<div className="wallet-warning">
              ⚠️ Please connect your wallet to create an agent
            </div>)}
        </div>
      </div>
    </div>);
};
exports.AgentWalletManager = AgentWalletManager;

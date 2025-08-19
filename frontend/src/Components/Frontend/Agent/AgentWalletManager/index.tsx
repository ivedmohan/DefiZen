"use client";
import React, { useState } from "react";
import { useAgentStore } from "@/store/agent-store";
import { useShallow } from "zustand/react/shallow";
import { AGENT_WALLET_PERMISSIONS, PORTFOLIO_PRESETS, BACKEND_URL } from "@/Components/Backend/Common/Constants";
import axios from "axios";
import "./styles.scss";

interface AgentWalletFormData {
  agentName: string;
  agentType: 'CONSERVATIVE' | 'AGGRESSIVE' | 'YIELD_FARMER';
  portfolioPreset: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  maxTransactionSize: number;
  dailyLimit: number;
}

export const AgentWalletManager = () => {
  const { walletAddress, setAgentWalletAddress, setAgentKey } = useAgentStore(
    useShallow((state) => ({
      walletAddress: state.walletAddress,
      setAgentWalletAddress: state.setAgentWalletAddress,
      setAgentKey: state.setAgentKey
    }))
  );

  const [formData, setFormData] = useState<AgentWalletFormData>({
    agentName: "",
    agentType: 'CONSERVATIVE',
    portfolioPreset: 'BALANCED',
    maxTransactionSize: 1000,
    dailyLimit: 5000
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: keyof AgentWalletFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgentTypeChange = (agentType: 'CONSERVATIVE' | 'AGGRESSIVE' | 'YIELD_FARMER') => {
    const permissions = AGENT_WALLET_PERMISSIONS[agentType];
    setFormData(prev => ({
      ...prev,
      agentType,
      maxTransactionSize: permissions.maxTransactionSize,
      dailyLimit: permissions.dailyLimit
    }));
  };

  const createAgentWallet = async () => {
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
      const response = await axios.post(`${BACKEND_URL}/agent/wallet/create`, {
        userId: walletAddress,
        agentName: formData.agentName,
        permissions: AGENT_WALLET_PERMISSIONS[formData.agentType],
        portfolioPreset: PORTFOLIO_PRESETS[formData.portfolioPreset]
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
      } else {
        setError(response.data.error || "Failed to create agent wallet");
      }
    } catch (error: any) {
      console.error("Error creating agent wallet:", error);
      setError(error.response?.data?.error || "Failed to create agent wallet");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="AgentWalletManager">
      <div className="manager-container">
        <h2>🤖 Create Autonomous Agent</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-section">
          <div className="input-group">
            <label>Agent Name</label>
            <input
              type="text"
              value={formData.agentName}
              onChange={(e) => handleInputChange('agentName', e.target.value)}
              placeholder="Enter agent name (e.g., Conservative Trader)"
              disabled={isCreating}
            />
          </div>

          <div className="input-group">
            <label>Agent Type</label>
            <div className="agent-type-buttons">
              <button
                className={`type-btn ${formData.agentType === 'CONSERVATIVE' ? 'active' : ''}`}
                onClick={() => handleAgentTypeChange('CONSERVATIVE')}
                disabled={isCreating}
              >
                🛡️ Conservative
                <small>Low risk, stable returns</small>
              </button>
              <button
                className={`type-btn ${formData.agentType === 'AGGRESSIVE' ? 'active' : ''}`}
                onClick={() => handleAgentTypeChange('AGGRESSIVE')}
                disabled={isCreating}
              >
                🚀 Aggressive
                <small>High risk, high returns</small>
              </button>
              <button
                className={`type-btn ${formData.agentType === 'YIELD_FARMER' ? 'active' : ''}`}
                onClick={() => handleAgentTypeChange('YIELD_FARMER')}
                disabled={isCreating}
              >
                🌾 Yield Farmer
                <small>Maximize APY across protocols</small>
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Portfolio Allocation</label>
            <div className="portfolio-preset-buttons">
              <button
                className={`preset-btn ${formData.portfolioPreset === 'CONSERVATIVE' ? 'active' : ''}`}
                onClick={() => handleInputChange('portfolioPreset', 'CONSERVATIVE')}
                disabled={isCreating}
              >
                60% Stable / 20% Native / 20% Other
              </button>
              <button
                className={`preset-btn ${formData.portfolioPreset === 'BALANCED' ? 'active' : ''}`}
                onClick={() => handleInputChange('portfolioPreset', 'BALANCED')}
                disabled={isCreating}
              >
                40% Stable / 30% Native / 30% Other
              </button>
              <button
                className={`preset-btn ${formData.portfolioPreset === 'AGGRESSIVE' ? 'active' : ''}`}
                onClick={() => handleInputChange('portfolioPreset', 'AGGRESSIVE')}
                disabled={isCreating}
              >
                20% Stable / 50% Native / 30% Other
              </button>
            </div>
          </div>

          <div className="limits-section">
            <div className="input-group">
              <label>Max Transaction Size (USD)</label>
              <input
                type="number"
                value={formData.maxTransactionSize}
                onChange={(e) => handleInputChange('maxTransactionSize', Number(e.target.value))}
                min="100"
                max="10000"
                disabled={isCreating}
              />
            </div>

            <div className="input-group">
              <label>Daily Limit (USD)</label>
              <input
                type="number"
                value={formData.dailyLimit}
                onChange={(e) => handleInputChange('dailyLimit', Number(e.target.value))}
                min="500"
                max="50000"
                disabled={isCreating}
              />
            </div>
          </div>

          <div className="permissions-summary">
            <h3>🔒 Agent Permissions</h3>
            <ul>
              <li>✅ Can Deposit: {AGENT_WALLET_PERMISSIONS[formData.agentType].canDeposit ? 'Yes' : 'No'}</li>
              <li>✅ Can Withdraw: {AGENT_WALLET_PERMISSIONS[formData.agentType].canWithdraw ? 'Yes' : 'No'}</li>
              <li>✅ Can Swap: {AGENT_WALLET_PERMISSIONS[formData.agentType].canSwap ? 'Yes' : 'No'}</li>
              <li>💰 Max Transaction: ${formData.maxTransactionSize}</li>
              <li>📊 Daily Limit: ${formData.dailyLimit}</li>
            </ul>
          </div>

          <button
            className="create-agent-btn"
            onClick={createAgentWallet}
            disabled={isCreating || !walletAddress}
          >
            {isCreating ? "Creating Agent..." : "🤖 Create Autonomous Agent"}
          </button>

          {!walletAddress && (
            <div className="wallet-warning">
              ⚠️ Please connect your wallet to create an agent
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
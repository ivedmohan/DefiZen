# 🚀 DefiZen - Autonomous DeFi Trading Platform

A sophisticated autonomous DeFi trading platform built on StarkNet that combines AI-powered decision making with real blockchain interactions. DefiZen provides intelligent portfolio management, yield farming optimization, and automated trading strategies.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   StarkNet      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   Blockchain    │
│   Port: 3001    │    │   Port: 3002    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └─────────────────────┐ │ ┌─────────────────────┘
                               │ │ │
                    ┌─────────────────┐
                    │   AI Agent      │
                    │  (Claude 3.5)   │
                    │   LangChain     │
                    └─────────────────┘
```

## 🌟 Key Features

- **🤖 Autonomous Trading**: AI-powered decision making with Claude 3.5 Sonnet
- **💰 Yield Optimization**: Multi-protocol yield farming (StrkFarm, EnduFi)
- **🔄 Automated Rebalancing**: Smart portfolio management based on risk preferences
- **📊 Real-time Analytics**: Portfolio tracking and performance monitoring
- **🔒 Secure Wallet Management**: Encrypted private key storage and agent wallets
- **⚡ DEX Integration**: AVNU aggregator for optimal swap routing
- **🛡️ Risk Management**: Stop-loss, slippage control, and safety checks

## 🛠️ Tech Stack

- **Framework**: Express.js + TypeScript
- **AI/ML**: LangChain + Claude 3.5 Sonnet (Anthropic)
- **Blockchain**: StarkNet + Account Abstraction
- **Database**: Mock Database (Production: Supabase + Prisma)
- **DeFi Protocols**: AVNU, StrkFarm, EnduFi, Unruggable
- **Security**: CORS, Rate limiting, Input validation
- **Monitoring**: Winston logger + Error tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- StarkNet wallet with testnet funds
- Environment variables configured

### Installation

```bash
# Clone the repository
git clone https://github.com/ivedmohan/DefiZen.git
cd DefiZen

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

---

**Built with ❤️ by the DefiZen Team**

A sophisticated autonomous DeFi trading platform built on StarkNet that combines AI-powered decision making with real blockchain interactions. DefiZen provides intelligent portfolio management, yield farming optimization, and automated trading strategies..

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   StarkNet      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   Blockchain    │
│   Port: 3001    │    │   Port: 3002    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └─────────────────────┐ │ ┌─────────────────────┘
                               │ │ │
                    ┌─────────────────┐
                    │   AI Agent      │
                    │  (Claude 3.5)   │
                    │   LangChain     │
                    └─────────────────┘
```

## 🌟 Key Features

- **🤖 Autonomous Trading**: AI-powered decision making with Claude 3.5 Sonnet
- **💰 Yield Optimization**: Multi-protocol yield farming (StrkFarm, EnduFi)
- **🔄 Automated Rebalancing**: Smart portfolio management based on risk preferences
- **📊 Real-time Analytics**: Portfolio tracking and performance monitoring
- **🔒 Secure Wallet Management**: Encrypted private key storage and agent wallets
- **⚡ DEX Integration**: AVNU aggregator for optimal swap routing
- **🛡️ Risk Management**: Stop-loss, slippage control, and safety checks

## 🛠️ Tech Stack

- **Framework**: Express.js + TypeScript
- **AI/ML**: LangChain + Claude 3.5 Sonnet (Anthropic)
- **Blockchain**: StarkNet + Account Abstraction
- **Database**: Mock Database (Production: Supabase + Prisma)
- **DeFi Protocols**: AVNU, StrkFarm, EnduFi, Unruggable
- **Security**: CORS, Rate limiting, Input validation
- **Monitoring**: Winston logger + Error tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- StarkNet wallet with testnet funds
- Environment variables configured

### Installation

```bash
# Clone the repository
git clone https://github.com/ivedmohan/DefiZen.git
cd DefiZen

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables

```env
# Server Configuration
PORT=3002
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# StarkNet Configuration
STARKNET_RPC_URL=https://starknet-mainnet.public.blastapi.io
PVT_KEY=your_private_key_here
ACCOUNT_ADDRESS=your_account_address_here

# AI Configuration
ANTHROPIC_API_KEY=your_anthropic_key_here

# Database (Production)
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📡 API Documentation

### 🤖 Autonomous Trading Routes (`/autonomous`)

#### POST `/autonomous/createDeposit`
Create a new autonomous deposit for agent management.

**Request Body:**
```json
{
  "agentWallet": "0x...", 
  "userWallet": "0x...",
  "amount": "100.0",
  "stopLoss": "90.0",
  "expectedProfit": "110.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit created successfully",
  "data": {
    "id": 1,
    "agentWallet": "0x...",
    "amount": "100.0",
    "deadline": "2025-08-27T..."
  }
}
```

#### POST `/autonomous/maximizeProfit`
Execute autonomous profit maximization strategy.

**Request Body:**
```json
{
  "agentId": "agent_001",
  "targetApy": "10"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Autonomous profit maximization completed",
  "data": {
    "optimizedAllocations": [...],
    "expectedApy": 12.5,
    "riskScore": 0.3
  }
}
```

#### GET `/autonomous/getTransactionsByAgent`
Fetch all transactions for a specific agent.

**Query Parameters:**
- `agentWalletAddress`: Agent wallet address

**Response:**
```json
{
  "status": true,
  "message": [
    {
      "hash": "0x...",
      "type": "deposit",
      "amount": "100.0",
      "timestamp": "2025-08-20T..."
    }
  ]
}
```

### 🏦 Agent Wallet Routes (`/agent/wallet`)

#### POST `/agent/wallet/create`
Create a new agent wallet with specific permissions.

**Request Body:**
```json
{
  "userId": "0x...",
  "agentName": "My Trading Agent",
  "permissions": {
    "canDeposit": true,
    "canWithdraw": true,
    "canSwap": true,
    "maxTransactionSize": 1000,
    "dailyLimit": 5000
  },
  "portfolioPreset": {
    "stablePercentage": 30,
    "nativePercentage": 40,
    "otherPercentage": 30
  }
}
```

#### GET `/agent/wallet/:agentId`
Get agent wallet details and current status.

#### PUT `/agent/wallet/:agentId/permissions`
Update agent wallet permissions.

#### DELETE `/agent/wallet/:agentId`
Deactivate an agent wallet.

### 💼 Portfolio Management (`/userPortfolio`)

#### GET `/userPortfolio/`
Get user portfolio overview.

**Query Parameters:**
- `agentWalletAddress`: Agent wallet address

**Response:**
```json
{
  "userPortfolio": {
    "totalValue": "1250.50",
    "tokens": [
      {
        "symbol": "ETH",
        "balance": "0.5",
        "value": "1000.0"
      },
      {
        "symbol": "STRK",
        "balance": "500",
        "value": "250.50"
      }
    ],
    "yieldPositions": [...],
    "performanceMetrics": {...}
  }
}
```

#### GET `/userPortfolio/agentTotal`
Get total value managed by agent across all users.

### 💰 Deposit & Withdrawal (`/depositWithdraw`)

#### GET `/depositWithdraw/pools`
Get available yield farming pools with APY data.

**Response:**
```json
{
  "data": [
    {
      "id": "strkfarm-eth-usdc",
      "name": "ETH-USDC LP",
      "protocol": "StrkFarm",
      "apy": 15.2,
      "tvl": "2500000",
      "riskLevel": "medium",
      "tokens": ["ETH", "USDC"]
    }
  ]
}
```

#### POST `/depositWithdraw/deposit`
Deposit tokens into yield farming protocols.

**Request Body:**
```json
{
  "tokenName": "ETH",
  "amount": "1.0",
  "accountAddress": "0x...",
  "protocolName": "StrkFarm"
}
```

#### POST `/depositWithdraw/agent`
Execute deposit/withdrawal via AI agent.

**Request Body:**
```json
{
  "messages": "Deposit 100 USDC into the highest APY pool",
  "address": "0x..."
}
```

### ⚖️ Portfolio Rebalancing (`/rebalance`)

#### POST `/rebalance/execute`
Execute portfolio rebalancing based on user preferences.

#### GET `/rebalance/preview`
Preview rebalancing actions without execution.

#### PUT `/rebalance/preferences`
Update rebalancing preferences.

### 👥 User Contacts (`/userContact`)

#### GET `/userContact/`
Get user's contact list.

#### POST `/userContact/add`
Add a new contact.

#### DELETE `/userContact/:id`
Remove a contact.

## 🎯 Core Functions

### Autonomous Strategy (`MaximisingStrategy.ts`)
- **Purpose**: AI-driven profit maximization algorithm
- **Features**: APY analysis, risk assessment, optimal allocation
- **Protocols**: StrkFarm, EnduFi, AVNU integration

### Wallet Management (`walletManager.ts`)
- **Purpose**: Secure wallet operations and key management
- **Features**: Agent wallet creation, permission control, transaction signing

### DeFi Integration
- **StrkFarm**: Yield farming and liquidity provision
- **EnduFi**: Lending and borrowing optimization
- **AVNU**: DEX aggregation for optimal swaps
- **Unruggable**: Token safety verification

## 🔄 Automated Jobs

### Rebalancer Cron Job
- **Schedule**: Every 6 hours
- **Function**: Automatically rebalances portfolios based on user preferences
- **Trigger**: `0 0 */6 * * *`

### Volatile Asset Swapper
- **Schedule**: Every 6 hours  
- **Function**: Swaps volatile assets to stable coins during market volatility
- **Trigger**: `0 0 */6 * * *`

## 🛡️ Security Features

- **Input Validation**: Zod schema validation for all endpoints
- **Rate Limiting**: Request rate limiting per IP
- **CORS Protection**: Configurable origin whitelist
- **Private Key Encryption**: Secure key storage and handling
- **Error Handling**: Comprehensive error handling and logging
- **Security Headers**: XSS, CSRF, and content-type protection

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

## 📦 Project Structure

```
src/
├── Agents/               # AI agent services and prompts
├── Functions/            # Core business logic
│   ├── Autonomous.ts     # Autonomous trading functions
│   ├── MaximisingStrategy.ts # Profit optimization
│   ├── Portfolio.ts      # Portfolio management
│   ├── StrkFarm.ts      # StrkFarm integration
│   └── EnduFi.ts        # EnduFi integration
├── Routes/              # API route handlers
├── config/              # Configuration files
├── constants/           # Contract addresses and constants
├── middleware/          # Express middleware
├── tools/              # Utility tools and integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── db-mock.ts          # Mock database for development
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t defizen-backend .
docker run -p 3002:3002 defizen-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**Built with ❤️ by the DefiZen Team**

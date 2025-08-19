#!/bin/bash

echo "🚀 Setting up HackerGames_backend - Autonomous DeFi Agent Platform"
echo "================================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On Ubuntu: sudo systemctl start postgresql"
    echo "   On macOS: brew services start postgresql"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/hackergames"
DIRECT_URL="postgresql://username:password@localhost:5432/hackergames"

# API Keys
ALCHEMY_API_KEY="your-alchemy-starknet-key"
ANTHROPIC_API_KEY="your-anthropic-claude-key"

# Security
ENCRYPTION_KEY="your-32-character-encryption-key"
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Server Configuration
PORT=3002
NODE_ENV=development
EOF
    echo "⚠️  Please edit .env file with your actual configuration"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma db push

# Create logs directory with proper permissions
echo "📁 Setting up logging..."
mkdir -p logs
touch logs/error.log logs/all.log
chmod 644 logs/*.log

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys and database URL"
echo "2. Start the server: npm run dev"
echo "3. Open http://localhost:3002 in your browser"
echo ""
echo "📚 Documentation:"
echo "- README.md: Complete system documentation"
echo "- SECURITY_FIXES.md: Security implementation details"
echo ""
echo "🧪 Testing:"
echo "- Run tests: npm test"
echo "- Check logs: tail -f logs/all.log"
echo ""
echo "🚀 Your autonomous DeFi agent platform is ready!" 
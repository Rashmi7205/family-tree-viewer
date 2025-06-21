#!/bin/bash

# Family Tree Viewer - Local Setup Script
# This script automates the local setup process

echo "🌳 Family Tree Viewer - Local Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if MongoDB is running
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet &> /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is installed but not running. Please start MongoDB service."
        echo "   - Windows: net start MongoDB"
        echo "   - macOS: brew services start mongodb-community"
        echo "   - Linux: sudo systemctl start mongod"
    fi
else
    echo "⚠️  MongoDB not detected. You can either:"
    echo "   1. Install MongoDB locally: https://www.mongodb.com/try/download/community"
    echo "   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
fi

# Install dependencies
echo "📦 Installing dependencies..."
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating environment file..."
    cp .env.example .env
    
    # Generate secrets
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Update .env file with generated secrets
    sed -i.bak "s/your-super-secret-jwt-key-here/$JWT_SECRET/" .env
    sed -i.bak "s/your-nextauth-secret-here/$NEXTAUTH_SECRET/" .env
    rm .env.bak 2>/dev/null || true
    
    echo "✅ Environment file created with secure secrets"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed setup instructions, see SETUP.md"

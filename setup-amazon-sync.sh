#!/bin/bash
# Quick Setup Script for Amazon Sync Feature
# This script sets up the Python adapter for real Amazon order syncing

set -e

echo "🚀 Aura Amazon Sync - Quick Setup"
echo "=================================="
echo ""

# Check Python version
echo "✓ Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+ first."
    exit 1
fi
PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "✓ Found Python $PYTHON_VERSION"
echo ""

# Create virtual environment
echo "📦 Setting up Python environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "✓ Created virtual environment"
else
    echo "✓ Virtual environment already exists"
fi

# Activate venv
source .venv/bin/activate || . .venv/Scripts/activate 2>/dev/null
echo "✓ Activated virtual environment"
echo ""

# Install dependencies
echo "📚 Installing dependencies..."
pip install -q -r api-adapter/requirements.txt
echo "✓ Dependencies installed"
echo ""

# Check for .env file
echo "🔐 Checking Amazon credentials..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || touch .env
fi

# Check for credentials
if ! grep -q "AMAZON_EMAIL" .env; then
    echo "❌ AMAZON_EMAIL not set in .env"
    echo ""
    echo "To set up real Amazon sync, add your credentials to .env:"
    echo ""
    echo "  AMAZON_EMAIL=your.email@amazon.com"
    echo "  AMAZON_PASSWORD=your_password"
    echo ""
    echo "Or for AWS API auth:"
    echo "  AWS_ACCESS_KEY_ID=your_key"
    echo "  AWS_SECRET_ACCESS_KEY=your_secret"
    echo "  AWS_REGION=us-east-1"
    echo ""
    echo "Then re-run this script."
    exit 1
fi
echo "✓ Amazon credentials found in .env"
echo ""

# Test adapter connection
echo "🧪 Testing adapter..."
uvicorn api-adapter.adapter:app --host 127.0.0.1 --port 8001 &
ADAPTER_PID=$!
sleep 3

if curl -s http://127.0.0.1:8001/health > /dev/null 2>&1; then
    echo "✓ Adapter is healthy"
    kill $ADAPTER_PID 2>/dev/null || true
else
    echo "❌ Adapter failed to start"
    kill $ADAPTER_PID 2>/dev/null || true
    exit 1
fi
echo ""

echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Make sure .env has AMAZON_EMAIL and AMAZON_PASSWORD set"
echo "2. In another terminal, run: source .venv/bin/activate && uvicorn api-adapter.adapter:app --reload --port 8001"
echo "3. Update .env with:"
echo "   RETAILER_ADAPTER_URL=http://localhost:8001"
echo "   USE_LOCAL_RETAILER_ADAPTER=true"
echo "4. Restart dev server: npm run dev"
echo "5. Go to closet and click 'Fetch My Amazon Orders'"
echo ""
echo "For help, see AMAZON_SYNC_FIX.md"

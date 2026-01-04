# Amazon Sync - Complete Setup & Testing Guide

## Current Status

✅ **Demo Mode**: Fully functional with 8 sample items  
⚠️ **Real Mode**: Requires Python adapter setup  

## Quick Start (Demo Mode - Works Now!)

```bash
# 1. Start dev server
npm run dev

# 2. In browser, navigate to: Closet → Amazon Sync
# 3. Click "Fetch My Amazon Orders"
# 4. 8 demo items appear with images
# 5. Select items → Import to closet ✅
```

**Demo works out-of-the-box with zero setup!**

---

## Full Setup (Real Amazon Orders)

### Prerequisites
- Python 3.9+
- Amazon account
- 5-10 minutes

### Option A: Automated Setup (Recommended)

#### Linux/macOS
```bash
# Make script executable
chmod +x setup-amazon-sync.sh

# Run setup
bash setup-amazon-sync.sh
```

#### Windows (PowerShell)
```powershell
# Run batch file
.\setup-amazon-sync.bat
```

The script will:
1. ✅ Create Python virtual environment
2. ✅ Install all dependencies
3. ✅ Verify Amazon credentials
4. ✅ Test adapter connection

### Option B: Manual Setup

#### Step 1: Create & Activate Virtual Environment

**Linux/macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

#### Step 2: Install Dependencies
```bash
pip install -r api-adapter/requirements.txt
```

This installs:
- `fastapi` - Web framework
- `uvicorn` - Server
- `amazon-mcp` - Amazon integration
- `playwright` - Browser automation for order scraping
- `beautifulsoup4` - HTML parsing
- `cachetools` - Caching

#### Step 3: Configure Amazon Credentials

Edit `.env` and set **ONE** of these:

**Option 1: Browser-Based (Recommended - includes 2FA support)**
```env
AMAZON_EMAIL=your_email@gmail.com
AMAZON_PASSWORD=your_password
```

**Option 2: AWS API (For developers/businesses)**
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

#### Step 4: Download Browser (First Time Only)

For Playwright to scrape real orders:
```bash
# Linux/macOS
playwright install chromium

# Windows (from activated venv)
python -m playwright install chromium
```

#### Step 5: Start the Python Adapter

In a **new terminal**:
```bash
# Make sure venv is activated first!
source .venv/bin/activate  # Linux/macOS
# or
.venv\Scripts\activate.bat  # Windows

# Start the adapter
uvicorn api-adapter.adapter:app --reload --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete
```

#### Step 6: Update .env for Real Sync

Edit `.env` and change:
```env
RETAILER_ADAPTER_URL=http://localhost:8001
USE_LOCAL_RETAILER_ADAPTER=true
```

#### Step 7: Restart Dev Server

```bash
npm run dev
```

---

## Testing the Setup

### 1. Test API Health

```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "amazon_mcp_available": true,
  "timestamp": "2026-01-02T..."
}
```

### 2. Test Demo Data

```bash
curl "http://localhost:3000/api/shopping/amazon/orders"
```

Expected: Returns 8 sample items with `"demo": true`

### 3. Test Real Orders (After Adapter Setup)

```bash
# Make sure adapter is running on port 8001
curl "http://localhost:3000/api/shopping/amazon/orders?test=false"
```

This should return your actual Amazon order history.

### 4. Test Full UI Flow

1. Go to: **Closet** → **Amazon Sync**
2. Click **"Fetch My Amazon Orders"**
3. Wait 5-30 seconds for orders to load
4. Select items with checkboxes
5. Click **"Import N Selected Items"**
6. Items appear in closet! ✅

---

## Troubleshooting

### "Demo data" still showing after setup

**Problem**: Adapter not actually running or not accessible  
**Solution**:
```bash
# Verify adapter is running
curl http://localhost:8001/health

# If it fails, restart adapter in new terminal:
source .venv/bin/activate
uvicorn api-adapter.adapter:app --reload --port 8001
```

### "No orders found"

**Problem**: Amazon credentials incorrect or no order history  
**Solution**:
1. Verify AMAZON_EMAIL/PASSWORD in .env are correct
2. Check your Amazon account has at least 1 order
3. Test adapter logs: check terminal where uvicorn is running
4. Try demo mode first to verify UI works

### ModuleNotFoundError: No module named 'amazon_mcp'

**Problem**: Dependencies not installed  
**Solution**:
```bash
# Activate venv
source .venv/bin/activate

# Reinstall
pip install -r api-adapter/requirements.txt
```

### "Connection refused" on port 8001

**Problem**: Adapter not running  
**Solution**:
```bash
# In new terminal, activate venv and start adapter
uvicorn api-adapter.adapter:app --reload --port 8001
```

### Images not loading

**Problem**: Image URLs might be expired or blocked  
**Solution**: This is normal - Amazon images may expire over time. Items still import correctly.

### "ECONNREFUSED" errors

**Problem**: Next.js can't reach adapter  
**Solution**:
1. Verify adapter is running: `curl http://localhost:8001/health`
2. Check .env has `RETAILER_ADAPTER_URL=http://localhost:8001`
3. Verify firewall isn't blocking port 8001

---

## Architecture Overview

```
┌─────────────────────────────────┐
│   Aura Frontend (React)         │
│   - Amazon Sync Component       │
│   - Shows orders + images       │
└────────────────┬────────────────┘
                 │
        GET /api/shopping/amazon/orders
                 │
┌────────────────▼────────────────┐
│   Next.js API Route             │
│   - /api/shopping/amazon/orders │
│   - Falls back to demo data     │
│   - Proxies to Python adapter   │
└────────────────┬────────────────┘
                 │
        If RETAILER_ADAPTER_URL set:
                 │
    ┌────────────▼────────────────┐
    │   Python Adapter (FastAPI)  │
    │   - Port 8001               │
    │   - Scrapes real Amazon     │
    │   - Uses amazon-mcp lib     │
    └────────────────────────────┘
```

---

## Feature Completeness Checklist

- [x] Demo data with 8 items
- [x] Images display in UI
- [x] Item categorization (clothing vs makeup)
- [x] Add to closet functionality
- [x] Type-safe TypeScript code
- [x] Environment configuration
- [x] Error handling with fallbacks
- [x] Setup automation script
- [x] Comprehensive documentation
- [x] Windows + Mac/Linux support

### Optional Enhancements (Future)

- [ ] Webhook for real-time order sync
- [ ] CSV import from Amazon export
- [ ] Price tracking and alerts
- [ ] Duplicate detection
- [ ] Bulk tagging
- [ ] Order filtering by date range

---

## Next Steps

1. **Try Demo Mode**: Verify UI works with sample data
2. **Run Setup Script**: `bash setup-amazon-sync.sh`
3. **Start Adapter**: `uvicorn api-adapter.adapter:app --reload --port 8001`
4. **Import Real Orders**: Fetch and import your actual purchases
5. **Enjoy**: Your entire Amazon purchase history organized in Aura! 🎉

---

## Questions?

- Check `AMAZON_SYNC_FIX.md` for technical details
- Review `api-adapter/README.md` for adapter configuration
- Check Python logs: Look at terminal where uvicorn is running
- Check browser console: F12 → Console tab for client-side errors

**The feature is production-ready!** 🚀

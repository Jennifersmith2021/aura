# Amazon Sync - Production Mode Setup

**Status**: Now in **PRODUCTION MODE** ✅

Your app is configured to require real Amazon order sync (no demo data fallback in production).

---

## 🔴 Current Status: Adapter Not Connected

The system is in production mode but the Python adapter is not running. To start syncing real Amazon orders, follow these steps:

---

## ✅ Step 1: Verify Environment Variables

Check your `.env` file has these settings:

```bash
# Production mode is ACTIVE
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001

# Amazon credentials (use YOUR Amazon account)
AMAZON_EMAIL=jennifersmith202100@gmail.com
AMAZON_PASSWORD=1Workhard!
```

> ⚠️ **SECURITY NOTE**: In production, use environment variables or secrets management, never hardcoded credentials.

---

## ✅ Step 2: Install Python Adapter

Run the automated setup script:

### Mac / Linux
```bash
bash setup-amazon-sync.sh
```

### Windows (PowerShell)
```bash
.\setup-amazon-sync.bat
```

This script will:
- ✅ Check Python installation
- ✅ Create virtual environment
- ✅ Install dependencies (boto3, playwright, fastapi, etc.)
- ✅ Test adapter connection

---

## ✅ Step 3: Start the Python Adapter

Open a **new terminal** and run:

```bash
# Activate virtual environment
source .venv/bin/activate        # Mac/Linux
# OR
.venv\Scripts\activate           # Windows

# Start the FastAPI server
uvicorn api-adapter.adapter:app --reload --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete
```

**Keep this terminal open!**

---

## ✅ Step 4: Start the Next.js Dev Server

Open **another terminal** and run:

```bash
npm run dev
```

This starts the app on `http://localhost:3000`

---

## ✅ Step 5: Test Amazon Sync

1. **Navigate to `/amazon`** in the app
2. **Click "Sync Orders" tab**
3. **Click "Fetch My Amazon Orders"**

### Expected Behavior

- ✅ If your Amazon account has orders: **Shows real orders with images, prices, dates**
- ✅ If your Amazon account is empty: **Shows "No orders found"**
- ✅ If adapter fails to connect: **Shows error message with setup instructions**

---

## 🧪 Production Mode Features

### Strict Mode Behavior

| Scenario | Behavior |
|----------|----------|
| **Adapter running + account has orders** | ✅ Returns real orders |
| **Adapter running + account empty** | Returns empty list (no demo fallback) |
| **Adapter not running (dev mode)** | Can use demo data with `?demo=true` |
| **Adapter not running (production)** | ❌ Returns 502/503 error |

### Why Production Mode?

Production mode prevents confusion:
- Users see **either real data or clear errors**
- No silent fallback to demo data
- Clear instructions when something's wrong
- Helps catch configuration issues early

---

## 🛠️ Troubleshooting

### ❌ "No orders found" after setup

**Problem**: Amazon account has no purchase history  
**Solution**:
1. Make sure you're logged into the correct Amazon account
2. Visit amazon.com and place a test order
3. Wait for order to process (usually instant)
4. Re-fetch in the app

### ❌ "Connection refused" on port 8001

**Problem**: Adapter not running  
**Solution**:
```bash
# Check if process is running
lsof -i :8001          # Mac/Linux
netstat -ano | grep 8001   # Windows

# Kill any existing process
kill -9 <PID>          # Mac/Linux
taskkill /PID <PID> /F # Windows

# Start fresh
uvicorn api-adapter.adapter:app --reload --port 8001
```

### ❌ ModuleNotFoundError

**Problem**: Missing Python dependencies  
**Solution**:
```bash
source .venv/bin/activate
pip install -r api-adapter/requirements.txt
```

### ❌ AuthenticationError or wrong credentials

**Problem**: Amazon email/password incorrect  
**Solution**:
1. Verify credentials in `.env`
2. Test login at amazon.com manually
3. Check for 2FA (two-factor authentication) - disable for browser automation
4. Update credentials and reload

### ❌ Timeout errors

**Problem**: Adapter takes too long to fetch orders  
**Solution**:
1. Check internet connection
2. Increase timeout in API (currently 15 seconds)
3. Check Amazon account doesn't have thousands of orders (would be slow)

---

## 📊 Checking Adapter Health

Test the adapter directly:

```bash
# Check if adapter is running
curl http://localhost:8001/health

# Should return 200 OK

# Or with verbose output
curl -v http://localhost:8001/health
```

---

## 🔐 Production Deployment

### For Real Production (Not Local Dev)

1. **Use environment variables** (not `.env` files):
   ```bash
   export AMAZON_EMAIL="your-real-email@example.com"
   export AMAZON_PASSWORD="your-real-password"
   export RETAILER_ADAPTER_URL="http://adapter-service:8001"
   export USE_LOCAL_RETAILER_ADAPTER="true"
   ```

2. **Use secrets management** (AWS Secrets, HashiCorp Vault, etc.)

3. **Enable HTTPS** for adapter communication

4. **Add monitoring/alerts** for adapter downtime

5. **Use container orchestration** (Docker, Kubernetes)

---

## ✨ What Happens Next

Once the adapter is running:

1. **Click "Fetch My Amazon Orders"** → Real orders load
2. **Select items** you want to import
3. **Click "Import Selected Items"** → Items added to closet
4. **Go to Inventory Manager** → See all synced items
5. **Filter/manage** → By date, price, bulk delete, etc.

---

## 📝 Example Session

```
Terminal 1 (Adapter):
$ bash setup-amazon-sync.sh
✓ Python 3.11 found
✓ Virtual environment created
✓ Dependencies installed
✓ Adapter test successful

$ uvicorn api-adapter.adapter:app --reload --port 8001
INFO: Uvicorn running on http://127.0.0.1:8001
INFO: Application startup complete

---

Terminal 2 (App):
$ npm run dev
  ▲ Next.js 16.0.3
  - Local: http://localhost:3000

[Browser]
→ Navigate to http://localhost:3000/amazon
→ Click "Fetch My Amazon Orders"
→ Real orders load from your Amazon account! ✅

→ Click "Inventory Manager"
→ See stats: 127 items, $2,843.50 total value
→ Filter by date/price
→ Bulk delete old items
```

---

## 🎯 Summary

✅ **Production mode is active**  
⏳ **Waiting for adapter to connect**  
📖 **Follow steps above to start adapter**  
🚀 **Real Amazon orders will sync once connected**

---

**Last Updated**: January 5, 2026  
**Version**: Production Mode v2.0

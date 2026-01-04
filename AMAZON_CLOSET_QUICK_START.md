# Amazon Closet Integration - Quick Start

## What You Can Do Now

Pull your **past Amazon purchases directly into your virtual closet** with one click.

## 5-Minute Setup

### 1. Set Amazon Credentials

Add to `.env.local`:

```env
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001
AMAZON_EMAIL=your.email@amazon.com
AMAZON_PASSWORD=your_password
```

### 2. Start the Adapter

```bash
cd api-adapter
pip install -r requirements.txt
python adapter.py
```

Wait for: `INFO: Uvicorn running on http://127.0.0.1:8001`

### 3. Start Aura

```bash
npm run dev
```

### 4. Import Orders

1. Go to **Closet** page
2. Click **📦 button** (top right)
3. Click **"Fetch Orders"** in the Amazon import panel
4. **Select items** you want to import
5. Click **"Import to Closet"**
6. Watch items appear in your closet ✨

## What Gets Imported

Each Amazon order becomes an item in your closet with:

- ✅ Product title
- ✅ Category (auto-detected: dress, top, shoe, etc.)
- ✅ Price
- ✅ Product image
- ✅ Amazon link (in importMeta)
- ✅ ASIN (Amazon product ID)
- ✅ Order date

Example:

```
Name:      Pink Satin Corset
Type:      Clothing
Category:  Dress
Price:     $49.99
Image:     [thumbnail]
From:      Amazon order #111-2222222-3333333
```

## Architecture

```
Closet Page
    ↓
📦 Import Button
    ↓
AmazonOrderSync Component
    ↓
FastAPI Adapter (localhost:8001)
    ↓
amazon-mcp SDK
    ↓
Amazon.com Order History
```

## Authentication Methods

### Browser-based (Recommended)

```env
AMAZON_EMAIL=your.email@amazon.com
AMAZON_PASSWORD=your_password
```

✅ Works without AWS account  
⏱️ Takes 10-20 seconds per fetch (uses Selenium)

### AWS API Keys

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

✅ Faster (~5 seconds)  
⚠️ Requires AWS account

## Troubleshooting

### "Failed to fetch orders"

```bash
# 1. Check adapter is running
curl http://localhost:8001/health

# Should return:
# {"status": "healthy", "amazon_mcp": true}

# 2. Verify credentials
echo "Email: $AMAZON_EMAIL"
echo "Password: [SET]"

# 3. Restart adapter
pkill -f "uvicorn"
python api-adapter/adapter.py
```

### "No orders found"

- Verify you have orders on Amazon.com
- Check credentials are correct
- Give it 10-20 seconds (network delay)

### "Module 'amazon_mcp' not found"

```bash
cd api-adapter
pip install amazon-mcp
python adapter.py
```

## Files Changed

- ✅ [src/app/closet/page.tsx](src/app/closet/page.tsx) — Added Amazon import button & panel
- ✅ [AMAZON_CLOSET_INTEGRATION_GUIDE.md](AMAZON_CLOSET_INTEGRATION_GUIDE.md) — Full integration guide

## Already Available

These components were already built and are now integrated:

- ✅ [src/components/AmazonOrderSync.tsx](src/components/AmazonOrderSync.tsx) — Order sync logic
- ✅ [src/components/AmazonSettings.tsx](src/components/AmazonSettings.tsx) — Credential management
- ✅ [api-adapter/adapter.py](api-adapter/adapter.py) — FastAPI server
- ✅ [src/app/api/shopping/amazon/](src/app/api/shopping/amazon/) — API routes

## Next Steps

1. ✅ Update `.env.local` with credentials
2. ✅ Start adapter: `python api-adapter/adapter.py`
3. ✅ Start Aura: `npm run dev`
4. ✅ Go to **Closet** → Click **📦** → Click **"Fetch Orders"**
5. ✅ Select items → Click **"Import to Closet"**

## Advanced Customization

### Custom Category Mapping

Edit [src/components/AmazonOrderSync.tsx](src/components/AmazonOrderSync.tsx) (around line 150):

```typescript
function inferCategory(amazonCategory: string): Category {
  const category = amazonCategory?.toLowerCase() || "";
  
  // Your custom mappings here
  if (category.includes("corset")) return "top";
  if (category.includes("lingerie")) return "accessory";
  // ... etc
  
  return "other";
}
```

### Fetch More Orders

In AmazonOrderSync component, change the fetch call:

```typescript
const response = await fetch("/api/shopping/amazon/orders?days=365&limit=100");
```

Parameters:
- `days=365` — Last year of orders
- `limit=100` — Max 100 results
- Default: `days=90, limit=50`

## Questions?

See [AMAZON_CLOSET_INTEGRATION_GUIDE.md](AMAZON_CLOSET_INTEGRATION_GUIDE.md) for:
- Detailed architecture
- API endpoint reference
- Advanced troubleshooting
- Multiple authentication methods

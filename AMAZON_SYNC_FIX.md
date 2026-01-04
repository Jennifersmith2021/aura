# Amazon Inventory Sync - Fix & Usage Guide

## Problem Identified

The Amazon inventory sync had several issues preventing it from working properly:

1. **Missing Type Definitions**: `AmazonOrderSync.tsx` was calling `inferItemType()` and `inferCategory()` functions without proper TypeScript types
2. **Invalid Category Mappings**: Functions were returning invalid category names that didn't match the `Category` union type
3. **No Fallback Data**: API endpoint would fail completely if the Python adapter wasn't running
4. **Missing Environment Config**: Environment variables for adapter URL weren't documented

## Changes Made

### 1. Fixed AmazonOrderSync Component (`src/components/AmazonOrderSync.tsx`)

✅ Added `"use client"` directive for client-side rendering  
✅ Added proper type imports from `@/types`  
✅ Fixed `inferItemType()` to return valid type: `"clothing" | "makeup"`  
✅ Fixed `inferCategory()` to return valid `Category` types:
- `"top"`, `"bottom"`, `"dress"`, `"shoe"`, `"outerwear"`, `"accessory"`
- `"face"`, `"eye"`, `"lip"`, `"cheek"`, `"tool"` (for makeup)
- `"other"`

### 2. Updated API Endpoint (`src/app/api/shopping/amazon/orders/route.ts`)

✅ Added graceful fallback to test data when adapter is unavailable  
✅ Added 5-second timeout to prevent hanging requests  
✅ Improved error messages to guide users  
✅ Returns demo data with helpful message

### 3. Updated Environment Configuration (`.env`)

✅ Added `RETAILER_ADAPTER_URL` variable (defaults to `http://localhost:8001`)  
✅ Added `USE_LOCAL_RETAILER_ADAPTER` flag (defaults to `false` for dev)

## How to Use Amazon Sync

### Option 1: Quick Test with Demo Data (No Setup Required)

The app now includes sample Amazon orders for testing. Simply:

1. Navigate to your closet or any page with the Amazon sync component
2. Click **"Fetch My Amazon Orders"**
3. Select items to import
4. Click **"Import Selected Items"**
5. Items are added to your closet with proper categorization

**This works out-of-the-box with no configuration!**

### Option 2: Real Amazon Orders (Advanced)

To fetch your actual Amazon order history:

#### Step 1: Set up the Python Adapter

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # on Linux/Mac
# or
.venv\Scripts\Activate  # on Windows

# Install dependencies
pip install -r api-adapter/requirements.txt

# Install browser automation (for real Amazon scraping)
playwright install chromium
```

#### Step 2: Configure Amazon Credentials

Option A - Browser-based auth (recommended):
```bash
# Add to .env file
AMAZON_EMAIL=your_email@gmail.com
AMAZON_PASSWORD=your_password
```

Option B - API credentials:
```bash
# Add to .env file
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

#### Step 3: Start the Adapter

```bash
# In a separate terminal
uvicorn api-adapter.adapter:app --reload --port 8001
```

#### Step 4: Enable in Next.js App

Update `.env`:
```
RETAILER_ADAPTER_URL=http://localhost:8001
USE_LOCAL_RETAILER_ADAPTER=true
```

Restart the dev server:
```bash
npm run dev
```

#### Step 5: Sync Orders

1. Click **"Fetch My Amazon Orders"**
2. The app will scrape your real Amazon order history
3. Select items and import to closet

## Troubleshooting

### "Demo data" message appears
**Issue**: Python adapter is not running  
**Solution**: Start the adapter: `uvicorn api-adapter.adapter:app --reload --port 8001`

### "No orders found"
**Issue**: Either your Amazon account has no orders, or credentials are incorrect  
**Solution**: Check Amazon credentials in `.env`, ensure account has order history

### Import fails silently
**Issue**: Invalid item type or category  
**Solution**: Check browser console for errors, ensure item titles contain recognizable keywords (clothing, makeup, etc.)

### TypeError in AmazonOrderSync
**Issue**: Component missing type definitions  
**Solution**: Ensure you're using the latest version with type imports fixed

## How It Works

```
┌─────────────────────┐
│   Aura Frontend     │
│   (Next.js/React)   │
└──────────┬──────────┘
           │
           │ POST /api/shopping/amazon/orders
           ↓
┌─────────────────────────────────────────┐
│   Next.js API Handler (route.ts)        │
│   - Validates request                   │
│   - Tries adapter first (5s timeout)    │
│   - Falls back to demo data             │
│   - Returns orders as JSON              │
└──────────┬──────────────────────────────┘
           │
           ├→ (If configured) ┌──────────────────┐
           │                  │ Python Adapter   │
           │                  │ (FastAPI)        │
           │                  │ - Scrapes Amazon │
           │                  │ - Returns orders │
           │                  └──────────────────┘
           │
           └→ Returns demo data if unavailable
                    ↓
           ┌─────────────────────┐
           │ AmazonOrderSync.tsx  │
           │ - Shows order list   │
           │ - User selects items │
           │ - Infers type/cat    │
           │ - Adds to store      │
           └─────────────────────┘
                    ↓
           ┌─────────────────────┐
           │ IndexedDB Closet     │
           │ (Client-side store)  │
           └─────────────────────┘
```

## Files Changed

- `src/components/AmazonOrderSync.tsx` - Fixed type definitions and category mappings
- `src/app/api/shopping/amazon/orders/route.ts` - Added fallback demo data
- `.env` - Added Amazon adapter configuration

## Testing the Fix

1. **Without Adapter** (default):
   ```bash
   npm run dev
   # Demo data appears automatically
   ```

2. **With Adapter**:
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   uvicorn api-adapter.adapter:app --reload --port 8001
   
   # Set RETAILER_ADAPTER_URL in .env
   ```

Both modes now work seamlessly! 🎉

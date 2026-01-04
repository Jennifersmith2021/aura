# Amazon MCP Integration with Closet Feature

## Overview

This guide explains how to integrate Amazon MCP (Model Context Protocol) with the Closet feature to pull your past Amazon purchases directly into your virtual wardrobe.

## Architecture

```
Closet Page (src/app/closet/page.tsx)
    ↓
    ├─→ ItemCard (display items)
    ├─→ AddItemModal (manual add)
    └─→ AmazonImportSection (NEW - order import)
         ├─→ AmazonSettings (configure credentials)
         └─→ AmazonOrderSync (fetch & import orders)
              ↓
              FastAPI Adapter (api-adapter/adapter.py)
              ↓
              amazon-mcp SDK
              ↓
              Amazon.com (order history)
```

## Integration Steps

### Step 1: Add Import Section to Closet Page

Update [src/app/closet/page.tsx](src/app/closet/page.tsx) to include Amazon import UI:

```tsx
"use client";

import { useStore } from "@/hooks/useStore";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { AmazonOrderSync } from "@/components/AmazonOrderSync";
import { useState } from "react";
import { Plus, Search, Package } from "lucide-react";
import { Category } from "@/types";
import { PageTransition } from "@/components/PageTransition";

export default function ClosetPage() {
    const { items, loading, addItem, removeItem } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showAmazonImport, setShowAmazonImport] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Category | "all">("all");

    const clothingItems = items.filter((i) => i.type === "clothing");

    const filteredItems = clothingItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.brand?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || item.category === filter;
        return matchesSearch && matchesFilter;
    });

    const categories: Category[] = ["top", "bottom", "dress", "shoe", "outerwear", "accessory"];

    if (loading) return <div className="p-8 text-center">Loading Closet...</div>;

    return (
        <PageTransition className="pb-24 pt-8 px-6 space-y-6">
            {/* Header with Add buttons */}
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Virtual Closet</h1>
                <div className="flex gap-2">
                    {/* Add Item Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                        title="Add item manually"
                    >
                        <Plus className="w-6 h-6" />
                    </button>

                    {/* Import from Amazon Button */}
                    <button
                        onClick={() => setShowAmazonImport(!showAmazonImport)}
                        className="bg-amber-500 text-white p-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
                        title="Import from Amazon orders"
                    >
                        <Package className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Amazon Import Section */}
            {showAmazonImport && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="font-semibold text-amber-900 dark:text-amber-100">
                                Import from Amazon
                            </h2>
                            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                Pull your past Amazon purchases into your closet
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAmazonImport(false)}
                            className="text-amber-600 hover:text-amber-700"
                        >
                            ✕
                        </button>
                    </div>
                    <AmazonOrderSync />
                </div>
            )}

            {/* Existing Search & Filter Section */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search clothes..."
                        className="w-full bg-white dark:bg-slate-800 pl-9 pr-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === "all"
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === cat
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Items Grid */}
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="relative">
                            <ItemCard item={item} />
                            <button
                                onClick={() => removeItem(item.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">No items found</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-primary hover:underline"
                    >
                        Add your first item
                    </button>
                </div>
            )}

            {/* Modals */}
            {isAddModalOpen && (
                <AddItemModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAddItem={(item) => {
                        addItem(item);
                        setIsAddModalOpen(false);
                    }}
                />
            )}
        </PageTransition>
    );
}
```

### Step 2: Setup Environment Variables

Add to `.env.local`:

```env
# Amazon MCP Adapter (required)
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001

# Amazon Credentials (choose one method):

# Method 1: Browser-based authentication
AMAZON_EMAIL=your.email@amazon.com
AMAZON_PASSWORD=your_password

# Method 2: AWS API Keys
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Method 3: MCP Token
AMAZON_MCP_TOKEN=your_token
```

### Step 3: Start the Adapter

The FastAPI adapter must be running to fetch orders:

```bash
# In a terminal, from project root
cd api-adapter
pip install -r requirements.txt
python adapter.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
```

### Step 4: Start Aura

In another terminal:

```bash
npm run dev
```

## How It Works

### User Flow: Import Amazon Orders

1. **User navigates to Closet** → Clicks Amazon import button (📦)
2. **Import panel opens** → Shows "Fetch Orders" button
3. **User clicks "Fetch Orders"** → Component fetches from `/api/shopping/amazon/orders`
4. **Orders displayed** → User sees list of past Amazon purchases with:
   - Product image
   - Title
   - Price
   - Quantity
   - Checkboxes to select items
5. **User selects items** → Auto-categorization happens
6. **User clicks "Import"** → Orders converted to Item objects:
   ```typescript
   {
     id: "uuid-v4",
     name: "Product Title",
     type: "clothing",  // or "makeup"
     category: "dress", // inferred from Amazon category
     image: "product_image_url",
     price: 49.99,
     dateAdded: Date.now(),
     importMeta: {
       source: "amazon",
       order_id: "111-2222222-3333333",
       asin: "B0123456789",
       order_date: "2025-12-15",
       url: "amazon.com/dp/B0123456789"
     }
   }
   ```
7. **Items saved to IndexedDB** → Appear in closet immediately
8. **Optional: Sync to server** → If logged in, POST `/api/sync/items`

## Category Mapping

The `AmazonOrderSync` component automatically categorizes Amazon products:

| Amazon Category | Aura Type | Aura Category |
|---|---|---|
| Dresses, Skirts | clothing | dress |
| Pants, Leggings | clothing | bottom |
| Tops, Blouses | clothing | top |
| Shoes | clothing | shoe |
| Jackets, Coats | clothing | outerwear |
| Accessories | clothing | accessory |
| Makeup, Cosmetics | makeup | face/eye/lip |
| Beauty Tools | makeup | tool |
| Other | clothing | other |

To customize this, edit the `inferCategory()` function in [src/components/AmazonOrderSync.tsx](src/components/AmazonOrderSync.tsx).

## API Endpoints

### Fetch Orders

**Request:**
```http
GET /api/shopping/amazon/orders
```

**Response:**
```json
{
  "orders": [
    {
      "order_id": "111-2222222-3333333",
      "order_date": "2025-12-15",
      "asin": "B0123456789",
      "title": "Pink Satin Corset",
      "price": 49.99,
      "quantity": 1,
      "category": "Clothing - Dresses",
      "image_url": "...",
      "url": "..."
    }
  ],
  "total": 5
}
```

### Sync Orders to Closet

**Request:**
```http
POST /api/shopping/amazon/orders/sync
Content-Type: application/json

{
  "orders": [
    {
      "order_id": "111-2222222-3333333",
      "title": "Pink Satin Corset",
      "category": "dress",
      "price": 49.99,
      "asin": "B0123456789"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "synced": 1,
  "items": [
    {
      "id": "uuid-v4",
      "name": "Pink Satin Corset",
      "type": "clothing",
      "category": "dress",
      "price": 49.99,
      "dateAdded": 1735689600000
    }
  ]
}
```

## Authentication Methods

### Option 1: Browser-based (Recommended for Development)

```bash
export AMAZON_EMAIL="your.email@amazon.com"
export AMAZON_PASSWORD="your_password"
python api-adapter/adapter.py
```

**Pros:** Works without AWS account  
**Cons:** Uses Selenium (slower), password in environment

### Option 2: AWS API Keys

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
python api-adapter/adapter.py
```

**Pros:** No password, faster  
**Cons:** Requires AWS account, more setup

### Option 3: MCP Token

```bash
export AMAZON_MCP_TOKEN="your_token"
python api-adapter/adapter.py
```

**Pros:** Stateless, safest  
**Cons:** Requires token generation

## Troubleshooting

### "Failed to fetch orders"

**Issue:** Adapter not running or credentials invalid

**Solution:**
```bash
# Check adapter is running
curl http://localhost:8001/health

# Response should be:
# {"status": "healthy", "amazon_mcp": true}

# Check credentials
export AMAZON_EMAIL="..."
export AMAZON_PASSWORD="..."
python api-adapter/adapter.py
```

### "No orders found"

**Issue:** Your Amazon account has no recent orders

**Solution:**
- Verify you have orders on Amazon.com
- Check credentials are correct
- Try increasing days filter: `days=365` for past year

### "Module 'amazon_mcp' not found"

**Issue:** amazon-mcp not installed

**Solution:**
```bash
cd api-adapter
pip install -r requirements.txt
python adapter.py
```

## Advanced: Customizing Category Mapping

Edit [src/components/AmazonOrderSync.tsx](src/components/AmazonOrderSync.tsx) around line 150:

```typescript
function inferCategory(amazonCategory: string): Category {
  const category = amazonCategory?.toLowerCase() || "";

  // Add your custom mappings here
  if (category.includes("dress") || category.includes("skirt")) return "dress";
  if (category.includes("pant") || category.includes("legging")) return "bottom";
  if (category.includes("shirt") || category.includes("blouse") || category.includes("top")) return "top";
  if (category.includes("shoe")) return "shoe";
  if (category.includes("coat") || category.includes("jacket")) return "outerwear";
  if (category.includes("accessory") || category.includes("belt")) return "accessory";

  return "other";
}
```

## Next Steps

1. ✅ **Start adapter**: `python api-adapter/adapter.py`
2. ✅ **Configure credentials** in `.env.local`
3. ✅ **Start Aura**: `npm run dev`
4. ✅ **Go to Closet** → Click 📦 button
5. ✅ **Click "Fetch Orders"** → Wait for results
6. ✅ **Select items** → Click "Import"
7. ✅ **View in closet** → Items now appear with Amazon metadata

## Files Involved

- **[src/app/closet/page.tsx](src/app/closet/page.tsx)** — Main closet page (add import button)
- **[src/components/AmazonOrderSync.tsx](src/components/AmazonOrderSync.tsx)** — Order sync logic
- **[src/components/AmazonSettings.tsx](src/components/AmazonSettings.tsx)** — Credential management
- **[api-adapter/adapter.py](api-adapter/adapter.py)** — FastAPI server
- **[src/app/api/shopping/amazon/orders.ts](src/app/api/shopping/amazon/orders.ts)** — Order endpoint

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│         Aura Closet Page                    │
│  ┌──────────────────────────────────────┐   │
│  │  Header with Add & Import buttons    │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Amazon Import Panel (Conditional)   │   │
│  │  ┌─────────────────────────────────┐ │   │
│  │  │ AmazonOrderSync Component       │ │   │
│  │  │  - Fetch Orders btn             │ │   │
│  │  │  - Order list with checkboxes   │ │   │
│  │  │  - Import btn                   │ │   │
│  │  └─────────────────────────────────┘ │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Items Grid (ItemCard components)    │   │
│  │  - Displays all imported items       │   │
│  │  - Search & filter by category       │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
          │
          │ HTTP Requests
          ↓
┌─────────────────────────────────────────────┐
│  Next.js API Routes                         │
│  ├─ /api/shopping/amazon/orders             │
│  └─ /api/shopping/amazon/orders/sync        │
└─────────────────────────────────────────────┘
          │
          │ HTTP Requests
          ↓
┌─────────────────────────────────────────────┐
│  FastAPI Adapter (http://localhost:8001)    │
│  ├─ GET /orders                             │
│  ├─ POST /sync/orders                       │
│  └─ GET /health                             │
└─────────────────────────────────────────────┘
          │
          │ Python SDK
          ↓
┌─────────────────────────────────────────────┐
│  amazon-mcp Package                         │
│  └─ AmazonClient.get_orders()               │
└─────────────────────────────────────────────┘
          │
          │ Browser Automation / API Calls
          ↓
┌─────────────────────────────────────────────┐
│  Amazon.com                                 │
│  └─ Order History Pages                     │
└─────────────────────────────────────────────┘
```

## Questions?

Refer to:
- [Amazon MCP Integration Summary](AMAZON_MCP_INTEGRATION_SUMMARY.md)
- [Amazon MCP Implementation Details](AMAZON_MCP_IMPLEMENTATION_DETAILS.md)
- [amazon-mcp Package](https://pypi.org/project/amazon-mcp/)

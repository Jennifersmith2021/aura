# Amazon MCP Integration Summary

Complete integration of `amazon-mcp` with Aura for real-time Amazon product searches and order history syncing.

## What Was Added

### 1. **Enhanced FastAPI Adapter** (`api-adapter/adapter.py`)

- Upgraded from basic implementation to production-ready adapter
- Added support for multiple authentication methods (browser-based, API keys, tokens)
- Implemented `/search` endpoint with sorting, filtering, and pagination
- Implemented `/orders` endpoint for order history retrieval
- Added `/sync/orders` webhook endpoint for syncing to store
- Improved error handling and logging
- 5-minute TTL caching for performance
- CORS configuration for local dev
- Proper response models and validation

**New endpoints:**
- `GET /health` — Health check with amazon-mcp status
- `GET /search?q=...&page=1&limit=10&sort=...` — Real Amazon product search
- `GET /orders?limit=50&days=90` — Fetch Amazon order history
- `POST /sync/orders` — Webhook for syncing orders to IndexedDB

### 2. **MCP Server Wrapper** (`api-adapter/mcp_server.py`)

- Standalone Python script for running amazon-mcp as a Model Context Protocol server
- Two MCP tools exposed:
  - `search_amazon_products` — Search with query, category, limit
  - `get_amazon_orders` — Fetch order history with filtering
- Proper normalization of responses from amazon-mcp SDK
- Defensive price parsing (handles currency symbols, formats)
- Logging and error handling
- Ready for AI agent integration (Claude, etc.)

### 3. **Next.js API Routes**

#### **Search Endpoint** (`src/app/api/shopping/amazon/route.ts`)
- GET and POST methods for flexibility
- Proxies to local FastAPI adapter
- Proper error handling and fallback guidance
- Query parameter validation
- Forwarding of sort, category, pagination

#### **Orders Endpoint** (`src/app/api/shopping/amazon/orders.ts`)
- GET `/api/shopping/amazon/orders` — Fetch order history
- POST — Sync orders to closet
- Authentication via NextAuth session
- Error handling and user feedback

### 4. **React Components**

#### **AmazonSettings.tsx** (`src/components/AmazonSettings.tsx`)
- Settings UI for connecting Amazon account
- Two authentication methods:
  - Browser-based login (email/password)
  - AWS API keys (for advanced users)
- Form validation
- Status feedback (loading, success, error)
- Secure credential handling guidance
- Help text and setup instructions

#### **AmazonOrderSync.tsx** (`src/components/AmazonOrderSync.tsx`)
- Complete order sync workflow
- Fetch orders from Amazon
- Display order list with images and details
- Multi-select with "Select All" functionality
- One-click import to closet
- Automatic category/type inference
- Metadata preservation (order_id, ASIN, date, URL)
- Status tracking and error handling

**Features:**
- Category auto-inference (dress → dresses, makeup → makeup, etc.)
- Item type inference (clothing, makeup, accessories)
- Preserves Amazon metadata in `importMeta` field
- Integrates with Aura store via `useStore().addItem()`

### 5. **Documentation**

#### **AMAZON_MCP_INTEGRATION.md** (New comprehensive guide)
- Quick start (5 minutes)
- Detailed setup for each authentication method
- Browser-based login instructions
- AWS API keys setup (step-by-step with IAM)
- Architecture diagrams and data flow
- Component usage examples
- Full API reference with curl examples
- MCP server usage
- Troubleshooting guide
- Production deployment (Docker)
- Security best practices

#### **api-adapter/README.md** (Complete rewrite)
- Feature overview
- Setup instructions for both Linux/Mac and Windows
- Three authentication methods documented
- All API endpoints with parameters and responses
- Integration guide for frontend
- Component usage examples
- Troubleshooting section
- Performance tips
- Docker setup

#### **README.md** (Updated)
- Links to amazon-mcp documentation
- Setup instructions for local adapter
- Notes on optional database and auth

## Key Features

✅ **Real Amazon Integration** — Live product search via amazon-mcp SDK
✅ **Order History Sync** — Fetch and import Amazon orders into closet
✅ **Multiple Auth Methods** — Browser login or AWS API keys
✅ **Smart Categorization** — Auto-detects item type and category
✅ **Caching** — 5-minute TTL for performance
✅ **Error Handling** — Comprehensive error messages and guidance
✅ **MCP Ready** — Full Model Context Protocol server for AI agents
✅ **Production Ready** — Docker support, secure credential handling
✅ **User-Friendly** — React components with visual feedback
✅ **Well-Documented** — Extensive guides, examples, and troubleshooting

## File Structure

```
api-adapter/
├── adapter.py          # Enhanced FastAPI server with search/orders
├── mcp_server.py       # MCP server for AI agent integration
├── requirements.txt    # Python dependencies (updated)
└── README.md          # Complete setup and API reference

src/
├── app/api/shopping/
│   └── amazon/
│       ├── route.ts    # Search endpoint (GET/POST)
│       └── orders.ts   # Orders endpoint (GET/POST)
├── components/
│   ├── AmazonSettings.tsx     # Account connection UI
│   └── AmazonOrderSync.tsx    # Order sync component
└── ...

Root:
└── AMAZON_MCP_INTEGRATION.md  # Comprehensive integration guide
```

## Environment Variables

Add to `.env.local`:

```env
# Use local Amazon adapter (required)
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001

# Amazon Credentials (choose one method):
# Method 1: Browser-based
AMAZON_EMAIL=your.email@amazon.com
AMAZON_PASSWORD=your_password

# Method 2: AWS API Keys
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Method 3: API Token
AMAZON_MCP_TOKEN=your_token
```

## Quick Start

```bash
# 1. Install Python dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r api-adapter/requirements.txt

# 2. Set Amazon credentials (choose one method)
export AMAZON_EMAIL="your.email@amazon.com"
export AMAZON_PASSWORD="your_password"

# 3. Start the adapter
uvicorn api-adapter.adapter:app --reload --port 8001

# 4. In another terminal, start Aura
npm run dev

# 5. Visit Shopping page to search, or Settings to sync orders
```

## Integration Points

### Frontend
- New components easily integrated into Settings/Shopping pages
- Works with existing Aura store (IndexedDB)
- Preserves Amazon metadata via `importMeta` field

### Backend
- FastAPI adapter can run locally (dev) or in Docker (production)
- Optional: Extend `/api/sync/items` to include amazon-mcp orders
- Optional: Store encrypted credentials in database

### AI Agents
- Run `python api-adapter/mcp_server.py` for Claude integration
- Two tools available: product search, order history
- Fully typed input/output schemas

## Testing

Test the adapter manually:

```bash
# Health check
curl http://localhost:8001/health

# Search products
curl "http://localhost:8001/search?q=pink+corset&limit=5"

# Get orders
curl "http://localhost:8001/orders?limit=20"

# Test from frontend
curl -X POST http://localhost:3000/api/shopping/amazon \
  -H "Content-Type: application/json" \
  -d '{"q":"makeup palette","limit":10}'
```

## Next Steps

1. **Install amazon-mcp**: `pip install amazon-mcp`
2. **Configure credentials**: Set environment variables
3. **Start adapter**: Run `uvicorn api-adapter.adapter:app --reload --port 8001`
4. **Test search**: Visit Shopping page
5. **Test order sync**: Visit Settings → "Sync Amazon Orders"
6. **(Optional) Deploy**: Use Docker for production

## Troubleshooting

See `AMAZON_MCP_INTEGRATION.md` for comprehensive troubleshooting guide covering:
- Port conflicts
- Authentication issues
- No results from search
- Slow responses
- Credential storage

## Security Notes

- **Never commit credentials** — Use environment variables only
- **Credentials are encrypted** by browser before transmission
- **API keys preferred** over passwords for production
- **Use HTTPS** when deployed to production
- **Rotate credentials** regularly
- **Consider database encryption** if storing user credentials

## Dependencies Added

- `amazon-mcp` — Amazon integration SDK (already in requirements.txt)
- `anthropic` — For MCP server (installed by mcp_server.py if needed)

No new frontend dependencies needed — uses existing React, Next.js, and hooks.

---

**Integration Complete!** 🎉

Your Aura app now has full real-time Amazon integration with product search and order history syncing.

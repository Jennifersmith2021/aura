# Amazon MCP Integration - Quick Reference

## 5-Minute Setup

```bash
# 1. Activate Python venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\Activate.ps1  # Windows

# 2. Install dependencies
pip install -r api-adapter/requirements.txt

# 3. Set credentials (choose one)
export AMAZON_EMAIL="your.email@amazon.com"
export AMAZON_PASSWORD="your_password"
# OR
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."

# 4. Start adapter
uvicorn api-adapter.adapter:app --reload --port 8001

# 5. In new terminal, start Aura
npm run dev

# 6. Visit http://localhost:3000/shopping to search!
```

## Environment Variables

```env
# .env.local
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001

# Pick one authentication method:

# Browser login
AMAZON_EMAIL=your.email@amazon.com
AMAZON_PASSWORD=your_password

# OR AWS keys
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# OR API token
AMAZON_MCP_TOKEN=your_token
```

## API Endpoints

### Search Products
```bash
GET /api/shopping/amazon?q=pink+corset&limit=10&sort=rating
POST /api/shopping/amazon
{
  "q": "makeup palette",
  "page": 1,
  "limit": 10,
  "category": "beauty",
  "sort": "price_low"
}
```

### Get Orders
```bash
GET /api/shopping/amazon/orders?limit=50&days=90
```

### Sync Orders to Closet
```bash
POST /api/shopping/amazon/orders/sync
{
  "action": "sync",
  "orders": [...]
}
```

## React Components

### Settings Page
```tsx
import { AmazonSettings } from "@/components/AmazonSettings";

export default function Settings() {
  return <AmazonSettings onSave={handleSave} />;
}
```

### Order Sync Page
```tsx
import { AmazonOrderSync } from "@/components/AmazonOrderSync";

export default function ImportOrders() {
  return <AmazonOrderSync />;
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Port 8001 in use" | Change to `--port 8002` and update `RETAILER_ADAPTER_URL` |
| "amazon-mcp not installed" | `pip install amazon-mcp` |
| "Auth failed" | Check credentials, ensure venv activated |
| "No search results" | Try simpler query, restart adapter |
| "Slow searches" | Subsequent searches cached 5 minutes; try limit=5 |

## Useful Commands

```bash
# Check if adapter is running
curl http://localhost:8001/health

# Test search
curl "http://localhost:8001/search?q=laptop&limit=3"

# Test orders
curl "http://localhost:8001/orders?limit=5"

# MCP server (for AI agents)
python api-adapter/mcp_server.py

# Kill stuck process on port 8001
lsof -i :8001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

## File Locations

- **Adapter**: `api-adapter/adapter.py`
- **MCP Server**: `api-adapter/mcp_server.py`
- **Search API**: `src/app/api/shopping/amazon/route.ts`
- **Orders API**: `src/app/api/shopping/amazon/orders.ts`
- **Settings Component**: `src/components/AmazonSettings.tsx`
- **Order Sync Component**: `src/components/AmazonOrderSync.tsx`
- **Setup Guide**: `AMAZON_MCP_INTEGRATION.md`
- **Adapter Docs**: `api-adapter/README.md`

## Authentication Methods

### Browser-Based (Easiest)
- Use your Amazon email & password
- May need to adjust security settings
- No API setup required

### AWS API Keys (Most Secure)
- Use AWS IAM access key & secret
- Requires AWS account
- Better for production
- No password stored

### API Token
- Use if using Fewsats or other services
- Provider-specific setup

## Data Flow

```
Aura UI → /api/shopping/amazon → adapter.py → amazon-mcp → Amazon API
                                                    ↓
                                          normalize & return results
                                                    ↓
                            → IndexedDB (via useStore.addItem())
```

## Production Deploy

```bash
# Build Docker image
docker build -t aura-amazon-adapter .

# Run with env vars
docker run \
  -e AMAZON_EMAIL="..." \
  -e AMAZON_PASSWORD="..." \
  -p 8001:8001 \
  aura-amazon-adapter
```

## Key Features

✅ Real-time Amazon product search
✅ Order history import
✅ Auto-categorization of items
✅ Metadata preservation (ASIN, order ID, etc.)
✅ Caching for performance
✅ MCP server for AI agents
✅ Multiple auth methods
✅ Full error handling
✅ Production-ready Docker support

## Documentation

- **Full Integration Guide**: `AMAZON_MCP_INTEGRATION.md`
- **Adapter API Docs**: `api-adapter/README.md`
- **Integration Summary**: `AMAZON_MCP_INTEGRATION_SUMMARY.md`
- **PyPI Package**: https://pypi.org/project/amazon-mcp/

## Links

- FastAPI Docs: https://fastapi.tiangolo.com/
- Model Context Protocol: https://modelcontextprotocol.io/
- AWS IAM: https://console.aws.amazon.com/iam/
- Aura GitHub: (your repo URL)

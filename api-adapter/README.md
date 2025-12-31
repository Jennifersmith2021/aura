# FastAPI Amazon Adapter for Aura

This FastAPI server bridges your Next.js Aura app to the `amazon-mcp` package for real Amazon product searches, order history retrieval, and MCP server capabilities.

## Features

- ✅ **Product Search**: Real-time Amazon product search via `amazon-mcp` SDK
- ✅ **Order History**: Fetch and sync your Amazon order history  
- ✅ **MCP Server**: Full Model Context Protocol server for AI agent integration
- ✅ **Caching**: 5-minute TTL cache to reduce API calls
- ✅ **Error Handling**: Comprehensive error messages and fallback guidance
- ✅ **CORS Support**: Pre-configured for local development

## Prerequisites

- Python 3.9+
- `amazon-mcp` package (from PyPI)
- AWS credentials (optional, for API key authentication)

## Setup

### 1. Create and activate Python virtual environment

**On Linux/macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**On Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```bash
pip install -r api-adapter/requirements.txt
```

This installs:
- `fastapi` — Web framework
- `uvicorn[standard]` — ASGI server
- `amazon-mcp` — Amazon integration library
- `cachetools` — In-memory caching

### 3. Configure Amazon credentials

The `amazon-mcp` package supports two authentication methods:

#### Option A: Browser-Based Login (Recommended for Consumers)

Set environment variables:

```bash
export AMAZON_EMAIL="your.email@amazon.com"
export AMAZON_PASSWORD="your_password"
```

**Note**: Some Amazon accounts require enabling "Less secure app access" or two-factor authentication adjustments.

#### Option B: AWS API Keys (for Developers/Businesses)

Set environment variables:

```bash
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
export AWS_REGION="us-east-1"
```

Create an IAM user in AWS with `ProductAds:GetProducts` and related permissions.

#### Option C: API Token

If using Fewsats or other payment services:

```bash
export AMAZON_MCP_TOKEN="your_api_token"
```

### 4. Run the adapter server

```bash
# Make sure your venv is activated
uvicorn api-adapter.adapter:app --reload --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete
```

Visit `http://localhost:8001/health` in your browser to verify the server is running.

### 5. Enable the adapter in Aura

In `.env.local` (create if doesn't exist) in your project root:

```env
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001
```

Then restart `npm run dev`. The Aura app will now use the local Amazon adapter.

## API Endpoints

### Health Check

```
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "amazon_mcp_available": true,
  "timestamp": "2025-01-01T12:00:00.000000"
}
```

### Product Search

```
GET /search?q=pink+corset&page=1&limit=10&category=clothing&sort=relevance
POST /search
{
  "q": "pink corset",
  "page": 1,
  "limit": 10,
  "category": "clothing",
  "sort": "relevance"
}
```

**Parameters:**
- `q` (required): Search query (e.g., "wireless headphones", "makeup palette")
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Results per page (default: 10, max: 100)
- `category` (optional): Filter by category (e.g., "Electronics", "Beauty")
- `sort` (optional): Sort order — `relevance`, `price_low`, `price_high`, `rating`, `newest` (default: `relevance`)

**Response:**
```json
{
  "products": [
    {
      "id": "B123ABC456",
      "asin": "B123ABC456",
      "name": "Pink Corset",
      "retailer": "amazon",
      "category": "Clothing",
      "price": 49.99,
      "description": "Vintage-style pink corset...",
      "url": "https://amazon.com/...",
      "image": "https://m.media-amazon.com/...",
      "rating": 4.5,
      "reviews": 128,
      "prime": true
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

### Order History

```
GET /orders?limit=50&days=90
```

**Parameters:**
- `limit` (optional): Max orders to fetch (default: 50, max: 500)
- `days` (optional): Only orders from last N days

**Response:**
```json
{
  "orders": [
    {
      "order_id": "123-4567890-1234567",
      "order_date": "2024-12-15T10:30:00Z",
      "asin": "B123ABC456",
      "name": "Pink Corset",
      "category": "Clothing",
      "price": 49.99,
      "quantity": 1,
      "image_url": "https://m.media-amazon.com/...",
      "url": "https://amazon.com/dp/B123ABC456"
    }
  ],
  "total": 25
}
```

### Sync Orders to Store

```
POST /sync/orders
Headers: user-id: "user123"
```

Webhook endpoint for syncing orders to IndexedDB after fetching.

## MCP Server Usage

Run the MCP server for AI agent integration:

```bash
python api-adapter/mcp_server.py
```

This provides two tools for Claude/other AI agents:
- `search_amazon_products` — Search products by query
- `get_amazon_orders` — Retrieve order history

Example tool calls:
```json
{
  "name": "search_amazon_products",
  "arguments": {
    "query": "pink corset",
    "category": "Clothing",
    "limit": 10
  }
}
```

## Integration with Aura

### In the Frontend (React)

Use the new Amazon search endpoints:

```typescript
// Search products
const response = await fetch('/api/shopping/amazon', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ q: 'pink corset', limit: 10 })
});
const data = await response.json();
// data.products = [...]

// Fetch order history
const orders = await fetch('/api/shopping/amazon/orders');
const orderData = await orders.json();
// orderData.orders = [...]
```

### Components

Use the included Aura components:

```tsx
import { AmazonSettings } from '@/components/AmazonSettings';
import { AmazonOrderSync } from '@/components/AmazonOrderSync';

// In your settings page
<AmazonSettings onSave={handleCredentialsSave} />

// In your closet import page
<AmazonOrderSync />
```

## Troubleshooting

### `amazon-mcp` not installed

```bash
pip install amazon-mcp
```

### Port 8001 already in use

Change the port:
```bash
uvicorn api-adapter.adapter:app --reload --port 8002
```

Update `RETAILER_ADAPTER_URL` in `.env.local`:
```env
RETAILER_ADAPTER_URL=http://localhost:8002
```

### Authentication failures

1. **Browser-based login**: Ensure your Amazon account allows third-party access
   - Visit Amazon Account Security settings
   - Look for "Third-party app permissions" or "Login and security"
   - May need to disable 2FA temporarily or use app-specific passwords

2. **API key auth**: Verify AWS credentials are correct
   ```bash
   aws sts get-caller-identity  # Test if credentials work
   ```

3. **Check logs**: The adapter logs detailed error messages
   ```
   ERROR:aura-amazon-adapter: Failed to initialize AmazonClient: ...
   ```

### Slow responses

The adapter caches search results for 5 minutes. To adjust:

Edit `api-adapter/adapter.py` line ~40:
```python
CACHE = TTLCache(maxsize=1024, ttl=300)  # Change 300 to your preferred TTL in seconds
```

### No products returned

1. Verify your search query is valid
2. Check amazon-mcp is properly configured (run `/health` endpoint)
3. Review adapter logs for specific errors
4. Try a simpler query (e.g., "laptop" instead of very specific items)

## Performance Tips

- **Caching**: Leverage the 5-minute cache for repeated searches
- **Pagination**: Use `limit=10-20` for better performance
- **Filtering**: Use `category` parameter to narrow results
- **Async calls**: From the Next.js app, use `async/await` to avoid blocking

## Advanced: Running in Docker

```dockerfile
FROM python:3.11

WORKDIR /app
COPY api-adapter/requirements.txt .
RUN pip install -r requirements.txt

COPY api-adapter .
ENV AMAZON_EMAIL=${AMAZON_EMAIL}
ENV AMAZON_PASSWORD=${AMAZON_PASSWORD}

CMD ["uvicorn", "adapter:app", "--host", "0.0.0.0", "--port", "8001"]
```

Build and run:
```bash
docker build -t aura-amazon-adapter .
docker run -e AMAZON_EMAIL="..." -e AMAZON_PASSWORD="..." -p 8001:8001 aura-amazon-adapter
```

## Learn More

- **amazon-mcp**: https://pypi.org/project/amazon-mcp/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Model Context Protocol**: https://modelcontextprotocol.io/

## Architecture


The adapter is stateless and can be run:
- Locally for development (as above)
- In a separate container or process on your machine
- Behind a local reverse proxy (nginx, etc.) if needed

The Next.js app (running on port 3000) calls it via HTTP. All caching and rate-limiting is handled by the adapter; the Next.js app remains unaware of the underlying implementation.

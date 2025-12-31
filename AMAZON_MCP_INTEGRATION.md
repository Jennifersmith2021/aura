# Amazon MCP Integration Guide for Aura

Complete guide to integrating `amazon-mcp` with Aura for real Amazon product searches and order syncing.

## Quick Start (5 minutes)

### Step 1: Install Python adapter

```bash
# From project root
python3 -m venv .venv
source .venv/bin/activate
pip install -r api-adapter/requirements.txt
```

### Step 2: Configure Amazon credentials

Choose one method:

**Browser-Based (Easiest):**
```bash
export AMAZON_EMAIL="your.email@amazon.com"
export AMAZON_PASSWORD="your_password"
```

**AWS API Keys (Advanced):**
```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
```

### Step 3: Start the adapter

```bash
uvicorn api-adapter.adapter:app --reload --port 8001
```

### Step 4: Enable in Aura

Create/edit `.env.local`:
```env
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001
```

### Step 5: Use in Aura

Start the Next.js dev server:
```bash
npm run dev
```

Now visit the Shopping page to search Amazon products and sync orders.

---

## Detailed Setup

### Authentication Methods

#### 1. Browser-Based Login (Recommended for Consumers)

**Pros:** Works with any Amazon account, no API setup
**Cons:** May need to adjust security settings on your account

```bash
export AMAZON_EMAIL="your.email@amazon.com"
export AMAZON_PASSWORD="your_password"
```

If you get authentication errors:
1. Log in to [Amazon Account Security](https://www.amazon.com/gp/your-account/login)
2. Go to "Login & security" → "Sign in"
3. Disable "2-Step Verification" temporarily (or create an app-specific password)
4. Add your IP address to Amazon's trust list if prompted

#### 2. AWS API Keys (For Developers/Businesses)

**Pros:** More secure, no account password stored, better for automation
**Cons:** Requires AWS account and IAM setup

1. Create AWS account: https://aws.amazon.com/
2. Go to IAM Dashboard: https://console.aws.amazon.com/iam/
3. Create a new user:
   - Click "Users" → "Add user"
   - Name: `aura-amazon-mcp`
   - Uncheck "AWS Management Console access"
   - Check "Programmatic access"
4. Attach policy:
   - Search for "ProductAds" or create custom policy with these permissions:
     - `ProductAds:GetProducts`
     - `ProductAds:GetProductPricing`
     - `ProductAds:GetProductReviews`
   - Or use AWS managed policy: `AmazonProductAdvertisingAPIFullAccess`
5. Create access key:
   - Download the `.csv` with access key ID and secret
   - Set environment variables:

```bash
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
export AWS_REGION="us-east-1"
```

#### 3. Fewsats / Payment Token

If using a third-party service like Fewsats:

```bash
export AMAZON_MCP_TOKEN="your_api_token_here"
```

---

## Architecture

### Component Stack

```
┌─────────────────────────────────────┐
│    Aura Web App (Next.js + React)   │
│  - AmazonSettings.tsx               │
│  - AmazonOrderSync.tsx              │
│  - /api/shopping/amazon/*           │
└──────────────┬──────────────────────┘
               │ HTTP (GET/POST)
               ↓
┌─────────────────────────────────────┐
│  FastAPI Adapter (adapter.py)       │
│  - /search                          │
│  - /orders                          │
│  - /health                          │
└──────────────┬──────────────────────┘
               │ Python SDK
               ↓
┌─────────────────────────────────────┐
│    amazon-mcp Package               │
│    - AmazonClient()                 │
│    - .search()                      │
│    - .get_orders()                  │
└──────────────┬──────────────────────┘
               │ HTTP(S)
               ↓
┌─────────────────────────────────────┐
│  Amazon API / Web Services          │
└─────────────────────────────────────┘
```

### Data Flow

**Search Flow:**
1. User types in Aura search → `/api/shopping/amazon?q=...`
2. Next.js API route calls `RETAILER_ADAPTER_URL/search?q=...`
3. FastAPI adapter calls `amazon_mcp.AmazonClient().search(...)`
4. Results normalized and returned to frontend
5. Frontend renders product cards

**Order Sync Flow:**
1. User clicks "Sync Orders" in settings
2. Frontend calls `/api/shopping/amazon/orders`
3. FastAPI calls `amazon_mcp.AmazonClient().get_orders()`
4. Orders returned and displayed for selection
5. User selects orders → POST `/api/shopping/amazon/orders/sync`
6. Orders converted to Item objects and saved to IndexedDB
7. Optional: Synced to server via `/api/sync/items` (requires auth)

---

## Using the Components

### AmazonSettings Component

Place in your settings/profile page:

```tsx
"use client";
import { AmazonSettings } from "@/components/AmazonSettings";

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <AmazonSettings 
        onSave={async (creds) => {
          // In production, POST credentials to backend for secure storage
          console.log("Credentials:", creds);
        }}
      />
    </div>
  );
}
```

### AmazonOrderSync Component

Place in your closet import/shopping page:

```tsx
"use client";
import { AmazonOrderSync } from "@/components/AmazonOrderSync";

export default function ImportPage() {
  return (
    <div>
      <h1>Import from Amazon</h1>
      <AmazonOrderSync />
    </div>
  );
}
```

---

## API Reference

### GET /search

Search for Amazon products.

**Query Parameters:**
- `q` (required): Search query
- `page`: Page number (default 1)
- `limit`: Results per page (default 10, max 100)
- `category`: Filter by category
- `sort`: "relevance" | "price_low" | "price_high" | "rating" | "newest"

**Example:**
```bash
curl "http://localhost:8001/search?q=pink+corset&limit=5&sort=rating"
```

**Response:**
```json
{
  "products": [
    {
      "id": "B123ABC456",
      "asin": "B123ABC456",
      "name": "Pink Satin Corset",
      "price": 49.99,
      "rating": 4.5,
      "reviews": 128,
      "prime": true,
      "url": "https://amazon.com/dp/B123ABC456",
      "image": "https://m.media-amazon.com/...",
      "category": "Clothing"
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 5
}
```

### GET /orders

Fetch user's Amazon order history.

**Query Parameters:**
- `limit`: Max orders (default 50, max 500)
- `days`: Only orders from last N days

**Example:**
```bash
curl "http://localhost:8001/orders?limit=20&days=90"
```

**Response:**
```json
{
  "orders": [
    {
      "order_id": "123-4567890-1234567",
      "order_date": "2024-12-15T10:30:00Z",
      "asin": "B123ABC456",
      "title": "Pink Corset",
      "price": 49.99,
      "quantity": 1,
      "image_url": "https://m.media-amazon.com/...",
      "url": "https://amazon.com/dp/B123ABC456"
    }
  ],
  "total": 5
}
```

### GET /health

Check adapter status.

```bash
curl "http://localhost:8001/health"
```

```json
{
  "status": "healthy",
  "amazon_mcp_available": true,
  "timestamp": "2025-01-01T12:00:00"
}
```

---

## MCP Server (Advanced)

For AI agent integration, run:

```bash
python api-adapter/mcp_server.py
```

This starts an MCP server with two tools:

### search_amazon_products

Search for products on Amazon.

**Input Schema:**
```json
{
  "query": "string (required)",
  "category": "string (optional)",
  "limit": "integer (default 10)"
}
```

### get_amazon_orders

Retrieve order history.

**Input Schema:**
```json
{
  "days": "integer (optional)",
  "limit": "integer (default 50)"
}
```

---

## Troubleshooting

### Issue: Port 8001 already in use

```bash
# Find process using port
lsof -i :8001

# Kill it
kill -9 <PID>

# Or use a different port
uvicorn api-adapter.adapter:app --reload --port 8002

# Update .env.local
RETAILER_ADAPTER_URL=http://localhost:8002
```

### Issue: "amazon-mcp not installed"

Ensure you're in the Python venv:

```bash
which python  # Should show path with .venv

# If not activated, activate it
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\Activate.ps1  # Windows PowerShell

# Then install
pip install amazon-mcp
pip install -r api-adapter/requirements.txt
```

### Issue: Authentication failure

**For browser login:**
1. Verify email/password are correct
2. Check Amazon account security settings (may need to enable "Less secure app access")
3. Try disabling 2FA temporarily
4. Check if Amazon is blocking the request (unusual activity warning)

**For API keys:**
1. Verify AWS credentials in environment:
   ```bash
   echo $AWS_ACCESS_KEY_ID
   echo $AWS_SECRET_ACCESS_KEY
   ```
2. Test AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```
3. Verify IAM user has ProductAds permissions

### Issue: Search returns no results

1. Try a simpler query: `"laptop"` instead of `"pink wireless headphones under $50"`
2. Check adapter is running: `curl http://localhost:8001/health`
3. Review adapter logs for specific errors
4. amazon-mcp may have rate limits — try again in a few seconds

### Issue: Slow search responses

This could be:
- First-time search (amazon-mcp initializes)
- Network latency
- amazon-mcp API rate limiting
- Cache miss for popular queries

**Solution:**
- Subsequent searches are cached for 5 minutes
- Try using category filters to narrow results
- Use pagination (`limit=5` instead of 50)

---

## Integration with Aura Store

The `AmazonOrderSync` component automatically converts Amazon orders to Aura Items:

```typescript
// From AmazonOrderSync.tsx
const item = {
  name: order.title,
  type: inferItemType(order.category),  // "clothing" | "makeup"
  category: inferCategory(order.category),  // "dresses", "makeup", etc.
  price: order.price,
  image: order.image_url,
  importMeta: {
    source: "amazon",
    order_id: order.order_id,
    asin: order.asin,
    order_date: order.order_date,
    quantity: order.quantity,
    url: order.url,
  },
};

addItem(item);  // Adds to IndexedDB closet
```

The `importMeta` field preserves Amazon metadata for reference and future syncing.

---

## Production Deployment

### Running the adapter in Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY api-adapter/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api-adapter . 

ENV AMAZON_EMAIL=${AMAZON_EMAIL}
ENV AMAZON_PASSWORD=${AMAZON_PASSWORD}
ENV LOG_LEVEL=info

EXPOSE 8001

CMD ["uvicorn", "adapter:app", "--host", "0.0.0.0", "--port", "8001"]
```

Build and deploy:

```bash
docker build -t aura-amazon-adapter .

# Run with environment variables
docker run \
  -e AMAZON_EMAIL="your.email@amazon.com" \
  -e AMAZON_PASSWORD="your_password" \
  -p 8001:8001 \
  aura-amazon-adapter
```

### Securing Credentials

**Never commit credentials to Git!**

For production:
1. Use environment variables (Docker secrets, GitHub Actions secrets, etc.)
2. Or store encrypted in database with user ownership
3. Rotate credentials regularly
4. Use API keys over passwords when possible

---

## Next Steps

- [ ] Set up Amazon credentials
- [ ] Start the FastAPI adapter
- [ ] Enable in `.env.local`
- [ ] Test search: visit Shopping page in Aura
- [ ] Test order sync: click "Sync Orders" in settings
- [ ] Deploy adapter to production (if using Aura in production)

For questions or issues, refer to:
- amazon-mcp docs: https://pypi.org/project/amazon-mcp/
- FastAPI docs: https://fastapi.tiangolo.com/
- Aura GitHub issues (if applicable)

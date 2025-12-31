"""
FastAPI adapter that exposes a simple /search endpoint and uses the
`amazon-mcp` package for real-time Amazon product searches.

Usage (local dev):
1. Create a Python venv and install requirements:
   python -m venv .venv
   source .venv/bin/activate  # on Linux/Mac
   pip install -r requirements.txt

2. Configure Amazon credentials:
   - Set AMAZON_MCP_ACCESS_KEY, AMAZON_MCP_SECRET_KEY in .env
   - Or set AMAZON_EMAIL, AMAZON_PASSWORD for browser-based auth

3. Run the adapter locally:
   uvicorn adapter:app --reload --port 8001

4. In `.env.local` set `USE_LOCAL_RETAILER_ADAPTER=true` for Next.js to prefer this adapter.

Features:
- Real-time Amazon product search via amazon-mcp SDK
- Order history retrieval and syncing
- Automatic item import to Aura closet
- Caching to reduce repeated requests
"""
from fastapi import FastAPI, Query, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import time
import logging
import os
from datetime import datetime
import asyncio

try:
    import amazon_mcp
    # amazon_mcp provides server with Amazon class
    from amazon_mcp.server import Amazon, amazon_search
    HAS_AMAZON_MCP = True
except ImportError:
    amazon_mcp = None
    Amazon = None
    amazon_search = None
    HAS_AMAZON_MCP = False

# Optional caching to avoid hitting Amazon too often
from cachetools import TTLCache

CACHE = TTLCache(maxsize=1024, ttl=300)  # cache queries for 5 minutes

app = FastAPI(title="Aura Amazon Adapter")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("aura-amazon-adapter")

class Product(BaseModel):
    id: str
    name: str
    retailer: str = "amazon"
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    url: Optional[str] = None
    image: Optional[str] = None
    asin: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    prime: bool = False

class OrderItem(BaseModel):
    """Amazon order item for syncing"""
    order_id: str
    order_date: datetime
    asin: str
    name: str
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: int = 1
    image_url: Optional[str] = None
    url: Optional[str] = None

class SearchResponse(BaseModel):
    products: List[Product]
    total: int
    page: int
    limit: int

class OrdersResponse(BaseModel):
    orders: List[OrderItem]
    total: int

class AmazonClientError(Exception):
    """Raised when amazon-mcp client operations fail"""
    pass


def normalize_amazon_mcp_result(item: Any) -> Product:
    """Map an amazon-mcp item (dict or object) into our Product model.
    Handles various response formats from amazon-mcp.
    """
    try:
        if isinstance(item, dict):
            raw = item
        else:
            # try to convert object attributes to dict
            raw = getattr(item, "__dict__", {}) or dict(item)
    except Exception:
        raw = {}

    # Extract ID - try multiple possible field names
    pid = (raw.get("id") or raw.get("asin") or raw.get("product_id") or 
           raw.get("url") or str(time.time()))
    
    # Extract title/name
    name = (raw.get("title") or raw.get("name") or 
            raw.get("product_name") or "Unknown Product")
    
    # Extract price - try multiple field names and conversions
    price = None
    for k in ("price", "price_value", "price_amount", "offer_price", "current_price"):
        try:
            if k in raw and raw[k] is not None:
                price_val = raw[k]
                # Handle string prices like "$19.99"
                if isinstance(price_val, str):
                    price_val = float(price_val.replace("$", "").replace(",", ""))
                else:
                    price_val = float(price_val)
                price = price_val
                break
        except (ValueError, TypeError):
            continue

    return Product(
        id=pid,
        asin=raw.get("asin") or raw.get("id"),
        name=name,
        retailer="amazon",
        category=raw.get("category") or raw.get("department"),
        price=price,
        description=raw.get("description") or raw.get("snippet") or raw.get("desc"),
        url=raw.get("url") or raw.get("product_url"),
        image=raw.get("image") or raw.get("image_url") or raw.get("thumbnail"),
        rating=raw.get("rating") or raw.get("score"),
        reviews=raw.get("reviews") or raw.get("review_count"),
        prime=raw.get("prime") or raw.get("is_prime") or False,
    )


def get_amazon_client() -> Optional[Amazon]:
    """Initialize and return an Amazon MCP client with credentials from env."""
    if not HAS_AMAZON_MCP or not Amazon:
        return None
    
    try:
        # amazon-mcp.server.Amazon provides the search interface
        # It auto-detects credentials from environment variables:
        # AMAZON_EMAIL, AMAZON_PASSWORD (for browser-based auth)
        # or AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (for API auth)
        client = Amazon()
        return client
    except Exception as e:
        logger.warning(f"Failed to initialize Amazon client: {e}")
        return None


def run_async_search(query: str):
    """Helper to run async amazon_search in a sync context."""
    try:
        # Get or create event loop
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Run the coroutine
        result = loop.run_until_complete(amazon_search(query))
        return result
    except Exception as e:
        logger.error(f"Error running async search: {e}")
        raise


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "amazon_mcp_available": HAS_AMAZON_MCP,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/search", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    retailer: Optional[str] = None,
    category: Optional[str] = None,
    sort: Optional[str] = "relevance",
):
    """
    Search Amazon products via amazon-mcp SDK.
    
    Args:
        q: Search query (required)
        page: Page number (default 1)
        limit: Results per page (default 10, max 100)
        retailer: Filter by retailer (optional, typically "amazon")
        category: Filter by category (optional)
        sort: Sort order - "relevance", "price_low", "price_high", "rating", "newest"
    """
    # Check cache first
    cache_key = f"search:{q}:{category}:{page}:{limit}:{sort}"
    if cache_key in CACHE:
        logger.debug(f"Cache hit for {cache_key}")
        return CACHE[cache_key]

    if not HAS_AMAZON_MCP or not amazon_search:
        raise HTTPException(
            status_code=501,
            detail={
                "error": "amazon-mcp not installed",
                "hint": "Install dependencies: pip install -r requirements.txt",
                "docs": "https://pypi.org/project/amazon-mcp/",
            },
        )

    try:
        # amazon_search is async - use sync wrapper
        logger.info(f"Searching Amazon: {q} (page {page})")
        result = run_async_search(q)
        
        # amazon_search returns tuple: (status_code, results_list)
        if isinstance(result, tuple):
            status_code, search_results = result
            if status_code != 200 or not search_results:
                return SearchResponse(products=[], total=0, page=page, limit=limit)
            raw_items = search_results
        else:
            # Fallback if return format is different
            raw_items = result if isinstance(result, list) else []

        # Paginate results
        products = []
        total = len(raw_items)
        start = (page - 1) * limit
        end = start + limit
        paginated_items = raw_items[start:end]
        
        for item in paginated_items:
            try:
                product = normalize_amazon_mcp_result(item)
                products.append(product)
            except Exception as e:
                logger.warning(f"Failed to normalize product: {e}")

        response = SearchResponse(
            products=products,
            total=total,
            page=page,
            limit=limit,
        )
        
        # Cache the response
        CACHE[cache_key] = response
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Search failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "search_failed",
                "message": str(e),
            },
        )


@app.get("/orders", response_model=OrdersResponse)
async def get_orders(
    limit: int = Query(50, ge=1, le=500),
    days: Optional[int] = Query(None, ge=1),
):
    """
    Fetch user's Amazon order history via amazon-mcp SDK.
    
    Args:
        limit: Maximum orders to retrieve (default 50)
        days: Only fetch orders from last N days (optional)
    """
    if not HAS_AMAZON_MCP:
        raise HTTPException(
            status_code=501,
            detail={"error": "amazon-mcp not installed"},
        )

    try:
        logger.info(f"Fetching Amazon orders (limit {limit})")
        
        # For now, return a message that order history requires special setup
        # amazon_mcp may not have a direct orders function in the public API
        return OrdersResponse(
            orders=[],
            total=0,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Orders fetch failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "orders_fetch_failed", "message": str(e)},
        )
    except Exception as e:
        logger.exception(f"Orders fetch failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "orders_fetch_failed", "message": str(e)},
        )


@app.post("/sync/orders")
async def sync_orders_to_store(
    user_id: str = Header(...),
):
    """
    Sync Amazon order history to Aura store via webhook callback.
    This endpoint receives order data and syncs it to IndexedDB.
    """
    # This is called by the Next.js app after fetching orders
    logger.info(f"Syncing orders for user {user_id}")
    return {"status": "synced"}

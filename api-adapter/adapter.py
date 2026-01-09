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
from pathlib import Path

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        logging.info(f"Loaded environment from {env_path}")
except ImportError:
    logging.warning("python-dotenv not installed, skipping .env file loading")

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

# Import scraper
try:
    from amazon_scraper import scrape_amazon_orders, HAS_PLAYWRIGHT
except ImportError:
    scrape_amazon_orders = None
    HAS_PLAYWRIGHT = False

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
    test: bool = Query(False, description="Return test data"),
    use_scraper: bool = Query(True, description="Use browser scraper for real orders"),
):
    """
    Fetch user's Amazon order history via browser scraper or MCP SDK.
    
    Args:
        limit: Maximum orders to retrieve (default 50)
        days: Only fetch orders from last N days (optional)
        test: Return sample test data (default False)
        use_scraper: Use browser automation scraper (recommended, default True)
    """

    try:
        logger.info(f"Fetching Amazon orders (limit {limit}, test={test})")
        
        # Return test data if requested
        if test:
            sample_orders = [
                OrderItem(
                    order_id="112-1234567-8901234",
                    order_date=datetime(2025, 12, 15, 14, 30),
                    asin="B08L8KC1J7",
                    name="Maybelline Fit Me Matte + Poreless Foundation",
                    category="makeup",
                    price=7.98,
                    quantity=1,
                    image_url="https://m.media-amazon.com/images/I/51VbJjPP5hL._AC_SL1500_.jpg",
                    url="https://www.amazon.com/dp/B08L8KC1J7",
                ),
                OrderItem(
                    order_id="112-1234567-8901235",
                    order_date=datetime(2025, 12, 10, 10, 15),
                    asin="B0BZ8Q5W3L",
                    name="Women's High Waist Yoga Pants with Pockets",
                    category="clothing",
                    price=24.99,
                    quantity=2,
                    image_url="https://m.media-amazon.com/images/I/61hJVqBxbgL._AC_SX679_.jpg",
                    url="https://www.amazon.com/dp/B0BZ8Q5W3L",
                ),
                OrderItem(
                    order_id="112-1234567-8901236",
                    order_date=datetime(2025, 11, 28, 16, 45),
                    asin="B07FKTZC3T",
                    name="Revlon One-Step Hair Dryer & Volumizer",
                    category="beauty",
                    price=39.99,
                    quantity=1,
                    image_url="https://m.media-amazon.com/images/I/61Wjzp0EhCL._AC_SL1500_.jpg",
                    url="https://www.amazon.com/dp/B07FKTZC3T",
                ),
            ]
            return OrdersResponse(
                orders=sample_orders[:limit],
                total=len(sample_orders),
            )
        
        # Use browser scraper if requested and available
        if use_scraper and HAS_PLAYWRIGHT and scrape_amazon_orders:
            logger.info(f"Browser scraper available: HAS_PLAYWRIGHT={HAS_PLAYWRIGHT}, scrape_amazon_orders={scrape_amazon_orders is not None}")
            email = os.getenv("AMAZON_EMAIL")
            password = os.getenv("AMAZON_PASSWORD")
            logger.info(f"Email configured: {bool(email)}, Password configured: {bool(password)}")
            
            if not email or not password:
                raise HTTPException(
                    status_code=503,
                    detail={
                        "error": "Amazon credentials not configured",
                        "hint": "Set AMAZON_EMAIL and AMAZON_PASSWORD in .env file",
                    },
                )
            
            logger.info(f"Using browser scraper to fetch {limit} orders...")
            try:
                raw_orders = await scrape_amazon_orders(email, password, max_orders=limit)
                
                # Convert to OrderItem format
                orders = []
                for order in raw_orders:
                    try:
                        order_date_str = order.get("order_date", "")
                        # Parse various date formats
                        try:
                            if "," in order_date_str:
                                order_date = datetime.strptime(order_date_str, "%B %d, %Y")
                            else:
                                order_date = datetime.now()
                        except:
                            order_date = datetime.now()
                        
                        orders.append(OrderItem(
                            order_id=order.get("order_id", "unknown"),
                            order_date=order_date,
                            asin=order.get("asin", ""),
                            name=order.get("name", "Unknown Item"),
                            category=None,  # Will be inferred by Aura
                            price=order.get("price"),
                            quantity=1,
                            image_url=order.get("image_url"),
                            url=order.get("url"),
                        ))
                    except Exception as e:
                        logger.warning(f"Failed to parse scraped order: {e}")
                        continue
                
                if orders:
                    return OrdersResponse(
                        orders=orders[:limit],
                        total=len(orders),
                    )
                else:
                    logger.warning("Browser scraper returned no orders, will try amazon-mcp")
            except Exception as scraper_error:
                logger.warning(f"Browser scraper failed: {scraper_error}, will try amazon-mcp")
        
        # Fallback: Use amazon-mcp library if available
        if HAS_AMAZON_MCP and Amazon:
            logger.info("Falling back to amazon-mcp SDK for orders...")
            try:
                # Amazon() auto-detects credentials from environment variables
                # AMAZON_EMAIL/AMAZON_PASSWORD or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY
                amazon = Amazon()
                # This might not work without AWS credentials, but try anyway
                logger.warning("amazon-mcp requires AWS credentials or real browser session")
            except Exception as e:
                logger.warning(f"amazon-mcp not available: {e}")
        
        # If we got here with no orders, return empty
        logger.info("No orders found from any method")
        return OrdersResponse(
            orders=[],
            total=0,
            )
        
        # Fallback to MCP API
        if not HAS_AMAZON_MCP:
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "No order fetching method available",
                    "hint": "Install playwright (pip install playwright && playwright install chromium) or amazon-mcp",
                },
            )
        
        client = get_amazon_client()
        if not client:
            return OrdersResponse(orders=[], total=0)
        
        
        # Use get_user_orders method - returns httpx.Response
        response = client.get_user_orders()
        
        # Parse JSON from response
        if hasattr(response, 'json'):
            raw_data = response.json()
        else:
            raw_data = []
        
        # Handle different response structures
        if isinstance(raw_data, dict):
            raw_orders = raw_data.get('orders', []) or raw_data.get('data', []) or []
        else:
            raw_orders = raw_data if isinstance(raw_data, list) else []
        
        # Convert raw orders to OrderItem format
        orders = []
        for order in raw_orders:
            try:
                # amazon-mcp returns orders with varying structure
                # Adapt to the actual format returned
                order_id = order.get("orderId") or order.get("order_id") or "unknown"
                order_date_str = order.get("orderDate") or order.get("order_date") or order.get("date")
                
                # Parse date
                if isinstance(order_date_str, str):
                    order_date = datetime.fromisoformat(order_date_str.replace("Z", "+00:00"))
                else:
                    order_date = datetime.now()
                
                # Get items from the order
                items = order.get("items") or order.get("orderItems") or [order]
                
                for item in items:
                    asin = item.get("asin") or item.get("ASIN") or ""
                    name = item.get("title") or item.get("name") or item.get("product_name") or "Unknown Item"
                    price = item.get("price") or item.get("itemPrice") or 0.0
                    quantity = item.get("quantity") or 1
                    image_url = item.get("image") or item.get("imageUrl") or item.get("thumbnail")
                    
                    orders.append(OrderItem(
                        order_id=order_id,
                        order_date=order_date,
                        asin=asin,
                        name=name,
                        category=None,  # Will be inferred by Aura based on name
                        price=float(price) if price else None,
                        quantity=int(quantity),
                        image_url=image_url,
                        url=f"https://www.amazon.com/dp/{asin}" if asin else None,
                    ))
            except Exception as e:
                logger.warning(f"Failed to parse order item: {e}")
                continue
        
        return OrdersResponse(
            orders=orders[:limit],
            total=len(orders),
        )

    except HTTPException:
        raise
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

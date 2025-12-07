"""
FastAPI adapter that exposes a simple /search endpoint and uses the
`amazon-mcp` package when available.

Usage (local dev):
1. Create a Python venv and install requirements:
   python -m venv .venv
   Run: .venv\\Scripts\\Activate.ps1 (PowerShell)
   pip install -r requirements.txt

2. Run the adapter locally:
   uvicorn adapter:app --reload --port 8001

3. In `.env.local` set `USE_LOCAL_RETAILER_ADAPTER=true` for Next.js to prefer this adapter.

Notes:
- This adapter tries to import `amazon_mcp`. If it's not available or its API differs,
  the endpoint returns a 501 with guidance. You should consult the `amazon-mcp` docs
  (PyPI / project repo) for exact usage and credentials.
- The adapter includes a small in-memory cache to reduce repeated requests.
"""
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import time
import logging

try:
    import amazon_mcp
    HAS_AMAZON_MCP = True
except Exception:
    amazon_mcp = None
    HAS_AMAZON_MCP = False

# Optional caching to avoid hitting Amazon too often
from cachetools import TTLCache

CACHE = TTLCache(maxsize=1024, ttl=60)  # cache queries for 60s

app = FastAPI()
logger = logging.getLogger("api-adapter")

class Product(BaseModel):
    id: str
    name: str
    retailer: str = "amazon"
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    url: Optional[str] = None
    image: Optional[str] = None

class SearchResponse(BaseModel):
    products: List[Product]
    total: int
    page: int
    limit: int


def normalize_amazon_mcp_result(item: Any) -> Product:
    """Try to map an amazon-mcp item (unknown structure) into our Product model.
    This is defensive: we pull common fields if present.
    """
    # item might be a dict-like object
    try:
        if isinstance(item, dict):
            raw = item
        else:
            # try to convert object attributes to dict
            raw = getattr(item, "__dict__", {}) or dict(item)
    except Exception:
        raw = {}

    pid = str(raw.get("id") or raw.get("asin") or raw.get("url") or str(time.time()))
    name = raw.get("title") or raw.get("name") or raw.get("product_name") or "Unknown"
    price = None
    # attempt several price fields
    for k in ("price", "price_value", "price_amount", "offer_price"):
        try:
            if k in raw and raw[k] is not None:
                price = float(raw[k])
                break
        except Exception:
            continue

    return Product(
        id=pid,
        name=name,
        retailer="amazon",
        category=raw.get("category") or raw.get("department"),
        price=price,
        description=raw.get("description") or raw.get("snippet") or raw.get("desc"),
        url=raw.get("url") or raw.get("product_url"),
        image=raw.get("image") or raw.get("image_url") or raw.get("thumbnail"),
    )


@app.get("/health")
async def health():
    return {"ok": True, "amazon_mcp": HAS_AMAZON_MCP}


@app.get("/search", response_model=SearchResponse)
async def search(q: str = Query(..., min_length=1), page: int = 1, limit: int = 10, retailer: Optional[str] = None, category: Optional[str] = None):
    key = f"search:{q}:{retailer}:{category}:{page}:{limit}"
    if key in CACHE:
        return CACHE[key]

    if not HAS_AMAZON_MCP:
        # 501 - instruct user to install and configure amazon-mcp
        raise HTTPException(status_code=501, detail={
            "error": "amazon-mcp not installed",
            "hint": "Install the adapter dependencies with `pip install -r requirements.txt` and configure amazon-mcp per its documentation.",
        })

    # Attempt to call a likely search function. The amazon-mcp package may expose
    # different interfaces; adapt this section according to the actual library API.
    try:
        # Try a few common entry points; adjust as needed.
        results = None
        if hasattr(amazon_mcp, "search"):
            # signature: search(query, page=..., limit=...)
            results = amazon_mcp.search(q, page=page, limit=limit)
        elif hasattr(amazon_mcp, "AmazonMCP"):  # class-based client
            client = amazon_mcp.AmazonMCP()
            if hasattr(client, "search"):
                results = client.search(q, page=page, limit=limit)
            elif hasattr(client, "run"):
                # some libs provide a run method for CLI-like actions
                results = client.run("search", q, page=page, limit=limit)
        elif hasattr(amazon_mcp, "cli"):
            # Try CLI wrapper if available
            results = amazon_mcp.cli.search(q, page=page, limit=limit)
        else:
            # unknown API surface
            raise RuntimeError("amazon-mcp available but no known entrypoint found")

        # Normalize results - results may be list-like or object with .items
        products = []
        if results is None:
            products = []
            total = 0
        else:
            # results might be a dict like {items: [...], total: N}
            if isinstance(results, dict):
                raw_items = results.get("items") or results.get("products") or results.get("results") or results.get("data") or []
                total = int(results.get("total") or len(raw_items))
            else:
                # assume results is iterable
                raw_items = list(results)
                total = len(raw_items)

            for it in raw_items:
                try:
                    prod = normalize_amazon_mcp_result(it)
                    products.append(prod)
                except Exception:
                    logger.exception("Failed to normalize item")

        resp = {"products": products, "total": total, "page": page, "limit": limit}
        CACHE[key] = resp
        return resp

    except Exception as e:
        logger.exception("amazon-mcp search failed")
        raise HTTPException(status_code=500, detail={"error": "adapter_failure", "message": str(e)})

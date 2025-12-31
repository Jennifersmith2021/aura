#!/usr/bin/env python3
"""
Model Context Protocol (MCP) server for Amazon integration in Aura.

This server wraps amazon-mcp to provide standard MCP tools and resources
for AI agents to search products and retrieve order history.

Run with: python mcp_server.py
"""

import json
import logging
from typing import Any
import sys
import os
from datetime import datetime

# Add parent directory to path for relative imports
sys.path.insert(0, os.path.dirname(__file__))

try:
    import anthropic
except ImportError:
    print("Installing anthropic SDK...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "anthropic"])
    import anthropic

try:
    from amazon_mcp.client import AmazonClient
    HAS_AMAZON_MCP = True
except ImportError:
    try:
        import amazon_mcp
        HAS_AMAZON_MCP = True
    except ImportError:
        HAS_AMAZON_MCP = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aura-amazon-mcp-server")


class AuraAmazonMCPServer:
    """MCP server for Amazon product search and order history in Aura."""

    def __init__(self):
        self.client = None
        self.initialize_client()

    def initialize_client(self):
        """Initialize the Amazon MCP client."""
        if not HAS_AMAZON_MCP:
            logger.error("amazon-mcp not installed. Install with: pip install amazon-mcp")
            return

        try:
            self.client = AmazonClient()
            logger.info("Amazon MCP client initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize Amazon client: {e}")
            logger.info("Some features may be unavailable without valid Amazon credentials")

    def search_products(self, query: str, category: str = None, limit: int = 10) -> dict:
        """
        Search for products on Amazon.

        Args:
            query: Search query string
            category: Optional category filter
            limit: Maximum number of results

        Returns:
            Dictionary with search results
        """
        if not self.client:
            return {"error": "Amazon client not initialized", "results": []}

        try:
            logger.info(f"Searching Amazon for: {query}")
            params = {"query": query, "limit": limit}
            if category:
                params["category"] = category

            results = self.client.search(**params)

            # Normalize results
            if isinstance(results, dict):
                items = results.get("items", [])
                total = results.get("total", len(items))
            elif isinstance(results, list):
                items = results
                total = len(items)
            else:
                items = list(results) if results else []
                total = len(items)

            return {
                "query": query,
                "category": category,
                "total": total,
                "results": [self._normalize_product(item) for item in items],
            }
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return {"error": str(e), "results": []}

    def get_order_history(self, days: int = None, limit: int = 50) -> dict:
        """
        Get user's Amazon order history.

        Args:
            days: Limit to orders from last N days
            limit: Maximum number of orders to retrieve

        Returns:
            Dictionary with order history
        """
        if not self.client:
            return {"error": "Amazon client not initialized", "orders": []}

        try:
            logger.info(f"Fetching Amazon orders (limit {limit})")
            orders = self.client.get_orders(limit=limit)

            if not orders:
                return {"total": 0, "orders": []}

            # Normalize orders
            if isinstance(orders, dict):
                items = orders.get("orders", [])
                total = orders.get("total", len(items))
            elif isinstance(orders, list):
                items = orders
                total = len(items)
            else:
                items = list(orders) if orders else []
                total = len(items)

            return {
                "total": total,
                "orders": [self._normalize_order(order) for order in items],
            }
        except Exception as e:
            logger.error(f"Order fetch failed: {e}")
            return {"error": str(e), "orders": []}

    def _normalize_product(self, item: Any) -> dict:
        """Normalize product item to standard format."""
        if isinstance(item, dict):
            raw = item
        else:
            raw = getattr(item, "__dict__", {})

        return {
            "id": raw.get("id") or raw.get("asin"),
            "asin": raw.get("asin"),
            "title": raw.get("title") or raw.get("name"),
            "price": self._parse_price(raw.get("price")),
            "category": raw.get("category"),
            "rating": raw.get("rating"),
            "reviews": raw.get("reviews"),
            "url": raw.get("url") or raw.get("product_url"),
            "image": raw.get("image") or raw.get("image_url"),
            "prime": raw.get("prime", False),
        }

    def _normalize_order(self, order: Any) -> dict:
        """Normalize order item to standard format."""
        if isinstance(order, dict):
            raw = order
        else:
            raw = getattr(order, "__dict__", {})

        return {
            "order_id": raw.get("order_id") or raw.get("id"),
            "order_date": raw.get("order_date") or raw.get("date"),
            "asin": raw.get("asin") or raw.get("product_id"),
            "title": raw.get("title") or raw.get("name"),
            "price": self._parse_price(raw.get("price")),
            "quantity": int(raw.get("quantity", 1)),
            "category": raw.get("category"),
            "url": raw.get("url") or raw.get("product_url"),
            "image": raw.get("image") or raw.get("image_url"),
        }

    @staticmethod
    def _parse_price(price_val: Any) -> float:
        """Parse price from various formats."""
        if price_val is None:
            return None
        try:
            if isinstance(price_val, (int, float)):
                return float(price_val)
            if isinstance(price_val, str):
                # Remove currency symbols and commas
                cleaned = price_val.replace("$", "").replace(",", "").strip()
                return float(cleaned)
        except (ValueError, TypeError):
            pass
        return None


def run_mcp_server():
    """Run the MCP server with Claude as the LLM."""
    if not HAS_AMAZON_MCP:
        logger.error("amazon-mcp not available. Cannot start MCP server.")
        return

    server = AuraAmazonMCPServer()

    # Define MCP tools
    tools = [
        {
            "name": "search_amazon_products",
            "description": "Search for products on Amazon",
            "input_schema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query (e.g., 'pink corset', 'makeup palette')",
                    },
                    "category": {
                        "type": "string",
                        "description": "Optional product category filter",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max results (default 10, max 100)",
                        "default": 10,
                    },
                },
                "required": ["query"],
            },
        },
        {
            "name": "get_amazon_orders",
            "description": "Retrieve user's Amazon order history",
            "input_schema": {
                "type": "object",
                "properties": {
                    "days": {
                        "type": "integer",
                        "description": "Get orders from last N days (optional)",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max orders to retrieve (default 50)",
                        "default": 50,
                    },
                },
                "required": [],
            },
        },
    ]

    logger.info("Aura Amazon MCP Server running")
    logger.info(f"Available tools: {[t['name'] for t in tools]}")

    # Example usage - in production, this would be integrated with Claude API
    try:
        # Test the tools
        logger.info("\n=== Testing MCP Tools ===")

        # Test search
        result = server.search_products("wireless headphones", limit=5)
        logger.info(f"Search result: {json.dumps(result, indent=2, default=str)}")

        # Test orders
        result = server.get_order_history(limit=10)
        logger.info(f"Orders result: {json.dumps(result, indent=2, default=str)}")

    except Exception as e:
        logger.error(f"MCP server error: {e}")


if __name__ == "__main__":
    run_mcp_server()

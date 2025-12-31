"use server";

import { NextRequest, NextResponse } from "next/server";

/**
 * Amazon-specific search endpoint
 * 
 * Proxies to the local python adapter (/api-adapter/adapter.py)
 * which uses amazon-mcp for real product searches
 * 
 * Usage:
 * POST /api/shopping/amazon
 * {
 *   "q": "pink corset",
 *   "page": 1,
 *   "limit": 10,
 *   "category": "clothing"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, page = 1, limit = 10, category, sort = "relevance" } = body;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing required parameter: q (search query)" },
        { status: 400 }
      );
    }

    // Try to use local Amazon adapter first
    const adapterUrl = process.env.RETAILER_ADAPTER_URL || "http://localhost:8001";

    try {
      const params = new URLSearchParams({
        q: q.trim(),
        page: String(page),
        limit: String(Math.min(limit, 100)),
      });

      if (category) {
        params.append("category", category);
      }
      if (sort) {
        params.append("sort", sort);
      }

      const response = await fetch(`${adapterUrl}/search?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 501) {
          return NextResponse.json(
            {
              error: "Amazon adapter not configured",
              hint: "Install amazon-mcp and set credentials in environment",
              docs: "https://pypi.org/project/amazon-mcp/",
            },
            { status: 503 }
          );
        }
        throw new Error(`Adapter returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (adapterError) {
      console.error("Amazon adapter error:", adapterError);

      return NextResponse.json(
        {
          error: "Amazon search unavailable",
          message: adapterError instanceof Error ? adapterError.message : String(adapterError),
          hint: "Ensure the local adapter is running: uvicorn api-adapter.adapter:app --reload --port 8001",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Amazon search API error:", error);
    return NextResponse.json(
      { error: "Failed to process Amazon search request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json(
        { error: "Missing required parameter: q" },
        { status: 400 }
      );
    }

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const category = searchParams.get("category") || undefined;
    const sort = searchParams.get("sort") || "relevance";

    // Forward to adapter
    const adapterUrl = process.env.RETAILER_ADAPTER_URL || "http://localhost:8001";
    const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });

    if (category) params.append("category", category);
    if (sort) params.append("sort", sort);

    const response = await fetch(`${adapterUrl}/search?${params.toString()}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Amazon adapter error", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Amazon search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Amazon products" },
      { status: 500 }
    );
  }
}

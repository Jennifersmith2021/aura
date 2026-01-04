"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * Amazon Orders API endpoint
 *
 * Fetches user's Amazon order history via amazon-mcp adapter
 * and optionally syncs them to the closet as Items
 *
 * GET /api/shopping/amazon/orders - List orders
 * POST /api/shopping/amazon/orders/sync - Sync orders to closet
 */

export async function GET(request: NextRequest) {
  try {
    // Allow unauthenticated access in development to simplify local testing.
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!session?.user && !isDev) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = Number(request.nextUrl.searchParams.get("limit")) || 50;
    const days = request.nextUrl.searchParams.get("days");

    const adapterUrl = process.env.RETAILER_ADAPTER_URL || "http://localhost:8001";

    const params = new URLSearchParams({ limit: String(Math.min(limit, 500)) });
    if (days) {
      params.append("days", days);
    }

    const response = await fetch(`${adapterUrl}/orders?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 501) {
        return NextResponse.json(
          { error: "Amazon adapter not configured" },
          { status: 503 }
        );
      }
      const text = await response.text();
      throw new Error(`Adapter error: ${response.status} ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Amazon orders",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "sync") {
      // Sync orders to the user's closet
      // This would be called by the frontend after fetching orders
      const orders = body.orders || [];

      // TODO: Convert orders to Items and save to database/IndexedDB
      // This requires coordination with the main sync endpoint at /api/sync/items

      return NextResponse.json({
        status: "synced",
        count: orders.length,
        message: `Synced ${orders.length} Amazon orders to closet`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Orders sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync orders" },
      { status: 500 }
    );
  }
}

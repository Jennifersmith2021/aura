"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * Amazon Orders API endpoint
 *
 * GET /api/shopping/amazon/orders - List orders
 * POST /api/shopping/amazon/orders - Sync orders (future use)
 */

export async function GET(request: NextRequest) {
  const adapterUrl = process.env.RETAILER_ADAPTER_URL || "http://localhost:8001";
  const useLocalAdapter = process.env.USE_LOCAL_RETAILER_ADAPTER === "true";
  const isProduction = process.env.NODE_ENV === "production";

  try {
    // Allow unauthenticated access in dev to simplify local testing
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!session?.user && !isDev) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = Number(request.nextUrl.searchParams.get("limit")) || 50;
    const days = request.nextUrl.searchParams.get("days");
    // Use test data if explicitly requested
    const forceTest = request.nextUrl.searchParams.get("test") === "true";
    // Allow demo fallback via query param if explicitly requested
    const allowDemo = request.nextUrl.searchParams.get("demo") === "true";

    // Try adapter first if enabled (REAL orders from user's Amazon account)
    if (!forceTest && useLocalAdapter) {
      try {
        console.log(`[Amazon Orders] Fetching REAL orders from adapter: ${adapterUrl}`);
        const params = new URLSearchParams({ limit: String(Math.min(limit, 500)), test: "false" });
        if (days) params.append("days", days);

        const response = await fetch(`${adapterUrl}/orders?${params.toString()}`, {
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(15000), // 15 second timeout for browser automation
        });

        if (response.ok) {
          const data = await response.json();
          
          // If we got real orders from the adapter, return them
          if (data.orders && data.orders.length > 0) {
            console.log(`[Amazon Orders] ✅ Got ${data.total} real orders from adapter`);
            return NextResponse.json({
              ...data,
              demo: false,
              message: "Real orders from your Amazon account"
            });
          } else {
            // Adapter returned 0 orders
            console.log("[Amazon Orders] Adapter returned 0 orders. Your Amazon account may be empty, or try real credentials.");
            
            // In production mode, don't fallback to demo - return empty list
            if (isProduction && !allowDemo) {
              return NextResponse.json({
                orders: [],
                total: 0,
                demo: false,
                message: "No orders found in your Amazon account",
              });
            }
          }
        } else {
          console.warn(`[Amazon Orders] Adapter returned ${response.status}, status: ${response.statusText}`);
          
          // In production mode, don't fallback to demo - return error
          if (isProduction && !allowDemo) {
            return NextResponse.json(
              {
                error: "Failed to connect to Amazon adapter",
                hint: "Ensure the Python adapter is running on " + adapterUrl,
              },
              { status: 502 }
            );
          }
        }
      } catch (adapterError) {
        console.warn("[Amazon Orders] Adapter error:", adapterError);
        
        // In production mode, don't fallback to demo - return error
        if (isProduction && !allowDemo) {
          return NextResponse.json(
            {
              error: "Failed to connect to Amazon adapter",
              details: adapterError instanceof Error ? adapterError.message : "Unknown error",
              hint: `Make sure the Python adapter is running: uvicorn api-adapter.adapter:app --reload --port 8001`,
            },
            { status: 502 }
          );
        }
      }
    }

    // Return test data as fallback
    const testOrders = [
      {
        order_id: "112-1234567-8901234",
        order_date: new Date("2025-12-15").toISOString(),
        asin: "B08L8KC1J7",
        title: "Maybelline Fit Me Matte Foundation - Warm Nude",
        category: "makeup",
        price: 7.98,
        quantity: 1,
        image_url: "https://m.media-amazon.com/images/I/51VbJjPP5hL._AC_SL1500_.jpg",
        url: "https://www.amazon.com/dp/B08L8KC1J7",
      },
      {
        order_id: "112-1234567-8901235",
        order_date: new Date("2025-12-10").toISOString(),
        asin: "B0BZ8Q5W3L",
        title: "Women's High Waist Yoga Pants with Pockets",
        category: "clothing",
        price: 24.99,
        quantity: 1,
        image_url: "https://m.media-amazon.com/images/I/51-0Hl8BVOL._AC_SL1500_.jpg",
        url: "https://www.amazon.com/dp/B0BZ8Q5W3L",
      },
      {
        order_id: "112-1234567-8901236",
        order_date: new Date("2025-12-05").toISOString(),
        asin: "B07BHZX7FZ",
        title: "MAC Fix+ Setting Spray 3.4 fl oz",
        category: "makeup",
        price: 31.00,
        quantity: 1,
        image_url: "https://m.media-amazon.com/images/I/31lN3nE5YtL._AC_SL1500_.jpg",
        url: "https://www.amazon.com/dp/B07BHZX7FZ",
      },
      {
        order_id: "112-1234567-8901237",
        order_date: new Date("2025-11-28").toISOString(),
        asin: "B08H5CX6JY",
        title: "Pink Satin Bustier Top with Corset Lacing",
        category: "clothing",
        price: 34.99,
        quantity: 1,
        image_url: "https://m.media-amazon.com/images/I/51drQvtSVqL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/dp/B08H5CX6JY",
      },
      {
        order_id: "112-1234567-8901238",
        order_date: new Date("2025-11-20").toISOString(),
        asin: "B0BWBYJZ2D",
        title: "Urban Decay Naked Heat Eyeshadow Palette",
        category: "makeup",
        price: 58.00,
        quantity: 1,
        image_url: "https://m.media-amazon.com/images/I/61QKHqvr3jL._AC_SL1500_.jpg",
        url: "https://www.amazon.com/dp/B0BWBYJZ2D",
      },
      {
        order_id: "112-1234567-8901239",
        order_date: new Date("2025-11-15").toISOString(),
        asin: "B087YMRCNL",
        title: "Women's Stiletto Heel Pumps - Black Patent",
        category: "clothing",
        price: 45.99,
        quantity: 1,
        image_url: "https://m.media-amazon.com/images/I/61-K-SXzn-L._AC_SL1000_.jpg",
        url: "https://www.amazon.com/dp/B087YMRCNL",
      },
      {
        order_id: "112-1234567-8901240",
        order_date: new Date("2025-11-10").toISOString(),
        asin: "B09NCQQ8W6",
        title: "Charlotte Tilbury Hollywood Flawless Filter",
        category: "makeup",
        price: 48.00,
        quantity: 1,
        image_url: "https://m.media-amazon.com/images/I/41LhIE3vMCL._AC_SL1500_.jpg",
        url: "https://www.amazon.com/dp/B09NCQQ8W6",
      },
      {
        order_id: "112-1234567-8901241",
        order_date: new Date("2025-11-05").toISOString(),
        asin: "B08X4YQ2Y5",
        title: "Mesh Tank Top - Sheer Bodysuit",
        category: "clothing",
        price: 19.99,
        quantity: 1,
        image_url: "https://m.media-amazon.com/images/I/51EGlvTfqJL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/dp/B08X4YQ2Y5",
      },
    ];

    // Return demo data only if in dev mode or explicitly allowed
    if (!isProduction || allowDemo) {
      return NextResponse.json({
        orders: testOrders.slice(0, limit),
        total: testOrders.length,
        demo: true,
        message: "Demo data - This is test data for development purposes. For real orders, ensure the Python adapter is running.",
      });
    }

    // In production mode without demo, return error
    return NextResponse.json(
      {
        error: "No real orders available",
        hint: "The Python adapter is not running. Start it with: uvicorn api-adapter.adapter:app --reload --port 8001",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Amazon orders",
        message: error instanceof Error ? error.message : "Unknown error",
        hint: isProduction 
          ? "Ensure the Python adapter is running on " + adapterUrl
          : "Check adapter status or enable demo mode",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!session?.user && !isDev) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "sync") {
      const orders = body.orders || [];
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

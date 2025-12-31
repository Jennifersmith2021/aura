"use client";

import { useState, useCallback } from "react";
import { Download, Loader, AlertCircle, CheckCircle, Package } from "lucide-react";
import { useStore } from "@/hooks/useStore";

interface AmazonOrder {
  order_id: string;
  order_date: string;
  asin: string;
  title: string;
  category?: string;
  price?: number;
  quantity: number;
  image_url?: string;
  url?: string;
}

interface SyncStatus {
  type: "idle" | "loading" | "success" | "error" | "partial";
  message: string;
  imported?: number;
  failed?: number;
}

export function AmazonOrderSync() {
  const { addItem } = useStore();
  const [orders, setOrders] = useState<AmazonOrder[]>([]);
  const [status, setStatus] = useState<SyncStatus>({ type: "idle", message: "" });
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  /**
   * Fetch orders from Amazon via the local adapter
   */
  const fetchOrders = useCallback(async () => {
    setStatus({ type: "loading", message: "Fetching your Amazon orders..." });

    try {
      const response = await fetch("/api/shopping/amazon/orders", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      const orderList = data.orders || [];

      setOrders(orderList);
      setStatus({
        type: orderList.length > 0 ? "success" : "idle",
        message:
          orderList.length > 0
            ? `Found ${orderList.length} orders. Select items to import.`
            : "No orders found",
      });

      // Pre-select all orders
      setSelectedOrders(new Set(orderList.map((o) => o.order_id)));
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to fetch orders",
      });
    }
  }, []);

  /**
   * Sync selected orders to closet as Items
   */
  const syncOrdersToCloset = useCallback(async () => {
    if (selectedOrders.size === 0) {
      setStatus({ type: "error", message: "Please select at least one order" });
      return;
    }

    setStatus({ type: "loading", message: "Importing orders to your closet..." });

    const selectedOrdersList = orders.filter((o) => selectedOrders.has(o.order_id));
    let imported = 0;
    let failed = 0;

    for (const order of selectedOrdersList) {
      try {
        // Map Amazon order to Item type
        const item = {
          name: order.title,
          type: inferItemType(order.category),
          category: inferCategory(order.category),
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

        // Add to closet via store
        addItem(item as any);
        imported++;
      } catch (err) {
        console.error(`Failed to import order ${order.order_id}:`, err);
        failed++;
      }
    }

    const message =
      failed === 0
        ? `Successfully imported ${imported} items to your closet!`
        : `Imported ${imported} items (${failed} failed)`;

    setStatus({
      type: failed === 0 ? "success" : "partial",
      message,
      imported,
      failed,
    });

    // Clear selection after successful sync
    if (failed === 0) {
      setTimeout(() => {
        setOrders([]);
        setSelectedOrders(new Set());
      }, 2000);
    }
  }, [orders, selectedOrders, addItem]);

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.order_id)));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Sync Amazon Orders
        </h3>
        <p className="text-sm text-gray-500">
          Import your Amazon order history into your Aura closet to organize and track your purchases.
        </p>
      </div>

      {/* Status Messages */}
      {status.message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-green-50 text-green-800"
              : status.type === "partial"
                ? "bg-yellow-50 text-yellow-800"
                : status.type === "error"
                  ? "bg-red-50 text-red-800"
                  : "bg-blue-50 text-blue-800"
          }`}
        >
          {status.type === "loading" ? (
            <Loader className="w-4 h-4 animate-spin flex-shrink-0" />
          ) : status.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <div>
            {status.message}
            {status.imported !== undefined && ` (${status.imported} imported${status.failed ? `, ${status.failed} failed` : ""})`}
          </div>
        </div>
      )}

      {/* Fetch Button */}
      {orders.length === 0 ? (
        <button
          onClick={fetchOrders}
          disabled={status.type === "loading"}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {status.type === "loading" ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Fetching Orders...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Fetch My Amazon Orders
            </>
          )}
        </button>
      ) : (
        <>
          {/* Order List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOrders.size === orders.length && orders.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">
                  Select All ({selectedOrders.size} of {orders.length})
                </span>
              </label>
              <button
                onClick={() => {
                  setOrders([]);
                  setSelectedOrders(new Set());
                  setStatus({ type: "idle", message: "" });
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <label
                  key={order.order_id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.order_id)}
                    onChange={() => handleSelectOrder(order.order_id)}
                    className="w-4 h-4 mt-1 rounded"
                  />

                  {/* Product Image */}
                  {order.image_url && (
                    <img
                      src={order.image_url}
                      alt={order.title}
                      className="w-12 h-12 object-cover rounded bg-gray-100"
                    />
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {order.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order: {order.order_id} • {new Date(order.order_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {order.price && (
                        <span className="text-sm font-semibold text-blue-600">
                          ${order.price.toFixed(2)}
                        </span>
                      )}
                      {order.quantity > 1 && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          Qty: {order.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={syncOrdersToCloset}
            disabled={status.type === "loading" || selectedOrders.size === 0}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {status.type === "loading" ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Import {selectedOrders.size} Selected Items
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Infer item type from category
 */
function inferItemType(category?: string): string {
  if (!category) return "clothing";

  const cat = category.toLowerCase();
  if (cat.includes("makeup") || cat.includes("cosmetic")) return "makeup";
  if (cat.includes("skincare") || cat.includes("beauty")) return "makeup";
  if (cat.includes("book") || cat.includes("clothing")) return "clothing";

  return "clothing";
}

/**
 * Infer detailed category from Amazon category string
 */
function inferCategory(category?: string): string {
  if (!category) return "accessories";

  const cat = category.toLowerCase();

  // Makeup categories
  if (cat.includes("makeup")) return "makeup";
  if (cat.includes("lipstick")) return "makeup";
  if (cat.includes("eyeshadow")) return "makeup";
  if (cat.includes("foundation")) return "makeup";
  if (cat.includes("mascara")) return "makeup";
  if (cat.includes("blush")) return "makeup";
  if (cat.includes("concealer")) return "makeup";

  // Skincare
  if (cat.includes("skincare") || cat.includes("lotion")) return "skincare";
  if (cat.includes("facial")) return "skincare";

  // Clothing
  if (cat.includes("dress")) return "dresses";
  if (cat.includes("skirt")) return "skirts";
  if (cat.includes("top")) return "tops";
  if (cat.includes("blouse")) return "tops";
  if (cat.includes("shirt")) return "tops";
  if (cat.includes("pants") || cat.includes("jeans")) return "bottoms";
  if (cat.includes("lingerie") || cat.includes("bra")) return "lingerie";
  if (cat.includes("corset")) return "activewear";

  // Accessories
  if (cat.includes("shoe") || cat.includes("boot")) return "shoes";
  if (cat.includes("bag") || cat.includes("purse")) return "accessories";
  if (cat.includes("jewelry")) return "accessories";
  if (cat.includes("watch")) return "accessories";
  if (cat.includes("scarf")) return "accessories";
  if (cat.includes("hat") || cat.includes("cap")) return "accessories";
  if (cat.includes("belt")) return "accessories";

  // Hair
  if (cat.includes("wig") || cat.includes("hair")) return "accessories";

  return "accessories";
}

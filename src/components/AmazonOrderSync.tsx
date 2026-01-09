"use client";

import { useState, useCallback } from "react";
import { Download, Loader, AlertCircle, CheckCircle, Package } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { toast } from "@/lib/toast";
import type { Category, Item } from "@/types";
import { v4 as uuidv4 } from "uuid";

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
  const [isDemo, setIsDemo] = useState(false);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message ||
          `Failed to fetch orders: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const orderList = data.orders || [];

      setOrders(orderList);
      setIsDemo(data.demo || false);
      
      // Determine status message based on data source
      let demoIndicator = "";
      if (data.demo === "fallback") {
        demoIndicator = " (tried real sync but account has no orders)";
      } else if (data.demo === true) {
        demoIndicator = " (demo mode)";
      }
      
      // Provide helpful message when no orders found
      let message = "";
      if (orderList.length > 0) {
        message = `Found ${orderList.length} orders${demoIndicator}. Select items to import.`;
      } else if (!data.demo) {
        message = "No orders found in your Amazon account. Try: 1) Verify credentials in .env, 2) Check if account has purchase history, 3) Try demo mode (?demo=true)";
      } else {
        message = "No orders found";
      }
      
      setStatus({
        type: orderList.length > 0 ? "success" : (data.demo ? "idle" : "error"),
        message,
      });

      // Pre-select all orders
      setSelectedOrders(new Set(orderList.map((o: AmazonOrder) => o.order_id)));
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
        // Map Amazon order to Item type with required fields
        const item: Item = {
          id: uuidv4(),
          name: order.title,
          type: inferItemType(order.category),
          category: inferCategory(order.category),
          price: order.price,
          image: order.image_url,
          dateAdded: new Date(order.order_date).getTime(),
          purchaseUrl: order.url,
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
        await addItem(item);
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

    // Show toast and clear after successful sync
    if (imported > 0) {
      toast.success(`Added ${imported} ${imported === 1 ? "item" : "items"} to closet`);
      setTimeout(() => {
        setOrders([]);
        setSelectedOrders(new Set());
      }, 2000);
    }
    if (failed > 0) {
      toast.error(`Failed to import ${failed} ${failed === 1 ? "item" : "items"}`);
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

      {/* Demo Data Info */}
      {isDemo && orders.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5">⚠️</div>
            <div className="text-sm text-orange-900 dark:text-orange-200 flex-1">
              <p className="font-semibold mb-2">🔧 Production Mode - Adapter Not Connected</p>
              <p className="mb-3">You&apos;re viewing {orders.length} demo items because the Python adapter is not running.</p>
              <p className="mb-3 text-xs">To import your <strong>real Amazon orders</strong>:</p>
              <div className="bg-orange-100 dark:bg-orange-900/50 rounded p-2 mb-3 text-xs font-mono space-y-1">
                <div>1. bash setup-amazon-sync.sh  <span className="text-orange-600">(or .bat on Windows)</span></div>
                <div>2. Set AMAZON_EMAIL &amp; AMAZON_PASSWORD in .env</div>
                <div>3. Terminal: <code>uvicorn api-adapter.adapter:app --reload --port 8001</code></div>
                <div>4. Reload the app (Ctrl+R)</div>
                <div>5. Click "Fetch My Amazon Orders" again</div>
              </div>
              <p className="text-xs">
                <a href="https://github.com/Jennifersmith2021/aura#amazon-sync" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-300 underline hover:text-orange-800">
                  View detailed setup guide →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error with Setup Instructions */}
      {status.type === "error" && status.message.includes("Failed to fetch") && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">🚨</div>
            <div className="text-sm text-red-900 dark:text-red-200 flex-1">
              <p className="font-semibold mb-2">Production Mode: Adapter Not Connected</p>
              <p className="mb-3">The Python adapter (required for real Amazon orders) is not running.</p>
              <p className="mb-3 text-xs font-medium">Quick Setup:</p>
              <div className="bg-red-100 dark:bg-red-900/50 rounded p-3 mb-3 text-xs font-mono space-y-2 text-foreground dark:text-foreground">
                <div><strong># Terminal 1: Start adapter</strong></div>
                <div className="ml-3">$ bash setup-amazon-sync.sh</div>
                <div className="ml-3">$ uvicorn api-adapter.adapter:app --reload --port 8001</div>
                <div className="mt-2"><strong># Terminal 2: Start dev server</strong></div>
                <div className="ml-3">$ npm run dev</div>
              </div>
              <p className="text-xs text-red-800 dark:text-red-300 mb-2">
                Make sure <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">AMAZON_EMAIL</code> and <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">AMAZON_PASSWORD</code> are set in <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">.env</code>
              </p>
              <p className="text-xs">
                <a href="https://github.com/Jennifersmith2021/aura/blob/main/AMAZON_SYNC_QUICK_START.md" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-300 underline hover:text-red-800">
                  📖 Full setup guide →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Info: No Orders Found (Adapter Working) */}
      {status.type === "error" && status.message.includes("No orders found") && !status.message.includes("Failed to fetch") && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-900 dark:text-blue-200 flex-1">
              <p className="font-semibold mb-2">Adapter Connected, But No Orders Found</p>
              <p className="mb-3">The Amazon adapter is running, but returned 0 orders. This usually means:</p>
              <ul className="list-disc list-inside space-y-1 mb-3 text-xs">
                <li>Your Amazon account has no order history</li>
                <li>The credentials in .env are incorrect</li>
                <li>Amazon requires 2FA (not supported by automation)</li>
                <li>Amazon is blocking automated access</li>
              </ul>
              <p className="mb-3 text-xs font-medium">Troubleshooting steps:</p>
              <div className="bg-blue-100 dark:bg-blue-900/50 rounded p-3 mb-3 text-xs font-mono space-y-2 text-foreground">
                <div>1. Verify credentials: Check .env file has correct AMAZON_EMAIL and AMAZON_PASSWORD</div>
                <div>2. Test login manually: Open amazon.com and try logging in with those credentials</div>
                <div>3. Check for 2FA: If 2FA is enabled on your Amazon account, disable it temporarily</div>
                <div>4. Try demo mode: Add <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">?demo=true</code> to URL to test with sample data</div>
              </div>
              <p className="text-xs">
                <strong>Alternative:</strong> Use Amazon's "Download Order History Reports" feature and import via CSV instead.
              </p>
            </div>
          </div>
        </div>
      )}
      
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

      {/* Setup Instructions for Real Amazon Sync */}
      {isDemo && (
        <div id="setup-instructions" className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-sm mb-3">Set Up Real Amazon Sync</h4>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Step 1: Install Dependencies</p>
              <code className="bg-gray-900 text-green-400 p-2 rounded block text-xs overflow-x-auto mb-2">
                pip install -r api-adapter/requirements.txt
              </code>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Step 2: Configure Credentials in .env</p>
              <code className="bg-gray-900 text-green-400 p-2 rounded block text-xs mb-2">
                AMAZON_EMAIL=your_email@gmail.com{'\n'}AMAZON_PASSWORD=your_password
              </code>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Step 3: Start the Adapter</p>
              <code className="bg-gray-900 text-green-400 p-2 rounded block text-xs mb-2">
                uvicorn api-adapter.adapter:app --reload --port 8001
              </code>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Step 4: Update .env</p>
              <code className="bg-gray-900 text-green-400 p-2 rounded block text-xs mb-2">
                RETAILER_ADAPTER_URL=http://localhost:8001{'\n'}USE_LOCAL_RETAILER_ADAPTER=true
              </code>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              See <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">AMAZON_SYNC_FIX.md</code> for detailed instructions
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Infer item type from category
 */
function inferItemType(category?: string): "clothing" | "makeup" {
  if (!category) return "clothing";

  const cat = category.toLowerCase();
  if (cat.includes("makeup") || cat.includes("cosmetic")) return "makeup";
  if (cat.includes("skincare") || cat.includes("beauty")) return "makeup";

  return "clothing";
}

/**
 * Infer detailed category from Amazon category string
 */
function inferCategory(category?: string): Category {
  if (!category) return "other";

  const cat = category.toLowerCase();

  // Makeup categories
  if (cat.includes("lipstick")) return "lip";
  if (cat.includes("eyeshadow") || cat.includes("eyeliner")) return "eye";
  if (cat.includes("foundation") || cat.includes("concealer")) return "face";
  if (cat.includes("mascara")) return "eye";
  if (cat.includes("blush") || cat.includes("bronzer")) return "cheek";
  if (cat.includes("makeup")) return "face"; // Generic makeup defaults to face

  // Skincare - map to closest category
  if (cat.includes("skincare") || cat.includes("lotion")) return "other";
  if (cat.includes("facial")) return "other";

  // Clothing
  if (cat.includes("dress")) return "dress";
  if (cat.includes("skirt")) return "bottom";
  if (cat.includes("top")) return "top";
  if (cat.includes("blouse")) return "top";
  if (cat.includes("shirt")) return "top";
  if (cat.includes("pants") || cat.includes("jeans")) return "bottom";
  if (cat.includes("lingerie") || cat.includes("bra")) return "accessory";
  if (cat.includes("corset")) return "accessory";

  // Accessories
  if (cat.includes("shoe") || cat.includes("boot")) return "shoe";
  if (cat.includes("bag") || cat.includes("purse")) return "accessory";
  if (cat.includes("jewelry")) return "accessory";
  if (cat.includes("watch")) return "accessory";
  if (cat.includes("scarf")) return "accessory";
  if (cat.includes("hat") || cat.includes("cap")) return "accessory";
  if (cat.includes("belt")) return "accessory";

  // Hair
  if (cat.includes("wig") || cat.includes("hair")) return "accessory";

  return "other";
}

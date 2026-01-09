"use client";

import { useState, useEffect } from "react";
import { Package, RotateCw, Trash2, Eye } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { toast } from "@/lib/toast";

interface SyncedItem {
  id: string;
  name: string;
  order_id: string;
  asin: string;
  order_date: string;
  price?: number;
  image?: string;
}

export function AmazonInventoryManager() {
  const { items, removeItem } = useStore();
  const [syncedItems, setSyncedItems] = useState<SyncedItem[]>([]);
  const [filter, setFilter] = useState<"all" | "recent" | "expensive">("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Find all items that were imported from Amazon
  useEffect(() => {
    const amazonItems = items
      .filter((item) => item.importMeta?.source === "amazon")
      .map((item) => ({
        id: item.id,
        name: item.name,
        order_id: item.importMeta?.order_id as string,
        asin: item.importMeta?.asin as string,
        order_date: item.importMeta?.order_date as string,
        price: item.price,
        image: item.image,
      }))
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

    let filtered = amazonItems;
    if (filter === "recent") {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      filtered = amazonItems.filter((i) => new Date(i.order_date).getTime() > thirtyDaysAgo);
    } else if (filter === "expensive") {
      filtered = amazonItems.filter((i) => (i.price || 0) > 25).sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    setSyncedItems(filtered);
  }, [items, filter]);

  const handleDeleteItem = (id: string) => {
    removeItem(id);
    toast.success("Item removed from closet");
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    const count = selectedItems.size;
    selectedItems.forEach((id) => removeItem(id));
    toast.success(`Deleted ${count} ${count === 1 ? "item" : "items"}`);
    setSelectedItems(new Set());
  };

  const stats = {
    total: syncedItems.length,
    totalValue: syncedItems.reduce((sum, item) => sum + (item.price || 0), 0),
    avgPrice: syncedItems.length > 0 ? syncedItems.reduce((sum, item) => sum + (item.price || 0), 0) / syncedItems.length : 0,
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6" />
          Amazon Inventory
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage items imported from your Amazon orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Items</p>
          <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Value</p>
          <p className="text-3xl font-bold text-green-400">
            ${stats.totalValue.toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Average Price</p>
          <p className="text-3xl font-bold text-purple-400">
            ${stats.avgPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-white/10 hover:bg-white/20 text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("recent")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "recent"
                ? "bg-primary text-white"
                : "bg-white/10 hover:bg-white/20 text-foreground"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setFilter("expensive")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "expensive"
                ? "bg-primary text-white"
                : "bg-white/10 hover:bg-white/20 text-foreground"
            }`}
          >
            $25+
          </button>
        </div>

        {selectedItems.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete {selectedItems.size}
          </button>
        )}
      </div>

      {/* Items List */}
      {syncedItems.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No Amazon items synced yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Import Amazon orders from the closet to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {syncedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-4 hover:bg-white/10 transition-colors group"
            >
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="mt-1 w-4 h-4 rounded"
              />

              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg bg-white/10"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Order: {item.order_id} • ASIN: {item.asin}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.order_date).toLocaleDateString()}
                </p>
                {item.price && (
                  <p className="text-sm font-semibold text-green-400 mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
        <h3 className="font-semibold text-sm text-blue-200">💡 About Amazon Sync</h3>
        <p className="text-xs text-blue-200/70 space-y-2">
          <div>• Items imported from Amazon orders are marked with order ID and ASIN</div>
          <div>• Prices are preserved from your original purchase</div>
          <div>• Items are automatically categorized as clothing or makeup</div>
          <div>• You can filter by date or price range to find specific items</div>
        </p>
      </div>
    </div>
  );
}

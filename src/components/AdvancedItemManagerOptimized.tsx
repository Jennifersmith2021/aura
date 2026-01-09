/**
 * Advanced Item Manager with Optimization Features
 * Demonstrates: search, batch ops, analytics, notifications, validation
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import {
  useAdvancedItemSearch,
  useItemAnalytics,
  useInteractionTracking,
  useBatchOperations,
} from "@/hooks/useOptimizations";
import {
  searchItems,
  groupBy,
  calculateStats,
} from "@/utils/advancedSearch";
import {
  validateBatch,
  ItemSchema,
  validateItem,
} from "@/lib/validation";
import {
  executeBatch,
  batchExport,
} from "@/lib/batchOperations";
import {
  notificationService,
  AchievementNotifier,
} from "@/lib/notifications";
import {
  analyticsTracker,
  featureUsageTracker,
} from "@/lib/analytics";
import { retryWithBackoff } from "@/lib/errorRecovery";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Plus,
  BarChart3,
  Zap,
  CheckCircle,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { Item } from "@/types";

interface FilterState {
  type?: "clothing" | "makeup";
  category?: string;
  priceMin?: number;
  priceMax?: number;
  color?: string;
  brand?: string;
  sortBy: "name" | "price" | "date" | "relevance";
  sortOrder: "asc" | "desc";
}

export default function AdvancedItemManager() {
  const { items, addItem, removeItem } = useStore();
  const search = useAdvancedItemSearch();
  const analytics = useItemAnalytics();
  const { trackClick, trackFormSubmit } = useInteractionTracking();
  const batchOps = useBatchOperations();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Search results with memoization
  const searchResults = useMemo(() => {
    if (!searchQuery && Object.keys(filters).length === 1) return items;

    return search(searchQuery, filters);
  }, [searchQuery, filters, items, search]);

  // Calculate statistics
  const resultStats = useMemo(() => {
    if (searchResults.length === 0) return null;

    const clothingItems = searchResults.filter((i) => i.type === "clothing");
    const makeupItems = searchResults.filter((i) => i.type === "makeup");

    return {
      total: searchResults.length,
      clothing: clothingItems.length,
      makeup: makeupItems.length,
      totalValue: searchResults.reduce((sum, i) => sum + (i.price || 0), 0),
      avgPrice:
        searchResults.reduce((sum, i) => sum + (i.price || 0), 0) /
        searchResults.length,
    };
  }, [searchResults]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.size === 0) return;

    trackClick("bulk_delete");
    featureUsageTracker.trackFeatureUse("bulk_delete");

    const itemsToDelete = items.filter((i) => selectedItems.has(i.id));

    setLoading(true);
    try {
      const result = await batchOps(itemsToDelete, "remove", (done, total) => {
        console.log(`Deleted ${done}/${total}`);
      });

      if (selectedItems.size === result.length) {
        notificationService.notify(
          "achievement",
          "✅ Bulk Delete Complete",
          `Successfully deleted ${result.length} items`
        );
      }

      setSelectedItems(new Set());
      analyticsTracker.trackAction("bulk_delete", "items", selectedItems.size);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      notificationService.notify(
        "error",
        "❌ Delete Failed",
        "Failed to delete some items. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedItems, items, batchOps, trackClick]);

  // Handle export
  const handleExport = useCallback(async () => {
    trackClick("export");
    featureUsageTracker.trackFeatureUse("export");

    try {
      const csv = await batchExport(searchResults, "csv");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aura-items-${Date.now()}.csv`;
      a.click();

      notificationService.notify(
        "achievement",
        "📥 Export Complete",
        `Exported ${searchResults.length} items to CSV`
      );

      analyticsTracker.trackAction("export", "items", searchResults.length);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [searchResults, trackClick]);

  // Toggle item selection
  const toggleItemSelection = useCallback(
    (itemId: string) => {
      const newSet = new Set(selectedItems);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      setSelectedItems(newSet);
      trackClick("toggle_selection");
    },
    [selectedItems, trackClick]
  );

  // Select/deselect all
  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === searchResults.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(searchResults.map((i) => i.id)));
    }
    trackClick("toggle_select_all");
  }, [selectedItems, searchResults, trackClick]);

  // Show analytics
  const handleShowAnalytics = useCallback(() => {
    trackClick("show_analytics");
    featureUsageTracker.trackFeatureUse("analytics");
    setStats(analytics);

    notificationService.notify(
      "update",
      "📊 Analytics Updated",
      `Analyzing ${items.length} items...`
    );
  }, [analytics, items, trackClick]);

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Advanced Item Manager
        </h2>
        <div className="text-sm text-white/70">
          {searchResults.length} items
          {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4 bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <select
                value={filters.type || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    type: (e.target.value as any) || undefined,
                  })
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="clothing">Clothing</option>
                <option value="makeup">Makeup</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={filters.priceMin || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceMin: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.priceMax || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceMax: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              />

              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as any,
                  })
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="date">Sort by Date</option>
                <option value="relevance">Sort by Relevance</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      {resultStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-white/70 text-sm">Total</div>
            <div className="text-2xl font-bold">{resultStats.total}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-white/70 text-sm">Clothing</div>
            <div className="text-2xl font-bold">{resultStats.clothing}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-white/70 text-sm">Makeup</div>
            <div className="text-2xl font-bold">{resultStats.makeup}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-white/70 text-sm">Avg Price</div>
            <div className="text-2xl font-bold">
              ${resultStats.avgPrice.toFixed(0)}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
        >
          <button
            onClick={toggleSelectAll}
            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm"
          >
            {selectedItems.size === searchResults.length
              ? "Deselect All"
              : "Select All"}
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete {selectedItems.size}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleShowAnalytics}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-sm flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </motion.div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 p-3 w-full hover:bg-white/5 rounded-lg transition"
        >
          <input
            type="checkbox"
            checked={selectedItems.size === searchResults.length && searchResults.length > 0}
            readOnly
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">
            {selectedItems.size === searchResults.length && searchResults.length > 0
              ? "Deselect all"
              : "Select all"}
          </span>
        </button>

        <AnimatePresence>
          {searchResults.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-lg border transition",
                selectedItems.has(item.id)
                  ? "bg-white/10 border-white/20"
                  : "hover:bg-white/5 border-white/10"
              )}
            >
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => toggleItemSelection(item.id)}
                className="w-4 h-4"
              />
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-white/70">
                  {item.category}
                  {item.color && ` • ${item.color}`}
                  {item.price && ` • $${item.price}`}
                </div>
              </div>
              {item.wishlist && (
                <span className="text-xs px-2 py-1 bg-pink-500/20 rounded text-pink-300">
                  Wishlist
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Analytics Modal */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setStats(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-b from-white/10 to-white/5 rounded-xl p-6 max-w-2xl w-full max-h-80 overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Closet Analytics
              </h3>
              <button
                onClick={() => setStats(null)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/70 text-sm">Total Items</div>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Total Value</div>
                <div className="text-2xl font-bold">
                  ${stats.totalValue.toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Avg Price</div>
                <div className="text-2xl font-bold">
                  ${stats.avgPrice.toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Top Color</div>
                <div className="text-2xl font-bold">
                  {stats.topColors[0]?.value || "N/A"}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Top Brands</h4>
              <div className="space-y-1">
                {stats.topBrands.slice(0, 3).map((brand: any) => (
                  <div
                    key={brand.value}
                    className="flex justify-between text-sm text-white/70"
                  >
                    <span>{brand.value}</span>
                    <span>{brand.count} items</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

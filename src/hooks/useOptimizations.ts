/**
 * Advanced store hooks with optimization utilities
 */

import { useCallback, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import {
  searchItems,
  groupBy,
  getMostCommon,
  calculateStats,
  filterItemsByMultiple,
} from "@/utils/advancedSearch";
import {
  analyticsTracker,
  featureUsageTracker,
  userBehaviorAnalyzer,
} from "@/lib/analytics";
import type { Item, Look } from "@/types";

/**
 * Hook for advanced item searching with caching
 */
export function useAdvancedItemSearch() {
  const { items } = useStore();

  return useCallback(
    (query: string, options = {}) => {
      analyticsTracker.trackAction("search", "items", items.length, { query });
      featureUsageTracker.trackFeatureUse("advanced_search");

      return searchItems(items, {
        query,
        ...options,
      });
    },
    [items]
  );
}

/**
 * Hook for item analytics and insights
 */
export function useItemAnalytics() {
  const { items } = useStore();

  return useMemo(() => {
    const byType = groupBy(items, "type");
    const byCategory = groupBy(items, "category");
    const topColors = getMostCommon(items, "color", 10);
    const topBrands = getMostCommon(items, "brand", 10);
    const priceStats = calculateStats(items, "price");

    return {
      totalItems: items.length,
      byType: Object.fromEntries(byType),
      byCategory: Object.fromEntries(byCategory),
      topColors,
      topBrands,
      priceStats,
      totalValue: items.reduce((sum, item) => sum + (item.price || 0), 0),
      avgPrice: priceStats.avg,
    };
  }, [items]);
}

/**
 * Hook for outfit analytics
 */
export function useOutfitAnalytics() {
  const { items, looks } = useStore();

  return useMemo(() => {
    const itemUsageCount = new Map<string, number>();

    looks.forEach((look) => {
      look.items.forEach((itemId) => {
        itemUsageCount.set(itemId, (itemUsageCount.get(itemId) || 0) + 1);
      });
    });

    const mostWornItems = items
      .map((item) => ({
        ...item,
        wears: itemUsageCount.get(item.id) || 0,
      }))
      .filter((item) => item.wears > 0)
      .sort((a, b) => b.wears - a.wears);

    const unusedItems = items.filter((item) => !itemUsageCount.has(item.id));

    return {
      totalOutfits: looks.length,
      totalWears: itemUsageCount.size,
      mostWornItems: mostWornItems.slice(0, 10),
      unusedItems,
      averageOutfitSize:
        looks.length > 0
          ? looks.reduce((sum, l) => sum + l.items.length, 0) / looks.length
          : 0,
    };
  }, [items, looks]);
}

/**
 * Hook for tracking feature usage
 */
export function useFeatureTracking(featureName: string) {
  return useCallback(() => {
    featureUsageTracker.trackFeatureUse(featureName);
    analyticsTracker.trackEvent("feature_used", { feature: featureName });
  }, [featureName]);
}

/**
 * Hook for user interactions with error tracking
 */
export function useInteractionTracking() {
  return {
    trackClick: (element: string) => {
      userBehaviorAnalyzer.recordInteraction("click", element);
    },
    trackFormSubmit: (formName: string, fields: string[]) => {
      userBehaviorAnalyzer.recordFormSubmission(formName, fields);
    },
    trackError: (error: Error, context?: string) => {
      userBehaviorAnalyzer.recordError(error, context);
    },
    trackSearch: (query: string, resultCount: number) => {
      userBehaviorAnalyzer.recordSearch(query, resultCount);
    },
  };
}

/**
 * Hook for batch operations with progress
 */
export function useBatchOperations() {
  const { addItem, removeItem } = useStore();

  return useCallback(
    async (
      items: Item[],
      operation: "add" | "remove",
      onProgress?: (done: number, total: number) => void
    ) => {
      const total = items.length;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          if (operation === "add") {
            await addItem(item);
          } else if (operation === "remove") {
            removeItem(item.id);
          }
        } catch (error) {
          console.error(`Failed to ${operation} item:`, error);
        }
        onProgress?.(i + 1, total);
      }

      analyticsTracker.trackAction("batch_operation", operation, total);
    },
    [addItem, removeItem]
  );
}

/**
 * Hook for cache statistics
 */
export function useCacheStats() {
  return useMemo(() => {
    // Can be extended to return cache stats from cache instances
    return {
      status: "enabled",
      type: "idb-keyval",
      note: "Automatic caching via IndexedDB",
    };
  }, []);
}

/**
 * Hook for user session analytics
 */
export function useSessionAnalytics() {
  return useMemo(() => {
    const analysis = userBehaviorAnalyzer.getSessionAnalysis();
    const features = featureUsageTracker.getMostUsedFeatures(5);
    const report = analyticsTracker.generateReport();

    return {
      sessionDuration: analysis.duration,
      eventCount: analysis.eventCount,
      errorCount: analysis.errorCount,
      interactions: analysis.interactions,
      topFeatures: features,
      topPages: report.topPages.slice(0, 5),
      topActions: report.topActions.slice(0, 5),
    };
  }, []);
}

/**
 * Hook for recommendation engine
 */
export function useRecommendations() {
  const { items, looks } = useStore();

  return useMemo(() => {
    const byColor = groupBy(items, "color");
    const outfitStats = new Map<string, number>();

    looks.forEach((look) => {
      look.items.forEach((itemId) => {
        outfitStats.set(itemId, (outfitStats.get(itemId) || 0) + 1);
      });
    });

    // Recommend complementary items (same color, same category)
    const recommendations = items
      .map((item) => {
        const sameColorItems = byColor.get(item.color)?.length || 0;
        const wears = outfitStats.get(item.id) || 0;
        const score = sameColorItems * 0.3 + wears * 0.7;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => r.item);

    return recommendations;
  }, [items, looks]);
}

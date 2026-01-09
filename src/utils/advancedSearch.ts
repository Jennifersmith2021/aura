/**
 * Advanced search and filtering utilities
 */

import type { Item, Look, MeasurementLog } from "@/types";

interface SearchOptions {
  query: string;
  type?: "clothing" | "makeup";
  category?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  brand?: string;
  dateFrom?: number;
  dateTo?: number;
  wishlistOnly?: boolean;
  sortBy?: "name" | "price" | "date" | "relevance";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

interface FilterPreset {
  id: string;
  name: string;
  icon?: string;
  filters: Partial<SearchOptions>;
  userId?: string;
  createdAt: number;
}

/**
 * Search items with full-text and field-based filtering
 */
export function searchItems(items: Item[], options: SearchOptions): Item[] {
  let results = [...items];

  // Text search (name, brand, category)
  if (options.query) {
    const q = options.query.toLowerCase();
    results = results.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }

  // Type filter
  if (options.type) {
    results = results.filter((item) => item.type === options.type);
  }

  // Category filter
  if (options.category) {
    results = results.filter((item) => item.category === options.category);
  }

  // Color filter
  if (options.color) {
    results = results.filter((item) =>
      item.color?.toLowerCase().includes(options.color!.toLowerCase())
    );
  }

  // Price range filter
  if (options.priceMin !== undefined) {
    results = results.filter((item) => (item.price || 0) >= options.priceMin!);
  }
  if (options.priceMax !== undefined) {
    results = results.filter((item) => (item.price || 0) <= options.priceMax!);
  }

  // Brand filter
  if (options.brand) {
    results = results.filter((item) =>
      item.brand?.toLowerCase().includes(options.brand!.toLowerCase())
    );
  }

  // Date range filter
  if (options.dateFrom) {
    results = results.filter((item) => item.dateAdded >= options.dateFrom!);
  }
  if (options.dateTo) {
    results = results.filter((item) => item.dateAdded <= options.dateTo!);
  }

  // Wishlist filter
  if (options.wishlistOnly) {
    results = results.filter((item) => item.wishlist === true);
  }

  // Sorting
  if (options.sortBy) {
    results.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (options.sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "price":
          aVal = a.price || 0;
          bVal = b.price || 0;
          break;
        case "date":
          aVal = a.dateAdded;
          bVal = b.dateAdded;
          break;
        case "relevance":
          if (!options.query) return 0;
          const q = options.query.toLowerCase();
          aVal = a.name.toLowerCase().startsWith(q) ? 0 : 1;
          bVal = b.name.toLowerCase().startsWith(q) ? 0 : 1;
          break;
      }

      if (aVal < bVal) return options.sortOrder === "desc" ? 1 : -1;
      if (aVal > bVal) return options.sortOrder === "desc" ? -1 : 1;
      return 0;
    });
  }

  // Pagination
  if (options.limit) {
    const start = options.offset || 0;
    results = results.slice(start, start + options.limit);
  }

  return results;
}

/**
 * Search looks by name or items
 */
export function searchLooks(
  looks: Look[],
  items: Item[],
  query: string
): Look[] {
  const q = query.toLowerCase();

  return looks.filter((look) => {
    // Name match
    if (look.name.toLowerCase().includes(q)) return true;

    // Item name match
    const matchingItems = look.items.filter((itemId) => {
      const item = items.find((i) => i.id === itemId);
      return item?.name.toLowerCase().includes(q);
    });

    return matchingItems.length > 0;
  });
}

/**
 * Search measurements by date range
 */
export function searchMeasurements(
  measurements: MeasurementLog[],
  dateFrom?: number,
  dateTo?: number
): MeasurementLog[] {
  return measurements.filter((m) => {
    if (dateFrom && m.date < dateFrom) return false;
    if (dateTo && m.date > dateTo) return false;
    return true;
  });
}

/**
 * Calculate search relevance score (0-1)
 */
export function calculateRelevance(item: Item, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  // Exact name match: 1.0
  if (item.name.toLowerCase() === q) score = 1.0;
  // Name starts with query: 0.9
  else if (item.name.toLowerCase().startsWith(q)) score = 0.9;
  // Name contains query: 0.7
  else if (item.name.toLowerCase().includes(q)) score = 0.7;
  // Brand match: 0.5
  else if (item.brand?.toLowerCase().includes(q)) score = 0.5;
  // Category match: 0.3
  else if (item.category.toLowerCase().includes(q)) score = 0.3;

  return score;
}

/**
 * Get items by multiple criteria (AND logic)
 */
export function filterItemsByMultiple(
  items: Item[],
  criteria: Record<string, any>
): Item[] {
  return items.filter((item) => {
    return Object.entries(criteria).every(([key, value]) => {
      if (value === undefined || value === null) return true;

      const itemValue = (item as any)[key];

      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }

      if (typeof value === "object") {
        // Range query: { min: 10, max: 50 }
        if ("min" in value && itemValue < value.min) return false;
        if ("max" in value && itemValue > value.max) return false;
        return true;
      }

      return itemValue === value;
    });
  });
}

/**
 * Group items by a field
 */
export function groupBy<T extends Record<string, any>>(
  items: T[],
  key: keyof T
): Map<any, T[]> {
  const groups = new Map<any, T[]>();

  items.forEach((item) => {
    const groupKey = item[key];
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(item);
  });

  return groups;
}

/**
 * Get most common values in a field
 */
export function getMostCommon<T extends Record<string, any>>(
  items: T[],
  key: keyof T,
  limit = 5
): Array<{ value: any; count: number }> {
  const counts = new Map<any, number>();

  items.forEach((item) => {
    const value = item[key];
    if (value !== undefined && value !== null) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Calculate statistics for numeric fields
 */
export function calculateStats(
  items: Item[],
  field: "price"
): {
  min: number;
  max: number;
  avg: number;
  median: number;
  count: number;
} {
  const values = items
    .map((item) => (item as any)[field])
    .filter((v) => typeof v === "number")
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, count: 0 };
  }

  const min = values[0];
  const max = values[values.length - 1];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const median =
    values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];

  return { min, max, avg, median, count: values.length };
}

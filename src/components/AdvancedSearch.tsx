"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Search, SlidersHorizontal, X, Star, Clock, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import type { Category } from "@/types";
import { toast } from "@/lib/toast";
import { useDebounce } from "@/hooks/useDebounce";

interface FilterOptions {
  categories: Category[];
  colors: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  dateRange: { start: string; end: string };
  wishlistOnly: boolean;
}

export default function AdvancedSearch() {
  const {
    items,
    searchHistory,
    savedSearches,
    addSearchHistory,
    clearSearchHistory,
    addSavedSearch,
    removeSavedSearch,
  } = useStore();

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    colors: [],
    brands: [],
    priceRange: { min: 0, max: 10000 },
    dateRange: { start: "", end: "" },
    wishlistOnly: false,
  });

  const allCategories: Category[] = ["top", "bottom", "dress", "shoe", "outerwear", "accessory", "face", "eye", "lip", "cheek", "tool"];
  const allColors = [...new Set(items.map((i) => i.color).filter(Boolean))];
  const allBrands = [...new Set(items.map((i) => i.brand).filter(Boolean))];

  const applyFilters = () => {
    const filtered = items.filter((item) => {
      const matchesQuery = !query || 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.brand?.toLowerCase().includes(query.toLowerCase()) ||
        item.notes?.toLowerCase().includes(query.toLowerCase());

      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(item.category);
      const matchesColor = filters.colors.length === 0 || (item.color && filters.colors.includes(item.color));
      const matchesBrand = filters.brands.length === 0 || (item.brand && filters.brands.includes(item.brand));
      const matchesPrice = !item.price || (item.price >= filters.priceRange.min && item.price <= filters.priceRange.max);
      const matchesWishlist = !filters.wishlistOnly || item.wishlist;

      let matchesDate = true;
      if (filters.dateRange.start) {
        matchesDate = matchesDate && item.dateAdded >= new Date(filters.dateRange.start).getTime();
      }
      if (filters.dateRange.end) {
        matchesDate = matchesDate && item.dateAdded <= new Date(filters.dateRange.end).getTime();
      }

      return matchesQuery && matchesCategory && matchesColor && matchesBrand && matchesPrice && matchesWishlist && matchesDate;
    });

    if (query.trim()) {
      addSearchHistory({
        query: query.trim(),
        searchType: "items",
        dateSearched: Date.now(),
      });
    }

    return filtered;
  };

  const results = applyFilters();

  const toggleFilter = (key: "categories" | "colors" | "brands", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter((v) => v !== value)
        : [...(prev[key] as string[]), value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      colors: [],
      brands: [],
      priceRange: { min: 0, max: 10000 },
      dateRange: { start: "", end: "" },
      wishlistOnly: false,
    });
  };

  const saveCurrentSearch = () => {
    const name = prompt("Name this search:");
    if (name?.trim()) {
      addSavedSearch({
        name: name.trim(),
        query,
        filters: filters as any,
        searchType: "items",
        dateCreated: Date.now(),
      });
      toast.success(`Search "${name.trim()}" saved!`);
    }
  };

  const loadSavedSearch = (search: typeof savedSearches[0]) => {
    setQuery(search.query);
    setFilters(search.filters as any);
    toast.info(`Loaded search: "${search.name}"`);
  };

  const recentSearches = searchHistory.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHistory(true)}
          placeholder="Search items, brands, notes..."
          className="w-full pl-10 pr-20 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              showFilters ? "bg-primary text-white" : "hover:bg-white/10"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search History Dropdown */}
      {showHistory && (recentSearches.length > 0 || savedSearches.length > 0) && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent
                </p>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => {
                      setQuery(search.query);
                      setShowHistory(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 text-sm"
                  >
                    {search.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {savedSearches.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                <Star className="w-3 h-3" />
                Saved
              </p>
              <div className="space-y-1">
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        loadSavedSearch(search);
                        setShowHistory(false);
                      }}
                      className="flex-1 text-left px-2 py-1.5 rounded hover:bg-white/10 text-sm"
                    >
                      {search.name}
                    </button>
                    <button
                      onClick={() => removeSavedSearch(search.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <div className="flex gap-2">
              <button
                onClick={saveCurrentSearch}
                className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
              >
                Save Search
              </button>
              <button
                onClick={clearFilters}
                className="text-xs px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleFilter("categories", cat)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    filters.categories.includes(cat)
                      ? "bg-primary text-white"
                      : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          {allColors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Colors</p>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleFilter("colors", color!)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                      filters.colors.includes(color!)
                        ? "bg-primary text-white"
                        : "bg-white/10 hover:bg-white/20"
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {allBrands.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Brands</p>
              <div className="flex flex-wrap gap-2">
                {allBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleFilter("brands", brand!)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      filters.brands.includes(brand!)
                        ? "bg-primary text-white"
                        : "bg-white/10 hover:bg-white/20"
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Price Range</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: Number(e.target.value) || 0 },
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) || 10000 },
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Date Added</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value },
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value },
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Wishlist Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.wishlistOnly}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, wishlistOnly: e.target.checked }))
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Wishlist items only</span>
            </label>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-sm font-semibold mb-3">{results.length} results</p>
        <div className="space-y-2">
          {results.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.type} • {item.category} {item.brand && `• ${item.brand}`} {item.price && `• $${item.price}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

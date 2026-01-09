"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { ShoppingBag, TrendingUp, AlertCircle, Sparkles, ExternalLink, ChevronRight } from "lucide-react";
import { Category } from "@/types";
import { useRouter } from "next/navigation";

interface WardrobeGap {
  category: Category;
  priority: "high" | "medium" | "low";
  reason: string;
  suggestions: string[];
  count: number;
}

interface ColorGap {
  color: string;
  missing: string[];
  suggestion: string;
}

interface ExamplePickup {
  title: string;
  image: string;
}

const exampleOutfits: Partial<Record<Category, ExamplePickup[]>> = {
  top: [
    { title: "Blush silk blouse", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80" },
    { title: "Cream satin camisole", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80" },
    { title: "Soft pink wrap top", image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80" },
    { title: "White puff-sleeve blouse", image: "https://images.unsplash.com/photo-1502716216588-48f2b619a078?auto=format&fit=crop&w=800&q=80" },
  ],
  bottom: [
    { title: "Champagne satin midi skirt", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80" },
    { title: "Blush pleated skirt", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80" },
    { title: "Tailored trousers", image: "https://images.unsplash.com/photo-1496747611180-206a5c8c46c0?auto=format&fit=crop&w=800&q=80" },
    { title: "Soft beige slip skirt", image: "https://images.unsplash.com/photo-1594906280862-f554a2987e1f?auto=format&fit=crop&w=800&q=80" },
  ],
  dress: [
    { title: "Champagne slip dress", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80" },
    { title: "Soft blush satin dress", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80" },
    { title: "Ivory pleated midi dress", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80" },
    { title: "Taupe wrap dress", image: "https://images.unsplash.com/photo-1542707188-e169cecf6d0d?auto=format&fit=crop&w=800&q=80" },
  ],
  shoe: [
    { title: "Nude strappy heels", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80" },
    { title: "Blush ankle strap sandal", image: "https://images.unsplash.com/photo-1543163521-9feb0e98fc5e?auto=format&fit=crop&w=800&q=80" },
    { title: "Beige block heel", image: "https://images.unsplash.com/photo-1543147867-9c5f62bcd2c3?auto=format&fit=crop&w=800&q=80" },
    { title: "Soft ivory stiletto", image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=800&q=80" },
  ],
  outerwear: [
    { title: "Beige belted trench", image: "https://images.unsplash.com/photo-1552062407-291826ab63fd?auto=format&fit=crop&w=800&q=80" },
    { title: "Camel wrap coat", image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?auto=format&fit=crop&w=800&q=80" },
    { title: "Blush drape coat", image: "https://images.unsplash.com/photo-1539533057592-4c69c773039a?auto=format&fit=crop&w=800&q=80" },
    { title: "Cream longline blazer", image: "https://images.unsplash.com/photo-1516886657613-e56d30e633e2?auto=format&fit=crop&w=800&q=80" },
  ],
  accessory: [
    { title: "Delicate gold pendant", image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80" },
    { title: "Pearl drop earrings", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80" },
    { title: "Rose gold bracelet", image: "https://images.unsplash.com/photo-1535534675261-ea4d612ad47f?auto=format&fit=crop&w=800&q=80" },
    { title: "Silk scarf in blush", image: "https://images.unsplash.com/photo-1494726161322-3aa4142f9c21?auto=format&fit=crop&w=800&q=80" },
  ],
  legging: [
    { title: "Blush sculpting leggings", image: "https://images.unsplash.com/photo-1506629082632-401017062afa?auto=format&fit=crop&w=800&q=80" },
    { title: "Taupe seamless leggings", image: "https://images.unsplash.com/photo-1506259773147-a8eba07c0d19?auto=format&fit=crop&w=800&q=80" },
    { title: "Dusty rose rib leggings", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b8d6?auto=format&fit=crop&w=800&q=80" },
    { title: "Ivory yoga leggings", image: "https://images.unsplash.com/photo-1506629082632-401017062afa?auto=format&fit=crop&w=800&q=80" },
  ],
};

export function WardrobeGapAnalyzer() {
  const { items } = useStore();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);

  const clothingItems = items.filter((i) => i.type === "clothing");

  // Analyze wardrobe gaps
  const analysis = useMemo(() => {
    const categoryCounts: Record<Category, number> = {
      top: 0,
      bottom: 0,
      dress: 0,
      shoe: 0,
      outerwear: 0,
      accessory: 0,
      legging: 0,
      face: 0,
      eye: 0,
      lip: 0,
      cheek: 0,
      tool: 0,
      other: 0,
    };

    const colorsByCategory: Record<string, Set<string>> = {};

    clothingItems.forEach((item) => {
      categoryCounts[item.category]++;
      
      if (item.color) {
        if (!colorsByCategory[item.category]) {
          colorsByCategory[item.category] = new Set();
        }
        colorsByCategory[item.category].add(item.color.toLowerCase());
      }
    });

    // Identify gaps
    const gaps: WardrobeGap[] = [];

    // Essential categories
    const essentials: Array<{ cat: Category; min: number; suggestions: string[] }> = [
      { cat: "top", min: 5, suggestions: ["Basic tees", "Blouses", "Crop tops", "Sweaters"] },
      { cat: "bottom", min: 4, suggestions: ["Jeans", "Skirts", "Shorts", "Slacks"] },
      { cat: "dress", min: 2, suggestions: ["Casual dress", "Party dress", "Maxi dress"] },
      { cat: "shoe", min: 3, suggestions: ["Sneakers", "Heels", "Flats", "Boots"] },
      { cat: "outerwear", min: 2, suggestions: ["Jacket", "Cardigan", "Coat"] },
      { cat: "legging", min: 2, suggestions: ["Yoga pants", "Athletic leggings", "Cozy leggings"] },
      { cat: "accessory", min: 3, suggestions: ["Belt", "Scarf", "Jewelry", "Bag"] },
    ];

    essentials.forEach(({ cat, min, suggestions }) => {
      const count = categoryCounts[cat];
      if (count === 0) {
        gaps.push({
          category: cat,
          priority: "high",
          reason: `No ${cat}s in your closet - essential wardrobe category`,
          suggestions: suggestions.slice(0, 3),
          count: 0,
        });
      } else if (count < min) {
        gaps.push({
          category: cat,
          priority: count < min / 2 ? "high" : "medium",
          reason: `Only ${count} ${cat}${count === 1 ? "" : "s"} - recommend at least ${min}`,
          suggestions: suggestions.slice(0, 2),
          count,
        });
      }
    });

    // Color diversity check
    const colorGaps: ColorGap[] = [];
    const essentialColors = ["black", "white", "gray", "blue", "pink"];
    
    ["top", "bottom", "dress"].forEach((cat) => {
      const colors = colorsByCategory[cat] || new Set();
      const missing = essentialColors.filter(c => !colors.has(c));
      
      if (missing.length > 2) {
        colorGaps.push({
          color: cat,
          missing,
          suggestion: `Add ${missing.slice(0, 2).join(" or ")} ${cat}s for versatility`,
        });
      }
    });

    // Sort gaps by priority
    gaps.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return { gaps, colorGaps, categoryCounts };
  }, [clothingItems]);

  const totalGaps = analysis.gaps.filter(g => g.priority === "high" || g.priority === "medium").length;

  const handleShopCategory = (category: Category) => {
    // Navigate to shopping page with category pre-filled
    router.push(`/shopping?category=${category}`);
  };

  const handleShopColor = (category: string, color: string) => {
    router.push(`/shopping?category=${category}&color=${color}`);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl flex items-center justify-between hover:from-purple-600 hover:to-pink-600 transition-all"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Wardrobe Gap Analyzer</div>
            <div className="text-xs opacity-90">
              {totalGaps > 0 ? `${totalGaps} gaps found - tap to view suggestions` : "Your wardrobe is well-rounded!"}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Wardrobe Gap Analyzer
            </h3>
            <p className="text-xs text-muted-foreground">
              Smart recommendations based on your {clothingItems.length} items
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          Collapse
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalGaps}</div>
          <div className="text-xs text-muted-foreground">Gaps Found</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-pink-600">
            {analysis.gaps.filter(g => g.priority === "high").length}
          </div>
          <div className="text-xs text-muted-foreground">High Priority</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {analysis.colorGaps.length}
          </div>
          <div className="text-xs text-muted-foreground">Color Gaps</div>
        </div>
      </div>

      {/* Gap List */}
      {analysis.gaps.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recommended Categories to Shop
          </h4>
          
          {analysis.gaps.map((gap, idx) => (
            <div
              key={`${gap.category}-${idx}`}
              className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 ${
                gap.priority === "high"
                  ? "border-red-500"
                  : gap.priority === "medium"
                    ? "border-yellow-500"
                    : "border-blue-500"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {gap.category}s
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        gap.priority === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : gap.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {gap.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{gap.reason}</p>
                  
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {gap.suggestions.map((suggestion, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                      >
                        {suggestion}
                      </span>
                    ))}
                  </div>

                  {/* Visual examples */}
                  {exampleOutfits[gap.category]?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Example pickups</p>
                      <div className="grid grid-cols-2 gap-2">
                        {exampleOutfits[gap.category]!.slice(0, 4).map((example, i) => (
                          <div key={i} className="rounded-lg border border-border overflow-hidden bg-white/70 dark:bg-slate-900/60">
                            <div className="aspect-[4/3] bg-muted">
                              <img
                                src={example.image}
                                alt={example.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="px-2 py-1 text-[11px] font-medium text-foreground border-t border-border">
                              {example.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <button
                onClick={() => handleShopCategory(gap.category)}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop {gap.category}s now
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <div className="text-green-600 dark:text-green-400 mb-2">✨</div>
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Your wardrobe is well-balanced!
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            You have a good variety across all essential categories.
          </p>
        </div>
      )}

      {/* Color Gaps */}
      {analysis.colorGaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Color Diversity Suggestions
          </h4>
          
          {analysis.colorGaps.map((colorGap, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-border"
            >
              <p className="text-sm text-muted-foreground mb-2">{colorGap.suggestion}</p>
              <div className="flex flex-wrap gap-2">
                {colorGap.missing.slice(0, 3).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleShopColor(colorGap.color, color)}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: color }}
                    />
                    Shop {color}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 border border-purple-300 dark:border-purple-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              Pro Tip: Build a Capsule Wardrobe
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Start with versatile basics in neutral colors, then add statement pieces. Aim for items that can be mixed and matched.
            </p>
            <button
              onClick={() => router.push("/shopping")}
              className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 flex items-center gap-1"
            >
              Browse all shopping options
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

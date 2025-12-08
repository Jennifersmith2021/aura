"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { useWeather } from "@/hooks/useWeather";
import { Item, Category } from "@/types";
import { Shirt, Save, RotateCcw, Undo, Redo, Sparkles, AlertCircle, CheckCircle, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { getDailyQuote } from "@/utils/quotes";

// Define body layers for clothing overlay
const BODY_LAYERS = {
  base: "underwear", // Always visible base layer
  bottom: "bottom", // Pants, skirts, shorts
  top: "top", // Shirts, blouses
  outerwear: "outerwear", // Jackets, coats
  shoe: "shoe", // Shoes
  accessory: "accessory" // Accessories (might be positioned elsewhere)
} as const;

type BodyLayer = keyof typeof BODY_LAYERS;
type WornItem = { item: Item; position: { x: number; y: number }; rotation: number };

interface OutfitValidation {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}

export function FittingRoom() {
  const { items, addLook, addTimelineEntry, addItem } = useStore();
  const { weather } = useWeather();

  // Fitting room state
  const [wornItems, setWornItems] = useState<Record<BodyLayer, WornItem | null>>({
    base: null,
    bottom: null,
    top: null,
    outerwear: null,
    shoe: null,
    accessory: null,
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const [draggingItem, setDraggingItem] = useState<BodyLayer | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Undo/Redo functionality
  const [history, setHistory] = useState<Record<BodyLayer, WornItem | null>[]>([wornItems]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Canvas ref for rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mannequinRef = useRef<HTMLDivElement>(null);

  // Available clothing items
  const clothingItems = items.filter(i => i.type === "clothing");

  // Save current state to history
  const saveToHistory = useCallback((newState: Record<BodyLayer, WornItem | null>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...newState });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Handle item repositioning drag
  const handleItemDrag = useCallback((e: React.MouseEvent, layer: BodyLayer) => {
    if (!wornItems[layer]) return;

    setDraggingItem(layer);
    setIsDragging(true);
    e.preventDefault();

    const item = wornItems[layer]!;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = item.position;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = mannequinRef.current?.getBoundingClientRect();
      if (!rect) return;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newX = Math.max(0, Math.min(100, startPos.x + (deltaX / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, startPos.y + (deltaY / rect.height) * 100));

      setWornItems(prev => ({
        ...prev,
        [layer]: {
          ...item,
          position: { x: newX, y: newY },
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingItem(null);
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Save to history after drag completes
      const currentState = { ...wornItems };
      if (wornItems[layer]) {
        currentState[layer] = { ...wornItems[layer]! };
      }
      saveToHistory(currentState);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [wornItems, saveToHistory]);

  // Validation for current outfit
  const validateOutfit = useCallback((): OutfitValidation => {
    const worn = Object.values(wornItems).filter(Boolean) as WornItem[];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for category conflicts
    const categories = worn.map(w => w.item.category);
    if (categories.filter(c => c === "dress").length > 1) {
      warnings.push("Multiple dresses detected - dresses usually replace tops and bottoms");
    }

    if (categories.includes("dress") && (categories.includes("top") || categories.includes("bottom"))) {
      warnings.push("Dresses typically don't pair with separate tops or bottoms");
    }

    // Weather-based suggestions
    if (weather) {
      const temp = weather.temperature;
      if (temp < 50 && !categories.includes("outerwear")) {
        suggestions.push("Consider adding outerwear for cold weather");
      }
      if (temp > 80 && categories.includes("outerwear")) {
        suggestions.push("Might be too warm for outerwear today");
      }
    }

    // Basic outfit completeness
    if (!categories.includes("top") && !categories.includes("dress")) {
      warnings.push("No top or dress - outfit might feel incomplete");
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions,
    };
  }, [wornItems, weather]);

  const validation = validateOutfit();

  // Wear an item on a specific layer
  const wearItem = useCallback((item: Item, layer: BodyLayer) => {
    const newWornItems = {
      ...wornItems,
      [layer]: {
        item,
        position: { x: 50, y: 50 }, // Center position
        rotation: 0,
      },
    };
    setWornItems(newWornItems);
    saveToHistory(newWornItems);
  }, [wornItems, saveToHistory]);

  // Remove item from layer
  const removeItem = useCallback((layer: BodyLayer) => {
    const newWornItems = { ...wornItems, [layer]: null };
    setWornItems(newWornItems);
    saveToHistory(newWornItems);
  }, [wornItems, saveToHistory]);

  // Handle drag and drop with position tracking
  const handleDrop = useCallback((e: React.DragEvent, layer: BodyLayer) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    const item = clothingItems.find(i => i.id === itemId);
    if (!item) return;

    // Get drop position relative to the mannequin container
    const rect = mannequinRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain position within reasonable bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    const newWornItems = {
      ...wornItems,
      [layer]: {
        item,
        position: { x: constrainedX, y: constrainedY },
        rotation: 0,
      },
    };
    setWornItems(newWornItems);
    saveToHistory(newWornItems);
  }, [clothingItems, wornItems, saveToHistory]);


  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setWornItems(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setWornItems(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Get available items for a category
  const getItemsForCategory = useCallback((category: Category) => {
    return clothingItems.filter(item => item.category === category);
  }, [clothingItems]);

  // Save outfit as a look
  const saveOutfit = async () => {
    if (!outfitName.trim()) return;

    setIsSaving(true);
    try {
      const wornItemIds = Object.values(wornItems)
        .filter(Boolean)
        .map(w => w!.item.id);

      const look = {
        id: uuidv4(),
        name: outfitName,
        items: wornItemIds,
        dateCreated: Date.now(),
      };

      await addLook(look);

      // Add to timeline
      await addTimelineEntry({
        id: uuidv4(),
        date: Date.now(),
        photo: "", // Could capture canvas here
        lookId: look.id,
        notes: `Created outfit: ${outfitName}`,
      });

      setShowSaveDialog(false);
      setOutfitName("");
    } catch (error) {
      console.error("Failed to save outfit:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get layer-specific styling
  const getLayerStyle = (layer: BodyLayer, item: WornItem | null) => {
    if (!item) return {};

    return {
      position: "absolute" as const,
      left: `${item.position.x}%`,
      top: `${item.position.y}%`,
      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
      zIndex: Object.keys(BODY_LAYERS).indexOf(layer),
    };
  };

  const handleSeedData = async () => {
    const seedItems: Item[] = [
      { id: uuidv4(), name: "White Linen Shirt", category: "top", type: "clothing", color: "White", dateAdded: Date.now(), price: 45, image: "https://placehold.co/400x400/f5f5f5/333333?text=Linen+Shirt" },
      { id: uuidv4(), name: "Black Silk Cami", category: "top", type: "clothing", color: "Black", dateAdded: Date.now(), price: 30, image: "https://placehold.co/400x400/222222/ffffff?text=Silk+Cami" },
      { id: uuidv4(), name: "Blue Vintage Jeans", category: "bottom", type: "clothing", color: "Blue", dateAdded: Date.now(), price: 80, image: "https://placehold.co/400x400/3b82f6/ffffff?text=Jeans" },
      { id: uuidv4(), name: "Beige Midi Skirt", category: "bottom", type: "clothing", color: "Beige", dateAdded: Date.now(), price: 55, image: "https://placehold.co/400x400/e5e5e5/333333?text=Skirt" },
      { id: uuidv4(), name: "Floral Summer Dress", category: "dress", type: "clothing", color: "Pink/Floral", dateAdded: Date.now(), price: 65, image: "https://placehold.co/400x400/fecaca/7f1d1d?text=Dress" },
      { id: uuidv4(), name: "Denim Jacket", category: "outerwear", type: "clothing", color: "Dark Blue", dateAdded: Date.now(), price: 90, image: "https://placehold.co/400x400/1e3a8a/ffffff?text=Jacket" },
      { id: uuidv4(), name: "White Sneakers", category: "shoe", type: "clothing", color: "White", dateAdded: Date.now(), price: 75, image: "https://placehold.co/400x400/ffffff/000000?text=Sneakers" },
      { id: uuidv4(), name: "Gold Hoop Earrings", category: "accessory", type: "clothing", color: "Gold", dateAdded: Date.now(), price: 25, image: "https://placehold.co/400x400/fbbf24/78350f?text=Hoops" },
      { id: uuidv4(), name: "Red Lipstick", category: "lip", type: "makeup", color: "Red", dateAdded: Date.now(), price: 28, image: "https://placehold.co/400x400/ef4444/ffffff?text=Lipstick" },
    ];

    for (const item of seedItems) {
      await addItem(item);
    }
    alert("Seed data added!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Virtual Fitting Room</h2>
          <p className="text-sm text-muted-foreground">Drag items to try them on virtually</p>
        </div>

        <div className="flex gap-2">
          {/* Dev Seed Button */}
          {process.env.NODE_ENV !== "production" && (
            <button
              onClick={handleSeedData}
              className="p-2 rounded-lg border hover:bg-muted text-muted-foreground"
              title="Seed Test Data"
            >
              <Database className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Outfit
          </button>

        </div>
      </div>

      {/* Weather Context */}
      {weather && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Today&apos;s Weather:</span>
            <span>{Math.round(weather.temperature)}°F</span>
            <span className="text-muted-foreground">•</span>
            <span>{weather.weatherCode}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Virtual Mannequin */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
            <div className="relative w-full max-w-sm mx-auto">
              {/* Mannequin Base */}
              <div
                ref={mannequinRef}
                className="relative aspect-[3/4] bg-gradient-to-b from-pink-100 to-pink-200 dark:from-slate-700 dark:to-slate-800 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
                style={{ minHeight: "400px" }}
              >
                {/* Base mannequin silhouette - could be replaced with actual image */}
                <div className="w-32 h-48 bg-slate-300 dark:bg-slate-600 rounded-full opacity-20"></div>

                {/* Clothing Layers */}
                {Object.entries(wornItems).map(([layer, worn]) => (
                  worn && (
                    <div
                      key={layer}
                      style={getLayerStyle(layer as BodyLayer, worn)}
                      className="cursor-move select-none"
                      onMouseDown={(e) => handleItemDrag(e, layer as BodyLayer)}
                      title={`Drag to reposition ${worn.item.name}`}
                    >
                      {worn.item.image ? (
                        <img
                          src={worn.item.image}
                          alt={worn.item.name}
                          className="w-24 h-24 object-contain drop-shadow-lg rounded-lg"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
                          <Shirt className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {/* Layer indicator */}
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full font-medium">
                        {layer.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )
                ))}

                {/* Drop zones for drag and drop */}
                {Object.entries(BODY_LAYERS).map(([layer, category]) => (
                  <div
                    key={layer}
                    className={cn(
                      "absolute border-2 border-dashed rounded-lg transition-colors",
                      wornItems[layer as BodyLayer] ? "border-green-300 bg-green-50" : "border-muted-foreground/30 hover:border-primary/50",
                      layer === "base" && "inset-4", // Full body for base layer
                      layer === "bottom" && "bottom-4 left-4 right-4 h-16", // Lower body
                      layer === "top" && "top-16 left-8 right-8 h-20", // Upper body
                      layer === "outerwear" && "top-12 left-6 right-6 h-24", // Over top
                      layer === "shoe" && "bottom-2 left-12 right-12 h-8", // Feet
                      layer === "accessory" && "top-8 left-2 w-8 h-8" // Accessories
                    )}
                    onDrop={(e) => handleDrop(e, layer as BodyLayer)}
                    onDragOver={(e) => e.preventDefault()}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Item Selection Sidebar */}
        <div className="space-y-4">
          {/* Category Selector */}
          <div>
            <h3 className="font-medium mb-3">Select Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {["top", "bottom", "dress", "outerwear", "shoe", "accessory"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as Category)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {selectedCategory && (
            <div>
              <h3 className="font-medium mb-3 capitalize">{selectedCategory} Items</h3>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {getItemsForCategory(selectedCategory).map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", item.id);
                      setDraggedItem(item);
                    }}
                    onDragEnd={() => setDraggedItem(null)}
                    className="aspect-square rounded-lg border bg-white dark:bg-slate-800 p-2 cursor-move hover:shadow-md transition-shadow"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                        <Shirt className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Outfit Summary */}
          <div>
            <h3 className="font-medium mb-3">Current Outfit</h3>
            <div className="space-y-2">
              {Object.entries(wornItems).map(([layer, worn]) => (
                worn && (
                  <div key={layer} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{layer}:</span>
                      <span className="text-sm text-muted-foreground">{worn.item.name}</span>
                    </div>
                    <button
                      onClick={() => removeItem(layer as BodyLayer)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Validation Messages */}
          {validation.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Style Tips</span>
              </div>
              <ul className="mt-2 space-y-1">
                {validation.warnings.map((warning, i) => (
                  <li key={i} className="text-xs text-amber-700 dark:text-amber-300">• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.suggestions.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Suggestions</span>
              </div>
              <ul className="mt-2 space-y-1">
                {validation.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-xs text-blue-700 dark:text-blue-300">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Save Outfit Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Save Outfit</h3>
            <input
              type="text"
              placeholder="Outfit name (e.g., Date Night)"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={saveOutfit}
                disabled={!outfitName.trim() || isSaving}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

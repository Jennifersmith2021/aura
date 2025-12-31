"use client";

import { useMemo, useState } from "react";
import { Shuffle, Save, Trash2, Sparkles, Heart, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/hooks/useStore";
import clsx from "clsx";
import { Item } from "@/types";

interface OutfitCombo {
    id: string;
    name: string;
    itemIds: string[];
    occasion: string;
    favorite: boolean;
    createdAt: string;
}

const bodySlots = ["top", "bottom", "dress", "outerwear", "shoes", "accessories"];
const occasions = ["Casual", "Work", "Date", "Party", "Gym", "Loungewear"];

export default function OutfitSimulator() {
    const { items, looks } = useStore();
    const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
    const [savedCombos, setSavedCombos] = useState<OutfitCombo[]>([]);
    const [comboName, setComboName] = useState("");
    const [selectedOccasion, setSelectedOccasion] = useState("Casual");
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const clothingItems = items.filter((i) => i.type === "clothing");

    const getItemsForCategory = (category: string) => {
        return clothingItems.filter((item) => item.category === category);
    };

    const selectItem = (category: string, itemId: string) => {
        setSelectedItems((prev) => {
            const newSelection = { ...prev };
            if (newSelection[category] === itemId) {
                delete newSelection[category];
            } else {
                newSelection[category] = itemId;
            }
            return newSelection;
        });
    };

    const randomizeOutfit = () => {
        const newSelection: Record<string, string> = {};
        
        // Decide if dress or top+bottom
        const useDress = Math.random() > 0.5;
        
        if (useDress) {
            const dresses = getItemsForCategory("dress");
            if (dresses.length > 0) {
                newSelection.dress = dresses[Math.floor(Math.random() * dresses.length)].id;
            }
        } else {
            const tops = getItemsForCategory("top");
            const bottoms = getItemsForCategory("bottom");
            if (tops.length > 0) {
                newSelection.top = tops[Math.floor(Math.random() * tops.length)].id;
            }
            if (bottoms.length > 0) {
                newSelection.bottom = bottoms[Math.floor(Math.random() * bottoms.length)].id;
            }
        }
        
        // Add shoes
        const shoes = getItemsForCategory("shoes");
        if (shoes.length > 0) {
            newSelection.shoes = shoes[Math.floor(Math.random() * shoes.length)].id;
        }
        
        // Add accessories (50% chance)
        if (Math.random() > 0.5) {
            const accessories = getItemsForCategory("accessories");
            if (accessories.length > 0) {
                newSelection.accessories = accessories[Math.floor(Math.random() * accessories.length)].id;
            }
        }
        
        setSelectedItems(newSelection);
    };

    const saveCombo = () => {
        if (!comboName.trim() || Object.keys(selectedItems).length === 0) return;

        const combo: OutfitCombo = {
            id: Date.now().toString(),
            name: comboName,
            itemIds: Object.values(selectedItems),
            occasion: selectedOccasion,
            favorite: false,
            createdAt: new Date().toISOString(),
        };

        const updated = [combo, ...savedCombos];
        setSavedCombos(updated);
        localStorage.setItem("outfitCombos", JSON.stringify(updated));
        
        setComboName("");
        setShowSaveForm(false);
    };

    const loadCombo = (combo: OutfitCombo) => {
        const newSelection: Record<string, string> = {};
        combo.itemIds.forEach((itemId) => {
            const item = items.find((i) => i.id === itemId);
            if (item && item.category) {
                newSelection[item.category] = itemId;
            }
        });
        setSelectedItems(newSelection);
    };

    const toggleFavorite = (comboId: string) => {
        const updated = savedCombos.map((c) =>
            c.id === comboId ? { ...c, favorite: !c.favorite } : c
        );
        setSavedCombos(updated);
        localStorage.setItem("outfitCombos", JSON.stringify(updated));
    };

    const deleteCombo = (comboId: string) => {
        const updated = savedCombos.filter((c) => c.id !== comboId);
        setSavedCombos(updated);
        localStorage.setItem("outfitCombos", JSON.stringify(updated));
    };

    const selectedItemsArray = useMemo(
        () =>
            Object.values(selectedItems)
                .map((id) => items.find((i) => i.id === id))
                .filter((i): i is Item => Boolean(i)),
        [items, selectedItems]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Outfit Simulator</h2>
                    <p className="text-sm text-muted-foreground">Mix and match your wardrobe</p>
                </div>
                <button
                    onClick={randomizeOutfit}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow"
                >
                    <Shuffle className="w-4 h-4" />
                    Random
                </button>
            </div>

            {/* Current Outfit Preview */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/30">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Current Outfit
                </h3>
                
                {selectedItemsArray.length > 0 ? (
                    <>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {selectedItemsArray.map((item) => (
                                <div key={item.id} className="relative">
                                    <div className="aspect-square rounded-xl overflow-hidden bg-secondary border-2 border-white/10">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-2">
                                                <span className="text-xs text-foreground font-medium text-center">
                                                    {item.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium text-center mt-1 truncate">
                                        {item.name}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSaveForm(!showSaveForm)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow"
                            >
                                <Save className="w-4 h-4" />
                                Save Combo
                            </button>
                            <button
                                onClick={() => setSelectedItems({})}
                                className="px-4 py-2.5 bg-secondary text-foreground rounded-xl font-semibold text-sm hover:bg-accent transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Save Form */}
                        <AnimatePresence>
                            {showSaveForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-4 pt-4 border-t border-white/10 space-y-3"
                                >
                                    <input
                                        type="text"
                                        value={comboName}
                                        onChange={(e) => setComboName(e.target.value)}
                                        placeholder="Outfit name..."
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                    />
                                    <select
                                        value={selectedOccasion}
                                        onChange={(e) => setSelectedOccasion(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                    >
                                        {occasions.map((occ) => (
                                            <option key={occ} value={occ}>
                                                {occ}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={saveCombo}
                                        disabled={!comboName.trim()}
                                        className="w-full py-2 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Select items below to create an outfit</p>
                        <p className="text-sm mt-1">Or click Random to get started!</p>
                    </div>
                )}
            </div>

            {/* Item Selection by Category */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-foreground">Select Items</h3>

                {["top", "bottom", "dress", "shoes", "accessories"].map((category) => {
                    const categoryItems = getItemsForCategory(category);
                    if (categoryItems.length === 0) return null;

                    return (
                        <div key={category} className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <h4 className="font-semibold text-sm text-foreground mb-3 capitalize flex items-center justify-between">
                                <span>{category} ({categoryItems.length})</span>
                                {selectedItems[category] && (
                                    <span className="text-xs text-purple-400">1 selected</span>
                                )}
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                                {categoryItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => selectItem(category, item.id)}
                                        className={clsx(
                                            "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                            selectedItems[category] === item.id
                                                ? "border-purple-500 ring-2 ring-purple-500 scale-95"
                                                : "border-transparent hover:border-purple-300"
                                        )}
                                    >
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-secondary flex items-center justify-center text-xs text-foreground font-medium text-center p-1">
                                                {item.name}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Saved Combinations */}
            <div className="space-y-3">
                <h3 className="font-bold text-lg text-foreground">Saved Outfits</h3>

                {savedCombos.length > 0 ? (
                    savedCombos.map((combo) => {
                        const comboItems = items.filter((i) => combo.itemIds.includes(i.id));
                        return (
                            <div
                                key={combo.id}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-base text-foreground">{combo.name}</h4>
                                        <p className="text-xs text-purple-400 font-medium">{combo.occasion}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleFavorite(combo.id)}
                                            className="p-1"
                                        >
                                            <Heart
                                                className={clsx(
                                                    "w-5 h-5 transition-colors",
                                                    combo.favorite
                                                        ? "fill-pink-500 text-pink-500"
                                                        : "text-muted-foreground hover:text-pink-400"
                                                )}
                                            />
                                        </button>
                                        <button
                                            onClick={() => deleteCombo(combo.id)}
                                            className="p-1 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {comboItems.slice(0, 4).map((item) => (
                                        <div
                                            key={item.id}
                                            className="aspect-square rounded-lg overflow-hidden bg-secondary"
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-medium text-center p-1">
                                                    {item.name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => loadCombo(combo)}
                                    className="w-full py-2 bg-secondary text-foreground rounded-lg text-sm font-semibold hover:bg-accent transition-colors"
                                >
                                    Load Outfit
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-muted-foreground bg-white/5 rounded-xl border border-white/10">
                        <Save className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No saved outfits yet</p>
                        <p className="text-sm mt-1">Create and save your favorite combinations!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

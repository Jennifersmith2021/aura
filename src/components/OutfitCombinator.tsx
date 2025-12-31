"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

import { useState, useMemo } from "react";
import { Trash2, Plus, Eye, Save, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ClothingItem {
    id: string;
    name: string;
    category: string;
    color: string;
    image?: string;
}

interface Outfit {
    id: string;
    name: string;
    occasion: "casual" | "formal" | "party" | "work" | "gym" | "date" | "other";
    createdDate: string;
    items: ClothingItem[];
    notes: string;
    rating: number; // 1-5
}

export default function OutfitCombinator() {
    const [outfits, setOutfits] = useState<Outfit[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("outfits");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
    const [outfitName, setOutfitName] = useState("");
    const [occasion, setOccasion] = useState<Outfit["occasion"]>("casual");
    const [notes, setNotes] = useState("");
    const [rating, setRating] = useState(3);
    const [showPreview, setShowPreview] = useState(false);
    const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);

    // Get all clothing items from closet
    const allItems = useMemo(() => {
        if (typeof window !== "undefined") {
            const items = localStorage.getItem("items");
            return items ? JSON.parse(items).filter((i: any) => i.type === "clothing") : [];
        }
        return [];
    }, []);

    // Group items by category
    const itemsByCategory = useMemo(() => {
        const grouped: Record<string, ClothingItem[]> = {};
        allItems.forEach((item: any) => {
            const category = item.category || "Uncategorized";
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push({
                id: item.id,
                name: item.name,
                category: item.category,
                color: item.color || "N/A",
                image: item.image,
            });
        });
        return grouped;
    }, [allItems]);

    const saveOutfit = () => {
        if (!outfitName.trim() || selectedItems.length === 0) {
            alert("Please add a name and select at least one item");
            return;
        }

        const newOutfit: Outfit = {
            id: editingOutfitId || `outfit-${Date.now()}`,
            name: outfitName,
            occasion,
            createdDate: new Date().toISOString(),
            items: selectedItems,
            notes,
            rating,
        };

        const updated = editingOutfitId
            ? outfits.map((o) => (o.id === editingOutfitId ? newOutfit : o))
            : [...outfits, newOutfit];

        setOutfits(updated);
        localStorage.setItem("outfits", JSON.stringify(updated));

        // Reset form
        setSelectedItems([]);
        setOutfitName("");
        setNotes("");
        setRating(3);
        setEditingOutfitId(null);
    };

    const deleteOutfit = (id: string) => {
        const updated = outfits.filter((o) => o.id !== id);
        setOutfits(updated);
        localStorage.setItem("outfits", JSON.stringify(updated));
    };

    const editOutfit = (outfit: Outfit) => {
        setOutfitName(outfit.name);
        setOccasion(outfit.occasion);
        setSelectedItems(outfit.items);
        setNotes(outfit.notes);
        setRating(outfit.rating);
        setEditingOutfitId(outfit.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleItem = (item: ClothingItem) => {
        setSelectedItems((prev) =>
            prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
        );
    };

    const occasionColors: Record<Outfit["occasion"], string> = {
        casual: "from-blue-500 to-cyan-500",
        formal: "from-purple-500 to-pink-500",
        party: "from-yellow-500 to-orange-500",
        work: "from-green-500 to-emerald-500",
        gym: "from-red-500 to-orange-500",
        date: "from-pink-500 to-rose-500",
        other: "from-gray-500 to-slate-500",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Outfit Combinations</h2>
                    <p className="text-sm text-muted-foreground">Mix and match items to create complete outfits</p>
                </div>
                <Eye className="w-8 h-8 text-pink-400" />
            </div>

            {/* Outfit Creator */}
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Plus className="w-5 h-5 text-pink-400" />
                    {editingOutfitId ? "Edit Outfit" : "Create New Outfit"}
                </h3>

                {/* Name & Occasion */}
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Outfit name"
                        value={outfitName}
                        onChange={(e) => setOutfitName(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-pink-500 outline-none"
                    />
                    <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value as Outfit["occasion"])}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none"
                    >
                        {["casual", "formal", "party", "work", "gym", "date", "other"].map((occ) => (
                            <option key={occ} value={occ}>
                                {occ.charAt(0).toUpperCase() + occ.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Notes */}
                <textarea
                    placeholder="Add notes or styling tips..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-pink-500 outline-none resize-none h-20"
                />

                {/* Rating */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">Rating:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRating(r)}
                                className={clsx(
                                    "text-lg transition-all",
                                    rating >= r ? "text-yellow-400" : "text-gray-500"
                                )}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{rating}/5</span>
                </div>

                {/* Selected Items Preview */}
                {selectedItems.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">
                            Selected Items ({selectedItems.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="bg-pink-500/20 border border-pink-500/50 rounded-lg px-2 py-1 text-xs font-semibold text-pink-300 flex items-center gap-1"
                                >
                                    {item.name}
                                    <button
                                        onClick={() => toggleItem(item)}
                                        className="hover:text-pink-200"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Item Selection */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {Object.entries(itemsByCategory).map(([category, items]) => (
                        <div key={category}>
                            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">{category}</div>
                            <div className="grid grid-cols-2 gap-2">
                                {items.map((item) => {
                                    const isSelected = selectedItems.some((i) => i.id === item.id);
                                    return (
                                        <motion.button
                                            key={item.id}
                                            onClick={() => toggleItem(item)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={clsx(
                                                "p-2 rounded-lg text-xs font-semibold text-center transition-all border",
                                                isSelected
                                                    ? "bg-pink-500/30 border-pink-500 text-pink-300"
                                                    : "bg-white/5 border-white/10 text-foreground hover:bg-white/10"
                                            )}
                                        >
                                            {item.name}
                                            <div className="text-xs text-muted-foreground">{item.color}</div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={saveOutfit}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {editingOutfitId ? "Update Outfit" : "Save Outfit"}
                    </motion.button>
                    {editingOutfitId && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setSelectedItems([]);
                                setOutfitName("");
                                setNotes("");
                                setRating(3);
                                setEditingOutfitId(null);
                            }}
                            className="px-6 bg-white/10 border border-white/20 text-foreground font-bold py-2 rounded-lg"
                        >
                            Cancel
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Saved Outfits */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Saved Outfits ({outfits.length})</h3>
                </div>

                <AnimatePresence>
                    {outfits.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-8 text-center"
                        >
                            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground font-medium">
                                No outfits created yet. Start by selecting items above!
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {outfits.map((outfit) => (
                                <motion.div
                                    key={outfit.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-foreground">{outfit.name}</h4>
                                                <span
                                                    className={clsx(
                                                        "text-xs font-bold px-2 py-1 rounded-full text-white bg-gradient-to-r",
                                                        occasionColors[outfit.occasion]
                                                    )}
                                                >
                                                    {outfit.occasion}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={i < outfit.rating ? "text-yellow-400" : "text-gray-500"}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => editOutfit(outfit)}
                                                className="p-2 bg-blue-500/20 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-all"
                                            >
                                                <Eye className="w-4 h-4 text-blue-300" />
                                            </button>
                                            <button
                                                onClick={() => deleteOutfit(outfit.id)}
                                                className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-300" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Items Display */}
                                    <div className="mb-3">
                                        <div className="text-xs font-semibold text-muted-foreground mb-2">
                                            {outfit.items.length} Items
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {outfit.items.map((item) => (
                                                <span
                                                    key={item.id}
                                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-foreground"
                                                >
                                                    {item.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {outfit.notes && (
                                        <p className="text-xs text-muted-foreground italic">"{outfit.notes}"</p>
                                    )}

                                    <div className="text-xs text-muted-foreground mt-2">
                                        Created: {new Date(outfit.createdDate).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

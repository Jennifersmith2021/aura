"use client";
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Heart, DollarSign, TrendingUp, Calendar, Tag, Trash2, Edit2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/hooks/useStore";
import clsx from "clsx";

interface WishlistItemExtended {
    id: string;
    itemId: string;
    priority: "low" | "medium" | "high" | "urgent";
    estimatedPrice: number;
    targetDate?: string;
    notes?: string;
    addedDate: string;
    purchased: boolean;
}

const priorityColors = {
    low: "from-gray-500 to-gray-600",
    medium: "from-blue-500 to-blue-600",
    high: "from-orange-500 to-orange-600",
    urgent: "from-red-500 to-red-600",
};

const priorityLabels = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
    urgent: "Urgent/Need Now",
};

export default function EnhancedWishlist() {
    const { items, toggleWishlist } = useStore();
    const [wishlistData, setWishlistData] = useState<WishlistItemExtended[]>([]);
    const [budget, setBudget] = useState(0);
    const [filterPriority, setFilterPriority] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"priority" | "price" | "date">("priority");
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<WishlistItemExtended | null>(null);

    // Load wishlist data
    useEffect(() => {
        const stored = localStorage.getItem("wishlistData");
        if (stored) {
            setWishlistData(JSON.parse(stored));
        }
        const storedBudget = localStorage.getItem("wishlistBudget");
        if (storedBudget) {
            setBudget(parseFloat(storedBudget));
        }
    }, []);

    const saveWishlistData = (data: WishlistItemExtended[]) => {
        setWishlistData(data);
        localStorage.setItem("wishlistData", JSON.stringify(data));
    };

    const saveBudget = (amount: number) => {
        setBudget(amount);
        localStorage.setItem("wishlistBudget", amount.toString());
    };

    const wishlistItems = items.filter((item) => item.wishlist);

    // Ensure all wishlist items have extended data
    useEffect(() => {
        const missingItems = wishlistItems.filter(
            (item) => !wishlistData.find((w) => w.itemId === item.id)
        );

        if (missingItems.length > 0) {
            const newData = missingItems.map((item) => ({
                id: Date.now().toString() + Math.random(),
                itemId: item.id,
                priority: "medium" as const,
                estimatedPrice: 0,
                addedDate: new Date().toISOString(),
                purchased: false,
            }));
            saveWishlistData([...wishlistData, ...newData]);
        }
    }, [wishlistItems, wishlistData]);

    const updateWishlistItem = (id: string, updates: Partial<WishlistItemExtended>) => {
        const updated = wishlistData.map((w) => (w.id === id ? { ...w, ...updates } : w));
        saveWishlistData(updated);
    };

    const removeFromWishlist = (itemId: string) => {
        toggleWishlist(itemId);
        const updated = wishlistData.filter((w) => w.itemId !== itemId);
        saveWishlistData(updated);
    };

    const markPurchased = (id: string) => {
        updateWishlistItem(id, { purchased: true });
    };

    // Filter and sort
    let filteredData = wishlistData.filter((w) => {
        if (filterPriority === "all") return true;
        if (filterPriority === "purchased") return w.purchased;
        return w.priority === filterPriority && !w.purchased;
    });

    filteredData = filteredData.sort((a, b) => {
        if (sortBy === "priority") {
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (sortBy === "price") {
            return b.estimatedPrice - a.estimatedPrice;
        } else {
            return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
        }
    });

    const totalCost = wishlistData
        .filter((w) => !w.purchased)
        .reduce((sum, w) => sum + w.estimatedPrice, 0);
    const purchasedCount = wishlistData.filter((w) => w.purchased).length;
    const remainingBudget = budget - totalCost;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Smart Wishlist</h2>
                    <p className="text-sm text-muted-foreground">
                        Track priorities and budget for your wishlist
                    </p>
                </div>
                <Heart className="w-8 h-8 text-pink-400" fill="currentColor" />
            </div>

            {/* Budget Card */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-5 border border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <h3 className="font-bold text-lg text-foreground">Budget Tracker</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <div className="text-2xl font-bold text-foreground">${budget.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground font-medium">Total Budget</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground font-medium">Wishlist Total</div>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-semibold">Remaining</span>
                        <span
                            className={clsx(
                                "font-bold",
                                remainingBudget >= 0 ? "text-green-400" : "text-red-400"
                            )}
                        >
                            ${Math.abs(remainingBudget).toFixed(2)}
                            {remainingBudget < 0 && " over"}
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                            className={clsx(
                                "h-full rounded-full transition-all",
                                remainingBudget >= 0
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "bg-gradient-to-r from-red-500 to-orange-500"
                            )}
                            style={{
                                width: `${Math.min((totalCost / budget) * 100, 100)}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="number"
                        value={budget}
                        onChange={(e) => saveBudget(parseFloat(e.target.value) || 0)}
                        placeholder="Set budget..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground"
                    />
                    <div className="text-xs text-muted-foreground self-center">
                        {purchasedCount} purchased
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setFilterPriority("all")}
                    className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                        filterPriority === "all"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    All ({wishlistData.length})
                </button>
                {(["urgent", "high", "medium", "low"] as const).map((priority) => (
                    <button
                        key={priority}
                        onClick={() => setFilterPriority(priority)}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all capitalize",
                            filterPriority === priority
                                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                                : "bg-secondary text-foreground hover:bg-accent"
                        )}
                    >
                        {priority}
                    </button>
                ))}
                <button
                    onClick={() => setFilterPriority("purchased")}
                    className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                        filterPriority === "purchased"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    Purchased ({purchasedCount})
                </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-semibold">Sort by:</span>
                {(["priority", "price", "date"] as const).map((sort) => (
                    <button
                        key={sort}
                        onClick={() => setSortBy(sort)}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                            sortBy === sort
                                ? "bg-purple-500 text-white"
                                : "bg-secondary text-foreground hover:bg-accent"
                        )}
                    >
                        {sort}
                    </button>
                ))}
            </div>

            {/* Wishlist Items */}
            <div className="space-y-3">
                {filteredData.length > 0 ? (
                    filteredData.map((wishlistItem) => {
                        const item = items.find((i) => i.id === wishlistItem.itemId);
                        if (!item) return null;

                        return (
                            <div
                                key={wishlistItem.id}
                                className={clsx(
                                    "bg-white/5 rounded-xl border border-white/10 p-4",
                                    wishlistItem.purchased && "opacity-60"
                                )}
                            >
                                <div className="flex gap-3">
                                    {/* Item Image */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
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

                                    {/* Item Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-base text-foreground">
                                                    {item.name}
                                                </h4>
                                                {item.brand && (
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        {item.brand}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(wishlistItem);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-1 text-blue-400 hover:text-blue-300"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeFromWishlist(item.id)}
                                                    className="p-1 text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Priority Badge */}
                                        <div
                                            className={clsx(
                                                "inline-block px-2 py-1 rounded-lg text-xs font-bold text-white mb-2",
                                                `bg-gradient-to-r ${priorityColors[wishlistItem.priority]}`
                                            )}
                                        >
                                            {priorityLabels[wishlistItem.priority]}
                                        </div>

                                        {/* Price and Date */}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium mb-2">
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                ${wishlistItem.estimatedPrice.toFixed(2)}
                                            </span>
                                            {wishlistItem.targetDate && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(wishlistItem.targetDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        {wishlistItem.notes && (
                                            <p className="text-xs text-muted-foreground italic mb-2">
                                                {wishlistItem.notes}
                                            </p>
                                        )}

                                        {!wishlistItem.purchased && (
                                            <button
                                                onClick={() => markPurchased(wishlistItem.id)}
                                                className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-shadow"
                                            >
                                                Mark as Purchased
                                            </button>
                                        )}
                                        {wishlistItem.purchased && (
                                            <div className="text-xs text-green-400 font-semibold">
                                                ✓ Purchased
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No items in wishlist</p>
                        <p className="text-sm mt-1">Add items from your closet or shopping!</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background rounded-2xl border border-border max-w-md w-full p-6 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-foreground">Edit Wishlist Item</h3>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Priority
                                </label>
                                <select
                                    value={editingItem.priority}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            priority: e.target.value as any,
                                        })
                                    }
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                >
                                    {Object.entries(priorityLabels).map(([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Estimated Price
                                </label>
                                <input
                                    type="number"
                                    value={editingItem.estimatedPrice}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            estimatedPrice: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Target Date (optional)
                                </label>
                                <input
                                    type="date"
                                    value={editingItem.targetDate || ""}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            targetDate: e.target.value,
                                        })
                                    }
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Notes (optional)
                                </label>
                                <textarea
                                    value={editingItem.notes || ""}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            notes: e.target.value,
                                        })
                                    }
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        updateWishlistItem(editingItem.id, editingItem);
                                        setShowEditModal(false);
                                    }}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2.5 bg-secondary text-foreground rounded-xl font-semibold text-sm hover:bg-accent transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

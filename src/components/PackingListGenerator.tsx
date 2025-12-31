"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Luggage, Plus, Trash2, Check, X, Calendar, MapPin, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { PackingItem, PackingList } from "@/types";

const tripTypeIcons = {
    business: "💼",
    casual: "🎒",
    beach: "🏖️",
    formal: "🎩",
    adventure: "🏔️",
    mixed: "🌍",
};

const categoryIcons = {
    clothing: "👗",
    shoes: "👠",
    accessories: "👜",
    makeup: "💄",
    toiletries: "🧴",
    electronics: "🔌",
    documents: "📄",
    other: "📦",
};

export default function PackingListGenerator() {
    const { packingLists, addPackingList, removePackingList, updatePackingList } = useStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedList, setSelectedList] = useState<string | null>(null);
    const [showAddItemModal, setShowAddItemModal] = useState(false);

    // Form state for new list
    const [name, setName] = useState("");
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [tripType, setTripType] = useState<"business" | "casual" | "beach" | "formal" | "adventure" | "mixed">("casual");
    const [notes, setNotes] = useState("");

    // Form state for new item
    const [itemName, setItemName] = useState("");
    const [itemCategory, setItemCategory] = useState<"clothing" | "shoes" | "accessories" | "makeup" | "toiletries" | "electronics" | "documents" | "other">("clothing");
    const [itemQuantity, setItemQuantity] = useState(1);

    const resetListForm = () => {
        setName("");
        setDestination("");
        setStartDate("");
        setEndDate("");
        setTripType("casual");
        setNotes("");
    };

    const resetItemForm = () => {
        setItemName("");
        setItemCategory("clothing");
        setItemQuantity(1);
    };

    const handleCreateList = () => {
        const list = {
            id: crypto.randomUUID(),
            name: name.trim(),
            destination: destination.trim(),
            startDate: new Date(startDate).getTime(),
            endDate: new Date(endDate).getTime(),
            tripType,
            items: generateDefaultItems(tripType),
            notes: notes.trim() || undefined,
            created: Date.now(), // eslint-disable-line react-hooks/purity
        };
        addPackingList(list);
        resetListForm();
        setShowCreateModal(false);
        setSelectedList(list.id);
    };

    const generateDefaultItems = (type: string): PackingItem[] => {
        const baseItems: PackingItem[] = [
            { id: crypto.randomUUID(), name: "Phone charger", category: "electronics", quantity: 1, packed: false },
            { id: crypto.randomUUID(), name: "Toothbrush", category: "toiletries", quantity: 1, packed: false },
            { id: crypto.randomUUID(), name: "Medications", category: "toiletries", quantity: 1, packed: false },
            { id: crypto.randomUUID(), name: "ID/Passport", category: "documents", quantity: 1, packed: false },
        ];

        switch (type) {
            case "business":
                return [
                    ...baseItems,
                    { id: crypto.randomUUID(), name: "Blazer", category: "clothing", quantity: 1, packed: false },
                    { id: crypto.randomUUID(), name: "Dress pants", category: "clothing", quantity: 2, packed: false },
                    { id: crypto.randomUUID(), name: "Dress shoes", category: "shoes", quantity: 1, packed: false },
                    { id: crypto.randomUUID(), name: "Laptop", category: "electronics", quantity: 1, packed: false },
                ];
            case "beach":
                return [
                    ...baseItems,
                    { id: crypto.randomUUID(), name: "Swimsuit", category: "clothing", quantity: 2, packed: false },
                    { id: crypto.randomUUID(), name: "Sunscreen", category: "toiletries", quantity: 1, packed: false },
                    { id: crypto.randomUUID(), name: "Sunglasses", category: "accessories", quantity: 1, packed: false },
                    { id: crypto.randomUUID(), name: "Sandals", category: "shoes", quantity: 1, packed: false },
                ];
            case "formal":
                return [
                    ...baseItems,
                    { id: crypto.randomUUID(), name: "Evening gown", category: "clothing", quantity: 1, packed: false },
                    { id: crypto.randomUUID(), name: "Heels", category: "shoes", quantity: 1, packed: false },
                    { id: crypto.randomUUID(), name: "Clutch", category: "accessories", quantity: 1, packed: false },
                    { id: crypto.randomUUID(), name: "Jewelry", category: "accessories", quantity: 1, packed: false },
                ];
            default:
                return [
                    ...baseItems,
                    { id: crypto.randomUUID(), name: "Jeans", category: "clothing", quantity: 2, packed: false },
                    { id: crypto.randomUUID(), name: "T-shirts", category: "clothing", quantity: 3, packed: false },
                    { id: crypto.randomUUID(), name: "Sneakers", category: "shoes", quantity: 1, packed: false },
                ];
        }
    };

    const handleAddItem = () => {
        if (!selectedList) return;

        const list = packingLists.find((l) => l.id === selectedList);
        if (!list) return;

        const newItem: PackingItem = {
            id: crypto.randomUUID(),
            name: itemName.trim(),
            category: itemCategory,
            quantity: itemQuantity,
            packed: false,
        };

        updatePackingList(selectedList, {
            items: [...list.items, newItem],
        });

        resetItemForm();
        setShowAddItemModal(false);
    };

    const toggleItemPacked = (listId: string, itemId: string) => {
        const list = packingLists.find((l) => l.id === listId);
        if (!list) return;

        const updatedItems = list.items.map((item: PackingItem) =>
            item.id === itemId ? { ...item, packed: !item.packed } : item
        );

        updatePackingList(listId, { items: updatedItems });
    };

    const removeItem = (listId: string, itemId: string) => {
        const list = packingLists.find((l) => l.id === listId);
        if (!list) return;

        updatePackingList(listId, {
            items: list.items.filter((item: PackingItem) => item.id !== itemId),
        });
    };

    const currentList = selectedList ? packingLists.find((l) => l.id === selectedList) : null;
    const packedCount = currentList?.items.filter((i: PackingItem) => i.packed).length || 0;
    const totalCount = currentList?.items.length || 0;
    const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Luggage className="w-5 h-5 text-blue-400" />
                    Packing Lists
                </h3>
                <button
                    onClick={() => {
                        resetListForm();
                        setShowCreateModal(true);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    New Trip
                </button>
            </div>

            {/* List Selector */}
            {packingLists.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {packingLists.map((list: PackingList) => (
                        <button
                            key={list.id}
                            onClick={() => setSelectedList(list.id)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
                                selectedList === list.id
                                    ? "bg-blue-500 text-white"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            {tripTypeIcons[list.tripType]} {list.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Current List View */}
            {currentList ? (
                <div className="space-y-4">
                    {/* Trip Info */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-1">{currentList.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                    <MapPin className="w-4 h-4" />
                                    {currentList.destination}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(currentList.startDate).toLocaleDateString()} - {new Date(currentList.endDate).toLocaleDateString()}
                                </div>
                            </div>
                            <button
                                onClick={() => removePackingList(currentList.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-white/60">Progress</span>
                                <span className="text-sm font-medium text-white">{packedCount}/{totalCount} ({progress}%)</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Item Button */}
                    <button
                        onClick={() => {
                            resetItemForm();
                            setShowAddItemModal(true);
                        }}
                        className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </button>

                    {/* Items by Category */}
                    {Object.keys(categoryIcons).map((cat) => {
                        const categoryItems = currentList.items.filter((item: PackingItem) => item.category === cat);
                        if (categoryItems.length === 0) return null;

                        return (
                            <div key={cat} className="space-y-2">
                                <h5 className="text-sm font-medium text-white/60 flex items-center gap-2">
                                    {categoryIcons[cat as keyof typeof categoryIcons]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </h5>
                                <div className="space-y-2">
                                    {categoryItems.map((item: PackingItem) => (
                                        <div
                                            key={item.id}
                                            className={clsx(
                                                "bg-white/5 rounded-lg p-3 border border-white/10 transition-colors",
                                                item.packed && "opacity-60 bg-green-500/10 border-green-500/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleItemPacked(currentList.id, item.id)}
                                                    className={clsx(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                                        item.packed
                                                            ? "bg-green-500 border-green-500"
                                                            : "border-white/30 hover:border-blue-500"
                                                    )}
                                                >
                                                    {item.packed && <Check className="w-4 h-4 text-white" />}
                                                </button>
                                                <div className="flex-1">
                                                    <span className={clsx("text-white font-medium", item.packed && "line-through opacity-70")}>
                                                        {item.name}
                                                    </span>
                                                    {item.quantity > 1 && (
                                                        <span className="text-sm text-white/60 ml-2">x{item.quantity}</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeItem(currentList.id, item.id)}
                                                    className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : packingLists.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <Luggage className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/80 font-medium text-sm mb-4">No packing lists yet</p>
                    <button
                        onClick={() => {
                            resetListForm();
                            setShowCreateModal(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        Create Your First Trip
                    </button>
                </div>
            ) : (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <p className="text-white/80 font-medium text-sm">Select a trip above</p>
                </div>
            )}

            {/* Create List Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowCreateModal(false);
                            resetListForm();
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Luggage className="w-5 h-5 text-blue-400" />
                                    New Trip
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetListForm();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Trip Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Trip Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Summer Vacation"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Destination */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Destination *</label>
                                    <input
                                        type="text"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="e.g., Paris, France"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Start Date *</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">End Date *</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Trip Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Trip Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(tripTypeIcons) as Array<keyof typeof tripTypeIcons>).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setTripType(type)}
                                                className={clsx(
                                                    "px-3 py-2 rounded-lg text-sm transition-colors",
                                                    tripType === type
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {tripTypeIcons[type]} {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Special considerations..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetListForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateList}
                                        disabled={!name.trim() || !destination.trim() || !startDate || !endDate}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Item Modal */}
            <AnimatePresence>
                {showAddItemModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowAddItemModal(false);
                            resetItemForm();
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Add Item</h3>
                                <button
                                    onClick={() => {
                                        setShowAddItemModal(false);
                                        resetItemForm();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Item Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Item Name *</label>
                                    <input
                                        type="text"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        placeholder="e.g., Blue dress"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={itemCategory}
                                        onChange={(e) => setItemCategory(e.target.value as any)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Object.keys(categoryIcons).map((cat) => (
                                            <option key={cat} value={cat}>
                                                {categoryIcons[cat as keyof typeof categoryIcons]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={itemQuantity}
                                        onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                                        min="1"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowAddItemModal(false);
                                            resetItemForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddItem}
                                        disabled={!itemName.trim()}
                                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

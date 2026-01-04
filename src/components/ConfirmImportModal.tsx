"use client";

import { useEffect, useMemo, useState } from "react";
import { Item, Category } from "@/types";
import { Check, X, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/utils/imageUrl";

interface ConfirmImportModalProps {
    items: Item[];
    isOpen: boolean;
    onConfirm: (items: Item[]) => void;
    onCancel: () => void;
}

export function ConfirmImportModal({
    items,
    isOpen,
    onConfirm,
    onCancel,
}: ConfirmImportModalProps) {
    const [editingItems, setEditingItems] = useState<Item[]>(items);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    // Sync incoming items whenever the modal opens or the source items change
    useEffect(() => {
        if (isOpen) {
            setEditingItems(items);
            setEditingIndex(null);
            setEditName("");
        }
    }, [items, isOpen]);

    const clothingCategories: Category[] = ["top", "bottom", "dress", "shoe", "outerwear", "accessory", "legging", "other"];
    const makeupCategories: Category[] = ["face", "eye", "lip", "cheek", "tool", "other"];

    const getCategoryOptions = (type: Item["type"]): Category[] => (type === "clothing" ? clothingCategories : makeupCategories);

    if (!isOpen) return null;

    const handleRemoveItem = (index: number) => {
        setEditingItems(editingItems.filter((_, i) => i !== index));
    };

    const handleEditItem = (index: number) => {
        setEditingIndex(index);
        setEditName(editingItems[index].name);
    };

    const handleSaveEdit = () => {
        if (editingIndex !== null) {
            const updated = [...editingItems];
            updated[editingIndex] = {
                ...updated[editingIndex],
                name: editName,
            };
            setEditingItems(updated);
            setEditingIndex(null);
        }
    };

    const updateField = (index: number, field: keyof Item, value: any) => {
        setEditingItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value } as Item;
            return next;
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-blue-600 text-white p-6 border-b border-blue-700">
                    <h2 className="text-2xl font-bold">Confirm Import</h2>
                    <p className="text-blue-100 mt-1">
                        Review the {editingItems.length} item(s) found in your receipt
                    </p>
                </div>

                {/* Items List */}
                <div className="p-6 space-y-3">
                    {editingItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No items to import
                        </div>
                    ) : (
                        editingItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-2 items-start">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Name</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateField(index, "name", e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Type</label>
                                            <select
                                                className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                                value={item.type}
                                                onChange={(e) => {
                                                    const newType = e.target.value as Item["type"];
                                                    const options = getCategoryOptions(newType);
                                                    updateField(index, "type", newType);
                                                    if (!options.includes(item.category as Category)) {
                                                        updateField(index, "category", options[0]);
                                                    }
                                                }}
                                            >
                                                <option value="clothing">Clothing</option>
                                                <option value="makeup">Makeup</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Category</label>
                                            <select
                                                className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                                value={item.category}
                                                onChange={(e) => updateField(index, "category", e.target.value as Category)}
                                            >
                                                {getCategoryOptions(item.type).map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Brand</label>
                                            <input
                                                type="text"
                                                value={item.brand || ""}
                                                onChange={(e) => updateField(index, "brand", e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Price</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.price ?? ""}
                                                onChange={(e) => updateField(index, "price", parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Color</label>
                                            <input
                                                type="text"
                                                value={item.color || ""}
                                                onChange={(e) => updateField(index, "color", e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Notes / Size</label>
                                            <input
                                                type="text"
                                                value={item.notes || ""}
                                                onChange={(e) => updateField(index, "notes", e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 text-xs">
                                        <div className="space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Product Link</label>
                                            <input
                                                type="url"
                                                value={(item as any).purchaseUrl || ""}
                                                onChange={(e) => updateField(index, "purchaseUrl" as any, e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Image URL</label>
                                            <input
                                                type="url"
                                                value={item.image || ""}
                                                onChange={(e) => updateField(index, "image", normalizeImageUrl(e.target.value) || e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-sm"
                                            />
                                            {normalizeImageUrl(item.image) && (
                                                <img
                                                    src={normalizeImageUrl(item.image)}
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded border border-slate-200 dark:border-slate-700"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://placehold.co/160x160?text=Image";
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {editingIndex !== index && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEditItem(index)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded"
                                            title="Edit item name"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-lg font-semibold bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(editingItems)}
                        disabled={editingItems.length === 0}
                        className={cn(
                            "px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all",
                            editingItems.length === 0
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                        )}
                    >
                        <Check className="w-5 h-5" />
                        Confirm Import ({editingItems.length})
                    </button>
                </div>
            </div>
        </div>
    );
}

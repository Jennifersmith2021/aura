"use client";

import { Item, Category } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Trash2, Sparkles, Edit2, Check, X } from "lucide-react";
import { OutfitGenerator } from "./OutfitGenerator";
import { useStore } from "@/hooks/useStore";
import { normalizeImageUrl } from "@/utils/imageUrl";

interface ItemCardProps {
    item: Item;
    onDelete?: (id: string) => void;
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
    const [isStyling, setIsStyling] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<Item>(item);
    const [imageError, setImageError] = useState(false);
    const { updateItem } = useStore();

    const clothingCategories: Category[] = ["top", "bottom", "dress", "shoe", "outerwear", "accessory", "legging", "other"];
    const makeupCategories: Category[] = ["face", "eye", "lip", "cheek", "tool", "other"];

    const categoryOptions = useMemo(
        () => (draft.type === "clothing" ? clothingCategories : makeupCategories),
        [draft.type]
    );

    useEffect(() => {
        setDraft(item);
        setImageError(false);
    }, [item]);

    const previewImage = normalizeImageUrl((isEditing ? draft.image : item.image) || undefined);

    const handleChange = (field: keyof Item, value: any) => {
        setDraft((prev) => ({ ...prev, [field]: value } as Item));
    };

    const handleTypeChange = (value: Item["type"]) => {
        const options = value === "clothing" ? clothingCategories : makeupCategories;
        handleChange("type", value);
        if (!options.includes(draft.category as Category)) {
            handleChange("category", options[0] as Category);
        }
    };

    const handleSave = () => {
        const cleanedImage = normalizeImageUrl(draft.image) || draft.image;
        const merged: Item = {
            ...item,
            ...draft,
            image: cleanedImage,
        };

        const validCategories = merged.type === "clothing" ? clothingCategories : makeupCategories;
        if (!validCategories.includes(merged.category as Category)) {
            merged.category = validCategories[0] as Category;
        }

        updateItem(merged);
        setIsEditing(false);
        setImageError(false);
    };

    const handleCancel = () => {
        setDraft(item);
        setIsEditing(false);
        setImageError(false);
    };

    return (
        <>
            <div className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95">
                {!isEditing ? (
                    <>
                        <div className="aspect-square relative bg-muted">
                            {previewImage && !imageError ? (
                                <img
                                    src={previewImage}
                                    alt={item.name}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    No Image
                                </div>
                            )}

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setIsStyling(true)}
                                    className="p-2 bg-white rounded-full text-purple-600 hover:bg-purple-50"
                                    title="Style Me"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </button>

                                {item.purchaseUrl && (
                                    <a
                                        href={item.purchaseUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white rounded-full text-slate-900 hover:bg-rose-50"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 bg-white rounded-full text-slate-900 hover:bg-slate-100"
                                    title="Inline edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-3">
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">
                                {item.brand || item.category}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-sm">Edit Item</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-200"
                                    title="Cancel"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="p-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                    title="Save"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                                <label className="text-[11px] uppercase text-slate-500">Name</label>
                                <input
                                    value={draft.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] uppercase text-slate-500">Brand</label>
                                <input
                                    value={draft.brand || ""}
                                    onChange={(e) => handleChange("brand", e.target.value)}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] uppercase text-slate-500">Type</label>
                                <select
                                    value={draft.type}
                                    onChange={(e) => handleTypeChange(e.target.value as Item["type"])}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                >
                                    <option value="clothing">Clothing</option>
                                    <option value="makeup">Makeup</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] uppercase text-slate-500">Category</label>
                                <select
                                    value={draft.category}
                                    onChange={(e) => handleChange("category", e.target.value as Category)}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                >
                                    {categoryOptions.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] uppercase text-slate-500">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={draft.price ?? ""}
                                    onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] uppercase text-slate-500">Color</label>
                                <input
                                    value={draft.color || ""}
                                    onChange={(e) => handleChange("color", e.target.value)}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[11px] uppercase text-slate-500">Notes / Size</label>
                                <input
                                    value={draft.notes || ""}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[11px] uppercase text-slate-500">Product Link</label>
                                <input
                                    value={(draft as any).purchaseUrl || ""}
                                    onChange={(e) => handleChange("purchaseUrl" as any, e.target.value)}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[11px] uppercase text-slate-500">Image URL</label>
                                <input
                                    value={draft.image || ""}
                                    onChange={(e) => handleChange("image", normalizeImageUrl(e.target.value) || e.target.value)}
                                    className="w-full px-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded"
                                />
                                {previewImage && (
                                    <img
                                        src={previewImage}
                                        alt={draft.name}
                                        className="h-24 w-full object-cover rounded border border-slate-200 dark:border-slate-700"
                                        onError={(e) => {
                                            setImageError(true);
                                            e.currentTarget.src = "https://placehold.co/300x200?text=Image";
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isStyling && (
                <OutfitGenerator
                    baseItem={item}
                    onClose={() => setIsStyling(false)}
                />
            )}
        </>
    );
}

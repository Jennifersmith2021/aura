"use client";

import { useState } from "react";
import { X, Loader2, Wand2, Plus } from "lucide-react";
import Image from "next/image";
import { Item, Category } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: Item) => void;
    defaultType?: "clothing" | "makeup";
}

export function AddItemModal({ isOpen, onClose, onAdd, defaultType = "clothing" }: AddItemModalProps) {
    const [type, setType] = useState<"clothing" | "makeup">(defaultType);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        url: "",
        name: "",
        brand: "",
        price: "",
        image: "",
        category: "top" as Category,
        color: "",
    });

    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleAutoFill = async () => {
        if (!formData.url) return;
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/preview?url=${encodeURIComponent(formData.url)}`);
            const data = await res.json();

            if (data.isBlocked) {
                setError("Amazon is doing a bot check. We started the form for you - please fill in the rest!");
                // Still allow partial fill if available using whatever data WAS captured
                setFormData(prev => ({
                    ...prev,
                    name: data.title !== "Amazon Item (Verification Required)" ? data.title : "New Amazon Item",
                    price: data.price || prev.price,
                }));
                // Don't return, let the user continue editing
            }

            if (data.title) {
                // Clean up Amazon title
                const cleanTitle = data.title.replace(/^Amazon\.com\s*:\s*/i, "").substring(0, 60);

                // Parse price if available (e.g. "$25.99" -> 25.99)
                let price = "";
                if (data.price) {
                    const match = data.price.match(/[\d.]+/);
                    if (match) price = match[0];
                }

                // Infer category from title
                let category: Category = "top"; // Default
                const lowerTitle = cleanTitle.toLowerCase();

                if (lowerTitle.includes("dress") || lowerTitle.includes("gown")) category = "dress";
                else if (lowerTitle.includes("skirt") || lowerTitle.includes("pant") || lowerTitle.includes("jean") || lowerTitle.includes("short") || lowerTitle.includes("legging")) category = "bottom";
                else if (lowerTitle.includes("shoe") || lowerTitle.includes("boot") || lowerTitle.includes("sandal") || lowerTitle.includes("sneaker") || lowerTitle.includes("heel")) category = "shoe";
                else if (lowerTitle.includes("jacket") || lowerTitle.includes("coat") || lowerTitle.includes("blazer") || lowerTitle.includes("cardigan")) category = "outerwear";
                else if (lowerTitle.includes("bag") || lowerTitle.includes("purse") || lowerTitle.includes("necklace") || lowerTitle.includes("earring") || lowerTitle.includes("ring") || lowerTitle.includes("hat")) category = "accessory";
                else if (lowerTitle.includes("lipstick") || lowerTitle.includes("gloss") || lowerTitle.includes("balm")) { category = "lip"; setType("makeup"); }
                else if (lowerTitle.includes("mascara") || lowerTitle.includes("liner") || lowerTitle.includes("shadow") || lowerTitle.includes("brow")) { category = "eye"; setType("makeup"); }
                else if (lowerTitle.includes("foundation") || lowerTitle.includes("concealer") || lowerTitle.includes("powder") || lowerTitle.includes("blush") || lowerTitle.includes("bronzer")) { category = "face"; setType("makeup"); }

                setFormData((prev) => ({
                    ...prev,
                    name: cleanTitle,
                    price: price || prev.price,
                    image: data.image || prev.image,
                    category: category,
                    color: prev.color, // Auto-fill doesn't extract color well yet, keep user input
                }));
            } else {
                setError("Could not find product details. Please try manually.");
            }
        } catch (error) {
            console.error("Auto-fill failed", error);
            setError("Connection failed. Don't worry, you can still add it manually.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: Item = {
            id: uuidv4(),
            name: formData.name,
            type,
            category: formData.category,
            brand: formData.brand,
            price: parseFloat(formData.price) || 0,
            image: formData.image,
            color: formData.color,
            purchaseUrl: formData.url,
            dateAdded: Date.now(),
            dateOpened: type === "makeup" ? Date.now() : undefined,
        };
        onAdd(newItem);
        onClose();
        // Reset form
        setFormData({ url: "", name: "", brand: "", price: "", image: "", category: "top", color: "" });
    };

    const categories: Category[] = type === "clothing"
        ? ["top", "bottom", "dress", "shoe", "outerwear", "accessory"]
        : ["face", "eye", "lip", "cheek", "tool"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Add New Item</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-1">
                    {/* Type Toggle */}
                    <div className="flex p-1 bg-muted rounded-lg mb-6">
                        <button
                            onClick={() => setType("clothing")}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                                type === "clothing" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                            )}
                        >
                            Clothing
                        </button>
                        <button
                            onClick={() => setType("makeup")}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                                type === "makeup" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                            )}
                        >
                            Makeup
                        </button>
                    </div>

                    <form id="add-item-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* URL Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Product Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    placeholder="Paste Amazon/Store link..."
                                    className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={handleAutoFill}
                                    disabled={loading || !formData.url}
                                    className="bg-primary/10 text-primary hover:bg-primary/20 px-3 rounded-lg flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                </button>
                            </div>
                            {error && <p className="text-xs text-rose-500 mt-2 font-medium">{error}</p>}
                        </div>

                        {/* Image Preview */}
                        {formData.image && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                <Image src={formData.image} alt="Preview" fill className="object-cover" />
                            </div>
                        )}

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Red Velvet Dress"
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Brand */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase text-muted-foreground">Brand</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Zara"
                                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase text-muted-foreground">Price</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Color */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Color</label>
                            <input
                                type="text"
                                placeholder="e.g. Red, Navy, Pattern"
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Category</label>
                            <select
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Image URL Manual Override */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Image URL (Optional)</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/20">
                    <button
                        type="submit"
                        form="add-item-form"
                        className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add to {type === "clothing" ? "Closet" : "Vanity"}
                    </button>
                </div>
            </div>
        </div>
    );
}

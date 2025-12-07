"use client";

import { useStore } from "@/hooks/useStore";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Category } from "@/types";
import { PageTransition } from "@/components/PageTransition";

export default function ClosetPage() {
    const { items, loading, addItem, removeItem } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Category | "all">("all");

    const clothingItems = items.filter((i) => i.type === "clothing");

    const filteredItems = clothingItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.brand?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || item.category === filter;
        return matchesSearch && matchesFilter;
    });

    const categories: Category[] = ["top", "bottom", "dress", "shoe", "outerwear", "accessory"];

    if (loading) return <div className="p-8 text-center">Loading Closet...</div>;

    return (
        <PageTransition className="pb-24 pt-8 px-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Virtual Closet</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* Search & Filter */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search clothes..."
                        className="w-full bg-white dark:bg-slate-800 pl-9 pr-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === "all"
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === cat
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} onDelete={removeItem} />
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No items found.</p>
                    <button onClick={() => setIsAddModalOpen(true)} className="text-primary text-sm font-medium mt-2">
                        Add your first item
                    </button>
                </div>
            )}

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addItem}
                defaultType="clothing"
            />
        </PageTransition>
    );
}

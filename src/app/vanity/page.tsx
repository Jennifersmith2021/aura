"use client";

import { useStore } from "@/hooks/useStore";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { RoutineBuilder } from "@/components/RoutineBuilder";
import SkincareRoutine from "@/components/SkincareRoutine";
import BeautyGuides from "@/components/BeautyGuides";
import { useState } from "react";
import { Plus, Search, AlertCircle } from "lucide-react";
import { Category } from "@/types";
import { getExpirationStatus, getDaysRemaining } from "@/utils/expiration";
import { PageTransition } from "@/components/PageTransition";

export default function VanityPage() {
    const { items, loading, addItem, removeItem } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Category | "all">("all");
    const [activeTab, setActiveTab] = useState<"products" | "skincare" | "routines" | "guides">("products");

    const makeupItems = items.filter((i) => i.type === "makeup");

    const filteredItems = makeupItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.brand?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || item.category === filter;
        return matchesSearch && matchesFilter;
    });

    const categories: Category[] = ["face", "eye", "lip", "cheek", "tool"];

    if (loading) return <div className="p-8 text-center">Loading Vanity...</div>;

    return (
        <PageTransition className="pb-24 pt-8 px-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Makeup Vanity</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>



            {/* Tabs */}
            <div className="flex p-1 bg-muted rounded-xl">
                <button
                    onClick={() => setActiveTab("products")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "products"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Makeup
                </button>
                <button
                    onClick={() => setActiveTab("skincare")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "skincare"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Skincare
                </button>
                <button
                    onClick={() => setActiveTab("routines")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "routines"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Routines
                </button>
                <button
                    onClick={() => setActiveTab("guides")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "guides"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Guides
                </button>
            </div>

            {
                activeTab === "skincare" ? (
                    <SkincareRoutine />
                ) : activeTab === "guides" ? (
                    <BeautyGuides />
                ) : activeTab === "products" ? (
                    <>
                        {/* Search & Filter */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search makeup..."
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
                            {filteredItems.map((item) => {
                                const status = getExpirationStatus(item);
                                const days = getDaysRemaining(item);

                                return (
                                    <div key={item.id} className="relative">
                                        <ItemCard item={item} onDelete={removeItem} />
                                        {status !== "good" && (
                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm ${status === "expired" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                                }`}>
                                                <AlertCircle className="w-3 h-3" />
                                                {status === "expired" ? "Expired" : `${days}d left`}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {filteredItems.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No makeup items found.</p>
                                <button onClick={() => setIsAddModalOpen(true)} className="text-primary text-sm font-medium mt-2">
                                    Add your first product
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <RoutineBuilder />
                )
            }

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addItem}
                defaultType="makeup"
            />
        </PageTransition >
    );
}

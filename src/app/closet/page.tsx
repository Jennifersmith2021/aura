"use client";

import { useStore } from "@/hooks/useStore";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { AmazonOrderSync } from "@/components/AmazonOrderSync";
import { AmazonImport } from "@/components/AmazonImport";
import { AmazonSettings } from "@/components/AmazonSettings";
import { DebugPanel } from "@/components/DebugPanel";
import AdvancedSearch from "@/components/AdvancedSearch";
import { WardrobeGapAnalyzer } from "@/components/WardrobeGapAnalyzer";
import { useState } from "react";
import { Plus, Search, Package, Settings } from "lucide-react";
import { Category } from "@/types";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "@/lib/toast";

export default function ClosetPage() {
    const { items, loading, addItem, removeItem } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showAmazonImport, setShowAmazonImport] = useState(false);
    const [showAmazonSettings, setShowAmazonSettings] = useState(false);
    const [credentialsSaved, setCredentialsSaved] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Category | "all">("all");
    const [showAllTypes, setShowAllTypes] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    const clothingItems = items.filter((i) => showAllTypes || i.type === "clothing");

    const filteredItems = clothingItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.brand?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || item.category === filter;
        return matchesSearch && matchesFilter;
    });

    const categories: Category[] = ["top", "bottom", "dress", "shoe", "outerwear", "accessory", "legging"];

    if (loading) return <div className="p-8 text-center">Loading Closet...</div>;

    return (
        <PageTransition className="pb-24 pt-8 px-6 space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold">Virtual Closet</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        {clothingItems.length} items total
                        {!showAllTypes && items.length > clothingItems.length && (
                            <button
                                onClick={() => setShowAllTypes(true)}
                                className="ml-2 text-primary underline"
                            >
                                (show all {items.length} items)
                            </button>
                        )}
                        {showAllTypes && (
                            <button
                                onClick={() => setShowAllTypes(false)}
                                className="ml-2 text-primary underline"
                            >
                                (clothing only)
                            </button>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                        title="Add item manually"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setShowAmazonImport(!showAmazonImport)}
                        className="bg-amber-500 text-white p-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
                        title="Import from Amazon orders"
                    >
                        <Package className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Amazon Import Section */}
            {showAmazonImport && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="font-semibold text-amber-900 dark:text-amber-100">
                                Import from Amazon
                            </h2>
                            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                Pull your past Amazon purchases into your closet
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAmazonImport(false)}
                            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowAmazonSettings((prev) => !prev)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-amber-300 bg-white/80 dark:bg-amber-900/40 hover:bg-white"
                        >
                            <Settings className="w-4 h-4" />
                            Manage Amazon credentials
                        </button>
                        {credentialsSaved && (
                            <span className="text-xs text-amber-700 dark:text-amber-200">{credentialsSaved}</span>
                        )}
                    </div>

                    {showAmazonSettings && (
                        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white/70 dark:bg-amber-900/30 p-3">
                            <AmazonSettings
                                onSave={async (creds) => {
                                    try {
                                        localStorage.setItem("amazonCredentials", JSON.stringify(creds));
                                        setCredentialsSaved("Credentials saved locally");
                                    } catch (e) {
                                        console.error("Failed to store credentials", e);
                                        setCredentialsSaved("Unable to save locally; please check storage permissions");
                                    }
                                }}
                            />
                        </div>
                    )}

                    {/* CSV/PDF Import */}
                    <AmazonImport />

                    {/* Live Order Sync */}
                    <AmazonOrderSync />
                </div>
            )}

            {/* Wardrobe Gap Analyzer */}
            {clothingItems.length > 0 && <WardrobeGapAnalyzer />}

            {/* Search & Filter */}
            {!showAdvancedSearch ? (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search clothes..."
                                className="w-full bg-white dark:bg-slate-800 pl-9 pr-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowAdvancedSearch(true)}
                            className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-semibold"
                        >
                            Advanced
                        </button>
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
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Advanced Search</h2>
                        <button
                            onClick={() => setShowAdvancedSearch(false)}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Back to simple search
                        </button>
                    </div>
                    <AdvancedSearch />
                </div>
            )}

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
                onAdd={(item) => {
                  addItem(item);
                  toast.success(`Added ${item.name}!`);
                }}
                defaultType="clothing"
            />
            
            {/* Debug Panel */}
            <DebugPanel />
        </PageTransition>
    );
}

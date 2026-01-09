"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { Search, ShoppingBag, Heart, ExternalLink, Loader2, X } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { ShoppingItem, ShoppingRetailer, ShoppingCategory } from "@/types";
import { searchRetailer } from "@/lib/retailerAdapter";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ShoppingSkeleton } from "@/components/ShoppingSkeleton";
import { v4 as uuidv4 } from "uuid";
import { hasAdultConsent } from "@/utils/contentPolicy";
import { AdultConsentModal } from "@/components/AdultConsentModal";
import { useSearchParams } from "next/navigation";

type APIProduct = {
    name: string;
    retailer: string;
    category: string;
    price?: number;
    description?: string;
    url?: string;
    image?: string;
};

const RETAILERS: ShoppingRetailer[] = ["amazon", "sephora", "ulta", "target", "walmart", "etsy", "adam-eve", "other"];
const CATEGORIES: ShoppingCategory[] = [
    "fashion", "shoes", "accessories",
    "makeup", "skincare", "haircare",
    "adult", "wellness", "other"
];

function ShoppingPageContent() {
    const { shoppingItems, addShoppingItem, removeShoppingItem } = useStore();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRetailer, setSelectedRetailer] = useState<ShoppingRetailer | "all">("all");
    const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory | "all">("all");
    const [searchResults, setSearchResults] = useState<ShoppingItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [consentOpen, setConsentOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    // Initialize from URL params (from wardrobe gap analyzer)
    useEffect(() => {
        const categoryParam = searchParams.get("category");
        const colorParam = searchParams.get("color");
        
        if (categoryParam) {
            // Map clothing categories to shopping categories
            const categoryMap: Record<string, string> = {
                "top": "fashion tops",
                "bottom": "fashion bottoms", 
                "dress": "fashion dresses",
                "shoe": "shoes",
                "outerwear": "fashion outerwear",
                "accessory": "accessories",
                "legging": "fashion leggings"
            };
            
            const searchTerm = categoryMap[categoryParam] || categoryParam;
            const fullSearch = colorParam ? `${colorParam} ${searchTerm}` : searchTerm;
            
            setSearchQuery(fullSearch);
            setSelectedCategory("fashion");
            
            // Auto-trigger search after a short delay
            setTimeout(() => {
                const btn = document.querySelector('[data-search-trigger]') as HTMLButtonElement;
                btn?.click();
            }, 100);
        }
    }, [searchParams]);

    useEffect(() => {
        // If user previously consented, ensure modal is closed
        if (hasAdultConsent()) setConsentOpen(false);
    }, []);

    const fetchResults = useCallback(async (requestedPage = 1, append = false) => {
        if (!searchQuery.trim()) return;

        // If user is searching 'adult' category, ensure consent has been given
        if (selectedCategory === "adult" && !hasAdultConsent()) {
            setConsentOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            // Use retailer adapter stub for now (mock data) to reduce reliance on Gemini for paging during development
            const adapterRes = await searchRetailer(searchQuery, selectedRetailer === "all" ? null : selectedRetailer, selectedCategory === "all" ? null : selectedCategory, requestedPage, limit);
            const itemsWithIds = (adapterRes.products as APIProduct[]).map((p) => ({
                name: p.name,
                retailer: p.retailer as ShoppingRetailer,
                category: p.category as ShoppingCategory,
                price: p.price,
                description: p.description,
                url: p.url,
                image: p.image,
                id: uuidv4(),
                inWishlist: false,
                dateAdded: Date.now(),
            }));

            if (append) {
                setSearchResults((prev) => [...prev, ...itemsWithIds]);
            } else {
                setSearchResults(itemsWithIds);
            }

            setTotal(Number(adapterRes.total) || 0);
            setPage(Number(adapterRes.page) || requestedPage);
            setShowResults(true);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, selectedRetailer, selectedCategory, limit]);

    const handleSearch = useCallback(() => {
        // kick off a fresh search (page 1)
        fetchResults(1, false);
    }, [fetchResults]);

    const lastLoadRef = useRef<number>(0);
    const LOAD_THROTTLE_MS = 600;

    const loadMore = useCallback(() => {
        if (isLoading) return;
        const now = Date.now();
        if (now - (lastLoadRef.current || 0) < LOAD_THROTTLE_MS) return;
        lastLoadRef.current = now;
        const next = page + 1;
        // Do not request beyond available total pages
        if (total && (searchResults.length >= total)) return;
        fetchResults(next, true);
    }, [fetchResults, page, isLoading, total, searchResults.length]);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!sentinelRef.current) return;
        const el = sentinelRef.current;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadMore();
                }
            });
        }, { root: null, rootMargin: '300px', threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [sentinelRef, loadMore]);

    const handleAddToWishlist = useCallback((item: ShoppingItem) => {
        addShoppingItem(item);
    }, [addShoppingItem]);

    const wishlistItems = shoppingItems.filter(item => item.inWishlist);
    const filteredResults = searchResults.filter(item => !shoppingItems.some(si => si.id === item.id));

    return (
        <div className="pb-24 bg-gradient-to-b from-rose-50 to-background dark:from-slate-900 dark:to-background">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border z-40 p-4">
                <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-rose-500" />
                    Shopping
                </h1>

                {/* Search Bar */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search fashion, makeup, wellness..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        data-search-trigger
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                </div>

                {/* Filters */}
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">Retailer</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedRetailer("all")}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                                    selectedRetailer === "all"
                                        ? "bg-rose-500 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                All
                            </button>
                            {RETAILERS.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setSelectedRetailer(r)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                                        selectedRetailer === r
                                            ? "bg-rose-500 text-white"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    {r === "adam-eve" ? "Adam & Eve" : r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory("all")}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                                    selectedCategory === "all"
                                        ? "bg-rose-500 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                All
                            </button>
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCategory(c)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                                        selectedCategory === c
                                            ? "bg-rose-500 text-white"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4">
                <AdultConsentModal open={consentOpen} onClose={() => setConsentOpen(false)} />
                {/* Wishlist Section */}
                {wishlistItems.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                            <h2 className="text-lg font-bold text-foreground">Wishlist ({wishlistItems.length})</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {wishlistItems.map((item) => (
                                <ShoppingCard
                                    key={item.id}
                                    item={item}
                                    onRemove={() => removeShoppingItem(item.id)}
                                    isInWishlist={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {showResults && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">
                                Search Results ({total || filteredResults.length})
                            </h2>
                            <button
                                onClick={() => setShowResults(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {filteredResults.length > 0 ? (
                            <div>
                                <div className="grid grid-cols-2 gap-4">
                                    {filteredResults.map((item) => (
                                        <div key={item.id} className="relative">
                                            <ShoppingCard
                                                item={item}
                                                onAdd={() => handleAddToWishlist(item)}
                                                isInWishlist={false}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {isLoading && <ShoppingSkeleton count={4} />}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                All results are already in your wishlist!
                            </div>
                        )}
                        {/* Infinite scroll sentinel */}
                        {searchResults.length > 0 && searchResults.length < total && (
                            <div className="flex justify-center mt-6">
                                <div ref={sentinelRef} className="w-full h-6" />
                            </div>
                        )}
                        {isLoading && (
                            <div className="flex justify-center mt-4 text-sm text-muted-foreground">Loading...</div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!showResults && wishlistItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground mb-2">Start shopping to build your wishlist</p>
                        <p className="text-xs text-muted-foreground/60">Search for fashion, makeup, and wellness items</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ShoppingCardProps {
    item: ShoppingItem;
    onAdd?: () => void;
    onRemove?: () => void;
    isInWishlist: boolean;
}

function ShoppingCard({ item, onAdd, onRemove, isInWishlist }: ShoppingCardProps) {
    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="aspect-square relative bg-muted overflow-hidden">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {item.url && (
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white rounded-full text-slate-900 hover:bg-rose-50"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                    {isInWishlist ? (
                        onRemove && (
                            <button
                                onClick={onRemove}
                                className="p-2 bg-white rounded-full text-rose-600 hover:bg-red-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )
                    ) : (
                        onAdd && (
                            <button
                                onClick={onAdd}
                                className="p-2 bg-white rounded-full text-rose-600 hover:bg-rose-50"
                            >
                                <Heart className="w-4 h-4" />
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 capitalize">{item.retailer}</p>
                {item.price && (
                    <p className="text-sm font-bold text-rose-600">${item.price.toFixed(2)}</p>
                )}
            </div>
        </div>
    );
}

export default function ShoppingPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <ShoppingPageContent />
        </Suspense>
    );
}

"use client";

import { useState } from "react";
import { Heart, ShoppingBag, ExternalLink, Loader2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { ShoppingItem, ShoppingRetailer, ShoppingCategory } from "@/types";
import { hasAdultConsent, isAdultCategory } from "@/utils/contentPolicy";
import Image from "next/image";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

interface ShoppingWidgetProps {
    showWishlistOnly?: boolean;
    limit?: number;
}

export function ShoppingWidget({ showWishlistOnly = true, limit = 4 }: ShoppingWidgetProps) {
    const { shoppingItems } = useStore();
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const [recommendations, setRecommendations] = useState<ShoppingItem[]>([]);

    // Respect adult consent: hide adult items from widgets when user hasn't consented
    const wishlistItems = shoppingItems
        .filter(item => item.inWishlist)
        .filter(item => (isAdultCategory(item.category) ? hasAdultConsent() : true))
        .slice(0, limit);

    const loadRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
            const res = await fetch("/api/shopping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "recommendations" }),
            });

            const data = await res.json();
            if (data.recommendations) {
                type APIRec = {
                    name: string;
                    retailer: string;
                    category: string;
                    price?: number;
                    description?: string;
                    url?: string;
                    image?: string;
                };
                const itemsWithIds = (data.recommendations as APIRec[]).map((p) => ({
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
                setRecommendations(itemsWithIds);
            }
        } catch (error) {
            console.error("Failed to load recommendations:", error);
        } finally {
            setIsLoadingRecommendations(false);
        }
    };

    if (wishlistItems.length === 0 && recommendations.length === 0 && !showWishlistOnly) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Wishlist Section */}
            {wishlistItems.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                            Your Wishlist
                        </h3>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            {wishlistItems.length} items
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {wishlistItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative aspect-square bg-muted rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {item.image && (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    <p className="text-white text-xs font-semibold line-clamp-2">{item.name}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                    <Link
                        href="/shopping"
                        className="mt-3 w-full text-center text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
                    >
                        View All →
                    </Link>
                </div>
            )}

            {/* Recommendations Section (when shown on home) */}
            {!showWishlistOnly && recommendations.length === 0 && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 rounded-lg border border-border p-4 text-center">
                    <ShoppingBag className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground mb-2">Shopping Recommendations</p>
                    <p className="text-xs text-muted-foreground mb-3">Get personalized product suggestions</p>
                    <button
                        onClick={loadRecommendations}
                        disabled={isLoadingRecommendations}
                        className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        {isLoadingRecommendations && <Loader2 className="w-4 h-4 animate-spin" />}
                        Load Recommendations
                    </button>
                </div>
            )}

            {/* Empty State */}
            {wishlistItems.length === 0 && recommendations.length === 0 && showWishlistOnly && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-border p-4 text-center">
                    <Heart className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No wishlist items yet</p>
                    <Link href="/shopping" className="text-xs text-rose-600 hover:text-rose-700 mt-2 block">
                        Start shopping →
                    </Link>
                </div>
            )}
        </div>
    );
}

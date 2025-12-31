"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Loader2, ShoppingBag, Search, Sparkles } from "lucide-react";

interface Recommendation {
    name: string;
    reason: string;
    category: "clothing" | "makeup";
}

export function ShoppingRecommendations() {
    const { items } = useStore();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);

    const generateRecommendations = async () => {
        console.log("Generate recommendations button clicked!");
        setLoading(true);
        try {
            // Simplify context to save tokens
            const context = items.map(i => ({ name: i.name, type: i.type, category: i.category }));
            console.log("Sending context:", context);

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "json",
                    context: context
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("API Error:", errorData);
                
                // If missing API key, use fallback recommendations
                if (errorData.error?.includes("Missing API Key") || errorData.error?.includes("API Key")) {
                    console.log("Using fallback recommendations (no API key configured)");
                    const fallbackRecs = generateFallbackRecommendations(items);
                    setRecommendations(fallbackRecs);
                    setHasGenerated(true);
                    return;
                }
                
                alert(`Failed to generate recommendations: ${errorData.error || 'Unknown error'}`);
                return;
            }

            const data = await res.json();
            console.log("Received data:", data);
            
            if (data.recommendations) {
                setRecommendations(data.recommendations);
                setHasGenerated(true);
            } else if (data.error) {
                console.error("API returned error:", data.error);
                alert(`Error: ${data.error}`);
            } else {
                console.error("Unexpected response format:", data);
                alert("Received unexpected response format from API");
            }
        } catch (error) {
            console.error("Failed to get recommendations", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Failed to generate recommendations'}`);
        } finally {
            setLoading(false);
        }
    };

    const generateFallbackRecommendations = (userItems: typeof items): Recommendation[] => {
        const hasClothing = userItems.some(i => i.type === "clothing");
        const hasMakeup = userItems.some(i => i.type === "makeup");
        const hasDresses = userItems.some(i => i.category === "dress");
        const hasShoes = userItems.some(i => i.category === "shoe");
        const hasLips = userItems.some(i => i.category === "lip");
        const hasEyes = userItems.some(i => i.category === "eye");

        const recs: Recommendation[] = [];

        if (!hasDresses || userItems.filter(i => i.category === "dress").length < 3) {
            recs.push({
                name: "Little Black Dress",
                reason: "A versatile classic that pairs with any accessories and works for multiple occasions",
                category: "clothing"
            });
        }

        if (!hasShoes || userItems.filter(i => i.category === "shoe").length < 2) {
            recs.push({
                name: "Nude Heels",
                reason: "Essential footwear that elongates legs and complements any outfit",
                category: "clothing"
            });
        }

        recs.push({
            name: "Statement Belt",
            reason: "Perfect for cinching waists and adding definition to dresses and tops",
            category: "clothing"
        });

        if (!hasLips || userItems.filter(i => i.category === "lip").length < 2) {
            recs.push({
                name: "Classic Red Lipstick",
                reason: "A timeless essential that adds instant glamour and confidence",
                category: "makeup"
            });
        }

        if (!hasEyes) {
            recs.push({
                name: "Neutral Eyeshadow Palette",
                reason: "Versatile everyday colors for natural to dramatic looks",
                category: "makeup"
            });
        }

        return recs.slice(0, 5);
    };

    return (
        <div className="space-y-6">
            {!hasGenerated ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Smart Shopping List</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                        Let Aura analyze your closet and vanity to suggest the perfect additions to your collection.
                    </p>
                    <button
                        onClick={() => {
                            console.log("Button clicked - direct handler");
                            generateRecommendations();
                        }}
                        disabled={loading}
                        type="button"
                        className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 mx-auto cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Recommendations
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {recommendations.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border shadow-sm flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${item.category === "makeup" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                                    }`}>
                                    {item.category}
                                </span>
                            </div>
                            <h4 className="font-semibold text-lg mb-1">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">{item.reason}</p>
                            <a
                                href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-muted hover:bg-muted/80 text-foreground text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Search className="w-4 h-4" />
                                Search on Amazon
                            </a>
                        </div>
                    ))}
                    <div className="col-span-full text-center mt-4">
                        <button
                            onClick={generateRecommendations}
                            disabled={loading}
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Refresh Recommendations
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

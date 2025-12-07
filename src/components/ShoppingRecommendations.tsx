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
        setLoading(true);
        try {
            // Simplify context to save tokens
            const context = items.map(i => ({ name: i.name, type: i.type, category: i.category }));

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "json",
                    context: context
                }),
            });

            const data = await res.json();
            if (data.recommendations) {
                setRecommendations(data.recommendations);
                setHasGenerated(true);
            }
        } catch (error) {
            console.error("Failed to get recommendations", error);
        } finally {
            setLoading(false);
        }
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
                        onClick={generateRecommendations}
                        disabled={loading}
                        className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 mx-auto"
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

"use client";

import { useStore } from "@/hooks/useStore";
import { CheckCircle2, Circle } from "lucide-react";

const ESSENTIALS = [
    { name: "Little Black Dress", category: "dress" },
    { name: "Denim Jacket", category: "outerwear" },
    { name: "White Tee", category: "top" },
    { name: "Black Heels", category: "shoe" },
    { name: "Red Lipstick", category: "lip" },
    { name: "Foundation", category: "face" },
    { name: "Mascara", category: "eye" },
];

export function EssentialsChecklist() {
    const { items } = useStore();

    // Simple fuzzy match
    const checkStatus = (essentialName: string, category: string) => {
        return items.some(
            (i) =>
                i.category === category &&
                (i.name.toLowerCase().includes(essentialName.toLowerCase()) ||
                    essentialName.toLowerCase().includes(i.name.toLowerCase()) ||
                    // Broad category match if specific name fails but category matches? 
                    // No, let's keep it specific to name for "Essentials"
                    i.name.toLowerCase().includes(essentialName.split(" ")[1]?.toLowerCase() || ""))
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Wardrobe Essentials</h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border divide-y divide-border">
                {ESSENTIALS.map((essential) => {
                    const hasItem = checkStatus(essential.name, essential.category);
                    return (
                        <div key={essential.name} className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {hasItem ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground" />
                                )}
                                <span className={hasItem ? "text-foreground" : "text-muted-foreground"}>
                                    {essential.name}
                                </span>
                            </div>
                            {!hasItem && (
                                <span className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-full">
                                    Missing
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

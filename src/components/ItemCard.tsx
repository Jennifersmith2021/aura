"use client";

import { Item } from "@/types";
import { useState } from "react";
import { ExternalLink, Trash2, Sparkles } from "lucide-react";
import Image from "next/image";
import { OutfitGenerator } from "./OutfitGenerator";

interface ItemCardProps {
    item: Item;
    onDelete?: (id: string) => void;
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
    const [isStyling, setIsStyling] = useState(false);

    return (
        <>
            <div className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-in fade-in zoom-in-95">
                <div className="aspect-square relative bg-muted">
                    {item.image ? (
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                        </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {/* Style Me Button */}
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
                    </div>
                </div>

                <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {item.brand || item.category}
                    </p>
                </div>
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

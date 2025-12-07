"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Save, Shirt } from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
// import { Item } from "@/types"; // Commenting out unused import

export function Lookbook() {
    const { items, looks, addLook } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [lookName, setLookName] = useState("");

    const toggleItem = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((i) => i !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleSave = () => {
        if (!lookName || selectedItems.length === 0) return;
        addLook({
            id: uuidv4(),
            name: lookName,
            items: selectedItems,
            dateCreated: Date.now(),
        });
        setIsCreating(false);
        setLookName("");
        setSelectedItems([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">My Looks</h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="text-sm text-primary font-medium"
                >
                    {isCreating ? "Cancel" : "Create New"}
                </button>
            </div>

            {isCreating && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-4 border border-border">
                    <input
                        type="text"
                        placeholder="Look Name (e.g. Date Night)"
                        className="w-full p-2 rounded-lg border border-border bg-white dark:bg-slate-900"
                        value={lookName}
                        onChange={(e) => setLookName(e.target.value)}
                    />

                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {items.filter(i => i.type === "clothing").map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${selectedItems.includes(item.id) ? "border-primary" : "border-transparent"
                                    }`}
                            >
                                {item.image ? (
                                    <div className="relative w-full h-full">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <Shirt className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!lookName || selectedItems.length === 0}
                        className="w-full bg-primary text-white py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Look
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {looks.map((look) => (
                    <div key={look.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-border shadow-sm">
                        <h3 className="font-medium text-sm mb-2">{look.name}</h3>
                        <div className="flex -space-x-2 overflow-hidden mb-2">
                            {look.items.slice(0, 4).map((itemId) => {
                                const item = items.find((i) => i.id === itemId);
                                if (!item) return null;
                                        return (
                                    <div key={itemId} className="w-8 h-8 rounded-full border-2 border-white bg-muted overflow-hidden relative">
                                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {look.items.length} items
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

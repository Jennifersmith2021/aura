"use client";

import { useStore } from "@/hooks/useStore";
import { Item } from "@/types";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Camera, RefreshCw } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

interface OutfitGeneratorProps {
    baseItem: Item;
    onClose: () => void;
}

export function OutfitGenerator({ baseItem, onClose }: OutfitGeneratorProps) {
    const { items, addTimelineEntry } = useStore();
    const [generatedLook, setGeneratedLook] = useState<Item[]>([]);
    const [step, setStep] = useState<"generating" | "review" | "capture">("generating");

    // Capture state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    function generateOutfit() {
        // Simple logic: Base Item + 1 compatible item from each other major category
        const look: Item[] = [baseItem];

        // Define complementary categories
        const categories = {
            top: ["bottom", "shoe", "accessory"],
            bottom: ["top", "shoe", "accessory"],
            dress: ["shoe", "accessory"],
            shoe: ["top", "bottom", "dress", "accessory"],
            accessory: ["top", "bottom", "dress", "shoe"],
        };

        // Special case handling
        let neededCats: string[] = [];
        if (baseItem.category === "dress") {
            neededCats = ["shoe", "accessory"];
        } else if (baseItem.category === "top") {
            // 50% chance of skirt/pants vs dress (if layers supported, but keep simple)
            neededCats = ["bottom", "shoe"];
        } else if (baseItem.category === "bottom") {
            neededCats = ["top", "shoe"];
        } else {
            // Fallback for accessories/shoes
            neededCats = ["top", "bottom"];
        }

        neededCats.forEach(cat => {
            const candidates = items.filter(i =>
                (cat === "bottom" ? (i.category === "bottom" || i.category === "dress") : i.category === cat) &&
                i.id !== baseItem.id
            );
            if (candidates.length > 0) {
                const random = candidates[Math.floor(Math.random() * candidates.length)];
                look.push(random);
            }
        });

        // Always try to add an accessory if not already present
        if (!look.some(i => i.category === "accessory") && Math.random() > 0.3) {
            const accessories = items.filter(i => i.category === "accessory");
            if (accessories.length > 0) {
                look.push(accessories[Math.floor(Math.random() * accessories.length)]);
            }
        }

        setGeneratedLook(look);
        setStep("review");
    }

    const handleWearIt = () => {
        setStep("capture");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePost = () => {
        if (preview) {
            const outfitName = `Styling: ${baseItem.name}`;
            const outfitDescription = `Wore ${generatedLook.map(i => i.name).join(", ")}`;

            addTimelineEntry({
                id: uuidv4(),
                date: Date.now(),
                photo: preview,
                notes: `${outfitName}\n${outfitDescription}`,
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        AI Stylist
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-6">
                    {step === "review" && (
                        <>
                            <div className="text-center space-y-2">
                                <h4 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-rose-500 bg-clip-text text-transparent">
                                    Try this Look!
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    I built this outfit around your {baseItem.name}.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {generatedLook.map(item => (
                                    <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                                                {item.name}
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 truncate text-center">
                                            {item.name}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={generateOutfit}
                                    className="flex-1 py-3 rounded-xl border border-border hover:bg-muted font-medium flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Shuffle
                                </button>
                                <button
                                    onClick={handleWearIt}
                                    className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Camera className="w-4 h-4" />
                                    Wear It
                                </button>
                            </div>
                        </>
                    )}

                    {step === "capture" && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h4 className="font-semibold text-lg">Capture the Look</h4>
                                <p className="text-sm text-muted-foreground">Take a photo of yourself wearing this outfit!</p>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                            >
                                {preview ? (
                                    <Image src={preview} alt="Upload preview" fill className="object-cover" />
                                ) : (
                                    <>
                                        <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground font-medium">Click to Upload Photo</span>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />

                            {preview && (
                                <button
                                    onClick={handleSavePost}
                                    className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-700 transition-colors"
                                >
                                    Save to Journey
                                </button>
                            )}
                            <button
                                onClick={() => setStep("review")}
                                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                Back to Styling
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

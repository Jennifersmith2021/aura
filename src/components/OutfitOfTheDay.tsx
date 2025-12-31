"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Item } from "@/types";
import { Sparkles, RefreshCw, SunMedium, Camera, Wand2, Shirt, Calendar, Palette, CloudRain, Thermometer, Smile } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

const occasions = [
    "Everyday",
    "Work",
    "Date Night",
    "Brunch",
    "Party",
    "Workout",
    "Cozy",
];

type Suggestion = {
    items: Item[];
    source: "look" | "mix";
    name: string;
};

function pickRandom<T>(arr: T[]): T | null {
    if (!arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function OutfitOfTheDay() {
    const { looks, items, addTimelineEntry } = useStore();
    const [occasion, setOccasion] = useState("Everyday");
    const [includeAccessories, setIncludeAccessories] = useState(true);
    const [weather, setWeather] = useState("Mild");
    const [mood, setMood] = useState("Playful");
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const clothingItems = useMemo(() => items.filter((i) => i.type === "clothing"), [items]);

    const suggestFromLook = () => {
        if (!looks.length) return null;
        const picked = pickRandom(looks);
        if (!picked) return null;
        const mapped = picked.items
            .map((id) => clothingItems.find((i) => i.id === id))
            .filter(Boolean) as Item[];
        return mapped.length
            ? { items: mapped, source: "look" as const, name: picked.name }
            : null;
    };

    const mixAndMatch = () => {
        const pool = clothingItems;
        if (!pool.length) return null;

        const tops = pool.filter((i) => i.category === "top");
        const bottoms = pool.filter((i) => i.category === "bottom");
        const dresses = pool.filter((i) => i.category === "dress");
        const shoes = pool.filter((i) => i.category === "shoe");
        const accessories = pool.filter((i) => i.category === "accessory");
        const outerwear = pool.filter((i) => i.category === "outerwear");

        const picked: Item[] = [];

        const prefersDress = weather === "Hot" || mood === "Soft";

        if (dresses.length && (prefersDress || Math.random() > 0.4)) {
            picked.push(pickRandom(dresses)!);
        } else {
            if (tops.length) picked.push(pickRandom(tops)!);
            if (bottoms.length) picked.push(pickRandom(bottoms)!);
        }
        if (shoes.length) picked.push(pickRandom(shoes)!);
        if (includeAccessories && accessories.length && (mood === "Bold" || Math.random() > 0.3)) picked.push(pickRandom(accessories)!);

        // Weather adjustments
        if ((weather === "Cold" || weather === "Rainy") && outerwear.length) {
            picked.push(pickRandom(outerwear)!);
        }
        if (weather === "Hot") {
            // Avoid outerwear if present
            picked.splice(0, picked.length, ...picked.filter((p) => p.category !== "outerwear"));
        }

        const unique = Array.from(new Map(picked.map((p) => [p.id, p])).values());
        const name = `Styled Mix${weather ? ` · ${weather}` : ""}${mood ? ` · ${mood}` : ""}`;
        return { items: unique, source: "mix" as const, name };
    };

    const generateSuggestion = () => {
        const lookSuggestion = suggestFromLook();
        const fallback = mixAndMatch();
        setSuggestion(lookSuggestion ?? fallback ?? null);
    };

    useEffect(() => {
        generateSuggestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [occasion, includeAccessories, weather, mood]);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPhoto(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!suggestion) return;
        await addTimelineEntry({
            id: crypto.randomUUID(),
            date: Date.now(),
            photo: photo ?? "",
            notes: `OOTD (${occasion}): ${suggestion.items.map((i) => i.name).join(", ")}`,
        });
        setPhoto(null);
    };

    const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <SunMedium className="w-5 h-5 text-amber-500" />
                        Outfit of the Day
                    </h3>
                    <p className="text-xs text-muted-foreground">Quick pick based on your closet</p>
                </div>
                <button
                    onClick={generateSuggestion}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow"
                >
                    <RefreshCw className="w-4 h-4" />
                    Shuffle
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {todayLabel}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {occasions.map((o) => (
                            <button
                                key={o}
                                onClick={() => setOccasion(o)}
                                className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-semibold border",
                                    occasion === o
                                        ? "bg-pink-500 text-white border-pink-400"
                                        : "bg-white/5 text-foreground border-white/10 hover:bg-white/10"
                                )}
                            >
                                {o}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Wand2 className="w-4 h-4 text-purple-400" />
                        Options
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={includeAccessories}
                            onChange={(e) => setIncludeAccessories(e.target.checked)}
                            className="accent-pink-500"
                        />
                        Include accessories
                    </label>
                    <div className="space-y-2">
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <CloudRain className="w-4 h-4" /> Weather
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(["Mild", "Hot", "Cold", "Rainy"] as const).map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setWeather(w)}
                                    className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-semibold border",
                                        weather === w ? "bg-purple-500 text-white border-purple-400" : "bg-white/5 text-foreground border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Smile className="w-4 h-4" /> Mood
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(["Playful", "Soft", "Bold"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMood(m)}
                                    className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-semibold border",
                                        mood === m ? "bg-pink-500 text-white border-pink-400" : "bg-white/5 text-foreground border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Uses saved looks when possible, otherwise mixes pieces and adapts to weather/mood.</p>
                </div>
            </div>

            {suggestion ? (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-pink-400" />
                            <div className="text-sm font-semibold">
                                {suggestion.name}
                                <span className="ml-2 text-xs text-muted-foreground">{suggestion.source === "look" ? "From your looks" : "Mixed"}</span>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Palette className="w-4 h-4" />
                            {occasion}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {suggestion.items.map((item) => (
                            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                                        <Shirt className="w-6 h-6 text-pink-400 mb-1" />
                                        {item.name}
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 text-[11px] text-white bg-black/60 px-2 py-1 truncate">
                                    {item.name}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                        >
                            <Camera className="w-4 h-4" />
                            {photo ? "Change Photo" : "Add Worn Photo"}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow"
                        >
                            Save to Timeline
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhoto} />
                    </div>

                    {photo && (
                        <div className="rounded-xl overflow-hidden border border-white/10 max-w-xs">
                            <Image src={photo} alt="OOTD upload" width={400} height={400} className="w-full h-auto object-cover" />
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-4 rounded-xl border border-dashed border-white/20 text-sm text-muted-foreground">
                    Add a few looks or clothing items to get an Outfit of the Day.
                </div>
            )}
        </div>
    );
}

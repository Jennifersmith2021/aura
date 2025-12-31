"use client";
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Heart, ShoppingBag, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/hooks/useStore";
import clsx from "clsx";

interface StyleProfile {
    bodyType: "pear" | "apple" | "hourglass" | "rectangle" | "inverted-triangle";
    heightCategory: "petite" | "average" | "tall";
    stylePreference: string[];
    occasion: string;
}

const bodyTypeRecommendations = {
    pear: {
        description: "Wider hips and thighs, narrower shoulders",
        strengths: ["Defined waist", "Feminine curves", "Balanced proportions with right styling"],
        tips: [
            "Emphasize your shoulders and upper body",
            "A-line skirts and dresses work beautifully",
            "Dark colors on bottom, brighter on top",
            "Structured jackets add balance",
            "Avoid skinny jeans, try bootcut or flare",
        ],
        bestItems: ["Empire waist dresses", "A-line skirts", "Statement tops", "Structured blazers"],
        avoid: ["Skinny jeans", "Cargo pants", "Hip pockets", "Tight pencil skirts"],
    },
    apple: {
        description: "Fuller midsection, narrower hips",
        strengths: ["Great legs", "Defined shoulders", "Balanced with right cuts"],
        tips: [
            "Draw attention to your legs",
            "V-necks elongate your torso",
            "Empire waists are flattering",
            "Avoid belts at natural waist",
            "Try wrap dresses for definition",
        ],
        bestItems: ["V-neck tops", "Empire waist dresses", "Long cardigans", "Bootcut pants"],
        avoid: ["Clingy fabrics", "Horizontal stripes", "Crop tops", "High-waisted anything"],
    },
    hourglass: {
        description: "Balanced bust and hips, defined waist",
        strengths: ["Natural curves", "Defined waist", "Proportionate figure"],
        tips: [
            "Show off your waist with belts",
            "Fitted styles work best",
            "Wrap dresses are your friend",
            "Avoid boxy or oversized looks",
            "Embrace your curves confidently",
        ],
        bestItems: ["Wrap dresses", "Fitted blazers", "Pencil skirts", "Belted coats"],
        avoid: ["Shapeless clothing", "Baggy styles", "Drop-waist dresses"],
    },
    rectangle: {
        description: "Similar measurements all around",
        strengths: ["Athletic build", "Can wear many styles", "Great for layering"],
        tips: [
            "Create curves with peplum tops",
            "Belts define your waist",
            "Ruffles and details add dimension",
            "Try fit-and-flare dresses",
            "Layering creates shape",
        ],
        bestItems: ["Peplum tops", "Fit-and-flare dresses", "Belted styles", "Ruffled blouses"],
        avoid: ["Straight-cut dresses", "Boxy tops", "Shapeless clothing"],
    },
    "inverted-triangle": {
        description: "Broader shoulders, narrower hips",
        strengths: ["Athletic shoulders", "Defined upper body", "Great for structured looks"],
        tips: [
            "Balance with volume on bottom",
            "A-line skirts add curves below",
            "Dark colors on top, light on bottom",
            "V-necks soften broad shoulders",
            "Avoid shoulder pads and puff sleeves",
        ],
        bestItems: ["A-line skirts", "Flared pants", "V-neck tops", "Full skirts"],
        avoid: ["Boat necks", "Shoulder pads", "Halter tops", "Skinny pants"],
    },
};

const heightRecommendations = {
    petite: {
        tips: [
            "Monochromatic outfits elongate",
            "High-waisted bottoms lengthen legs",
            "Avoid overwhelming prints",
            "Tailoring is your best friend",
            "Cropped jackets show more leg",
        ],
    },
    average: {
        tips: [
            "Most styles work great for you",
            "Experiment with proportions",
            "Balance is key",
            "Play with different lengths",
        ],
    },
    tall: {
        tips: [
            "Embrace maxi lengths",
            "Horizontal stripes add width",
            "Wide-leg pants look amazing",
            "Crop tops are perfect",
            "Don't shy away from heels",
        ],
    },
};

const occasionOutfits = {
    casual: ["Skinny jeans + cute top", "Casual dress + sneakers", "Leggings + oversized sweater"],
    work: ["Pencil skirt + blouse", "Tailored pants + blazer", "Shift dress + pumps"],
    date: ["Little black dress + heels", "Fitted dress + statement jewelry", "Sexy top + skirt"],
    party: ["Cocktail dress", "Sequin top + leather pants", "Jumpsuit + heels"],
    gym: ["Sports bra + leggings", "Athletic tank + shorts", "Matching workout set"],
};

export default function StyleAdvisor() {
    const { items, measurements } = useStore();
    const [profile, setProfile] = useState<StyleProfile>({
        bodyType: "hourglass",
        heightCategory: "average",
        stylePreference: [],
        occasion: "casual",
    });

    // Auto-detect body type from measurements
    useEffect(() => {
        if (measurements.length > 0) {
            const latest = measurements[0];
            const waist = latest.values.waist ?? 0;
            const hips = latest.values.hips || 0;
            const bust = latest.values.bust || latest.values.breast || 0;

            if (hips > bust + 2 && waist < hips - 7) {
                setProfile((p) => ({ ...p, bodyType: "pear" }));
            } else if (bust > hips + 2) {
                setProfile((p) => ({ ...p, bodyType: "inverted-triangle" }));
            } else if (Math.abs(bust - hips) <= 2 && waist < bust - 7) {
                setProfile((p) => ({ ...p, bodyType: "hourglass" }));
            } else if (Math.abs(bust - waist) <= 5) {
                setProfile((p) => ({ ...p, bodyType: "rectangle" }));
            } else {
                setProfile((p) => ({ ...p, bodyType: "apple" }));
            }
        }
    }, [measurements]);

    const bodyRec = bodyTypeRecommendations[profile.bodyType];
    const heightRec = heightRecommendations[profile.heightCategory];

    const clothingItems = items.filter((i) => i.type === "clothing");
    const recommendedItems = clothingItems.filter((item) =>
        bodyRec.bestItems.some((rec) => item.name.toLowerCase().includes(rec.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Personal Style Advisor</h2>
                    <p className="text-sm text-muted-foreground">
                        Personalized recommendations for your body type
                    </p>
                </div>
                <Sparkles className="w-8 h-8 text-purple-400" />
            </div>

            {/* Profile Setup */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-5 border border-purple-500/30">
                <h3 className="font-bold text-lg text-foreground mb-4">Your Profile</h3>

                <div className="space-y-4">
                    {/* Body Type */}
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Body Type
                        </label>
                        <select
                            value={profile.bodyType}
                            onChange={(e) =>
                                setProfile({ ...profile, bodyType: e.target.value as any })
                            }
                            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                        >
                            <option value="pear">Pear (Triangle)</option>
                            <option value="apple">Apple (Round)</option>
                            <option value="hourglass">Hourglass</option>
                            <option value="rectangle">Rectangle (Athletic)</option>
                            <option value="inverted-triangle">Inverted Triangle</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                            {bodyRec.description}
                        </p>
                    </div>

                    {/* Height */}
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Height Category
                        </label>
                        <div className="flex gap-2">
                            {(["petite", "average", "tall"] as const).map((height) => (
                                <button
                                    key={height}
                                    onClick={() => setProfile({ ...profile, heightCategory: height })}
                                    className={clsx(
                                        "flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                                        profile.heightCategory === height
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                            : "bg-secondary text-foreground hover:bg-accent"
                                    )}
                                >
                                    {height}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Occasion */}
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Today's Occasion
                        </label>
                        <select
                            value={profile.occasion}
                            onChange={(e) => setProfile({ ...profile, occasion: e.target.value })}
                            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                        >
                            <option value="casual">Casual Day</option>
                            <option value="work">Work/Professional</option>
                            <option value="date">Date Night</option>
                            <option value="party">Party/Night Out</option>
                            <option value="gym">Gym/Workout</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Your Strengths */}
            <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30">
                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Your Body's Strengths
                </h3>
                <div className="space-y-2">
                    {bodyRec.strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <span className="text-green-400 shrink-0">✓</span>
                            <span className="text-sm text-foreground font-medium">{strength}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Styling Tips */}
            <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/30">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Styling Tips for You
                </h3>
                <div className="space-y-2">
                    {bodyRec.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <span className="text-blue-400 shrink-0">•</span>
                            <span className="text-sm text-foreground font-medium">{tip}</span>
                        </div>
                    ))}
                    {heightRec.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <span className="text-blue-400 shrink-0">•</span>
                            <span className="text-sm text-foreground font-medium">{tip}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Best Items */}
            <div className="bg-purple-500/10 rounded-xl p-5 border border-purple-500/30">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Best Items for Your Shape
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {bodyRec.bestItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-purple-500/20 rounded-lg px-3 py-2 text-sm text-foreground font-medium"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Avoid */}
            <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
                <h3 className="font-bold text-lg text-red-300 mb-3">Items to Avoid</h3>
                <div className="grid grid-cols-2 gap-2">
                    {bodyRec.avoid.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-red-500/20 rounded-lg px-3 py-2 text-sm text-foreground font-medium"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Outfit Ideas */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-5 border border-pink-500/30">
                <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-400" />
                    Outfit Ideas for {profile.occasion}
                </h3>
                <div className="space-y-2">
                    {occasionOutfits[profile.occasion as keyof typeof occasionOutfits]?.map(
                        (outfit, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 rounded-lg px-3 py-2 text-sm text-foreground font-medium"
                            >
                                {outfit}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* From Your Closet */}
            {recommendedItems.length > 0 && (
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-bold text-lg text-foreground mb-3">
                        Recommended from Your Closet
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {recommendedItems.slice(0, 6).map((item) => (
                            <div key={item.id} className="space-y-1">
                                <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-medium text-center p-2">
                                            {item.name}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium truncate">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

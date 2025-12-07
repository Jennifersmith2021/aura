"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, RefreshCw, Star, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { get, set } from "idb-keyval";

interface SavedAffirmation {
    text: string;
    category: string;
    savedDate: number;
    favorite: boolean;
}

const affirmationCategories = {
    femininity: [
        "I embrace my feminine energy with confidence and grace",
        "My femininity is a beautiful expression of who I truly am",
        "I am becoming more comfortable in my feminine self every day",
        "My feminine journey is valid and worthy of celebration",
        "I honor the woman within me with love and acceptance",
    ],
    confidence: [
        "I am enough exactly as I am",
        "I radiate confidence and self-assurance",
        "I trust my journey and embrace my authentic self",
        "My voice matters and deserves to be heard",
        "I am worthy of love, respect, and belonging",
    ],
    beauty: [
        "I am beautiful inside and out",
        "My unique beauty shines through in everything I do",
        "I take pride in my appearance and presentation",
        "Beauty is found in my authenticity and self-expression",
        "I deserve to feel gorgeous and glamorous",
    ],
    strength: [
        "I am brave enough to be my true self",
        "My courage inspires others to live authentically",
        "I overcome challenges with grace and determination",
        "My strength comes from embracing vulnerability",
        "I am resilient, powerful, and unstoppable",
    ],
    love: [
        "I am worthy of love and affection",
        "I love and accept myself unconditionally",
        "My heart is open to giving and receiving love",
        "I deserve tenderness, care, and compassion",
        "I am surrounded by love and support",
    ],
    transformation: [
        "Every day brings me closer to my true self",
        "I celebrate the progress I've made on my journey",
        "Change is beautiful and I embrace it fully",
        "My transformation is a gift I give myself",
        "I am blooming into the person I was meant to be",
    ],
};

export default function DailyAffirmations() {
    const [currentAffirmation, setCurrentAffirmation] = useState<{ text: string; category: string } | null>(null);
    const [savedAffirmations, setSavedAffirmations] = useState<SavedAffirmation[]>([]);
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        // Load saved affirmations
        get<SavedAffirmation[]>("affirmations").then((stored) => {
            if (stored) setSavedAffirmations(stored);
        });

        // Load daily affirmation (or generate new one)
        const today = new Date().toDateString();
        get<{ text: string; category: string; date: string }>("dailyAffirmation").then((stored) => {
            if (stored && stored.date === today) {
                setCurrentAffirmation({ text: stored.text, category: stored.category });
            } else {
                generateNewAffirmation();
            }
        });
    }, []);

    const generateNewAffirmation = useCallback(() => {
        const categories = Object.keys(affirmationCategories) as Array<keyof typeof affirmationCategories>;
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const categoryAffirmations = affirmationCategories[randomCategory];
        const randomAffirmation = categoryAffirmations[Math.floor(Math.random() * categoryAffirmations.length)];

        const affirmation = { text: randomAffirmation, category: randomCategory };
        setCurrentAffirmation(affirmation);

        // Save as today's affirmation
        set("dailyAffirmation", {
            ...affirmation,
            date: new Date().toDateString(),
        });
    }, []);

    const saveAffirmation = useCallback(() => {
        if (!currentAffirmation) return;

        const existing = savedAffirmations.find((a) => a.text === currentAffirmation.text);
        if (existing) return; // Already saved

        const newSaved: SavedAffirmation = {
            text: currentAffirmation.text,
            category: currentAffirmation.category,
            savedDate: Date.now(),
            favorite: false,
        };

        const updated = [newSaved, ...savedAffirmations];
        setSavedAffirmations(updated);
        set("affirmations", updated);
    }, [currentAffirmation, savedAffirmations]);

    const toggleFavorite = useCallback((text: string) => {
        const updated = savedAffirmations.map((a) =>
            a.text === text ? { ...a, favorite: !a.favorite } : a
        );
        setSavedAffirmations(updated);
        set("affirmations", updated);
    }, [savedAffirmations]);

    const removeAffirmation = useCallback((text: string) => {
        const updated = savedAffirmations.filter((a) => a.text !== text);
        setSavedAffirmations(updated);
        set("affirmations", updated);
    }, [savedAffirmations]);

    const categoryColors = {
        femininity: "from-pink-500 to-rose-500",
        confidence: "from-purple-500 to-indigo-500",
        beauty: "from-fuchsia-500 to-pink-500",
        strength: "from-orange-500 to-red-500",
        love: "from-red-500 to-pink-500",
        transformation: "from-blue-500 to-purple-500",
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Daily Affirmations
                </h3>
                <button
                    onClick={() => setShowSaved(!showSaved)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                    <Star className="w-4 h-4" />
                    Saved ({savedAffirmations.length})
                </button>
            </div>

            {!showSaved ? (
                <>
                    {/* Current Affirmation */}
                    <AnimatePresence mode="wait">
                        {currentAffirmation && (
                            <motion.div
                                key={currentAffirmation.text}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-gradient-to-br ${
                                    categoryColors[currentAffirmation.category as keyof typeof categoryColors]
                                } rounded-2xl p-8 text-center border border-white/20 shadow-lg relative overflow-hidden`}
                            >
                                {/* Sparkle decoration */}
                                <div className="absolute top-4 right-4">
                                    <Sparkles className="w-6 h-6 text-white/40" />
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <Sparkles className="w-6 h-6 text-white/40" />
                                </div>

                                {/* Category badge */}
                                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-4 text-white">
                                    {currentAffirmation.category}
                                </div>

                                {/* Affirmation text */}
                                <p className="text-xl font-medium text-white leading-relaxed mb-6">
                                    "{currentAffirmation.text}"
                                </p>

                                {/* Action buttons */}
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={saveAffirmation}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Save
                                    </button>
                                    <button
                                        onClick={generateNewAffirmation}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        New
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Info */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-white/60 text-center">
                            💫 Your affirmation refreshes daily. Save the ones that resonate with you!
                        </p>
                    </div>
                </>
            ) : (
                <>
                    {/* Saved Affirmations */}
                    {savedAffirmations.length > 0 ? (
                        <div className="space-y-3">
                            {savedAffirmations
                                .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
                                .map((affirmation) => (
                                    <motion.div
                                        key={affirmation.text}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`bg-gradient-to-br ${
                                            categoryColors[affirmation.category as keyof typeof categoryColors]
                                        } rounded-xl p-4 border border-white/20 relative`}
                                    >
                                        {/* Favorite star */}
                                        <button
                                            onClick={() => toggleFavorite(affirmation.text)}
                                            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            <Star
                                                className={`w-5 h-5 ${
                                                    affirmation.favorite ? "fill-yellow-400 text-yellow-400" : "text-white/40"
                                                }`}
                                            />
                                        </button>

                                        {/* Category */}
                                        <div className="text-xs text-white/70 mb-2 font-medium">
                                            {affirmation.category}
                                        </div>

                                        {/* Text */}
                                        <p className="text-sm text-white font-medium mb-3 pr-8 leading-relaxed">"{affirmation.text}"</p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-xs text-white/70">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(affirmation.savedDate).toLocaleDateString()}
                                            </div>
                                            <button
                                                onClick={() => removeAffirmation(affirmation.text)}
                                                className="text-white/40 hover:text-red-400 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                            <Heart className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/50 text-sm">No saved affirmations yet</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

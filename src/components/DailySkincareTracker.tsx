"use client";
/* eslint-disable react-hooks/immutability, react/no-unescaped-entities */

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Sun, Moon, Sparkles, Droplet } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface SkincareStep {
    id: string;
    name: string;
    time: "morning" | "evening" | "both";
    order: number;
    description: string;
    importance: "essential" | "recommended" | "optional";
    imageUrl?: string;
}

interface SkincareProgress {
    date: string;
    morningCompleted: string[];
    eveningCompleted: string[];
}

const skincareSteps: SkincareStep[] = [
    {
        id: "cleanser-am",
        name: "Gentle Cleanser",
        time: "morning",
        order: 1,
        description: "Wash away overnight oils and impurities",
        importance: "essential",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "toner-am",
        name: "Toner/Essence",
        time: "morning",
        order: 2,
        description: "Balance pH and prep skin for products",
        importance: "recommended",
    },
    {
        id: "serum-am",
        name: "Vitamin C Serum",
        time: "morning",
        order: 3,
        description: "Brighten and protect from environmental damage",
        importance: "recommended",
        imageUrl: "https://images.unsplash.com/photo-1508599967062-db7bbe62bdf9?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "eye-cream-am",
        name: "Eye Cream",
        time: "both",
        order: 4,
        description: "Hydrate delicate under-eye area",
        importance: "recommended",
    },
    {
        id: "moisturizer-am",
        name: "Moisturizer",
        time: "both",
        order: 5,
        description: "Lock in hydration",
        importance: "essential",
        imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "sunscreen",
        name: "Sunscreen SPF 30+",
        time: "morning",
        order: 6,
        description: "Essential UV protection - NEVER skip!",
        importance: "essential",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "makeup-remover",
        name: "Makeup Remover",
        time: "evening",
        order: 1,
        description: "Remove all makeup thoroughly",
        importance: "essential",
    },
    {
        id: "oil-cleanser",
        name: "Oil Cleanser",
        time: "evening",
        order: 2,
        description: "Deep clean and remove sunscreen",
        importance: "essential",
    },
    {
        id: "water-cleanser",
        name: "Water-based Cleanser",
        time: "evening",
        order: 3,
        description: "Second cleanse for completely clean skin",
        importance: "essential",
    },
    {
        id: "exfoliant",
        name: "Exfoliant (2-3x/week)",
        time: "evening",
        order: 4,
        description: "Remove dead skin cells for smooth texture",
        importance: "recommended",
    },
    {
        id: "toner-pm",
        name: "Toner/Essence",
        time: "evening",
        order: 5,
        description: "Rebalance and hydrate",
        importance: "recommended",
    },
    {
        id: "treatment",
        name: "Treatment Serum",
        time: "evening",
        order: 6,
        description: "Retinol, niacinamide, or targeted treatment",
        importance: "recommended",
    },
    {
        id: "eye-cream-pm",
        name: "Eye Cream",
        time: "both",
        order: 7,
        description: "Repair and hydrate overnight",
        importance: "recommended",
    },
    {
        id: "moisturizer-pm",
        name: "Night Cream/Moisturizer",
        time: "evening",
        order: 8,
        description: "Rich hydration for overnight repair",
        importance: "essential",
    },
    {
        id: "lip-care",
        name: "Lip Balm",
        time: "both",
        order: 9,
        description: "Keep lips soft and hydrated",
        importance: "recommended",
    },
];

export default function DailySkincareTracker() {
    const [activeTime, setActiveTime] = useState<"morning" | "evening">("morning");
    const [progress, setProgress] = useState<SkincareProgress>({
        date: new Date().toDateString(),
        morningCompleted: [],
        eveningCompleted: [],
    });
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem("skincareProgress");

        if (stored) {
            const savedProgress: SkincareProgress = JSON.parse(stored);
            if (savedProgress.date === today) {
                setProgress(savedProgress);
            } else {
                // New day, reset
                const newProgress = {
                    date: today,
                    morningCompleted: [],
                    eveningCompleted: [],
                };
                setProgress(newProgress);
                localStorage.setItem("skincareProgress", JSON.stringify(newProgress));
            }
        }

        calculateStreak();
    }, []);

    const calculateStreak = () => {
        const allProgress = localStorage.getItem("skincareHistory");
        if (!allProgress) return;

        const history: SkincareProgress[] = JSON.parse(allProgress);
        let currentStreak = 0;
        const checkDate = new Date();

        while (true) {
            const dateStr = checkDate.toDateString();
            const dayProgress = history.find((p) => p.date === dateStr);
            if (
                dayProgress &&
                dayProgress.morningCompleted.length > 0 &&
                dayProgress.eveningCompleted.length > 0
            ) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        setStreak(currentStreak);
    };

    const toggleStep = (stepId: string, time: "morning" | "evening") => {
        const today = new Date().toDateString();
        const field = time === "morning" ? "morningCompleted" : "eveningCompleted";
        const currentCompleted = progress[field];

        let updated: string[];
        if (currentCompleted.includes(stepId)) {
            updated = currentCompleted.filter((id) => id !== stepId);
        } else {
            updated = [...currentCompleted, stepId];
        }

        const newProgress = {
            ...progress,
            date: today,
            [field]: updated,
        };

        setProgress(newProgress);
        localStorage.setItem("skincareProgress", JSON.stringify(newProgress));

        // Save to history
        const allProgress = localStorage.getItem("skincareHistory");
        const history: SkincareProgress[] = allProgress ? JSON.parse(allProgress) : [];
        const existingIndex = history.findIndex((p) => p.date === today);

        if (existingIndex >= 0) {
            history[existingIndex] = newProgress;
        } else {
            history.unshift(newProgress);
        }

        localStorage.setItem("skincareHistory", JSON.stringify(history.slice(0, 90))); // Keep 90 days
        calculateStreak();
    };

    const morningSteps = skincareSteps
        .filter((s) => s.time === "morning" || s.time === "both")
        .sort((a, b) => a.order - b.order);

    const eveningSteps = skincareSteps
        .filter((s) => s.time === "evening" || s.time === "both")
        .sort((a, b) => a.order - b.order);

    const currentSteps = activeTime === "morning" ? morningSteps : eveningSteps;
    const currentCompleted =
        activeTime === "morning" ? progress.morningCompleted : progress.eveningCompleted;

    const completedCount = currentCompleted.length;
    const totalCount = currentSteps.length;
    const progressPercent = (completedCount / totalCount) * 100;

    const morningProgress = (progress.morningCompleted.length / morningSteps.length) * 100;
    const eveningProgress = (progress.eveningCompleted.length / eveningSteps.length) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Daily Skincare Routine</h2>
                    <p className="text-sm text-muted-foreground">
                        Radiant, feminine skin every day
                    </p>
                </div>
                <Sparkles className="w-8 h-8 text-pink-400" />
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-5 border border-pink-500/30">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-3xl font-bold text-foreground">{streak} Days</div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Perfect Skincare Streak
                        </div>
                    </div>
                    <Droplet className="w-12 h-12 text-pink-400" />
                </div>

                {/* Daily Progress */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Sun className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs font-semibold text-foreground">Morning</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${morningProgress}%` }}
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {progress.morningCompleted.length} / {morningSteps.length}
                        </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Moon className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-semibold text-foreground">Evening</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${eveningProgress}%` }}
                                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {progress.eveningCompleted.length} / {eveningSteps.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Time Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTime("morning")}
                    className={clsx(
                        "flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                        activeTime === "morning"
                            ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    <Sun className="w-4 h-4" />
                    Morning Routine
                </button>
                <button
                    onClick={() => setActiveTime("evening")}
                    className={clsx(
                        "flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                        activeTime === "evening"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    <Moon className="w-4 h-4" />
                    Evening Routine
                </button>
            </div>

            {/* Current Progress */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-foreground">
                        {activeTime === "morning" ? "Morning" : "Evening"} Progress
                    </h3>
                    <span className="text-sm font-semibold text-purple-400">
                        {completedCount} / {totalCount}
                    </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {currentSteps.map((step) => {
                    const isCompleted = currentCompleted.includes(step.id);
                    return (
                        <motion.button
                            key={step.id}
                            onClick={() => toggleStep(step.id, activeTime)}
                            whileTap={{ scale: 0.98 }}
                            className={clsx(
                                "w-full bg-white/5 rounded-xl border p-4 text-left transition-all",
                                isCompleted
                                    ? "border-green-500/50 bg-green-500/10"
                                    : "border-white/10 hover:bg-white/10"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <div className="mt-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-base text-foreground">
                                                    {step.order}. {step.name}
                                                </h4>
                                                {step.importance === "essential" && (
                                                    <span className="px-2 py-0.5 bg-red-500/20 rounded-full text-xs font-bold text-red-300">
                                                        Essential
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground font-medium">
                                        {step.description}
                                    </p>

                                    {step.imageUrl && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-3 relative rounded-lg overflow-hidden aspect-[16/9]"
                                        >
                                            <img
                                                src={step.imageUrl}
                                                alt={step.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Tips */}
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                <h3 className="font-semibold text-sm text-blue-300 mb-2">
                    💧 Skincare Tips
                </h3>
                <ul className="space-y-1 text-xs text-foreground font-medium">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Consistency is key - do your routine twice daily</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Always apply products from thinnest to thickest</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>NEVER skip sunscreen - it prevents 90% of aging</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Double cleanse at night to remove ALL makeup</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Pat products in gently - don't rub or tug skin</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

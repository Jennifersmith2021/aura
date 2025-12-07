"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { Trophy, Award, Lock, Unlock, Star, TrendingUp, Calendar, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { get, set } from "idb-keyval";

interface Achievement {
    id: string;
    title: string;
    description: string;
    category: "closet" | "looks" | "measurements" | "training" | "chastity" | "social" | "milestone";
    icon: string;
    unlocked: boolean;
    unlockedDate?: number;
    progress: number; // 0-100
    requirement: number;
    rarity: "common" | "rare" | "epic" | "legendary";
}

const rarityColors = {
    common: "from-gray-500 to-gray-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-pink-500",
    legendary: "from-yellow-500 to-orange-500",
};

const rarityGlow = {
    common: "shadow-gray-500/50",
    rare: "shadow-blue-500/50",
    epic: "shadow-purple-500/50",
    legendary: "shadow-yellow-500/50",
};

const categoryIcons = {
    closet: "👗",
    looks: "✨",
    measurements: "📏",
    training: "💪",
    chastity: "🔒",
    social: "👥",
    milestone: "🏆",
};

export default function AchievementBadges() {
    const { items, looks, measurements, sissyGoals, chastitySessions } = useStore();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [showUnlockedModal, setShowUnlockedModal] = useState<Achievement | null>(null);

    // Define all achievements
    const allAchievements: Omit<Achievement, "unlocked" | "unlockedDate" | "progress">[] = [
        // Closet achievements
        { id: "first-item", title: "First Steps", description: "Add your first item", category: "closet", icon: "👗", requirement: 1, rarity: "common" },
        { id: "closet-25", title: "Building Wardrobe", description: "Reach 25 items", category: "closet", icon: "👚", requirement: 25, rarity: "common" },
        { id: "closet-50", title: "Fashion Collector", description: "Reach 50 items", category: "closet", icon: "💃", requirement: 50, rarity: "rare" },
        { id: "closet-100", title: "Style Icon", description: "Reach 100 items", category: "closet", icon: "👑", requirement: 100, rarity: "epic" },
        { id: "closet-250", title: "Ultimate Fashionista", description: "Reach 250 items", category: "closet", icon: "🌟", requirement: 250, rarity: "legendary" },
        
        // Looks achievements
        { id: "first-look", title: "Outfit Creator", description: "Create your first look", category: "looks", icon: "✨", requirement: 1, rarity: "common" },
        { id: "looks-10", title: "Style Curator", description: "Create 10 looks", category: "looks", icon: "🎨", requirement: 10, rarity: "common" },
        { id: "looks-25", title: "Fashion Designer", description: "Create 25 looks", category: "looks", icon: "🦋", requirement: 25, rarity: "rare" },
        { id: "looks-50", title: "Lookbook Pro", description: "Create 50 looks", category: "looks", icon: "💖", requirement: 50, rarity: "epic" },
        
        // Measurements achievements
        { id: "first-measurement", title: "Tracking Begins", description: "Log your first measurement", category: "measurements", icon: "📏", requirement: 1, rarity: "common" },
        { id: "measurements-10", title: "Progress Tracker", description: "Log 10 measurements", category: "measurements", icon: "📊", requirement: 10, rarity: "common" },
        { id: "waist-goal", title: "Waist Achievement", description: "Reach your waist goal", category: "measurements", icon: "🎯", requirement: 1, rarity: "epic" },
        { id: "whr-goal", title: "Perfect Ratio", description: "Achieve 0.7 WHR", category: "measurements", icon: "⏳", requirement: 1, rarity: "legendary" },
        
        // Training achievements
        { id: "first-goal", title: "Goal Setter", description: "Create your first training goal", category: "training", icon: "🎯", requirement: 1, rarity: "common" },
        { id: "goals-5", title: "Ambitious", description: "Create 5 training goals", category: "training", icon: "💫", requirement: 5, rarity: "rare" },
        { id: "first-complete", title: "Goal Achieved", description: "Complete your first goal", category: "training", icon: "✅", requirement: 1, rarity: "rare" },
        { id: "goals-complete-5", title: "Dedicated", description: "Complete 5 goals", category: "training", icon: "🌸", requirement: 5, rarity: "epic" },
        
        // Chastity achievements
        { id: "first-lock", title: "Locked In", description: "Start your first chastity session", category: "chastity", icon: "🔒", requirement: 1, rarity: "common" },
        { id: "week-locked", title: "Week of Devotion", description: "Stay locked for 7 days", category: "chastity", icon: "🗝️", requirement: 7, rarity: "rare" },
        { id: "month-locked", title: "Monthly Dedication", description: "Stay locked for 30 days", category: "chastity", icon: "💎", requirement: 30, rarity: "epic" },
        { id: "100-days", title: "Century of Control", description: "Stay locked for 100 days", category: "chastity", icon: "👑", requirement: 100, rarity: "legendary" },
        
        // Milestone achievements
        { id: "week-streak", title: "Consistent", description: "Use app for 7 days", category: "milestone", icon: "🔥", requirement: 7, rarity: "common" },
        { id: "month-streak", title: "Committed", description: "Use app for 30 days", category: "milestone", icon: "💪", requirement: 30, rarity: "rare" },
        { id: "year-anniversary", title: "One Year Journey", description: "Use app for 365 days", category: "milestone", icon: "🎊", requirement: 365, rarity: "legendary" },
    ];

    // Calculate progress for each achievement
    const calculateProgress = useCallback((achievement: typeof allAchievements[0]) => {
        let current = 0;

        switch (achievement.id) {
            // Closet
            case "first-item":
            case "closet-25":
            case "closet-50":
            case "closet-100":
            case "closet-250":
                current = items.length;
                break;

            // Looks
            case "first-look":
            case "looks-10":
            case "looks-25":
            case "looks-50":
                current = looks.length;
                break;

            // Measurements
            case "first-measurement":
            case "measurements-10":
                current = measurements.length;
                break;
            case "waist-goal":
                const latestMeasurement = measurements[0];
                if (latestMeasurement?.waist && latestMeasurement.goalWaist) {
                    current = latestMeasurement.waist <= latestMeasurement.goalWaist ? 1 : 0;
                }
                break;
            case "whr-goal":
                const latest = measurements[0];
                if (latest?.waist && latest.hips) {
                    const whr = latest.waist / latest.hips;
                    current = whr <= 0.7 ? 1 : 0;
                }
                break;

            // Training
            case "first-goal":
            case "goals-5":
                current = sissyGoals.length;
                break;
            case "first-complete":
            case "goals-complete-5":
                current = sissyGoals.filter((g) => g.completed).length;
                break;

            // Chastity
            case "first-lock":
                current = chastitySessions.length > 0 ? 1 : 0;
                break;
            case "week-locked":
            case "month-locked":
            case "100-days":
                const longestSession = chastitySessions.reduce((max, session) => {
                    const duration = session.unlocked
                        ? session.unlocked - session.locked
                        : Date.now() - session.locked;
                    const days = Math.floor(duration / (24 * 60 * 60 * 1000));
                    return Math.max(max, days);
                }, 0);
                current = longestSession;
                break;
        }

        const progress = Math.min(100, Math.round((current / achievement.requirement) * 100));
        const unlocked = current >= achievement.requirement;

        return { current, progress, unlocked };
    }, [items, looks, measurements, sissyGoals, chastitySessions]);

    // Initialize achievements
    useEffect(() => {
        get<Achievement[]>("achievements").then((stored) => {
            const updated = allAchievements.map((def) => {
                const existing = stored?.find((a) => a.id === def.id);
                const { current, progress, unlocked } = calculateProgress(def);

                const achievement: Achievement = {
                    ...def,
                    progress,
                    unlocked,
                    unlockedDate: existing?.unlockedDate,
                };

                // Check if newly unlocked
                if (unlocked && !existing?.unlocked && stored) {
                    achievement.unlockedDate = Date.now();
                    setShowUnlockedModal(achievement);
                }

                return achievement;
            });

            setAchievements(updated);
            set("achievements", updated);
        });
    }, [items.length, looks.length, measurements.length, sissyGoals.length, chastitySessions.length, calculateProgress]);

    const stats = useMemo(() => {
        const unlockedCount = achievements.filter((a) => a.unlocked).length;
        const totalCount = achievements.length;
        const percentage = Math.round((unlockedCount / totalCount) * 100);
        const byRarity = {
            common: achievements.filter((a) => a.unlocked && a.rarity === "common").length,
            rare: achievements.filter((a) => a.unlocked && a.rarity === "rare").length,
            epic: achievements.filter((a) => a.unlocked && a.rarity === "epic").length,
            legendary: achievements.filter((a) => a.unlocked && a.rarity === "legendary").length,
        };

        return { unlockedCount, totalCount, percentage, byRarity };
    }, [achievements]);

    const filteredAchievements = selectedCategory === "all"
        ? achievements
        : achievements.filter((a) => a.category === selectedCategory);

    const categories = ["all", ...Object.keys(categoryIcons)];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">Achievements</h3>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-2xl font-bold">
                            {stats.unlockedCount}/{stats.totalCount}
                        </div>
                        <div className="text-xs text-white/60">Achievements Unlocked</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{stats.percentage}%</div>
                        <div className="text-xs text-white/60">Complete</div>
                    </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                    <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.percentage}%` }}
                    />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                        <div className="font-bold text-gray-400">{stats.byRarity.common}</div>
                        <div className="text-white/50">Common</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-blue-400">{stats.byRarity.rare}</div>
                        <div className="text-white/50">Rare</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-purple-400">{stats.byRarity.epic}</div>
                        <div className="text-white/50">Epic</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-yellow-400">{stats.byRarity.legendary}</div>
                        <div className="text-white/50">Legendary</div>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1",
                            selectedCategory === cat
                                ? "bg-yellow-500 text-black"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        {cat === "all" ? "🏆" : categoryIcons[cat as keyof typeof categoryIcons]}
                        {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-2 gap-3">
                {filteredAchievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={clsx(
                            "rounded-xl p-4 border transition-all relative overflow-hidden",
                            achievement.unlocked
                                ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} border-white/20 shadow-lg ${rarityGlow[achievement.rarity]}`
                                : "bg-white/10 border-white/20"
                        )}
                    >
                        {/* Lock/Unlock Icon */}
                        <div className="absolute top-2 right-2">
                            {achievement.unlocked ? (
                                <Unlock className="w-4 h-4 text-white/80" />
                            ) : (
                                <Lock className="w-4 h-4 text-white/30" />
                            )}
                        </div>

                        {/* Icon */}
                        <div className={clsx(
                            "text-3xl mb-2",
                            !achievement.unlocked && "grayscale opacity-60"
                        )}>
                            {achievement.icon}
                        </div>

                        {/* Title & Description */}
                        <h4 className="font-bold text-sm mb-1 text-white drop-shadow-sm">
                            {achievement.title}
                        </h4>
                        <p className="text-xs mb-2 leading-relaxed text-white/95 font-medium">
                            {achievement.description}
                        </p>

                        {/* Progress */}
                        {!achievement.unlocked && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-white/80 font-medium mb-1">
                                    <span>Progress</span>
                                    <span>{achievement.progress}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                    <div
                                        className={clsx(
                                            "h-1.5 rounded-full transition-all bg-gradient-to-r",
                                            rarityColors[achievement.rarity]
                                        )}
                                        style={{ width: `${achievement.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Unlocked Date */}
                        {achievement.unlocked && achievement.unlockedDate && (
                            <div className="flex items-center gap-1 text-xs text-white/90 font-medium mt-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(achievement.unlockedDate).toLocaleDateString()}
                            </div>
                        )}

                        {/* Rarity Badge */}
                        <div className={clsx(
                            "absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium",
                            achievement.rarity === "legendary" && "bg-yellow-500/20 text-yellow-400",
                            achievement.rarity === "epic" && "bg-purple-500/20 text-purple-400",
                            achievement.rarity === "rare" && "bg-blue-500/20 text-blue-400",
                            achievement.rarity === "common" && "bg-gray-500/20 text-gray-400"
                        )}>
                            {achievement.rarity}
                        </div>
                    </div>
                ))}
            </div>

            {/* Unlocked Modal */}
            <AnimatePresence>
                {showUnlockedModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowUnlockedModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            onClick={(e) => e.stopPropagation()}
                            className={clsx(
                                "bg-gradient-to-br rounded-2xl p-8 max-w-sm w-full border-2 shadow-2xl text-center",
                                rarityColors[showUnlockedModal.rarity],
                                `shadow-${showUnlockedModal.rarity === "legendary" ? "yellow" : showUnlockedModal.rarity === "epic" ? "purple" : showUnlockedModal.rarity === "rare" ? "blue" : "gray"}-500/50`
                            )}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                            >
                                <Trophy className="w-16 h-16 mx-auto mb-4 text-white" />
                            </motion.div>
                            
                            <h3 className="text-2xl font-bold mb-2 text-white">Achievement Unlocked!</h3>
                            
                            <div className="text-6xl mb-4">{showUnlockedModal.icon}</div>
                            
                            <h4 className="text-xl font-bold mb-2 text-white">{showUnlockedModal.title}</h4>
                            <p className="text-white/90 mb-4">{showUnlockedModal.description}</p>
                            
                            <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium text-white backdrop-blur-sm">
                                {showUnlockedModal.rarity.toUpperCase()}
                            </div>
                            
                            <button
                                onClick={() => setShowUnlockedModal(null)}
                                className="mt-6 w-full px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium text-white transition-colors"
                            >
                                Continue
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

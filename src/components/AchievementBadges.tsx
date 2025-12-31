"use client";
/* eslint-disable react-hooks/preserve-manual-memoization */

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
    category: "closet" | "looks" | "measurements" | "training" | "chastity" | "social" | "milestone" | "sissy";
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
    sissy: "💕",
};

export default function AchievementBadges() {
    const { items, looks, measurements, sissyGoals, chastitySessions, sissyLogs, toyCollection, orgasmLogs } = useStore();
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
        
        // Sissy achievements
        { id: "first-sissy-goal", title: "Beginning Sissy", description: "Create your first sissy training goal", category: "sissy", icon: "💕", requirement: 1, rarity: "common" },
        { id: "sissy-goals-5", title: "Devoted Sissy", description: "Create 5 sissy training goals", category: "sissy", icon: "💖", requirement: 5, rarity: "rare" },
        { id: "sissy-complete-1", title: "Sissy Achievement", description: "Complete your first sissy goal", category: "sissy", icon: "🎀", requirement: 1, rarity: "rare" },
        { id: "sissy-complete-10", title: "Sissy Excellence", description: "Complete 10 sissy goals", category: "sissy", icon: "👸", requirement: 10, rarity: "epic" },
        { id: "sissy-complete-25", title: "Master Sissy", description: "Complete 25 sissy goals", category: "sissy", icon: "👑", requirement: 25, rarity: "legendary" },
        { id: "all-categories", title: "Well-Rounded Sissy", description: "Complete goals in all 6 categories", category: "sissy", icon: "🌈", requirement: 6, rarity: "epic" },
        { id: "appearance-mastery", title: "Appearance Perfection", description: "Complete 5 appearance goals", category: "sissy", icon: "💄", requirement: 5, rarity: "rare" },
        { id: "behavior-mastery", title: "Perfect Behavior", description: "Complete 5 behavior goals", category: "sissy", icon: "🎭", requirement: 5, rarity: "rare" },
        { id: "skills-mastery", title: "Skilled Sissy", description: "Complete 5 skills goals", category: "sissy", icon: "🎨", requirement: 5, rarity: "rare" },
        { id: "mindset-mastery", title: "Sissy Mindset", description: "Complete 5 mindset goals", category: "sissy", icon: "🧠", requirement: 5, rarity: "rare" },
        { id: "fitness-mastery", title: "Sissy Fitness", description: "Complete 5 fitness goals", category: "sissy", icon: "💪", requirement: 5, rarity: "rare" },
        { id: "intimate-mastery", title: "Intimate Excellence", description: "Complete 5 intimate goals", category: "sissy", icon: "💋", requirement: 5, rarity: "rare" },
        { id: "high-priority-10", title: "Priority Focused", description: "Complete 10 high-priority sissy goals", category: "sissy", icon: "⭐", requirement: 10, rarity: "epic" },
        { id: "weekly-training", title: "Weekly Dedication", description: "Log sissy training 7 days in a row", category: "sissy", icon: "📅", requirement: 7, rarity: "common" },
        { id: "monthly-training", title: "Monthly Commitment", description: "Log sissy training 30 days in a row", category: "sissy", icon: "🗓️", requirement: 30, rarity: "rare" },
        { id: "training-100", title: "Century of Training", description: "Log 100 sissy training sessions", category: "sissy", icon: "💯", requirement: 100, rarity: "epic" },
        
        // Butt plug achievements
        { id: "first-plug", title: "Plugged Beginner", description: "Add your first butt plug to collection", category: "sissy", icon: "🍑", requirement: 1, rarity: "common" },
        { id: "plug-collection-3", title: "Plug Enthusiast", description: "Own 3 butt plugs", category: "sissy", icon: "💎", requirement: 3, rarity: "rare" },
        { id: "plug-collection-5", title: "Plug Collector", description: "Own 5 butt plugs", category: "sissy", icon: "💖", requirement: 5, rarity: "epic" },
        { id: "plug-variety", title: "Size Progression", description: "Own plugs in 3 different sizes", category: "sissy", icon: "📈", requirement: 3, rarity: "rare" },
        
        // Orgasm denial achievements
        { id: "denial-7", title: "Week Denied", description: "Go 7 days without cumming", category: "sissy", icon: "🚫", requirement: 7, rarity: "common" },
        { id: "denial-14", title: "Two Week Denial", description: "Go 14 days without cumming", category: "sissy", icon: "⏳", requirement: 14, rarity: "rare" },
        { id: "denial-30", title: "Month Denied", description: "Go 30 days without cumming", category: "sissy", icon: "🔐", requirement: 30, rarity: "epic" },
        { id: "denial-60", title: "Ultimate Denial", description: "Go 60 days without cumming", category: "sissy", icon: "🏆", requirement: 60, rarity: "legendary" },
        { id: "denial-90", title: "Denial Master", description: "Go 90 days without cumming", category: "sissy", icon: "👑", requirement: 90, rarity: "legendary" },
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
                if (latestMeasurement?.values?.waist && latestMeasurement.goalWaist) {
                    current = latestMeasurement.values.waist <= latestMeasurement.goalWaist ? 1 : 0;
                }
                break;
            case "whr-goal":
                const latest = measurements[0];
                if (latest?.values?.waist && latest.values?.hips) {
                    const whr = latest.values.waist / latest.values.hips;
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
                    const duration = session.endDate
                        ? session.endDate - session.startDate
                        : Date.now() - session.startDate;
                    const days = Math.floor(duration / (24 * 60 * 60 * 1000));
                    return Math.max(max, days);
                }, 0);
                current = longestSession;
                break;

            // Sissy achievements
            case "first-sissy-goal":
            case "sissy-goals-5":
                current = sissyGoals.length;
                break;
            case "sissy-complete-1":
            case "sissy-complete-10":
            case "sissy-complete-25":
                current = sissyGoals.filter((g) => g.completed).length;
                break;
            case "all-categories":
                const categories = ['appearance', 'behavior', 'skills', 'mindset', 'fitness', 'intimate'];
                const completedCategories = new Set(
                    sissyGoals.filter((g) => g.completed).map((g) => g.category)
                );
                current = completedCategories.size;
                break;
            case "appearance-mastery":
                current = sissyGoals.filter((g) => g.completed && g.category === 'appearance').length;
                break;
            case "behavior-mastery":
                current = sissyGoals.filter((g) => g.completed && g.category === 'behavior').length;
                break;
            case "skills-mastery":
                current = sissyGoals.filter((g) => g.completed && g.category === 'skills').length;
                break;
            case "mindset-mastery":
                current = sissyGoals.filter((g) => g.completed && g.category === 'mindset').length;
                break;
            case "fitness-mastery":
                current = sissyGoals.filter((g) => g.completed && g.category === 'fitness').length;
                break;
            case "intimate-mastery":
                current = sissyGoals.filter((g) => g.completed && g.category === 'intimate').length;
                break;
            case "high-priority-10":
                current = sissyGoals.filter((g) => g.completed && g.priority === 'high').length;
                break;
            case "weekly-training":
            case "monthly-training":
                const sortedLogs = [...sissyLogs].sort((a, b) => b.date - a.date);
                let streak = 0;
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                for (const log of sortedLogs) {
                    const logDate = new Date(log.date);
                    logDate.setHours(0, 0, 0, 0);
                    const daysDiff = Math.floor((currentDate.getTime() - logDate.getTime()) / (24 * 60 * 60 * 1000));
                    if (daysDiff === streak) {
                        streak++;
                    } else {
                        break;
                    }
                }
                current = streak;
                break;
            case "training-100":
                current = sissyLogs.length;
                break;

            // Butt plug achievements
            case "first-plug":
            case "plug-collection-3":
            case "plug-collection-5":
                const plugs = toyCollection.filter(toy => 
                    toy.type.toLowerCase().includes('plug') || 
                    toy.type.toLowerCase().includes('anal')
                );
                current = plugs.length;
                break;
            case "plug-variety":
                const plugTypes = new Set(
                    toyCollection
                        .filter(toy => toy.type.toLowerCase().includes('plug'))
                        .map(toy => {
                            const name = toy.name.toLowerCase();
                            if (name.includes('small') || name.includes('beginner')) return 'small';
                            if (name.includes('large') || name.includes('xl')) return 'large';
                            if (name.includes('medium')) return 'medium';
                            // Try to infer from type
                            if (toy.type.toLowerCase().includes('small')) return 'small';
                            if (toy.type.toLowerCase().includes('large')) return 'large';
                            return 'medium';
                        })
                );
                current = plugTypes.size;
                break;

            // Orgasm denial achievements
            case "denial-7":
            case "denial-14":
            case "denial-30":
            case "denial-60":
            case "denial-90":
                if (orgasmLogs.length === 0) {
                    // No orgasms logged yet, can't calculate denial
                    current = 0;
                } else {
                    const sortedOrgasms = [...orgasmLogs].sort((a, b) => b.date - a.date);
                    const lastOrgasm = sortedOrgasms[0];
                    const daysSinceOrgasm = Math.floor((Date.now() - lastOrgasm.date) / (24 * 60 * 60 * 1000));
                    current = daysSinceOrgasm;
                }
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
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">Achievements</h3>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-3xl font-bold">
                            {stats.unlockedCount}/{stats.totalCount}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">Achievements Unlocked</div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{stats.percentage}%</div>
                        <div className="text-sm font-medium text-muted-foreground">Complete</div>
                    </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                    <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.percentage}%` }}
                    />
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-lg text-gray-400">{stats.byRarity.common}</div>
                        <div className="text-foreground font-semibold">Common</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg text-blue-400">{stats.byRarity.rare}</div>
                        <div className="text-foreground font-semibold">Rare</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg text-purple-400">{stats.byRarity.epic}</div>
                        <div className="text-foreground font-semibold">Epic</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg text-yellow-400">{stats.byRarity.legendary}</div>
                        <div className="text-foreground font-semibold">Legendary</div>
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
                                <Lock className="w-4 h-4 text-white/80" />
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
                        <h4 className="font-bold text-base mb-1 text-foreground">
                            {achievement.title}
                        </h4>
                        <p className="text-sm mb-2 leading-relaxed text-muted-foreground font-medium">
                            {achievement.description}
                        </p>

                        {/* Progress */}
                        {!achievement.unlocked && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-sm text-foreground font-semibold mb-1">
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
                            <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium mt-2">
                                <Calendar className="w-4 h-4" />
                                <span>Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}</span>
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

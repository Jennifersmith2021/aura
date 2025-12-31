"use client";
/* eslint-disable react-hooks/immutability, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Circle, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface DailyTask {
    id: string;
    title: string;
    category: "skincare" | "yoga" | "voice" | "posture" | "walking" | "sitting" | "other";
    time: "morning" | "afternoon" | "evening" | "anytime";
    completed: boolean;
    importance: "essential" | "recommended" | "optional";
    steps: string[];
    duration?: string;
}

interface DailyProgress {
    date: string;
    completedTasks: string[];
}

const dailyTasks: DailyTask[] = [
    // Morning Tasks
    {
        id: "morning-skincare",
        title: "Morning Skincare Routine",
        category: "skincare",
        time: "morning",
        completed: false,
        importance: "essential",
        duration: "10 min",
        steps: [
            "Cleanse face with gentle cleanser",
            "Apply toner to balance pH",
            "Apply vitamin C serum for brightening",
            "Apply eye cream gently around eyes",
            "Moisturize with day cream",
            "Apply SPF 30+ sunscreen to face and neck",
        ],
    },
    {
        id: "morning-yoga",
        title: "Morning Yoga Practice",
        category: "yoga",
        time: "morning",
        completed: false,
        importance: "recommended",
        duration: "15-20 min",
        steps: [
            "Start with breathing exercises (5 deep breaths)",
            "Child's pose - center yourself",
            "Cat-cow stretches (10 reps)",
            "Downward dog (hold 30 seconds)",
            "Warrior poses for strength",
            "End with relaxation pose",
        ],
    },
    {
        id: "voice-warmup",
        title: "Voice Feminization Exercises",
        category: "voice",
        time: "morning",
        completed: false,
        importance: "recommended",
        duration: "10 min",
        steps: [
            "Hum at comfortable pitch to warm up",
            "Practice 'mmm' sounds at higher pitch",
            "Say vowels (a-e-i-o-u) in feminine voice",
            "Practice breath control - inhale 4, hold 4, exhale 6",
            "Read short paragraph in feminine voice",
            "Record yourself and listen back",
        ],
    },
    {
        id: "posture-check",
        title: "Posture Alignment Practice",
        category: "posture",
        time: "morning",
        completed: false,
        importance: "recommended",
        duration: "5 min",
        steps: [
            "Stand against wall - shoulders, butt, heels touching",
            "Practice chin level, shoulders back",
            "Walk with book on head for 2 minutes",
            "Practice sitting with crossed legs",
            "Check mirror from side view",
            "Set reminders to check posture throughout day",
        ],
    },

    // Afternoon Tasks
    {
        id: "walking-practice",
        title: "Feminine Walking Practice",
        category: "walking",
        time: "afternoon",
        completed: false,
        importance: "recommended",
        duration: "15 min",
        steps: [
            "Start in flats - practice placing one foot in front of other",
            "Engage core, keep shoulders back",
            "Practice hip sway naturally",
            "Keep steps small and deliberate",
            "Walk in straight line (imagine walking on tightrope)",
            "Practice with music to find rhythm",
            "Progress to small heels when comfortable",
        ],
    },
    {
        id: "sitting-practice",
        title: "Feminine Sitting & Leg Crossing",
        category: "sitting",
        time: "afternoon",
        completed: false,
        importance: "recommended",
        duration: "10 min",
        steps: [
            "Sit with knees together, not spread",
            "Practice crossing legs at ankles",
            "Practice crossing legs at knees (keep ankles together)",
            "Keep back straight, don't slouch",
            "Place hands gracefully on lap or armrest",
            "Practice smooth transitions between positions",
        ],
    },
    {
        id: "voice-practice",
        title: "Voice Practice Session",
        category: "voice",
        time: "afternoon",
        completed: false,
        importance: "optional",
        duration: "15 min",
        steps: [
            "Sing favorite song in feminine voice",
            "Practice phone conversation",
            "Read article aloud",
            "Practice with voice training app",
            "Work on resonance and pitch consistency",
            "Record progress for comparison",
        ],
    },

    // Evening Tasks
    {
        id: "evening-yoga",
        title: "Evening Yoga Stretch",
        category: "yoga",
        time: "evening",
        completed: false,
        importance: "optional",
        duration: "15 min",
        steps: [
            "Start with gentle breathing",
            "Forward folds to release tension",
            "Pigeon pose for hip opening",
            "Spinal twists for lower back",
            "Legs up the wall (5 minutes)",
            "End in corpse pose with meditation",
        ],
    },
    {
        id: "evening-skincare",
        title: "Evening Skincare Routine",
        category: "skincare",
        time: "evening",
        completed: false,
        importance: "essential",
        duration: "15 min",
        steps: [
            "Remove makeup with micellar water or oil cleanser",
            "Double cleanse with gentle cleanser",
            "Exfoliate (2-3x per week only)",
            "Apply hydrating toner",
            "Apply treatment serum (retinol/niacinamide)",
            "Apply eye cream",
            "Apply night cream or sleeping mask",
            "Don't forget neck and décolletage",
        ],
    },
    {
        id: "posture-reflection",
        title: "Posture & Movement Reflection",
        category: "posture",
        time: "evening",
        completed: false,
        importance: "optional",
        duration: "5 min",
        steps: [
            "Review how you carried yourself today",
            "Note moments of good posture",
            "Identify areas to improve tomorrow",
            "Do gentle stretches for tight areas",
            "Journal about progress",
        ],
    },

    // Anytime Tasks
    {
        id: "heel-practice",
        title: "Walking in Heels Practice",
        category: "walking",
        time: "anytime",
        completed: false,
        importance: "recommended",
        duration: "10-15 min",
        steps: [
            "Start with 2-inch heels (kitten heels)",
            "Practice standing and balancing first",
            "Take small steps, heel-to-toe",
            "Keep weight on balls of feet",
            "Practice on different surfaces (carpet, tile, wood)",
            "Build up time gradually (start 5 min, work to 15+)",
            "Progress to higher heels only when comfortable",
        ],
    },
];

export default function DailySchedule() {
    const [progress, setProgress] = useState<DailyProgress>({
        date: new Date().toDateString(),
        completedTasks: [],
    });
    const [activeFilter, setActiveFilter] = useState<"all" | "morning" | "afternoon" | "evening" | "anytime">("all");
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem("dailyScheduleProgress");

        if (stored) {
            const savedProgress: DailyProgress = JSON.parse(stored);
            if (savedProgress.date === today) {
                setProgress(savedProgress);
            } else {
                // New day - reset
                const newProgress = {
                    date: today,
                    completedTasks: [],
                };
                setProgress(newProgress);
                localStorage.setItem("dailyScheduleProgress", JSON.stringify(newProgress));
            }
        }

        calculateStreak();
    }, []);

    const calculateStreak = () => {
        const history = localStorage.getItem("dailyScheduleHistory");
        if (!history) return;

        const allProgress: DailyProgress[] = JSON.parse(history);
        let currentStreak = 0;
        const checkDate = new Date();

        while (true) {
            const dateStr = checkDate.toDateString();
            const dayProgress = allProgress.find((p) => p.date === dateStr);
            
            // Count day as complete if at least 70% of essential tasks are done
            const essentialTasks = dailyTasks.filter(t => t.importance === "essential");
            const completedEssential = dayProgress?.completedTasks.filter(id => 
                essentialTasks.some(t => t.id === id)
            ).length || 0;
            const essentialPercent = (completedEssential / essentialTasks.length) * 100;

            if (dayProgress && essentialPercent >= 70) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        setStreak(currentStreak);
    };

    const toggleTask = (taskId: string) => {
        const today = new Date().toDateString();
        const completed = progress.completedTasks;

        let updated: string[];
        if (completed.includes(taskId)) {
            updated = completed.filter((id) => id !== taskId);
        } else {
            updated = [...completed, taskId];
        }

        const newProgress = {
            date: today,
            completedTasks: updated,
        };

        setProgress(newProgress);
        localStorage.setItem("dailyScheduleProgress", JSON.stringify(newProgress));

        // Save to history
        const history = localStorage.getItem("dailyScheduleHistory");
        const allProgress: DailyProgress[] = history ? JSON.parse(history) : [];
        const existingIndex = allProgress.findIndex((p) => p.date === today);

        if (existingIndex >= 0) {
            allProgress[existingIndex] = newProgress;
        } else {
            allProgress.unshift(newProgress);
        }

        localStorage.setItem("dailyScheduleHistory", JSON.stringify(allProgress.slice(0, 90)));
        calculateStreak();
    };

    const filteredTasks =
        activeFilter === "all"
            ? dailyTasks
            : dailyTasks.filter((t) => t.time === activeFilter);

    const completedCount = progress.completedTasks.length;
    const totalCount = dailyTasks.length;
    const progressPercent = (completedCount / totalCount) * 100;

    const essentialTasks = dailyTasks.filter(t => t.importance === "essential");
    const completedEssential = progress.completedTasks.filter(id => 
        essentialTasks.some(t => t.id === id)
    ).length;
    const essentialPercent = (completedEssential / essentialTasks.length) * 100;

    const categoryColors: Record<string, string> = {
        skincare: "text-pink-400",
        yoga: "text-purple-400",
        voice: "text-blue-400",
        posture: "text-green-400",
        walking: "text-yellow-400",
        sitting: "text-orange-400",
        other: "text-gray-400",
    };

    const categoryIcons: Record<string, string> = {
        skincare: "💧",
        yoga: "🧘‍♀️",
        voice: "🎤",
        posture: "💃",
        walking: "👠",
        sitting: "🪑",
        other: "✨",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Daily Sissy Schedule</h2>
                    <p className="text-sm text-muted-foreground">
                        Your complete feminine training routine
                    </p>
                </div>
                <Calendar className="w-8 h-8 text-pink-400" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                {/* Overall Progress */}
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-4 border border-pink-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">
                            Overall Progress
                        </span>
                        <Sparkles className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{completedCount}/{totalCount}</div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {Math.round(progressPercent)}% complete
                    </p>
                </div>

                {/* Streak */}
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">
                            Daily Streak
                        </span>
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{streak} Days</div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${essentialPercent}%` }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {completedEssential}/{essentialTasks.length} essential tasks today
                    </p>
                </div>
            </div>

            {/* Time Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "morning", "afternoon", "evening", "anytime"].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter as any)}
                        className={clsx(
                            "px-4 py-2 rounded-xl font-semibold text-xs transition-all whitespace-nowrap",
                            activeFilter === filter
                                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                                : "bg-secondary text-foreground hover:bg-accent"
                        )}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tasks */}
            <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                    {filteredTasks.map((task) => {
                        const isCompleted = progress.completedTasks.includes(task.id);
                        return (
                            <motion.button
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                onClick={() => toggleTask(task.id)}
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
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-lg">
                                                    {categoryIcons[task.category]}
                                                </span>
                                                <h4 className="font-bold text-base text-foreground">
                                                    {task.title}
                                                </h4>
                                            </div>
                                            {task.duration && (
                                                <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs font-bold text-blue-300 whitespace-nowrap">
                                                    {task.duration}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                            <span
                                                className={clsx(
                                                    "px-2 py-0.5 bg-white/10 rounded-full text-xs font-bold",
                                                    categoryColors[task.category]
                                                )}
                                            >
                                                {task.category}
                                            </span>
                                            <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs font-bold text-foreground">
                                                {task.time}
                                            </span>
                                            {task.importance === "essential" && (
                                                <span className="px-2 py-0.5 bg-red-500/20 rounded-full text-xs font-bold text-red-300">
                                                    Essential
                                                </span>
                                            )}
                                        </div>

                                        {/* Task Steps */}
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                                                <span className="text-pink-400">✓</span>
                                                What to do:
                                            </h5>
                                            <ol className="space-y-1.5">
                                                {task.steps.map((step, idx) => (
                                                    <li key={idx} className="text-xs text-foreground font-medium flex items-start gap-2">
                                                        <span className="text-pink-400 shrink-0 mt-0.5">{idx + 1}.</span>
                                                        <span className={isCompleted ? "line-through opacity-60" : ""}>
                                                            {step}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </AnimatePresence>

            {/* Encouragement */}
            {progressPercent === 100 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30 text-center"
                >
                    <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h3 className="font-bold text-lg text-foreground mb-1">
                        Perfect Day Complete! 🎉
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        You completed all your feminine training tasks today. You're amazing!
                    </p>
                </motion.div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                <h3 className="font-semibold text-sm text-blue-300 mb-2">
                    💡 Daily Training Tips
                </h3>
                <ul className="space-y-1 text-xs text-foreground font-medium">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Consistency is more important than perfection</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Focus on essential tasks first, then add optional ones</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Incomplete tasks roll over - no pressure, just progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Build habits gradually - don't try everything at once</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

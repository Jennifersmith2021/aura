"use client";

import { useStore } from "@/hooks/useStore";
import { useState, useMemo, useEffect } from "react";
import {
    Sparkles,
    Target,
    CheckCircle,
    Circle,
    TrendingUp,
    Award,
    Calendar,
    Flame,
    Star,
    ChevronRight,
    Plus,
    X,
    Camera,
    Crown,
    Lock,
    Zap
} from "lucide-react";
import { format, startOfDay, differenceInDays, isToday, subDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface DailyTask {
    id: string;
    title: string;
    category: "appearance" | "behavior" | "skills" | "mindset" | "fitness" | "intimate";
    difficulty: "beginner" | "intermediate" | "advanced";
    duration: number; // minutes
    description: string;
    xp: number; // experience points
}

interface CompletedTask {
    id: string;
    taskId: string;
    date: number;
    xp: number;
    photo?: string;
    note?: string;
}

interface Level {
    level: number;
    title: string;
    xpRequired: number;
    rewards: string[];
}

const DAILY_TASKS: DailyTask[] = [
    // Appearance
    {
        id: "makeup-practice",
        title: "Practice Makeup Application",
        category: "appearance",
        difficulty: "beginner",
        duration: 30,
        description: "Practice applying foundation, eyeshadow, and lipstick. Focus on blending.",
        xp: 50
    },
    {
        id: "skin-routine",
        title: "Complete Skincare Routine",
        category: "appearance",
        difficulty: "beginner",
        duration: 15,
        description: "Cleanse, tone, moisturize, and apply sunscreen. Pamper your skin.",
        xp: 30
    },
    {
        id: "outfit-planning",
        title: "Plan Tomorrow's Outfit",
        category: "appearance",
        difficulty: "beginner",
        duration: 10,
        description: "Choose a complete feminine outfit with matching accessories.",
        xp: 20
    },
    {
        id: "wig-styling",
        title: "Style Your Wig",
        category: "appearance",
        difficulty: "intermediate",
        duration: 20,
        description: "Brush, style, and set your wig. Make it look natural and beautiful.",
        xp: 40
    },
    {
        id: "nail-care",
        title: "Manicure & Nail Polish",
        category: "appearance",
        difficulty: "intermediate",
        duration: 45,
        description: "File, shape, and paint your nails in a feminine color.",
        xp: 60
    },
    
    // Behavior
    {
        id: "walking-practice",
        title: "Practice Feminine Walking",
        category: "behavior",
        difficulty: "beginner",
        duration: 15,
        description: "Walk in heels with hip sway. Practice posture and grace.",
        xp: 35
    },
    {
        id: "voice-practice",
        title: "Voice Feminization Practice",
        category: "behavior",
        difficulty: "intermediate",
        duration: 20,
        description: "Practice raising pitch, softening tone, and feminine speech patterns.",
        xp: 50
    },
    {
        id: "curtsy-practice",
        title: "Perfect Your Curtsy",
        category: "behavior",
        difficulty: "beginner",
        duration: 10,
        description: "Practice graceful curtsies. Show respect and submission.",
        xp: 25
    },
    {
        id: "posture-check",
        title: "Posture & Mannerisms",
        category: "behavior",
        difficulty: "beginner",
        duration: 15,
        description: "Sit, stand, and move with feminine grace. Cross legs, soft gestures.",
        xp: 30
    },
    
    // Skills
    {
        id: "cooking-practice",
        title: "Cook a Feminine Meal",
        category: "skills",
        difficulty: "intermediate",
        duration: 60,
        description: "Prepare a beautiful, healthy meal. Present it attractively.",
        xp: 70
    },
    {
        id: "cleaning-task",
        title: "Deep Clean One Area",
        category: "skills",
        difficulty: "beginner",
        duration: 30,
        description: "Thoroughly clean and organize one area of your home.",
        xp: 40
    },
    {
        id: "dancing-practice",
        title: "Dance Practice",
        category: "skills",
        difficulty: "intermediate",
        duration: 30,
        description: "Practice feminine dance moves. Be sensual and graceful.",
        xp: 55
    },
    
    // Mindset
    {
        id: "affirmations",
        title: "Daily Affirmations",
        category: "mindset",
        difficulty: "beginner",
        duration: 10,
        description: "Repeat 10 sissy affirmations in the mirror. Believe them.",
        xp: 30
    },
    {
        id: "journaling",
        title: "Sissy Journal Entry",
        category: "mindset",
        difficulty: "beginner",
        duration: 15,
        description: "Write about your sissy journey, feelings, and goals.",
        xp: 35
    },
    {
        id: "hypno-session",
        title: "Sissy Hypno Session",
        category: "mindset",
        difficulty: "intermediate",
        duration: 30,
        description: "Listen to sissy hypnosis audio. Let it reprogram your mind.",
        xp: 60
    },
    {
        id: "meditation",
        title: "Feminine Energy Meditation",
        category: "mindset",
        difficulty: "beginner",
        duration: 15,
        description: "Meditate on embracing your feminine energy and nature.",
        xp: 30
    },
    
    // Fitness
    {
        id: "waist-training",
        title: "Waist Training Session",
        category: "fitness",
        difficulty: "intermediate",
        duration: 120,
        description: "Wear your corset for focused waist training.",
        xp: 80
    },
    {
        id: "squats-workout",
        title: "Booty Building Squats",
        category: "fitness",
        difficulty: "intermediate",
        duration: 20,
        description: "Do 3 sets of 15 squats. Build that feminine booty.",
        xp: 45
    },
    {
        id: "yoga-session",
        title: "Flexibility Yoga",
        category: "fitness",
        difficulty: "beginner",
        duration: 30,
        description: "Practice yoga for flexibility and grace.",
        xp: 40
    },
    {
        id: "cardio-session",
        title: "Cardio Workout",
        category: "fitness",
        difficulty: "intermediate",
        duration: 30,
        description: "Get your heart rate up. Maintain your figure.",
        xp: 50
    },
    
    // Intimate
    {
        id: "plug-training",
        title: "Anal Training Session",
        category: "intimate",
        difficulty: "intermediate",
        duration: 60,
        description: "Wear a plug for training. Progress to the next size.",
        xp: 70
    },
    {
        id: "edge-session",
        title: "Edging Practice",
        category: "intimate",
        difficulty: "advanced",
        duration: 45,
        description: "Edge yourself multiple times. No release without permission.",
        xp: 80
    },
    {
        id: "toy-cleaning",
        title: "Clean & Organize Toys",
        category: "intimate",
        difficulty: "beginner",
        duration: 20,
        description: "Properly clean and organize all your toys.",
        xp: 30
    },
    {
        id: "service-practice",
        title: "Service Position Practice",
        category: "intimate",
        difficulty: "intermediate",
        duration: 15,
        description: "Practice proper service positions and poses.",
        xp: 40
    },
];

const LEVELS: Level[] = [
    { level: 1, title: "Curious Sissy", xpRequired: 0, rewards: ["Welcome to your journey!"] },
    { level: 2, title: "Sissy in Training", xpRequired: 500, rewards: ["Task completion badge"] },
    { level: 3, title: "Dedicated Sissy", xpRequired: 1200, rewards: ["1-week streak badge"] },
    { level: 4, title: "Devoted Sissy", xpRequired: 2000, rewards: ["Custom task creation unlocked"] },
    { level: 5, title: "Accomplished Sissy", xpRequired: 3500, rewards: ["Progress photo gallery"] },
    { level: 6, title: "Advanced Sissy", xpRequired: 5000, rewards: ["All categories mastered"] },
    { level: 7, title: "Expert Sissy", xpRequired: 7500, rewards: ["30-day streak badge"] },
    { level: 8, title: "Elite Sissy", xpRequired: 10000, rewards: ["Mentor role unlocked"] },
    { level: 9, title: "Master Sissy", xpRequired: 15000, rewards: ["Master badge", "Custom rewards"] },
    { level: 10, title: "Supreme Sissy", xpRequired: 25000, rewards: ["Crown icon", "Ultimate achievement"] },
];

export function SissificationTracker() {
    const { sissyLogs, addSissyLog } = useStore();
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
    const [taskNote, setTaskNote] = useState("");
    const [taskPhoto, setTaskPhoto] = useState<string | null>(null);
    const [totalXP, setTotalXP] = useState(0);

    // Calculate total XP from completed tasks
    useEffect(() => {
        const xp = sissyLogs.reduce((sum, log) => {
            const task = DAILY_TASKS.find(t => t.title === log.activity);
            return sum + (task?.xp || 0);
        }, 0);
        setTotalXP(xp);
    }, [sissyLogs]);

    // Calculate current level
    const currentLevel = useMemo(() => {
        let level = LEVELS[0];
        for (const l of LEVELS) {
            if (totalXP >= l.xpRequired) {
                level = l;
            } else {
                break;
            }
        }
        return level;
    }, [totalXP]);

    const nextLevel = LEVELS[currentLevel.level] || LEVELS[LEVELS.length - 1];
    const xpToNextLevel = nextLevel.xpRequired - totalXP;
    const levelProgress = ((totalXP - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100;

    // Get today's completed tasks
    const todayStart = startOfDay(new Date()).getTime();
    const todayCompletedTasks = useMemo(() => {
        return sissyLogs.filter(log => log.date >= todayStart);
    }, [sissyLogs, todayStart]);

    // Calculate streak
    const currentStreak = useMemo(() => {
        if (sissyLogs.length === 0) return 0;
        
        const sortedLogs = [...sissyLogs].sort((a, b) => b.date - a.date);
        let streak = 0;
        let checkDate = startOfDay(new Date()).getTime();
        
        // Check if there's activity today
        const hasToday = sortedLogs.some(log => log.date >= checkDate);
        if (!hasToday) {
            checkDate = subDays(checkDate, 1).getTime();
        }
        
        while (true) {
            const hasActivity = sortedLogs.some(log => {
                const logDay = startOfDay(log.date).getTime();
                return logDay === checkDate;
            });
            
            if (!hasActivity) break;
            
            streak++;
            checkDate = subDays(checkDate, 1).getTime();
        }
        
        return streak;
    }, [sissyLogs]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return DAILY_TASKS.filter(task => {
            if (selectedCategory !== "all" && task.category !== selectedCategory) return false;
            if (selectedDifficulty !== "all" && task.difficulty !== selectedDifficulty) return false;
            return true;
        });
    }, [selectedCategory, selectedDifficulty]);

    // Check if task is completed today
    const isTaskCompletedToday = (taskId: string) => {
        return todayCompletedTasks.some(log => log.activity === DAILY_TASKS.find(t => t.id === taskId)?.title);
    };

    const handleCompleteTask = async () => {
        if (!selectedTask) return;

        await addSissyLog({
            id: uuidv4(),
            date: Date.now(),
            category: selectedTask.category,
            activity: selectedTask.title,
            duration: selectedTask.duration,
            success: true,
            mood: "proud",
            note: taskNote,
            photo: taskPhoto || undefined,
        });

        setShowTaskModal(false);
        setSelectedTask(null);
        setTaskNote("");
        setTaskPhoto(null);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setTaskPhoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const categoryColors = {
        appearance: "from-pink-500 to-rose-500",
        behavior: "from-purple-500 to-violet-500",
        skills: "from-blue-500 to-cyan-500",
        mindset: "from-indigo-500 to-purple-500",
        fitness: "from-emerald-500 to-green-500",
        intimate: "from-rose-500 to-pink-500",
    };

    const categoryIcons = {
        appearance: "💄",
        behavior: "🎀",
        skills: "✨",
        mindset: "🧠",
        fitness: "💪",
        intimate: "💖",
    };

    return (
        <div className="space-y-6">
            {/* Header with Level & Stats */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                            <Crown className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-sm opacity-90">Level {currentLevel.level}</div>
                            <h2 className="text-2xl font-bold">{currentLevel.title}</h2>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{totalXP}</div>
                        <div className="text-sm opacity-90">Total XP</div>
                    </div>
                </div>

                {/* XP Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Progress to Level {nextLevel.level}</span>
                        <span>{xpToNextLevel > 0 ? `${xpToNextLevel} XP needed` : "Max Level!"}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="bg-white h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(levelProgress, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-600" />
                        <span className="text-xs text-muted-foreground font-medium">Streak</span>
                    </div>
                    <div className="text-2xl font-bold">{currentStreak}</div>
                    <div className="text-xs text-muted-foreground">days</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs text-muted-foreground font-medium">Today</span>
                    </div>
                    <div className="text-2xl font-bold">{todayCompletedTasks.length}</div>
                    <div className="text-xs text-muted-foreground">tasks</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span className="text-xs text-muted-foreground font-medium">Total</span>
                    </div>
                    <div className="text-2xl font-bold">{sissyLogs.length}</div>
                    <div className="text-xs text-muted-foreground">completed</div>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">Category</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={clsx(
                                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                                selectedCategory === "all"
                                    ? "bg-purple-600 text-white"
                                    : "bg-white dark:bg-slate-800 border border-border hover:bg-muted"
                            )}
                        >
                            All
                        </button>
                        {Object.entries(categoryIcons).map(([cat, icon]) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 flex-shrink-0",
                                    selectedCategory === cat
                                        ? "bg-purple-600 text-white"
                                        : "bg-white dark:bg-slate-800 border border-border hover:bg-muted"
                                )}
                            >
                                <span>{icon}</span>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">Difficulty</label>
                    <div className="flex gap-2">
                        {["all", "beginner", "intermediate", "advanced"].map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={clsx(
                                    "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    selectedDifficulty === diff
                                        ? "bg-purple-600 text-white"
                                        : "bg-white dark:bg-slate-800 border border-border hover:bg-muted"
                                )}
                            >
                                {diff.charAt(0).toUpperCase() + diff.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Daily Tasks ({filteredTasks.length})
                </h3>

                <AnimatePresence>
                    {filteredTasks.map((task, idx) => {
                        const isCompleted = isTaskCompletedToday(task.id);
                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => {
                                    if (!isCompleted) {
                                        setSelectedTask(task);
                                        setShowTaskModal(true);
                                    }
                                }}
                                className={clsx(
                                    "bg-white dark:bg-slate-800 rounded-xl p-4 border transition-all cursor-pointer",
                                    isCompleted
                                        ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 opacity-75"
                                        : "border-border hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                        isCompleted ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-purple-100 dark:bg-purple-900/30"
                                    )}>
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-purple-600" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className={clsx(
                                                "font-semibold",
                                                isCompleted && "line-through text-muted-foreground"
                                            )}>
                                                {categoryIcons[task.category]} {task.title}
                                            </h4>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
                                                    +{task.xp} XP
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {task.duration} min
                                            </span>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded-full",
                                                task.difficulty === "beginner" && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                                                task.difficulty === "intermediate" && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
                                                task.difficulty === "advanced" && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            )}>
                                                {task.difficulty}
                                            </span>
                                        </div>
                                    </div>

                                    {!isCompleted && (
                                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Complete Task Modal */}
            {showTaskModal && selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                Complete Task
                            </h3>
                            <button onClick={() => setShowTaskModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className={`bg-gradient-to-r ${categoryColors[selectedTask.category]} p-4 rounded-xl text-white mb-4`}>
                            <div className="text-sm opacity-90 mb-1">{selectedTask.category.toUpperCase()}</div>
                            <h4 className="font-bold text-lg mb-2">{selectedTask.title}</h4>
                            <p className="text-sm opacity-90 mb-3">{selectedTask.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {selectedTask.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    +{selectedTask.xp} XP
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Photo Upload */}
                            <div>
                                <label className="text-sm font-medium block mb-2">Progress Photo (Optional)</label>
                                {taskPhoto ? (
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                        <img src={taskPhoto} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setTaskPhoto(null)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">Upload photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-medium block mb-2">Notes (Optional)</label>
                                <textarea
                                    value={taskNote}
                                    onChange={e => setTaskNote(e.target.value)}
                                    placeholder="How did it go? Any thoughts or feelings?"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none h-24"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTaskModal(false)}
                                    className="flex-1 py-2 rounded-lg border border-border hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCompleteTask}
                                    className="flex-1 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2 font-medium"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Complete (+{selectedTask.xp} XP)
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

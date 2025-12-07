"use client";

import { useState, useCallback, useEffect } from "react";
import { Trophy, Target, Calendar, Zap, Award, Check, X, Plus, Trash2, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { get, set } from "idb-keyval";

interface Challenge {
    id: string;
    title: string;
    description: string;
    category: "style" | "beauty" | "fitness" | "intimacy" | "confidence" | "lifestyle";
    duration: number; // days
    startDate?: number;
    completed: boolean;
    progress: number; // 0-100
    dailyTasks: string[];
    completedDays: number[];
    rewards?: string;
    difficulty: "easy" | "medium" | "hard";
}

const categoryColors = {
    style: "from-pink-500 to-purple-500",
    beauty: "from-purple-500 to-indigo-500",
    fitness: "from-green-500 to-emerald-500",
    intimacy: "from-red-500 to-pink-500",
    confidence: "from-yellow-500 to-orange-500",
    lifestyle: "from-blue-500 to-cyan-500",
};

const categoryIcons = {
    style: "👗",
    beauty: "💄",
    fitness: "💪",
    intimacy: "💖",
    confidence: "✨",
    lifestyle: "🌟",
};

const difficultyColors = {
    easy: "text-green-400",
    medium: "text-yellow-400",
    hard: "text-red-400",
};

const presetChallenges: Omit<Challenge, "id" | "startDate" | "completed" | "progress" | "completedDays">[] = [
    {
        title: "30 Days of Femininity",
        description: "Daily feminine presentation challenge",
        category: "style",
        duration: 30,
        difficulty: "medium",
        dailyTasks: ["Wear makeup", "Style hair", "Choose feminine outfit", "Take progress photo"],
        rewards: "Master of Presentation badge",
    },
    {
        title: "Perfect Posture Challenge",
        description: "Maintain elegant posture all day",
        category: "fitness",
        duration: 21,
        difficulty: "easy",
        dailyTasks: ["Morning posture check", "Midday adjustment", "Evening review"],
        rewards: "Grace & Elegance badge",
    },
    {
        title: "Skincare Consistency",
        description: "Complete skincare routine twice daily",
        category: "beauty",
        duration: 30,
        difficulty: "easy",
        dailyTasks: ["Morning routine", "Evening routine", "Moisturize throughout day"],
        rewards: "Glowing Skin achievement",
    },
    {
        title: "Voice Feminization Practice",
        description: "Daily voice training exercises",
        category: "confidence",
        duration: 60,
        difficulty: "hard",
        dailyTasks: ["15min pitch exercises", "Record practice", "Conversation practice"],
        rewards: "Voice Master badge",
    },
    {
        title: "Waist Training Journey",
        description: "Progressive corset wearing schedule",
        category: "fitness",
        duration: 90,
        difficulty: "hard",
        dailyTasks: ["Wear corset per schedule", "Log measurements", "Stretch exercises"],
        rewards: "Hourglass Figure milestone",
    },
];

export default function ChallengeSystem() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPresetsModal, setShowPresetsModal] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<Challenge["category"]>("style");
    const [duration, setDuration] = useState(30);
    const [difficulty, setDifficulty] = useState<Challenge["difficulty"]>("medium");
    const [tasks, setTasks] = useState<string[]>(["Task 1"]);
    const [rewards, setRewards] = useState("");

    useEffect(() => {
        get<Challenge[]>("challenges").then((stored) => {
            if (stored) setChallenges(stored);
        });
    }, []);

    const persistChallenges = useCallback((updated: Challenge[]) => {
        set("challenges", updated);
        setChallenges(updated);
    }, []);

    const addChallenge = (challenge: Omit<Challenge, "id" | "startDate" | "completed" | "progress" | "completedDays">) => {
        const newChallenge: Challenge = {
            ...challenge,
            id: crypto.randomUUID(),
            completed: false,
            progress: 0,
            completedDays: [],
        };
        persistChallenges([newChallenge, ...challenges]);
    };

    const startChallenge = (id: string) => {
        const updated = challenges.map((c) =>
            c.id === id ? { ...c, startDate: Date.now() } : c
        );
        persistChallenges(updated);
    };

    const toggleDay = (id: string, dayIndex: number) => {
        const challenge = challenges.find((c) => c.id === id);
        if (!challenge || !challenge.startDate) return;

        const dayTimestamp = challenge.startDate + dayIndex * 24 * 60 * 60 * 1000;
        const today = Date.now();
        if (dayTimestamp > today) return; // Can't complete future days

        const completedDays = challenge.completedDays.includes(dayIndex)
            ? challenge.completedDays.filter((d) => d !== dayIndex)
            : [...challenge.completedDays, dayIndex];

        const progress = Math.round((completedDays.length / challenge.duration) * 100);
        const completed = progress === 100;

        const updated = challenges.map((c) =>
            c.id === id ? { ...c, completedDays, progress, completed } : c
        );
        persistChallenges(updated);
    };

    const removeChallenge = (id: string) => {
        persistChallenges(challenges.filter((c) => c.id !== id));
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("style");
        setDuration(30);
        setDifficulty("medium");
        setTasks(["Task 1"]);
        setRewards("");
    };

    const handleCreateChallenge = () => {
        addChallenge({
            title: title.trim(),
            description: description.trim(),
            category,
            duration,
            difficulty,
            dailyTasks: tasks.filter((t) => t.trim()),
            rewards: rewards.trim() || undefined,
        });
        resetForm();
        setShowCreateModal(false);
    };

    const handleAddPreset = (preset: typeof presetChallenges[0]) => {
        addChallenge(preset);
        setShowPresetsModal(false);
    };

    const currentChallenge = selectedChallenge ? challenges.find((c) => c.id === selectedChallenge) : null;
    const activeCount = challenges.filter((c) => c.startDate && !c.completed).length;
    const completedCount = challenges.filter((c) => c.completed).length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Challenges
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPresetsModal(true)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
                    >
                        <Zap className="w-4 h-4" />
                        Presets
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Custom
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-3 border border-purple-500/20">
                    <div className="text-xs text-white/60 mb-1">Total</div>
                    <div className="text-2xl font-bold">{challenges.length}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-500/20">
                    <div className="text-xs text-white/60 mb-1">Active</div>
                    <div className="text-2xl font-bold">{activeCount}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-3 border border-green-500/20">
                    <div className="text-xs text-white/60 mb-1">Done</div>
                    <div className="text-2xl font-bold">{completedCount}</div>
                </div>
            </div>

            {/* Challenge List */}
            {challenges.length > 0 ? (
                <div className="space-y-3">
                    {challenges.map((challenge) => {
                        const daysElapsed = challenge.startDate
                            ? Math.floor((Date.now() - challenge.startDate) / (24 * 60 * 60 * 1000))
                            : 0;
                        const isActive = challenge.startDate && !challenge.completed;

                        return (
                            <div
                                key={challenge.id}
                                className={clsx(
                                    "bg-white/5 rounded-xl p-4 border transition-all cursor-pointer",
                                    selectedChallenge === challenge.id
                                        ? "border-purple-500/50 bg-purple-500/10"
                                        : "border-white/10 hover:bg-white/10"
                                )}
                                onClick={() => setSelectedChallenge(challenge.id)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">{categoryIcons[challenge.category]}</span>
                                            <div>
                                                <h4 className="font-semibold text-white">{challenge.title}</h4>
                                                <p className="text-xs text-white/70">{challenge.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!challenge.startDate && !challenge.completed && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startChallenge(challenge.id);
                                                }}
                                                className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-green-400"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeChallenge(challenge.id);
                                            }}
                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/50">
                                            {challenge.duration} days • {challenge.difficulty}
                                        </span>
                                        {isActive && (
                                            <span className="text-white/50">
                                                Day {Math.min(daysElapsed + 1, challenge.duration)}/{challenge.duration}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div
                                            className={clsx(
                                                "h-2 rounded-full transition-all bg-gradient-to-r",
                                                categoryColors[challenge.category]
                                            )}
                                            style={{ width: `${challenge.progress}%` }}
                                        />
                                    </div>
                                    {challenge.completed && (
                                        <div className="flex items-center gap-1 text-xs text-green-400">
                                            <Trophy className="w-3 h-3" />
                                            Challenge Completed!
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <Target className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/50 text-sm mb-4">No challenges yet</p>
                    <button
                        onClick={() => setShowPresetsModal(true)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                    >
                        Browse Presets
                    </button>
                </div>
            )}

            {/* Challenge Detail */}
            {currentChallenge && currentChallenge.startDate && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Daily Progress
                    </h4>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: currentChallenge.duration }).map((_, idx) => {
                            const dayTimestamp = currentChallenge.startDate! + idx * 24 * 60 * 60 * 1000;
                            const isToday = Math.floor((Date.now() - currentChallenge.startDate!) / (24 * 60 * 60 * 1000)) === idx;
                            const isPast = dayTimestamp <= Date.now();
                            const isCompleted = currentChallenge.completedDays.includes(idx);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => toggleDay(currentChallenge.id, idx)}
                                    disabled={!isPast}
                                    className={clsx(
                                        "aspect-square rounded-lg text-xs font-medium transition-all",
                                        isCompleted
                                            ? "bg-green-500 text-white"
                                            : isPast
                                            ? "bg-white/10 hover:bg-white/20"
                                            : "bg-white/5 text-white/30 cursor-not-allowed",
                                        isToday && "ring-2 ring-purple-500"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-4 h-4 mx-auto" /> : idx + 1}
                                </button>
                            );
                        })}
                    </div>
                    {currentChallenge.dailyTasks.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Daily Tasks</h5>
                            <ul className="space-y-1">
                                {currentChallenge.dailyTasks.map((task, idx) => (
                                    <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                                        <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                        {task}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Presets Modal */}
            <AnimatePresence>
                {showPresetsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPresetsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                    Preset Challenges
                                </h3>
                                <button
                                    onClick={() => setShowPresetsModal(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {presetChallenges.map((preset, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xl">{categoryIcons[preset.category]}</span>
                                                    <h4 className="font-semibold">{preset.title}</h4>
                                                </div>
                                                <p className="text-xs text-white/60 mb-2">{preset.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-white/50">
                                                    <span>{preset.duration} days</span>
                                                    <span>•</span>
                                                    <span className={difficultyColors[preset.difficulty]}>
                                                        {preset.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddPreset(preset)}
                                            className="w-full mt-3 px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Add Challenge
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowCreateModal(false);
                            resetForm();
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Custom Challenge</h3>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Duration (days)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                                            min="1"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Difficulty</label>
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value as any)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(categoryIcons) as Array<keyof typeof categoryIcons>).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={clsx(
                                                    "px-3 py-2 rounded-lg text-xs transition-colors",
                                                    category === cat
                                                        ? "bg-purple-500 text-white"
                                                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {categoryIcons[cat]} {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateChallenge}
                                        disabled={!title.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

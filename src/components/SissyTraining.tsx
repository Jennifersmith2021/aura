"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Sparkles, Plus, Trash2, Edit3, X, Check, Target, Calendar, TrendingUp, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const categoryColors = {
    appearance: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    behavior: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    skills: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    mindset: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    fitness: "bg-green-500/20 text-green-300 border-green-500/30",
    intimate: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const categoryIcons = {
    appearance: "💄",
    behavior: "🎀",
    skills: "✨",
    mindset: "🧠",
    fitness: "💪",
    intimate: "💖",
};

const moodEmojis = {
    confident: "😎",
    nervous: "😰",
    excited: "🤩",
    proud: "🥰",
    challenged: "💪",
    happy: "😊",
};

export default function SissyTraining() {
    const {
        sissyGoals,
        addSissyGoal,
        removeSissyGoal,
        updateSissyGoal,
        toggleSissyGoalComplete,
        sissyLogs,
        addSissyLog,
        removeSissyLog,
    } = useStore();

    const [activeTab, setActiveTab] = useState<"goals" | "log">("goals");
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>("all");

    // Goal form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<"appearance" | "behavior" | "skills" | "mindset" | "fitness" | "intimate">("appearance");
    const [description, setDescription] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [progress, setProgress] = useState(0);
    const [milestones, setMilestones] = useState("");
    const [note, setNote] = useState("");

    // Log form state
    const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
    const [logGoalId, setLogGoalId] = useState("");
    const [logCategory, setLogCategory] = useState<"appearance" | "behavior" | "skills" | "mindset" | "fitness" | "intimate">("appearance");
    const [activity, setActivity] = useState("");
    const [duration, setDuration] = useState("");
    const [success, setSuccess] = useState(true);
    const [mood, setMood] = useState<"confident" | "nervous" | "excited" | "proud" | "challenged" | "happy">("confident");
    const [logNote, setLogNote] = useState("");
    const [logPhoto, setLogPhoto] = useState("");

    const resetGoalForm = () => {
        setTitle("");
        setCategory("appearance");
        setDescription("");
        setTargetDate("");
        setPriority("medium");
        setProgress(0);
        setMilestones("");
        setNote("");
        setEditingGoal(null);
    };

    const resetLogForm = () => {
        setLogDate(new Date().toISOString().split("T")[0]);
        setLogGoalId("");
        setLogCategory("appearance");
        setActivity("");
        setDuration("");
        setSuccess(true);
        setMood("confident");
        setLogNote("");
        setLogPhoto("");
    };

    const handleAddGoal = () => {
        const goal = {
            id: crypto.randomUUID(),
            title: title.trim(),
            category,
            description: description.trim(),
            targetDate: targetDate ? new Date(targetDate).getTime() : undefined,
            completed: false,
            priority,
            progress,
            milestones: milestones
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean),
            note: note.trim() || undefined,
        };
        addSissyGoal(goal);
        resetGoalForm();
        setShowGoalModal(false);
    };

    const handleEditGoal = (goalId: string) => {
        const goal = sissyGoals.find((g) => g.id === goalId);
        if (!goal) return;

        setTitle(goal.title);
        setCategory(goal.category);
        setDescription(goal.description);
        setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split("T")[0] : "");
        setPriority(goal.priority);
        setProgress(goal.progress);
        setMilestones(goal.milestones?.join(", ") || "");
        setNote(goal.note || "");
        setEditingGoal(goalId);
        setShowGoalModal(true);
    };

    const handleUpdateGoal = () => {
        if (!editingGoal) return;

        updateSissyGoal(editingGoal, {
            title: title.trim(),
            category,
            description: description.trim(),
            targetDate: targetDate ? new Date(targetDate).getTime() : undefined,
            priority,
            progress,
            milestones: milestones
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean),
            note: note.trim() || undefined,
        });
        resetGoalForm();
        setShowGoalModal(false);
    };

    const handleAddLog = () => {
        const log = {
            id: crypto.randomUUID(),
            date: new Date(logDate).getTime(),
            goalId: logGoalId || undefined,
            category: logCategory,
            activity: activity.trim(),
            duration: duration ? parseInt(duration) : undefined,
            success,
            mood,
            note: logNote.trim() || undefined,
            photo: logPhoto.trim() || undefined,
        };
        addSissyLog(log);
        resetLogForm();
        setShowLogModal(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setLogPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Filter goals
    const filteredGoals = filterCategory === "all"
        ? sissyGoals
        : sissyGoals.filter((g) => g.category === filterCategory);

    // Stats
    const totalGoals = sissyGoals.length;
    const completedGoals = sissyGoals.filter((g) => g.completed).length;
    const avgProgress = sissyGoals.length > 0
        ? Math.round(sissyGoals.reduce((sum, g) => sum + g.progress, 0) / sissyGoals.length)
        : 0;
    const [now] = useState(() => Date.now());
    const thisWeekLogs = sissyLogs.filter((l) => l.date > now - 7 * 24 * 60 * 60 * 1000).length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    Sissy Training
                </h3>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-lg p-3 border border-pink-500/20">
                    <div className="text-2xl font-bold text-pink-400">{totalGoals}</div>
                    <div className="text-xs text-white/90 font-medium">Goals</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-3 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">{completedGoals}</div>
                    <div className="text-xs text-white/90 font-medium">Done</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">{avgProgress}%</div>
                    <div className="text-xs text-white/90 font-medium">Progress</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-3 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{thisWeekLogs}</div>
                    <div className="text-xs text-white/90 font-medium">This Week</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("goals")}
                    className={clsx(
                        "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        activeTab === "goals"
                            ? "bg-pink-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    <Target className="w-4 h-4 inline mr-1" />
                    Goals
                </button>
                <button
                    onClick={() => setActiveTab("log")}
                    className={clsx(
                        "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        activeTab === "log"
                            ? "bg-pink-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Training Log
                </button>
            </div>

            {/* Goals Tab */}
            {activeTab === "goals" && (
                <div className="space-y-4">
                    {/* Add Goal Button */}
                    <button
                        onClick={() => {
                            resetGoalForm();
                            setShowGoalModal(true);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Goal
                    </button>

                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => setFilterCategory("all")}
                            className={clsx(
                                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                                filterCategory === "all"
                                    ? "bg-white/20 text-white"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            All
                        </button>
                        {(Object.keys(categoryColors) as Array<keyof typeof categoryColors>).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                                    filterCategory === cat ? categoryColors[cat] : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                                )}
                            >
                                {categoryIcons[cat]} {cat}
                            </button>
                        ))}
                    </div>

                    {/* Goals List */}
                    {filteredGoals.length === 0 ? (
                        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                            <Target className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/80 text-sm font-medium">No goals yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredGoals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className={clsx(
                                        "bg-white/5 rounded-xl p-4 border border-white/10 hover:border-pink-500/50 transition-colors",
                                        goal.completed && "opacity-60"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleSissyGoalComplete(goal.id)}
                                            className={clsx(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                                                goal.completed
                                                    ? "bg-green-500 border-green-500"
                                                    : "border-white/30 hover:border-pink-500"
                                            )}
                                        >
                                            {goal.completed && <Check className="w-4 h-4 text-white" />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h4 className={clsx("font-bold text-white drop-shadow-sm mb-1", goal.completed && "line-through")}>
                                                        {goal.title}
                                                    </h4>
                                                    <p className="text-sm text-white/90 font-medium mb-2">{goal.description}</p>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className={clsx("px-2 py-0.5 rounded text-xs border", categoryColors[goal.category as keyof typeof categoryColors])}>
                                                    {categoryIcons[goal.category as keyof typeof categoryIcons]} {goal.category}
                                                </span>
                                                <span
                                                    className={clsx(
                                                        "px-2 py-0.5 rounded text-xs",
                                                        goal.priority === "high" && "bg-red-500/20 text-red-300",
                                                        goal.priority === "medium" && "bg-yellow-500/20 text-yellow-300",
                                                        goal.priority === "low" && "bg-gray-500/20 text-gray-300"
                                                    )}
                                                >
                                                    {goal.priority}
                                                </span>
                                                {goal.targetDate && (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/90 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(goal.targetDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            {!goal.completed && (
                                                <div className="mb-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-white/90 font-medium">Progress</span>
                                                        <span className="text-xs text-white/90 font-medium">{goal.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-white/10 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                                                            style={{ width: `${goal.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Milestones */}
                                            {goal.milestones && goal.milestones.length > 0 && (
                                                <div className="mb-2">
                                                    <div className="text-xs text-white/90 font-medium mb-1">Milestones:</div>
                                                    <ul className="space-y-1">
                                                        {goal.milestones.map((milestone: string, i: number) => (
                                                            <li key={i} className="text-xs text-white/90 font-medium flex items-start gap-1">
                                                                <span className="text-pink-400">•</span>
                                                                {milestone}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditGoal(goal.id)}
                                                    className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors flex items-center gap-1"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => removeSissyGoal(goal.id)}
                                                    className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Training Log Tab */}
            {activeTab === "log" && (
                <div className="space-y-4">
                    {/* Add Log Button */}
                    <button
                        onClick={() => {
                            resetLogForm();
                            setShowLogModal(true);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Log Training Session
                    </button>

                    {/* Training Logs */}
                    {sissyLogs.length === 0 ? (
                        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                            <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/80 text-sm font-medium">No training logs yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sissyLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-colors"
                                >
                                    <div className="flex gap-3">
                                        {/* Photo */}
                                        {log.photo && (
                                            <img src={log.photo} alt="Training" className="w-20 h-20 object-cover rounded-lg" />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-white drop-shadow-sm mb-1">{log.activity}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(log.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <span className="text-2xl">{moodEmojis[log.mood as keyof typeof moodEmojis]}</span>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className={clsx("px-2 py-0.5 rounded text-xs border", categoryColors[log.category as keyof typeof categoryColors])}>
                                                    {categoryIcons[log.category as keyof typeof categoryIcons]} {log.category}
                                                </span>
                                                <span
                                                    className={clsx(
                                                        "px-2 py-0.5 rounded text-xs",
                                                        log.success ? "bg-green-500/20 text-green-300" : "bg-orange-500/20 text-orange-300"
                                                    )}
                                                >
                                                    {log.success ? "✓ Success" : "○ Challenged"}
                                                </span>
                                                {log.duration && (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/90 font-medium">
                                                        {log.duration} min
                                                    </span>
                                                )}
                                            </div>

                                            {/* Note */}
                                            {log.note && <p className="text-sm text-white/95 font-medium mb-2">{log.note}</p>}

                                            {/* Actions */}
                                            <button
                                                onClick={() => removeSissyLog(log.id)}
                                                className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Goal Modal */}
            <AnimatePresence>
                {showGoalModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowGoalModal(false);
                            resetGoalForm();
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
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Target className="w-5 h-5 text-pink-400" />
                                    {editingGoal ? "Edit Goal" : "New Goal"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowGoalModal(false);
                                        resetGoalForm();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Goal Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Master walking in heels"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(categoryColors) as Array<keyof typeof categoryColors>).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={clsx(
                                                    "px-3 py-2 rounded-lg text-xs font-medium transition-colors border",
                                                    category === cat ? categoryColors[cat] : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {categoryIcons[cat]} {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description *</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What do you want to achieve?"
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Priority */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Priority</label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    {/* Target Date */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Target Date</label>
                                        <input
                                            type="date"
                                            value={targetDate}
                                            onChange={(e) => setTargetDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Progress: {progress}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progress}
                                        onChange={(e) => setProgress(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                {/* Milestones */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Milestones (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={milestones}
                                        onChange={(e) => setMilestones(e.target.value)}
                                        placeholder="e.g., Walk 10 steps, Walk across room, Walk outside"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Note</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Additional notes..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowGoalModal(false);
                                            resetGoalForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                                        disabled={!title.trim() || !description.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editingGoal ? "Update" : "Add"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Log Modal */}
            <AnimatePresence>
                {showLogModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowLogModal(false);
                            resetLogForm();
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
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-400" />
                                    Log Training Session
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowLogModal(false);
                                        resetLogForm();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={logDate}
                                        onChange={(e) => setLogDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Activity */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Activity *</label>
                                    <input
                                        type="text"
                                        value={activity}
                                        onChange={(e) => setActivity(e.target.value)}
                                        placeholder="e.g., Practiced makeup for 30 minutes"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(categoryColors) as Array<keyof typeof categoryColors>).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setLogCategory(cat)}
                                                className={clsx(
                                                    "px-3 py-2 rounded-lg text-xs font-medium transition-colors border",
                                                    logCategory === cat ? categoryColors[cat] : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {categoryIcons[cat]} {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Related Goal */}
                                {sissyGoals.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Related Goal (optional)</label>
                                        <select
                                            value={logGoalId}
                                            onChange={(e) => setLogGoalId(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">None</option>
                                            {sissyGoals.map((goal) => (
                                                <option key={goal.id} value={goal.id}>
                                                    {goal.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Duration */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Duration (min)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            placeholder="30"
                                            min="0"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* Success */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Result</label>
                                        <select
                                            value={success ? "true" : "false"}
                                            onChange={(e) => setSuccess(e.target.value === "true")}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="true">✓ Success</option>
                                            <option value="false">○ Challenged</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Mood */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">How did you feel?</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(moodEmojis) as Array<keyof typeof moodEmojis>).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setMood(m)}
                                                className={clsx(
                                                    "px-3 py-2 rounded-lg text-sm transition-colors",
                                                    mood === m
                                                        ? "bg-purple-500/30 text-white border-2 border-purple-500"
                                                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {moodEmojis[m]} {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                    />
                                    {logPhoto && (
                                        <img src={logPhoto} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                                    )}
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Note</label>
                                    <textarea
                                        value={logNote}
                                        onChange={(e) => setLogNote(e.target.value)}
                                        placeholder="Reflections, learnings, challenges..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowLogModal(false);
                                            resetLogForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddLog}
                                        disabled={!activity.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Log
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

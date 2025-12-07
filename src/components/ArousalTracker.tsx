"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Heart, Flame, TrendingUp, Calendar, Trash2, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ArousalTracker() {
    const { arousalLogs, measurements, addArousalLog, removeArousalLog } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Form state
    const [level, setLevel] = useState(5);
    const [mood, setMood] = useState("");
    const [note, setNote] = useState("");
    const [cycleDay, setCycleDay] = useState("");
    const [customDate, setCustomDate] = useState("");

    const handleAdd = () => {
        const log = {
            id: crypto.randomUUID(),
            date: customDate ? new Date(customDate).getTime() : Date.now(),
            level,
            mood: mood.trim() || undefined,
            note: note.trim() || undefined,
            cycleDay: cycleDay ? parseInt(cycleDay) : undefined,
        };
        addArousalLog(log);
        // Reset form
        setLevel(5);
        setMood("");
        setNote("");
        setCycleDay("");
        setCustomDate("");
        setShowAddModal(false);
    };

    // Calculate stats
    const avgLevel = arousalLogs.length > 0
        ? (arousalLogs.reduce((sum, log) => sum + log.level, 0) / arousalLogs.length).toFixed(1)
        : "0";
    
    const last7Days = arousalLogs.filter(log => log.date > Date.now() - 7 * 24 * 60 * 60 * 1000);
    const avgLast7 = last7Days.length > 0
        ? (last7Days.reduce((sum, log) => sum + log.level, 0) / last7Days.length).toFixed(1)
        : "0";

    // Chart data (last 30 days)
    const chartData = arousalLogs
        .filter(log => log.date > Date.now() - 30 * 24 * 60 * 60 * 1000)
        .sort((a, b) => a.date - b.date)
        .map(log => ({
            date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            level: log.level,
        }));

    // Get color for level
    const getLevelColor = (lvl: number) => {
        if (lvl <= 3) return "text-blue-400";
        if (lvl <= 6) return "text-purple-400";
        return "text-pink-500";
    };

    const getLevelBg = (lvl: number) => {
        if (lvl <= 3) return "bg-blue-500/20";
        if (lvl <= 6) return "bg-purple-500/20";
        return "bg-pink-500/20";
    };

    const getLevelLabel = (lvl: number) => {
        if (lvl <= 3) return "Low";
        if (lvl <= 6) return "Medium";
        return "High";
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-pink-500" />
                    Desire Tracker
                </h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Log
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Average (All Time)
                    </div>
                    <div className="text-2xl font-bold text-white">{avgLevel}/10</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-500/20">
                    <div className="flex items-center gap-2 text-pink-400 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        Last 7 Days
                    </div>
                    <div className="text-2xl font-bold text-white">{avgLast7}/10</div>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-medium text-white/70 mb-3">Last 30 Days</h4>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="date" stroke="#ffffff50" style={{ fontSize: "12px" }} />
                            <YAxis stroke="#ffffff50" style={{ fontSize: "12px" }} domain={[0, 10]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Line type="monotone" dataKey="level" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* History Button */}
            {arousalLogs.length > 0 && (
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full py-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                    {showHistory ? "Hide History" : `View History (${arousalLogs.length})`}
                </button>
            )}

            {/* History */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {arousalLogs.map((log) => (
                            <div
                                key={log.id}
                                className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-start gap-3"
                            >
                                <div className={clsx("shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg", getLevelBg(log.level), getLevelColor(log.level))}>
                                    {log.level}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm text-white/70 mb-1">
                                        <span>{new Date(log.date).toLocaleDateString()}</span>
                                        <span className={clsx("px-2 py-0.5 rounded text-xs font-medium", getLevelBg(log.level), getLevelColor(log.level))}>
                                            {getLevelLabel(log.level)}
                                        </span>
                                        {log.cycleDay && (
                                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                                                Day {log.cycleDay}
                                            </span>
                                        )}
                                    </div>
                                    {log.mood && (
                                        <div className="text-sm text-white/90 mb-1 flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5 text-pink-400" />
                                            {log.mood}
                                        </div>
                                    )}
                                    {log.note && <p className="text-sm text-white/60">{log.note}</p>}
                                </div>
                                <button
                                    onClick={() => removeArousalLog(log.id)}
                                    className="shrink-0 p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-pink-500" />
                                    Log Desire Level
                                </h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Level Slider */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Desire Level: <span className={clsx("font-bold", getLevelColor(level))}>{level}/10</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={level}
                                        onChange={(e) => setLevel(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                                    />
                                    <div className="flex justify-between text-xs text-white/50 mt-1">
                                        <span>Low</span>
                                        <span>Medium</span>
                                        <span>High</span>
                                    </div>
                                </div>

                                {/* Mood */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Mood (optional)</label>
                                    <input
                                        type="text"
                                        value={mood}
                                        onChange={(e) => setMood(e.target.value)}
                                        placeholder="e.g., Playful, Needy, Romantic..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Cycle Day */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cycle Day (optional)</label>
                                    <input
                                        type="number"
                                        value={cycleDay}
                                        onChange={(e) => setCycleDay(e.target.value)}
                                        placeholder="Day of menstrual cycle"
                                        min="1"
                                        max="40"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Note (optional)</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Any reflections or context..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>

                                {/* Custom Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date (optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={customDate}
                                        onChange={(e) => setCustomDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-colors font-medium"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .slider-thumb::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(135deg, #ec4899, #a855f7);
                    border-radius: 50%;
                    cursor: pointer;
                }
                .slider-thumb::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(135deg, #ec4899, #a855f7);
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                }
            `}</style>
        </div>
    );
}

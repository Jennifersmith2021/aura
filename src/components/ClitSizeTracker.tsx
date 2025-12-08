"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { TrendingUp, Plus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ClitSizeTracker() {
    const { clitMeasurements, addClitMeasurement, removeClitMeasurement } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Form state
    const [lengthMm, setLengthMm] = useState("");
    const [widthMm, setWidthMm] = useState("");
    const [method, setMethod] = useState("");
    const [arousalState, setArousalState] = useState<"unaroused" | "semi-aroused" | "fully-aroused">("unaroused");
    const [note, setNote] = useState("");
    const [customDate, setCustomDate] = useState("");

    const handleAdd = () => {
        const measurement = {
            id: crypto.randomUUID(),
            date: customDate ? new Date(customDate).getTime() : Date.now(),
            lengthMm: parseFloat(lengthMm),
            widthMm: widthMm ? parseFloat(widthMm) : undefined,
            method: method.trim() || undefined,
            arousalState,
            note: note.trim() || undefined,
        };
        addClitMeasurement(measurement);
        // Reset form
        setLengthMm("");
        setWidthMm("");
        setMethod("");
        setArousalState("unaroused");
        setNote("");
        setCustomDate("");
        setShowAddModal(false);
    };

    // Calculate stats
    const avgLength = clitMeasurements.length > 0
        ? (clitMeasurements.reduce((sum, m) => sum + m.lengthMm, 0) / clitMeasurements.length).toFixed(1)
        : "0";
    
    const latestMeasurement = clitMeasurements[0];
    const growth = clitMeasurements.length > 1
        ? (clitMeasurements[0].lengthMm - clitMeasurements[clitMeasurements.length - 1].lengthMm).toFixed(1)
        : "0";

    // Chart data (last 10 measurements)
    const chartData = clitMeasurements
        .slice(0, 10)
        .reverse()
        .map(m => ({
            date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            length: m.lengthMm,
        }));

    const arousalColors = {
        "unaroused": "bg-blue-500/20 text-blue-300",
        "semi-aroused": "bg-purple-500/20 text-purple-300",
        "fully-aroused": "bg-pink-500/20 text-pink-300",
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-400" />
                    Size Tracking
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
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-3 border border-pink-500/20">
                    <div className="text-pink-400 text-xs mb-1">Latest</div>
                    <div className="text-xl font-bold text-white">{latestMeasurement?.lengthMm || "—"}<span className="text-sm text-white/90 font-medium">mm</span></div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-3 border border-purple-500/20">
                    <div className="text-purple-400 text-xs mb-1">Average</div>
                    <div className="text-xl font-bold text-white">{avgLength}<span className="text-sm text-white/90 font-medium">mm</span></div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-500/20">
                    <div className="text-blue-400 text-xs mb-1">Growth</div>
                    <div className="text-xl font-bold text-white">+{growth}<span className="text-sm text-white/90 font-medium">mm</span></div>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-medium text-white/70 mb-3">Progress</h4>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="date" stroke="#ffffff50" style={{ fontSize: "12px" }} />
                            <YAxis stroke="#ffffff50" style={{ fontSize: "12px" }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Line type="monotone" dataKey="length" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* History Button */}
            {clitMeasurements.length > 0 && (
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full py-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                    {showHistory ? "Hide History" : `View History (${clitMeasurements.length})`}
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
                        {clitMeasurements.map((measurement) => (
                            <div
                                key={measurement.id}
                                className="bg-white/5 rounded-lg p-3 border border-white/10"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white">{measurement.lengthMm}mm</span>
                                            {measurement.widthMm && (
                                                <span className="text-sm text-white/60">× {measurement.widthMm}mm</span>
                                            )}
                                            <span className={clsx("px-2 py-0.5 rounded text-xs", arousalColors[measurement.arousalState || "unaroused"])}>
                                                {measurement.arousalState?.replace("-", " ")}
                                            </span>
                                        </div>
                                        <div className="text-xs text-white/90 font-medium mb-1">
                                            {new Date(measurement.date).toLocaleDateString()}
                                            {measurement.method && ` · ${measurement.method}`}
                                        </div>
                                        {measurement.note && <p className="text-xs text-white/60">{measurement.note}</p>}
                                    </div>
                                    <button
                                        onClick={() => removeClitMeasurement(measurement.id)}
                                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
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
                                    <TrendingUp className="w-5 h-5 text-pink-400" />
                                    Log Measurement
                                </h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Length */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Length (mm) *</label>
                                    <input
                                        type="number"
                                        value={lengthMm}
                                        onChange={(e) => setLengthMm(e.target.value)}
                                        placeholder="e.g., 15"
                                        step="0.1"
                                        min="0"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Width */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Width (mm)</label>
                                    <input
                                        type="number"
                                        value={widthMm}
                                        onChange={(e) => setWidthMm(e.target.value)}
                                        placeholder="e.g., 8"
                                        step="0.1"
                                        min="0"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Arousal State */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Arousal State</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setArousalState("unaroused")}
                                            className={clsx(
                                                "py-2 rounded-lg text-sm font-medium transition-colors",
                                                arousalState === "unaroused"
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                            )}
                                        >
                                            Unaroused
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setArousalState("semi-aroused")}
                                            className={clsx(
                                                "py-2 rounded-lg text-sm font-medium transition-colors",
                                                arousalState === "semi-aroused"
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                            )}
                                        >
                                            Semi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setArousalState("fully-aroused")}
                                            className={clsx(
                                                "py-2 rounded-lg text-sm font-medium transition-colors",
                                                arousalState === "fully-aroused"
                                                    ? "bg-pink-500 text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                            )}
                                        >
                                            Full
                                        </button>
                                    </div>
                                </div>

                                {/* Method */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Method</label>
                                    <input
                                        type="text"
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value)}
                                        placeholder="e.g., ruler, calipers, tape"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Note</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Any observations..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>

                                {/* Custom Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date</label>
                                    <input
                                        type="date"
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
                                        disabled={!lengthMm}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save
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

"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { ButtPlugSession } from "@/types";
import { Trash2, Plus, BarChart3 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export function ButtPlugTracker() {
    const store = useStore();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ButtPlugSession>>({
        plugSize: "medium",
        material: "silicone",
        comfortLevel: 3,
        relaxationLevel: 3,
        arousalLevel: 3,
        isTraining: true,
    });

    const sessions = store.buttPlugSessions || [];
    const sortedSessions = [...sessions].sort((a, b) => b.startDate - a.startDate);

    const handleAddSession = () => {
        if (!formData.plugType) {
            alert("Please enter plug type");
            return;
        }

        if (editingId) {
            store.updateButtPlugSession(editingId, {
                ...formData,
                startDate: formData.startDate || Date.now(),
            });
            setEditingId(null);
        } else {
            store.addButtPlugSession({
                ...formData,
                plugType: formData.plugType,
                plugSize: formData.plugSize || "medium",
                material: formData.material || "silicone",
                comfortLevel: formData.comfortLevel as any,
                relaxationLevel: formData.relaxationLevel as any,
                arousalLevel: formData.arousalLevel as any,
                startDate: formData.startDate || Date.now(),
                isTraining: formData.isTraining || true,
                sensations: formData.sensations || [],
            });
        }

        setFormData({
            plugSize: "medium",
            material: "silicone",
            comfortLevel: 3,
            relaxationLevel: 3,
            arousalLevel: 3,
            isTraining: true,
        });
        setShowForm(false);
    };

    const handleEdit = (session: ButtPlugSession) => {
        setFormData(session);
        setEditingId(session.id);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this session?")) {
            store.removeButtPlugSession(id);
        }
    };

    const getComfortEmoji = (level?: number) => {
        const l = level || 0;
        if (l <= 1) return "😟";
        if (l <= 2) return "😐";
        if (l <= 3) return "😊";
        if (l <= 4) return "🥰";
        return "🤤";
    };

    const getPlugColor = (size?: string) => {
        switch (size) {
            case "small":
                return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
            case "medium":
                return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
            case "large":
                return "bg-pink-500/20 text-pink-700 dark:text-pink-400";
            case "extra-large":
                return "bg-red-500/20 text-red-700 dark:text-red-400";
            default:
                return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
        }
    };

    const stats = {
        totalSessions: sessions.length,
        trainingDays: sessions.filter((s) => s.isTraining).length,
        avgComfort:
            sessions.length > 0
                ? Math.round(
                      sessions.reduce((sum, s) => sum + (s.comfortLevel || 0), 0) /
                          sessions.length
                  )
                : 0,
        avgDuration:
            sessions.length > 0
                ? Math.round(
                      sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) /
                          sessions.length
                  )
                : 0,
    };

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                        {stats.totalSessions}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total Sessions</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.avgComfort}/5
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Avg Comfort</p>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.avgDuration}m
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Avg Duration</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {stats.trainingDays}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Training Days</p>
                </div>
            </div>

            {/* Add Session Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">
                        {editingId ? "Edit Session" : "Log Butt Plug Session"}
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                                Plug Type/Name
                            </label>
                            <input
                                type="text"
                                value={formData.plugType || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, plugType: e.target.value })
                                }
                                placeholder="e.g., Squirt Medium"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground">
                                    Size
                                </label>
                                <select
                                    value={formData.plugSize || "medium"}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            plugSize: e.target.value as any,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mt-1"
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="extra-large">Extra Large</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-muted-foreground">
                                    Material
                                </label>
                                <select
                                    value={formData.material || "silicone"}
                                    onChange={(e) =>
                                        setFormData({ ...formData, material: e.target.value })
                                    }
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mt-1"
                                >
                                    <option value="silicone">Silicone</option>
                                    <option value="glass">Glass</option>
                                    <option value="metal">Metal</option>
                                    <option value="ceramic">Ceramic</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground">
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={formData.durationMinutes || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            durationMinutes: parseInt(e.target.value) || undefined,
                                        })
                                    }
                                    placeholder="45"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-muted-foreground">
                                    Depth (inches)
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.insertionDepth || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            insertionDepth: parseFloat(e.target.value) || undefined,
                                        })
                                    }
                                    placeholder="2.5"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                                Comfort Level: {formData.comfortLevel}/5{" "}
                                {getComfortEmoji(formData.comfortLevel)}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={formData.comfortLevel || 3}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        comfortLevel: parseInt(e.target.value) as any,
                                    })
                                }
                                className="w-full mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                                Relaxation Level: {formData.relaxationLevel}/5
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={formData.relaxationLevel || 3}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        relaxationLevel: parseInt(e.target.value) as any,
                                    })
                                }
                                className="w-full mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                                Arousal Level: {formData.arousalLevel}/5
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={formData.arousalLevel || 3}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        arousalLevel: parseInt(e.target.value) as any,
                                    })
                                }
                                className="w-full mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="How did it feel? Any achievements?"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mt-1 resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isTraining"
                                checked={formData.isTraining || false}
                                onChange={(e) =>
                                    setFormData({ ...formData, isTraining: e.target.checked })
                                }
                                className="w-4 h-4 rounded"
                            />
                            <label htmlFor="isTraining" className="text-sm">
                                This was part of training
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleAddSession}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold"
                            >
                                {editingId ? "Update Session" : "Log Session"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setFormData({
                                        plugSize: "medium",
                                        material: "silicone",
                                        comfortLevel: 3,
                                        relaxationLevel: 3,
                                        arousalLevel: 3,
                                        isTraining: true,
                                    });
                                }}
                                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 font-semibold flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Log New Session
                </button>
            )}

            {/* Sessions List */}
            <div className="space-y-3">
                {sortedSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No sessions logged yet. Start your training!</p>
                    </div>
                ) : (
                    sortedSessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-card border border-border rounded-lg p-4 space-y-2"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold">{session.plugType}</h4>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full capitalize ${getPlugColor(
                                                session.plugSize
                                            )}`}
                                        >
                                            {session.plugSize}
                                        </span>
                                        {session.isTraining && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                                Training
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>
                                            {new Date(session.startDate).toLocaleDateString()} at{" "}
                                            {new Date(session.startDate).toLocaleTimeString(
                                                [],
                                                { hour: "2-digit", minute: "2-digit" }
                                            )}
                                        </p>
                                        {session.material && (
                                            <p>Material: {session.material}</p>
                                        )}
                                        {session.durationMinutes && (
                                            <p>Duration: {session.durationMinutes} minutes</p>
                                        )}
                                    </div>

                                    <div className="flex gap-4 mt-3 text-xs">
                                        <span>
                                            Comfort:{" "}
                                            {getComfortEmoji(session.comfortLevel)}
                                            {session.comfortLevel}/5
                                        </span>
                                        <span>Relaxation: {session.relaxationLevel}/5</span>
                                        <span>Arousal: {session.arousalLevel}/5</span>
                                    </div>

                                    {session.notes && (
                                        <p className="text-xs mt-2 text-muted-foreground italic">
                                            {session.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(session)}
                                        className="px-3 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-500/30 text-xs font-semibold"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(session.id)}
                                        className="px-3 py-1 bg-red-500/20 text-red-700 dark:text-red-400 rounded hover:bg-red-500/30"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

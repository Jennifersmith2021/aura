"use client";
/* eslint-disable react-hooks/purity */

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Plus, Trash2, Edit2, Activity, Play } from "lucide-react";
import clsx from "clsx";
import { formatDistance } from "date-fns";

type Exercise = {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    youtubeUrl?: string;
    notes?: string;
};

export function WorkoutLogger() {
    const { workoutSessions, workoutPlans, addWorkoutSession, removeWorkoutSession, updateWorkoutSession } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditingId, setIsEditingId] = useState<string | null>(null);

    // Form state
    const [planId, setPlanId] = useState<string>("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [duration, setDuration] = useState("");
    const [notes, setNotes] = useState("");
    const [newExercise, setNewExercise] = useState<Exercise>({ name: "" });

    const editingItem = isEditingId ? workoutSessions.find(s => s.id === isEditingId) : null;
    const sortedSessions = [...workoutSessions].sort((a, b) => b.date - a.date);

    const handleAddExercise = () => {
        if (!newExercise.name.trim()) return;
        setExercises([...exercises, newExercise]);
        setNewExercise({ name: "" });
    };

    const handleRemoveExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (exercises.length === 0) return;

        if (editingItem) {
            await updateWorkoutSession(editingItem.id, {
                planId: planId || undefined,
                exercises,
                duration: duration ? parseInt(duration) : undefined,
                notes: notes || undefined
            });
            setIsEditingId(null);
        } else {
            await addWorkoutSession({
                date: Date.now(),
                planId: planId || undefined,
                exercises,
                duration: duration ? parseInt(duration) : undefined,
                notes: notes || undefined
            });
        }

        // Reset form
        setPlanId("");
        setExercises([]);
        setDuration("");
        setNotes("");
        setNewExercise({ name: "" });
        setIsAddModalOpen(false);
    };

    const handleEdit = (session: typeof workoutSessions[0]) => {
        setPlanId(session.planId || "");
        setExercises(session.exercises);
        setDuration(session.duration?.toString() || "");
        setNotes(session.notes || "");
        setIsEditingId(session.id);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this workout session?")) {
            await removeWorkoutSession(id);
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsEditingId(null);
        setPlanId("");
        setExercises([]);
        setDuration("");
        setNotes("");
        setNewExercise({ name: "" });
    };

    // Calculate stats
    const totalSessions = workoutSessions.length;
    const totalDuration = workoutSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const thisWeekSessions = workoutSessions.filter(s => {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        return s.date >= weekAgo && s.date <= now;
    }).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Workout Logger
                </h2>
                <button
                    onClick={() => {
                        setIsEditingId(null);
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Log
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{totalSessions}</div>
                    <div className="text-xs text-muted-foreground">Total Workouts</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{thisWeekSessions}</div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{totalDuration}</div>
                    <div className="text-xs text-muted-foreground">Total Minutes</div>
                </div>
            </div>

            {/* Sessions List */}
            {sortedSessions.length > 0 && (
                <div className="space-y-3">
                    {sortedSessions.map((session) => {
                        const linkedPlan = session.planId ? workoutPlans.find(p => p.id === session.planId) : null;
                        return (
                            <div key={session.id} className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                                <div className="p-4 border-b border-border flex items-start justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDistance(session.date, Date.now(), { addSuffix: true })}
                                        </div>
                                        {linkedPlan && (
                                            <div className="text-xs font-medium text-primary mt-1">
                                                {linkedPlan.dayOfWeek} Plan
                                            </div>
                                        )}
                                        {session.duration && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {session.duration} minutes
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    {/* Exercises */}
                                    <div className="space-y-2">
                                        {session.exercises.map((exercise, idx) => (
                                            <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                                                <h4 className="font-semibold text-sm break-words">{exercise.name}</h4>
                                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                                                    {exercise.sets && <span>{exercise.sets} sets</span>}
                                                    {exercise.reps && <span>{exercise.reps} reps</span>}
                                                    {exercise.weight && <span>{exercise.weight} lbs</span>}
                                                </div>
                                                {exercise.notes && (
                                                    <p className="text-xs text-muted-foreground mt-2 italic">{exercise.notes}</p>
                                                )}
                                                {exercise.youtubeUrl && (
                                                    <a
                                                        href={exercise.youtubeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 mt-2 text-xs text-primary hover:underline"
                                                    >
                                                        <Play className="w-3 h-3" />
                                                        Watch Tutorial
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Session Notes */}
                                    {session.notes && (
                                        <p className="text-xs text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
                                            {session.notes}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleEdit(session)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(session.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {workoutSessions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No workouts logged yet. Log your first workout!</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingItem ? "Edit Workout Session" : "Log Workout"}
                        </h3>

                        <div className="space-y-4">
                            {/* Linked Plan (optional) */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Link to Plan (optional)</label>
                                <select
                                    value={planId}
                                    onChange={(e) => setPlanId(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">No linked plan</option>
                                    {workoutPlans.map(plan => (
                                        <option key={plan.id} value={plan.id}>{plan.dayOfWeek}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Exercises List */}
                            <div>
                                <label className="text-sm font-medium block mb-2">Exercises</label>
                                <div className="space-y-2 mb-3">
                                    {exercises.map((exercise, idx) => (
                                        <div key={idx} className="bg-muted/50 p-3 rounded-lg flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium break-words">{exercise.name}</p>
                                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                                    {exercise.sets && <span>{exercise.sets}s</span>}
                                                    {exercise.reps && <span>{exercise.reps}r</span>}
                                                    {exercise.weight && <span>{exercise.weight}lbs</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveExercise(idx)}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 flex-shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Exercise Form */}
                                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                                    <input
                                        type="text"
                                        value={newExercise.name}
                                        onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                                        placeholder="Exercise name"
                                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="number"
                                            value={newExercise.sets || ""}
                                            onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value ? parseInt(e.target.value) : undefined })}
                                            placeholder="Sets"
                                            className="px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <input
                                            type="number"
                                            value={newExercise.reps || ""}
                                            onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value ? parseInt(e.target.value) : undefined })}
                                            placeholder="Reps"
                                            className="px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <input
                                            type="number"
                                            value={newExercise.weight || ""}
                                            onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value ? parseInt(e.target.value) : undefined })}
                                            placeholder="Weight"
                                            className="px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <input
                                        type="url"
                                        value={newExercise.youtubeUrl || ""}
                                        onChange={(e) => setNewExercise({ ...newExercise, youtubeUrl: e.target.value })}
                                        placeholder="YouTube URL (optional)"
                                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <input
                                        type="text"
                                        value={newExercise.notes || ""}
                                        onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                                        placeholder="Notes (optional)"
                                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        onClick={handleAddExercise}
                                        disabled={!newExercise.name.trim()}
                                        className="w-full px-2 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add Exercise
                                    </button>
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Duration (minutes, optional)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g., 45"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Notes (optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="How did it feel? Any observations?"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-20 resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={exercises.length === 0}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {editingItem ? "Save Changes" : "Log Workout"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

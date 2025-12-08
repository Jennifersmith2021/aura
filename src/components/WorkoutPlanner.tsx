"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Plus, Trash2, Edit2, Dumbbell, Play } from "lucide-react";
import clsx from "clsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Exercise = {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    notes?: string;
    youtubeUrl?: string;
};

export function WorkoutPlanner() {
    const { workoutPlans, addWorkoutPlan, removeWorkoutPlan, updateWorkoutPlan } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditingId, setIsEditingId] = useState<string | null>(null);

    // Form state
    const [dayOfWeek, setDayOfWeek] = useState<typeof DAYS[number]>("Monday");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [notes, setNotes] = useState("");
    const [newExercise, setNewExercise] = useState<Exercise>({ name: "" });

    const editingItem = isEditingId ? workoutPlans.find(p => p.id === isEditingId) : null;
    const plansByDay = DAYS.map(day => ({
        day,
        plan: workoutPlans.find(p => p.dayOfWeek === day)
    }));

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
        
        const validDay = dayOfWeek as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

        if (editingItem) {
            await updateWorkoutPlan(editingItem.id, {
                dayOfWeek: validDay,
                exercises,
                notes: notes || undefined
            });
            setIsEditingId(null);
        } else {
            await addWorkoutPlan({
                dayOfWeek: validDay,
                exercises,
                notes: notes || undefined,
                date: Date.now()
            });
        }

        // Reset form
        setDayOfWeek("Monday");
        setExercises([]);
        setNotes("");
        setNewExercise({ name: "" });
        setIsAddModalOpen(false);
    };

    const handleEdit = (plan: typeof workoutPlans[0]) => {
        setDayOfWeek(plan.dayOfWeek as typeof DAYS[number]);
        setExercises(plan.exercises);
        setNotes(plan.notes || "");
        setIsEditingId(plan.id);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this workout plan?")) {
            await removeWorkoutPlan(id);
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsEditingId(null);
        setDayOfWeek("Monday");
        setExercises([]);
        setNotes("");
        setNewExercise({ name: "" });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Dumbbell className="w-5 h-5" />
                    Workout Planner
                </h2>
                <button
                    onClick={() => {
                        setIsEditingId(null);
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Week Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border font-medium">Weekly Schedule ({workoutPlans.length}/7)</div>
                <div className="grid grid-cols-7 gap-1 p-2">
                    {plansByDay.map(({ day, plan }) => (
                        <div
                            key={day}
                            className={clsx(
                                "aspect-square flex flex-col items-center justify-center p-2 rounded-lg text-center text-xs font-medium transition-colors",
                                plan
                                    ? "bg-primary/20 border border-primary/40"
                                    : "bg-muted border border-border"
                            )}
                        >
                            <div className="text-[10px] text-muted-foreground truncate">{day.slice(0, 3)}</div>
                            {plan ? (
                                <div className="text-[11px] font-bold text-primary mt-1">✓</div>
                            ) : (
                                <div className="text-[11px] text-muted-foreground">—</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Plans by Day */}
            {workoutPlans.length > 0 && (
                <div className="space-y-3">
                    {plansByDay
                        .filter(({ plan }) => plan)
                        .map(({ day, plan }) => (
                            <div key={day} className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                                <div className="p-4 border-b border-border font-medium">{day}</div>
                                <div className="p-4 space-y-3">
                                    {/* Exercises */}
                                    <div className="space-y-2">
                                        {plan!.exercises.map((exercise, idx) => (
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

                                    {/* Plan Notes */}
                                    {plan!.notes && (
                                        <p className="text-xs text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
                                            {plan!.notes}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleEdit(plan!)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan!.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {workoutPlans.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No workouts planned yet. Create your first workout!</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingItem ? "Edit Workout Plan" : "Add Workout Plan"}
                        </h3>

                        <div className="space-y-4">
                            {/* Day Selection */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Day of Week</label>
                                <select
                                    value={dayOfWeek}
                                    onChange={(e) => setDayOfWeek(e.target.value as typeof DAYS[number])}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {DAYS.map(day => (
                                        <option key={day} value={day}>{day}</option>
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
                                                    {exercise.weight && <span>{exercise.weight}</span>}
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
                                        type="text"
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

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Workout Notes (optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g., Remember to stretch before and after"
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
                                    {editingItem ? "Save Changes" : "Add Workout"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

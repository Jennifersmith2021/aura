"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { RoutineStep } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, Save, Edit2, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";

export function RoutineBuilder() {
    const { routines, items, addRoutine, removeRoutine, updateRoutine } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newRoutineName, setNewRoutineName] = useState("");
    const [steps, setSteps] = useState<RoutineStep[]>([]);

    const makeupItems = items.filter((i) => i.type === "makeup");

    const handleAddStep = () => {
        setSteps([
            ...steps,
            { id: uuidv4(), description: "", productId: undefined },
        ]);
    };

    const updateStep = (id: string, field: keyof RoutineStep, value: string) => {
        setSteps(
            steps.map((s) => (s.id === id ? { ...s, [field]: value } : s))
        );
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter((s) => s.id !== id));
    };

    const moveStep = (index: number, direction: "up" | "down") => {
        const newSteps = [...steps];
        if (direction === "up" && index > 0) {
            [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
        } else if (direction === "down" && index < newSteps.length - 1) {
            [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
        }
        setSteps(newSteps);
    };

    const handleSave = () => {
        if (!newRoutineName.trim()) return;

        const routineData = {
            id: editingId || uuidv4(),
            name: newRoutineName,
            steps,
        };

        if (editingId) {
            updateRoutine(routineData);
        } else {
            addRoutine(routineData);
        }

        setIsCreating(false);
        setEditingId(null);
        setNewRoutineName("");
        setSteps([]);
    };

    const handleEdit = (routine: any) => {
        setEditingId(routine.id);
        setNewRoutineName(routine.name);
        setSteps(routine.steps);
        setIsCreating(true);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingId(null);
        setNewRoutineName("");
        setSteps([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">My Routines</h2>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 text-sm text-primary font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Routine
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Routine Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Morning Glow"
                            className="w-full mt-1 bg-muted/50 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            value={newRoutineName}
                            onChange={(e) => setNewRoutineName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Steps</label>
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex gap-2 items-start">
                                <div className="flex-shrink-0 w-6 h-8 flex items-center justify-center text-xs text-muted-foreground font-medium">
                                    {index + 1}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Step description (e.g. Cleanse)"
                                        className="w-full bg-muted/50 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={step.description}
                                        onChange={(e) => updateStep(step.id, "description", e.target.value)}
                                    />
                                    <select
                                        className="w-full bg-muted/50 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={step.productId || ""}
                                        onChange={(e) => updateStep(step.id, "productId", e.target.value)}
                                    >
                                        <option value="">Select Product (Optional)</option>
                                        {makeupItems.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveStep(index, "up")}
                                        disabled={index === 0}
                                        className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
                                    >
                                        <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => moveStep(index, "down")}
                                        disabled={index === steps.length - 1}
                                        className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
                                    >
                                        <ArrowDown className="w-3 h-3" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeStep(step.id)}
                                    className="p-2 text-muted-foreground hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleAddStep}
                            className="w-full py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                        >
                            + Add Step
                        </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!newRoutineName.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 dark:bg-white dark:text-slate-900"
                        >
                            <Save className="w-4 h-4" />
                            {editingId ? "Update Routine" : "Save Routine"}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {routines.map((routine) => (
                    <div
                        key={routine.id}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{routine.name}</h3>
                            <button
                                onClick={() => removeRoutine(routine.id)}
                                className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleEdit(routine)}
                                className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3 relative pl-4 border-l border-border">
                            {routine.steps.map((step) => {
                                const product = items.find((i) => i.id === step.productId);
                                return (
                                    <div key={step.id} className="relative">
                                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-border" />
                                        <p className="text-sm font-medium">{step.description}</p>
                                        {product && (
                                            <div className="flex items-center gap-2 mt-1 bg-muted/50 p-1.5 rounded-md w-fit">
                                                {product.image && (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-sm object-cover"
                                                    />
                                                )}
                                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                    {product.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {routines.length === 0 && !isCreating && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <p>No routines yet.</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="text-primary text-sm font-medium mt-2"
                        >
                            Create your first routine
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

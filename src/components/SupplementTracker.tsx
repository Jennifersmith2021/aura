"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Plus, Trash2, Edit2, Pill } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

export function SupplementTracker() {
    const { supplements, addSupplement, removeSupplement, updateSupplement } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditingId, setIsEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState<"vitamin" | "mineral" | "herb" | "protein" | "other">("vitamin");
    const [dosage, setDosage] = useState("");
    const [unit, setUnit] = useState<"mg" | "mcg" | "ml" | "tablet" | "capsule" | "g">("mg");
    const [notes, setNotes] = useState("");

    const editingItem = isEditingId ? supplements.find(s => s.id === isEditingId) : null;

    const handleSubmit = async () => {
        if (!name.trim() || !dosage.trim()) return;

        if (editingItem) {
            await updateSupplement(editingItem.id, {
                name,
                type,
                dosage: parseInt(dosage),
                unit,
                notes: notes || undefined,
                lastTaken: editingItem.lastTaken
            });
            setIsEditingId(null);
        } else {
            await addSupplement({
                name,
                type,
                dosage: parseInt(dosage),
                unit,
                notes: notes || undefined,
                date: Date.now()
            });
        }

        // Reset form
        setName("");
        setType("vitamin");
        setDosage("");
        setUnit("mg");
        setNotes("");
        setIsAddModalOpen(false);
    };

    const handleEdit = (supplement: typeof supplements[0]) => {
        setName(supplement.name);
        setType(supplement.type);
        setDosage(supplement.dosage.toString());
        setUnit(supplement.unit);
        setNotes(supplement.notes || "");
        setIsEditingId(supplement.id);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this supplement?")) {
            await removeSupplement(id);
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsEditingId(null);
        setName("");
        setType("vitamin");
        setDosage("");
        setUnit("mg");
        setNotes("");
    };

    const supplementsByType = {
        vitamin: supplements.filter(s => s.type === "vitamin"),
        mineral: supplements.filter(s => s.type === "mineral"),
        herb: supplements.filter(s => s.type === "herb"),
        protein: supplements.filter(s => s.type === "protein"),
        other: supplements.filter(s => s.type === "other")
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "vitamin": return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300";
            case "mineral": return "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-300";
            case "herb": return "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-700 dark:text-green-300";
            case "protein": return "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-300";
            default: return "bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Supplement Tracker
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

            {/* Total Count */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                <div className="text-3xl font-bold text-primary mb-1">{supplements.length}</div>
                <div className="text-xs text-muted-foreground">Active Supplements</div>
            </div>

            {/* By Type Sections */}
            <div className="space-y-4">
                {Object.entries(supplementsByType).map(([typeKey, items]) => (
                    items.length > 0 && (
                        <div key={typeKey} className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                            <div className={clsx("p-4 border-b border-border font-medium capitalize", getTypeColor(typeKey))}>
                                {typeKey} ({items.length})
                            </div>
                            <div className="divide-y divide-border">
                                {items.map((supplement) => (
                                    <div key={supplement.id} className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold break-words">{supplement.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {supplement.dosage} {supplement.unit}
                                            </p>
                                            {supplement.notes && (
                                                <p className="text-xs text-muted-foreground mt-2 italic">{supplement.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEdit(supplement)}
                                                className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-foreground"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supplement.id)}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            {supplements.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No supplements tracked yet. Add one to get started!</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingItem ? "Edit Supplement" : "Add Supplement"}
                        </h3>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Vitamin D3"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as typeof type)}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="vitamin">Vitamin</option>
                                    <option value="mineral">Mineral</option>
                                    <option value="herb">Herb</option>
                                    <option value="protein">Protein</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Dosage */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Amount</label>
                                    <input
                                        type="number"
                                        value={dosage}
                                        onChange={(e) => setDosage(e.target.value)}
                                        placeholder="e.g., 1000"
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1">Unit</label>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value as typeof unit)}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="mg">mg</option>
                                        <option value="mcg">mcg</option>
                                        <option value="ml">ml</option>
                                        <option value="tablet">tablet</option>
                                        <option value="capsule">capsule</option>
                                        <option value="g">g</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Notes (optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g., Take with food"
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
                                    disabled={!name.trim() || !dosage.trim()}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {editingItem ? "Save Changes" : "Add Supplement"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { ToyItem } from "@/types";
import { Package, Plus, Trash2, Edit3, Sparkles, Calendar, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function ToyCollectionManager() {
    const { toyCollection, addToy, removeToy, updateToy, logToyCleaning } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingToy, setEditingToy] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [material, setMaterial] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [cleaningFrequency, setCleaningFrequency] = useState("");
    const [note, setNote] = useState("");
    const [photo, setPhoto] = useState("");

    const resetForm = () => {
        setName("");
        setType("");
        setMaterial("");
        setPurchaseDate("");
        setCleaningFrequency("");
        setNote("");
        setPhoto("");
        setEditingToy(null);
    };

    const handleAdd = () => {
        const toy = {
            id: crypto.randomUUID(),
            name: name.trim(),
            type: type.trim(),
            material: material.trim() || undefined,
            purchaseDate: purchaseDate ? new Date(purchaseDate).getTime() : undefined,
            cleaningFrequencyDays: cleaningFrequency ? parseInt(cleaningFrequency) : undefined,
            photo: photo.trim() || undefined,
            note: note.trim() || undefined,
        };
        addToy(toy);
        resetForm();
        setShowAddModal(false);
    };

    const handleEdit = (toyId: string) => {
        const toy = toyCollection.find((t) => t.id === toyId);
        if (!toy) return;

        setName(toy.name);
        setType(toy.type);
        setMaterial(toy.material || "");
        setPurchaseDate(toy.purchaseDate ? new Date(toy.purchaseDate).toISOString().split("T")[0] : "");
        setCleaningFrequency(toy.cleaningFrequencyDays?.toString() || "");
        setNote(toy.note || "");
        setPhoto(toy.photo || "");
        setEditingToy(toyId);
        setShowAddModal(true);
    };

    const handleUpdate = () => {
        if (!editingToy) return;

        updateToy(editingToy, {
            name: name.trim(),
            type: type.trim(),
            material: material.trim() || undefined,
            purchaseDate: purchaseDate ? new Date(purchaseDate).getTime() : undefined,
            cleaningFrequencyDays: cleaningFrequency ? parseInt(cleaningFrequency) : undefined,
            photo: photo.trim() || undefined,
            note: note.trim() || undefined,
        });
        resetForm();
        setShowAddModal(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Check if cleaning is due
    const [now] = useState(() => Date.now());
    const isCleaningDue = (toy: Partial<ToyItem>) => {
        if (!toy.lastCleaning || !toy.cleaningFrequencyDays) return false;
        const daysSince = (now - toy.lastCleaning) / (1000 * 60 * 60 * 24);
        return daysSince >= toy.cleaningFrequencyDays;
    };

    const daysUntilCleaning = (toy: Partial<ToyItem>) => {
        if (!toy.lastCleaning || !toy.cleaningFrequencyDays) return null;
        const daysSince = (now - toy.lastCleaning) / (1000 * 60 * 60 * 24);
        return Math.max(0, Math.ceil(toy.cleaningFrequencyDays - daysSince));
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-400" />
                    Toy Collection
                </h3>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Collection Grid */}
            {toyCollection.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/80 font-medium text-sm">No items in collection yet</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {toyCollection.map((toy) => (
                        <div
                            key={toy.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-colors"
                        >
                            <div className="flex gap-3">
                                {/* Photo */}
                                {toy.photo ? (
                                    <img
                                        src={toy.photo}
                                        alt={toy.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Package className="w-8 h-8 text-purple-400" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white mb-1">{toy.name}</h4>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">
                                            {toy.type}
                                        </span>
                                        {toy.material && (
                                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300">
                                                {toy.material}
                                            </span>
                                        )}
                                        {toy.purchaseDate && (
                                            <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(toy.purchaseDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Cleaning Status */}
                                    {toy.cleaningFrequencyDays && (
                                        <div className="mb-2">
                                            {isCleaningDue(toy) ? (
                                                <div className="flex items-center gap-1.5 text-xs text-red-400">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Cleaning due!
                                                </div>
                                            ) : toy.lastCleaning ? (
                                                <div className="flex items-center gap-1.5 text-xs text-green-400">
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    Clean · Next in {daysUntilCleaning(toy)} days
                                                </div>
                                            ) : (
                                                <div className="text-xs text-white/90 font-medium">
                                                    Clean every {toy.cleaningFrequencyDays} days
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {toy.note && <p className="text-xs text-white/90 font-medium mb-2">{toy.note}</p>}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {toy.cleaningFrequencyDays && (
                                            <button
                                                onClick={() => logToyCleaning(toy.id)}
                                                className="px-2 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors flex items-center gap-1"
                                            >
                                                <Sparkles className="w-3 h-3" />
                                                Log Cleaning
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(toy.id)}
                                            className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors flex items-center gap-1"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => removeToy(toy.id)}
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

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowAddModal(false);
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
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-purple-400" />
                                    {editingToy ? "Edit Item" : "Add Item"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Magic Wand"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type *</label>
                                    <input
                                        type="text"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        placeholder="e.g., Vibrator, Dildo, Plug, Restraint..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Material */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Material</label>
                                    <input
                                        type="text"
                                        value={material}
                                        onChange={(e) => setMaterial(e.target.value)}
                                        placeholder="e.g., Silicone, Glass, Metal..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Purchase Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Purchase Date</label>
                                    <input
                                        type="date"
                                        value={purchaseDate}
                                        onChange={(e) => setPurchaseDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Cleaning Frequency */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cleaning Frequency (days)</label>
                                    <input
                                        type="number"
                                        value={cleaningFrequency}
                                        onChange={(e) => setCleaningFrequency(e.target.value)}
                                        placeholder="e.g., 7 for weekly"
                                        min="1"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
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
                                    {photo && (
                                        <img src={photo} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                                    )}
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Note</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Any notes or details..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={editingToy ? handleUpdate : handleAdd}
                                        disabled={!name.trim() || !type.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editingToy ? "Update" : "Add"}
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

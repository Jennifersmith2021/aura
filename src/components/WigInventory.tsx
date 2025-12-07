"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { User, Plus, Trash2, Edit3, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function WigInventory() {
    const { wigCollection, addWig, removeWig, updateWig } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingWig, setEditingWig] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [color, setColor] = useState("");
    const [length, setLength] = useState("");
    const [style, setStyle] = useState("");
    const [material, setMaterial] = useState("synthetic");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [cost, setCost] = useState("");
    const [capSize, setCapSize] = useState("average");
    const [photo, setPhoto] = useState("");
    const [note, setNote] = useState("");

    const resetForm = () => {
        setName("");
        setBrand("");
        setColor("");
        setLength("");
        setStyle("");
        setMaterial("synthetic");
        setPurchaseDate("");
        setCost("");
        setCapSize("average");
        setPhoto("");
        setNote("");
        setEditingWig(null);
    };

    const handleAdd = () => {
        const wig = {
            id: crypto.randomUUID(),
            name: name.trim(),
            brand: brand.trim() || undefined,
            color: color.trim(),
            length: length.trim(),
            style: style.trim(),
            material,
            purchaseDate: purchaseDate ? new Date(purchaseDate).getTime() : undefined,
            cost: cost ? parseFloat(cost) : undefined,
            capSize: capSize,
            photo: photo.trim() || undefined,
            note: note.trim() || undefined,
        };
        addWig(wig);
        resetForm();
        setShowAddModal(false);
    };

    const handleEdit = (wigId: string) => {
        const wig = wigCollection.find((w) => w.id === wigId);
        if (!wig) return;

        setName(wig.name);
        setBrand(wig.brand || "");
        setColor(wig.color);
        setLength(wig.length);
        setStyle(wig.style);
        setMaterial(wig.material);
        setPurchaseDate(wig.purchaseDate ? new Date(wig.purchaseDate).toISOString().split("T")[0] : "");
        setCost(wig.cost?.toString() || "");
        setCapSize(wig.capSize || "average");
        setPhoto(wig.photo || "");
        setNote(wig.note || "");
        setEditingWig(wigId);
        setShowAddModal(true);
    };

    const handleUpdate = () => {
        if (!editingWig) return;

        updateWig(editingWig, {
            name: name.trim(),
            brand: brand.trim() || undefined,
            color: color.trim(),
            length: length.trim(),
            style: style.trim(),
            material,
            purchaseDate: purchaseDate ? new Date(purchaseDate).getTime() : undefined,
            cost: cost ? parseFloat(cost) : undefined,
            capSize,
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

    const handleWear = (wigId: string) => {
        updateWig(wigId, { lastWorn: Date.now() });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" />
                    Wig Collection
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

            {/* Collection */}
            {wigCollection.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <User className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">No wigs in collection yet</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {wigCollection.map((wig) => (
                        <div
                            key={wig.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-colors"
                        >
                            <div className="flex gap-3">
                                {/* Photo */}
                                {wig.photo ? (
                                    <img
                                        src={wig.photo}
                                        alt={wig.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <User className="w-8 h-8 text-purple-400" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white mb-1">{wig.name}</h4>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">
                                            {wig.color}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300">
                                            {wig.length}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-300">
                                            {wig.style}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                                            {wig.material}
                                        </span>
                                    </div>
                                    {wig.brand && <p className="text-xs text-white/50 mb-1">{wig.brand}</p>}
                                    {wig.lastWorn && (
                                        <p className="text-xs text-white/40 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Last worn: {new Date(wig.lastWorn).toLocaleDateString()}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleWear(wig.id)}
                                            className="px-2 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors"
                                        >
                                            Wore Today
                                        </button>
                                        <button
                                            onClick={() => handleEdit(wig.id)}
                                            className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors flex items-center gap-1"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => removeWig(wig.id)}
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
                                    <User className="w-5 h-5 text-purple-400" />
                                    {editingWig ? "Edit Wig" : "Add Wig"}
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
                                        placeholder="e.g., Long Blonde Wavy"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Color */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Color *</label>
                                        <input
                                            type="text"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            placeholder="Blonde, Brown..."
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* Length */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Length *</label>
                                        <input
                                            type="text"
                                            value={length}
                                            onChange={(e) => setLength(e.target.value)}
                                            placeholder="Long, Short..."
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Style */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Style *</label>
                                        <input
                                            type="text"
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            placeholder="Wavy, Straight..."
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* Material */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Material *</label>
                                        <select
                                            value={material}
                                            onChange={(e) => setMaterial(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="synthetic">Synthetic</option>
                                            <option value="human hair">Human Hair</option>
                                            <option value="blend">Blend</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Brand */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Brand</label>
                                    <input
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="e.g., Jon Renau, Raquel Welch..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
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

                                    {/* Cost */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Cost ($)</label>
                                        <input
                                            type="number"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Cap Size */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cap Size</label>
                                    <select
                                        value={capSize}
                                        onChange={(e) => setCapSize(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="petite">Petite</option>
                                        <option value="average">Average</option>
                                        <option value="large">Large</option>
                                    </select>
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
                                        placeholder="Care instructions, styling tips..."
                                        rows={2}
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
                                        onClick={editingWig ? handleUpdate : handleAdd}
                                        disabled={!name.trim() || !color.trim() || !length.trim() || !style.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editingWig ? "Update" : "Add"}
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

"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Scissors, Plus, Trash2, Edit3, X, Star, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function HairStyleGallery() {
    const { hairStyles, addHairStyle, removeHairStyle, updateHairStyle } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStyle, setEditingStyle] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [photo, setPhoto] = useState("");
    const [stylist, setStylist] = useState("");
    const [salon, setSalon] = useState("");
    const [cost, setCost] = useState("");
    const [products, setProducts] = useState("");
    const [duration, setDuration] = useState("");
    const [rating, setRating] = useState<number | undefined>(5);
    const [note, setNote] = useState("");

    const resetForm = () => {
        setName("");
        setDate(new Date().toISOString().split("T")[0]);
        setPhoto("");
        setStylist("");
        setSalon("");
        setCost("");
        setProducts("");
        setDuration("");
        setRating(5);
        setNote("");
        setEditingStyle(null);
    };

    const handleAdd = () => {
        const style = {
            id: crypto.randomUUID(),
            name: name.trim(),
            date: new Date(date).getTime(),
            photo: photo.trim() || undefined,
            stylist: stylist.trim() || undefined,
            salon: salon.trim() || undefined,
            cost: cost ? parseFloat(cost) : undefined,
            products: products
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean),
            duration: duration.trim() ? parseInt(duration) : undefined,
            rating,
            note: note.trim() || undefined,
        };
        addHairStyle(style);
        resetForm();
        setShowAddModal(false);
    };

    const handleEdit = (styleId: string) => {
        const style = hairStyles.find((s) => s.id === styleId);
        if (!style) return;

        setName(style.name);
        setDate(new Date(style.date).toISOString().split("T")[0]);
        setPhoto(style.photo || "");
        setStylist(style.stylist || "");
        setSalon(style.salon || "");
        setCost(style.cost?.toString() || "");
        setProducts(style.products?.join(", ") || "");
        setDuration(style.duration?.toString() || "");
        setRating(style.rating ?? 5);
        setNote(style.note || "");
        setEditingStyle(styleId);
        setShowAddModal(true);
    };

    const handleUpdate = () => {
        if (!editingStyle) return;

        updateHairStyle(editingStyle, {
            name: name.trim(),
            date: new Date(date).getTime(),
            photo: photo.trim() || undefined,
            stylist: stylist.trim() || undefined,
            salon: salon.trim() || undefined,
            cost: cost ? parseFloat(cost) : undefined,
            products: products
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean),
            duration: duration.trim() ? parseInt(duration) : undefined,
            rating,
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

    // Sort by date descending
    const sortedStyles = [...hairStyles].sort((a, b) => b.date - a.date);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-pink-400" />
                    Hair Style Gallery
                </h3>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Gallery */}
            {sortedStyles.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <Scissors className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/80 font-medium text-sm">No hair styles recorded yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedStyles.map((style) => (
                        <div
                            key={style.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-pink-500/50 transition-colors"
                        >
                            <div className="flex gap-4">
                                {/* Photo */}
                                {style.photo ? (
                                    <img
                                        src={style.photo}
                                        alt={style.name}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                        <Scissors className="w-10 h-10 text-pink-400" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-white mb-1">{style.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(style.date).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={clsx(
                                                        "w-4 h-4",
                                                        star <= (style.rating ?? 0)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-white/90 font-medium"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stylist/Salon */}
                                    {(style.stylist || style.salon) && (
                                        <p className="text-xs text-white/60 mb-2">
                                            {style.stylist && <span>{style.stylist}</span>}
                                            {style.stylist && style.salon && <span> · </span>}
                                            {style.salon && <span>{style.salon}</span>}
                                        </p>
                                    )}

                                    {/* Products */}
                                    {style.products && style.products.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {style.products.map((product, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-300"
                                                >
                                                    {product}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Duration & Cost */}
                                    <div className="flex gap-4 mb-2 text-xs text-white/90 font-medium">
                                        {style.duration && <span>Lasted {style.duration} days</span>}
                                        {style.cost && <span>${style.cost.toFixed(2)}</span>}
                                    </div>

                                    {/* Note */}
                                    {style.note && (
                                        <p className="text-sm text-white/70 mb-2 line-clamp-2">{style.note}</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(style.id)}
                                            className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors flex items-center gap-1"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => removeHairStyle(style.id)}
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
                                    <Scissors className="w-5 h-5 text-pink-400" />
                                    {editingStyle ? "Edit Hair Style" : "Add Hair Style"}
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
                                    <label className="block text-sm font-medium mb-2">Style Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Balayage & Trim"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                    />
                                    {photo && (
                                        <img src={photo} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Stylist */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Stylist</label>
                                        <input
                                            type="text"
                                            value={stylist}
                                            onChange={(e) => setStylist(e.target.value)}
                                            placeholder="Name"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>

                                    {/* Salon */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Salon</label>
                                        <input
                                            type="text"
                                            value={salon}
                                            onChange={(e) => setSalon(e.target.value)}
                                            placeholder="Name"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
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
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Duration (days)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            placeholder="e.g., 14"
                                            min="0"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>
                                </div>

                                {/* Products */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Products Used</label>
                                    <input
                                        type="text"
                                        value={products}
                                        onChange={(e) => setProducts(e.target.value)}
                                        placeholder="Separate with commas: Olaplex, Wella..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                type="button"
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={clsx(
                                                        "w-8 h-8 transition-colors",
                                                        star <= (rating ?? 0)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-white/90 hover:text-white/70 font-medium"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Note</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="How did it turn out? Would you do it again?"
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
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
                                        onClick={editingStyle ? handleUpdate : handleAdd}
                                        disabled={!name.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editingStyle ? "Update" : "Add"}
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

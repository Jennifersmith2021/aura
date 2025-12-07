"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, Trash2, Calendar, TrendingUp, Image as ImageIcon, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { get, set } from "idb-keyval";

interface ProgressPhoto {
    id: string;
    photo: string; // Base64
    date: number;
    title?: string;
    notes?: string;
    category: "front" | "side" | "back" | "outfit" | "makeup" | "hair" | "milestone";
    tags?: string[];
}

const categoryLabels = {
    front: "Front View",
    side: "Side View",
    back: "Back View",
    outfit: "Outfit",
    makeup: "Makeup",
    hair: "Hair",
    milestone: "Milestone",
};

const categoryIcons = {
    front: "📸",
    side: "↔️",
    back: "🔄",
    outfit: "👗",
    makeup: "💄",
    hair: "💇",
    milestone: "🏆",
};

export default function ProgressPhotoGallery() {
    const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Form state
    const [photo, setPhoto] = useState<string>("");
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState<ProgressPhoto["category"]>("front");

    useEffect(() => {
        get<ProgressPhoto[]>("progressPhotos").then((stored) => {
            if (stored) setPhotos(stored.sort((a, b) => b.date - a.date));
        });
    }, []);

    const persistPhotos = useCallback((updated: ProgressPhoto[]) => {
        const sorted = updated.sort((a, b) => b.date - a.date);
        setPhotos(sorted);
        set("progressPhotos", sorted);
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const addPhoto = () => {
        if (!photo) return;

        const newPhoto: ProgressPhoto = {
            id: crypto.randomUUID(),
            photo,
            date: Date.now(),
            title: title.trim() || undefined,
            notes: notes.trim() || undefined,
            category,
        };

        persistPhotos([newPhoto, ...photos]);
        resetForm();
        setShowAddModal(false);
    };

    const removePhoto = (id: string) => {
        persistPhotos(photos.filter((p) => p.id !== id));
        if (selectedPhoto?.id === id) setSelectedPhoto(null);
    };

    const resetForm = () => {
        setPhoto("");
        setTitle("");
        setNotes("");
        setCategory("front");
    };

    const downloadPhoto = (photo: ProgressPhoto) => {
        const link = document.createElement("a");
        link.href = photo.photo;
        link.download = `progress-${new Date(photo.date).toISOString().split("T")[0]}.jpg`;
        link.click();
    };

    const filteredPhotos = selectedCategory === "all"
        ? photos
        : photos.filter((p) => p.category === selectedCategory);

    const categories = ["all", ...Object.keys(categoryLabels)];

    // Stats
    const totalPhotos = photos.length;
    const thisMonth = photos.filter((p) => {
        const photoDate = new Date(p.date);
        const now = new Date();
        return photoDate.getMonth() === now.getMonth() && photoDate.getFullYear() === now.getFullYear();
    }).length;

    const oldestPhoto = photos.length > 0 ? photos[photos.length - 1] : null;
    const daysSinceStart = oldestPhoto
        ? Math.floor((Date.now() - oldestPhoto.date) / (24 * 60 * 60 * 1000))
        : 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-400" />
                    Progress Gallery
                </h3>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center gap-1"
                >
                    <Camera className="w-4 h-4" />
                    Add Photo
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Total</span>
                    </div>
                    <div className="text-2xl font-bold">{totalPhotos}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-3 border border-purple-500/20">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">This Month</span>
                    </div>
                    <div className="text-2xl font-bold">{thisMonth}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-3 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Journey</span>
                    </div>
                    <div className="text-2xl font-bold">{daysSinceStart}</div>
                    <div className="text-xs text-white/50">days</div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1",
                            selectedCategory === cat
                                ? "bg-blue-500 text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        {cat === "all" ? "📷" : categoryIcons[cat as keyof typeof categoryIcons]}
                        {cat === "all" ? "All" : categoryLabels[cat as keyof typeof categoryLabels]}
                    </button>
                ))}
            </div>

            {/* Photo Grid */}
            {filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {filteredPhotos.map((photo) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setSelectedPhoto(photo)}
                            className="relative rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-blue-500/50 transition-all group"
                        >
                            <img
                                src={photo.photo}
                                alt={photo.title || "Progress photo"}
                                className="w-full aspect-square object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    {photo.title && (
                                        <div className="text-sm font-semibold text-white mb-1">{photo.title}</div>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-white/90">
                                        <span>{categoryIcons[photo.category]} {categoryLabels[photo.category]}</span>
                                        <span>{new Date(photo.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <Camera className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/50 text-sm mb-4">No progress photos yet</p>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        Add Your First Photo
                    </button>
                </div>
            )}

            {/* Add Photo Modal */}
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
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-blue-400" />
                                Add Progress Photo
                            </h3>

                            <div className="space-y-4">
                                {/* Photo Upload */}
                                {!photo ? (
                                    <label className="block">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                        <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-all">
                                            <Camera className="w-8 h-8 text-white/40 mx-auto mb-2" />
                                            <p className="text-white/60 text-sm">Click to upload photo</p>
                                        </div>
                                    </label>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img src={photo} alt="Preview" className="w-full h-48 object-cover" />
                                        <button
                                            onClick={() => setPhoto("")}
                                            className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., 3 Month Progress"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={clsx(
                                                    "px-2 py-2 rounded-lg text-xs transition-colors",
                                                    category === cat
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                <div className="text-lg mb-0.5">{categoryIcons[cat]}</div>
                                                <div className="text-[10px]">{categoryLabels[cat].split(" ")[0]}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="How are you feeling? What changed?"
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                                        onClick={addPhoto}
                                        disabled={!photo}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Photo
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Photo Detail Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-2xl w-full"
                        >
                            <div className="relative rounded-2xl overflow-hidden border border-white/20 mb-4">
                                <img
                                    src={selectedPhoto.photo}
                                    alt={selectedPhoto.title || "Progress photo"}
                                    className="w-full h-auto max-h-[70vh] object-contain bg-black"
                                />
                            </div>
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
                                {selectedPhoto.title && (
                                    <h4 className="text-lg font-semibold mb-2">{selectedPhoto.title}</h4>
                                )}
                                <div className="flex items-center gap-3 text-sm text-white/60 mb-3">
                                    <span className="flex items-center gap-1">
                                        {categoryIcons[selectedPhoto.category]} {categoryLabels[selectedPhoto.category]}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(selectedPhoto.date).toLocaleDateString()}
                                    </span>
                                </div>
                                {selectedPhoto.notes && (
                                    <p className="text-sm text-white/70 mb-4">{selectedPhoto.notes}</p>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => downloadPhoto(selectedPhoto)}
                                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => {
                                            removePhoto(selectedPhoto.id);
                                            setSelectedPhoto(null);
                                        }}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
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

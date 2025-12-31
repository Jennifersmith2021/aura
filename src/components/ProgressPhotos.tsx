"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { Camera, Trash2, Calendar, Image as ImageIcon, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ProgressPhoto {
    id: string;
    imageUrl: string;
    category: string;
    notes?: string;
    date: string; // ISO string
}

export default function ProgressPhotos() {
    const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [compareMode, setCompareMode] = useState(false);
    const [comparePhotos, setComparePhotos] = useState<string[]>([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newPhoto, setNewPhoto] = useState({
        category: "body",
        notes: "",
        imageUrl: "",
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const saved = localStorage.getItem("progressPhotos");
            if (saved) {
                const parsed = JSON.parse(saved) as ProgressPhoto[];
                setPhotos(Array.isArray(parsed) ? parsed : []);
            }
        } catch (err) {
            console.error("Failed to load progress photos", err);
            setPhotos([]);
        }
    }, []);

    const persistPhotos = (updated: ProgressPhoto[]) => {
        setPhotos(updated);
        if (typeof window !== "undefined") {
            localStorage.setItem("progressPhotos", JSON.stringify(updated));
        }
    };

    const categories = ["body", "face", "makeup", "outfit", "hair", "other"];

    const filteredPhotos = selectedCategory === "all"
        ? photos
        : photos.filter((p) => p.category === selectedCategory);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPhoto({ ...newPhoto, imageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (newPhoto.imageUrl) {
            const entry: ProgressPhoto = {
                id: `photo-${Date.now()}`,
                imageUrl: newPhoto.imageUrl,
                category: newPhoto.category,
                notes: newPhoto.notes || undefined,
                date: new Date().toISOString(),
            };
            persistPhotos([...photos, entry]);
            setNewPhoto({ category: "body", notes: "", imageUrl: "" });
            setShowUploadForm(false);
        }
    };

    const toggleComparePhoto = (photoId: string) => {
        if (comparePhotos.includes(photoId)) {
            setComparePhotos(comparePhotos.filter((id) => id !== photoId));
        } else if (comparePhotos.length < 2) {
            setComparePhotos([...comparePhotos, photoId]);
        }
    };

    const sortedPhotos = [...filteredPhotos].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Progress Photos</h2>
                    <p className="text-sm text-muted-foreground">Track your transformation journey</p>
                </div>
                <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                    <Camera className="w-5 h-5" />
                </button>
            </div>

            {/* Upload Form */}
            <AnimatePresence>
                {showUploadForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4 overflow-hidden"
                    >
                        <h3 className="font-bold text-base text-foreground">Upload Progress Photo</h3>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Photo
                            </label>
                            <div className="relative">
                                {newPhoto.imageUrl ? (
                                    <div className="relative">
                                        <img
                                            src={newPhoto.imageUrl}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => setNewPhoto({ ...newPhoto, imageUrl: "" })}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                                        <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground font-medium">Click to upload photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Category
                            </label>
                            <select
                                value={newPhoto.category}
                                onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Notes (optional)
                            </label>
                            <textarea
                                value={newPhoto.notes}
                                onChange={(e) => setNewPhoto({ ...newPhoto, notes: e.target.value })}
                                placeholder="Add notes about this photo..."
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSubmit}
                                disabled={!newPhoto.imageUrl}
                                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Photo
                            </button>
                            <button
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setNewPhoto({ category: "body", notes: "", imageUrl: "" });
                                }}
                                className="px-4 py-2.5 bg-secondary text-foreground rounded-xl font-semibold text-sm hover:bg-accent transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-foreground">{photos.length}</div>
                    <div className="text-xs text-muted-foreground font-medium">Total Photos</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-foreground">
                                                {photos.length > 0
                            ? Math.floor(
                                  (new Date().getTime() -
                                                                            new Date(photos[photos.length - 1].date).getTime()) /
                                      (1000 * 60 * 60 * 24)
                              )
                            : 0}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Days Tracking</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-foreground">
                        {photos.length > 0
                            ? new Date(photos[0].date).toLocaleDateString("en-US", { month: "short" })
                            : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Latest</div>
                </div>
            </div>

            {/* Compare Mode Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                            selectedCategory === "all"
                                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                                : "bg-secondary text-foreground hover:bg-accent"
                        )}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                                selectedCategory === cat
                                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                                    : "bg-secondary text-foreground hover:bg-accent"
                            )}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => {
                        setCompareMode(!compareMode);
                        setComparePhotos([]);
                    }}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                        compareMode
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    <ArrowLeftRight className="w-4 h-4" />
                    Compare
                </button>
            </div>

            {/* Compare View */}
            {compareMode && comparePhotos.length === 2 && (
                <div className="grid grid-cols-2 gap-3">
                    {comparePhotos.map((photoId) => {
                        const photo = photos.find((p) => p.id === photoId);
                        if (!photo) return null;
                        return (
                            <div key={photoId} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                <img src={photo.imageUrl} alt="Progress" className="w-full h-64 object-cover" />
                                <div className="p-3">
                                    <div className="text-xs text-muted-foreground font-medium">
                                        {new Date(photo.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-purple-400 mt-1 capitalize">{photo.category}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Photo Grid */}
            {sortedPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {sortedPhotos.map((photo) => (
                        <div
                            key={photo.id}
                            className={clsx(
                                "bg-white/5 rounded-xl border overflow-hidden transition-all",
                                compareMode && comparePhotos.includes(photo.id)
                                    ? "border-purple-500 ring-2 ring-purple-500"
                                    : "border-white/10"
                            )}
                        >
                            <div
                                className="relative cursor-pointer"
                                onClick={() => compareMode && toggleComparePhoto(photo.id)}
                            >
                                <img src={photo.imageUrl} alt="Progress" className="w-full h-48 object-cover" />
                                {compareMode && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div
                                            className={clsx(
                                                "w-12 h-12 rounded-full border-2 flex items-center justify-center",
                                                comparePhotos.includes(photo.id)
                                                    ? "bg-purple-500 border-purple-500"
                                                    : "border-white"
                                            )}
                                        >
                                            {comparePhotos.includes(photo.id) && (
                                                <span className="text-white font-bold">
                                                    {comparePhotos.indexOf(photo.id) + 1}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-purple-400 font-medium capitalize">{photo.category}</span>
                                    {!compareMode && (
                                        <button
                                            onClick={() => persistPhotos(photos.filter((p) => p.id !== photo.id))}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(photo.date).toLocaleDateString()}
                                </div>
                                {photo.notes && (
                                    <p className="text-xs text-muted-foreground mt-2 italic">{photo.notes}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground font-medium">No progress photos yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Start documenting your journey!</p>
                </div>
            )}
        </div>
    );
}

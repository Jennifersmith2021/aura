"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Plus, Trash2, Edit2, Heart, Play, MessageSquare } from "lucide-react";
import clsx from "clsx";

export function SissyAffirmations() {
    const { dailyAffirmations, addDailyAffirmation, removeDailyAffirmation, updateDailyAffirmation, toggleAffirmationFavorite } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditingId, setIsEditingId] = useState<string | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);

    // Form state
    const [text, setText] = useState("");
    const [category, setCategory] = useState<"sissy" | "general" | "confidence" | "body-positive">("sissy");
    const [videoUrl, setVideoUrl] = useState("");

    const editingItem = isEditingId ? dailyAffirmations.find(a => a.id === isEditingId) : null;
    const sorted = [...dailyAffirmations].sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
            return b.dateAdded - a.dateAdded;
        }
        return a.isFavorite ? -1 : 1;
    });
    const favorites = sorted.filter(a => a.isFavorite);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        if (editingItem) {
            await updateDailyAffirmation(editingItem.id, {
                text,
                category,
                videoUrl: videoUrl || undefined
            });
            setIsEditingId(null);
        } else {
            await addDailyAffirmation({
                text,
                category,
                videoUrl: videoUrl || undefined,
                dateAdded: Date.now()
            });
        }

        // Reset form
        setText("");
        setCategory("sissy");
        setVideoUrl("");
        setIsAddModalOpen(false);
    };

    const handleEdit = (affirmation: typeof dailyAffirmations[0]) => {
        setText(affirmation.text);
        setCategory(affirmation.category);
        setVideoUrl(affirmation.videoUrl || "");
        setIsEditingId(affirmation.id);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this affirmation?")) {
            await removeDailyAffirmation(id);
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsEditingId(null);
        setText("");
        setCategory("sissy");
        setVideoUrl("");
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "sissy": return "bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800";
            case "confidence": return "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800";
            case "body-positive": return "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800";
            default: return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "sissy": return "💕";
            case "confidence": return "✨";
            case "body-positive": return "🌹";
            default: return "💫";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Sissy Affirmations
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

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{dailyAffirmations.length}</div>
                    <div className="text-xs text-muted-foreground">Total Affirmations</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border text-center">
                    <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">{favorites.length}</div>
                    <div className="text-xs text-muted-foreground">Favorites</div>
                </div>
            </div>

            {/* Favorites Section */}
            {favorites.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border font-medium flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <span>Your Favorites ({favorites.length})</span>
                    </div>
                    <div className="divide-y divide-border">
                        {favorites.map((affirmation) => (
                            <div key={affirmation.id} className={clsx("p-4 hover:bg-muted/50 transition-colors", getCategoryColor(affirmation.category))}>
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl flex-shrink-0">
                                        {getCategoryIcon(affirmation.category)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm leading-relaxed font-medium break-words">{affirmation.text}</p>
                                        {affirmation.videoUrl && (
                                            <a
                                                href={affirmation.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 mt-2 text-xs text-primary hover:underline"
                                            >
                                                <Play className="w-3 h-3" />
                                                Watch Video
                                            </a>
                                        )}
                                        <div className="text-xs text-muted-foreground mt-2 capitalize">
                                            {affirmation.category.replace("-", " ")}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => toggleAffirmationFavorite(affirmation.id)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-rose-600 dark:text-rose-400"
                                            title="Remove favorite"
                                        >
                                            <Heart className="w-4 h-4 fill-current" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(affirmation)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-foreground"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(affirmation.id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Affirmations */}
            {dailyAffirmations.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border font-medium">
                        All Affirmations ({dailyAffirmations.length})
                    </div>
                    <div className="divide-y divide-border">
                        {sorted.map((affirmation) => (
                            <div key={affirmation.id} className={clsx("p-4 hover:bg-muted/50 transition-colors", getCategoryColor(affirmation.category))}>
                                <div className="flex items-start gap-3">
                                    <div className="text-xl flex-shrink-0">
                                        {getCategoryIcon(affirmation.category)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm leading-relaxed break-words">{affirmation.text}</p>
                                        {affirmation.videoUrl && (
                                            <a
                                                href={affirmation.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 mt-2 text-xs text-primary hover:underline"
                                            >
                                                <Play className="w-3 h-3" />
                                                Watch Video
                                            </a>
                                        )}
                                        <div className="text-xs text-muted-foreground mt-2 capitalize">
                                            {affirmation.category.replace("-", " ")}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => toggleAffirmationFavorite(affirmation.id)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-rose-600"
                                            title={affirmation.isFavorite ? "Remove favorite" : "Add to favorites"}
                                        >
                                            {affirmation.isFavorite ? (
                                                <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                                            ) : (
                                                <Heart className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(affirmation)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-foreground"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(affirmation.id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {dailyAffirmations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No affirmations yet. Start your transformation!</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingItem ? "Edit Affirmation" : "Add Affirmation"}
                        </h3>

                        <div className="space-y-4">
                            {/* Category */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as typeof category)}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="sissy">Sissy Training</option>
                                    <option value="confidence">Confidence</option>
                                    <option value="body-positive">Body Positive</option>
                                    <option value="general">General</option>
                                </select>
                            </div>

                            {/* Affirmation Text */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Affirmation</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Write your affirmation here..."
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24 resize-none"
                                />
                            </div>

                            {/* Video URL (optional) */}
                            <div>
                                <label className="text-sm font-medium block mb-1">Video URL (optional)</label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Link a YouTube video or training content to reinforce this affirmation</p>
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
                                    disabled={!text.trim()}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {editingItem ? "Save Changes" : "Add Affirmation"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

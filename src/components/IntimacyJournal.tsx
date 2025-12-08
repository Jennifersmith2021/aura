"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { BookHeart, Plus, Trash2, Edit3, X, Lock, Tag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function IntimacyJournal() {
    const { intimacyJournal, addIntimacyEntry, removeIntimacyEntry, updateIntimacyEntry } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<string | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
    const [filterTag, setFilterTag] = useState<string | null>(null);

    // Form state
    const [mood, setMood] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [customDate, setCustomDate] = useState("");

    const resetForm = () => {
        setMood("");
        setContent("");
        setTags("");
        setIsPrivate(false);
        setCustomDate("");
        setEditingEntry(null);
    };

    const handleAdd = () => {
        const entry = {
            id: crypto.randomUUID(),
            date: customDate ? new Date(customDate).getTime() : Date.now(),
            mood: mood.trim(),
            content: content.trim(),
            tags: tags.trim() ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
            isPrivate,
        };
        addIntimacyEntry(entry);
        resetForm();
        setShowAddModal(false);
    };

    const handleEdit = (entryId: string) => {
        const entry = intimacyJournal.find((e) => e.id === entryId);
        if (!entry) return;

        setMood(entry.mood);
        setContent(entry.content);
        setTags(entry.tags?.join(", ") || "");
        setIsPrivate(entry.isPrivate || false);
        setCustomDate(new Date(entry.date).toISOString().split("T")[0]);
        setEditingEntry(entryId);
        setShowAddModal(true);
    };

    const handleUpdate = () => {
        if (!editingEntry) return;

        updateIntimacyEntry(editingEntry, {
            mood: mood.trim(),
            content: content.trim(),
            tags: tags.trim() ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
            isPrivate,
            date: customDate ? new Date(customDate).getTime() : Date.now(),
        });
        resetForm();
        setShowAddModal(false);
    };

    // Get all unique tags
    const allTags = Array.from(
        new Set(intimacyJournal.flatMap(e => e.tags || []))
    ).sort();

    // Filter entries
    const filteredEntries = filterTag
        ? intimacyJournal.filter(e => e.tags?.includes(filterTag))
        : intimacyJournal;

    // Mood emoji mapping
    const getMoodEmoji = (mood: string) => {
        const moodLower = mood.toLowerCase();
        if (moodLower.includes("happy") || moodLower.includes("joyful")) return "😊";
        if (moodLower.includes("playful") || moodLower.includes("fun")) return "😈";
        if (moodLower.includes("needy") || moodLower.includes("desperate")) return "🥺";
        if (moodLower.includes("romantic") || moodLower.includes("love")) return "💖";
        if (moodLower.includes("excited") || moodLower.includes("eager")) return "🤩";
        if (moodLower.includes("shy") || moodLower.includes("nervous")) return "😳";
        if (moodLower.includes("satisfied") || moodLower.includes("content")) return "😌";
        if (moodLower.includes("submissive") || moodLower.includes("obedient")) return "🙇‍♀️";
        return "💭";
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookHeart className="w-5 h-5 text-pink-400" />
                    Intimacy Journal
                </h3>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Write
                </button>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterTag(null)}
                        className={clsx(
                            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                            filterTag === null
                                ? "bg-pink-500 text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        All ({intimacyJournal.length})
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setFilterTag(tag)}
                            className={clsx(
                                "px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1",
                                filterTag === tag
                                    ? "bg-pink-500 text-white"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            <Tag className="w-3 h-3" />
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Entries */}
            {filteredEntries.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <BookHeart className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/80 font-medium text-sm">
                        {filterTag ? `No entries with tag "${filterTag}"` : "No journal entries yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-pink-500/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedEntry(entry.id)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-3xl">{getMoodEmoji(entry.mood)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-white">{entry.mood}</span>
                                        {entry.isPrivate && (
                                            <Lock className="w-3.5 h-3.5 text-purple-400" />
                                        )}
                                        <span className="text-xs text-white/90 font-medium ml-auto">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/70 line-clamp-2 mb-2">
                                        {entry.content}
                                    </p>
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {entry.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-300"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Entry Modal */}
            <AnimatePresence>
                {selectedEntry && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedEntry(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {(() => {
                                const entry = intimacyJournal.find(e => e.id === selectedEntry);
                                if (!entry) return null;

                                return (
                                    <>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-4xl">{getMoodEmoji(entry.mood)}</div>
                                                <div>
                                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                                        {entry.mood}
                                                        {entry.isPrivate && (
                                                            <Lock className="w-4 h-4 text-purple-400" />
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-white/90 font-medium">
                                                        {new Date(entry.date).toLocaleDateString("en-US", {
                                                            weekday: "long",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedEntry(null)}
                                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                                            <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                                                {entry.content}
                                            </p>
                                        </div>

                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {entry.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-3 py-1 rounded-full text-xs bg-pink-500/20 text-pink-300 font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedEntry(null);
                                                    handleEdit(entry.id);
                                                }}
                                                className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    removeIntimacyEntry(entry.id);
                                                    setSelectedEntry(null);
                                                }}
                                                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                    <BookHeart className="w-5 h-5 text-pink-400" />
                                    {editingEntry ? "Edit Entry" : "New Entry"}
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
                                {/* Mood */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Mood *</label>
                                    <input
                                        type="text"
                                        value={mood}
                                        onChange={(e) => setMood(e.target.value)}
                                        placeholder="e.g., Happy, Playful, Needy, Romantic..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Entry *</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write your thoughts, feelings, experiences..."
                                        rows={8}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="e.g., fantasy, exploration, milestone"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={customDate}
                                        onChange={(e) => setCustomDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Private Toggle */}
                                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <Lock className="w-5 h-5 text-purple-400" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Extra Private</p>
                                        <p className="text-xs text-white/90 font-medium">Mark as especially sensitive</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isPrivate}
                                        onChange={(e) => setIsPrivate(e.target.checked)}
                                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
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
                                        onClick={editingEntry ? handleUpdate : handleAdd}
                                        disabled={!mood.trim() || !content.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editingEntry ? "Update" : "Save"}
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

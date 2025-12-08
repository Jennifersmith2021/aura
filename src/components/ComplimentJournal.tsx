"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Heart, Plus, Trash2, Edit3, X, Star, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const moodEmojis = {
    confident: "😎",
    happy: "😊",
    surprised: "😳",
    proud: "🥰",
    shy: "🥺",
    validated: "✨",
};

const categoryColors = {
    appearance: "bg-pink-500/20 text-pink-300",
    style: "bg-purple-500/20 text-purple-300",
    personality: "bg-blue-500/20 text-blue-300",
    skill: "bg-green-500/20 text-green-300",
    other: "bg-gray-500/20 text-gray-300",
};

export default function ComplimentJournal() {
    const { compliments, addCompliment, removeCompliment, updateCompliment, toggleComplimentFavorite } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCompliment, setEditingCompliment] = useState<string | null>(null);
    const [filterFavorites, setFilterFavorites] = useState(false);

    // Form state
    const [compliment, setCompliment] = useState("");
    const [source, setSource] = useState("");
    const [context, setContext] = useState("");
    const [outfit, setOutfit] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [mood, setMood] = useState<"confident" | "happy" | "surprised" | "proud" | "shy" | "validated">("happy");
    const [category, setCategory] = useState<"appearance" | "style" | "personality" | "skill" | "other">("appearance");
    const [note, setNote] = useState("");

    const resetForm = () => {
        setCompliment("");
        setSource("");
        setContext("");
        setOutfit("");
        setDate(new Date().toISOString().split("T")[0]);
        setMood("happy");
        setCategory("appearance");
        setNote("");
        setEditingCompliment(null);
    };

    const handleAdd = () => {
        const entry = {
            id: crypto.randomUUID(),
            date: new Date(date).getTime(),
            compliment: compliment.trim(),
            source: source.trim() || undefined,
            context: context.trim() || undefined,
            outfit: outfit.trim() || undefined,
            mood,
            category,
            favorite: false,
            note: note.trim() || undefined,
        };
        addCompliment(entry);
        resetForm();
        setShowAddModal(false);
    };

    const handleEdit = (id: string) => {
        const entry = compliments.find((c) => c.id === id);
        if (!entry) return;

        setCompliment(entry.compliment);
        setSource(entry.source || "");
        setContext(entry.context || "");
        setOutfit(entry.outfit || "");
        setDate(new Date(entry.date).toISOString().split("T")[0]);
        setMood(entry.mood);
        setCategory(entry.category || "appearance");
        setNote(entry.note || "");
        setEditingCompliment(id);
        setShowAddModal(true);
    };

    const handleUpdate = () => {
        if (!editingCompliment) return;

        updateCompliment(editingCompliment, {
            compliment: compliment.trim(),
            source: source.trim() || undefined,
            context: context.trim() || undefined,
            outfit: outfit.trim() || undefined,
            date: new Date(date).getTime(),
            mood,
            category,
            note: note.trim() || undefined,
        });
        resetForm();
        setShowAddModal(false);
    };

    // Filter compliments
    const filteredCompliments = filterFavorites
        ? compliments.filter((c) => c.favorite)
        : compliments;

    // Stats
    const [now] = useState(() => Date.now());
    const totalCompliments = compliments.length;
    const favoriteCount = compliments.filter((c) => c.favorite).length;
    const thisWeek = compliments.filter((c) => c.date > now - 7 * 24 * 60 * 60 * 1000).length;
    const mostCommonMood = compliments.length > 0
        ? Object.entries(
              compliments.reduce((acc, c) => {
                  acc[c.mood] = (acc[c.mood] || 0) + 1;
                  return acc;
              }, {} as Record<string, number>)
          ).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0]
        : null;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Compliment Journal
                </h3>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-pink-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg p-3 border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">{totalCompliments}</div>
                    <div className="text-xs text-white/60">Total</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-lg p-3 border border-pink-500/20">
                    <div className="text-2xl font-bold text-pink-400">{favoriteCount}</div>
                    <div className="text-xs text-white/60">Favorites</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-3 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{thisWeek}</div>
                    <div className="text-xs text-white/60">This Week</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                    <div className="text-2xl">{mostCommonMood ? moodEmojis[mostCommonMood as keyof typeof moodEmojis] : "—"}</div>
                    <div className="text-xs text-white/60">Common</div>
                </div>
            </div>

            {/* Filter */}
            <button
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                    filterFavorites
                        ? "bg-pink-500 text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
            >
                <Star className={clsx("w-4 h-4", filterFavorites && "fill-current")} />
                {filterFavorites ? "Showing Favorites" : "Show Favorites"}
            </button>

            {/* Compliments List */}
            {filteredCompliments.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/80 font-medium text-sm">
                        {filterFavorites ? "No favorite compliments yet" : "No compliments recorded yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredCompliments.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-yellow-500/50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{moodEmojis[entry.mood as keyof typeof moodEmojis]}</span>
                                        <button
                                            onClick={() => toggleComplimentFavorite(entry.id)}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                        >
                                            <Star
                                                className={clsx(
                                                    "w-4 h-4",
                                                    entry.favorite
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-white/80 hover:text-yellow-400 font-medium"
                                                )}
                                            />
                                        </button>
                                    </div>
                                    <blockquote className="text-white italic border-l-4 border-yellow-500/50 pl-3 mb-2">
                                        &quot;{entry.compliment}&quot;
                                    </blockquote>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-1 text-sm text-white/60 mb-2">
                                {entry.source && (
                                    <div>
                                        <span className="text-white/90 font-medium">From:</span> {entry.source}
                                    </div>
                                )}
                                {entry.context && (
                                    <div>
                                        <span className="text-white/90 font-medium">Context:</span> {entry.context}
                                    </div>
                                )}
                                {entry.outfit && (
                                    <div>
                                        <span className="text-white/90 font-medium">Wearing:</span> {entry.outfit}
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-xs text-white/90 font-medium">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(entry.date).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Category */}
                            {entry.category && (
                                <div className="mb-2">
                                    <span className={clsx("px-2 py-0.5 rounded text-xs", categoryColors[entry.category as keyof typeof categoryColors])}>
                                        {entry.category}
                                    </span>
                                </div>
                            )}

                            {/* Note */}
                            {entry.note && <p className="text-sm text-white/70 mb-2">{entry.note}</p>}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(entry.id)}
                                    className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors flex items-center gap-1"
                                >
                                    <Edit3 className="w-3 h-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => removeCompliment(entry.id)}
                                    className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Remove
                                </button>
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
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                    {editingCompliment ? "Edit Compliment" : "Add Compliment"}
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
                                {/* Compliment */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Compliment *</label>
                                    <textarea
                                        value={compliment}
                                        onChange={(e) => setCompliment(e.target.value)}
                                        placeholder="What did they say?"
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Source */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">From</label>
                                        <input
                                            type="text"
                                            value={source}
                                            onChange={(e) => setSource(e.target.value)}
                                            placeholder="Who?"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </div>
                                </div>

                                {/* Context */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Context</label>
                                    <input
                                        type="text"
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        placeholder="Where/when? (e.g., At coffee shop)"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Outfit */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">What You Were Wearing</label>
                                    <input
                                        type="text"
                                        value={outfit}
                                        onChange={(e) => setOutfit(e.target.value)}
                                        placeholder="Description of your outfit"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Mood */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">How did it make you feel?</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(moodEmojis) as Array<keyof typeof moodEmojis>).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setMood(m)}
                                                className={clsx(
                                                    "px-3 py-2 rounded-lg text-sm transition-colors",
                                                    mood === m
                                                        ? "bg-yellow-500/30 text-white border-2 border-yellow-500"
                                                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {moodEmojis[m]} {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.keys(categoryColors) as Array<keyof typeof categoryColors>).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                                    category === cat
                                                        ? categoryColors[cat] + " border-2"
                                                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {cat}
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
                                        placeholder="Any additional thoughts..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
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
                                        onClick={editingCompliment ? handleUpdate : handleAdd}
                                        disabled={!compliment.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editingCompliment ? "Update" : "Add"}
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

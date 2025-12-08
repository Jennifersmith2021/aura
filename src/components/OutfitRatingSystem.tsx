"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Star, Users, MessageSquare, ThumbsUp, Eye, Trash2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { Look } from "@/types";

interface LookRating {
    lookId: string;
    rater: string; // Name of person rating
    rating: number; // 1-5 stars
    comment?: string;
    date: number;
}

export default function OutfitRatingSystem() {
    const { looks } = useStore();
    const [ratings, setRatings] = useState<LookRating[]>([]);
    const [selectedLook, setSelectedLook] = useState<string | null>(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [raterName, setRaterName] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const handleAddRating = () => {
        if (!selectedLook || !raterName.trim()) return;

        const newRating: LookRating = {
            lookId: selectedLook,
            rater: raterName.trim(),
            rating,
            comment: comment.trim() || undefined,
            date: Date.now(),
        };

        setRatings([newRating, ...ratings]);
        
        // Reset form
        setRaterName("");
        setRating(5);
        setComment("");
        setShowRatingModal(false);
    };

    const removeRating = (lookId: string, date: number) => {
        setRatings(ratings.filter((r) => !(r.lookId === lookId && r.date === date)));
    };

    const getLookRatings = (lookId: string) => {
        return ratings.filter((r) => r.lookId === lookId);
    };

    const getAverageRating = (lookId: string) => {
        const lookRatings = getLookRatings(lookId);
        if (lookRatings.length === 0) return 0;
        const sum = lookRatings.reduce((acc, r) => acc + r.rating, 0);
        return sum / lookRatings.length;
    };

    const topRatedLooks = looks
        .map((look) => ({
            look,
            avgRating: getAverageRating(look.id),
            ratingCount: getLookRatings(look.id).length,
        }))
        .filter((item) => item.ratingCount > 0)
        .sort((a, b) => b.avgRating - a.avgRating || b.ratingCount - a.ratingCount)
        .slice(0, 5);

    const currentLook = selectedLook ? looks.find((l) => l.id === selectedLook) : null;
    const currentRatings = selectedLook ? getLookRatings(selectedLook) : [];
    const currentAvg = selectedLook ? getAverageRating(selectedLook) : 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-semibold">Outfit Ratings</h3>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-pink-500/20">
                <p className="text-sm text-white/70">
                    Get feedback on your looks from friends, partners, or anyone! Select an outfit and add their ratings and comments.
                </p>
            </div>

            {/* Top Rated Looks */}
            {topRatedLooks.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-yellow-400" />
                        Top Rated Looks
                    </h4>
                    <div className="space-y-2">
                        {topRatedLooks.map((item, idx) => (
                            <button
                                key={item.look.id}
                                onClick={() => setSelectedLook(item.look.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                                    selectedLook === item.look.id ? "bg-pink-500/20" : "hover:bg-white/5"
                                )}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{item.look.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        {item.avgRating.toFixed(1)} ({item.ratingCount} rating{item.ratingCount > 1 ? "s" : ""})
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Look Selector */}
            {looks.length > 0 ? (
                <div>
                    <label className="block text-sm font-medium mb-2">Select Outfit</label>
                    <select
                        value={selectedLook || ""}
                        onChange={(e) => setSelectedLook(e.target.value || null)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        <option value="">Choose an outfit...</option>
                        {looks.map((look) => {
                            const lookRatings = getLookRatings(look.id);
                            const avg = getAverageRating(look.id);
                            return (
                                <option key={look.id} value={look.id}>
                                    {look.name} {lookRatings.length > 0 ? `(★ ${avg.toFixed(1)})` : ""}
                                </option>
                            );
                        })}
                    </select>
                </div>
            ) : (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <Eye className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/80 font-medium text-sm">Create some looks in the Looks tab first!</p>
                </div>
            )}

            {/* Current Look Details */}
            {currentLook && (
                <div className="space-y-4">
                    {/* Look Info */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                        <h4 className="text-lg font-semibold mb-2">{currentLook.name}</h4>
                        {currentRatings.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={clsx(
                                                "w-5 h-5",
                                                star <= currentAvg
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-white/90 font-medium"
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium">
                                    {currentAvg.toFixed(1)} ({currentRatings.length} rating{currentRatings.length > 1 ? "s" : ""})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Add Rating Button */}
                    <button
                        onClick={() => setShowRatingModal(true)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Star className="w-4 h-4" />
                        Add Rating
                    </button>

                    {/* Ratings List */}
                    {currentRatings.length > 0 ? (
                        <div className="space-y-3">
                            <h5 className="text-sm font-semibold text-white/70">Ratings & Comments</h5>
                            {currentRatings.map((r) => (
                                <div key={r.date} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="font-medium">{r.rater}</div>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={clsx(
                                                            "w-4 h-4",
                                                            star <= r.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-white/90 hover:text-white/70 font-medium"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeRating(r.lookId, r.date)}
                                            className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {r.comment && (
                                        <div className="flex items-start gap-2 mt-2">
                                            <MessageSquare className="w-4 h-4 text-white/90 font-medium flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-white/90 italic">&quot;{r.comment}&quot;</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-white/90 font-medium mt-2">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(r.date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                            <Star className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/80 font-medium text-sm">No ratings yet for this look</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Rating Modal */}
            <AnimatePresence>
                {showRatingModal && currentLook && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowRatingModal(false);
                            setRaterName("");
                            setRating(5);
                            setComment("");
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-pink-400" />
                                Rate &quot;{currentLook.name}&quot;
                            </h3>

                            <div className="space-y-4">
                                {/* Rater Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Who&apos;s rating? *</label>
                                    <input
                                        type="text"
                                        value={raterName}
                                        onChange={(e) => setRaterName(e.target.value)}
                                        placeholder="e.g., Sarah, Partner, Friend"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rating</label>
                                    <div className="flex gap-2 justify-center py-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className="transition-transform hover:scale-110 active:scale-95"
                                            >
                                                <Star
                                                    className={clsx(
                                                        "w-10 h-10",
                                                        star <= rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-white/90 hover:text-white/70 font-medium"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-sm text-white/80 font-medium mt-1">
                                        {rating === 1 && "Not great"}
                                        {rating === 2 && "Could be better"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Great"}
                                        {rating === 5 && "Amazing!"}
                                    </p>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="What did they think?"
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowRatingModal(false);
                                            setRaterName("");
                                            setRating(5);
                                            setComment("");
                                        }}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddRating}
                                        disabled={!raterName.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Rating
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

"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { Zap, Check, Lock, Star, Trophy, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Challenge {
    id: string;
    title: string;
    description: string;
    category: "feminization" | "submission" | "humiliation" | "obedience" | "endurance" | "creativity";
    difficulty: "easy" | "medium" | "hard" | "extreme";
    points: number;
    duration: number; // hours
    instructions: string[];
    completed: boolean;
    completedDate?: string;
    imageUrl?: string;
}

const dailyChallenges: Challenge[] = [
    {
        id: "fem-1",
        title: "Pink Everything Day",
        description: "Wear pink or feminine colors throughout the day",
        category: "feminization",
        difficulty: "easy",
        points: 10,
        duration: 24,
        instructions: [
            "Wear at least 3 pink or feminine colored items",
            "Include something visible (top, scarf, or accessory)",
            "Take a mirror selfie as proof",
            "Post a selfie or note your completion",
        ],
        completed: false,
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "fem-2",
        title: "Makeup Master",
        description: "Apply makeup for the entire day, full face",
        category: "feminization",
        difficulty: "medium",
        points: 25,
        duration: 24,
        instructions: [
            "Apply full makeup: foundation, eyeshadow, liner, mascara, lips",
            "Keep it on for minimum 12 hours",
            "Photograph your makeup twice (morning and end of day)",
            "Note any compliments or reactions received",
        ],
        completed: false,
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "fem-3",
        title: "Heel Challenge",
        description: "Wear heels for as long as possible",
        category: "feminization",
        difficulty: "medium",
        points: 20,
        duration: 24,
        instructions: [
            "Wear feminine heels (3+ inches) for at least 8 hours",
            "Walk in them frequently throughout the day",
            "Practice your feminine gait",
            "Document time worn and comfort level",
        ],
        completed: false,
        imageUrl: "https://images.unsplash.com/photo-1514294119e1-a444dd84b680?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "sub-1",
        title: "Address of Submission",
        description: "Adopt a submissive manner of speaking and addressing",
        category: "submission",
        difficulty: "medium",
        points: 20,
        duration: 24,
        instructions: [
            "Address yourself as 'she/her' exclusively (internally)",
            "Use feminine honorifics when thinking about yourself",
            "Adopt a more deferential tone in your internal dialogue",
            "Practice for at least 6 hours",
            "Journal about the experience",
        ],
        completed: false,
    },
    {
        id: "sub-2",
        title: "Obedience Training",
        description: "Follow specific behavioral rules for 12 hours",
        category: "obedience",
        difficulty: "hard",
        points: 35,
        duration: 12,
        instructions: [
            "No crossing legs unless explicitly allowed",
            "Maintain perfect posture for 12 consecutive hours",
            "Ask 'may I?' before eating or drinking",
            "Speak in a higher, softer tone",
            "Log every hour of compliance",
        ],
        completed: false,
    },
    {
        id: "humil-1",
        title: "Private Selfie",
        description: "Take a feminized selfie you'd be embarrassed to show",
        category: "humiliation",
        difficulty: "easy",
        points: 15,
        duration: 2,
        instructions: [
            "Apply makeup and dress in something very feminine",
            "Take a selfie that makes you blush",
            "Save it privately in your device",
            "Acknowledge the feelings of embarrassment (that's the point!)",
        ],
        completed: false,
    },
    {
        id: "humil-2",
        title: "Affirmation Oath",
        description: "Record yourself saying affirmations in a feminine voice",
        category: "humiliation",
        difficulty: "medium",
        points: 25,
        duration: 1,
        instructions: [
            "Record 5 minutes of affirmations",
            "Use a higher pitched, softer voice",
            "Include: 'I am a beautiful sissy', 'I love being feminine', 'My transformation is my power'",
            "Listen to the recording and sit with any embarrassment",
            "Save as personal motivation",
        ],
        completed: false,
    },
    {
        id: "endure-1",
        title: "Cage Challenge",
        description: "Wear cage for extended period if applicable",
        category: "endurance",
        difficulty: "extreme",
        points: 50,
        duration: 24,
        instructions: [
            "Wear chastity cage for 24 consecutive hours",
            "Maintain normal daily activities",
            "Log each hour and feelings",
            "Journal about any psychological effects",
            "Document ease of daily tasks",
        ],
        completed: false,
    },
    {
        id: "endure-2",
        title: "Corset Conditioning",
        description: "Wear a corset for extended period",
        category: "endurance",
        difficulty: "hard",
        points: 30,
        duration: 12,
        instructions: [
            "Wear corset for 8-12 hours",
            "Start at comfortable tightness",
            "Gradually increase tightness by 1-2 inches daily",
            "Document waist measurements",
            "Note how it feels throughout the day",
        ],
        completed: false,
    },
    {
        id: "cre-1",
        title: "Outfit Designer",
        description: "Create and design a complete sissy outfit",
        category: "creativity",
        difficulty: "easy",
        points: 15,
        duration: 3,
        instructions: [
            "Design a complete outfit on paper or digitally",
            "Include all pieces: top, bottoms, shoes, accessories, makeup",
            "Explain the occasion and why each piece works",
            "Draw or describe colors and styles in detail",
        ],
        completed: false,
    },
    {
        id: "cre-2",
        title: "Persona Creation",
        description: "Create a detailed sissy persona with backstory",
        category: "creativity",
        difficulty: "medium",
        points: 20,
        duration: 4,
        instructions: [
            "Create a full sissy persona (name, background, personality)",
            "Write detailed descriptions of appearance and style",
            "Develop a backstory of transformation",
            "Create a daily schedule for this persona",
            "Write at least 500 words of character development",
        ],
        completed: false,
    },
];

export default function DailyChallenges() {
    const [challenges, setChallenges] = useState<Challenge[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("challenges");
            if (saved) {
                const parsed = JSON.parse(saved);
                // Reset completion status daily
                const today = new Date().toDateString();
                const lastReset = localStorage.getItem("challengesResetDate");

                if (lastReset !== today) {
                    localStorage.setItem("challengesResetDate", today);
                    return parsed.map((c: Challenge) => ({
                        ...c,
                        completed: false,
                        completedDate: undefined,
                    }));
                }
                return parsed;
            }
        }
        return dailyChallenges;
    });

    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [filterCategory, setFilterCategory] = useState<Challenge["category"] | "all">("all");
    const [filterDifficulty, setFilterDifficulty] = useState<Challenge["difficulty"] | "all">("all");

    // Calculate stats
    const stats = useMemo(() => {
        const completed = challenges.filter((c) => c.completed).length;
        const totalPoints = challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0);
        const streak = completed > 0 ? Math.floor(totalPoints / 10) : 0;

        return { completed, totalPoints, streak };
    }, [challenges]);

    // Filter challenges
    const filteredChallenges = useMemo(() => {
        return challenges.filter((c) => {
            if (filterCategory !== "all" && c.category !== filterCategory) return false;
            if (filterDifficulty !== "all" && c.difficulty !== filterDifficulty) return false;
            return true;
        });
    }, [challenges, filterCategory, filterDifficulty]);

    const toggleComplete = (id: string) => {
        setChallenges((prev) =>
            prev.map((c) =>
                c.id === id
                    ? {
                        ...c,
                        completed: !c.completed,
                        completedDate: !c.completed ? new Date().toISOString() : undefined,
                    }
                    : c
            )
        );
        localStorage.setItem(
            "challenges",
            JSON.stringify(
                challenges.map((c) =>
                    c.id === id
                        ? {
                            ...c,
                            completed: !c.completed,
                            completedDate: !c.completed ? new Date().toISOString() : undefined,
                        }
                        : c
                )
            )
        );
    };

    const difficultyColors: Record<Challenge["difficulty"], string> = {
        easy: "from-green-500 to-emerald-500",
        medium: "from-yellow-500 to-orange-500",
        hard: "from-orange-500 to-red-500",
        extreme: "from-red-500 to-purple-500",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Daily Sissy Challenges</h2>
                    <p className="text-sm text-muted-foreground">Complete challenges to earn points and build discipline</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center"
                >
                    <Trophy className="w-6 h-6 mx-auto text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Completed Today</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 text-center"
                >
                    <Star className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.totalPoints}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Points Earned</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-4 text-center"
                >
                    <RotateCw className="w-6 h-6 mx-auto text-red-400 mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.streak}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Streak</div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none"
                >
                    <option value="all">All Categories</option>
                    <option value="feminization">Feminization</option>
                    <option value="submission">Submission</option>
                    <option value="humiliation">Humiliation</option>
                    <option value="obedience">Obedience</option>
                    <option value="endurance">Endurance</option>
                    <option value="creativity">Creativity</option>
                </select>

                <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value as any)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none"
                >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="extreme">Extreme</option>
                </select>
            </div>

            {/* Challenge List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredChallenges.map((challenge, idx) => (
                        <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedChallenge(challenge)}
                            className={clsx(
                                "p-4 rounded-xl border cursor-pointer transition-all",
                                challenge.completed
                                    ? "bg-green-500/10 border-green-500/30"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-foreground">{challenge.title}</h3>
                                        <span
                                            className={clsx(
                                                "text-xs font-bold px-2 py-0.5 rounded text-white bg-gradient-to-r",
                                                difficultyColors[challenge.difficulty]
                                            )}
                                        >
                                            {challenge.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="font-semibold text-yellow-400">⭐ {challenge.points} pts</span>
                                        <span className="text-muted-foreground">⏱️ {challenge.duration}h</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleComplete(challenge.id);
                                    }}
                                    className={clsx(
                                        "p-3 rounded-lg border-2 transition-all ml-3",
                                        challenge.completed
                                            ? "bg-green-500/20 border-green-500 text-green-400"
                                            : "bg-white/5 border-white/20 text-muted-foreground hover:border-pink-500"
                                    )}
                                >
                                    {challenge.completed ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <Lock className="w-6 h-6" />
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Challenge Details Modal */}
            <AnimatePresence>
                {selectedChallenge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedChallenge(null)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedChallenge.title}</h2>
                                    <p className="text-muted-foreground">{selectedChallenge.description}</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedChallenge(null)}
                                    className="text-muted-foreground hover:text-foreground text-xl"
                                >
                                    ✕
                                </motion.button>
                            </div>

                            {/* Image */}
                            {selectedChallenge.imageUrl && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4"
                                >
                                    <img
                                        src={selectedChallenge.imageUrl}
                                        alt={selectedChallenge.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                </motion.div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground font-semibold">Difficulty</div>
                                    <div className="text-lg font-bold text-foreground capitalize">
                                        {selectedChallenge.difficulty}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground font-semibold">Points</div>
                                    <div className="text-lg font-bold text-yellow-400">⭐ {selectedChallenge.points}</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground font-semibold">Category</div>
                                    <div className="text-lg font-bold text-foreground capitalize">
                                        {selectedChallenge.category}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground font-semibold">Duration</div>
                                    <div className="text-lg font-bold text-foreground">{selectedChallenge.duration}h</div>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                                <div className="text-sm font-bold text-blue-300 mb-3">Instructions:</div>
                                <ol className="space-y-2">
                                    {selectedChallenge.instructions.map((instruction, idx) => (
                                        <li key={idx} className="text-sm text-foreground flex gap-2">
                                            <span className="font-bold text-blue-400">{idx + 1}.</span>
                                            <span>{instruction}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    toggleComplete(selectedChallenge.id);
                                    setSelectedChallenge(null);
                                }}
                                className={clsx(
                                    "w-full py-3 rounded-lg font-bold transition-all",
                                    selectedChallenge.completed
                                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                        : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                )}
                            >
                                {selectedChallenge.completed ? "✓ Challenge Completed" : "Complete Challenge"}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

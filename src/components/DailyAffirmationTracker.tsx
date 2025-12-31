"use client";
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Sparkles, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface Affirmation {
    text: string;
    imageUrl?: string;
}

const affirmations: Affirmation[] = [
    { text: "I am beautiful and feminine", imageUrl: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=400&fit=crop&q=80" },
    { text: "My transformation is my power", imageUrl: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500&h=400&fit=crop&q=80" },
    { text: "I embrace my sissy identity with pride", imageUrl: "https://images.unsplash.com/photo-1487621167519-e21cc028cb29?w=500&h=400&fit=crop&q=80" },
    { text: "Every day I grow more confident", imageUrl: "https://images.unsplash.com/photo-1535639066928-ab7201d00d1d?w=500&h=400&fit=crop&q=80" },
    { text: "I deserve to feel sexy and desirable", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop&q=80" },
    { text: "My curves are my strength", imageUrl: "https://images.unsplash.com/photo-1503452138081-7049a8b53ae6?w=500&h=400&fit=crop&q=80" },
    { text: "I am becoming the woman I desire to be", imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=400&fit=crop&q=80" },
    { text: "Femininity flows through me naturally", imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=400&fit=crop&q=80" },
    { text: "I am worthy of worship and adoration", imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=400&fit=crop&q=80" },
    { text: "My submission is my freedom", imageUrl: "https://images.unsplash.com/photo-1545389336-cf090694cb59?w=500&h=400&fit=crop&q=80" },
    { text: "I choose pleasure over shame", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop&q=80" },
    { text: "My body is a work of art", imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&h=400&fit=crop&q=80" },
    { text: "I radiate feminine energy", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=400&fit=crop&q=80" },
    { text: "I am grateful for my transformation", imageUrl: "https://images.unsplash.com/photo-1494761681033-11461fa752df?w=500&h=400&fit=crop&q=80" },
    { text: "Confidence is my most beautiful feature", imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=400&fit=crop&q=80" },
    { text: "I love myself completely", imageUrl: "https://images.unsplash.com/photo-1515552726519-7d82e06d773c?w=500&h=400&fit=crop&q=80" },
    { text: "My femininity is my superpower", imageUrl: "https://images.unsplash.com/photo-1513161455079-7ef1a827fb4d?w=500&h=400&fit=crop&q=80" },
    { text: "I am enough, exactly as I am", imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500&h=400&fit=crop&q=80" },
    { text: "Today I choose self-love", imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=400&fit=crop&q=80" },
    { text: "I am a work of art in progress", imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=400&fit=crop&q=80" },
    { text: "My sissy heart is pure", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=400&fit=crop&q=80" },
    { text: "I attract the love and attention I deserve", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=500&h=400&fit=crop&q=80" },
    { text: "Every step forward is a victory", imageUrl: "https://images.unsplash.com/photo-1551431009-381d36ac3a14?w=500&h=400&fit=crop&q=80" },
    { text: "I am brave enough to be myself", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=400&fit=crop&q=80" },
    { text: "My transformation inspires others", imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=400&fit=crop&q=80" },
];

interface AffirmationLog {
    date: string;
    affirmation: string;
    repeated: number;
}

export default function DailyAffirmationTracker() {
    const [todayAffirmation, setTodayAffirmation] = useState<Affirmation | null>(null);
    const [repeated, setRepeated] = useState(0);
    const [logs, setLogs] = useState<AffirmationLog[]>([]);

    useEffect(() => {
        const today = new Date().toDateString();
        const storedLogs = localStorage.getItem("affirmationLogs");
        const parsedLogs: AffirmationLog[] = storedLogs ? JSON.parse(storedLogs) : [];
        setLogs(parsedLogs);

        const todayLog = parsedLogs.find((l) => l.date === today);
        if (todayLog) {
            const affirmation = affirmations.find((a) => a.text === todayLog.affirmation);
            setTodayAffirmation(affirmation || affirmations[0]);
            setRepeated(todayLog.repeated);
        } else {
            const newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
            setTodayAffirmation(newAffirmation);
            setRepeated(0);
        }
    }, []);

    const updateLog = (newRepeated: number) => {
        const today = new Date().toDateString();
        const newLogs = [...logs];
        const existingIndex = newLogs.findIndex((l) => l.date === today);

        if (existingIndex >= 0) {
            newLogs[existingIndex].repeated = newRepeated;
        } else {
            newLogs.unshift({ date: today, affirmation: todayAffirmation?.text || "", repeated: newRepeated });
        }

        setRepeated(newRepeated);
        setLogs(newLogs);
        localStorage.setItem("affirmationLogs", JSON.stringify(newLogs.slice(0, 90)));
    };

    const getNewAffirmation = () => {
        const newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        setTodayAffirmation(newAffirmation);
        setRepeated(0);
        const today = new Date().toDateString();
        const newLogs = [...logs];
        const existingIndex = newLogs.findIndex((l) => l.date === today);
        if (existingIndex >= 0) {
            newLogs[existingIndex] = { date: today, affirmation: newAffirmation.text, repeated: 0 };
        } else {
            newLogs.unshift({ date: today, affirmation: newAffirmation.text, repeated: 0 });
        }
        setLogs(newLogs);
        localStorage.setItem("affirmationLogs", JSON.stringify(newLogs.slice(0, 90)));
    };

    const recentLogs = logs.slice(0, 7);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Daily Affirmations</h2>
                    <p className="text-sm text-muted-foreground">Build confidence through positive self-talk</p>
                </div>
                <Sparkles className="w-8 h-8 text-pink-400" />
            </div>

            {/* Today's Affirmation */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30 p-6 text-center space-y-4"
            >
                <div className="text-lg font-semibold text-pink-300">Today's Affirmation</div>

                {/* Image */}
                {todayAffirmation?.imageUrl && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-xl overflow-hidden aspect-[4/3]"
                    >
                        <img
                            src={todayAffirmation.imageUrl}
                            alt="Affirmation"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </motion.div>
                )}

                <div className="text-2xl font-bold text-foreground italic leading-relaxed">
                    "{todayAffirmation?.text}"
                </div>

                {/* Repeat Counter */}
                <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                        Repeat this affirmation throughout the day to build conviction
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {[1, 5, 10, 20].map((count) => (
                            <button
                                key={count}
                                onClick={() => updateLog(count)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                                    repeated === count
                                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                                        : "bg-white/10 hover:bg-white/20 text-foreground"
                                )}
                            >
                                {count}x
                            </button>
                        ))}
                    </div>
                    {repeated > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center gap-2 text-green-300 font-semibold"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Repeated {repeated}x today
                        </motion.div>
                    )}
                </div>

                {/* Get Different Affirmation */}
                <button
                    onClick={getNewAffirmation}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-foreground font-semibold text-sm transition-all"
                >
                    <RotateCw className="w-4 h-4" />
                    Get Different Affirmation
                </button>
            </motion.div>

            {/* Recent History */}
            {recentLogs.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-semibold text-foreground">Recent Days</div>
                    <div className="space-y-2">
                        {recentLogs.map((log, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/5 rounded-lg border border-white/10 p-4"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="text-xs text-muted-foreground font-semibold">
                                            {new Date(log.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                                        </div>
                                        <div className="text-sm text-foreground font-medium italic">
                                            "{log.affirmation}"
                                        </div>
                                    </div>
                                    {log.repeated > 0 && (
                                        <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            <span className="text-xs font-bold text-green-300">{log.repeated}x</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                <h3 className="font-semibold text-sm text-blue-300 mb-2">✨ Affirmation Tips</h3>
                <ul className="space-y-1 text-xs text-foreground font-medium">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Say affirmations out loud for maximum impact</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Repeat them in the mirror, looking at yourself with love</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Say affirmations first thing in the morning and before bed</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Believe the words as you say them—feel the truth</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Consistency builds conviction over time</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

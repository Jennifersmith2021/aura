"use client";
/* eslint-disable react-hooks/immutability, react/no-unescaped-entities */

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Flame, Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface YogaPose {
    id: string;
    name: string;
    duration: string;
    benefits: string[];
    difficulty: "beginner" | "intermediate" | "advanced";
    feminineFocus: string;
}

interface YogaSession {
    date: string;
    completedPoses: string[];
    duration: number;
}

const yogaPoses: YogaPose[] = [
    {
        id: "cat-cow",
        name: "Cat-Cow Stretch",
        duration: "2 min",
        benefits: ["Spine flexibility", "Core engagement", "Graceful movement"],
        difficulty: "beginner",
        feminineFocus: "Creates fluid, graceful spinal movement",
    },
    {
        id: "child-pose",
        name: "Child's Pose",
        duration: "3 min",
        benefits: ["Hip flexibility", "Relaxation", "Submission posture"],
        difficulty: "beginner",
        feminineFocus: "Embodies gentle, submissive energy",
    },
    {
        id: "cat-stretch",
        name: "Cat Stretch (Marjaryasana)",
        duration: "2 min",
        benefits: ["Back flexibility", "Hip mobility", "Feminine arch"],
        difficulty: "beginner",
        feminineFocus: "Creates beautiful back arch",
    },
    {
        id: "cobra",
        name: "Cobra Pose",
        duration: "2 min",
        benefits: ["Chest opening", "Posture improvement", "Confidence"],
        difficulty: "beginner",
        feminineFocus: "Opens chest for feminine posture",
    },
    {
        id: "butterfly",
        name: "Butterfly Pose",
        duration: "3 min",
        benefits: ["Hip flexibility", "Groin opening", "Feminine sitting"],
        difficulty: "beginner",
        feminineFocus: "Essential for ladylike sitting",
    },
    {
        id: "pigeon",
        name: "Pigeon Pose",
        duration: "3 min each side",
        benefits: ["Deep hip opening", "Flexibility", "Graceful lines"],
        difficulty: "intermediate",
        feminineFocus: "Creates elegant hip flexibility",
    },
    {
        id: "bridge",
        name: "Bridge Pose",
        duration: "2 min",
        benefits: ["Glute activation", "Back strength", "Lifted posture"],
        difficulty: "intermediate",
        feminineFocus: "Tones glutes for feminine shape",
    },
    {
        id: "legs-up",
        name: "Legs Up the Wall",
        duration: "5 min",
        benefits: ["Circulation", "Leg slimming", "Relaxation"],
        difficulty: "beginner",
        feminineFocus: "Elegant leg positioning",
    },
    {
        id: "goddess",
        name: "Goddess Pose",
        duration: "2 min",
        benefits: ["Inner thigh strength", "Hip opening", "Confidence"],
        difficulty: "intermediate",
        feminineFocus: "Embodies feminine power",
    },
    {
        id: "dancer",
        name: "Dancer's Pose",
        duration: "1 min each side",
        benefits: ["Balance", "Grace", "Flexibility"],
        difficulty: "advanced",
        feminineFocus: "Ultimate graceful pose",
    },
];

export default function DailyYoga() {
    const [completedToday, setCompletedToday] = useState<string[]>([]);
    const [sessions, setSessions] = useState<YogaSession[]>([]);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        // Load today's progress
        const today = new Date().toDateString();
        const stored = localStorage.getItem("yogaProgress");
        if (stored) {
            const progress = JSON.parse(stored);
            if (progress.date === today) {
                setCompletedToday(progress.completed);
            } else {
                // New day, reset
                setCompletedToday([]);
            }
        }

        // Load sessions history
        const storedSessions = localStorage.getItem("yogaSessions");
        if (storedSessions) {
            setSessions(JSON.parse(storedSessions));
        }

        // Calculate streak
        calculateStreak();
    }, []);

    const calculateStreak = () => {
        const storedSessions = localStorage.getItem("yogaSessions");
        if (!storedSessions) return;

        const sessions: YogaSession[] = JSON.parse(storedSessions);
        let currentStreak = 0;
        const checkDate = new Date();

        // Check backwards from today
        while (true) {
            const dateStr = checkDate.toDateString();
            const hasSession = sessions.find((s) => s.date === dateStr);
            if (hasSession) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        setStreak(currentStreak);
    };

    const togglePose = (poseId: string) => {
        const today = new Date().toDateString();
        let updated: string[];

        if (completedToday.includes(poseId)) {
            updated = completedToday.filter((id) => id !== poseId);
        } else {
            updated = [...completedToday, poseId];
        }

        setCompletedToday(updated);
        localStorage.setItem(
            "yogaProgress",
            JSON.stringify({ date: today, completed: updated })
        );

        // Save session if at least one pose completed
        if (updated.length > 0) {
            const session: YogaSession = {
                date: today,
                completedPoses: updated,
                duration: updated.length * 2, // Rough estimate
            };

            const existingSessions = sessions.filter((s) => s.date !== today);
            const updatedSessions = [session, ...existingSessions];
            setSessions(updatedSessions);
            localStorage.setItem("yogaSessions", JSON.stringify(updatedSessions));
            calculateStreak();
        }
    };

    const totalPoses = yogaPoses.length;
    const completedCount = completedToday.length;
    const progress = (completedCount / totalPoses) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Daily Yoga Practice</h2>
                    <p className="text-sm text-muted-foreground">
                        Flexibility and grace for your feminine journey
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <span className="text-2xl font-bold text-foreground">{streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">day streak</p>
                </div>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-5 border border-purple-500/30">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-foreground">Today's Progress</h3>
                    <span className="text-sm font-semibold text-purple-400">
                        {completedCount} / {totalPoses}
                    </span>
                </div>

                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                    />
                </div>

                <p className="text-xs text-muted-foreground font-medium">
                    {completedCount === totalPoses
                        ? "🎉 Amazing! You completed all poses today!"
                        : `${totalPoses - completedCount} poses remaining`}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                    <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
                    <div className="text-xs text-muted-foreground font-medium">Total Sessions</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-2xl font-bold text-foreground">
                        {Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)}h
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Practice Time</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                    <div className="text-2xl font-bold text-foreground">{streak}</div>
                    <div className="text-xs text-muted-foreground font-medium">Day Streak</div>
                </div>
            </div>

            {/* Yoga Poses */}
            <div className="space-y-3">
                <h3 className="font-bold text-lg text-foreground">Poses for Today</h3>

                {yogaPoses.map((pose) => {
                    const isCompleted = completedToday.includes(pose.id);
                    return (
                        <motion.button
                            key={pose.id}
                            onClick={() => togglePose(pose.id)}
                            whileTap={{ scale: 0.98 }}
                            className={clsx(
                                "w-full bg-white/5 rounded-xl border p-4 text-left transition-all",
                                isCompleted
                                    ? "border-green-500/50 bg-green-500/10"
                                    : "border-white/10 hover:bg-white/10"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <div className="mt-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-bold text-base text-foreground">
                                                {pose.name}
                                            </h4>
                                            <p className="text-xs text-purple-400 font-medium">
                                                {pose.duration} • {pose.difficulty}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-pink-300 font-medium mb-2 italic">
                                        ✨ {pose.feminineFocus}
                                    </p>

                                    <div className="flex flex-wrap gap-1">
                                        {pose.benefits.map((benefit, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 bg-purple-500/20 rounded-full text-xs text-foreground font-medium"
                                            >
                                                {benefit}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Tips */}
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                <h3 className="font-semibold text-sm text-blue-300 mb-2">💡 Yoga Tips</h3>
                <ul className="space-y-1 text-xs text-foreground font-medium">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Practice daily for best results - even 10 minutes helps</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Focus on graceful, flowing movements</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Breathe deeply and maintain feminine energy</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Hold poses with soft, elegant lines</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

"use client";
/* eslint-disable react-hooks/purity */

import { useState, useEffect } from "react";
import { Mic, Play, Pause, Volume2, TrendingUp, BookOpen, Award } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface VoiceLog {
    id: string;
    date: string;
    pitch: number; // in Hz
    duration: number; // in seconds
    exercise: string;
    notes?: string;
}

interface Exercise {
    id: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    duration: string;
    steps: string[];
    imageUrl?: string;
}

const exercises: Exercise[] = [
    {
        id: "humming",
        title: "Humming Warm-up",
        description: "Gentle warm-up to find your resonance",
        difficulty: "beginner",
        duration: "5 min",
        steps: [
            "Start with a comfortable low hum",
            "Gradually slide up in pitch",
            "Focus on feeling vibration in your face/head",
            "Avoid tension in your throat",
            "Repeat 5-10 times",
        ],
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "sirens",
        title: "Pitch Sirens",
        description: "Smooth transitions across your range",
        difficulty: "beginner",
        duration: "5 min",
        steps: [
            "Start at your lowest comfortable pitch",
            "Slowly glide up to your highest pitch",
            "Then glide back down smoothly",
            "Keep the sound continuous and smooth",
            "Do 10 repetitions",
        ],
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "resonance",
        title: "Resonance Shift",
        description: "Move resonance from chest to head voice",
        difficulty: "intermediate",
        duration: "10 min",
        steps: [
            "Say 'mmmm' and feel chest vibration",
            "Gradually raise pitch and shift to head",
            "Practice with words: 'me, my, mine'",
            "Keep jaw relaxed and open",
            "Focus on forward placement in mouth",
        ],
        imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "intonation",
        title: "Feminine Intonation",
        description: "Practice melodic speech patterns",
        difficulty: "intermediate",
        duration: "10 min",
        steps: [
            "Record yourself reading a paragraph",
            "Listen for monotone patterns",
            "Practice going up at end of questions",
            "Add more pitch variation to statements",
            "Re-record and compare",
        ],
        imageUrl: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "reading",
        title: "Sustained Reading",
        description: "Maintain feminine voice while reading",
        difficulty: "advanced",
        duration: "15 min",
        steps: [
            "Select a passage or article",
            "Read aloud in your feminine voice",
            "Focus on consistency throughout",
            "Monitor pitch and resonance",
            "Record and review",
        ],
        imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "conversation",
        title: "Conversational Practice",
        description: "Practice natural feminine speech",
        difficulty: "advanced",
        duration: "20 min",
        steps: [
            "Have a conversation with someone",
            "Or talk to yourself about your day",
            "Use varied pitch and intonation",
            "Add feminine speech patterns",
            "Stay relaxed and natural",
        ],
    },
];

export default function VoiceTraining() {
    const [logs, setLogs] = useState<VoiceLog[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [showExercises, setShowExercises] = useState(true);
    const [isRecording, setIsRecording] = useState(false);

    // Load logs from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("voiceLogs");
        if (stored) {
            setLogs(JSON.parse(stored));
        }
    }, []);

    const addLog = (exercise: string, pitch: number, duration: number, notes?: string) => {
        const newLog: VoiceLog = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            pitch,
            duration,
            exercise,
            notes,
        };
        const updated = [newLog, ...logs];
        setLogs(updated);
        localStorage.setItem("voiceLogs", JSON.stringify(updated));
    };

    const deleteLog = (id: string) => {
        const updated = logs.filter((l) => l.id !== id);
        setLogs(updated);
        localStorage.setItem("voiceLogs", JSON.stringify(updated));
    };

    const avgPitch = logs.length > 0
        ? Math.round(logs.reduce((sum, log) => sum + log.pitch, 0) / logs.length)
        : 0;

    const totalTime = logs.reduce((sum, log) => sum + log.duration, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Voice Training</h2>
                    <p className="text-sm text-muted-foreground">Develop your feminine voice</p>
                </div>
                <Mic className="w-8 h-8 text-purple-400" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-foreground">{logs.length}</div>
                    <div className="text-xs text-muted-foreground font-medium">Sessions</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-foreground">{avgPitch} Hz</div>
                    <div className="text-xs text-muted-foreground font-medium">Avg Pitch</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-foreground">{Math.round(totalTime / 60)}m</div>
                    <div className="text-xs text-muted-foreground font-medium">Total Time</div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm space-y-2">
                        <p className="font-semibold text-foreground">Voice Feminization Tips:</p>
                        <ul className="space-y-1 text-muted-foreground font-medium">
                            <li>• Typical feminine pitch: 165-255 Hz (aim for 180-220 Hz)</li>
                            <li>• Focus on resonance, not just pitch</li>
                            <li>• Practice daily for 15-20 minutes</li>
                            <li>• Record yourself to track progress</li>
                            <li>• Be patient - voice changes take time</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Toggle View */}
            <div className="flex gap-2">
                <button
                    onClick={() => setShowExercises(true)}
                    className={clsx(
                        "flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all",
                        showExercises
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Exercises
                </button>
                <button
                    onClick={() => setShowExercises(false)}
                    className={clsx(
                        "flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all",
                        !showExercises
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Progress
                </button>
            </div>

            {/* Exercises View */}
            {showExercises ? (
                <div className="space-y-3">
                    {exercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                        >
                            <button
                                onClick={() => setSelectedExercise(selectedExercise?.id === exercise.id ? null : exercise)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-base text-foreground">{exercise.title}</h4>
                                        <span
                                            className={clsx(
                                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                                exercise.difficulty === "beginner" && "bg-green-500/20 text-green-300",
                                                exercise.difficulty === "intermediate" && "bg-yellow-500/20 text-yellow-300",
                                                exercise.difficulty === "advanced" && "bg-red-500/20 text-red-300"
                                            )}
                                        >
                                            {exercise.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">{exercise.description}</p>
                                    <p className="text-xs text-purple-400 mt-1">{exercise.duration}</p>
                                </div>
                                <Play className="w-5 h-5 text-muted-foreground shrink-0" />
                            </button>

                            {selectedExercise?.id === exercise.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-white/10 p-4 space-y-3"
                                >
                                    {/* Image */}
                                    {exercise.imageUrl && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative rounded-xl overflow-hidden aspect-[4/3]"
                                        >
                                            <img
                                                src={exercise.imageUrl}
                                                alt={exercise.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                        </motion.div>
                                    )}

                                    <div>
                                        <h5 className="font-semibold text-sm text-foreground mb-2">Steps:</h5>
                                        <ol className="space-y-2">
                                            {exercise.steps.map((step, idx) => (
                                                <li key={idx} className="text-sm text-muted-foreground font-medium">
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    <button
                                        onClick={() => {
                                            // Simple log entry (in real app, would integrate pitch detection)
                                            const pitch = prompt("Enter your pitch (Hz):");
                                            const duration = prompt("Enter duration (minutes):");
                                            if (pitch && duration) {
                                                addLog(exercise.title, parseInt(pitch), parseInt(duration) * 60);
                                                alert("Session logged!");
                                            }
                                        }}
                                        className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow"
                                    >
                                        Log This Session
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                /* Progress View */
                <div className="space-y-3">
                    {logs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No training sessions yet</p>
                            <p className="text-sm mt-1">Start with the exercises above!</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-foreground">{log.exercise}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-purple-400 font-medium">{log.pitch} Hz</span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {Math.round(log.duration / 60)} min
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(log.date).toLocaleDateString()}
                                        </p>
                                        {log.notes && (
                                            <p className="text-sm text-muted-foreground mt-2 italic">{log.notes}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteLog(log.id)}
                                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

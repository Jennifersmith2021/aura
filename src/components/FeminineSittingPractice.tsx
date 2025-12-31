"use client";
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import { Armchair, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface SittingPosition {
    id: string;
    name: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    tips: string[];
    feminineFocus: string;
    commonMistakes: string[];
    visualGuide: string;
    imageUrl?: string;
}

const sittingPositions: SittingPosition[] = [
    {
        id: "basic-cross",
        name: "Basic Cross (Ankle on Knee)",
        description: "The most feminine and elegant leg crossing position",
        difficulty: "beginner",
        feminineFocus: "Creates beautiful leg lines and emphasizes grace",
        tips: [
            "Cross one leg completely over the other at the knee",
            "Keep ankles together and pointed",
            "Maintain upright posture with shoulders back",
            "Rest hands gracefully on lap or armrest",
            "Keep knees close together, not spread wide",
        ],
        commonMistakes: [
            "Letting knees fall too far apart",
            "Slouching or hunching shoulders",
            "Crossing at ankles instead of knees",
            "Forgetting to point toes",
        ],
        visualGuide: "🪑 Sit upright → Cross right leg over left at knee → Ankles together → Point toes → Hands on lap",
        imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "double-cross",
        name: "Double Cross (Ankle Behind Calf)",
        description: "Advanced elegant position wrapping ankle behind opposite calf",
        difficulty: "advanced",
        feminineFocus: "Shows exceptional flexibility and ultra-feminine grace",
        tips: [
            "Cross leg at knee first",
            "Wrap ankle around and behind opposite calf",
            "Keep thighs pressed together",
            "Maintain perfect posture",
            "Practice flexibility first",
        ],
        commonMistakes: [
            "Forcing position without flexibility",
            "Leaning to one side for balance",
            "Letting wrapped ankle slip",
            "Tensing up - should look effortless",
        ],
        visualGuide: "🪑 Sit straight → Cross leg at knee → Wrap ankle behind opposite calf → Thighs together → Relax shoulders",
        imageUrl: "https://images.unsplash.com/photo-1534120247760-ff50a5ff6fe8?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "side-tuck",
        name: "Side Tuck (Mermaid Sit)",
        description: "Both legs tucked to one side, knees together",
        difficulty: "intermediate",
        feminineFocus: "Creates a delicate, demure appearance perfect for dresses",
        tips: [
            "Tuck both legs to one side",
            "Keep knees and ankles together",
            "Sit on hip, not center",
            "One hand on lap, one on seat for support",
            "Perfect for photos and formal settings",
        ],
        commonMistakes: [
            "Separating knees",
            "Slouching to the side",
            "Sitting too far back",
            "Looking uncomfortable",
        ],
        visualGuide: "🪑 Sit on right hip → Tuck both legs left → Knees together → Left hand on seat → Right hand on lap",
        imageUrl: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "knees-together",
        name: "Knees Together (Basic Feminine Sit)",
        description: "Feet flat on floor, knees pressed together",
        difficulty: "beginner",
        feminineFocus: "The foundation of all feminine sitting - always keep knees together",
        tips: [
            "Plant feet flat on floor",
            "Press knees together tightly",
            "Sit at edge of seat, not back",
            "Back straight, shoulders relaxed",
            "Hands folded on lap or beside thighs",
        ],
        commonMistakes: [
            "Letting knees drift apart",
            "Crossing ankles instead",
            "Slouching back in chair",
            "Manspreading legs",
        ],
        visualGuide: "🪑 Sit at chair edge → Feet flat → Knees pressed together → Back straight → Hands on lap",
        imageUrl: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "slant-sit",
        name: "Slant Sit (Angled Legs)",
        description: "Legs slanted to one side with ankles crossed",
        difficulty: "intermediate",
        feminineFocus: "Creates elegant diagonal lines and looks great in photos",
        tips: [
            "Sit straight but angle legs to side",
            "Cross ankles, knees stay together",
            "Point toes in same direction",
            "Keep upper body facing forward",
            "Great for side-by-side seating",
        ],
        commonMistakes: [
            "Twisting entire body",
            "Separating knees",
            "Leaning too far to side",
            "Looking stiff",
        ],
        visualGuide: "🪑 Sit centered → Angle legs 45° to right → Cross ankles → Knees together → Face forward",
    },
    {
        id: "perch-sit",
        name: "Perch (Edge Sitting)",
        description: "Sitting at very edge of seat, ready to rise gracefully",
        difficulty: "beginner",
        feminineFocus: "Shows attentiveness and readiness to serve",
        tips: [
            "Sit at front 1/3 of seat only",
            "Knees together, feet flat",
            "Back perfectly straight, no support",
            "Hands on knees or lap",
            "Easy to stand up gracefully",
        ],
        commonMistakes: [
            "Sitting too far back",
            "Slouching without back support",
            "Looking tense",
            "Forgetting to keep knees together",
        ],
        visualGuide: "🪑 Perch at edge → Knees together → Feet flat → Back unsupported → Hands on knees",
    },
    {
        id: "formal-cross",
        name: "Formal Cross (Figure 4)",
        description: "One ankle resting on opposite knee in controlled manner",
        difficulty: "intermediate",
        feminineFocus: "Professional but feminine when done with grace and tight control",
        tips: [
            "Rest ankle on opposite knee (not thigh)",
            "Keep raised leg's knee from splaying out",
            "Maintain upright posture",
            "Point toes of raised foot",
            "Only for professional settings, not ultra-feminine occasions",
        ],
        commonMistakes: [
            "Letting knee splay out masculine style",
            "Grabbing ankle with hand",
            "Slouching back",
            "Using in overly feminine settings",
        ],
        visualGuide: "🪑 Sit upright → Place right ankle on left knee → Control right knee position → Point right toes → Hands on lap",
    },
    {
        id: "curtsy-sit",
        name: "Curtsy Sit (Graceful Lowering)",
        description: "The technique for sitting down gracefully in dresses/skirts",
        difficulty: "advanced",
        feminineFocus: "The most feminine way to transition from standing to sitting",
        tips: [
            "Approach chair backwards, feeling with calves",
            "Smooth dress/skirt behind thighs with hands",
            "Lower gracefully, back straight",
            "Knees together throughout",
            "Land gently at chair edge",
        ],
        commonMistakes: [
            "Plopping down quickly",
            "Not smoothing dress",
            "Looking down at chair",
            "Spreading knees during descent",
        ],
        visualGuide: "👗 Back to chair → Feel with calves → Smooth dress → Lower with grace → Knees together → Land at edge",
    },
];

export default function FeminineSittingPractice() {
    const [selectedPosition, setSelectedPosition] = useState<SittingPosition | null>(null);
    const [practicedToday, setPracticedToday] = useState<string[]>(() => {
        if (typeof window === "undefined") return [];
        const stored = localStorage.getItem("sittingPracticeToday");
        if (!stored) return [];
        const data = JSON.parse(stored);
        if (data.date !== new Date().toDateString()) {
            localStorage.setItem(
                "sittingPracticeToday",
                JSON.stringify({ date: new Date().toDateString(), practiced: [] })
            );
            return [];
        }
        return data.practiced;
    });

    const togglePracticed = (positionId: string) => {
        const updated = practicedToday.includes(positionId)
            ? practicedToday.filter((id) => id !== positionId)
            : [...practicedToday, positionId];

        setPracticedToday(updated);
        localStorage.setItem(
            "sittingPracticeToday",
            JSON.stringify({ date: new Date().toDateString(), practiced: updated })
        );
    };

    const progressPercent = (practicedToday.length / sittingPositions.length) * 100;

    const difficultyColors = {
        beginner: "text-green-400 bg-green-500/20",
        intermediate: "text-yellow-400 bg-yellow-500/20",
        advanced: "text-red-400 bg-red-500/20",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Feminine Sitting Practice</h2>
                    <p className="text-sm text-muted-foreground">
                        Master graceful, elegant sitting positions
                    </p>
                </div>
                <Armchair className="w-8 h-8 text-pink-400" />
            </div>

            {/* Progress */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-5 border border-pink-500/30">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Today's Practice
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {practicedToday.length} / {sittingPositions.length}
                        </div>
                    </div>
                    <Sparkles className="w-10 h-10 text-pink-400" />
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                    />
                </div>
            </div>

            {/* Positions Grid */}
            <div className="space-y-3">
                {sittingPositions.map((position) => {
                    const isPracticed = practicedToday.includes(position.id);
                    const isSelected = selectedPosition?.id === position.id;

                    return (
                        <div key={position.id} className="space-y-2">
                            {/* Position Card */}
                            <motion.button
                                onClick={() =>
                                    setSelectedPosition(isSelected ? null : position)
                                }
                                whileTap={{ scale: 0.98 }}
                                className={clsx(
                                    "w-full bg-white/5 rounded-xl border p-4 text-left transition-all",
                                    isSelected && "border-pink-500/50 bg-pink-500/10",
                                    !isSelected && "border-white/10 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-base text-foreground mb-1">
                                            {position.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {position.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className={clsx(
                                            "px-2 py-0.5 rounded-full text-xs font-bold",
                                            difficultyColors[position.difficulty]
                                        )}
                                    >
                                        {position.difficulty}
                                    </span>
                                    {isPracticed && (
                                        <span className="px-2 py-0.5 bg-green-500/20 rounded-full text-xs font-bold text-green-400">
                                            Practiced Today ✓
                                        </span>
                                    )}
                                </div>
                            </motion.button>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-white/5 rounded-xl border border-white/10 p-5 space-y-4"
                                    >
                                        {/* Demonstration Image */}
                                        {position.imageUrl && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden"
                                            >
                                                <img
                                                    src={position.imageUrl}
                                                    alt={position.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            </motion.div>
                                        )}

                                        {/* Visual Guide */}
                                        <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/30">
                                            <h4 className="font-semibold text-sm text-pink-300 mb-2">
                                                📖 Visual Guide
                                            </h4>
                                            <p className="text-sm text-foreground font-medium">
                                                {position.visualGuide}
                                            </p>
                                        </div>

                                        {/* Feminine Focus */}
                                        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                                            <h4 className="font-semibold text-sm text-purple-300 mb-2">
                                                ✨ Feminine Focus
                                            </h4>
                                            <p className="text-sm text-foreground font-medium">
                                                {position.feminineFocus}
                                            </p>
                                        </div>

                                        {/* Tips */}
                                        <div>
                                            <h4 className="font-semibold text-sm text-foreground mb-2">
                                                💡 Tips
                                            </h4>
                                            <ul className="space-y-1">
                                                {position.tips.map((tip, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm text-muted-foreground font-medium flex items-start gap-2"
                                                    >
                                                        <span className="text-pink-400 shrink-0">
                                                            •
                                                        </span>
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Common Mistakes */}
                                        <div>
                                            <h4 className="font-semibold text-sm text-red-300 mb-2">
                                                ⚠️ Common Mistakes
                                            </h4>
                                            <ul className="space-y-1">
                                                {position.commonMistakes.map((mistake, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm text-muted-foreground font-medium flex items-start gap-2"
                                                    >
                                                        <span className="text-red-400 shrink-0">
                                                            •
                                                        </span>
                                                        <span>{mistake}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Practice Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePracticed(position.id);
                                            }}
                                            className={clsx(
                                                "w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                                                isPracticed
                                                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                                    : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                            )}
                                        >
                                            {isPracticed ? (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Practiced Today
                                                </>
                                            ) : (
                                                <>
                                                    <Circle className="w-5 h-5" />
                                                    Mark as Practiced
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* General Tips */}
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                <h3 className="font-semibold text-sm text-blue-300 mb-2">
                    🪑 Universal Sitting Rules
                </h3>
                <ul className="space-y-1 text-xs text-foreground font-medium">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>ALWAYS keep knees together - this is non-negotiable</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Sit at edge of chair, not slouched back</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Keep back straight, shoulders relaxed</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Point toes, never flex feet</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Practice in front of mirror until natural</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>In dresses/skirts, always smooth fabric first</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

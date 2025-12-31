"use client";

import { useState } from "react";
import { Footprints, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface WalkingTechnique {
    id: string;
    name: string;
    type: "heels" | "flats";
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    steps: string[];
    tips: string[];
    commonMistakes: string[];
    feminineFocus: string;
    imageUrl?: string;
}

const walkingTechniques: WalkingTechnique[] = [
    // Without Heels
    {
        id: "basic-feminine-walk",
        name: "Basic Feminine Walk (Flats)",
        type: "flats",
        description: "Foundation of feminine walking with natural shoes",
        difficulty: "beginner",
        feminineFocus: "Creates gentle hip sway and graceful movement",
        steps: [
            "Stand tall with shoulders back and relaxed",
            "Place one foot directly in front of the other (walking a line)",
            "Keep knees soft and slightly bent",
            "Let hips sway naturally side to side",
            "Swing arms gently, hands relaxed",
            "Take smaller, more controlled steps",
            "Point toes slightly outward",
            "Keep head up, chin parallel to ground",
        ],
        tips: [
            "Imagine walking on a tightrope for the straight line",
            "Let your hips lead the movement",
            "Keep movements fluid, not robotic",
            "Practice with a book on your head for posture",
            "Film yourself to see your progress",
        ],
        commonMistakes: [
            "Taking wide, masculine strides",
            "Walking with stiff hips",
            "Heavy footsteps (stomping)",
            "Looking down at feet",
            "Swinging arms too wide",
        ],
        imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "runway-walk-flats",
        name: "Runway Walk (Flats)",
        type: "flats",
        description: "Confident, model-style walk without heels",
        difficulty: "intermediate",
        feminineFocus: "Commands attention with feminine confidence and poise",
        steps: [
            "Stand with perfect posture, chest lifted",
            "Cross one foot in front of the other (more than basic)",
            "Emphasize hip rotation with each step",
            "Keep shoulders still while hips move",
            "Maintain strong eye contact ahead",
            "Arms swing naturally but controlled",
            "Each step purposeful and placed",
            "Pause briefly at end of stride",
        ],
        tips: [
            "Think 'elongate' with every step",
            "Your hips should create a figure-8 motion",
            "Practice to music with a strong beat",
            "Confidence is key - own the walk",
        ],
        commonMistakes: [
            "Exaggerating hip movement unnaturally",
            "Looking timid or uncertain",
            "Bouncing shoulders up and down",
        ],
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "graceful-glide",
        name: "Graceful Glide (Flats)",
        type: "flats",
        description: "Ultra-smooth, floating walk for everyday elegance",
        difficulty: "intermediate",
        feminineFocus: "Creates illusion of floating gracefully",
        steps: [
            "Engage core muscles for stability",
            "Roll through foot: heel, arch, toe",
            "Keep knees closer together than usual",
            "Minimize vertical head movement",
            "Shoulders stay level and relaxed",
            "Hands held loosely, wrists soft",
            "Each step flows into the next seamlessly",
            "Maintain constant, smooth pace",
        ],
        tips: [
            "Imagine gliding on ice",
            "Practice with a water glass on head",
            "Focus on smooth weight transfer",
            "Never lock your knees",
        ],
        commonMistakes: [
            "Bouncing or bobbing while walking",
            "Stiff, robot-like movements",
            "Walking too slowly",
            "Forgetting to breathe naturally",
        ],
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=400&fit=crop&q=80",
    },

    // With Heels
    {
        id: "basic-heel-walk",
        name: "Basic Heel Walk (2-3 inch)",
        type: "heels",
        description: "Foundation for walking in moderate heels",
        difficulty: "beginner",
        feminineFocus: "Heels naturally create feminine posture and hip movement",
        steps: [
            "Start with 2-3 inch heels for learning",
            "Stand with weight centered, core engaged",
            "Step heel first, then toe (heel-toe motion)",
            "Place feet on imaginary straight line",
            "Keep steps slightly shorter than in flats",
            "Let hips sway naturally with the heel height",
            "Maintain upright posture, don't lean forward",
            "Look ahead, never at your feet",
        ],
        tips: [
            "Practice on carpet first, then hard floors",
            "Start with thicker heels for stability",
            "Walk for short periods, build endurance",
            "Strengthen ankles with exercises",
            "Always have foot inserts for comfort",
        ],
        commonMistakes: [
            "Leaning forward or backward",
            "Taking steps that are too long",
            "Landing toe-first instead of heel-toe",
            "Tensing up and looking scared",
            "Choosing heels too high for skill level",
        ],
        imageUrl: "https://images.unsplash.com/photo-1515562141207-6461a4b856de?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "stiletto-mastery",
        name: "Stiletto Mastery (4+ inch)",
        type: "heels",
        description: "Advanced walking in high, thin heels",
        difficulty: "advanced",
        feminineFocus: "Ultimate feminine power and elegance in ultra-high heels",
        steps: [
            "Only attempt after mastering 3-inch heels",
            "Engage core and glutes constantly",
            "Place entire foot down at once (heel and ball together)",
            "Take very small, controlled steps",
            "Walk on a perfectly straight line",
            "Keep knees slightly bent, never locked",
            "Exaggerate gentle hip sway",
            "Distribute weight carefully with each step",
        ],
        tips: [
            "Build up heel height gradually over months",
            "Practice standing in heels before walking",
            "Platform stilettos are easier than regular",
            "Always check heel condition before wearing",
            "Keep emergency flats in your bag",
        ],
        commonMistakes: [
            "Rushing - stilettos require slow precision",
            "Not engaging core muscles",
            "Putting all weight on balls of feet",
            "Wobbling ankles from weak muscles",
            "Attempting on slippery surfaces",
        ],
        imageUrl: "https://images.unsplash.com/photo-1514295126714-3f27fbf07146?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "heel-stairs",
        name: "Stairs in Heels",
        type: "heels",
        description: "Safe, graceful stair navigation in heels",
        difficulty: "advanced",
        feminineFocus: "Shows true heel mastery and poise under challenge",
        steps: [
            "ALWAYS use handrail - safety first",
            "Going up: Place ball of foot on step, not heel",
            "Push up with leg muscles, not toes",
            "Going down: Turn slightly sideways",
            "Place entire foot sideways on each step going down",
            "Never rush - take one step at a time",
            "Look at stairs briefly, then ahead",
            "Keep posture upright, core engaged",
        ],
        tips: [
            "Practice going up before going down",
            "Avoid stairs in stilettos until very experienced",
            "Going down is harder than going up",
            "Use side profile for most elegant appearance",
            "Never attempt steep stairs in 4+ inch heels",
        ],
        commonMistakes: [
            "Trying to go fast",
            "Not using handrail",
            "Placing heel on step (going up)",
            "Facing completely forward going down",
            "Looking down the entire time",
        ],
        imageUrl: "https://images.unsplash.com/photo-1462392246754-28dab3eb827e?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "heel-sitting-standing",
        name: "Sitting & Standing in Heels",
        type: "heels",
        description: "Graceful transitions while wearing heels",
        difficulty: "intermediate",
        feminineFocus: "Smooth transitions show practiced feminine grace",
        steps: [
            "To sit: Back up to chair until you feel it",
            "Keep knees together at all times",
            "Lower down with control, don't plop",
            "Once seated, tuck heels under chair",
            "Cross ankles or knees elegantly",
            "To stand: Uncross legs, bring heels back",
            "Place weight on balls of feet",
            "Push up smoothly, one motion",
        ],
        tips: [
            "Never look at chair while sitting",
            "Use arm strength to assist standing",
            "Practice the motion repeatedly",
            "Keep dress/skirt smooth when sitting",
        ],
        commonMistakes: [
            "Flopping into seat",
            "Spreading knees while lowering",
            "Wobbling while standing up",
            "Forgetting to position heels correctly",
        ],
        imageUrl: "https://images.unsplash.com/photo-1535639066928-ab7201d00d1d?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "heel-endurance",
        name: "Heel Endurance Training",
        type: "heels",
        description: "Building stamina to wear heels longer",
        difficulty: "intermediate",
        feminineFocus: "Real femininity means wearing heels comfortably for hours",
        steps: [
            "Start: Wear heels at home for 15 minutes daily",
            "Week 2: Increase to 30 minutes",
            "Week 3: 1 hour with short breaks",
            "Week 4: 2 hours with minimal breaks",
            "Walk around house doing normal activities",
            "Gradually increase heel height over months",
            "Strengthen feet with toe raises and ankle rolls",
            "Always stretch calves after wearing heels",
        ],
        tips: [
            "Pain is NOT normal - adjust if hurting",
            "Use gel inserts and heel grips",
            "Practice on different surfaces",
            "Build calf and ankle strength separately",
            "Recovery days are important",
        ],
        commonMistakes: [
            "Pushing through pain",
            "Jumping to high heels too fast",
            "Not stretching afterwards",
            "Only practicing walking, not standing",
            "Giving up after initial difficulty",
        ],
        imageUrl: "https://images.unsplash.com/photo-1503452138081-7049a8b53ae6?w=500&h=400&fit=crop&q=80",
    },
];

export default function FeminineWalkingPractice() {
    const [activeType, setActiveType] = useState<"flats" | "heels">("flats");
    const [selectedTechnique, setSelectedTechnique] = useState<WalkingTechnique | null>(null);
    const [practicedToday, setPracticedToday] = useState<string[]>(() => {
        if (typeof window === "undefined") return [];
        const stored = localStorage.getItem("walkingPracticeToday");
        if (!stored) return [];
        const data = JSON.parse(stored);
        if (data.date !== new Date().toDateString()) {
            localStorage.setItem(
                "walkingPracticeToday",
                JSON.stringify({ date: new Date().toDateString(), practiced: [] })
            );
            return [];
        }
        return data.practiced;
    });

    const togglePracticed = (techniqueId: string) => {
        const updated = practicedToday.includes(techniqueId)
            ? practicedToday.filter((id) => id !== techniqueId)
            : [...practicedToday, techniqueId];

        setPracticedToday(updated);
        localStorage.setItem(
            "walkingPracticeToday",
            JSON.stringify({ date: new Date().toDateString(), practiced: updated })
        );
    };

    const filteredTechniques = walkingTechniques.filter((t) => t.type === activeType);
    const practicedCount = practicedToday.filter((id) =>
        filteredTechniques.some((t) => t.id === id)
    ).length;
    const progressPercent = (practicedCount / filteredTechniques.length) * 100;

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
                    <h2 className="text-2xl font-bold">Feminine Walking Practice</h2>
                    <p className="text-sm text-muted-foreground">
                        Master graceful, elegant movement
                    </p>
                </div>
                <Footprints className="w-8 h-8 text-pink-400" />
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveType("flats")}
                    className={clsx(
                        "flex-1 py-3 rounded-xl font-semibold text-sm transition-all",
                        activeType === "flats"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    Without Heels
                </button>
                <button
                    onClick={() => setActiveType("heels")}
                    className={clsx(
                        "flex-1 py-3 rounded-xl font-semibold text-sm transition-all",
                        activeType === "heels"
                            ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    With Heels 👠
                </button>
            </div>

            {/* Progress */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-5 border border-pink-500/30">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-sm text-muted-foreground font-medium">
                            {activeType === "heels" ? "Heel" : "Walking"} Practice Today
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {practicedCount} / {filteredTechniques.length}
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

            {/* Techniques */}
            <div className="space-y-3">
                {filteredTechniques.map((technique) => {
                    const isPracticed = practicedToday.includes(technique.id);
                    const isSelected = selectedTechnique?.id === technique.id;

                    return (
                        <div key={technique.id} className="space-y-2">
                            {/* Technique Card */}
                            <motion.button
                                onClick={() =>
                                    setSelectedTechnique(isSelected ? null : technique)
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
                                            {technique.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {technique.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className={clsx(
                                            "px-2 py-0.5 rounded-full text-xs font-bold",
                                            difficultyColors[technique.difficulty]
                                        )}
                                    >
                                        {technique.difficulty}
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
                                        {/* Feminine Focus */}
                                        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                                            <h4 className="font-semibold text-sm text-purple-300 mb-2">
                                                ✨ Feminine Focus
                                            </h4>
                                            <p className="text-sm text-foreground font-medium">
                                                {technique.feminineFocus}
                                            </p>
                                        </div>

                                        {/* Image */}
                                        {technique.imageUrl && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative rounded-xl overflow-hidden aspect-[4/3]"
                                            >
                                                <img
                                                    src={technique.imageUrl}
                                                    alt={technique.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                            </motion.div>
                                        )}

                                        {/* Steps */}
                                        <div>
                                            <h4 className="font-semibold text-sm text-foreground mb-2">
                                                📋 Steps
                                            </h4>
                                            <ol className="space-y-1">
                                                {technique.steps.map((step, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm text-muted-foreground font-medium flex items-start gap-2"
                                                    >
                                                        <span className="text-pink-400 font-bold shrink-0">
                                                            {i + 1}.
                                                        </span>
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        {/* Tips */}
                                        <div>
                                            <h4 className="font-semibold text-sm text-foreground mb-2">
                                                💡 Tips
                                            </h4>
                                            <ul className="space-y-1">
                                                {technique.tips.map((tip, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm text-muted-foreground font-medium flex items-start gap-2"
                                                    >
                                                        <span className="text-blue-400 shrink-0">
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
                                                {technique.commonMistakes.map((mistake, i) => (
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
                                                togglePracticed(technique.id);
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
                    👠 Walking Practice Tips
                </h3>
                <ul className="space-y-1 text-xs text-foreground font-medium">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Practice daily for at least 10-15 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Film yourself to identify areas for improvement</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Master flats before attempting heels</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Build heel height gradually over months, not days</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Strengthen ankles and calves with exercises</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span>Never sacrifice safety for appearance</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

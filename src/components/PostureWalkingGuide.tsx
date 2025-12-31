"use client";

import { useState } from "react";
import { Footprints, Video, CheckCircle2, Play, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface PostureGuide {
    id: string;
    title: string;
    category: "posture" | "walking" | "sitting" | "gestures";
    description: string;
    tips: string[];
    commonMistakes: string[];
    imageUrl?: string;
}

const guides: PostureGuide[] = [
    {
        id: "standing",
        title: "Feminine Standing Posture",
        category: "posture",
        description: "How to stand with grace and femininity",
        tips: [
            "Keep shoulders back and down, not hunched",
            "Chest slightly forward, showing confidence",
            "Engage core muscles for support",
            "Shift weight to one hip (hip pop)",
            "Keep one foot slightly in front",
            "Hands can rest on hips or hang naturally",
            "Head held high, chin parallel to ground",
            "Soft, relaxed facial expression",
        ],
        commonMistakes: [
            "Standing too rigid or military-style",
            "Shoulders hunched forward",
            "Weight distributed evenly (too masculine)",
            "Hands in pockets or crossed arms",
            "Slouching or poor posture",
        ],
        imageUrl: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "walking",
        title: "Feminine Walking Style",
        category: "walking",
        description: "The art of walking gracefully in heels or flats",
        tips: [
            "Place one foot directly in front of the other (runway walk)",
            "Lead with your hips, not shoulders",
            "Keep steps smaller than masculine walk",
            "Slight sway in hips with each step",
            "Point toes slightly outward",
            "Arms swing gently at sides, not rigid",
            "Keep head level, don't look at ground",
            "Maintain fluid, graceful motion",
            "In heels: heel strikes first, then toe",
            "Practice in front of mirror",
        ],
        commonMistakes: [
            "Walking with wide stance (feet apart)",
            "Heavy footsteps or stomping",
            "Stiff, mechanical movements",
            "Looking down at feet",
            "Swinging arms too much",
            "Long, masculine strides",
        ],
        imageUrl: "https://images.unsplash.com/photo-1513161455079-7ef1a827fb4d?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "sitting",
        title: "Sitting Like a Lady",
        category: "sitting",
        description: "Proper sitting posture and leg positioning",
        tips: [
            "Cross legs at knees or ankles",
            "Keep knees together when not crossed",
            "Sit on edge of seat, not slouched back",
            "Back straight with slight arch",
            "Hands in lap or on armrests",
            "When crossing legs, point toe down",
            "Adjust skirt/dress when sitting",
            "Exit chair gracefully, knees together",
        ],
        commonMistakes: [
            "Spreading legs apart (manspreading)",
            "Slouching or leaning back too far",
            "Ankle on knee cross (figure 4)",
            "Sitting heavily or plopping down",
            "Forgetting to adjust clothing",
        ],
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "hand-gestures",
        title: "Feminine Hand Gestures",
        category: "gestures",
        description: "Using your hands expressively and gracefully",
        tips: [
            "Keep wrists loose and flexible",
            "Gesture with palms up, not down",
            "Touch face/hair delicately when thinking",
            "Use smaller, more refined movements",
            "Play with jewelry or accessories",
            "When pointing, use multiple fingers",
            "Clasp hands together when standing",
            "Touch collarbone or neck gently",
            "Avoid fist-making or aggressive gestures",
        ],
        commonMistakes: [
            "Rigid, stiff hand movements",
            "Pointing with single finger aggressively",
            "Making fists or tense hands",
            "Large, exaggerated gestures",
            "Hands in pockets constantly",
        ],
        imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=400&fit=crop&q=80",
    },
    {
        id: "body-language",
        title: "Overall Body Language",
        category: "gestures",
        description: "Putting it all together for natural femininity",
        tips: [
            "Take up less space overall (more compact)",
            "Tilt head slightly when listening",
            "Smile more often and genuinely",
            "Make eye contact but with softer gaze",
            "Nod while others speak (engaged listening)",
            "Touch arm/shoulder when speaking to someone",
            "Move smoothly, avoid jerky motions",
            "Show emotion through expressions",
            "Lean in slightly when interested",
        ],
        commonMistakes: [
            "Taking up too much space",
            "Stern or aggressive facial expressions",
            "Invading personal space",
            "Too much nervous fidgeting",
            "Staring intensely instead of soft gaze",
        ],
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop&q=80",
    },
];

const exercises = [
    {
        title: "Wall Walking Exercise",
        duration: "5 min",
        description: "Practice walking in a straight line by walking heel-to-toe along a line on the floor or wall edge.",
    },
    {
        title: "Hip Sway Practice",
        duration: "5 min",
        description: "Stand in front of mirror, practice shifting weight from hip to hip in rhythm. Add forward motion gradually.",
    },
    {
        title: "Heel Walking",
        duration: "10 min",
        description: "Practice walking in heels around your home. Start with lower heels, progress to higher ones.",
    },
    {
        title: "Posture Check",
        duration: "Throughout day",
        description: "Set hourly reminders to check your posture. Adjust shoulders, hips, and stance as needed.",
    },
    {
        title: "Mirror Practice",
        duration: "10 min",
        description: "Stand in front of mirror and practice different poses, transitions, and movements. Video yourself for review.",
    },
    {
        title: "Sitting Transitions",
        duration: "5 min",
        description: "Practice sitting down and standing up gracefully. Keep knees together, use arms for support elegantly.",
    },
];

export default function PostureWalkingGuide() {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
    const [checkedExercises, setCheckedExercises] = useState<string[]>([]);

    const filteredGuides = selectedCategory === "all"
        ? guides
        : guides.filter((g) => g.category === selectedCategory);

    const toggleExercise = (title: string) => {
        setCheckedExercises((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Posture & Walking</h2>
                    <p className="text-sm text-muted-foreground">Move with grace and confidence</p>
                </div>
                <Footprints className="w-8 h-8 text-purple-400" />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setSelectedCategory("all")}
                    className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                        selectedCategory === "all"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    All
                </button>
                <button
                    onClick={() => setSelectedCategory("posture")}
                    className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                        selectedCategory === "posture"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    Posture
                </button>
                <button
                    onClick={() => setSelectedCategory("walking")}
                    className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                        selectedCategory === "walking"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    Walking
                </button>
                <button
                    onClick={() => setSelectedCategory("sitting")}
                    className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                        selectedCategory === "sitting"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    Sitting
                </button>
                <button
                    onClick={() => setSelectedCategory("gestures")}
                    className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                        selectedCategory === "gestures"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    Gestures
                </button>
            </div>

            {/* Guides */}
            <div className="space-y-3">
                {filteredGuides.map((guide) => (
                    <div
                        key={guide.id}
                        className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                    >
                        <button
                            onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                            <div className="text-left">
                                <h4 className="font-bold text-base text-foreground">{guide.title}</h4>
                                <p className="text-sm text-muted-foreground font-medium">{guide.description}</p>
                            </div>
                            <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" />
                        </button>

                        <AnimatePresence>
                            {expandedGuide === guide.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-white/10 p-4 space-y-4"
                                >
                                    {/* Image */}
                                    {guide.imageUrl && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative rounded-xl overflow-hidden aspect-[4/3]"
                                        >
                                            <img
                                                src={guide.imageUrl}
                                                alt={guide.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                        </motion.div>
                                    )}

                                    {/* Tips */}
                                    <div>
                                        <h5 className="font-semibold text-sm text-foreground mb-2">✨ How To:</h5>
                                        <ul className="space-y-2">
                                            {guide.tips.map((tip, idx) => (
                                                <li key={idx} className="text-sm text-muted-foreground font-medium flex items-start gap-2">
                                                    <span className="text-purple-400 shrink-0">•</span>
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Common Mistakes */}
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        <h5 className="font-semibold text-sm text-red-300 mb-2">⚠️ Avoid These Mistakes:</h5>
                                        <ul className="space-y-1">
                                            {guide.commonMistakes.map((mistake, idx) => (
                                                <li key={idx} className="text-sm text-foreground font-medium flex items-start gap-2">
                                                    <span className="text-red-400 shrink-0">✗</span>
                                                    <span>{mistake}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Practice Exercises */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/30">
                <h3 className="font-bold text-lg text-foreground mb-1 flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-400" />
                    Daily Practice Exercises
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Check off exercises as you complete them today</p>

                <div className="space-y-3">
                    {exercises.map((exercise) => (
                        <div
                            key={exercise.title}
                            className="bg-white/5 rounded-lg p-3 flex items-start gap-3"
                        >
                            <button
                                onClick={() => toggleExercise(exercise.title)}
                                className={clsx(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                    checkedExercises.includes(exercise.title)
                                        ? "bg-green-500 border-green-500"
                                        : "border-white/30 hover:border-purple-400"
                                )}
                            >
                                {checkedExercises.includes(exercise.title) && (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                )}
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm text-foreground">{exercise.title}</h4>
                                    <span className="text-xs text-purple-400 font-medium">{exercise.duration}</span>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium mt-1">{exercise.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

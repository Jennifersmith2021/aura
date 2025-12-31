"use client";

import { useState } from "react";
import { Wind, CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface YogaPose {
    id: string;
    name: string;
    duration: number; // seconds
    description: string;
    benefits: string[];
    alignment: string[];
    difficulty: "beginner" | "intermediate" | "advanced";
}

interface YogaSequence {
    id: string;
    name: string;
    description: string;
    focus: string[];
    totalTime: number; // minutes
    difficulty: "beginner" | "intermediate" | "advanced";
    poses: YogaPose[];
    whenToPractice: string;
}

const yogaSequences: YogaSequence[] = [
    {
        id: "morning-flow",
        name: "Morning Awakening Flow",
        description: "Energize your body and mind for a beautiful day",
        focus: ["energy", "flexibility", "awakening"],
        totalTime: 20,
        difficulty: "beginner",
        whenToPractice: "Upon waking, before breakfast",
        poses: [
            {
                id: "child-pose",
                name: "Child's Pose (Balasana)",
                duration: 60,
                description: "Center yourself and start with calm intention",
                benefits: ["Calms nervous system", "Stretches back and hips", "Grounds energy"],
                alignment: [
                    "Kneel on your mat",
                    "Bring big toes together, knees wide",
                    "Fold forward, forehead to mat",
                    "Arms extended or alongside body",
                    "Breathe deeply for 1 minute",
                ],
                difficulty: "beginner",
            },
            {
                id: "cat-cow",
                name: "Cat-Cow Stretch (Marjaryasana-Bitilasana)",
                duration: 120,
                description: "Warm up the spine and build mobility",
                benefits: ["Mobilizes spine", "Warms core", "Improves posture"],
                alignment: [
                    "Come to hands and knees (tabletop)",
                    "Wrists under shoulders, knees under hips",
                    "Cow: Drop belly, lift gaze, chest forward",
                    "Cat: Round spine, tuck chin, draw belly in",
                    "Flow with breath, 10-12 rounds",
                ],
                difficulty: "beginner",
            },
            {
                id: "downward-dog",
                name: "Downward-Facing Dog (Adho Mukha Svanasana)",
                duration: 90,
                description: "Energize and ground the body",
                benefits: [
                    "Strengthens arms and shoulders",
                    "Stretches hamstrings and calves",
                    "Boosts energy and blood flow",
                ],
                alignment: [
                    "From tabletop, spread fingers wide",
                    "Press firmly through palms",
                    "Lift hips high, create inverted V",
                    "Head between arms, ears toward biceps",
                    "Press chest toward thighs",
                    "Hold for 5-8 breaths",
                ],
                difficulty: "beginner",
            },
            {
                id: "mountain-pose",
                name: "Mountain Pose (Tadasana)",
                duration: 60,
                description: "Ground yourself with power and poise",
                benefits: ["Improves posture", "Builds confidence", "Grounds energy"],
                alignment: [
                    "Stand with feet hip-width apart",
                    "Feet parallel, weight evenly distributed",
                    "Engage thighs, lengthen spine",
                    "Shoulders back and down",
                    "Eyes forward, chin parallel to ground",
                    "Feel rooted and strong",
                ],
                difficulty: "beginner",
            },
            {
                id: "sun-salutation-a",
                name: "Sun Salutation A (Surya Namaskar A)",
                duration: 180,
                description: "Complete 2-3 rounds to build heat and energy",
                benefits: [
                    "Warms entire body",
                    "Improves flexibility",
                    "Builds strength and endurance",
                    "Synchronized with breath",
                ],
                alignment: [
                    "1. Mountain pose",
                    "2. Inhale, arms overhead",
                    "3. Exhale, fold forward",
                    "4. Inhale, lengthen spine, halfway lift",
                    "5. Exhale, step or hop back to plank",
                    "6. Lower to push-up or knees",
                    "7. Inhale, upward-facing dog",
                    "8. Exhale, downward-facing dog",
                    "9. Inhale, step forward, fold",
                    "10. Inhale, rise with arms up",
                    "11. Exhale, mountain pose",
                    "Repeat 2-3 times",
                ],
                difficulty: "beginner",
            },
            {
                id: "standing-side-stretch",
                name: "Standing Side Stretch",
                duration: 60,
                description: "Lengthen the sides of the body",
                benefits: ["Stretches side body", "Improves breathing", "Opens hips"],
                alignment: [
                    "Stand with feet hip-width apart",
                    "Inhale, raise left arm overhead",
                    "Exhale, lean gently to the right",
                    "Keep hips stable, reach up and out",
                    "Breathe for 30 seconds",
                    "Switch sides",
                ],
                difficulty: "beginner",
            },
        ],
    },
    {
        id: "hip-opener-flow",
        name: "Hip Opener & Feminine Flow",
        description: "Open hips, build curves, and embrace femininity",
        focus: ["hips", "flexibility", "feminine energy"],
        totalTime: 30,
        difficulty: "intermediate",
        whenToPractice: "Mid-morning or afternoon, after warm-up",
        poses: [
            {
                id: "warm-up-sun-sal",
                name: "Sun Salutation (Warm-up)",
                duration: 180,
                description: "2-3 rounds to warm the body",
                benefits: ["Warm muscles", "Build circulation", "Mental focus"],
                alignment: ["Perform 2-3 rounds of Sun Salutation A as described above"],
                difficulty: "beginner",
            },
            {
                id: "pigeon-pose",
                name: "Pigeon Pose (Eka Pada Rajakapotasana prep)",
                duration: 120,
                description: "Deep hip opener, excellent for hip width development",
                benefits: [
                    "Opens hip flexors and external rotators",
                    "Builds hip flexibility",
                    "Releases lower back tension",
                ],
                alignment: [
                    "From downward dog, bring right foot forward between hands",
                    "Right knee behind right wrist, right ankle toward left wrist",
                    "Keep hips level, fold forward slowly",
                    "Stay for 5-8 breaths, feel deep stretch",
                    "Don't force - listen to your body",
                    "Switch sides",
                ],
                difficulty: "intermediate",
            },
            {
                id: "butterfly-pose",
                name: "Butterfly Pose (Baddha Konasana)",
                duration: 120,
                description: "Open inner thighs and hip area",
                benefits: [
                    "Stretches inner thighs",
                    "Opens hips",
                    "Improves hip flexibility",
                    "Connects with feminine energy",
                ],
                alignment: [
                    "Sit on mat, bend knees bringing soles together",
                    "Hold feet or shins",
                    "Gently press knees toward ground with elbows",
                    "Lengthen spine, fold forward slightly if comfortable",
                    "Breathe for 8-12 breaths",
                ],
                difficulty: "beginner",
            },
            {
                id: "low-lunge",
                name: "Low Lunge (Anjaneyasana)",
                duration: 120,
                description: "Open hip flexors and build feminine energy",
                benefits: [
                    "Stretches hip flexors",
                    "Opens chest and shoulders",
                    "Builds lower body strength",
                ],
                alignment: [
                    "From downward dog, step right foot forward",
                    "Sink hips low, back knee down",
                    "Hands frame front foot or reach overhead",
                    "Square shoulders, gaze forward",
                    "Hold for 5-8 breaths each side",
                ],
                difficulty: "intermediate",
            },
            {
                id: "goddess-pose",
                name: "Goddess Pose (Utkata Konasana)",
                duration: 90,
                description: "Embody power, femininity, and inner goddess",
                benefits: [
                    "Strengthens legs and glutes",
                    "Opens hips",
                    "Builds confidence and power",
                    "Improves lower body stability",
                ],
                alignment: [
                    "Stand with feet wider than hip-width",
                    "Turn toes out 45 degrees",
                    "Bend knees, lower hips, thighs toward parallel",
                    "Keep chest upright, hands at heart or overhead",
                    "Feel strong and grounded",
                    "Hold for 5-8 breaths",
                ],
                difficulty: "intermediate",
            },
            {
                id: "lizard-pose",
                name: "Lizard Pose (Utthan Pristhasana)",
                duration: 90,
                description: "Deep hip and inner thigh stretch",
                benefits: [
                    "Opens hips and groin",
                    "Stretches inner thighs",
                    "Builds hip flexibility",
                ],
                alignment: [
                    "From low lunge, hands to inside of front foot",
                    "Keep back knee on mat",
                    "Sink hips lower, feel deep stretch in inner thigh",
                    "Option: lower forearms to ground",
                    "Breathe for 5-8 breaths each side",
                ],
                difficulty: "intermediate",
            },
            {
                id: "reclined-butterfly",
                name: "Reclined Butterfly (Cool Down)",
                duration: 120,
                description: "Gentle hip opener while recovering",
                benefits: [
                    "Passive hip opening",
                    "Calms nervous system",
                    "Improves circulation to hips",
                ],
                alignment: [
                    "Lie on back",
                    "Bring soles of feet together, knees falling open",
                    "Arms can rest at sides or on belly",
                    "Let gravity do the work",
                    "Relax for 2 minutes",
                ],
                difficulty: "beginner",
            },
        ],
    },
    {
        id: "feminine-core-strength",
        name: "Feminine Core & Waist Yoga",
        description: "Strengthen core and develop a beautiful, cinched waist",
        focus: ["core", "waist", "stability"],
        totalTime: 25,
        difficulty: "intermediate",
        whenToPractice: "Any time, 2-3 times per week",
        poses: [
            {
                id: "warm-cat-cow",
                name: "Cat-Cow Warm-up",
                duration: 120,
                description: "Activate the core and warm the spine",
                benefits: ["Activates core", "Mobilizes spine", "Prepares for strengthening"],
                alignment: ["10-12 rounds of cat-cow as described in Morning Flow"],
                difficulty: "beginner",
            },
            {
                id: "plank-pose",
                name: "Plank Pose (Phalakasana)",
                duration: 60,
                description: "Build core strength and stability",
                benefits: [
                    "Strengthens core muscles",
                    "Builds arm and shoulder strength",
                    "Improves posture",
                ],
                alignment: [
                    "From tabletop, step back to plank position",
                    "Shoulders over wrists, body in straight line",
                    "Engage core, squeeze glutes",
                    "Don't let hips sag or pike up",
                    "Hold for 30-45 seconds",
                ],
                difficulty: "intermediate",
            },
            {
                id: "side-plank-right",
                name: "Side Plank Right (Vasisthasana)",
                duration: 45,
                description: "Strengthen obliques for waist definition",
                benefits: [
                    "Strengthens obliques",
                    "Builds side body strength",
                    "Improves balance",
                ],
                alignment: [
                    "From plank, shift to outer edge of right foot",
                    "Stack left foot on top or step left foot forward",
                    "Lift left arm toward ceiling",
                    "Body in straight line, engage core",
                    "Hold for 20-30 seconds",
                ],
                difficulty: "intermediate",
            },
            {
                id: "side-plank-left",
                name: "Side Plank Left",
                duration: 45,
                description: "Balance the other side",
                benefits: ["Even waist development", "Balanced strength"],
                alignment: ["Repeat on left side for 20-30 seconds"],
                difficulty: "intermediate",
            },
            {
                id: "boat-pose",
                name: "Boat Pose (Navasana)",
                duration: 60,
                description: "Core strengthening powerhouse",
                benefits: [
                    "Strengthens deep abdominals",
                    "Builds waist definition",
                    "Improves posture and balance",
                ],
                alignment: [
                    "Sit with knees bent, feet on floor",
                    "Lean back slightly, lift feet off ground",
                    "Shins parallel to ground",
                    "Option: straighten legs to V position",
                    "Keep chest up, core engaged",
                    "Hold for 20-30 seconds, rest, repeat 3x",
                ],
                difficulty: "intermediate",
            },
            {
                id: "twisting-chair",
                name: "Twisted Chair Pose (Parivrtta Utkatasana)",
                duration: 60,
                description: "Twist to activate obliques and detoxify",
                benefits: [
                    "Activates obliques",
                    "Aids digestion",
                    "Builds leg strength",
                    "Detoxifies waist area",
                ],
                alignment: [
                    "Stand with feet together",
                    "Bend knees into chair position",
                    "Bring hands to heart center",
                    "Exhale, twist to the right, hook left elbow outside right knee",
                    "Press palms together, lengthen spine",
                    "Hold for 5 breaths, switch sides",
                ],
                difficulty: "intermediate",
            },
            {
                id: "locust-pose",
                name: "Locust Pose (Salabhasana)",
                duration: 60,
                description: "Strengthen back body and core",
                benefits: [
                    "Strengthens back and glutes",
                    "Improves posture",
                    "Activates core",
                ],
                alignment: [
                    "Lie face down, legs extended",
                    "Arms alongside body, palms down",
                    "Inhale, lift chest and legs off ground",
                    "Keep gaze down, neck neutral",
                    "Squeeze glutes and core",
                    "Hold for 30 seconds",
                ],
                difficulty: "intermediate",
            },
            {
                id: "corpse-pose",
                name: "Corpse Pose - Cool Down (Savasana)",
                duration: 300,
                description: "Integrate benefits and relax",
                benefits: [
                    "Allows nervous system to absorb benefits",
                    "Deep relaxation",
                    "Mental clarity",
                ],
                alignment: [
                    "Lie on back, legs extended naturally",
                    "Arms at sides, palms up",
                    "Let entire body relax",
                    "Close eyes and breathe naturally",
                    "Rest for 5 minutes",
                ],
                difficulty: "beginner",
            },
        ],
    },
    {
        id: "evening-wind-down",
        name: "Evening Wind-Down Yoga",
        description: "Calm your mind and prepare your body for restful sleep",
        focus: ["relaxation", "sleep", "recovery"],
        totalTime: 20,
        difficulty: "beginner",
        whenToPractice: "Evening, 1 hour before bed",
        poses: [
            {
                id: "seated-forward-fold",
                name: "Seated Forward Fold (Paschimottasana)",
                duration: 120,
                description: "Stretch the back body and calm the mind",
                benefits: [
                    "Stretches hamstrings and back",
                    "Calms nervous system",
                    "Reduces anxiety",
                ],
                alignment: [
                    "Sit with legs extended",
                    "Flex feet, lengthen through heels",
                    "Inhale, lengthen spine",
                    "Exhale, fold forward at hips",
                    "Let head and shoulders relax",
                    "Hold for 1-2 minutes",
                ],
                difficulty: "beginner",
            },
            {
                id: "half-pigeon-evening",
                name: "Half Pigeon (Reclined)",
                duration: 120,
                description: "Gentle hip opener before sleep",
                benefits: [
                    "Releases hip tension",
                    "Calms nervous system",
                    "Prepares body for sleep",
                ],
                alignment: [
                    "Lie on back",
                    "Cross right ankle over left knee",
                    "Pull left knee toward chest gently",
                    "Let hips and lower back relax",
                    "Hold for 1 minute each side",
                ],
                difficulty: "beginner",
            },
            {
                id: "knees-to-chest",
                name: "Knees to Chest Pose",
                duration: 90,
                description: "Release lower back tension",
                benefits: [
                    "Releases lower back",
                    "Aids digestion",
                    "Calms the mind",
                ],
                alignment: [
                    "Lie on back",
                    "Bring knees to chest",
                    "Hold shins or wrap arms around legs",
                    "Rock gently side to side",
                    "Hold for 1-2 minutes",
                ],
                difficulty: "beginner",
            },
            {
                id: "supine-twist",
                name: "Supine Twist (Supta Matsyendrasana)",
                duration: 90,
                description: "Detox twist to end the day",
                benefits: [
                    "Detoxifies spine",
                    "Releases side body",
                    "Aids digestion",
                    "Calms mind",
                ],
                alignment: [
                    "Lie on back, hug knees to chest",
                    "Drop both knees to right, head to left",
                    "Option: extend right arm out",
                    "Breathe deeply for 1 minute",
                    "Switch sides",
                ],
                difficulty: "beginner",
            },
            {
                id: "final-savasana",
                name: "Final Savasana (5 minutes)",
                duration: 300,
                description: "Deep rest and integration",
                benefits: [
                    "Complete relaxation",
                    "Mental peace",
                    "Prepares for sleep",
                    "Integrates practice benefits",
                ],
                alignment: [
                    "Lie flat on back",
                    "Legs extended naturally, about hip-width apart",
                    "Arms at sides, palms facing up",
                    "Close eyes",
                    "Breathe naturally, let thoughts pass",
                    "Rest for 5 full minutes",
                    "Allow body to drift into sleep feeling",
                ],
                difficulty: "beginner",
            },
        ],
    },
];

export default function YogaRoutines() {
    const [selectedSequence, setSelectedSequence] = useState<YogaSequence | null>(null);
    const [currentPoseIdx, setCurrentPoseIdx] = useState(0);
    const [completedPoses, setCompletedPoses] = useState<string[]>([]);

    const togglePose = (poseId: string) => {
        setCompletedPoses((prev) =>
            prev.includes(poseId) ? prev.filter((id) => id !== poseId) : [...prev, poseId]
        );
    };

    const currentPose = selectedSequence ? selectedSequence.poses[currentPoseIdx] : null;
    const sequenceProgress = selectedSequence
        ? Math.round((completedPoses.length / selectedSequence.poses.length) * 100)
        : 0;

    if (!selectedSequence) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Yoga Sequences</h2>
                        <p className="text-sm text-muted-foreground">Find your flow with guided practices</p>
                    </div>
                    <Wind className="w-8 h-8 text-cyan-400" />
                </div>

                {/* Sequence Cards */}
                <div className="space-y-3">
                    {yogaSequences.map((sequence) => (
                        <motion.button
                            key={sequence.id}
                            onClick={() => {
                                setSelectedSequence(sequence);
                                setCurrentPoseIdx(0);
                                setCompletedPoses([]);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-bold text-base text-foreground">{sequence.name}</h3>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">
                                        {sequence.description}
                                    </p>
                                </div>
                                <Wind className="w-5 h-5 text-cyan-400 shrink-0" />
                            </div>

                            <div className="flex items-center gap-3 flex-wrap text-xs">
                                <span className={clsx(
                                    "px-2 py-1 rounded-full font-bold",
                                    sequence.difficulty === "beginner"
                                        ? "bg-green-500/20 text-green-300"
                                        : sequence.difficulty === "intermediate"
                                        ? "bg-yellow-500/20 text-yellow-300"
                                        : "bg-red-500/20 text-red-300"
                                )}>
                                    {sequence.difficulty}
                                </span>
                                <span className="text-muted-foreground font-semibold">⏱️ {sequence.totalTime} min</span>
                                <span className="text-muted-foreground font-semibold">🧘 {sequence.poses.length} poses</span>
                                <span className="text-muted-foreground font-semibold italic">{sequence.whenToPractice}</span>
                            </div>

                            <div className="flex gap-1 flex-wrap mt-3">
                                {sequence.focus.map((f) => (
                                    <span key={f} className="text-xs bg-white/10 px-2 py-1 rounded text-foreground font-medium">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // Render pose-specific animation
    function renderPoseAnimation(poseId: string) {
        // Map poses to demonstration images from a yoga pose library
        const poseImages: Record<string, string> = {
            "child-pose": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&fit=crop&q=80",
            "cat-cow": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&q=80",
            "downward-dog": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&q=80",
            "warrior-1": "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=400&h=300&fit=crop&q=80",
            "tree-pose": "https://images.unsplash.com/photo-1599447292023-05bae1a03c3c?w=400&h=300&fit=crop&q=80",
            "triangle-pose": "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=400&h=300&fit=crop&q=80",
            "bridge-pose": "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=300&fit=crop&q=80",
            "cobra-pose": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop&q=80",
            "pigeon-pose": "https://images.unsplash.com/photo-1506126279646-a697353d3166?w=400&h=300&fit=crop&q=80",
            "seated-forward-fold": "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=300&fit=crop&q=80",
            "corpse-pose": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop&q=80",
            "happy-baby": "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=400&h=300&fit=crop&q=80",
            "low-lunge": "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=300&fit=crop&q=80",
            "lizard-lunge": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&fit=crop&q=80",
            "reclined-butterfly": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop&q=80",
        };

        const imageUrl = poseImages[poseId];

        if (imageUrl) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full max-w-sm mx-auto aspect-[4/3] rounded-lg overflow-hidden"
                >
                    <img
                        src={imageUrl}
                        alt={`Yoga pose demonstration`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold drop-shadow-lg bg-black/75 backdrop-blur-sm px-3 py-2 rounded-md border border-white/10">
                        Follow the alignment steps below for proper form
                    </div>
                </motion.div>
            );
        }

        // Default fallback
        return (
            <motion.div className="relative w-full max-w-sm mx-auto aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <div className="absolute bottom-4 text-xs text-center text-muted-foreground font-medium px-4">
                    Follow the steps below for proper form
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setSelectedSequence(null)}
                    className="text-sm text-primary font-semibold hover:underline"
                >
                    ← Back to Sequences
                </button>
                <h2 className="text-2xl font-bold text-center flex-1">{selectedSequence.name}</h2>
                <div className="w-12" />
            </div>

            {/* Info Card */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <p className="text-sm text-foreground font-medium">{selectedSequence.description}</p>
                <p className="text-xs text-muted-foreground mt-2 italic">Best: {selectedSequence.whenToPractice}</p>
            </div>

            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Practice Progress</span>
                    <span className="text-sm font-bold text-cyan-300">{sequenceProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sequenceProgress}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    {completedPoses.length} of {selectedSequence.poses.length} poses completed
                </p>
            </div>

            {/* Current Pose */}
            {currentPose && (
                <motion.div
                    key={currentPose.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-4"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground font-semibold">
                                Pose {currentPoseIdx + 1} of {selectedSequence.poses.length}
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{currentPose.name}</h3>
                        </div>
                        <span className={clsx(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            currentPose.difficulty === "beginner"
                                ? "bg-green-500/20 text-green-300"
                                : currentPose.difficulty === "intermediate"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-red-500/20 text-red-300"
                        )}>
                            {currentPose.difficulty}
                        </span>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium">{currentPose.description}</p>

                    {/* Pose Animation Demo */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6">
                        <div className="text-xs text-purple-300 font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            POSE DEMONSTRATION
                        </div>
                        <div className="flex justify-center">
                            {renderPoseAnimation(currentPose.id)}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 w-fit">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <div>
                            <div className="text-xs text-muted-foreground font-semibold">Duration</div>
                            <div className="text-sm font-bold text-foreground">
                                {Math.floor(currentPose.duration / 60)}:{(currentPose.duration % 60).toString().padStart(2, "0")}
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                        <div className="text-xs text-purple-300 font-bold mb-2">BENEFITS</div>
                        <ul className="space-y-1">
                            {currentPose.benefits.map((benefit, idx) => (
                                <li key={idx} className="text-xs text-foreground font-medium flex items-start gap-2">
                                    <span className="text-purple-400 shrink-0">✓</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Alignment & Form */}
                    <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                        <div className="text-xs text-blue-300 font-bold mb-2">HOW TO PERFORM</div>
                        <ol className="space-y-1">
                            {currentPose.alignment.map((step, idx) => (
                                <li key={idx} className="text-xs text-foreground font-medium flex items-start gap-2">
                                    <span className="text-blue-400 shrink-0">{idx + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Mark Complete */}
                    <button
                        onClick={() => {
                            togglePose(currentPose.id);
                            if (currentPoseIdx < selectedSequence.poses.length - 1) {
                                setCurrentPoseIdx(currentPoseIdx + 1);
                            }
                        }}
                        className={clsx(
                            "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                            completedPoses.includes(currentPose.id)
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                        )}
                    >
                        {completedPoses.includes(currentPose.id) ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Completed
                            </>
                        ) : (
                            <>
                                <Circle className="w-5 h-5" />
                                Complete & Next
                            </>
                        )}
                    </button>
                </motion.div>
            )}

            {/* Pose List */}
            <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Poses</div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedSequence.poses.map((pose, idx) => {
                        const isCompleted = completedPoses.includes(pose.id);
                        const isCurrent = idx === currentPoseIdx;

                        return (
                            <motion.button
                                key={pose.id}
                                onClick={() => setCurrentPoseIdx(idx)}
                                className={clsx(
                                    "w-full text-left p-3 rounded-lg transition-all flex items-center justify-between",
                                    isCurrent
                                        ? "bg-cyan-500/20 border border-cyan-500/50"
                                        : isCompleted
                                        ? "bg-green-500/10 border border-green-500/30"
                                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                                    )}
                                    <div>
                                        <div className="text-sm font-bold text-foreground">{pose.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {Math.floor(pose.duration / 60)}:{(pose.duration % 60).toString().padStart(2, "0")} • {pose.difficulty}
                                        </div>
                                    </div>
                                </div>
                                {isCurrent && <span className="text-xs font-bold text-cyan-300">Now</span>}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

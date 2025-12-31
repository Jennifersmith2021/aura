"use client";

import { useState } from "react";
import { Activity, Dumbbell, CheckCircle2, Circle, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Exercise {
    id: string;
    name: string;
    reps?: number;
    sets?: number;
    duration?: number; // in seconds
    description: string;
    form: string[];
    difficulty: "beginner" | "intermediate" | "advanced";
    imageUrl?: string;
}

interface WorkoutRoutine {
    id: string;
    name: string;
    description: string;
    focus: string[];
    exercises: Exercise[];
    totalTime: number; // minutes
    difficulty: "beginner" | "intermediate" | "advanced";
}

const feminineWorkouts: WorkoutRoutine[] = [
    {
        id: "glute-hip-builder",
        name: "Glute & Hip Builder",
        description: "Build a feminine curve with hip and glute-focused exercises",
        focus: ["glutes", "hips", "thighs"],
        difficulty: "beginner",
        totalTime: 35,
        exercises: [
            {
                id: "warm-up-walking",
                name: "Warm-up: Brisk Walking",
                duration: 300,
                description: "Get blood flowing and warm up muscles",
                form: [
                    "Walk at a moderate pace",
                    "Engage your core",
                    "Swing arms naturally",
                    "Keep posture upright",
                ],
                difficulty: "beginner",
            },
            {
                id: "glute-bridges",
                name: "Glute Bridges",
                sets: 3,
                reps: 15,
                description: "Activate and build glute muscles",
                form: [
                    "Lie on your back, knees bent, feet hip-width apart",
                    "Press through heels and lift hips toward ceiling",
                    "Squeeze glutes at the top",
                    "Lower without touching ground",
                    "Keep core engaged throughout",
                ],
                difficulty: "beginner",
                imageUrl: "https://images.unsplash.com/photo-1638361471550-34d3ca1ffa3e?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "lateral-leg-raises",
                name: "Lateral Leg Raises",
                sets: 3,
                reps: 12,
                description: "Build hip width and side glute definition",
                form: [
                    "Stand with feet together, hands on hips",
                    "Keep core engaged",
                    "Lift one leg out to the side to hip height",
                    "Keep leg straight but not locked",
                    "Lower with control",
                    "Alternate sides",
                ],
                difficulty: "beginner",
                imageUrl: "https://images.unsplash.com/photo-1539143072961-a0ffcff30cc0?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "squats",
                name: "Bodyweight Squats",
                sets: 3,
                reps: 15,
                description: "Build full leg and glute strength",
                form: [
                    "Stand with feet shoulder-width apart",
                    "Lower hips as if sitting back in a chair",
                    "Keep chest up, eyes forward",
                    "Press through heels to stand",
                    "Keep knees tracking over toes",
                ],
                difficulty: "beginner",
                imageUrl: "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "donkey-kicks",
                name: "Donkey Kicks",
                sets: 3,
                reps: 12,
                description: "Isolate and burn glute muscles",
                form: [
                    "Start on hands and knees",
                    "Keep right knee bent at 90 degrees",
                    "Press right leg up and back, squeezing glute",
                    "Lower without touching ground",
                    "Complete all reps, switch legs",
                ],
                difficulty: "beginner",
                imageUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "cool-down-stretch",
                name: "Cool-down: Hip & Glute Stretch",
                duration: 180,
                description: "Stretch and recover",
                form: [
                    "Pigeon pose: 30 seconds each side",
                    "Quad stretch: 30 seconds each leg",
                    "Forward fold: 60 seconds",
                ],
                difficulty: "beginner",
            },
        ],
    },
    {
        id: "waist-cinch-core",
        name: "Waist-Cinching Core",
        description: "Develop core strength and definition for an hourglass figure",
        focus: ["core", "waist", "obliques"],
        difficulty: "intermediate",
        totalTime: 30,
        exercises: [
            {
                id: "cardio-warm",
                name: "Warm-up: Light Cardio",
                duration: 300,
                description: "Elevate heart rate",
                form: [
                    "Jumping jacks or marching in place",
                    "3-5 minutes moderate intensity",
                ],
                difficulty: "beginner",
            },
            {
                id: "planks",
                name: "Planks",
                sets: 3,
                duration: 30,
                description: "Build deep core strength",
                form: [
                    "Start in push-up position",
                    "Body in straight line from head to heels",
                    "Engage core, squeeze glutes",
                    "Don't let hips sag or pike up",
                    "Breathe steadily",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1571988634269-6a7c58a8c04d?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "side-planks",
                name: "Side Planks",
                sets: 3,
                duration: 20,
                description: "Target obliques for waist definition",
                form: [
                    "Lie on your side, prop on forearm",
                    "Body in straight line",
                    "Lift hips off ground",
                    "Squeeze obliques",
                    "Switch sides",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1598971457318-b3d1e44a72a7?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "russian-twists",
                name: "Russian Twists",
                sets: 3,
                reps: 20,
                description: "Carve out waist and engage obliques",
                form: [
                    "Sit with knees bent, feet elevated",
                    "Lean back slightly, keep chest up",
                    "Rotate torso side to side",
                    "Keep core engaged throughout",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1544367567-0d6fcffe5d1d?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "bicycle-crunches",
                name: "Bicycle Crunches",
                sets: 3,
                reps: 15,
                description: "Tone abs and obliques",
                form: [
                    "Lie on back, hands behind head",
                    "Lift shoulders, bring right elbow to left knee",
                    "Extend right leg",
                    "Alternate sides in cycling motion",
                    "Move with control",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1539143072961-a0ffcff30cc0?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "core-stretch",
                name: "Cool-down: Core Stretch",
                duration: 180,
                description: "Relax and stretch",
                form: [
                    "Child's pose: 60 seconds",
                    "Cat-cow stretch: 60 seconds",
                ],
                difficulty: "beginner",
            },
        ],
    },
    {
        id: "full-body-feminine",
        name: "Full-Body Feminine Toning",
        description: "Comprehensive workout emphasizing feminine curves and strength",
        focus: ["full-body", "curves", "toning"],
        difficulty: "intermediate",
        totalTime: 45,
        exercises: [
            {
                id: "dynamic-warm",
                name: "Dynamic Warm-up",
                duration: 300,
                description: "Prepare body for exercise",
                form: [
                    "Arm circles: 10 each direction",
                    "Leg swings: 10 each leg, each direction",
                    "Bodyweight squats: 10 reps",
                    "Push-ups: 10 reps",
                ],
                difficulty: "beginner",
            },
            {
                id: "incline-push-ups",
                name: "Incline Push-ups",
                sets: 3,
                reps: 10,
                description: "Tone arms, chest, and shoulders",
                form: [
                    "Hands on elevated surface (desk, counter)",
                    "Body in straight line",
                    "Lower chest toward hands",
                    "Press back up",
                    "Keep core tight",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1584622302111-993a426fbf0a?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "sumo-squats",
                name: "Sumo Squats",
                sets: 3,
                reps: 15,
                description: "Build inner thighs and glutes",
                form: [
                    "Stand with feet wide, toes turned out",
                    "Lower hips straight down",
                    "Keep chest up, weight in heels",
                    "Press through heels to stand",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1606335289042-b21cdc26f0cf?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "tricep-dips",
                name: "Tricep Dips",
                sets: 3,
                reps: 10,
                description: "Tone arm triceps",
                form: [
                    "Use a chair or bench",
                    "Hands shoulder-width apart",
                    "Lower body by bending elbows",
                    "Elbows stay close to body",
                    "Press back up",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1552345386-bbeb84bb693b?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "fire-hydrants",
                name: "Fire Hydrants",
                sets: 3,
                reps: 12,
                description: "Sculpt hips and glutes",
                form: [
                    "Start on hands and knees",
                    "Lift one leg out to the side",
                    "Keep knee bent at 90 degrees",
                    "Pulse slightly at top",
                    "Lower and alternate",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1594737565514-8d1e373f9a9b?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "reverse-lunges",
                name: "Reverse Lunges",
                sets: 2,
                reps: 10,
                description: "Tone legs and glutes",
                form: [
                    "Stand with feet together",
                    "Step back with one leg",
                    "Lower back knee toward ground",
                    "Front knee bends to 90 degrees",
                    "Push through front heel to return",
                    "Alternate legs",
                ],
                difficulty: "intermediate",
                imageUrl: "https://images.unsplash.com/photo-1609899753433-6f6f6932cf90?w=500&h=400&fit=crop&q=80",
            },
            {
                id: "full-stretch",
                name: "Full-Body Stretch",
                duration: 300,
                description: "Cool down and recover",
                form: [
                    "Hamstring stretch: 30 seconds each leg",
                    "Quad stretch: 30 seconds each leg",
                    "Shoulder stretch: 30 seconds",
                    "Child's pose: 60 seconds",
                ],
                difficulty: "beginner",
            },
        ],
    },
];

export default function FeminineWorkoutRoutines() {
    const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [completedExercises, setCompletedExercises] = useState<string[]>([]);

    const toggleExercise = (exerciseId: string) => {
        setCompletedExercises((prev) =>
            prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId]
        );
    };

    const currentExercise = selectedRoutine ? selectedRoutine.exercises[currentExerciseIdx] : null;
    const routineProgress = selectedRoutine
        ? Math.round((completedExercises.length / selectedRoutine.exercises.length) * 100)
        : 0;

    if (!selectedRoutine) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Feminine Workout Routines</h2>
                        <p className="text-sm text-muted-foreground">Build curves and tone for a feminine figure</p>
                    </div>
                    <Dumbbell className="w-8 h-8 text-pink-400" />
                </div>

                {/* Routine Cards */}
                <div className="space-y-3">
                    {feminineWorkouts.map((routine) => (
                        <motion.button
                            key={routine.id}
                            onClick={() => {
                                setSelectedRoutine(routine);
                                setCurrentExerciseIdx(0);
                                setCompletedExercises([]);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-bold text-base text-foreground">{routine.name}</h3>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">
                                        {routine.description}
                                    </p>
                                </div>
                                <Activity className="w-5 h-5 text-pink-400 shrink-0" />
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={clsx(
                                    "px-2 py-1 rounded-full text-xs font-bold",
                                    routine.difficulty === "beginner"
                                        ? "bg-green-500/20 text-green-300"
                                        : routine.difficulty === "intermediate"
                                        ? "bg-yellow-500/20 text-yellow-300"
                                        : "bg-red-500/20 text-red-300"
                                )}>
                                    {routine.difficulty}
                                </span>
                                <span className="text-xs text-muted-foreground font-semibold">
                                    ⏱️ {routine.totalTime} min
                                </span>
                                <span className="text-xs text-muted-foreground font-semibold">
                                    📋 {routine.exercises.length} exercises
                                </span>
                                <div className="flex gap-1 flex-wrap">
                                    {routine.focus.map((f) => (
                                        <span key={f} className="text-xs bg-white/10 px-2 py-1 rounded text-foreground font-medium">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setSelectedRoutine(null)}
                    className="text-sm text-primary font-semibold hover:underline"
                >
                    ← Back to Routines
                </button>
                <h2 className="text-2xl font-bold text-center flex-1">{selectedRoutine.name}</h2>
                <div className="w-12" />
            </div>

            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30 p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Workout Progress</span>
                    <span className="text-sm font-bold text-pink-300">{routineProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${routineProgress}%` }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    {completedExercises.length} of {selectedRoutine.exercises.length} exercises completed
                </p>
            </div>

            {/* Current Exercise */}
            {currentExercise && (
                <motion.div
                    key={currentExercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-4"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground font-semibold">
                                Exercise {currentExerciseIdx + 1} of {selectedRoutine.exercises.length}
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{currentExercise.name}</h3>
                        </div>
                        <span className={clsx(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            currentExercise.difficulty === "beginner"
                                ? "bg-green-500/20 text-green-300"
                                : currentExercise.difficulty === "intermediate"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-red-500/20 text-red-300"
                        )}>
                            {currentExercise.difficulty}
                        </span>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium">{currentExercise.description}</p>

                    {/* Image */}
                    {currentExercise.imageUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-xl overflow-hidden aspect-[4/3]"
                        >
                            <img
                                src={currentExercise.imageUrl}
                                alt={currentExercise.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        </motion.div>
                    )}

                    {/* Reps/Duration */}
                    <div className="flex gap-3">
                        {currentExercise.sets && (
                            <div className="bg-white/10 rounded-lg px-3 py-2">
                                <div className="text-xs text-muted-foreground font-semibold">Sets</div>
                                <div className="text-lg font-bold text-foreground">{currentExercise.sets}</div>
                            </div>
                        )}
                        {currentExercise.reps && (
                            <div className="bg-white/10 rounded-lg px-3 py-2">
                                <div className="text-xs text-muted-foreground font-semibold">Reps</div>
                                <div className="text-lg font-bold text-foreground">{currentExercise.reps}</div>
                            </div>
                        )}
                        {currentExercise.duration && (
                            <div className="bg-white/10 rounded-lg px-3 py-2">
                                <div className="text-xs text-muted-foreground font-semibold">Duration</div>
                                <div className="text-lg font-bold text-foreground">
                                    {Math.floor(currentExercise.duration / 60)}:{(currentExercise.duration % 60).toString().padStart(2, "0")}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Tips */}
                    <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                        <div className="text-xs text-blue-300 font-bold mb-2">FORM TIPS</div>
                        <ul className="space-y-1">
                            {currentExercise.form.map((tip, idx) => (
                                <li key={idx} className="text-xs text-foreground font-medium flex items-start gap-2">
                                    <span className="text-blue-400 shrink-0">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mark Complete */}
                    <button
                        onClick={() => {
                            toggleExercise(currentExercise.id);
                            if (currentExerciseIdx < selectedRoutine.exercises.length - 1) {
                                setCurrentExerciseIdx(currentExerciseIdx + 1);
                            }
                        }}
                        className={clsx(
                            "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                            completedExercises.includes(currentExercise.id)
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                        )}
                    >
                        {completedExercises.includes(currentExercise.id) ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Completed
                            </>
                        ) : (
                            <>
                                <Circle className="w-5 h-5" />
                                Mark Complete & Next
                            </>
                        )}
                    </button>
                </motion.div>
            )}

            {/* Exercise List */}
            <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Exercises</div>
                <div className="space-y-2">
                    {selectedRoutine.exercises.map((exercise, idx) => {
                        const isCompleted = completedExercises.includes(exercise.id);
                        const isCurrent = idx === currentExerciseIdx;

                        return (
                            <motion.button
                                key={exercise.id}
                                onClick={() => setCurrentExerciseIdx(idx)}
                                className={clsx(
                                    "w-full text-left p-3 rounded-lg transition-all flex items-center justify-between",
                                    isCurrent
                                        ? "bg-pink-500/20 border border-pink-500/50"
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
                                        <div className="text-sm font-bold text-foreground">{exercise.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {exercise.sets && `${exercise.sets} sets`}
                                            {exercise.reps && ` × ${exercise.reps} reps`}
                                            {exercise.duration && ` ${Math.floor(exercise.duration / 60)}:${(exercise.duration % 60).toString().padStart(2, "0")}`}
                                        </div>
                                    </div>
                                </div>
                                {isCurrent && <span className="text-xs font-bold text-pink-300">Now</span>}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

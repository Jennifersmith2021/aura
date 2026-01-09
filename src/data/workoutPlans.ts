/**
 * Preset workout plan templates
 * Ready-to-use weekly workout plans for different goals
 */

export interface PresetExercise {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    youtubeUrl?: string;
    notes?: string;
}

export interface PresetWorkoutPlan {
    id: string;
    name: string;
    description: string;
    goal: 'feminization' | 'weight-loss' | 'toning' | 'flexibility' | 'strength';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    daysPerWeek: number;
    exercises: PresetExercise[];
}

export const PRESET_WORKOUT_PLANS: PresetWorkoutPlan[] = [
    {
        id: 'fem-curves-beginner',
        name: 'Feminine Curves - Beginner',
        description: 'Build curvy hips, toned thighs, and a shapely butt. Perfect for beginners.',
        goal: 'feminization',
        difficulty: 'beginner',
        daysPerWeek: 3,
        exercises: [
            {
                name: 'Hip Thrusts',
                sets: 3,
                reps: 12,
                youtubeUrl: 'https://www.youtube.com/watch?v=SEdqd1n0cvg',
                notes: 'Focus on squeezing glutes at the top'
            },
            {
                name: 'Squats',
                sets: 3,
                reps: 15,
                youtubeUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
                notes: 'Keep back straight, push through heels'
            },
            {
                name: 'Lunges',
                sets: 3,
                reps: 10,
                notes: 'Alternate legs, keep front knee behind toes'
            },
            {
                name: 'Fire Hydrants',
                sets: 3,
                reps: 15,
                youtubeUrl: 'https://www.youtube.com/watch?v=SLJqxdflipg',
                notes: 'Great for hip rounding'
            },
            {
                name: 'Donkey Kicks',
                sets: 3,
                reps: 15,
                notes: 'Keep core tight, squeeze at top'
            },
            {
                name: 'Side-Lying Leg Lifts',
                sets: 3,
                reps: 20,
                notes: 'Builds outer hip curve'
            },
        ]
    },
    {
        id: 'waist-training-toning',
        name: 'Waist Training & Core Toning',
        description: 'Sculpt a defined waist and strengthen your core for a feminine hourglass shape.',
        goal: 'toning',
        difficulty: 'beginner',
        daysPerWeek: 4,
        exercises: [
            {
                name: 'Russian Twists',
                sets: 3,
                reps: 20,
                youtubeUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
                notes: 'Works obliques for waist definition'
            },
            {
                name: 'Bicycle Crunches',
                sets: 3,
                reps: 20,
                notes: 'Engage core throughout'
            },
            {
                name: 'Plank',
                sets: 3,
                reps: 30,
                notes: 'Hold for 30-60 seconds'
            },
            {
                name: 'Side Plank (each side)',
                sets: 2,
                reps: 20,
                notes: 'Hold 20-30 seconds each side'
            },
            {
                name: 'Dead Bug',
                sets: 3,
                reps: 12,
                notes: 'Controlled movement, press back to floor'
            },
            {
                name: 'Standing Oblique Crunches',
                sets: 3,
                reps: 15,
                notes: 'Alternate sides, focus on contraction'
            },
        ]
    },
    {
        id: 'flexibility-grace',
        name: 'Flexibility & Grace',
        description: 'Improve flexibility, posture, and graceful movement. Yoga-inspired routine.',
        goal: 'flexibility',
        difficulty: 'beginner',
        daysPerWeek: 5,
        exercises: [
            {
                name: 'Cat-Cow Stretch',
                sets: 3,
                reps: 10,
                youtubeUrl: 'https://www.youtube.com/watch?v=kqnua4rHVVA',
                notes: 'Warms up spine, improves posture'
            },
            {
                name: 'Downward Dog',
                sets: 3,
                reps: 30,
                notes: 'Hold for 30 seconds, lengthens hamstrings'
            },
            {
                name: 'Pigeon Pose (each side)',
                sets: 2,
                reps: 60,
                youtubeUrl: 'https://www.youtube.com/watch?v=0_zQuhs4OnQ',
                notes: 'Opens hips, hold 60 seconds each'
            },
            {
                name: 'Butterfly Stretch',
                sets: 2,
                reps: 45,
                notes: 'Hold 45 seconds, gently press knees down'
            },
            {
                name: 'Seated Forward Fold',
                sets: 2,
                reps: 45,
                notes: 'Lengthens hamstrings and back'
            },
            {
                name: 'Hip Flexor Stretch (each side)',
                sets: 2,
                reps: 30,
                notes: 'Hold 30 seconds, important for posture'
            },
            {
                name: 'Spinal Twist (each side)',
                sets: 2,
                reps: 30,
                notes: 'Improves spine mobility'
            },
        ]
    },
    {
        id: 'full-body-fem',
        name: 'Full Body Feminization',
        description: 'Complete routine targeting curves, waist, and graceful posture. Intermediate level.',
        goal: 'feminization',
        difficulty: 'intermediate',
        daysPerWeek: 4,
        exercises: [
            {
                name: 'Sumo Squats',
                sets: 4,
                reps: 15,
                weight: 15,
                youtubeUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
                notes: 'Wide stance targets inner thighs and glutes'
            },
            {
                name: 'Bulgarian Split Squats',
                sets: 3,
                reps: 12,
                weight: 10,
                notes: 'Each leg, great for glute development'
            },
            {
                name: 'Hip Thrusts with Weight',
                sets: 4,
                reps: 12,
                weight: 25,
                notes: 'Add weight for better glute activation'
            },
            {
                name: 'Cable Kickbacks',
                sets: 3,
                reps: 15,
                notes: 'Each leg, isolates glutes'
            },
            {
                name: 'Weighted Side Bends',
                sets: 3,
                reps: 15,
                weight: 10,
                notes: 'Tones waist, careful not to overdo'
            },
            {
                name: 'Wood Choppers',
                sets: 3,
                reps: 12,
                weight: 10,
                notes: 'Diagonal core movement for waist'
            },
            {
                name: 'Curtsy Lunges',
                sets: 3,
                reps: 12,
                notes: 'Targets outer glutes for hip curve'
            },
        ]
    },
    {
        id: 'booty-builder-advanced',
        name: 'Booty Builder - Advanced',
        description: 'Intensive glute and hip development for maximum curves. Advanced lifters.',
        goal: 'feminization',
        difficulty: 'advanced',
        daysPerWeek: 5,
        exercises: [
            {
                name: 'Barbell Hip Thrusts',
                sets: 5,
                reps: 10,
                weight: 65,
                youtubeUrl: 'https://www.youtube.com/watch?v=SEdqd1n0cvg',
                notes: 'Heavy weight, perfect form. King of glute exercises.'
            },
            {
                name: 'Romanian Deadlifts',
                sets: 4,
                reps: 10,
                weight: 45,
                notes: 'Targets hamstrings and glutes'
            },
            {
                name: 'Walking Lunges with Dumbbells',
                sets: 4,
                reps: 20,
                weight: 20,
                notes: '20 steps total, burns!'
            },
            {
                name: 'Glute Bridge Pulses',
                sets: 4,
                reps: 25,
                notes: 'At top of bridge, pulse 25 times'
            },
            {
                name: 'Cable Pull-Throughs',
                sets: 4,
                reps: 15,
                weight: 40,
                notes: 'Hinge at hips, squeeze glutes'
            },
            {
                name: 'Single-Leg Deadlifts',
                sets: 3,
                reps: 12,
                weight: 15,
                notes: 'Each leg, improves balance and glute activation'
            },
            {
                name: 'Frog Pumps',
                sets: 4,
                reps: 30,
                notes: 'Bodyweight burnout, squeeze hard'
            },
            {
                name: 'Banded Lateral Walks',
                sets: 3,
                reps: 20,
                notes: '20 steps each direction, builds hip width'
            },
        ]
    },
];

/**
 * Get workout plan by difficulty
 */
export function getWorkoutPlansByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): PresetWorkoutPlan[] {
    return PRESET_WORKOUT_PLANS.filter(plan => plan.difficulty === difficulty);
}

/**
 * Get workout plan by goal
 */
export function getWorkoutPlansByGoal(goal: PresetWorkoutPlan['goal']): PresetWorkoutPlan[] {
    return PRESET_WORKOUT_PLANS.filter(plan => plan.goal === goal);
}

/**
 * Get specific workout plan by ID
 */
export function getWorkoutPlanById(id: string): PresetWorkoutPlan | undefined {
    return PRESET_WORKOUT_PLANS.find(plan => plan.id === id);
}

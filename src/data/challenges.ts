/**
 * Preset challenge templates
 * Ready-to-use challenges for various goals
 */

export interface PresetChallenge {
    id: string;
    name: string;
    description: string;
    category: 'sissy' | 'fitness' | 'beauty' | 'mindset' | 'style';
    duration: number; // days
    difficulty: 'easy' | 'medium' | 'hard';
    tasks: string[];
    rewards?: string;
}

export const PRESET_CHALLENGES: PresetChallenge[] = [
    {
        id: 'fem-walk-7day',
        name: '7-Day Feminine Walk Challenge',
        description: 'Master the art of walking gracefully with confidence and poise.',
        category: 'sissy',
        duration: 7,
        difficulty: 'easy',
        tasks: [
            'Day 1: Practice heel-to-toe walking for 15 minutes',
            'Day 2: Walk with a book on your head for 10 minutes',
            'Day 3: Practice hip sway while walking - 20 minutes',
            'Day 4: Walk in heels for 15 minutes around your home',
            'Day 5: Combine hip sway + heel-to-toe in heels - 15 minutes',
            'Day 6: Practice posture while walking - shoulders back, chin up',
            'Day 7: Full graceful walk session - 30 minutes in heels'
        ],
        rewards: 'Graceful, feminine gait. Increased confidence walking in heels.'
    },
    {
        id: 'makeup-everyday-14day',
        name: '14-Day Daily Makeup Challenge',
        description: 'Build your makeup routine and skills with daily practice.',
        category: 'beauty',
        duration: 14,
        difficulty: 'medium',
        tasks: [
            'Day 1-2: Master foundation application and blending',
            'Day 3-4: Perfect your eyebrow shaping and filling',
            'Day 5-6: Practice eyeliner techniques (wing, tight-line)',
            'Day 7-8: Experiment with eyeshadow blending (3 different looks)',
            'Day 9-10: Master contouring and highlighting',
            'Day 11-12: Practice different lipstick applications and lip liner',
            'Day 13: Create a full daytime natural look',
            'Day 14: Create a full evening glam look'
        ],
        rewards: 'Polished makeup skills. Ability to create complete looks confidently.'
    },
    {
        id: 'waist-training-30day',
        name: '30-Day Waist Training Challenge',
        description: 'Gradual waist training to achieve a more feminine silhouette.',
        category: 'fitness',
        duration: 30,
        difficulty: 'medium',
        tasks: [
            'Week 1: Wear corset 2 hours/day, track measurements',
            'Week 2: Wear corset 3-4 hours/day, add core exercises (3x/week)',
            'Week 3: Wear corset 4-6 hours/day, continue core work',
            'Week 4: Wear corset 6-8 hours/day, add side planks to routine',
            'Daily: Log waist measurements (before, during, after)',
            'Daily: Stay hydrated (8+ glasses water)',
            'Every 3 days: Take progress photos',
            'Weekly: Measure waist-to-hip ratio progress'
        ],
        rewards: 'Reduced waist measurement. More defined hourglass shape. Improved posture.'
    },
    {
        id: 'confidence-boost-21day',
        name: '21-Day Confidence Boost',
        description: 'Build unshakeable confidence in your feminine expression.',
        category: 'mindset',
        duration: 21,
        difficulty: 'easy',
        tasks: [
            'Daily: Read 3 affirmations aloud in the mirror',
            'Daily: Identify 5 things you love about yourself',
            'Daily: Spend 10 minutes dressed fully fem (even at home)',
            'Weekly: Try one new outfit combination',
            'Weekly: Take 5 selfies in different poses',
            'Weekly: Compliment yourself on one achievement',
            'Week 3: Dress fem for a full day (if safe to do so)'
        ],
        rewards: 'Increased self-confidence. Comfort with feminine presentation. Positive self-image.'
    },
    {
        id: 'skincare-glow-28day',
        name: '28-Day Skincare Glow-Up',
        description: 'Achieve radiant, healthy skin with consistent skincare routine.',
        category: 'beauty',
        duration: 28,
        difficulty: 'easy',
        tasks: [
            'Daily AM: Cleanser → Toner → Serum → Moisturizer → SPF',
            'Daily PM: Cleanser → Toner → Serum → Night Cream',
            '3x/week: Exfoliate (chemical or physical)',
            '2x/week: Face mask (hydrating or clarifying)',
            'Daily: Drink 8 glasses of water',
            'Daily: Remove ALL makeup before bed',
            'Weekly: Track skin improvements (photos)',
            'Month-end: Compare before/after photos'
        ],
        rewards: 'Glowing, clear skin. Established skincare routine. Reduced blemishes.'
    },
    {
        id: 'voice-feminization-30day',
        name: '30-Day Voice Feminization',
        description: 'Develop a more feminine voice through daily practice.',
        category: 'sissy',
        duration: 30,
        difficulty: 'hard',
        tasks: [
            'Week 1: Practice pitch raising exercises 15 min/day',
            'Week 2: Add resonance exercises 15 min/day',
            'Week 3: Practice speaking in higher pitch 20 min/day',
            'Week 4: Full conversation practice 30 min/day',
            'Daily: Record voice samples to track progress',
            'Daily: Hum at target pitch for 5 minutes',
            'Weekly: Read a full page aloud in feminine voice',
            'Bi-weekly: Compare recordings to track improvement'
        ],
        rewards: 'More feminine voice. Increased vocal range. Confidence speaking.'
    },
    {
        id: 'curves-builder-60day',
        name: '60-Day Curves Builder',
        description: 'Intensive workout program to build hips, butt, and feminine curves.',
        category: 'fitness',
        duration: 60,
        difficulty: 'hard',
        tasks: [
            'Mon/Wed/Fri: Glute-focused workout (Hip thrusts, squats, lunges)',
            'Tue/Thu: Core and waist training (planks, twists, crunches)',
            'Sat: Full-body toning circuit',
            'Sun: Flexibility and yoga',
            'Daily: Track measurements (hips, waist, butt)',
            'Weekly: Progress photos from 3 angles',
            'Daily: High protein intake (100g+)',
            'Bi-weekly: Increase weights by 5-10%'
        ],
        rewards: 'Noticeably rounder butt. Wider hips. Defined waist. Improved body proportions.'
    },
    {
        id: 'wardrobe-refresh-14day',
        name: '14-Day Wardrobe Refresh',
        description: 'Organize, declutter, and elevate your feminine wardrobe.',
        category: 'style',
        duration: 14,
        difficulty: 'easy',
        tasks: [
            'Day 1-2: Sort all clothing - keep, donate, repair',
            'Day 3-4: Organize by category (dresses, tops, bottoms, etc.)',
            'Day 5-6: Create 10 complete outfits and photograph them',
            'Day 7: Identify wardrobe gaps and create shopping list',
            'Day 8-9: Deep clean shoes and accessories',
            'Day 10-11: Try on everything - assess fit and feel',
            'Day 12: Donate items that don\'t serve you',
            'Day 13: Plan 7 days of outfits for the week ahead',
            'Day 14: Treat yourself to one new feminine piece'
        ],
        rewards: 'Organized closet. Clarity on personal style. Ready-to-wear outfits.'
    },
    {
        id: 'heel-mastery-10day',
        name: '10-Day Heel Mastery',
        description: 'Walk confidently and gracefully in high heels.',
        category: 'sissy',
        duration: 10,
        difficulty: 'medium',
        tasks: [
            'Day 1-2: Start with 2-inch heels, wear 1 hour',
            'Day 3-4: Wear 2-inch heels for 2 hours, practice walking',
            'Day 5-6: Move to 3-inch heels, wear 1.5 hours',
            'Day 7-8: Wear 3-inch heels for 2+ hours, practice stairs',
            'Day 9: Wear highest heels comfortably for 2 hours',
            'Day 10: Full day in heels (if possible)',
            'Daily: Practice posture - engage core, shoulders back',
            'Daily: Walk at least 30 minutes in heels'
        ],
        rewards: 'Comfortable walking in heels. Improved posture. Graceful gait.'
    },
    {
        id: 'full-fem-weekend',
        name: 'Full Fem Weekend Challenge',
        description: 'Spend an entire weekend completely en femme.',
        category: 'sissy',
        duration: 3,
        difficulty: 'hard',
        tasks: [
            'Friday night: Full makeup and cute pajamas',
            'Saturday AM: Morning routine fully fem (shower, skincare, makeup)',
            'Saturday: Wear complete outfit all day (dress/skirt recommended)',
            'Saturday: Practice feminine mannerisms and movements',
            'Saturday night: Evening glam look',
            'Sunday: Repeat full routine, different outfit',
            'Sunday: Take glamorous photos to document',
            'All weekend: Speak in feminine voice (if practicing)',
            'All weekend: Walk gracefully, sit properly, feminine gestures'
        ],
        rewards: 'Extended fem experience. Increased comfort. Confidence boost. Beautiful memories.'
    },
];

/**
 * Get challenges by category
 */
export function getChallengesByCategory(category: PresetChallenge['category']): PresetChallenge[] {
    return PRESET_CHALLENGES.filter(c => c.category === category);
}

/**
 * Get challenges by difficulty
 */
export function getChallengesByDifficulty(difficulty: PresetChallenge['difficulty']): PresetChallenge[] {
    return PRESET_CHALLENGES.filter(c => c.difficulty === difficulty);
}

/**
 * Get challenge by ID
 */
export function getChallengeById(id: string): PresetChallenge | undefined {
    return PRESET_CHALLENGES.find(c => c.id === id);
}

/**
 * Get recommended challenges for beginners
 */
export function getBeginnerChallenges(): PresetChallenge[] {
    return PRESET_CHALLENGES.filter(c => c.difficulty === 'easy' || c.duration <= 14);
}

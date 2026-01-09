/**
 * Preset affirmations database for daily inspiration
 * Categories: sissy, confidence, body-positive, general
 */

export interface PresetAffirmation {
    text: string;
    category: 'sissy' | 'general' | 'confidence' | 'body-positive';
    videoUrl?: string;
}

export const PRESET_AFFIRMATIONS: PresetAffirmation[] = [
    // Sissy Affirmations
    {
        text: "I embrace my feminine energy and allow it to flow freely through me.",
        category: "sissy"
    },
    {
        text: "Being soft, pretty, and feminine is my natural state and I celebrate it.",
        category: "sissy"
    },
    {
        text: "I deserve to wear beautiful clothes that make me feel gorgeous.",
        category: "sissy"
    },
    {
        text: "My femininity is powerful and authentic.",
        category: "sissy"
    },
    {
        text: "I am becoming more confident in my feminine expression every day.",
        category: "sissy"
    },
    {
        text: "Wearing makeup and lingerie helps me express my true self.",
        category: "sissy"
    },
    {
        text: "I am proud of my journey toward femininity.",
        category: "sissy"
    },
    {
        text: "My feminine side deserves love, care, and celebration.",
        category: "sissy"
    },
    {
        text: "I am beautiful when I embrace who I truly am.",
        category: "sissy"
    },
    {
        text: "Every day I become more comfortable in my feminine skin.",
        category: "sissy"
    },
    {
        text: "I release all shame and embrace my authentic femininity.",
        category: "sissy"
    },
    {
        text: "Being pretty and delicate is not a weakness, it's my strength.",
        category: "sissy"
    },
    {
        text: "I honor my desire to be soft, graceful, and feminine.",
        category: "sissy"
    },
    {
        text: "My transformation is beautiful and I am proud of my progress.",
        category: "sissy"
    },
    {
        text: "I deserve to feel sexy, wanted, and adored in my feminine form.",
        category: "sissy"
    },

    // Body Positive Affirmations
    {
        text: "My body is transforming in beautiful ways and I celebrate every change.",
        category: "body-positive"
    },
    {
        text: "I love and appreciate my body exactly as it is today.",
        category: "body-positive"
    },
    {
        text: "Every curve, every measurement, every change is progress.",
        category: "body-positive"
    },
    {
        text: "My waist is becoming more defined and feminine each day.",
        category: "body-positive"
    },
    {
        text: "I am patient and kind to my body as it transforms.",
        category: "body-positive"
    },
    {
        text: "My feminine figure is emerging beautifully.",
        category: "body-positive"
    },
    {
        text: "I nourish my body with love, care, and acceptance.",
        category: "body-positive"
    },
    {
        text: "My body deserves gentle treatment and positive affirmations.",
        category: "body-positive"
    },
    {
        text: "I celebrate small victories in my transformation journey.",
        category: "body-positive"
    },
    {
        text: "My hips, waist, and curves are developing perfectly.",
        category: "body-positive"
    },
    {
        text: "I trust my body's ability to change and adapt.",
        category: "body-positive"
    },
    {
        text: "Every measurement I track shows my dedication and progress.",
        category: "body-positive"
    },
    {
        text: "I am proud of the effort I put into shaping my body.",
        category: "body-positive"
    },
    {
        text: "My body is capable of amazing transformations.",
        category: "body-positive"
    },
    {
        text: "I look in the mirror and see beauty, progress, and potential.",
        category: "body-positive"
    },

    // Confidence Affirmations
    {
        text: "I walk with confidence and grace, knowing I am worthy.",
        category: "confidence"
    },
    {
        text: "My confidence grows stronger with each feminine step I take.",
        category: "confidence"
    },
    {
        text: "I am worthy of love, respect, and admiration.",
        category: "confidence"
    },
    {
        text: "I radiate beauty and confidence from within.",
        category: "confidence"
    },
    {
        text: "I deserve to take up space and be seen in my feminine beauty.",
        category: "confidence"
    },
    {
        text: "My voice is soft, my presence is powerful.",
        category: "confidence"
    },
    {
        text: "I am brave enough to live authentically as my true self.",
        category: "confidence"
    },
    {
        text: "I release fear and step into my feminine power.",
        category: "confidence"
    },
    {
        text: "I am becoming the woman I was always meant to be.",
        category: "confidence"
    },
    {
        text: "My journey is unique and beautiful, and I honor it.",
        category: "confidence"
    },
    {
        text: "I trust myself to make choices that align with my true self.",
        category: "confidence"
    },
    {
        text: "I am confident in my feminine expression and style.",
        category: "confidence"
    },
    {
        text: "Every day I become more comfortable being myself.",
        category: "confidence"
    },
    {
        text: "I deserve to feel beautiful, sexy, and confident.",
        category: "confidence"
    },
    {
        text: "My femininity is a gift I give to myself and the world.",
        category: "confidence"
    },

    // General Affirmations
    {
        text: "Today is full of possibilities and I embrace them with grace.",
        category: "general"
    },
    {
        text: "I choose joy, beauty, and authenticity in everything I do.",
        category: "general"
    },
    {
        text: "I am creating the life I desire, one beautiful day at a time.",
        category: "general"
    },
    {
        text: "I am surrounded by love, beauty, and endless possibilities.",
        category: "general"
    },
    {
        text: "Every choice I make brings me closer to my ideal self.",
        category: "general"
    },
    {
        text: "I am grateful for my journey and excited for what's ahead.",
        category: "general"
    },
    {
        text: "I attract positivity, love, and beautiful experiences.",
        category: "general"
    },
    {
        text: "Today I choose to see beauty in myself and the world around me.",
        category: "general"
    },
    {
        text: "I am worthy of all the good things coming my way.",
        category: "general"
    },
    {
        text: "My life is filled with magic, beauty, and transformation.",
        category: "general"
    },
    {
        text: "I release what no longer serves me and embrace what brings me joy.",
        category: "general"
    },
    {
        text: "I am enough, exactly as I am in this moment.",
        category: "general"
    },
    {
        text: "I celebrate my uniqueness and honor my authentic self.",
        category: "general"
    },
    {
        text: "Today I choose love over fear, joy over doubt.",
        category: "general"
    },
    {
        text: "I am grateful for the beauty I see in myself and others.",
        category: "general"
    },
];

/**
 * Get random affirmation by category
 */
export function getRandomAffirmation(category?: PresetAffirmation['category']): PresetAffirmation {
    const filtered = category 
        ? PRESET_AFFIRMATIONS.filter(a => a.category === category)
        : PRESET_AFFIRMATIONS;
    
    return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get daily affirmation (seeded by date for consistency)
 */
export function getDailyAffirmation(): PresetAffirmation {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = seed % PRESET_AFFIRMATIONS.length;
    return PRESET_AFFIRMATIONS[index];
}

/**
 * Get affirmations by category
 */
export function getAffirmationsByCategory(category: PresetAffirmation['category']): PresetAffirmation[] {
    return PRESET_AFFIRMATIONS.filter(a => a.category === category);
}

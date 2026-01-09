export type Category =
    | "top" | "bottom" | "dress" | "shoe" | "outerwear" | "accessory" | "legging" // Clothing
    | "face" | "eye" | "lip" | "cheek" | "tool" // Makeup
    | "other";

export interface Item {
    id: string;
    name: string;
    type: "clothing" | "makeup";
    category: Category;
    userId?: string;
    color?: string;
    image?: string; // Base64 or URL
    purchaseUrl?: string;
    price?: number;
    wishlist?: boolean;
    brand?: string;
    dateAdded: number;
    dateOpened?: number; // For makeup expiration
    notes?: string;
    // importer meta (optional) used by importers (CSV, Amazon, etc)
    importMeta?: {
        confidence?: number; // 0..1
        source?: string; // e.g., 'ai', 'parsed', 'csv', 'amazon'
        order_id?: string; // Amazon order ID
        asin?: string; // Amazon ASIN
        order_date?: string; // ISO date string
        quantity?: number; // Quantity ordered
        url?: string; // Product URL
        [key: string]: any; // Allow any other metadata
    };
}

export interface Look {
    id: string;
    name: string;
    items: string[]; // Array of Item IDs
    dateCreated: number;
    image?: string; // Screenshot/Collage
}

export interface MeasurementLog {
    id: string;
    date: number;
    values: {
        bust?: number;
        waist?: number;
        hips?: number;
        underbust?: number;
        shoulders?: number;
        inseam?: number;
        shoe?: number;
        // New fields
        weight?: number;
        dressSize?: number;
        shoeSize?: number; // Redundant but explicit
        braBand?: number; // e.g., 34
        braCup?: string; // e.g., B, C, DD
        breast?: number; // bust circumference at fullest point
        butt?: number; // hip/seat circumference at fullest point
        clitLengthMm?: number; // clit length in millimeters
        clitGirthMm?: number; // clit girth in millimeters
    };
    photo?: string;
    goalWaist?: number; // Target waist measurement
    goalWHR?: number; // Target waist-to-hip ratio (e.g., 0.7)
}

export interface OrgasmLog {
    id: string;
    date: number;
    type?: "solo" | "partnered" | "other";
    method?: "wand" | "anal" | "penetration" | "oral" | "hands" | "other";
    chastityStatus?: "locked" | "unlocked";
    note?: string;
}

export interface ArousalLog {
    id: string;
    date: number;
    level: number; // 1-10 scale
    sessionType?: "arousal" | "edging" | "denial" | "afterglow";
    durationMinutes?: number;
    stimulus?: string; // e.g., wand, anal, vibe, nipple play
    mood?: string;
    note?: string;
    cycleDay?: number; // Optional menstrual cycle day tracking
}

export interface ToyItem {
    id: string;
    name: string;
    type: string; // vibrator, dildo, plug, restraint, cage, etc.
    material?: string;
    purchaseDate?: number;
    lastCleaning?: number;
    cleaningFrequencyDays?: number; // Days between cleanings
    photo?: string; // Base64
    note?: string;
}

export interface IntimacyEntry {
    id: string;
    date: number;
    mood: string; // happy, playful, needy, romantic, etc.
    content: string; // Journal entry text
    tags?: string[]; // Custom tags for filtering
    linkedActivity?: string; // Optional link to activity (chastity session, orgasm, etc.)
    isPrivate?: boolean; // Extra privacy flag
}

export interface MakeupTutorial {
    id: string;
    title: string;
    source?: string;
    focus?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    status: "planned" | "in-progress" | "done";
    practiceCount: number;
    lastPracticed?: number;
    note?: string;
    imageUrl?: string;
}

export interface SkincareProduct {
    id: string;
    name: string;
    brand?: string;
    type: "cleanser" | "toner" | "serum" | "moisturizer" | "sunscreen" | "exfoliant" | "mask" | "eye-cream" | "oil" | "treatment" | "other";
    dateOpened?: number;
    expirationMonths?: number; // Months until expiration after opening
    routine: "am" | "pm" | "both";
    order: number; // Order in routine (1 = first, 2 = second, etc.)
    note?: string;
}

export interface ClitMeasurement {
    id: string;
    date: number;
    lengthMm: number; // Length in millimeters
    widthMm?: number; // Width in millimeters
    method?: string; // Measurement method (ruler, calipers, etc.)
    arousalState?: "unaroused" | "semi-aroused" | "fully-aroused";
    note?: string;
}

export interface BreastGrowthEntry {
    id: string;
    date: number;
    photo: string; // Base64 image
    bustCm?: number;
    underbustCm?: number;
    weightKg?: number;
    note?: string;
    aiSummary?: string;
    encouragement?: string;
}

export interface WigItem {
    id: string;
    name: string;
    brand?: string;
    color: string;
    length: string; // e.g., "shoulder-length", "long", "pixie"
    style: string; // e.g., "straight", "wavy", "curly", "bob"
    material: string; // "synthetic", "human hair", "blend"
    purchaseDate?: number;
    cost?: number;
    photo?: string; // Base64
    lastWorn?: number;
    capSize?: string; // e.g., "average", "petite", "large"
    note?: string;
}

export interface HairStyle {
    id: string;
    name: string;
    date: number;
    photo?: string; // Base64
    stylist?: string;
    salon?: string;
    cost?: number;
    products?: string[]; // Products used
    duration?: number; // How long it lasted (days)
    rating?: number; // 1-5 stars
    note?: string;
}

export interface SissyTrainingGoal {
    id: string;
    title: string;
    category: 'appearance' | 'behavior' | 'skills' | 'mindset' | 'fitness' | 'intimate';
    description: string;
    targetDate?: number;
    completed: boolean;
    completedDate?: number;
    priority: 'low' | 'medium' | 'high';
    progress: number; // 0-100
    milestones?: string[]; // Sub-goals
    note?: string;
}

export interface SissyTrainingLog {
    id: string;
    date: number;
    goalId?: string; // Reference to related goal
    category: 'appearance' | 'behavior' | 'skills' | 'mindset' | 'fitness' | 'intimate';
    activity: string;
    duration?: number; // Minutes
    success: boolean;
    mood: 'confident' | 'nervous' | 'excited' | 'proud' | 'challenged' | 'happy';
    note?: string;
    photo?: string;
}

export interface ComplimentEntry {
    id: string;
    date: number;
    compliment: string;
    source?: string; // Who gave the compliment
    context?: string; // Where/when (e.g., "At coffee shop", "Date night")
    outfit?: string; // What you were wearing
    mood: 'confident' | 'happy' | 'surprised' | 'proud' | 'shy' | 'validated';
    category?: 'appearance' | 'style' | 'personality' | 'skill' | 'other';
    favorite?: boolean;
    note?: string;
}

export interface TimelineEntry {
    id: string;
    date: number;
    photo: string;
    lookId?: string;
    notes?: string;
}

export interface RoutineStep {
    id: string;
    description: string;
    productId?: string; // Optional link to an item
}

export interface Routine {
    id: string;
    name: string;
    steps: RoutineStep[];
}

export type ShoppingRetailer = "amazon" | "sephora" | "ulta" | "target" | "walmart" | "etsy" | "adam-eve" | "other";

export type ShoppingCategory =
    | "fashion" | "shoes" | "accessories" // Fashion
    | "makeup" | "skincare" | "haircare" // Beauty
    | "adult" | "wellness" // Adult/Wellness
    | "other";

export interface ShoppingItem {
    id: string;
    name: string;
    retailer: ShoppingRetailer;
    category: ShoppingCategory;
    price?: number;
    image?: string; // URL or Base64
    url?: string;
    description?: string;
    inWishlist: boolean;
    dateAdded: number;
}

export interface ShoppingList {
    id: string;
    name: string;
    items: string[]; // Array of ShoppingItem IDs
    dateCreated: number;
}


export interface Inspiration {
    id: string;
    image: string; // Base64
    dateAdded: number;
}

export type ColorSeason = "Spring" | "Summer" | "Autumn" | "Winter";

export interface ChastitySession {
    id: string;
    startDate: number;
    endDate?: number;
    hygieneChecks: number[]; // Array of timestamps
    keyholder?: string;
    note?: string;
    cageModel?: string; // Chastity cage/device model
    ringSize?: string; // Ring size if applicable
}

export interface CorsetSession {
    id: string;
    startDate: number;
    endDate?: number;
    waistBefore?: number; // Natural waist before putting on corset
    waistCorseted?: number; // Waist while wearing corset (cinched measurement)
    waistAfter?: number; // Measurement immediately after removal
    duration?: number; // Duration in minutes
    corsetType?: string; // Type/name of corset
    note?: string;
}

export interface ButtPlugSession {
    id: string;
    startDate: number;
    endDate?: number;
    durationMinutes?: number;
    plugType?: string; // Type/size of plug
    plugSize?: "small" | "medium" | "large" | "extra-large"; // Size classification
    material?: string; // Silicone, glass, metal, etc.
    insertionDepth?: number; // Depth in inches/cm
    comfortLevel?: 1 | 2 | 3 | 4 | 5; // 1=uncomfortable, 5=very comfortable
    sensations?: string[]; // Array of sensations (fullness, pressure, tightness, etc.)
    relaxationLevel?: 1 | 2 | 3 | 4 | 5; // How relaxed the anal opening is
    arousalLevel?: 1 | 2 | 3 | 4 | 5; // Arousal experienced during session
    notes?: string;
    photoUrls?: string[]; // Optional progress photos
    isTraining?: boolean; // Whether this was part of training
    wearingOther?: string; // What else was being worn (chastity, corset, etc.)
}

export interface PackingItem {
    id: string;
    name: string;
    category: 'clothing' | 'shoes' | 'accessories' | 'makeup' | 'toiletries' | 'electronics' | 'documents' | 'other';
    quantity: number;
    packed: boolean;
    itemId?: string; // Reference to closet item if applicable
}

export interface PackingList {
    id: string;
    name: string;
    destination: string;
    startDate: number;
    endDate: number;
    tripType: "business" | "casual" | "beach" | "formal" | "adventure" | "mixed";
    items: PackingItem[];
    notes?: string;
    created: number;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    category: "style" | "beauty" | "fitness" | "intimacy" | "confidence" | "lifestyle";
    duration: number; // days
    startDate?: number;
    completed: boolean;
    progress: number; // 0-100
    dailyTasks: string[];
    completedDays: number[];
    rewards?: string;
    difficulty: "easy" | "medium" | "hard";
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: "closet" | "looks" | "measurements" | "training" | "chastity" | "social" | "milestone";
    icon: string;
    unlocked: boolean;
    unlockedDate?: number;
    progress: number; // 0-100
    requirement: number;
    rarity: "common" | "rare" | "epic" | "legendary";
}

// ===== NEW FEATURES (December 2025) =====

export interface SupplementLog {
    id: string;
    date: number;
    name: string;
    type: "vitamin" | "mineral" | "herb" | "protein" | "other";
    dosage: number;
    unit: "mg" | "mcg" | "ml" | "tablet" | "capsule" | "g";
    notes?: string;
    lastTaken?: number;
}

export interface WorkoutPlan {
    id: string;
    date: number;
    dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    exercises: {
        name: string;
        sets?: number;
        reps?: number;
        weight?: number;
        notes?: string;
        youtubeUrl?: string;
    }[];
    notes?: string;
}

export interface WorkoutSession {
    id: string;
    date: number;
    planId?: string; // Reference to WorkoutPlan if planned
    exercises: {
        name: string;
        sets?: number;
        reps?: number;
        weight?: number;
        youtubeUrl?: string;
        notes?: string;
    }[];
    duration?: number; // minutes
    notes?: string;
}

export interface DailyAffirmation {
    id: string;
    text: string;
    category: "sissy" | "general" | "confidence" | "body-positive";
    videoUrl?: string; // YouTube link for reinforcement videos
    isFavorite?: boolean;
    dateAdded: number;
}

// New Types for Enhanced Features

export interface Notification {
    id: string;
    type: "affirmation" | "workout" | "supplement" | "challenge" | "achievement" | "milestone";
    title: string;
    message: string;
    icon?: string;
    actionUrl?: string;
    read: boolean;
    dateCreated: number;
    scheduledFor?: number; // For scheduled notifications
}

export interface NotificationSettings {
    affirmations: boolean;
    affirmationTime?: string; // "08:00"
    workouts: boolean;
    supplements: boolean;
    challenges: boolean;
    achievements: boolean;
    email: boolean;
    push: boolean;
}

export interface Tag {
    id: string;
    name: string;
    color: string; // Hex color
    icon?: string;
    dateCreated: number;
}

export interface Note {
    id: string;
    linkedId: string; // Item, Look, Goal, etc.
    linkedType: "item" | "look" | "goal" | "workout" | "measurement" | "session" | string;
    title?: string;
    content: string;
    richText?: boolean; // For future rich text support
    dateCreated: number;
    dateModified: number;
}

export interface SearchHistory {
    id: string;
    query: string;
    searchType: "items" | "workouts" | "goals" | "all";
    dateSearched: number;
}

export interface SavedSearch {
    id: string;
    name: string;
    query: string;
    filters: Record<string, any>;
    searchType: string;
    dateCreated: number;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: number;
    type: "workout" | "chastity" | "corset" | "milestone" | "event" | "challenge";
    linkedId?: string; // Link to actual item
    color?: string;
    notes?: string;
}

export interface UserTheme {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        foreground: string;
    };
}

export interface AnalyticsData {
    measurementTrends: Array<{ date: number; value: number; metric: string }>;
    workoutStats: {
        totalWorkouts: number;
        thisWeek: number;
        streak: number;
        totalMinutes: number;
    };
    habitStreak: Array<{ date: number; completed: boolean; category: string }>;
    goalProgress: Array<{ goalId: string; progress: number; target: number }>;
}
// Seasonal Features
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'hot' | 'cold';

export interface SeasonalChallenge {
    id: string;
    title: string;
    description: string;
    season: Season;
    category: 'fashion' | 'fitness' | 'skincare' | 'wellness';
    startDate: number;
    endDate: number;
    rewards?: string[]; // Badge or achievement strings
    completed: boolean;
    progress: number; // 0-100
}

export interface OutfitPack {
    id: string;
    name: string;
    season: Season;
    itemIds: string[]; // References to Items
    temperature: { min: number; max: number }; // Celsius
    weatherTypes: WeatherType[];
    occasion: string; // 'casual' | 'work' | 'date' | 'party' | 'gym'
    description?: string;
    dateCreated: number;
}

export interface SeasonalGoal {
    id: string;
    title: string;
    season: Season;
    category: 'fashion' | 'fitness' | 'skincare';
    target: string;
    progress: number;
    completed: boolean;
    startDate: number;
    endDate: number;
}
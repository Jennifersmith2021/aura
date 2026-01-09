/**
 * Advanced Features Module
 * Calendar integration, wardrobe capsules, and enhanced affirmation system
 */

import { Look, Item } from '@/types'

// ============================================================================
// CALENDAR INTEGRATION
// ============================================================================

export interface CalendarEvent {
  id: string
  title: string
  date: number
  type: 'meeting' | 'date' | 'birthday' | 'event' | 'wedding' | 'vacation' | 'other'
  description?: string
  location?: string
  outfit?: {
    lookId?: string
    mustHaves?: string[] // Item IDs or descriptions
    colorScheme?: string
    dresscode?: string
  }
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    endDate?: number
  }
  reminders?: {
    daysBeforeOutfitPlanning: number // Default: 3
    minutesBefore: number // Default: 60
  }
}

export interface CalendarOutfitSuggestion {
  eventId: string
  outfit: {
    name: string
    items: string[]
    reasoning: string
    colorScheme: string
    dresscode: string
  }
  confidence: number // 0-100
}

export interface WeeklyOutfitPlan {
  week: number
  year: number
  plans: Record<string, { lookId?: string; planned: boolean }>
}

/**
 * Create calendar event
 */
export function createCalendarEvent(
  title: string,
  date: Date,
  type: CalendarEvent['type'],
  description?: string,
  location?: string
): CalendarEvent {
  return {
    id: `event_${Date.now()}`,
    title,
    date: date.getTime(),
    type,
    description,
    location,
    reminders: {
      daysBeforeOutfitPlanning: 3,
      minutesBefore: 60,
    },
  }
}

/**
 * Get events for a specific date or date range
 */
export function getEventsForDate(
  events: CalendarEvent[],
  startDate: Date,
  endDate?: Date
): CalendarEvent[] {
  const startTime = startDate.getTime()
  const endTime = endDate?.getTime() || startTime + 24 * 60 * 60 * 1000

  return events.filter((e) => e.date >= startTime && e.date <= endTime).sort((a, b) => a.date - b.date)
}

/**
 * Get upcoming events that need outfit planning
 */
export function getUpcomingEventsNeedingPlanners(
  events: CalendarEvent[],
  daysAhead: number = 7
): CalendarEvent[] {
  const now = Date.now()
  const futureTime = now + daysAhead * 24 * 60 * 60 * 1000

  return events
    .filter((e) => e.date > now && e.date <= futureTime && !e.outfit?.lookId)
    .sort((a, b) => a.date - b.date)
}

/**
 * Suggest outfit for event
 */
export function suggestOutfitForEvent(
  event: CalendarEvent,
  availableLooks: Look[]
): CalendarOutfitSuggestion | null {
  if (availableLooks.length === 0) return null

  // Match based on event type
  const typeRecommendations: Record<CalendarEvent['type'], string> = {
    'meeting': 'Business Casual - Professional but approachable',
    'date': 'Elegant - Put-together and stylish',
    'birthday': 'Fun - Expressive and celebratory',
    'event': 'Event Appropriate - Match the dress code',
    'wedding': 'Formal - Sophisticated and elegant',
    'vacation': 'Casual - Comfortable and versatile',
    'other': 'Casual - Comfortable and put-together',
  }

  // Select a random suitable look (in real app, use AI for matching)
  const suitableLooks = availableLooks.slice(0, Math.max(1, availableLooks.length / 2))
  const selectedLook = suitableLooks[Math.floor(Math.random() * suitableLooks.length)]

  return {
    eventId: event.id,
    outfit: {
      name: selectedLook.name || `Outfit for ${event.title}`,
      items: selectedLook.items || [],
      reasoning: typeRecommendations[event.type],
      colorScheme: 'Neutral with accent colors',
      dresscode: event.outfit?.dresscode || 'Appropriate for occasion',
    },
    confidence: 65,
  }
}

// ============================================================================
// WARDROBE CAPSULES
// ============================================================================

export interface WarprobeCapsule {
  id: string
  name: string
  description?: string
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season'
  purpose?: 'work' | 'casual' | 'formal' | 'travel' | 'vacation' | 'other'
  lookIds: string[]
  itemIds: string[]
  createdDate: number
  tags: string[]
  minimumOutfitDays?: number
  travelDaysRecommended?: number // For travel capsules
}

export interface CapsuleTemplate {
  name: string
  description: string
  requiredCategories: Array<{ category: string; count: number }>
  colorScheme: string
  minLooks: number
}

/**
 * Create wardrobe capsule
 */
export function createCapsule(
  name: string,
  season?: WarprobeCapsule['season'],
  purpose?: WarprobeCapsule['purpose'],
  description?: string
): WarprobeCapsule {
  return {
    id: `capsule_${Date.now()}`,
    name,
    description,
    season,
    purpose,
    lookIds: [],
    itemIds: [],
    createdDate: Date.now(),
    tags: [],
  }
}

/**
 * Create travel capsule
 */
export function createTravelCapsule(
  destination: string,
  daysNeeded: number,
  categories: string[] = ['top', 'bottom', 'shoe', 'outerwear']
): WarprobeCapsule {
  return {
    id: `travel_${Date.now()}`,
    name: `${destination} - ${daysNeeded} days`,
    description: `Minimal wardrobe for ${daysNeeded}-day trip to ${destination}`,
    purpose: 'travel',
    lookIds: [],
    itemIds: [],
    createdDate: Date.now(),
    tags: ['travel', 'capsule', 'minimal'],
    travelDaysRecommended: daysNeeded,
  }
}

/**
 * Add look to capsule
 */
export function addLookToCapsule(capsule: WarprobeCapsule, lookId: string): WarprobeCapsule {
  if (!capsule.lookIds.includes(lookId)) {
    capsule.lookIds.push(lookId)
  }
  return capsule
}

/**
 * Add item to capsule
 */
export function addItemToCapsule(capsule: WarprobeCapsule, itemId: string): WarprobeCapsule {
  if (!capsule.itemIds.includes(itemId)) {
    capsule.itemIds.push(itemId)
  }
  return capsule
}

/**
 * Get capsule templates
 */
export function getCapsuleTemplates(): CapsuleTemplate[] {
  return [
    {
      name: 'Business Casual',
      description: 'Professional but approachable for office work',
      requiredCategories: [
        { category: 'top', count: 5 },
        { category: 'bottom', count: 3 },
        { category: 'shoe', count: 2 },
        { category: 'accessory', count: 3 },
      ],
      colorScheme: 'Neutrals with pops of color',
      minLooks: 5,
    },
    {
      name: 'Weekend Casual',
      description: 'Comfortable and stylish for casual outings',
      requiredCategories: [
        { category: 'top', count: 5 },
        { category: 'bottom', count: 3 },
        { category: 'shoe', count: 2 },
      ],
      colorScheme: 'Mix of neutrals and statement colors',
      minLooks: 4,
    },
    {
      name: 'Formal Events',
      description: 'Elegant looks for special occasions',
      requiredCategories: [
        { category: 'dress', count: 2 },
        { category: 'top', count: 2 },
        { category: 'bottom', count: 2 },
        { category: 'shoe', count: 2 },
      ],
      colorScheme: 'Sophisticated, classic colors',
      minLooks: 3,
    },
    {
      name: 'Weekend Getaway',
      description: '2-3 day trip with minimal packing',
      requiredCategories: [
        { category: 'top', count: 4 },
        { category: 'bottom', count: 2 },
        { category: 'shoe', count: 2 },
      ],
      colorScheme: 'Neutral base with 1-2 accent colors',
      minLooks: 3,
    },
    {
      name: 'Summer Beach',
      description: 'Warm weather vacation looks',
      requiredCategories: [
        { category: 'top', count: 5 },
        { category: 'bottom', count: 3 },
        { category: 'accessory', count: 4 },
      ],
      colorScheme: 'Bright, summer colors',
      minLooks: 4,
    },
  ]
}

// ============================================================================
// ADVANCED AFFIRMATION SYSTEM
// ============================================================================

export type MoodType = 'happy' | 'confident' | 'anxious' | 'sad' | 'motivated' | 'calm' | 'energetic'

export interface MoodLog {
  id: string
  date: number
  mood: MoodType
  affirmationId?: string
  affirmationText?: string
  reflection?: string
}

export interface AdvancedAffirmation {
  id: string
  text: string
  category: 'femininity' | 'confidence' | 'beauty' | 'strength' | 'love' | 'transformation'
  moods: MoodType[]
  authoredDate: number
  customCreated?: boolean
  favorited: boolean
  favoriteDate?: number
}

export interface AffirmationStreak {
  count: number
  startDate: number
  lastReadDate: number
  badge: 'bronze' | 'silver' | 'gold' | 'platinum'
}

/**
 * Create mood log entry
 */
export function createMoodLog(mood: MoodType, affirmationId?: string, reflection?: string): MoodLog {
  return {
    id: `mood_${Date.now()}`,
    date: Date.now(),
    mood,
    affirmationId,
    reflection,
  }
}

/**
 * Create custom affirmation
 */
export function createCustomAffirmation(
  text: string,
  category: AdvancedAffirmation['category'],
  moods: MoodType[] = []
): AdvancedAffirmation {
  return {
    id: `affirmation_${Date.now()}`,
    text,
    category,
    moods,
    authoredDate: Date.now(),
    customCreated: true,
    favorited: false,
  }
}

/**
 * Get affirmations matching current mood
 */
export function getAffirmationsForMood(
  mood: MoodType,
  affirmations: AdvancedAffirmation[]
): AdvancedAffirmation[] {
  return affirmations.filter((a) => a.moods.length === 0 || a.moods.includes(mood))
}

/**
 * Track reading streak
 */
export function updateStreak(currentStreak: AffirmationStreak | null): AffirmationStreak {
  const now = Date.now()

  if (!currentStreak) {
    return {
      count: 1,
      startDate: now,
      lastReadDate: now,
      badge: 'bronze',
    }
  }

  const daysSinceLastRead = Math.floor(
    (now - currentStreak.lastReadDate) / (1000 * 60 * 60 * 24)
  )

  // If more than 1 day has passed, reset streak
  if (daysSinceLastRead > 1) {
    return {
      count: 1,
      startDate: now,
      lastReadDate: now,
      badge: 'bronze',
    }
  }

  // Continue streak
  const newCount = currentStreak.count + 1
  let badge: AffirmationStreak['badge'] = 'bronze'
  if (newCount >= 7) badge = 'silver'
  if (newCount >= 30) badge = 'gold'
  if (newCount >= 100) badge = 'platinum'

  return {
    count: newCount,
    startDate: currentStreak.startDate,
    lastReadDate: now,
    badge,
  }
}

/**
 * Get affirmation recommendation based on mood and time of day
 */
export function getAffirmationRecommendation(
  mood: MoodType,
  affirmations: AdvancedAffirmation[],
  preferredCategories?: AdvancedAffirmation['category'][]
): AdvancedAffirmation | null {
  let candidates = getAffirmationsForMood(mood, affirmations)

  if (preferredCategories && preferredCategories.length > 0) {
    candidates = candidates.filter((a) => preferredCategories.includes(a.category))
  }

  if (candidates.length === 0) return null

  // Prefer non-favorited affirmations to provide variety
  const nonFavorited = candidates.filter((a) => !a.favorited)
  const pool = nonFavorited.length > 0 ? nonFavorited : candidates

  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Generate mood timeline
 */
export function generateMoodTimeline(
  moodLogs: MoodLog[],
  days: number = 30
): Record<string, { count: number; percentage: number }> {
  const now = Date.now()
  const pastTime = now - days * 24 * 60 * 60 * 1000

  const recent = moodLogs.filter((m) => m.date >= pastTime)

  const moodCounts: Record<string, number> = {
    'happy': 0,
    'confident': 0,
    'anxious': 0,
    'sad': 0,
    'motivated': 0,
    'calm': 0,
    'energetic': 0,
  }

  recent.forEach((m) => {
    moodCounts[m.mood]++
  })

  const total = recent.length || 1
  const timeline: Record<string, { count: number; percentage: number }> = {}

  Object.entries(moodCounts).forEach(([mood, count]) => {
    timeline[mood] = {
      count,
      percentage: Math.round((count / total) * 100),
    }
  })

  return timeline
}

/**
 * Build affirmation recommendation prompt for AI
 */
export function buildAffirmationPrompt(mood: MoodType, category?: string): string {
  return `
Generate 5 personalized affirmations for someone feeling ${mood}.
${category ? `Focus on the theme of ${category}.` : ''}

Each affirmation should:
1. Be positive and empowering
2. Be specific and believable
3. Use present tense
4. Affirm a quality or capability

Format as JSON: { affirmations: [{ text: string, category: string }] }
  `.trim()
}

export default {
  // Calendar
  createCalendarEvent,
  getEventsForDate,
  getUpcomingEventsNeedingPlanners,
  suggestOutfitForEvent,

  // Capsules
  createCapsule,
  createTravelCapsule,
  addLookToCapsule,
  addItemToCapsule,
  getCapsuleTemplates,

  // Affirmations
  createMoodLog,
  createCustomAffirmation,
  getAffirmationsForMood,
  updateStreak,
  getAffirmationRecommendation,
  generateMoodTimeline,
  buildAffirmationPrompt,
}

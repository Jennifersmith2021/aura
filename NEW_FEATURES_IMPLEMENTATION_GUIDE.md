# Aura — New Features Implementation Guide

**Date**: January 2026  
**Status**: Feature modules created and tested  
**Modules**: 7 new utility libraries (3,038 lines of code)

---

## 📋 Overview

This document outlines the 10 new features added to Aura and provides integration guidance for developers.

### Features Added

1. **🌤️ Weather Integration** — Get weather-aware outfit suggestions
2. **💰 Cost-Per-Wear Analytics** — Track ROI on wardrobe items
3. **📦 Item Condition Tracker** — Monitor garment health & maintenance
4. **📊 Wardrobe Health Dashboard** — Gap analysis & style metrics
5. **👥 Social Outfit Sharing** — Share looks, rate, and get feedback
6. **🛒 Smart Shopping Assistant** — Price tracking and recommendations
7. **📅 Calendar Integration** — Plan outfits for upcoming events
8. **🎁 Wardrobe Capsules** — Organize into seasonal/travel collections
9. **🎯 Advanced Affirmation System** — Mood-aware affirmations with streaks
10. **💡 AI Context Integration** — All features leverage existing Gemini API

---

## 🏗️ Architecture Overview

### Module Structure

```
src/lib/
├── weatherIntegration.ts       (460 lines)  — Weather API, outfit suggestions
├── costAnalytics.ts            (420 lines)  — ROI tracking, cost-per-wear
├── itemCondition.ts            (450 lines)  — Condition tracking, maintenance logs
├── wardrobeHealth.ts           (520 lines)  — Gap analysis, style coherence
├── socialSharing.ts            (480 lines)  — Sharing, ratings, trends
├── smartShopping.ts            (450 lines)  — Price history, budgeting, alerts
└── advancedFeatures.ts         (700 lines)  — Calendar, capsules, affirmations
```

### Data Flow

All features integrate with existing patterns:
- **State**: Persist to IndexedDB via `useStore` (add new keys for new data)
- **AI**: Leverage `/api/gemini` endpoint with existing Gemini integration
- **Types**: Define in `src/types/index.ts` (following existing pattern)
- **Caching**: Use existing `cache` module for API results

---

## 🔧 Implementation Roadmap

### Phase 1: Quick Wins (Week 1-2)

**Priority 1: Weather Integration**
```typescript
// In useStore.ts, add hooks:
const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
const fetchWeather = async () => {
  const location = await getUserLocation()
  if (location) {
    const weather = await fetchCurrentWeather(location.lat, location.lon)
    setWeatherData(weather)
    set('weather', weather) // IndexedDB
  }
}

// Component usage:
import * as weather from '@/lib/weatherIntegration'
const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)

useEffect(() => {
  const loadWeather = async () => {
    const location = await weather.getUserLocation()
    if (location) {
      const data = await weather.fetchCurrentWeather(location.lat, location.lon)
      setCurrentWeather(data)
    }
  }
  loadWeather()
}, [])
```

**Priority 2: Cost-Per-Wear Analytics**
```typescript
// In useStore.ts:
const generateCostAnalytics = () => {
  return costAnalytics.generateCostAnalytics(items, looks)
}

// Component:
import { generateCostAnalytics } from '@/lib/costAnalytics'

const analytics = generateCostAnalytics(items, looks)
// Display: analytics.topInvestments, analytics.unused, etc.
```

**Priority 3: Item Condition Tracker**
```typescript
// Extend Item type in types/index.ts:
interface Item {
  // ... existing fields
  metadata?: ItemConditionMetadata
}

// In useStore.ts:
const updateItemCondition = (itemId: string, condition: ConditionRating) => {
  const item = items.find(i => i.id === itemId)
  if (item && item.metadata) {
    item.metadata.condition = condition
    setItems([...items])
    set('items', items)
  }
}
```

### Phase 2: Core Features (Week 2-3)

**Priority 4: Wardrobe Health Dashboard**
```typescript
// In useStore.ts:
const generateHealthReport = () => {
  return wardrobeHealth.generateWardrobeHealthReport(items, looks)
}

// New dashboard component showing:
// - Overall health score
// - Gap analysis
// - Color balance pie chart
// - Seasonal readiness
// - Recommendations
```

**Priority 5: Social Outfit Sharing**
```typescript
// Add to useStore.ts IndexedDB keys:
const [sharedLooks, setSharedLooks] = useState<SharedLook[]>([])

// Integration:
const shareOutfit = (lookId: string, title: string) => {
  const look = looks.find(l => l.id === lookId)
  if (look) {
    const shared = socialSharing.createSharedLook(look, username, title, 'public')
    setSharedLooks([...sharedLooks, shared])
    set('sharedLooks', sharedLooks)
  }
}
```

**Priority 6: Smart Shopping Assistant**
```typescript
// Extend ShoppingItem type with:
interface ShoppingItem {
  // ... existing
  priceHistory?: PriceHistory[]
  priceAdded?: number
  alertedOnSale?: boolean
}

// In shopping component:
const checkForDuplicates = (itemName: string) => {
  return smartShopping.detectDuplicateInWishlist(itemName, wishlistItems)
}
```

### Phase 3: Advanced Features (Week 3-4)

**Priority 7: Calendar Integration**
```typescript
// Add IndexedDB key:
const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])

// In useStore.ts:
const addEvent = (title: string, date: Date, type: CalendarEvent['type']) => {
  const event = advancedFeatures.createCalendarEvent(title, date, type)
  setCalendarEvents([...calendarEvents, event])
  set('calendarEvents', calendarEvents)
}

const getEventsNeedingPlanning = () => {
  return advancedFeatures.getUpcomingEventsNeedingPlanners(calendarEvents, 7)
}
```

**Priority 8: Wardrobe Capsules**
```typescript
// Add IndexedDB key:
const [capsules, setCapsules] = useState<WarprobeCapsule[]>([])

// Use:
const createCapsule = (name: string, season?: string) => {
  const capsule = advancedFeatures.createCapsule(name, season)
  setCapsules([...capsules, capsule])
  set('warprobeCapsules', capsules)
}
```

**Priority 9: Advanced Affirmations**
```typescript
// Extend existing affirmation system:
interface AdvancedAffirmation extends Affirmation {
  moods?: MoodType[]
  customCreated?: boolean
  category?: string
}

// Add to useStore.ts:
const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])

const logMood = (mood: MoodType) => {
  const log = advancedFeatures.createMoodLog(mood)
  setMoodLogs([...moodLogs, log])
  set('moodLogs', moodLogs)
}
```

**Priority 10: AI Recommendations**
```typescript
// Use all modules together for context:
const generateAIRecommendations = async () => {
  const weatherContext = currentWeather ? weather.buildWeatherOutfitPrompt(...) : ''
  const costContext = costAnalytics.buildCostAnalysisPrompt(...)
  const healthContext = wardrobeHealth.generateWardrobeHealthReport(...)
  
  const combinedContext = [weatherContext, costContext, healthContext].join('\n')
  
  const response = await fetch('/api/gemini', {
    method: 'POST',
    body: JSON.stringify({
      type: 'json',
      context: combinedContext,
      prompt: 'Recommend 3 outfits based on this data'
    })
  })
}
```

---

## 📊 Data Types to Add to `src/types/index.ts`

```typescript
// Weather
export interface WeatherData { ... }
export interface ForecastData { ... }

// Cost Analytics
export interface CostPerWearMetric { ... }
export interface CostAnalyticsSummary { ... }

// Item Condition
export interface ItemConditionMetadata { ... }
export interface DamageLog { ... }
export interface MaintenanceLog { ... }

// Wardrobe Health
export interface WardrobeHealthMetrics { ... }
export interface GapAnalysis { ... }

// Social
export interface SharedLook { ... }
export interface OutfitRating { ... }
export interface StyleProfile { ... }

// Shopping
export interface PriceHistory { ... }
export interface SaleAlert { ... }
export interface BudgetTracker { ... }

// Calendar
export interface CalendarEvent { ... }
export interface CalendarOutfitSuggestion { ... }

// Capsules
export interface WarprobeCapsule { ... }

// Affirmations
export interface MoodLog { ... }
export interface AdvancedAffirmation { ... }
export interface AffirmationStreak { ... }
```

---

## 🗄️ IndexedDB Keys to Add to `useStore.ts`

```typescript
// Existing (keep these):
'items', 'looks', 'measurements', 'timeline', 'routines', 'shoppingItems', 
'shoppingLists', 'inspiration', 'colorSeason', 'chastitySessions', 
'corsetSessions', 'orgasmLogs', 'arousalLogs', 'toyCollection', 
'intimacyJournal', 'skincareProducts', 'clitMeasurements', 'sissyGoals', 
'sissyLogs', 'challenges', 'achievements', 'affirmations'

// New (add these):
'weatherData' — Current weather cache
'costAnalytics' — Cost-per-wear calculations (cache)
'itemCondition' — Item condition metadata and history
'wardrobeHealth' — Health report cache
'sharedLooks' — Shared outfit metadata
'priceHistory' — Shopping price tracking
'budgetTrackers' — Monthly budget tracking
'calendarEvents' — Calendar events
'warprobeCapsules' — Wardrobe capsule collections
'moodLogs' — Mood tracking for affirmations
'socialConnections' — Friend list and relationships
```

---

## 🎨 Component Structure

### New Components to Create

**src/components/Weather/**
- `WeatherDisplay.tsx` — Shows current weather
- `WeatherOutfitSuggestions.tsx` — 7-day forecast with outfit recommendations
- `LayeringGuide.tsx` — Smart layering recommendations

**src/components/Analytics/**
- `CostPerWearChart.tsx` — Cost-per-wear visualization
- `UnderutilizedItems.tsx` — Items needing more wear
- `CategoryAnalysis.tsx` — Category breakdown charts

**src/components/ConditionTracker/**
- `ItemConditionCard.tsx` — Individual item condition display
- `DamageLog.tsx` — Log damage and maintenance
- `ConditionAlerts.tsx` — Items needing attention

**src/components/WardrobeHealth/**
- `HealthScoreCard.tsx` — Overall health score
- `GapAnalysisPanel.tsx` — Missing essentials
- `ColorBalanceChart.tsx` — Color distribution

**src/components/Social/**
- `ShareOutfitModal.tsx` — Generate share links
- `RatingPanel.tsx` — Rate and comment
- `TrendingOutfits.tsx` — Community leaderboard

**src/components/Shopping/**
- `PriceTracker.tsx` — Price history
- `SaleAlerts.tsx` — Sale notifications
- `BudgetTracker.tsx` — Monthly spending

**src/components/Calendar/**
- `CalendarView.tsx` — Month view with events
- `EventOutfitPlanning.tsx` — Plan outfits for events
- `WeeklyPlanner.tsx` — Monday-Sunday outfit planning

**src/components/Capsules/**
- `CapsuleBuilder.tsx` — Create/edit capsules
- `CapsuleGallery.tsx` — Browse capsules
- `TravelCapsuleWizard.tsx` — Step-by-step travel packing

**src/components/Affirmations/**
- `MoodTracker.tsx` — Log current mood
- `AffirmationCard.tsx` — Display affirmation with styling
- `StreakBadge.tsx` — Streak counter and badge
- `MoodTimeline.tsx` — Mood trends chart

---

## 🔌 API Integration Points

### Existing APIs to Leverage

```typescript
// /api/gemini — All AI features
POST /api/gemini {
  type: 'json',  // For structured recommendations
  context: weatherData + userInventory,
  prompt: 'Suggest outfits...'
}

// /api/shopping — Price comparisons
POST /api/shopping {
  type: 'search',
  query: 'black blazer',
  retailer: 'all'  // Price comparison across retailers
}
```

### Optional External APIs

```typescript
// OpenWeatherMap (free tier)
https://api.openweathermap.org/data/2.5/weather
- NEXT_PUBLIC_WEATHER_API_KEY environment variable

// Google Calendar Sync (future)
- Read-only sync of upcoming events
```

---

## 📈 Performance Considerations

### Caching Strategy

**Weather Data**: 1-hour TTL (frequent changes)
```typescript
cache.set('weather:current:lat:lon', weatherData, 3600000)
```

**Cost Analytics**: 24-hour TTL (daily update)
```typescript
cache.set('costAnalytics:full', summary, 86400000)
```

**Price History**: 12-hour TTL (daily deals)
```typescript
cache.set('priceHistory:itemId', prices, 43200000)
```

**Calendar**: No cache (user-created, infrequently changes)

### Batch Operations

Use existing `batchOperations` module for:
- Updating condition on 100+ items
- Syncing price history for wishlist
- Calculating analytics on large wardrobes

```typescript
import { executeBatch } from '@/lib/batchOperations'

const results = await executeBatch(
  items.map(item => ({
    operation: 'updateCondition',
    params: { itemId: item.id, condition: 3 }
  })),
  { batchSize: 50, progressCallback }
)
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] Cost-per-wear calculations (various price points)
- [ ] Duplicate detection (similarity matching)
- [ ] Weather category logic (all conditions)
- [ ] Condition rating calculations
- [ ] Wardrobe gap analysis
- [ ] Capsule filtering and organization
- [ ] Mood logging and streaks
- [ ] Price drop detection

### Integration Tests

- [ ] Weather API → Outfit suggestions
- [ ] Calendar events → Outfit planning
- [ ] Shopping → Budget tracking
- [ ] Affirmations → Mood context
- [ ] Social sharing → Rating system

### E2E Tests

- [ ] Complete weather-to-outfit flow
- [ ] Calendar event planning + execution
- [ ] Shopping with price tracking + alerts
- [ ] Capsule creation and usage
- [ ] Social sharing workflow

---

## 📝 Usage Examples

### Weather Integration
```typescript
import { getUserLocation, fetchCurrentWeather } from '@/lib/weatherIntegration'

// Get outfit suggestions for today's weather
const location = await getUserLocation()
const weather = await fetchCurrentWeather(location.lat, location.lon)
const prompt = buildWeatherOutfitPrompt(weather, userItems)
const suggestions = await geminiAPI(prompt)
```

### Cost Analytics
```typescript
import { generateCostAnalytics, getUnderUtilizedItems } from '@/lib/costAnalytics'

// See ROI on every item
const analytics = generateCostAnalytics(items, looks)
console.log(analytics.bestValue) // Best investment
console.log(analytics.unused) // Never worn

// Find items to wear more
const underutilized = getUnderUtilizedItems(items, looks, 90)
```

### Wardrobe Health
```typescript
import { generateWardrobeHealthReport } from '@/lib/wardrobeHealth'

// Get holistic wardrobe assessment
const report = generateWardrobeHealthReport(items, looks)
console.log(report.overallHealthScore) // 0-100
console.log(report.recommendations) // AI suggestions
```

### Social Sharing
```typescript
import { createSharedLook, generateShareLink, generateEmbedCode } from '@/lib/socialSharing'

// Share outfit with friends
const shared = createSharedLook(look, username, 'Date Night', 'My favorite outfit!')
const link = generateShareLink(shared.shareToken)
const embed = generateEmbedCode(shared.shareToken)
// Send link to friends or embed on blog
```

### Smart Shopping
```typescript
import { detectDuplicateInWishlist, generateSmartRecommendations } from '@/lib/smartShopping'

// Prevent duplicate purchases
const duplicates = detectDuplicateInWishlist('Black Blazer', wishlist)

// Get smart recommendations
const recs = generateSmartRecommendations(categoryDistribution, budget)
```

### Calendar Planning
```typescript
import { createCalendarEvent, getUpcomingEventsNeedingPlanners } from '@/lib/advancedFeatures'

// Plan outfit for upcoming wedding
const event = createCalendarEvent('Sarah Wedding', eventDate, 'wedding')
const suggestion = suggestOutfitForEvent(event, availableLooks)
```

### Wardrobe Capsules
```typescript
import { createTravelCapsule, addLookToCapsule } from '@/lib/advancedFeatures'

// Build minimalist travel packing
const capsule = createTravelCapsule('Paris', 7, ['top', 'bottom', 'shoe'])
capsule = addLookToCapsule(capsule, essentialLookId)
```

### Mood Affirmations
```typescript
import { getAffirmationRecommendation, updateStreak } from '@/lib/advancedFeatures'

// Get personalized affirmation
const affirmation = getAffirmationRecommendation('anxious', affirmations)

// Track reading streak
const streak = updateStreak(currentStreak)
```

---

## 🚀 Deployment Checklist

- [ ] All new types added to `src/types/index.ts`
- [ ] All IndexedDB keys added to `useStore.ts`
- [ ] Environment variables set (NEXT_PUBLIC_WEATHER_API_KEY if needed)
- [ ] All components created and tested
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] Lint check: `npm run lint`
- [ ] TypeScript check: `npx tsc --noEmit`
- [ ] Production build: `npm run build`
- [ ] Deploy to production

---

## 📚 File References

- Feature modules: `src/lib/weather|Cost|itemCondition|wardrobeHealth|social|smartShopping|advancedFeatures.ts`
- Types: `src/types/index.ts`
- Store: `src/hooks/useStore.ts`
- API route: `src/app/api/gemini/route.ts`
- Shopping API: `src/app/api/shopping/route.ts`

---

## 🎯 Next Steps

1. **Immediate**: Add types and IndexedDB keys
2. **This week**: Implement weather + cost analytics
3. **Next week**: Add condition tracking + wardrobe health
4. **Following week**: Social sharing + smart shopping
5. **Final week**: Calendar + capsules + affirmations

**Total development time**: 2-3 weeks for full implementation and testing

---

**Last Updated**: January 2026  
**Status**: Ready for implementation  
**Code Lines**: 3,038 (modules only, not including React components)

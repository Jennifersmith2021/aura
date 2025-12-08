# Aura - Features to Add (Copilot Reference Guide)

## 📋 Features Currently Being Built

### **Queue (In Progress)**

#### 1. **Supplement Tracker** 💊
- **Type**: `SupplementLog` (id, date, name, type, dosage, notes) ✅
- **Store Key**: `supplements` ✅
- **Components**: `SupplementTracker.tsx` 🔴
- **Route**: `/health` (new) 🔴
- **Features**:
  - Add/edit/remove supplements
  - Track daily intake
  - Types: vitamin, mineral, herb, protein, other
  - Dosage amount & unit (mg, mcg, ml, tablet)
  - Reminder notes
  - Last taken tracking
- **Status**: 🟡 Type & State Ready → Building Components

#### 2. **Workout Tracker** 💪
- **Type**: `WorkoutPlan`, `WorkoutSession` ✅
  - Plan: id, date, dayOfWeek, exercises[], notes
  - Session: id, date, planId, exercises[], youtubeLinks[], duration, notes
- **Store Key**: `workoutPlans`, `workoutSessions` ✅
- **Components**: `WorkoutPlanner.tsx`, `WorkoutLogger.tsx` 🔴
- **Route**: `/training/workouts` (under new Training section) 🔴
- **Features**:
  - Create weekly workout plans
  - Log individual workout sessions
  - Link YouTube video tutorials per exercise
  - Duration tracking
  - Exercise notes (weight, reps, sets)
  - Weekly overview
- **Status**: 🟡 Type & State Ready → Building Components

#### 3. **Daily Affirmations Enhanced** ✨
- **Expand**: `DailyAffirmation` type ✅
  - Add `category`: 'sissy' | 'general' | 'confidence' | 'body-positive'
  - Add `videoUrl?`: string (YouTube link for sissy positive reinforcement)
  - Add `isFavorite`: boolean
- **Store Key**: `affirmations`, `dailyAffirmation` (existing, expand) ✅
- **Components**: `DailyAffirmations.tsx` (enhance), `SissyAffirmations.tsx` (new) 🔴
- **Route**: `/training/affirmations` (new, under Training section) 🔴
- **Features**:
  - Daily affirmations with sissy-specific category
  - Link sissy positive reinforcement videos
  - Morning affirmation display
  - Favorite/save affirmations
  - Rotate through collection
- **Status**: 🟡 Type & State Ready → Building Components

#### 4. **Training Section (Menu Restructure)** 🎓
- **New Top-Level Route**: `/training` 🔴
- **Sub-routes**: 🔴
  - `/training/affirmations` - Daily affirmations + sissy reinforcement
  - `/training/sissy-logs` - Sissy training logs (existing `SissyTraining.tsx` content)
  - `/training/workouts` - Workout planning & logging
  - `/training/challenges` - Challenges (existing `ChallengeSystem.tsx` content)
- **Navigation Update**: Add "Training" to main nav, link to `/training` with submenu 🔴
- **Components**: `TrainingHub.tsx` (new landing/menu page) 🔴
- **Status**: 🔴 Not Started

---

## 📊 Architecture Summary

### **Completed Infrastructure**
- ✅ All 4 feature types defined in `src/types/index.ts`
- ✅ All mutations added to `src/hooks/useStore.ts`:
  - Supplements: `addSupplement`, `removeSupplement`, `updateSupplement`
  - Workouts: `addWorkoutPlan`, `removeWorkoutPlan`, `updateWorkoutPlan` + session methods
  - Affirmations: `addDailyAffirmation`, `removeDailyAffirmation`, `updateDailyAffirmation`, `toggleAffirmationFavorite`
- ✅ IndexedDB persistence keys configured: `supplements`, `workoutPlans`, `workoutSessions`, `dailyAffirmations`

### **Next Steps**
1. Create `SupplementTracker.tsx` component
2. Create `WorkoutPlanner.tsx` & `WorkoutLogger.tsx` components  
3. Create `SissyAffirmations.tsx` component
4. Create `TrainingHub.tsx` landing page
5. Update `Navigation.tsx` to add Training section
6. Create routes under `/training/`
7. Run lint & build to verify

---

## 🚀 How to Add a New Feature

### **Step-by-Step Implementation Checklist**

#### 1. **Define the Type** (`src/types/index.ts`)
```typescript
export interface NewFeature {
  id: string;
  name: string;
  date: number; // timestamp
  // ... other properties
}
```
- Always include `id` and `date` fields
- Use `number` for dates (timestamps)
- Match naming conventions (PascalCase for interfaces)

#### 2. **Add State Management** (`src/hooks/useStore.ts`)
```typescript
// Add persistence key constant at top
const NEW_FEATURE_KEY = 'newFeatures';

// In useState initialization
const [newFeatures, setNewFeatures] = useState<NewFeature[]>([]);

// Add mutation functions
const addNewFeature = (feature: Omit<NewFeature, 'id' | 'date'>) => {
  const next = [
    ...newFeatures,
    { ...feature, id: crypto.randomUUID(), date: Date.now() }
  ];
  set(NEW_FEATURE_KEY, next);
  setNewFeatures(next);
};

const removeNewFeature = (id: string) => {
  const next = newFeatures.filter(f => f.id !== id);
  set(NEW_FEATURE_KEY, next);
  setNewFeatures(next);
};

const updateNewFeature = (id: string, updates: Partial<NewFeature>) => {
  const next = newFeatures.map(f =>
    f.id === id ? { ...f, ...updates } : f
  );
  set(NEW_FEATURE_KEY, next);
  setNewFeatures(next);
};

// Export in return { ... }
// Return pattern: add, remove, update, list methods
```

#### 3. **Create Component** (`src/components/NewFeatureComponent.tsx`)
```typescript
"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Plus, Trash2, Heart } from "lucide-react";

export default function NewFeatureComponent() {
  const { newFeatures, addNewFeature, removeNewFeature } = useStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">New Feature</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add
        </button>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {newFeatures.map(item => (
          <div key={item.id} className="bg-white/5 rounded-lg p-4">
            {/* Item content */}
            <button
              onClick={() => removeNewFeature(item.id)}
              className="text-red-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal for adding/editing */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          {/* Modal content */}
        </div>
      )}
    </div>
  );
}
```

#### 4. **Create Page Route** (`src/app/new-feature/page.tsx`)
```typescript
import NewFeatureComponent from "@/components/NewFeatureComponent";

export default function NewFeaturePage() {
  return (
    <main className="min-h-screen p-4">
      <NewFeatureComponent />
    </main>
  );
}
```

#### 5. **Update Navigation** (`src/components/Navigation.tsx`)
Add to the navigation tabs array:
```typescript
{
  id: 'new-feature',
  label: 'Feature Name',
  icon: HeartIcon, // or other lucide icon
  href: '/new-feature',
}
```

#### 6. **Optional: AI Integration** (`src/app/api/new-feature/route.ts`)
If feature needs AI suggestions or recommendations:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  const { query, context } = await request.json();
  const apiKey = request.headers.get("x-google-api-key") || process.env.GOOGLE_API_KEY;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(`Your prompt: ${query}`);
  return Response.json({ suggestion: result.response.text() });
}
```

---

## 📦 Common Patterns

### **Sorting & Filtering**
```typescript
// Sort descending by date (newest first)
const sorted = items.sort((a, b) => b.date - a.date);

// Get items from last 7 days
const [now] = useState(() => Date.now());
const last7Days = items.filter(i => i.date > now - 7 * 24 * 60 * 60 * 1000);
```

### **Computed Values in Render**
❌ **WRONG** - Causes purity violations:
```typescript
const count = items.filter(i => i.date > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
```

✅ **RIGHT** - Use useState:
```typescript
const [now] = useState(() => Date.now());
const count = items.filter(i => i.date > now - 30 * 24 * 60 * 60 * 1000).length;
```

### **Unescaped Entities**
❌ **WRONG**:
```typescript
<p>"Hello" it's working</p>
```

✅ **RIGHT**:
```typescript
<p>&quot;Hello&quot; it&apos;s working</p>
```

### **Modal Pattern**
```typescript
{showModal && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setShowModal(false)}
  >
    <div 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Content */}
    </div>
  </div>
)}
```

---

## 🎨 Design Standards

### **Color Palette**
- Primary: `text-white/80` to `text-white/95` (high contrast)
- Accent: `bg-pink-500`, `bg-purple-500`, `text-yellow-400`
- Muted: `text-white/40` to `text-white/60`
- Background: `bg-white/5` to `bg-white/10` for cards

### **Component Layout**
- Mobile-first: `max-w-md` for main container
- Spacing: `space-y-4`, `space-y-6` for vertical rhythm
- Icons: `lucide-react` library
- Transitions: `Framer Motion` for animations

### **Text Styling**
- Headers: `font-bold` or `font-semibold`
- Body: `font-medium` for visibility
- All text `text-white/80` minimum for accessibility

---

## 📝 Database Sync (Optional)

If storing in Prisma:

1. **Update `prisma/schema.prisma`**:
```prisma
model NewFeature {
  id        String   @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
}
```

2. **Run migration**:
```bash
npx prisma db push
```

3. **Update `/api/sync/items`** to sync data

---

## 🔧 Lint & Build Requirements

- ✅ No `Date.now()` in render (use `useState`)
- ✅ No unescaped entities in JSX (`&quot;`, `&apos;`)
- ✅ All imports used (no unused variables)
- ✅ TypeScript strict mode compliance
- ✅ Production build must succeed: `npm run build`

**Before committing:**
```bash
npm run lint      # Should pass with 0 errors
npm run build     # Must complete with exit code 0
npm run test:e2e  # Run tests if applicable
```

---

## 📂 Project Structure Reference

```
src/
├── app/
│   ├── [route]/page.tsx          ← New pages here
│   ├── api/[endpoint]/route.ts    ← New APIs here
│   └── layout.tsx
├── components/
│   ├── NewFeature.tsx             ← Feature components here
│   ├── Navigation.tsx             ← Update for new routes
│   └── ...existing
├── hooks/
│   └── useStore.ts                ← State + persistence
├── types/
│   └── index.ts                   ← Data types
├── utils/
│   ├── contentPolicy.ts           ← Content filtering
│   └── ...helpers
└── lib/
    ├── imageGenerator.ts          ← Image generation
    └── retailerAdapter.ts         ← Shopping API
```

---

## 🚦 IndexedDB Persistence Keys

When adding features, use these keys:
```typescript
// Existing keys (don't modify)
const keys = [
  'items', 'looks', 'measurements', 'timeline', 'routines',
  'shoppingItems', 'shoppingLists', 'inspiration', 'colorSeason',
  'chastitySessions', 'corsetSessions', 'orgasmLogs', 'arousalLogs',
  'toyCollection', 'intimacyJournal', 'skincareProducts',
  'clitMeasurements', 'wigCollection', 'hairStyles', 'sissyGoals',
  'sissyLogs', 'compliments', 'packingLists', 'challenges',
  'achievements', 'affirmations', 'dailyAffirmation', 'progressPhotos'
];

// Add new keys in UPPERCASE_SNAKE_CASE
const NEW_FEATURE_KEY = 'newFeatures';
```

---

## ✅ Testing Your Feature

1. **Local dev**: `npm run dev` → http://localhost:3000
2. **Check component renders** and CRUD works
3. **Verify persistence** - refresh page, data should remain
4. **Test lint**: `npm run lint` → 0 errors
5. **Test build**: `npm run build` → exit code 0

Ready to build something new! 🚀

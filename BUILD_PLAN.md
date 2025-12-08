# Aura - Build Plan (December 2025)

## 🎯 Project Overview
Adding 4 major features to Aura with a new "Training" section menu structure.

**Architecture Status**: ✅ **COMPLETE**
- Types defined
- State management implemented
- IndexedDB keys configured
- Mutations ready to use

---

## 📦 Feature Build Tasks

### **Phase 1: Core Components** (Next)

#### Task 1.1 - SupplementTracker Component
**File**: `src/components/SupplementTracker.tsx`
**Dependencies**: useStore (supplements, addSupplement, removeSupplement, updateSupplement)
**Features**:
- Display list of supplements (sorted by date, newest first)
- Add new supplement modal with form:
  - Name (text)
  - Type dropdown (vitamin, mineral, herb, protein, other)
  - Dosage (number)
  - Unit dropdown (mg, mcg, ml, tablet, capsule, g)
  - Notes (optional textarea)
- Edit supplement modal
- Delete button per supplement
- Last taken tracking (optional, future enhancement)
- Daily view with checkboxes to mark taken

**Template**: Use `ChastityTracker.tsx` or `SkincareRoutine.tsx` as reference

---

#### Task 1.2 - WorkoutPlanner Component
**File**: `src/components/WorkoutPlanner.tsx`
**Dependencies**: useStore (workoutPlans, addWorkoutPlan, removeWorkoutPlan, updateWorkoutPlan)
**Features**:
- Weekly view (7 days)
- Add workout plan modal:
  - Day of week selector
  - Exercises (dynamic list):
    - Exercise name
    - Sets (optional)
    - Reps (optional)
    - Weight (optional)
    - YouTube URL (optional)
    - Notes (optional)
- Edit/delete existing plans
- View exercise count per day
- Color code by day

---

#### Task 1.3 - WorkoutLogger Component
**File**: `src/components/WorkoutLogger.tsx`
**Dependencies**: useStore (workoutSessions, addWorkoutSession, removeWorkoutSession, updateWorkoutSession, workoutPlans)
**Features**:
- Log new workout session:
  - Date picker
  - Select from existing plan (optional)
  - Manual exercise entry (if not using plan)
  - Duration in minutes
  - Notes
- View past sessions (sorted by date, newest first)
- Edit/delete sessions
- Link to YouTube videos from exercises
- Stats: Total workouts, last workout date, average duration

---

#### Task 1.4 - SissyAffirmations Component
**File**: `src/components/SissyAffirmations.tsx`
**Dependencies**: useStore (dailyAffirmations, addDailyAffirmation, removeDailyAffirmation, updateDailyAffirmation, toggleAffirmationFavorite)
**Features**:
- Daily sissy affirmation display (featured card)
- Categories filter (sissy, general, confidence, body-positive)
- Add new affirmation modal:
  - Text (required)
  - Category (required)
  - YouTube video URL (optional, for reinforcement videos)
- Favorite/unfavorite toggle
- List of affirmations by category
- Random selection for daily feature
- Play video if URL exists

---

### **Phase 2: Menu Restructure**

#### Task 2.1 - Create TrainingHub Landing Page
**File**: `src/app/training/page.tsx`
**Components**: `TrainingHub.tsx`
**Features**:
- Landing page with 4 sections:
  1. Affirmations (sissy + general)
  2. Sissy Training (existing content)
  3. Workouts (planning + logging)
  4. Challenges (existing content)
- Icon + link to each section
- Quick stats (affirmations today, workouts this week, etc.)

---

#### Task 2.2 - Create Training Sub-Routes
**Routes to create**:
- `src/app/training/affirmations/page.tsx` → SissyAffirmations component
- `src/app/training/sissy-logs/page.tsx` → Existing SissyTraining content
- `src/app/training/workouts/page.tsx` → Combines WorkoutPlanner + WorkoutLogger
- `src/app/training/challenges/page.tsx` → Existing ChallengeSystem content

---

#### Task 2.3 - Update Navigation
**File**: `src/components/Navigation.tsx`
**Changes**:
- Change "Studio" route to "/training"
- Update Navigation component structure to show Training as main section
- Consider submenu for Training (shows 4 subsections)
- Update icons if needed

---

### **Phase 3: Health Section** (Optional, can be added later)

#### Task 3.1 - Create Health Page (Future)
**File**: `src/app/health/page.tsx`
**Purpose**: Central hub for health-related tracking
- Supplements tracker
- Skincare routine (move from current location)
- Measurements/health metrics
- Stats dashboard

---

## 📋 Build Checklist

### Pre-Build
- [ ] Read `FEATURES_TO_ADD.md` for architectural guidance
- [ ] Check `FEATURES_TO_ADD.md` common patterns section
- [ ] Review existing component templates

### Component Build (Phase 1)
- [ ] SupplementTracker.tsx
  - [ ] Add modal validation
  - [ ] Test persistence
  - [ ] Lint check
- [ ] WorkoutPlanner.tsx
  - [ ] Day of week mapping
  - [ ] Dynamic exercise list
  - [ ] Test persistence
- [ ] WorkoutLogger.tsx
  - [ ] Date picker integration
  - [ ] YouTube URL validation
  - [ ] Stats calculation
- [ ] SissyAffirmations.tsx
  - [ ] Category filtering
  - [ ] Daily feature selection
  - [ ] Video player integration

### Routes & Navigation (Phase 2)
- [ ] Create `/training` routes directory
- [ ] Create all 4 sub-routes
- [ ] Create TrainingHub.tsx
- [ ] Update Navigation.tsx

### Testing & Validation
- [ ] Each component builds without errors
- [ ] Data persists on page refresh
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] Manual testing in browser
- [ ] Test all CRUD operations

---

## 🚀 Start Building

### First Component to Build: SupplementTracker
**Recommended approach**:
1. Copy/adapt from `SkincareRoutine.tsx` template
2. Create basic UI with list
3. Add modal for adding supplements
4. Implement mutations (add, remove, update)
5. Test persistence
6. Run lint & build
7. Move to next component

---

## 📝 Code Standards (Reference)

### Component Template
```typescript
"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Plus, Trash2, Edit3 } from "lucide-react";

export default function NewFeature() {
  const { supplements, addSupplement, removeSupplement, updateSupplement } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [now] = useState(() => Date.now());

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white/95">Supplements</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-500 hover:bg-pink-600 px-3 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Items */}
      {supplements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60 font-medium">No supplements yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {supplements.map((item) => (
            <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              {/* Item content */}
              <button
                onClick={() => removeSupplement(item.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          {/* Modal content */}
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Key Design Patterns (Copy-Paste Ready)

### Modal Pattern
```tsx
{showModal && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setShowModal(false)}
  >
    <div 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-bold mb-4 text-white/95">Add Supplement</h3>
      {/* Form fields */}
      <div className="flex gap-3 mt-6">
        <button className="flex-1 bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg font-medium">Save</button>
        <button onClick={() => setShowModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium">Cancel</button>
      </div>
    </div>
  </div>
)}
```

### Form Input Pattern
```tsx
<div className="space-y-3">
  <label className="block text-sm font-medium text-white/90">Name *</label>
  <input
    type="text"
    value={formName}
    onChange={(e) => setFormName(e.target.value)}
    placeholder="e.g., Vitamin D"
    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-white/40"
  />
</div>
```

### Dropdown Pattern
```tsx
<div className="space-y-3">
  <label className="block text-sm font-medium text-white/90">Type *</label>
  <select
    value={formType}
    onChange={(e) => setFormType(e.target.value as any)}
    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
  >
    <option value="">Select type</option>
    <option value="vitamin">Vitamin</option>
    <option value="mineral">Mineral</option>
    <option value="herb">Herb</option>
    <option value="protein">Protein</option>
    <option value="other">Other</option>
  </select>
</div>
```

---

## ✅ Done!

Architecture is ready. Next: Start building SupplementTracker component.

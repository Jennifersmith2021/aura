```markdown
# Aura — AI Agent Guide

## Quick Start
- **Install**: `npm install` | **Dev**: `npm run dev` | **Build**: `npm run build` then `npm start`
- **Tests**: `npm run test:e2e` (Playwright) | **Lint**: `npm run lint` | **Typecheck**: `npx tsc --noEmit`
- **Database** (optional): `docker-compose up -d` → `npx prisma db push` → `npm run prisma:seed`
- **Python adapter** (for real Amazon search): `uvicorn api-adapter.adapter:app --reload --port 8001`

## Architecture Overview
- **Stack**: Next.js 16 App Router + React 19 + TypeScript + Tailwind v4 + Framer Motion
- **State management**: Client-side store in `src/hooks/useStore.ts` persisted to **IndexedDB** via `idb-keyval`
  - All state mutations: `setState(updated)` → `set(<indexdb-key>, updated)` → component re-renders
  - Data loads on mount from IndexedDB, sorted desc by date for logs/measurements/timeline
- **Optional server sync**: Prisma 7 + PostgreSQL for `/api/sync/items` (backup/multi-device)
- **Type system**: Single source of truth in `src/types/index.ts` — all types defined here, nowhere else
- **Route structure**: `src/app/*` pages (home, closet, shopping, studio, fitting-room, stylist, vanity, sissy, training, wishlist)

## Auth & Sync
- **Auth**: NextAuth (credentials) with Prisma adapter; DB sessions (no JWT). Config in `src/lib/authOptions.ts`; route handler at `src/app/api/auth/[...nextauth]/route.ts`.
- **Register**: POST `/api/register` creates user with bcrypt hash; login at `/login` using credentials provider.
- **Env**: set `AUTH_SECRET` (or `NEXTAUTH_SECRET`) and `DATABASE_URL` for Prisma/NextAuth.
- **Data ownership**: `Item.userId` scopes server sync. `/api/sync/items` requires auth and filters by `userId`.
- **Client sync**: `SessionSync` merges IndexedDB items with server on login, then POSTs merged set; `hydrateItems` in `useStore` persists merged state.

## Critical Conventions (DO NOT BREAK)
1. **Always use `@/` path alias** for imports — never relative paths like `../../`
2. **Client components MUST start with `"use client"`** directive when using hooks/state
3. **Types only in `src/types/index.ts`** — mirror new types in `useStore` mutations
4. **Icons**: prefer `lucide-react` package; use `clsx` or `cn()` from `@/lib/utils` for conditional classes
5. **Mobile-first**: containers use `max-w-md`, bottom navigation on mobile, Tailwind semantic tokens (`bg-background`, `text-foreground`)

## Data Persistence Pattern
**IndexedDB keys** (complete list): `items`, `looks`, `measurements`, `timeline`, `routines`, `shoppingItems`, `shoppingLists`, `inspiration`, `colorSeason`, `chastitySessions`, `corsetSessions`, `orgasmLogs`, `arousalLogs`, `toyCollection`, `intimacyJournal`, `skincareProducts`, `clitMeasurements`, `wigCollection`, `hairStyles`, `sissyGoals`, `sissyLogs`, `compliments`, `packingLists`, `challenges`, `achievements`, `affirmations`, `dailyAffirmation`, `progressPhotos`, `supplements`, `workoutPlans`, `workoutSessions`, `dailyAffirmations`, `makeupTutorials`

**Mutation pattern** (example from `useStore.ts`):
```typescript
const addItem = useCallback((item: Item) => {
  const next = [...items, { ...item, id: uuidv4(), dateAdded: Date.now() }];
  setItems(next);
  set("items", next); // Persist to IndexedDB
}, [items]);
```

## Core Types Reference
- **Item**: `{ id, name, type: "clothing"|"makeup", category: Category, color?, image?, price?, wishlist?, brand?, dateAdded, dateOpened?, importMeta? }`
- **Look**: outfit combos with `items: string[]` (Item IDs)
- **MeasurementLog**: body tracking with `{ bust, waist, hips, weight, clitLengthMm, goalWaist, goalWHR }` + photo
- **ChastitySession**: `{ startDate, endDate?, cageModel?, ringSize?, hygieneEvents[] }`
- **CorsetSession**: `{ waistBefore, waistCorseted, waistAfter, corsetType, durationMinutes }`
- **OrgasmLog**: `{ date, type, method: "wand"|"anal"|..., chastityStatus: "locked"|"unlocked" }`
- **ShoppingItem**: retailer/category enums include **adult** categories

## AI Integration
### `/api/gemini` (Google Generative AI)
- **`type: "text"`**: builds Aura persona prompt with optional `context` (user inventory) and `weather`
- **`type: "json"`**: returns structured data (no markdown), use for recommendations
- **`type: "image"`**: uses `@/lib/imageGenerator`, falls back to placeholder
- **Auth**: accepts `x-google-api-key` header (dev) or `GOOGLE_API_KEY` env var (prod)

### `/api/shopping` (Product Search)
- **`type: "search"`**: 60s in-memory cache, supports `page`/`limit` pagination
  - Prefers local adapter if `USE_LOCAL_RETAILER_ADAPTER=true` (`RETAILER_ADAPTER_URL`)
  - Falls back to Gemini 1.5 Flash if adapter unavailable
- **`type: "recommendations"`**: returns JSON object of suggested products
- **Adult content filtering**: filters adult unless `includeAdult` param OR `x-user-consent: true` header (see `src/utils/contentPolicy.ts`)

## Amazon CSV Import
- **Parser**: `src/utils/amazonParser.ts` maps CSV columns to `Item` with type/category inference heuristics
- **Test scripts**: `scripts/test-amazon-parser.ts` and `.mjs` for validation
- **Expiration tracking**: `src/utils/expiration.ts` returns exact statuses `good|warning|expired` for makeup

## Styling & UI
- **CSS variables**: defined in `src/app/globals.css` with dark mode via `@media (prefers-color-scheme: dark)`
- **Navigation**: `src/components/Navigation.tsx` = fixed bottom tab bar (5 main routes: home, closet, shopping, vanity, studio)
- **Tailwind v4**: uses `@import "tailwindcss"` (no config file), semantic tokens like `bg-primary`, `text-foreground`
- **Animations**: Framer Motion for page transitions and interactive elements

## Testing
- **E2E**: Playwright specs in `tests/` (navigation, shopping flows)
- **Unit**: `tests/unit/` for parser, expiration, sync logic
- **Manual typecheck**: `npx tsc --noEmit` (no CI configured)

## Adding New Features (Workflow)
1. **Define types** in `src/types/index.ts` (single source of truth)
2. **Update `useStore`** with state + mutations, persist with matching IndexedDB key
3. **Create component** in `src/components/` with `"use client"` if stateful
4. **Keep adult consent checks** (`isAdultCategory`, `x-user-consent` header) when surfacing products
5. **Minimize AI token usage**: send only `{ name, type, category, color }` for item context, not full objects
```


- Important conventions (do not change unless asked):

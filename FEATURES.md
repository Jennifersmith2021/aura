# Aura — Features Documentation

**Aura** is a personal style and beauty companion app with AI-powered styling, closet management, makeup tracking, outfit planning, and shopping integration. This document provides a comprehensive overview of all implemented features.

---

## 🏠 Home Dashboard (`/`)

**Purpose**: Central hub for quick overview and recent activity.

### Features
- **Daily motivational quote** with gradient header
- **Closet stats**: Live count of clothing items and makeup products
- **Quick add button**: One-tap access to add new items
- **Recent items grid**: Last 4 added items displayed as cards
- **Shopping widget**: Wishlist preview and AI recommendations (max 4 items)
- **Timeline preview**: Recent style journey entries

---

## 👗 Closet Management (`/closet`)

**Purpose**: Organize and browse all clothing items with filtering and search.

### Features
- **Item cards**: Display name, brand, price, image, purchase link
- **Category filtering**: Filter by type (top, bottom, dress, shoe, outerwear, accessory)
- **Search bar**: Find items by name or brand
- **Add items modal**: Upload photos (Base64), set details (name, brand, price, category, color)
- **Delete items**: Remove unwanted items with confirmation
- **Outfit generator**: Generate AI-powered outfit suggestions from selected items

### Data Persistence
- All items stored in IndexedDB under `items` key
- Optional server sync via `/api/sync/items` (Prisma)

---

## 🛍️ Shopping (`/shopping`)

**Purpose**: Search retailers, build wishlists, and get AI-powered product recommendations.

### Features
- **Product search**: Search Amazon, Sephora, Ulta, Target, Walmart, Etsy, Adam & Eve, and more
- **Retailer filter**: Filter by specific retailer
- **Category filter**: Filter by fashion, shoes, accessories, makeup, skincare, haircare, adult, wellness
- **Pagination**: Load more results with infinite scroll or page navigation
- **Add to wishlist**: Heart icon to save products for later
- **Adult content consent**: Opt-in modal for adult category products (respects localStorage)
- **Local adapter integration**: Optional FastAPI + amazon-mcp bridge for real Amazon searches
- **60-second cache**: In-memory cache reduces redundant API calls
- **AI-generated fallback**: If local adapter unavailable, uses Gemini 1.5 Flash for recommendations

### Shopping API
- **Search endpoint**: `POST /api/shopping` with `type: "search"`, `query`, `retailer`, `category`, `page`, `limit`
- **Recommendations endpoint**: `POST /api/shopping` with `type: "recommendations"`

### Data Persistence
- Shopping items stored in IndexedDB under `shoppingItems` key
- Shopping lists under `shoppingLists` key

---

## 💄 Makeup Vanity (`/vanity`)

**Purpose**: Track makeup inventory, expiration dates, and beauty routines.

### Features
- **Two tabs**: Products view + Routines builder
- **Makeup products**: Display all makeup items with category filter (face, eye, lip, cheek, tool)
- **Search**: Find products by name or brand
- **Expiration tracking**: Visual warnings for products nearing/past expiration
  - Status: `good`, `warning` (30 days left), `expired`
  - Based on category-specific shelf-life (e.g., mascara 90 days, lipstick 2 years)
- **Routine builder**: Create multi-step beauty routines (skincare, makeup application)
  - Add/edit/delete routines
  - Reorder steps with up/down arrows
  - Link products to routine steps

### Data Persistence
- Makeup items stored in `items` (filtered by `type: "makeup"`)
- Routines stored in IndexedDB under `routines` key

---

## 🎨 Studio (`/studio`)

**Purpose**: Creative hub for looks, journey, stats, guides, and inspiration.

### Tabs Overview
1. **Looks**: Outfit composition and lookbook
2. **Journey**: Timeline of style milestones
3. **Stats**: Body measurements, makeup expiration, chastity/corset tracking
4. **Guide**: Wardrobe essentials checklist
5. **Color**: Seasonal color analysis quiz
6. **Shop**: AI shopping recommendations
7. **Inspo**: Inspiration board (image gallery)

---

### 1️⃣ Looks (Lookbook)

**Purpose**: Create and save outfit combinations.

**Features**:
- **Create new looks**: Select multiple clothing items to compose an outfit
- **Name looks**: Label outfits (e.g., "Date Night", "Office Casual")
- **View all looks**: Browse saved outfits with item previews
- **Auto-generated collage**: Displays all items in the look

**Data**: Stored in IndexedDB under `looks` key (links item IDs)

---

### 2️⃣ Journey (Timeline)

**Purpose**: Visual diary of style evolution and milestones.

**Features**:
- **Add timeline entries**: Upload photos with date and notes
- **Link to looks**: Optionally associate timeline entries with saved looks
- **Chronological view**: Sorted by date (newest first)
- **Gallery display**: Grid layout with photo thumbnails

**Data**: Stored in IndexedDB under `timeline` key

---

### 3️⃣ Stats

**Purpose**: Track body metrics, makeup shelf-life, and personal wellness.

#### Body Measurements
- **Log new measurements**: Bust, waist, hips, weight, dress size, shoe size
- **Goal tracking**: Set target waist and waist-to-hip ratio (WHR) goals
- **Progress visualization**: Visual progress bars showing % to goal completion
- **Waist-to-hip ratio**: Auto-calculated with comparison to goal WHR
- **Progress charts**: Line charts for bust/waist/hips/weight over time (Recharts)
- **Photo tracking**: Attach progress photos to measurement logs

**Data**: Stored in IndexedDB under `measurements` key (sorted by date desc)

#### Makeup Expiration
- **Visual alerts**: Shows products approaching/past expiration
- **Days remaining**: Countdown based on `dateOpened` and category shelf-life
- **Status badges**: Color-coded (green = good, yellow = warning, red = expired)

---

### 8️⃣ Love (Intimate Tracking)

**Purpose**: Private space for tracking intimate wellness, body modification, and personal growth.

#### Chastity Tracker
- **Lock/unlock sessions**: Track duration with start/end dates
- **Device details**: Record cage model and ring size for proper fit tracking
- **Hygiene logs**: Record hygiene check timestamps
- **Keyholder notes**: Optional keyholder name and session notes
- **Active session warning**: Visual indicator when locked
- **Session history**: View all past sessions with duration stats

**Data**: Stored in IndexedDB under `chastitySessions` key

#### Orgasm Tracker
- **Type tracking**: Solo, partnered, or other
- **Method details**: Wand, anal, penetration, oral, hands, or other
- **Chastity integration**: Locked or unlocked status
- **Custom dates**: Backdate entries or log in real-time
- **Private notes**: Optional session reflections
- **Stats dashboard**: Days since last, 30-day count
- **Chastity protection**: Logging disabled when locked

**Data**: Stored in IndexedDB under `orgasmLogs` key

#### Corset Tracker
- **Training sessions**: Log start/end times with live timer
- **Comprehensive measurements**: Track waist before, during corseting, and after removal
- **Corset type**: Record which corset used (underbust, overbust, etc.)
- **Progress visualization**: Chart showing waist reduction journey
- **Total hours trained**: Aggregate session duration stats
- **Session notes**: Optional notes per session

**Data**: Stored in IndexedDB under `corsetSessions` key

---

### 4️⃣ Guide (Essentials Checklist)

**Purpose**: Track wardrobe must-haves.

**Features**:
- **Pre-defined essentials**: Little Black Dress, Denim Jacket, White Tee, Black Heels, Red Lipstick, Foundation, Mascara
- **Auto-detection**: Fuzzy matching against user's items
- **Visual checklist**: Check marks for owned items, "Missing" badges for gaps

---

### 5️⃣ Color (Seasonal Color Analysis)

**Purpose**: Discover personal color season (Spring, Summer, Autumn, Winter).

**Features**:
- **3-question quiz**: Vein color, jewelry preference, eye color
- **Season result**: Determines whether user is Warm/Cool and Bright/Muted
- **Color palette**: Shows recommended colors for the season
- **Retake option**: Reset and redo the quiz

**Data**: Stored in IndexedDB under `colorSeason` key

---

### 6️⃣ Shop (AI Recommendations)

**Purpose**: AI-powered shopping suggestions based on inventory.

**Features**:
- **Personalized recommendations**: Gemini analyzes user's items and suggests complementary products
- **Reason explanations**: Each suggestion includes why it fits the user's style
- **Add to wishlist**: One-tap save to shopping list
- **Refresh button**: Regenerate recommendations

---

### 7️⃣ Inspo (Inspiration Board)

**Purpose**: Visual mood board for style inspiration.

**Features**:
- **Upload images**: Add inspiration photos (Pinterest, magazine clippings, etc.)
- **Gallery view**: Masonry-style grid layout
- **Delete images**: Remove unwanted inspiration

**Data**: Stored in IndexedDB under `inspiration` key

---

## 🪞 Fitting Room (`/fitting-room`)

**Purpose**: Virtual try-on with drag-and-drop outfit builder.

### Features
- **Drag-and-drop items**: Place clothing items on a canvas
- **Rotate items**: Adjust item angles
- **Outfit validation**: Checks for missing categories (e.g., top + bottom)
- **Save as look**: Convert canvas composition into a saved look

---

## 🤖 AI Stylist (`/stylist`)

**Purpose**: Chat with Aura for personalized styling advice.

### Features
- **Chat interface**: Conversational AI powered by Gemini
- **Context-aware**: Uses user's item inventory for recommendations
- **Weather integration**: Optional weather data for seasonal suggestions
- **Persona**: Friendly, encouraging tone ("You are Aura, a personal stylist...")

### AI API
- **Endpoint**: `POST /api/gemini`
- **Types**: `text` (advice), `json` (structured data), `image` (placeholder)
- **Context**: Sends simplified item data `{ name, type, category, color }` to reduce tokens

---

## 🧰 Developer & Import Tools

### Amazon CSV Import
**Location**: Studio → Stats tab (AmazonImport component)

**Features**:
- **Upload Amazon order CSV**: Parse order history into items
- **Heuristic categorization**: Maps Amazon categories to Aura categories
- **Confidence scoring**: Shows inference confidence for each item
- **Batch import**: Add all parsed items to closet at once

**Implementation**: `src/utils/amazonParser.ts` with test scripts in `scripts/`

### Budget Tracker
**Location**: Studio → Stats tab

**Features**:
- **Pie chart**: Visualize spending breakdown (clothing vs. makeup)
- **Total value**: Sum of all item prices
- **Manual expense**: Add items without full details for quick tracking

---

## 🎨 Design & UX

### Layout
- **Mobile-first**: All pages designed for mobile viewport (`max-w-md`)
- **Bottom navigation**: 7-route tab bar (home, closet, shopping, vanity, fitting-room, studio, stylist)
- **Page transitions**: Framer Motion animations for smooth navigation
- **Dark mode**: Full support via Tailwind class strategy

### Styling
- **Tailwind v4**: Semantic tokens (`bg-background`, `text-foreground`, etc.)
- **Icons**: `lucide-react` (lightweight, tree-shakeable)
- **Charts**: Recharts for measurements and budget visualization
- **Image handling**: Next.js Image component with Base64/URL support

---

## 🔐 Privacy & Content Policy

### Adult Content
- **Opt-in consent**: Modal on first adult category encounter
- **localStorage flag**: `aura_adult_consent` stores user preference
- **API header**: `x-user-consent: true` for server-side filtering
- **Filter everywhere**: Adult items hidden from widgets/search unless consent given

### Data Storage
- **Client-first**: All data stored in IndexedDB (offline-ready)
- **Optional server sync**: `/api/sync/items` upserts to Prisma DB
- **No tracking**: No analytics or third-party data collection

---

## 🛠️ Technical Architecture

### State Management
- **Hook**: `useStore` in `src/hooks/useStore.ts`
- **Persistence**: `idb-keyval` for IndexedDB
- **Keys**: `items`, `looks`, `measurements`, `timeline`, `routines`, `shoppingItems`, `shoppingLists`, `inspiration`, `colorSeason`, `chastitySessions`, `corsetSessions`, `orgasmLogs`
- **Pattern**: Update state → `set(key, newValue)` for atomic writes

### Types
- **Centralized**: All types in `src/types/index.ts`
- **Core types**: `Item`, `Look`, `MeasurementLog` (with goalWaist/goalWHR), `TimelineEntry`, `Routine`, `ShoppingItem`, `ShoppingList`, `Inspiration`, `ColorSeason`, `ChastitySession` (with cageModel/ringSize), `CorsetSession` (with waistBefore/waistCorseted/waistAfter/corsetType), `OrgasmLog` (with type/method/chastityStatus)

### API Routes
- **`/api/gemini`**: AI styling advice (text/json/image)
- **`/api/shopping`**: Product search and recommendations
- **`/api/sync/items`**: Optional Prisma sync (POST to upsert, GET to fetch)

### External Integrations
- **Google Gemini**: AI prompts and structured JSON responses
- **Amazon MCP**: Optional FastAPI adapter for real product search
- **Weather API**: Optional weather data for styling context

---

## 🧪 Testing

### E2E Tests (Playwright)
- **Location**: `tests/`
- **Specs**: `navigation.spec.ts`, `shopping.spec.ts`, `shopping-search.spec.ts`
- **Run**: `npm run test:e2e`

### Unit Tests
- **Location**: `tests/unit/`
- **Coverage**: `amazonParser.spec.ts`, `expiration.spec.ts`, `sync-api.spec.ts`

---

## 🚀 Planned Features

### Intimate & Wellness Tracking
- **Arousal/Desire Tracker** - Log libido levels over time to identify patterns and cycles
- **Toy Collection Manager** - Catalog and organize intimate toys/devices with purchase dates, materials, cleaning schedules
- **Intimacy Journal** - Private diary entries with mood tracking and reflections
- **Cycle Syncing** - Track how hormonal cycles affect goals, mood, desire (integrates with existing measurements)
- **Sensation Play Log** - Track different sensations/activities tried, ratings, partner preferences

### Body Modification & Goals
- **Tattoo & Piercing Tracker** - Document body art with photos, artists, healing progress, aftercare reminders
- **Hormone Tracking** - For HRT users - log doses, side effects, changes over time
- **Body Hair Management** - Schedule waxing/laser appointments, track regrowth cycles
- **Nail Art Gallery** - Track manicure designs, products used, appointment history
- **Skincare Routine Tracker** - AM/PM routines with product expiration (similar to makeup)

### Social & Relationship
- **Partner Preferences** - Store likes/dislikes, boundaries, favorite activities for multiple partners
- **Date Night Planner** - Suggest outfits from closet based on date type, save successful date looks
- **Compliment Journal** - Log compliments received to boost confidence and identify what works
- **Outfit Rating by Others** - Let partners/friends rate looks, aggregate feedback

### Lifestyle & Habits
- **Posture Training Tracker** - Log practice sessions, reminders for deportment/feminine movement
- **Voice Practice Log** - For voice training - track exercises, recordings, progress notes
- **Makeup Skill Progress** - Before/after photos by technique (winged liner, contouring, etc.)
- **Gait & Walk Training** - Track heel-walking practice sessions, stride improvements
- **Photo Shoot Planner** - Plan outfit/makeup/location combinations, create mood boards

### Gamification & Motivation
- **Challenge Mode** - 30-day challenges (wear heels daily, perfect cat-eye, waist training consistency)
- **Achievement Badges** - Unlock achievements (100 days locked, first 0.7 WHR, 50 looks created)
- **Style Streaks** - Track consecutive days maintaining routines/goals
- **Transformation Timeline** - Auto-generate before/after collages from timeline photos

### Social Features (Optional)
- **Private Sharing** - Share specific logs/progress with trusted partners via encrypted links
- **Anonymous Community Tips** - Submit/browse tips without revealing identity
- **Virtual Wardrobe Swap** - Connect with others for clothing trades/sales

### AI-Enhanced Features
- **Smart Mirror Mode** - Use camera to virtually "try on" makeup looks or outfits from closet
- **Outfit Predictor** - AI suggests what to wear based on weather, occasion, recent compliments
- **Progress Photo Analyzer** - AI compares timeline photos to highlight visible changes
- **Shopping Assistant Evolution** - AI learns preferences and filters out items that don't match style

### Practical Tools
- **Size Conversion Chart** - Quick reference for US/EU/UK sizes across retailers
- **Color Matcher** - Take photo of item to find matching makeup/clothing colors
- **Packing List Generator** - Creates travel packing lists based on destination, duration, occasion
- **Closet Analytics** - Most worn items, cost-per-wear, color palette analysis
- **Budget Forecasting** - Project future spending based on current habits, set savings goals

### Infrastructure
- **Full Prisma sync**: Auto-sync all data types (not just items)
- **CI/CD**: GitHub Actions for lint/test/deploy
- **Image generation**: Replace placeholder with Vertex AI Imagen
- **Social sharing**: Export looks as images for Instagram/Pinterest
- **Multi-user**: User accounts and cloud sync
- **Mobile app**: React Native version

---

## 📚 Resources

- **Repository**: `c:\Users\jennifer\iCloudDrive\Documents\Projects\aura`
- **README**: Setup instructions and quick start
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **API Adapter**: `api-adapter/README.md`

---

**Last Updated**: December 5, 2025

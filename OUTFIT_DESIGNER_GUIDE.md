# Outfit Designer with Gemini AI Integration

## Overview
The **Outfit Designer** is a new AI-powered feature that helps you design outfits using Gemini AI. It analyzes your closet and generates personalized outfit suggestions based on your mood, occasion, or desired style.

## Features
✨ **Smart Outfit Generation** – Describe your vibe and get outfit recommendations from your existing wardrobe
🎨 **Style-Based Suggestions** – Ask for specific styles like "casual feminine," "business chic," "date night," etc.
🌤️ **Weather-Aware** – Considers current weather when suggesting outfits
👗 **Closet-Integrated** – Only suggests items you actually own
💬 **Conversational** – Chat naturally to refine and explore outfit options

## How to Access

### Mobile (Home Page)
1. Tap the **"Design Outfit"** button on the home page (next to "Add Item")
2. You'll be taken to the Outfit Designer chat interface

### Desktop/Full Navigation
1. Go to the **Studio** hub
2. Click **"Outfit Designer"** (the magic wand icon)
3. Start chatting with Aura

Direct URL: `http://localhost:3000/outfit-designer`

## How to Use

### Basic Usage
1. **Describe what you're looking for** – mood, occasion, or style
   - Examples:
     - "Something casual and feminine"
     - "Business meeting outfit"
     - "Date night vibes"
     - "Weekend brunch style"
     - "Rainy day cozy"
     - "High confidence look"

2. **Get outfit suggestions** – AI will suggest 4-6 items from your closet that work together

3. **Chat for refinements** – Ask follow-up questions:
   - "Can you swap the top for something lighter?"
   - "What if I add sneakers instead?"
   - "Suggest something more bold"

### Quick Prompts
Tap any of the suggested prompts to quickly design an outfit:
- "Something casual and feminine"
- "Business meeting outfit"
- "Date night vibes"
- "Weekend brunch style"
- "Rainy day cozy"
- "High confidence look"

### AI Response Format
The AI provides:
- **OUTFIT TITLE** – A catchy name for the look
- **ITEMS** – The specific items from your closet
- **REASON** – Why these pieces work together
- **OCCASION** – When/where to wear it
- **STYLING TIPS** – Quick tips for pulling it together

## Technical Details

### Architecture
- **Component** – `OutfitDesignerChat` (`src/components/OutfitDesignerChat.tsx`)
- **Page** – `src/app/outfit-designer/page.tsx`
- **API** – Uses existing `/api/gemini` endpoint
- **Models** – Gemini 2.5 Pro (text generation)
- **State** – Messages stored in component state; items pulled from `useStore`

### Data Flow
1. User types a message
2. Component extracts their clothing inventory from `useStore`
3. Builds a detailed prompt with wardrobe summary and user request
4. Sends to `/api/gemini` with `type: "text"`
5. Gemini AI generates personalized outfit suggestion
6. Response rendered in chat interface

### Wardrobe Analysis
The AI sees:
- All clothing items organized by category (top, bottom, dress, shoe, etc.)
- Item names and colors
- Current weather (if available)

### Key Configuration
- **Model** – `gemini-2.5-pro` (can fallback to `gemini-2.5-flash`)
- **Max Context** – Only passes essential item info to keep tokens low
- **Persona** – Friendly, encouraging personal stylist voice
- **Accessibility** – Shows warning if closet is empty

## Integration Points

### Home Page (`src/app/page.tsx`)
- Added "Design Outfit" button in Quick Actions
- Links directly to outfit designer
- Uses Wand2 icon from Lucide React

### Studio Hub (`src/app/studio/page.tsx`)
- Added as first destination in the grid
- Full title and description
- Wand2 icon

### Navigation (Optional Future)
Could be added to bottom navigation if desired, but currently accessed via home or studio.

## Requirements
- ✅ Closet must have at least one clothing item
- ✅ Google Gemini API key configured (via `.env.local` or server env)
- ✅ `useStore` hook with `items` access
- ✅ `useWeather` hook for weather context

## Troubleshooting

### AI Returns Generic Responses
- Make sure you have clothing items in your closet
- Try being more specific about style/occasion
- Check that Gemini API key is valid

### "I had trouble thinking of outfits"
- This is the fallback error message
- Usually means API error or empty inventory
- Check browser console for details

### Weather Not Showing
- `useWeather` hook may not have fetched yet
- AI will still work without weather data
- It's optional context

## Future Enhancements
- 📸 Image generation – Generate visual mockups of outfits
- 💾 Save outfits – Store favorites to looks
- 🔄 Remix mode – Ask AI to modify previous suggestions
- 📊 Analytics – Track which outfit types you ask for
- 🎯 Mood tracking – Remember your favorite styles
- 👥 Social – Share outfit suggestions with friends

## Examples

### Example 1: Casual Weekend
**You:** "Something casual and feminine for a lazy Saturday"

**AI Response:**
```
✨ Perfect! Here's a cozy weekend vibe for you:

OUTFIT TITLE: Soft Saturday Lounging
ITEMS: Cream cashmere sweater, Blush pleated skirt, Ivory yoga leggings, Soft pink wrap
REASON: This combo is effortlessly feminine with a relaxed feel perfect for a low-key day
OCCASION: Weekend brunch, shopping, casual hangouts
STYLING TIPS: Layer the wrap loosely, add minimal gold jewelry, go barefoot or slippers
```

### Example 2: Business Meeting
**You:** "I have a business meeting tomorrow, need something professional but still me"

**AI Response:**
```
✨ Let's make you look polished and confident!

OUTFIT TITLE: Executive Elegance
ITEMS: White puff-sleeve blouse, Tailored trousers, Blush ankle strap sandal, Rose gold bracelet
REASON: Classic professional look with soft feminine touches – polished without being boring
OCCASION: Business meetings, interviews, professional presentations
STYLING TIPS: Tuck in the blouse, add a structured bag, minimal accessories to keep focus on face
```

## File Structure
```
src/
├── components/
│   └── OutfitDesignerChat.tsx      ← Main component
├── app/
│   ├── outfit-designer/
│   │   └── page.tsx                ← Page wrapper
│   ├── studio/
│   │   └── page.tsx                ← Updated with new destination
│   └── page.tsx                    ← Updated home with quick action button
└── types/
    └── index.ts                    ← Uses existing Category, Item types
```

---

**Powered by Gemini AI** – Making outfit design fun and personalized! ✨

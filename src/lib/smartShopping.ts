/**
 * Smart Shopping Assistant Module
 * Tracks prices, sale alerts, recommendations, and prevents duplicate purchases
 */

import { cache } from './cache'

export interface PriceHistory {
  itemId: string
  retailer: string
  price: number
  date: number
  onSale?: boolean
  salePercentage?: number
}

export interface ShoppingRecommendation {
  id: string
  itemType: string
  reason: string
  estimatedPrice: number
  priority: 'high' | 'medium' | 'low'
  confidence: number // 0-100
  category: string
  suggestedRetailers: string[]
}

export interface SaleAlert {
  id: string
  itemId: string
  itemName: string
  retailer: string
  originalPrice: number
  salePrice: number
  percentOff: number
  alertDate: number
  expiryDate?: number
  url?: string
}

export interface BudgetTracker {
  month: number
  year: number
  budget: number
  spent: number
  remaining: number
  itemsAdded: Array<{ name: string; price: number; date: number }>
}

export interface PriceComparison {
  itemName: string
  retailers: Array<{
    retailer: string
    price: number
    url?: string
    inStock: boolean
  }>
  lowestPrice: number
  highestPrice: number
  priceDifference: number
}

/**
 * Track price history for an item
 */
export function recordPrice(
  itemId: string,
  retailer: string,
  price: number,
  onSale?: boolean,
  salePercentage?: number
): PriceHistory {
  return {
    itemId,
    retailer,
    price,
    date: Date.now(),
    onSale,
    salePercentage,
  }
}

/**
 * Get average price for an item across retailers
 */
export function getAveragePrice(priceHistory: PriceHistory[]): number {
  if (priceHistory.length === 0) return 0
  const sum = priceHistory.reduce((acc, p) => acc + p.price, 0)
  return Math.round((sum / priceHistory.length) * 100) / 100
}

/**
 * Detect if price has dropped significantly
 */
export function detectPriceDrop(
  priceHistory: PriceHistory[],
  dropPercentage: number = 20
): PriceHistory | null {
  if (priceHistory.length < 2) return null

  const sorted = priceHistory.sort((a, b) => b.date - a.date)
  const latestPrice = sorted[0].price
  const previousPrice = sorted[1].price

  const percentChange = ((previousPrice - latestPrice) / previousPrice) * 100

  if (percentChange >= dropPercentage) {
    return sorted[0]
  }

  return null
}

/**
 * Generate sale alert
 */
export function createSaleAlert(
  itemId: string,
  itemName: string,
  retailer: string,
  originalPrice: number,
  salePrice: number,
  expiryDate?: Date,
  url?: string
): SaleAlert {
  const percentOff = Math.round(((originalPrice - salePrice) / originalPrice) * 100)

  return {
    id: `alert_${Date.now()}`,
    itemId,
    itemName,
    retailer,
    originalPrice,
    salePrice,
    percentOff,
    alertDate: Date.now(),
    expiryDate: expiryDate?.getTime(),
    url,
  }
}

/**
 * Detect duplicate items in wishlist
 */
export function detectDuplicateInWishlist(
  itemName: string,
  wishlistItems: Array<{ name: string; id: string }>,
  similarityThreshold: number = 0.8
): Array<{ id: string; name: string; similarity: number }> {
  const duplicates: Array<{ id: string; name: string; similarity: number }> = []

  const normalized1 = itemName.toLowerCase().trim()

  wishlistItems.forEach((item) => {
    const normalized2 = item.name.toLowerCase().trim()

    // Exact match
    if (normalized1 === normalized2) {
      duplicates.push({ id: item.id, name: item.name, similarity: 1.0 })
      return
    }

    // Substring match
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      duplicates.push({ id: item.id, name: item.name, similarity: 0.9 })
      return
    }

    // Common words
    const words1 = new Set(normalized1.split(/\s+/))
    const words2 = new Set(normalized2.split(/\s+/))
    const intersection = new Set([...words1].filter((x) => words2.has(x)))
    const similarity = intersection.size / Math.max(words1.size, words2.size)

    if (similarity >= similarityThreshold) {
      duplicates.push({ id: item.id, name: item.name, similarity })
    }
  })

  return duplicates.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Track monthly budget
 */
export function createBudgetTracker(budget: number, month?: number, year?: number): BudgetTracker {
  const now = new Date()
  return {
    month: month || now.getMonth() + 1,
    year: year || now.getFullYear(),
    budget,
    spent: 0,
    remaining: budget,
    itemsAdded: [],
  }
}

/**
 * Add purchase to budget tracker
 */
export function addPurchaseToBudget(
  tracker: BudgetTracker,
  itemName: string,
  price: number
): BudgetTracker {
  tracker.spent += price
  tracker.remaining = tracker.budget - tracker.spent
  tracker.itemsAdded.push({
    name: itemName,
    price,
    date: Date.now(),
  })

  return tracker
}

/**
 * Get budget status
 */
export function getBudgetStatus(tracker: BudgetTracker): string {
  const percentUsed = Math.round((tracker.spent / tracker.budget) * 100)

  if (percentUsed >= 100) {
    return `⚠️ Over budget! Spent $${tracker.spent} of $${tracker.budget} (${percentUsed}%)`
  }
  if (percentUsed >= 90) {
    return `🔴 Nearly at budget: $${tracker.remaining} remaining`
  }
  if (percentUsed >= 50) {
    return `🟡 Half budget used: $${tracker.remaining} remaining`
  }
  return `🟢 On track: $${tracker.remaining} remaining`
}

/**
 * Predict seasonal sale calendar
 */
export function getSeasonalSaleCalendar(): Record<string, { dates: string[]; events: string[] }> {
  return {
    'January': {
      dates: ['Jan 1-31'],
      events: ['New Year Sales', 'Winter Clearance', 'Post-Holiday Markdowns'],
    },
    'February': {
      dates: ['Feb 14'],
      events: ['Valentine Day Sales'],
    },
    'March': {
      dates: ['Mar 17'],
      events: ['Spring Equinox Sales'],
    },
    'April': {
      dates: ['Apr 15-May 1'],
      events: ['Easter Sales'],
    },
    'May': {
      dates: ['May 28'],
      events: ['Memorial Day Weekend'],
    },
    'June': {
      dates: ['Jun 21'],
      events: ['Summer Solstice', 'Father Day Sales'],
    },
    'July': {
      dates: ['Jul 1-5'],
      events: ['4th of July Sales', 'Mid-Year Clearance'],
    },
    'August': {
      dates: ['Aug 1-31'],
      events: ['Back-to-School', 'End of Summer Clearance'],
    },
    'September': {
      dates: ['Sep 5'],
      events: ['Labor Day Sales'],
    },
    'October': {
      dates: ['Oct 31'],
      events: ['Halloween Sales', 'Fall Clearance'],
    },
    'November': {
      dates: ['Nov 1', 'Nov 24-28'],
      events: ['Black Friday', 'Cyber Monday'],
    },
    'December': {
      dates: ['Dec 1-25'],
      events: ['Holiday Sales', 'End of Year Clearance'],
    },
  }
}

/**
 * Recommend next purchase based on wardrobe gaps
 */
export function generateSmartRecommendations(
  categoryDistribution: Record<string, number>,
  budget: number
): ShoppingRecommendation[] {
  const recommendations: ShoppingRecommendation[] = []
  const total = Object.values(categoryDistribution).reduce((a, b) => a + b, 0)

  // Categories that should represent 15-20% of wardrobe
  const targetCategories = {
    'tops': { percentage: 25, price: 40 },
    'bottoms': { percentage: 25, price: 60 },
    'shoes': { percentage: 15, price: 80 },
    'outerwear': { percentage: 15, price: 150 },
    'accessories': { percentage: 20, price: 30 },
  }

  Object.entries(targetCategories).forEach(([category, { percentage, price }]) => {
    const currentPercentage = ((categoryDistribution[category] || 0) / total) * 100

    if (currentPercentage < percentage * 0.8) {
      recommendations.push({
        id: `rec_${category}`,
        itemType: category,
        reason: `${category} are underrepresented (${Math.round(currentPercentage)}% vs target ${percentage}%)`,
        estimatedPrice: price,
        priority: currentPercentage < percentage * 0.5 ? 'high' : 'medium',
        confidence: Math.min(100, 50 + (percentage - currentPercentage)),
        category,
        suggestedRetailers: getRetailersForCategory(category),
      })
    }
  })

  return recommendations.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Get suggested retailers by category
 */
export function getRetailersForCategory(category: string): string[] {
  const retailers: Record<string, string[]> = {
    'tops': ['H&M', 'Zara', 'Urban Outfitters', 'ASOS', 'Forever 21'],
    'bottoms': ['Gap', 'Macy', 'ASOS', 'J.Crew', 'Banana Republic'],
    'shoes': ['DSW', 'Zappos', 'ASOS', 'Foot Locker'],
    'outerwear': ['J.Crew', 'Banana Republic', 'The North Face', 'Eddie Bauer'],
    'accessories': ['Etsy', 'Amazon', 'Urban Outfitters', 'Free People'],
  }

  return retailers[category] || ['Amazon', 'Target', 'Walmart']
}

/**
 * Build shopping assistant AI prompt
 */
export function buildShoppingAssistantPrompt(
  historyItems: PriceHistory[],
  budget: number,
  recommendations: ShoppingRecommendation[],
  recentPurchases: Array<{ name: string; price: number; date: number }>
): string {
  const avgPrice = historyItems.length > 0
    ? historyItems.reduce((sum, p) => sum + p.price, 0) / historyItems.length
    : 0

  return `
You are a smart shopping assistant helping optimize wardrobe purchases within budget.

Budget Info:
- Total budget: $${budget}
- Average price paid: $${avgPrice.toFixed(2)}
- Recent purchases: ${recentPurchases.slice(0, 5).map((p) => `${p.name} ($${p.price})`).join(', ')}

Wardrobe Gaps:
${recommendations.map((r) => `- ${r.itemType} (priority: ${r.priority}, confidence: ${r.confidence}%)`).join('\n')}

Suggest 5 specific items to purchase that would:
1. Address the highest-priority gaps
2. Stay within budget
3. Mix well with existing wardrobe
4. Have good cost-per-wear potential

Format as JSON: { suggestions: [{ item: string, why: string, estimatedPrice: number, retailer: string, url?: string }] }
  `.trim()
}

export default {
  recordPrice,
  getAveragePrice,
  detectPriceDrop,
  createSaleAlert,
  detectDuplicateInWishlist,
  createBudgetTracker,
  addPurchaseToBudget,
  getBudgetStatus,
  getSeasonalSaleCalendar,
  generateSmartRecommendations,
  getRetailersForCategory,
  buildShoppingAssistantPrompt,
}

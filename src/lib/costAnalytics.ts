/**
 * Cost-Per-Wear Analytics Module
 * Calculates ROI, tracks value, identifies best investments and unused items
 */

import { Item, Look } from '@/types'

export interface CostPerWearMetric {
  itemId: string
  itemName: string
  price: number
  timesWorn: number
  costPerWear: number
  daysSincePurchase: number
  breakEvenWears: number
  trend: 'improving' | 'stable' | 'declining'
  recommendation: string
  roiPercentage: number
}

export interface CostAnalyticsSummary {
  totalWardrobeValue: number
  totalItems: number
  averageCostPerWear: number
  bestValue: CostPerWearMetric
  worstValue: CostPerWearMetric
  unused: CostPerWearMetric[]
  topInvestments: CostPerWearMetric[]
  categoryAnalysis: Record<string, CategoryCostAnalysis>
}

export interface CategoryCostAnalysis {
  category: string
  totalItems: number
  totalValue: number
  averageItemPrice: number
  averageCostPerWear: number
  roiPercentage: number
}

export interface HistoricalCostPerWear {
  date: number
  itemId: string
  costPerWear: number
  timesWorn: number
}

/**
 * Calculate cost-per-wear for a single item
 * Higher number = worse ROI, lower number = better investment
 */
export function calculateCostPerWear(
  item: Item,
  timesWorn: number,
  dateAdded: number = item.dateAdded || Date.now()
): CostPerWearMetric {
  const price = item.price || 0
  const costPerWear = timesWorn > 0 ? price / timesWorn : price
  const daysSincePurchase = Math.floor((Date.now() - dateAdded) / (1000 * 60 * 60 * 24))

  // Break-even wears: how many more wears until item is "worth" target price per wear
  const targetCostPerWear = 5 // Arbitrary "good value" threshold in dollars
  const breakEvenWears = price > targetCostPerWear ? Math.ceil(price / targetCostPerWear) : timesWorn

  // ROI percentage: negative = not yet worth investment, positive = good investment
  const roiPercentage =
    timesWorn > 0
      ? Math.round(((price - costPerWear * timesWorn) / price) * 100) * -1 + 100
      : 0

  // Trend analysis: improving if worn frequently recently
  const trend = timesWorn > daysSincePurchase / 30 ? 'improving' : timesWorn > 0 ? 'stable' : 'declining'

  let recommendation = ''
  if (costPerWear < 2) {
    recommendation = '⭐ Excellent investment! Keep wearing.'
  } else if (costPerWear < 5) {
    recommendation = '✅ Good value. Solid wardrobe staple.'
  } else if (costPerWear < 10) {
    recommendation = '⚠️ Fair investment. Try to wear more.'
  } else if (costPerWear < 20) {
    recommendation = '❌ Poor ROI. Consider wearing more or donations.'
  } else {
    recommendation = '🚨 Very underutilized. Major opportunity cost.'
  }

  return {
    itemId: item.id,
    itemName: item.name,
    price,
    timesWorn,
    costPerWear: Math.round(costPerWear * 100) / 100,
    daysSincePurchase,
    breakEvenWears,
    trend,
    recommendation,
    roiPercentage,
  }
}

/**
 * Count how many times an item appears across all looks
 */
export function countItemWears(itemId: string, looks: Look[]): number {
  return looks.reduce((count, look) => {
    return count + (look.items?.includes(itemId) ? 1 : 0)
  }, 0)
}

/**
 * Generate comprehensive cost analytics for entire wardrobe
 */
export function generateCostAnalytics(
  items: Item[],
  looks: Look[]
): CostAnalyticsSummary {
  // Calculate metrics for each item
  const metrics = items
    .map((item) => {
      const wears = countItemWears(item.id, looks)
      return calculateCostPerWear(item, wears, item.dateAdded || Date.now())
    })
    .sort((a, b) => a.costPerWear - b.costPerWear)

  // Calculate totals
  const totalWardrobeValue = items.reduce((sum, item) => sum + (item.price || 0), 0)
  const totalWears = metrics.reduce((sum, m) => sum + m.timesWorn, 0)
  const averageCostPerWear = totalWears > 0 ? totalWardrobeValue / totalWears : 0

  // Category analysis
  const categoryAnalysis: Record<string, CategoryCostAnalysis> = {}
  items.forEach((item) => {
    const cat = item.category || 'uncategorized'
    if (!categoryAnalysis[cat]) {
      categoryAnalysis[cat] = {
        category: cat,
        totalItems: 0,
        totalValue: 0,
        averageItemPrice: 0,
        averageCostPerWear: 0,
        roiPercentage: 0,
      }
    }
    categoryAnalysis[cat].totalItems++
    categoryAnalysis[cat].totalValue += item.price || 0
  })

  Object.keys(categoryAnalysis).forEach((cat) => {
    const analysis = categoryAnalysis[cat]
    analysis.averageItemPrice = analysis.totalValue / analysis.totalItems
    const catMetrics = metrics.filter((m) => items.find((i) => i.id === m.itemId)?.category === cat)
    analysis.averageCostPerWear =
      catMetrics.length > 0
        ? catMetrics.reduce((sum, m) => sum + m.costPerWear, 0) / catMetrics.length
        : 0
  })

  return {
    totalWardrobeValue,
    totalItems: items.length,
    averageCostPerWear: Math.round(averageCostPerWear * 100) / 100,
    bestValue: metrics[0],
    worstValue: metrics[metrics.length - 1],
    unused: metrics.filter((m) => m.timesWorn === 0).slice(0, 10),
    topInvestments: metrics.slice(0, 10),
    categoryAnalysis,
  }
}

/**
 * Get items that haven't been worn in X days
 */
export function getUnderUtilizedItems(
  items: Item[],
  looks: Look[],
  dayThreshold: number = 90
): CostPerWearMetric[] {
  const now = Date.now()
  const thresholdMs = dayThreshold * 24 * 60 * 60 * 1000

  return items
    .map((item) => {
      const wears = countItemWears(item.id, looks)
      return calculateCostPerWear(item, wears, item.dateAdded || Date.now())
    })
    .filter((metric) => {
      const lastWornDate = metric.daysSincePurchase
      return lastWornDate > dayThreshold && metric.timesWorn < 3
    })
    .sort((a, b) => b.price - a.price)
}

/**
 * Track cost-per-wear over time for trend analysis
 */
export function generateTrendData(
  items: Item[],
  looks: Look[],
  numberOfPoints: number = 12
): HistoricalCostPerWear[] {
  const now = Date.now()
  const periodMs = (30 * 24 * 60 * 60 * 1000) // Monthly snapshots
  const trendData: HistoricalCostPerWear[] = []

  for (let i = numberOfPoints - 1; i >= 0; i--) {
    const snapshotDate = now - i * periodMs

    items.forEach((item) => {
      // Simulate historical wears (simplified)
      const wears = countItemWears(item.id, looks)
      const cpw = calculateCostPerWear(item, wears, item.dateAdded || Date.now())

      trendData.push({
        date: snapshotDate,
        itemId: item.id,
        costPerWear: cpw.costPerWear,
        timesWorn: cpw.timesWorn,
      })
    })
  }

  return trendData
}

/**
 * Identify wardrobe gaps using cost analysis
 * Items that would have highest ROI if purchased
 */
export function identifyHighROIGaps(items: Item[], looks: Look[]): string[] {
  const analytics = generateCostAnalytics(items, looks)
  const recommendations: string[] = []

  // Find categories with highest average cost-per-wear
  const expensiveCategories = Object.values(analytics.categoryAnalysis)
    .sort((a, b) => b.averageCostPerWear - a.averageCostPerWear)
    .slice(0, 3)

  expensiveCategories.forEach((cat) => {
    recommendations.push(
      `Category "${cat.category}" has avg cost-per-wear of $${cat.averageCostPerWear.toFixed(2)}. ` +
      `Consider adding versatile neutral pieces to improve ROI.`
    )
  })

  // Flag underutilized colors
  const colorMap: Record<string, { count: number; totalPrice: number }> = {}
  items.forEach((item) => {
    const color = item.color || 'unknown'
    if (!colorMap[color]) colorMap[color] = { count: 0, totalPrice: 0 }
    colorMap[color].count++
    colorMap[color].totalPrice += item.price || 0
  })

  Object.entries(colorMap)
    .filter(([, data]) => data.count > 0)
    .forEach(([color, data]) => {
      const avgPrice = data.totalPrice / data.count
      const wears = items
        .filter((i) => i.color === color)
        .reduce((sum, i) => sum + countItemWears(i.id, looks), 0)
      const cpw = avgPrice > 0 ? data.totalPrice / (wears || 1) : avgPrice

      if (cpw > 15) {
        recommendations.push(
          `${color} items underperform (cost-per-wear: $${cpw.toFixed(2)}). ` +
          `Add more versatile ${color} basics to balance.`
        )
      }
    })

  return recommendations
}

/**
 * Generate AI prompt for shopping recommendations based on cost analysis
 */
export function buildCostAnalysisPrompt(
  items: Item[],
  looks: Look[],
  budget: number = 100
): string {
  const analytics = generateCostAnalytics(items, looks)
  const gaps = identifyHighROIGaps(items, looks)

  return `
You are a personal style consultant analyzing a wardrobe for cost-efficiency.

Current Wardrobe Stats:
- Total items: ${analytics.totalItems}
- Total value: $${analytics.totalWardrobeValue}
- Average cost-per-wear: $${analytics.averageCostPerWear}
- Best performing item: ${analytics.bestValue.itemName} ($${analytics.bestValue.costPerWear}/wear)
- Worst performing item: ${analytics.worstValue.itemName} ($${analytics.worstValue.costPerWear}/wear)

Top Underutilized Items:
${analytics.unused.slice(0, 5).map((m) => `- ${m.itemName} ($${m.price}, worn ${m.timesWorn} times)`).join('\n')}

Analysis Gaps:
${gaps.join('\n')}

Given a budget of $${budget}, recommend 3-5 specific types of items to purchase that would:
1. Maximize cost-per-wear improvement
2. Complement existing high-ROI items
3. Help underutilized items get worn more
4. Address wardrobe gaps

Format as JSON: { recommendations: [{ item: string, reason: string, estimatedWears: number, expectedCPW: number }] }
  `.trim()
}

export default {
  calculateCostPerWear,
  countItemWears,
  generateCostAnalytics,
  getUnderUtilizedItems,
  generateTrendData,
  identifyHighROIGaps,
  buildCostAnalysisPrompt,
}

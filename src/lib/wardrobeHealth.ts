/**
 * Wardrobe Health Dashboard Module
 * Analyzes wardrobe strengths, gaps, and provides holistic health metrics
 */

import { Item, Look } from '@/types'

export interface GapAnalysis {
  category: string
  essentialItem: string
  owned: boolean
  priority: 'high' | 'medium' | 'low'
  reason: string
}

export interface ColorBalance {
  color: string
  count: number
  percentage: number
  recommendation: 'increase' | 'balance' | 'good'
}

export interface StyleCoherence {
  score: number // 0-100
  outfitSuccessRate: number // % of looks with 4+ items
  mixAndMatchScore: number // How well items combine
  occasionCoverage: Record<string, number> // % coverage per occasion
}

export interface WardrobeHealthMetrics {
  overallHealthScore: number // 0-100
  gapAnalysis: GapAnalysis[]
  colorBalance: ColorBalance[]
  styleCoherence: StyleCoherence
  seasonalReadiness: Record<string, number> // % ready for each season
  occasionReadiness: Record<string, number> // % ready for each occasion
  underutilizedItems: Array<{ name: string; category: string; wearCount: number }>
  duplicateDetections: Array<{ item1: string; item2: string; similarity: number }>
  recommendations: string[]
}

export interface OccasionCoverage {
  occasion: 'casual' | 'business' | 'formal' | 'athletic' | 'sleepwear' | 'evening'
  requiredCategories: string[]
  owned: number
  missing: string[]
  readinessPercentage: number
}

/**
 * Essentials checklist - items every wardrobe should have
 */
const WARDROBE_ESSENTIALS: Array<{ item: string; category: string; priority: 'high' | 'medium' | 'low' }> = [
  { item: 'White T-shirt', category: 'top', priority: 'high' },
  { item: 'Black T-shirt', category: 'top', priority: 'high' },
  { item: 'White Button-up', category: 'top', priority: 'high' },
  { item: 'Black Blazer', category: 'outerwear', priority: 'high' },
  { item: 'Dark Jeans', category: 'bottom', priority: 'high' },
  { item: 'Black Pants', category: 'bottom', priority: 'high' },
  { item: 'Black Heels', category: 'shoe', priority: 'medium' },
  { item: 'White Sneakers', category: 'shoe', priority: 'medium' },
  { item: 'Black Flats', category: 'shoe', priority: 'medium' },
  { item: 'Red Lipstick', category: 'makeup', priority: 'low' },
  { item: 'Neutral Cardigan', category: 'outerwear', priority: 'medium' },
  { item: 'White Blouse', category: 'top', priority: 'medium' },
]

/**
 * Perform gap analysis against essentials
 */
export function analyzeWardrobeGaps(items: Item[]): GapAnalysis[] {
  const gaps: GapAnalysis[] = []
  const itemNames = items.map((i) => i.name.toLowerCase())

  WARDROBE_ESSENTIALS.forEach((essential) => {
    const owned = itemNames.some((name) =>
      name.includes(essential.item.toLowerCase().split(' ')[0])
    )

    if (!owned) {
      gaps.push({
        category: essential.category,
        essentialItem: essential.item,
        owned: false,
        priority: essential.priority,
        reason: `Missing versatile ${essential.item} for better outfit combinations`,
      })
    }
  })

  return gaps
}

/**
 * Analyze color distribution and balance
 */
export function analyzeColorBalance(items: Item[]): ColorBalance[] {
  const colorMap: Record<string, number> = {}

  items.forEach((item) => {
    const color = item.color || 'neutral'
    colorMap[color] = (colorMap[color] || 0) + 1
  })

  const total = items.length
  const balances = Object.entries(colorMap).map(([color, count]) => ({
    color,
    count,
    percentage: Math.round((count / total) * 100),
    recommendation:
      count / total > 0.25
        ? ('balance' as const)
        : count / total < 0.1
          ? ('increase' as const)
          : ('good' as const),
  }))

  return balances.sort((a, b) => b.count - a.count)
}

/**
 * Calculate style coherence score
 */
export function calculateStyleCoherence(items: Item[], looks: Look[]): StyleCoherence {
  const totalLooks = looks.length
  const successfulLooks = looks.filter((l) => (l.items?.length || 0) >= 4).length
  const outfitSuccessRate = totalLooks > 0 ? (successfulLooks / totalLooks) * 100 : 0

  // Mix-and-match score based on color combinations
  const colors = [...new Set(items.map((i) => i.color || 'neutral'))]
  const categories = [...new Set(items.map((i) => i.category || 'other'))]

  const potentialCombos = colors.length * categories.length
  const actualCombos = new Set(
    looks.flatMap((l) =>
      (l.items || [])
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean)
        .map((i) => `${i?.color}-${i?.category}`)
    )
  ).size

  const mixAndMatchScore = potentialCombos > 0 ? (actualCombos / potentialCombos) * 100 : 0

  // Occasion coverage
  const occasionCoverage: Record<string, number> = {
    'casual': 0,
    'business': 0,
    'formal': 0,
    'athletic': 0,
    'sleepwear': 0,
  }

  // Estimate based on categories
  const categoryOccasions: Record<string, string[]> = {
    'top': ['casual', 'business', 'formal'],
    'bottom': ['casual', 'business', 'formal'],
    'dress': ['casual', 'formal', 'business'],
    'shoe': ['casual', 'business', 'formal'],
    'outerwear': ['casual', 'business', 'formal'],
    'athletic': ['athletic'],
    'sleepwear': ['sleepwear'],
  }

  items.forEach((item) => {
    const occasions = categoryOccasions[item.category || 'top'] || ['casual']
    occasions.forEach((occ) => {
      occasionCoverage[occ]++
    })
  })

  // Normalize to percentages
  const maxItemsPerOccasion = Math.max(...Object.values(occasionCoverage), 1)
  Object.keys(occasionCoverage).forEach((key) => {
    occasionCoverage[key] = Math.round((occasionCoverage[key] / maxItemsPerOccasion) * 100)
  })

  return {
    score: Math.round((outfitSuccessRate * 0.4 + mixAndMatchScore * 0.6) / 100 * 100),
    outfitSuccessRate: Math.round(outfitSuccessRate),
    mixAndMatchScore: Math.round(mixAndMatchScore),
    occasionCoverage,
  }
}

/**
 * Assess seasonal readiness
 */
export function assessSeasonalReadiness(items: Item[]): Record<string, number> {
  const now = new Date()
  const month = now.getMonth()

  // Seasonal mapping
  let season = 'spring'
  if (month >= 2 && month <= 4) season = 'spring'
  else if (month >= 5 && month <= 7) season = 'summer'
  else if (month >= 8 && month <= 10) season = 'fall'
  else season = 'winter'

  const seasonalRequirements: Record<string, string[]> = {
    'winter': ['outerwear', 'long sleeves', 'boots'],
    'spring': ['light layers', 'sneakers', 'flowy items'],
    'summer': ['shorts', 'sleeveless', 'sandals'],
    'fall': ['sweaters', 'layers', 'long pants'],
  }

  // Count items for each season
  const readiness: Record<string, number> = {
    'winter': 0,
    'spring': 0,
    'summer': 0,
    'fall': 0,
  }

  Object.entries(seasonalRequirements).forEach(([season, requirements]) => {
    let score = 0
    requirements.forEach((req) => {
      const matches = items.filter((i) =>
        i.category?.toLowerCase().includes(req.toLowerCase()) ||
        i.type?.toLowerCase().includes(req.toLowerCase())
      ).length
      score += Math.min(matches / 2, 50) // Cap at 50 per requirement
    })
    readiness[season] = Math.min(100, Math.round(score))
  })

  return readiness
}

/**
 * Assess occasion-specific readiness
 */
export function assessOccasionReadiness(items: Item[]): Record<string, number> {
  const occasions: Record<string, string[]> = {
    'casual': ['tee', 'jeans', 'sneaker', 'hoodie'],
    'business': ['blazer', 'button', 'heels', 'pants'],
    'formal': ['dress', 'heels', 'blazer', 'suit'],
    'athletic': ['activewear', 'sneaker', 'legging', 'sports'],
    'sleepwear': ['pajama', 'loungewear', 'robe'],
  }

  const readiness: Record<string, number> = {}

  Object.entries(occasions).forEach(([occasion, keywords]) => {
    let score = 0
    keywords.forEach((keyword) => {
      const matches = items.filter(
        (i) =>
          i.name.toLowerCase().includes(keyword) ||
          i.category?.toLowerCase().includes(keyword) ||
          i.type?.toLowerCase().includes(keyword)
      ).length
      score += Math.min(matches, 1) * 25 // Each keyword up to 25 points
    })
    readiness[occasion] = Math.round(score)
  })

  return readiness
}

/**
 * Detect duplicate or similar items
 */
export function detectDuplicates(items: Item[]): Array<{ item1: string; item2: string; similarity: number }> {
  const duplicates: Array<{ item1: string; item2: string; similarity: number }> = []

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i]
      const item2 = items[j]

      // Skip if different categories
      if (item1.category !== item2.category) continue

      let similarity = 0

      // Name similarity
      const name1 = item1.name.toLowerCase()
      const name2 = item2.name.toLowerCase()
      const commonWords = name1.split(' ').filter((w) => name2.includes(w)).length
      similarity += (commonWords / Math.max(name1.split(' ').length, 1)) * 40

      // Color match
      if (item1.color && item2.color && item1.color.toLowerCase() === item2.color.toLowerCase()) {
        similarity += 30
      }

      // Type match
      if (item1.type && item2.type && item1.type === item2.type) {
        similarity += 20
      }

      if (similarity > 50) {
        duplicates.push({
          item1: item1.name,
          item2: item2.name,
          similarity: Math.round(similarity),
        })
      }
    }
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Find underutilized items
 */
export function findUnderutilizedItems(items: Item[], looks: Look[]): Array<{ name: string; category: string; wearCount: number }> {
  return items
    .map((item) => ({
      name: item.name,
      category: item.category || 'uncategorized',
      wearCount: looks.filter((l) => l.items?.includes(item.id)).length,
    }))
    .filter((i) => i.wearCount < 2)
    .sort((a, b) => a.wearCount - b.wearCount)
    .slice(0, 10)
}

/**
 * Generate recommendations based on health analysis
 */
export function generateWardrobeRecommendations(
  gaps: GapAnalysis[],
  duplicates: Array<{ item1: string; item2: string; similarity: number }>,
  underutilized: Array<{ name: string; category: string; wearCount: number }>,
  coherence: StyleCoherence
): string[] {
  const recommendations: string[] = []

  // Gap recommendations
  const highPriorityGaps = gaps.filter((g) => g.priority === 'high')
  if (highPriorityGaps.length > 0) {
    recommendations.push(
      `Priority: Add ${highPriorityGaps.map((g) => g.essentialItem).join(', ')} ` +
      `to improve outfit versatility.`
    )
  }

  // Duplicate recommendations
  if (duplicates.length > 0) {
    recommendations.push(
      `Consider decluttering: You have ${duplicates.length} near-duplicate items. ` +
      `Donate similar pieces to simplify choices.`
    )
  }

  // Underutilized recommendations
  if (underutilized.length > 0) {
    recommendations.push(
      `Challenge: Wear ${underutilized.slice(0, 3).map((u) => u.name).join(', ')} ` +
      `more this month. They're great pieces stuck in the closet!`
    )
  }

  // Style coherence recommendations
  if (coherence.score < 50) {
    recommendations.push(
      `Improve mix-and-match: Current coherence score is ${coherence.score}/100. ` +
      `Add neutral basics that pair with multiple pieces.`
    )
  }

  if (coherence.outfitSuccessRate < 60) {
    recommendations.push(
      `Build complete looks: Only ${coherence.outfitSuccessRate}% of outfits have 4+ items. ` +
      `Focus on adding versatile basics.`
    )
  }

  return recommendations
}

/**
 * Generate comprehensive wardrobe health report
 */
export function generateWardrobeHealthReport(
  items: Item[],
  looks: Look[]
): WardrobeHealthMetrics {
  const gaps = analyzeWardrobeGaps(items)
  const colors = analyzeColorBalance(items)
  const coherence = calculateStyleCoherence(items, looks)
  const seasonal = assessSeasonalReadiness(items)
  const occasions = assessOccasionReadiness(items)
  const duplicates = detectDuplicates(items)
  const underutilized = findUnderutilizedItems(items, looks)
  const recommendations = generateWardrobeRecommendations(
    gaps,
    duplicates,
    underutilized,
    coherence
  )

  // Calculate overall health score
  const healthFactors = {
    gapCoverage: (1 - gaps.length / 12) * 100,
    colorBalance: colors.some((c) => c.recommendation === 'good') ? 80 : 60,
    styleCoherence: coherence.score,
    seasonalReadiness: Object.values(seasonal).reduce((a, b) => a + b) / 4,
    occasionReadiness: Object.values(occasions).reduce((a, b) => a + b) / 5,
    duplicateScore: (1 - Math.min(duplicates.length / 5, 1)) * 100,
  }

  const overallHealthScore = Math.round(
    Object.values(healthFactors).reduce((a, b) => a + b) / Object.keys(healthFactors).length
  )

  return {
    overallHealthScore,
    gapAnalysis: gaps,
    colorBalance: colors,
    styleCoherence: coherence,
    seasonalReadiness: seasonal,
    occasionReadiness: occasions,
    underutilizedItems: underutilized,
    duplicateDetections: duplicates,
    recommendations,
  }
}

export default {
  analyzeWardrobeGaps,
  analyzeColorBalance,
  calculateStyleCoherence,
  assessSeasonalReadiness,
  assessOccasionReadiness,
  detectDuplicates,
  findUnderutilizedItems,
  generateWardrobeRecommendations,
  generateWardrobeHealthReport,
}

/**
 * Item Condition Tracker Module
 * Tracks garment health, wear patterns, maintenance, and condition history
 */

import { Item } from '@/types'

export type ConditionRating = 1 | 2 | 3 | 4 | 5

export interface DamageLog {
  id: string
  date: number
  type: 'stain' | 'tear' | 'stretch' | 'fade' | 'pill' | 'burn' | 'odor' | 'other'
  severity: 'minor' | 'moderate' | 'severe'
  description: string
  repaired?: boolean
  repairDate?: number
}

export interface MaintenanceLog {
  id: string
  date: number
  type: 'clean' | 'repair' | 'alteration' | 'storage' | 'refresh'
  details: string
  cost?: number
  provider?: string
}

export interface ItemConditionMetadata {
  condition: ConditionRating // 1-5 scale
  lastWornDate?: number
  wearPattern: 'frequent' | 'regular' | 'occasional' | 'rare'
  damageHistory: DamageLog[]
  maintenanceHistory: MaintenanceLog[]
  estimatedLifespan?: number // Days remaining
  careTips?: string
  nextMaintenanceDue?: number
}

export interface ConditionAlert {
  itemId: string
  itemName: string
  severity: 'warning' | 'critical'
  message: string
  recommendation: string
}

export interface ConditionReport {
  totalItems: number
  excellentCondition: number // 5 stars
  goodCondition: number // 4 stars
  fairCondition: number // 3 stars
  poorCondition: number // 2 stars
  needsAttention: number // 1 star
  itemsNeedingMaintenance: ConditionAlert[]
  averageConditionScore: number
}

/**
 * Estimate item lifespan in days based on category and wear pattern
 */
export function estimateItemLifespan(
  category: string,
  wearPattern: 'frequent' | 'regular' | 'occasional' | 'rare'
): number {
  const baseLifespans: Record<string, number> = {
    'dress': 1095, // 3 years
    'top': 730, // 2 years
    'bottom': 912, // 2.5 years
    'shoe': 548, // 1.5 years
    'outerwear': 1460, // 4 years
    'accessory': 1825, // 5 years
    'intimates': 365, // 1 year
  }

  const baseLifespan = baseLifespans[category] || 730

  const wearMultiplier: Record<string, number> = {
    'frequent': 0.5, // Worn out faster
    'regular': 0.75,
    'occasional': 1.0,
    'rare': 1.5, // Lasts longer
  }

  return Math.round(baseLifespan * (wearMultiplier[wearPattern] || 1.0))
}

/**
 * Calculate condition score after damage
 */
export function calculateConditionAfterDamage(
  currentCondition: ConditionRating,
  damage: DamageLog
): ConditionRating {
  const impactMap: Record<string, Record<string, number>> = {
    'minor': { 'stain': 0.3, 'fade': 0.2, 'pill': 0.1, 'odor': 0.2, 'other': 0.15 },
    'moderate': { 'tear': 0.8, 'stretch': 0.6, 'burn': 0.7, 'other': 0.5 },
    'severe': { 'tear': 1.5, 'stretch': 1.2, 'burn': 1.8, 'other': 1.0 },
  }

  const impact = impactMap[damage.severity]?.[damage.type] || 0.5
  const newCondition = Math.max(1, currentCondition - impact) as ConditionRating

  return Math.round(newCondition) as ConditionRating
}

/**
 * Determine wear pattern from historical usage
 */
export function analyzeWearPattern(
  dateAdded: number,
  lastWornDate: number,
  totalWears: number
): 'frequent' | 'regular' | 'occasional' | 'rare' {
  const daysSincePurchase = Math.floor((Date.now() - dateAdded) / (1000 * 60 * 60 * 24))
  const daysUnworn = Math.floor((Date.now() - (lastWornDate || dateAdded)) / (1000 * 60 * 60 * 24))

  if (daysUnworn > daysSincePurchase * 0.8) return 'rare'
  
  const wearFrequency = totalWears / Math.max(1, daysSincePurchase / 30)

  if (wearFrequency > 4) return 'frequent'
  if (wearFrequency > 2) return 'regular'
  if (wearFrequency > 0.5) return 'occasional'
  return 'rare'
}

/**
 * Generate condition assessment text
 */
export function getConditionDescription(rating: ConditionRating): string {
  const descriptions: Record<ConditionRating, string> = {
    5: 'Like new - No visible wear',
    4: 'Excellent - Minimal wear',
    3: 'Good - Normal wear for age',
    2: 'Fair - Noticeable wear, still wearable',
    1: 'Poor - Significant wear, needs repair/donation',
  }
  return descriptions[rating]
}

/**
 * Create damage log entry
 */
export function logDamage(
  type: DamageLog['type'],
  severity: DamageLog['severity'],
  description: string
): DamageLog {
  return {
    id: `damage-${Date.now()}`,
    date: Date.now(),
    type,
    severity,
    description,
  }
}

/**
 * Create maintenance log entry
 */
export function logMaintenance(
  type: MaintenanceLog['type'],
  details: string,
  cost?: number,
  provider?: string
): MaintenanceLog {
  return {
    id: `maintenance-${Date.now()}`,
    date: Date.now(),
    type,
    details,
    cost,
    provider,
  }
}

/**
 * Generate condition alerts for items needing attention
 */
export function generateConditionAlerts(
  items: Array<Item & { metadata?: ItemConditionMetadata }>
): ConditionAlert[] {
  const alerts: ConditionAlert[] = []

  items.forEach((item) => {
    const meta = item.metadata
    if (!meta) return

    // Check for poor condition
    if (meta.condition <= 2) {
      alerts.push({
        itemId: item.id,
        itemName: item.name,
        severity: meta.condition === 1 ? 'critical' : 'warning',
        message: `Item in ${getConditionDescription(meta.condition)} condition`,
        recommendation:
          meta.condition === 1
            ? 'Consider donation or disposal. Repair may not be cost-effective.'
            : 'Consider professional cleaning or minor repairs to extend life.',
      })
    }

    // Check for pending maintenance
    if (meta.nextMaintenanceDue && meta.nextMaintenanceDue < Date.now()) {
      const daysOverdue = Math.floor(
        (Date.now() - meta.nextMaintenanceDue) / (1000 * 60 * 60 * 24)
      )
      alerts.push({
        itemId: item.id,
        itemName: item.name,
        severity: daysOverdue > 30 ? 'critical' : 'warning',
        message: `Scheduled maintenance overdue by ${daysOverdue} days`,
        recommendation: 'Schedule cleaning or servicing soon to maintain condition.',
      })
    }

    // Check for damage needing repair
    const unrepairedDamage = meta.damageHistory.filter((d) => !d.repaired)
    if (unrepairedDamage.some((d) => d.severity === 'severe')) {
      alerts.push({
        itemId: item.id,
        itemName: item.name,
        severity: 'critical',
        message: `Severe damage needs repair: ${unrepairedDamage[0].description}`,
        recommendation: 'Schedule professional repair to prevent further deterioration.',
      })
    }
  })

  return alerts.sort((a, b) => (b.severity === 'critical' ? 1 : -1))
}

/**
 * Generate comprehensive condition report
 */
export function generateConditionReport(
  items: Array<Item & { metadata?: ItemConditionMetadata }>
): ConditionReport {
  const conditionCounts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  }

  let totalConditionScore = 0

  items.forEach((item) => {
    const condition = item.metadata?.condition || 3
    conditionCounts[condition as ConditionRating]++
    totalConditionScore += condition
  })

  const alerts = generateConditionAlerts(items)

  return {
    totalItems: items.length,
    excellentCondition: conditionCounts[5],
    goodCondition: conditionCounts[4],
    fairCondition: conditionCounts[3],
    poorCondition: conditionCounts[2],
    needsAttention: conditionCounts[1],
    itemsNeedingMaintenance: alerts,
    averageConditionScore: items.length > 0 ? totalConditionScore / items.length : 0,
  }
}

/**
 * Recommend maintenance schedule
 */
export function recommendMaintenanceSchedule(
  condition: ConditionRating,
  wearPattern: 'frequent' | 'regular' | 'occasional' | 'rare'
): number {
  // Return days until next maintenance needed
  const baseIntervals: Record<string, number> = {
    'frequent': 30, // Monthly
    'regular': 60, // Bi-monthly
    'occasional': 90, // Quarterly
    'rare': 180, // Bi-annually
  }

  const interval = baseIntervals[wearPattern]
  // More frequent maintenance if condition declining
  const conditionMultiplier = {
    5: 1.5,
    4: 1.2,
    3: 1.0,
    2: 0.7,
    1: 0.3,
  }

  return Math.round(interval * conditionMultiplier[condition])
}

/**
 * Get care instructions based on damage history
 */
export function generateCareTips(
  category: string,
  damageHistory: DamageLog[]
): string[] {
  const tips: string[] = []

  // Category-specific care
  const categoryTips: Record<string, string[]> = {
    'delicate': [
      'Hand wash in cold water only',
      'Use mesh laundry bag for protection',
      'Hang dry away from direct sunlight',
      'Store flat or on padded hangers',
    ],
    'wool': [
      'Dry clean or hand wash with woolite',
      'Air dry flat on towel',
      'Store in cedar blocks to prevent moths',
      'Brush gently to remove pills',
    ],
    'silk': [
      'Hand wash or dry clean',
      'Use silk-specific detergent',
      'Avoid chlorine and harsh chemicals',
      'Iron on low heat or dry clean',
    ],
    'shoes': [
      'Clean after each wear',
      'Use shoe trees to maintain shape',
      'Store in dust bags',
      'Use leather conditioner quarterly',
    ],
  }

  const baseTips = categoryTips[category] || [
    'Wash in cold water',
    'Air dry when possible',
    'Store in cool, dry place',
  ]

  tips.push(...baseTips)

  // Damage-specific prevention
  if (damageHistory.some((d) => d.type === 'stain')) {
    tips.push('Treat stains immediately to prevent setting')
  }
  if (damageHistory.some((d) => d.type === 'pill')) {
    tips.push('Use garment shaver or lint roller gently')
  }
  if (damageHistory.some((d) => d.type === 'fade')) {
    tips.push('Minimize sun exposure and wash in cool water')
  }
  if (damageHistory.some((d) => d.type === 'stretch')) {
    tips.push('Support garment weight on hangers, fold delicates')
  }

  return tips
}

export default {
  estimateItemLifespan,
  calculateConditionAfterDamage,
  analyzeWearPattern,
  getConditionDescription,
  logDamage,
  logMaintenance,
  generateConditionAlerts,
  generateConditionReport,
  recommendMaintenanceSchedule,
  generateCareTips,
}

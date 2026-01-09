/**
 * Social Outfit Sharing Module
 * Enables sharing looks, ratings, comments, and community features
 */

import { Look } from '@/types'

export interface OutfitRating {
  id: string
  lookId: string
  raterName: string // Can be anonymous or username
  score: 1 | 2 | 3 | 4 | 5
  comment?: string
  date: number
}

export interface OutfitComment {
  id: string
  lookId: string
  authorName: string
  content: string
  date: number
  edited?: boolean
  editedDate?: number
}

export interface SharedLook {
  lookId: string
  shareToken: string
  sharedBy: string
  sharedDate: number
  visibility: 'public' | 'private' | 'friends-only'
  title: string
  description?: string
  ratings: OutfitRating[]
  comments: OutfitComment[]
  views: number
  shares: number
}

export interface StyleProfile {
  userId: string
  username: string
  bio?: string
  avatar?: string
  colorSeason?: string
  sharedLooksCount: number
  averageRating: number
  followers: number
  following: number
}

export interface FriendConnection {
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
  connectedDate: number
}

export interface CommunityTrend {
  trendId: string
  name: string
  description: string
  lookIds: string[]
  participantCount: number
  createdDate: number
  endDate?: number
  tags: string[]
}

export interface EmbedCode {
  lookId: string
  code: string
  widgetUrl: string
  previewUrl: string
}

/**
 * Generate unique share token for a look
 */
export function generateShareToken(): string {
  return `look_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Create a shareable look
 */
export function createSharedLook(
  look: Look,
  sharedBy: string,
  title: string,
  description?: string,
  visibility: 'public' | 'private' | 'friends-only' = 'public'
): SharedLook {
  return {
    lookId: look.id,
    shareToken: generateShareToken(),
    sharedBy,
    sharedDate: Date.now(),
    visibility,
    title,
    description,
    ratings: [],
    comments: [],
    views: 0,
    shares: 0,
  }
}

/**
 * Generate shareable link for a look
 */
export function generateShareLink(token: string, baseUrl: string = 'https://aura.app'): string {
  return `${baseUrl}/shared-look/${token}`
}

/**
 * Generate embed code for a look
 */
export function generateEmbedCode(token: string, baseUrl: string = 'https://aura.app'): EmbedCode {
  const widgetUrl = `${baseUrl}/embed/look/${token}`
  const code = `<iframe src="${widgetUrl}" width="400" height="500" frameborder="0" allow="autoplay; clipboard-write; encrypted-media"></iframe>`
  const previewUrl = `${baseUrl}/embed/preview/${token}`

  return {
    lookId: token,
    code,
    widgetUrl,
    previewUrl,
  }
}

/**
 * Add a rating to a shared look
 */
export function rateOutfit(
  sharedLook: SharedLook,
  raterName: string,
  score: 1 | 2 | 3 | 4 | 5,
  comment?: string
): SharedLook {
  const rating: OutfitRating = {
    id: `rating_${Date.now()}`,
    lookId: sharedLook.lookId,
    raterName,
    score,
    comment,
    date: Date.now(),
  }

  sharedLook.ratings.push(rating)
  return sharedLook
}

/**
 * Add a comment to a shared look
 */
export function commentOnOutfit(
  sharedLook: SharedLook,
  authorName: string,
  content: string
): SharedLook {
  const comment: OutfitComment = {
    id: `comment_${Date.now()}`,
    lookId: sharedLook.lookId,
    authorName,
    content,
    date: Date.now(),
  }

  sharedLook.comments.push(comment)
  return sharedLook
}

/**
 * Calculate average rating for a look
 */
export function calculateAverageRating(sharedLook: SharedLook): number {
  if (sharedLook.ratings.length === 0) return 0
  const sum = sharedLook.ratings.reduce((acc, r) => acc + r.score, 0)
  return Math.round((sum / sharedLook.ratings.length) * 10) / 10
}

/**
 * Track look view
 */
export function recordView(sharedLook: SharedLook): SharedLook {
  sharedLook.views++
  return sharedLook
}

/**
 * Track look share
 */
export function recordShare(sharedLook: SharedLook): SharedLook {
  sharedLook.shares++
  return sharedLook
}

/**
 * Get trending looks based on ratings and views
 */
export function getTrendingLooks(
  looks: SharedLook[],
  limit: number = 10,
  timeWindowDays: number = 7
): SharedLook[] {
  const now = Date.now()
  const timeWindow = timeWindowDays * 24 * 60 * 60 * 1000

  return looks
    .filter((l) => now - l.sharedDate < timeWindow && l.visibility === 'public')
    .map((l) => ({
      ...l,
      trendScore:
        calculateAverageRating(l) * 2 + l.views * 0.1 + l.shares * 0.5 + l.comments.length * 0.8,
    }))
    .sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0))
    .slice(0, limit)
}

/**
 * Filter looks by tag
 */
export function filterLooksByTag(looks: SharedLook[], tag: string): SharedLook[] {
  return looks.filter(
    (l) =>
      l.title.toLowerCase().includes(tag.toLowerCase()) ||
      l.description?.toLowerCase().includes(tag.toLowerCase())
  )
}

/**
 * Find similar looks based on style
 */
export function findSimilarLooks(
  targetLook: SharedLook,
  allLooks: SharedLook[],
  limit: number = 5
): SharedLook[] {
  // Simple similarity based on title/description keywords
  const targetWords = new Set(
    (targetLook.title + ' ' + (targetLook.description || ''))
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  )

  return allLooks
    .filter((l) => l.lookId !== targetLook.lookId)
    .map((l) => {
      const lookWords = new Set(
        (l.title + ' ' + (l.description || ''))
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3)
      )

      const intersection = new Set([...targetWords].filter((x) => lookWords.has(x)))
      const similarity = intersection.size / Math.max(targetWords.size, lookWords.size)

      return { look: l, similarity }
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((item) => item.look)
}

/**
 * Create a community challenge/trend
 */
export function createCommunityTrend(
  name: string,
  description: string,
  endDate?: Date,
  tags: string[] = []
): CommunityTrend {
  return {
    trendId: `trend_${Date.now()}`,
    name,
    description,
    lookIds: [],
    participantCount: 0,
    createdDate: Date.now(),
    endDate: endDate?.getTime(),
    tags,
  }
}

/**
 * Add look to a community trend
 */
export function joinTrend(trend: CommunityTrend, lookId: string): CommunityTrend {
  if (!trend.lookIds.includes(lookId)) {
    trend.lookIds.push(lookId)
    trend.participantCount++
  }
  return trend
}

/**
 * Generate style profile
 */
export function createStyleProfile(
  userId: string,
  username: string,
  bio?: string,
  avatar?: string
): StyleProfile {
  return {
    userId,
    username,
    bio,
    avatar,
    colorSeason: undefined,
    sharedLooksCount: 0,
    averageRating: 0,
    followers: 0,
    following: 0,
  }
}

/**
 * Send friend request
 */
export function createFriendRequest(userId: string, friendId: string): FriendConnection {
  return {
    userId,
    friendId,
    status: 'pending',
    connectedDate: Date.now(),
  }
}

/**
 * Accept friend request
 */
export function acceptFriendRequest(connection: FriendConnection): FriendConnection {
  return {
    ...connection,
    status: 'accepted',
  }
}

/**
 * Block user
 */
export function blockUser(userId: string, blockedId: string): FriendConnection {
  return {
    userId,
    friendId: blockedId,
    status: 'blocked',
    connectedDate: Date.now(),
  }
}

/**
 * Get recommended friends based on style similarity
 */
export function getRecommendedFriends(
  userColorSeason?: string,
  otherProfiles: StyleProfile[] = [],
  limit: number = 5
): StyleProfile[] {
  if (!userColorSeason) return otherProfiles.slice(0, limit)

  return otherProfiles
    .filter((p) => p.colorSeason === userColorSeason)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit)
}

/**
 * Generate shareable stats for profile
 */
export function generateProfileStats(profile: StyleProfile, looks: SharedLook[]) {
  const userLooks = looks.filter((l) => l.sharedBy === profile.username)
  const totalRatings = userLooks.reduce((sum, l) => sum + l.ratings.length, 0)
  const avgRating = userLooks.length > 0
    ? userLooks.reduce((sum, l) => sum + calculateAverageRating(l), 0) / userLooks.length
    : 0

  return {
    totalSharedLooks: userLooks.length,
    totalViews: userLooks.reduce((sum, l) => sum + l.views, 0),
    totalShares: userLooks.reduce((sum, l) => sum + l.shares, 0),
    totalRatings,
    averageRating: Math.round(avgRating * 10) / 10,
    topLook: userLooks.sort(
      (a, b) =>
        (b.ratings.length + b.views * 0.1) -
        (a.ratings.length + a.views * 0.1)
    )[0],
  }
}

export default {
  generateShareToken,
  createSharedLook,
  generateShareLink,
  generateEmbedCode,
  rateOutfit,
  commentOnOutfit,
  calculateAverageRating,
  recordView,
  recordShare,
  getTrendingLooks,
  filterLooksByTag,
  findSimilarLooks,
  createCommunityTrend,
  joinTrend,
  createStyleProfile,
  createFriendRequest,
  acceptFriendRequest,
  blockUser,
  getRecommendedFriends,
  generateProfileStats,
}

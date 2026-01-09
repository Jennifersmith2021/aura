# Aura Optimization Library Documentation

## Overview

The Aura Optimization Library provides enterprise-grade features for performance, reliability, and user experience. Built with TypeScript and React, it integrates seamlessly with the existing codebase.

## Core Modules

### 1. **Caching System** (`src/lib/cache.ts`)

Advanced in-memory caching with automatic memory management and TTL support.

**Features:**
- LRU (Least Recently Used) eviction strategy
- Configurable TTL (Time To Live)
- Memory size limits with automatic cleanup
- Cache statistics and hit rate tracking
- Async function memoization

**Usage:**
```typescript
import { itemCache, createAsyncMemoizer } from '@/lib/cache';

// Direct caching
itemCache.set('items:123', myItems, 30000); // 30s TTL
const cached = itemCache.get('items:123');

// Memoized async function
const memoizedSearch = createAsyncMemoizer(
  async (query) => api.search(query),
  (query) => `search:${query}`,
  60000
);

// Check cache stats
console.log(itemCache.stats());
```

### 2. **Advanced Search** (`src/utils/advancedSearch.ts`)

Powerful search and filtering engine with support for complex queries.

**Features:**
- Full-text search across multiple fields
- Field-based filtering (price range, date range, categories)
- Relevance scoring
- Multiple sorting options
- Pagination support
- Data grouping and statistics

**Usage:**
```typescript
import { searchItems, groupBy, getMostCommon, calculateStats } from '@/utils/advancedSearch';

// Complex search with multiple filters
const results = searchItems(items, {
  query: 'red summer dress',
  type: 'clothing',
  category: 'dress',
  priceMin: 20,
  priceMax: 100,
  color: 'red',
  dateFrom: Date.now() - 90 * 24 * 60 * 60 * 1000,
  sortBy: 'relevance',
  sortOrder: 'desc',
  limit: 20,
  offset: 0
});

// Group items by category
const byCategory = groupBy(items, 'category');

// Get most common values
const topColors = getMostCommon(items, 'color', 10);

// Calculate statistics
const priceStats = calculateStats(items, 'price');
// Returns: { min, max, avg, median, count }
```

### 3. **Image Optimization** (`src/lib/imageOptimization.ts`)

Image compression, conversion, and thumbnail generation.

**Features:**
- Format conversion (WebP, JPEG, PNG)
- Quality adjustment
- Batch optimization
- Thumbnail generation with center cropping
- Storage savings calculation
- Lazy loading support

**Usage:**
```typescript
import { optimizeImage, createThumbnail, batchOptimizeImages } from '@/lib/imageOptimization';

// Optimize single image
const optimized = await optimizeImage(dataUrl, {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  format: 'webp'
});

// Create thumbnail
const thumb = await createThumbnail(dataUrl, 200, 0.6);

// Batch optimize
const results = await batchOptimizeImages(urls, { maxWidth: 800 });

// Check savings
const stats = calculateOptimizationStats(original, optimized);
console.log(`Saved ${stats.savingPercent}%`);
```

### 4. **Error Recovery** (`src/lib/errorRecovery.ts`)

Resilience patterns for handling failures gracefully.

**Features:**
- Exponential backoff retry logic
- Circuit breaker pattern
- Error recovery strategies
- Deadletter queue for failed operations
- Async operation queue with concurrency control

**Usage:**
```typescript
import { retryWithBackoff, CircuitBreaker, AsyncQueue } from '@/lib/errorRecovery';

// Retry with exponential backoff
const result = await retryWithBackoff(
  () => api.fetchData(),
  {
    maxRetries: 5,
    initialDelay: 100,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    timeout: 30000,
    shouldRetry: (error) => error.message.includes('timeout')
  }
);

// Circuit breaker
const breaker = new CircuitBreaker(5, 2, 60000);
try {
  await breaker.execute(() => unreliableService());
} catch (error) {
  console.log(`Circuit breaker state: ${breaker.getState()}`);
}

// Async queue with concurrency control
const queue = new AsyncQueue(3); // 3 concurrent operations
queue.add(() => processItem1());
queue.add(() => processItem2());
queue.add(() => processItem3());
```

### 5. **Batch Operations** (`src/lib/batchOperations.ts`)

Efficient batch processing with progress tracking.

**Features:**
- Batch execution with parallelism control
- Progress tracking and callbacks
- Batch import/export (CSV, JSON)
- Batch validation
- Batch transformation
- Batch controller for scheduled operations

**Usage:**
```typescript
import { executeBatch, batchImport, batchExport } from '@/lib/batchOperations';

// Execute batch operation
const result = await executeBatch({
  items: myItems,
  operation: async (item) => {
    return await processItem(item);
  },
  batchSize: 20,
  parallelism: 5,
  onProgress: (done, total) => {
    console.log(`Progress: ${done}/${total}`);
  },
  onError: (error, item) => {
    console.error(`Failed to process ${item.id}:`, error);
  }
});

// Batch import
const importResult = await batchImport(
  csvParsedItems,
  async (chunk) => {
    await store.addItems(chunk);
  },
  50 // chunk size
);

// Export to CSV
const csv = await batchExport(items, 'csv');
```

### 6. **Data Validation** (`src/lib/validation.ts`)

Schema-based validation using Zod with type safety.

**Features:**
- Pre-defined schemas for all data types
- Batch validation with error collection
- Type predicates for runtime type checking
- Safe parsing with fallbacks
- Comprehensive error messages

**Usage:**
```typescript
import { validateItem, validateBatch, ItemSchema, isValidItem } from '@/lib/validation';

// Validate single item
const { valid, data, errors } = validateItem(unknownData);

// Batch validation
const { valid: validItems, invalid } = validateBatch(csvData, ItemSchema);
invalid.forEach(({ data, errors }) => {
  console.error('Validation error:', errors);
});

// Type guard
if (isValidItem(data)) {
  // TypeScript knows data is Item type
  useItemData(data);
}

// Safe parsing with defaults
const item = safeParseItem(unknownData, { type: 'clothing' });
```

### 7. **Notifications** (`src/lib/notifications.ts`)

Real-time notification system with scheduling support.

**Features:**
- Event-based notification service
- Browser notification integration
- Scheduled notifications (one-time, recurring, daily)
- Achievement, reminder, and alert builders
- Notification persistence

**Usage:**
```typescript
import {
  notificationService,
  AchievementNotifier,
  ReminderNotifier,
  scheduledNotifications
} from '@/lib/notifications';

// Manual notification
notificationService.notify(
  'achievement',
  '🎉 Milestone!',
  'You reached 100 items!'
);

// Achievement shortcuts
AchievementNotifier.milestone('Waist', 24, 'inches');
AchievementNotifier.streak(30);
AchievementNotifier.goal('Summer Collection');

// Reminders
ReminderNotifier.supplement('Vitamin D', '09:00 AM');
ReminderNotifier.workout('Cardio');

// Scheduled notifications
scheduledNotifications.scheduleDaily('morning-affirmation', '08:00', () => {
  notificationService.notify('reminder', '✨ Good morning!', affirmation);
});

// Get all notifications
const all = notificationService.getAll();
const unread = notificationService.getUnread();
```

### 8. **Analytics** (`src/lib/analytics.ts`)

Comprehensive tracking and reporting system.

**Features:**
- Page view tracking
- User action tracking
- Web Vitals monitoring (LCP, FID, CLS, FCP)
- User behavior analysis
- Feature usage tracking
- Session analytics
- Report generation

**Usage:**
```typescript
import {
  analyticsTracker,
  webVitalsTracker,
  userBehaviorAnalyzer,
  featureUsageTracker
} from '@/lib/analytics';

// Page views
analyticsTracker.trackPageView('/closet');
analyticsTracker.trackPageView('/shopping');

// Actions
analyticsTracker.trackAction('add_item', 'closet', 1, { color: 'red' });
analyticsTracker.trackAction('purchase', 'shopping', 49.99);

// Web Vitals
webVitalsTracker.trackLCP();
webVitalsTracker.trackFID();

// User behavior
userBehaviorAnalyzer.recordInteraction('click', 'add-button');
userBehaviorAnalyzer.recordSearch('red dress', 45);

// Feature usage
featureUsageTracker.trackFeatureUse('outfit-designer');

// Reports
const report = analyticsTracker.generateReport();
console.log(report.topPages, report.topActions);

const analysis = userBehaviorAnalyzer.getSessionAnalysis();
console.log(`Session duration: ${analysis.duration}ms`);
```

## Optimized Hooks

### `useAdvancedItemSearch()`
Returns a memoized search function with analytics tracking.

### `useItemAnalytics()`
Returns calculated analytics for the current items (grouping, statistics, top items).

### `useOutfitAnalytics()`
Provides outfit-specific analytics (most worn items, unused items, recommendations).

### `useFeatureTracking(featureName)`
Returns a function to track feature usage.

### `useInteractionTracking()`
Returns methods for tracking user interactions, form submissions, and errors.

### `useBatchOperations()`
Returns a function for bulk add/delete operations with progress tracking.

### `useSessionAnalytics()`
Returns current session analytics (duration, events, features used).

### `useRecommendations()`
Generates recommendations based on item colors and usage patterns.

## Performance Tips

1. **Cache TTL Guidelines:**
   - User data: 30-60 seconds
   - Search results: 60-120 seconds
   - API responses: 300+ seconds
   - Real-time data: 5-10 seconds

2. **Batch Size Guidelines:**
   - Small operations: 5-10 items
   - Medium operations: 10-20 items
   - Large operations: 20-50 items

3. **Parallelism Guidelines:**
   - Light operations: 5-10 concurrent
   - Medium operations: 3-5 concurrent
   - Heavy operations: 1-3 concurrent

4. **Image Optimization:**
   - Thumbnails: 200px, quality 0.6
   - Previews: 500px, quality 0.7
   - Full size: 1024px, quality 0.8

## Integration Example

See `src/components/AdvancedItemManagerOptimized.tsx` for a complete example that demonstrates:
- Advanced search with filters
- Bulk operations (select, delete, export)
- Real-time analytics
- Progress tracking
- Error handling
- Notification integration

## Best Practices

1. **Always validate input data** before using it
2. **Use retry logic** for network operations
3. **Cache expensive computations** (searches, grouping)
4. **Track important user actions** for analytics
5. **Schedule notifications thoughtfully** - don't overwhelm users
6. **Monitor error rates** and adjust retry strategies accordingly
7. **Batch operations** when processing >5 items
8. **Use feature tracking** to identify unused features

## Migration Guide

To integrate optimization features into existing components:

```typescript
// Before
const items = useStore().items;
const filtered = items.filter(i => i.name.includes(query));

// After
const search = useAdvancedItemSearch();
const filtered = search(query, { type: 'clothing', sortBy: 'relevance' });
analyticsTracker.trackAction('search', 'items', filtered.length);
```

## Contributing

When adding new features:
1. Add validation schemas to `src/lib/validation.ts`
2. Add analytics tracking calls
3. Implement error recovery with retry logic
4. Add notification support for important events
5. Document usage in this file

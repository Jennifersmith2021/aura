/**
 * Aura Optimization & Enhancement Library Index
 * 
 * This library provides enterprise-grade features for:
 * - Performance optimization through intelligent caching
 * - Advanced data operations with validation
 * - Error recovery and resilience patterns
 * - Real-time notifications and alerts
 * - Comprehensive analytics and tracking
 */

// Caching & Performance
export * from "@/lib/cache";

// Advanced Search & Filtering
export * from "@/utils/advancedSearch";

// Image Optimization
export * from "@/lib/imageOptimization";

// Error Recovery & Resilience
export * from "@/lib/errorRecovery";

// Batch Operations
export * from "@/lib/batchOperations";

// Data Validation
export * from "@/lib/validation";

// Notifications
export * from "@/lib/notifications";

// Analytics
export * from "@/lib/analytics";

// Usage examples and documentation
export const OPTIMIZATION_LIBRARY_DOCS = `
# Aura Optimization Library - Quick Start Guide

## 🚀 Caching
\`\`\`ts
import { itemCache, createAsyncMemoizer } from '@/lib/cache';

// Simple caching
itemCache.set('items_key', myItems);
const cached = itemCache.get('items_key');

// Memoized async functions
const memoizedSearch = createAsyncMemoizer(
  async (query) => api.search(query),
  (query) => \`search:\${query}\`,
  60000 // 60s TTL
);

const results = await memoizedSearch('dress');
\`\`\`

## 🔍 Advanced Search
\`\`\`ts
import { searchItems, groupBy, getMostCommon } from '@/utils/advancedSearch';

// Complex search with filters
const results = searchItems(items, {
  query: 'red dress',
  type: 'clothing',
  priceMax: 100,
  sortBy: 'relevance',
  limit: 20
});

// Group and analyze
const byColor = groupBy(items, 'color');
const topColors = getMostCommon(items, 'color', 5);
\`\`\`

## 🖼️ Image Optimization
\`\`\`ts
import { optimizeImage, createThumbnail } from '@/lib/imageOptimization';

// Optimize with compression
const optimized = await optimizeImage(dataUrl, {
  maxWidth: 1024,
  quality: 0.8
});

// Create thumbnails
const thumb = await createThumbnail(dataUrl, 200);
\`\`\`

## 🔄 Error Recovery
\`\`\`ts
import { retryWithBackoff, CircuitBreaker } from '@/lib/errorRecovery';

// Retry with exponential backoff
const result = await retryWithBackoff(
  () => api.fetchData(),
  { maxRetries: 3, initialDelay: 100 }
);

// Circuit breaker pattern
const breaker = new CircuitBreaker(5, 2, 60000);
await breaker.execute(() => unreliableService());
\`\`\`

## 📦 Batch Operations
\`\`\`ts
import { executeBatch, batchImport } from '@/lib/batchOperations';

// Batch process items
const results = await executeBatch({
  items: myItems,
  operation: async (item) => await processItem(item),
  batchSize: 10,
  parallelism: 3,
  onProgress: (done, total) => console.log(\`\${done}/\${total}\`)
});

// Batch import
const importResult = await batchImport(csvItems, storeImportFn);
\`\`\`

## ✅ Data Validation
\`\`\`ts
import { validateItem, validateBatch, ItemSchema } from '@/lib/validation';

// Validate single item
const { valid, data, errors } = validateItem(unknownData);

// Batch validation
const { valid: validItems, invalid } = validateBatch(items, ItemSchema);

// Type guard
if (isValidItem(data)) {
  // TypeScript knows data is Item type
}
\`\`\`

## 🔔 Notifications
\`\`\`ts
import { 
  notificationService,
  AchievementNotifier,
  scheduledNotifications 
} from '@/lib/notifications';

// Manual notification
notificationService.notify('achievement', 'Title', 'Message');

// Achievement shortcuts
AchievementNotifier.milestone('Waist', 24, 'inches');
AchievementNotifier.streak(30);

// Schedule daily affirmation
scheduledNotifications.scheduleDaily(
  'affirmation',
  '08:00',
  () => notificationService.notify('reminder', 'Good morning!')
);
\`\`\`

## 📊 Analytics
\`\`\`ts
import { analyticsTracker, webVitalsTracker } from '@/lib/analytics';

// Track page views and actions
analyticsTracker.trackPageView('/closet');
analyticsTracker.trackAction('add_item', 'closet', 1);

// Track web vitals
webVitalsTracker.trackLCP();
webVitalsTracker.trackFID();

// Generate report
const report = analyticsTracker.generateReport();
console.log(report.topPages, report.topActions);
\`\`\`

## 🎯 Best Practices

1. **Caching**: Use for expensive operations (API calls, searches)
2. **Validation**: Always validate user input and API responses
3. **Error Recovery**: Always implement retry logic for network operations
4. **Batch Operations**: Use for bulk updates/imports (>5 items)
5. **Analytics**: Track key user actions to understand behavior
6. **Notifications**: Schedule reminders, don't spam users

## 📈 Performance Tips

- Cache TTL: 30-60s for user data, 5-10s for real-time data
- Batch size: 10-20 items per batch
- Parallelism: 3-5 concurrent operations
- Image size: Optimize to <100KB for thumbnails, <500KB for full images
- Query cache: Always use for repeated searches
`;

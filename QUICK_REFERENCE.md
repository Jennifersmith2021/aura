# Aura Optimization Library - Quick Reference

## 🚀 Most-Used Utilities

### Search & Filter
```typescript
// Import
import { searchItems } from '@/utils/advancedSearch';
import { useAdvancedItemSearch } from '@/hooks/useOptimizations';

// Usage
const results = searchItems(items, {
  query: 'red dress',
  type: 'clothing',
  priceMax: 100,
  sortBy: 'relevance',
  limit: 20
});

// In React
const search = useAdvancedItemSearch();
const results = search('red', { type: 'clothing' });
```

### Caching
```typescript
import { itemCache, createAsyncMemoizer } from '@/lib/cache';

// Direct caching
itemCache.set('key', data, 30000);
const cached = itemCache.get('key');

// Memoize async function
const memoSearch = createAsyncMemoizer(
  async (q) => api.search(q),
  (q) => `search:${q}`
);
```

### Error Recovery
```typescript
import { retryWithBackoff, CircuitBreaker } from '@/lib/errorRecovery';

// Retry with backoff
const result = await retryWithBackoff(
  () => api.fetch(),
  { maxRetries: 3, initialDelay: 100 }
);

// Circuit breaker
const breaker = new CircuitBreaker(5, 2, 60000);
await breaker.execute(() => unreliableService());
```

### Batch Operations
```typescript
import { executeBatch } from '@/lib/batchOperations';

const result = await executeBatch({
  items: myItems,
  operation: async (item) => processItem(item),
  batchSize: 20,
  onProgress: (done, total) => console.log(`${done}/${total}`)
});
```

### Data Validation
```typescript
import { validateItem, ItemSchema } from '@/lib/validation';

const { valid, data, errors } = validateItem(unknownData);
if (isValidItem(data)) {
  // TypeScript knows it's Item type
}
```

### Notifications
```typescript
import { notificationService, AchievementNotifier } from '@/lib/notifications';

notificationService.notify('achievement', '🎉 Title', 'Message');
AchievementNotifier.milestone('Waist', 24, 'inches');
AchievementNotifier.streak(30);
```

### Analytics
```typescript
import { analyticsTracker } from '@/lib/analytics';

analyticsTracker.trackPageView('/closet');
analyticsTracker.trackAction('add_item', 'closet');
const report = analyticsTracker.generateReport();
```

### Persistence
```typescript
import { usePersistentData } from '@/hooks/usePersistence';

const { data, save, loading } = usePersistentData(
  'items',
  [],
  1,
  async (data) => api.sync(data)
);
```

## 📊 Hook Reference

### Optimization Hooks
| Hook | Purpose |
|------|---------|
| `useAdvancedItemSearch()` | Memoized search function |
| `useItemAnalytics()` | Closet statistics |
| `useOutfitAnalytics()` | Outfit insights |
| `useFeatureTracking()` | Track feature usage |
| `useInteractionTracking()` | Track user interactions |
| `useBatchOperations()` | Bulk operations |
| `useSessionAnalytics()` | Session insights |
| `useRecommendations()` | Get recommendations |

### Persistence Hooks
| Hook | Purpose |
|------|---------|
| `usePersistentData()` | Persistent state + sync |
| `useStorageQuota()` | Monitor storage |
| `useDataHistory()` | Version history |
| `useDataMigration()` | Data migration |
| `useSyncStatus()` | Sync monitoring |
| `useBatchPersistence()` | Batch save/load |
| `useDataExportImport()` | Export/import |

## 🎯 Common Patterns

### Add Item with Analytics
```typescript
const addItemWithTracking = async (item: Item) => {
  const { valid, data } = validateItem(item);
  if (!valid) return;
  
  await addItem(data);
  analyticsTracker.trackAction('add_item', 'closet');
  notificationService.notify('update', 'Item Added', data.name);
};
```

### Bulk Delete with Progress
```typescript
const { data: selectedItems } = useState<string[]>([]);
const batchOps = useBatchOperations();

const deleteSelected = async () => {
  const itemsToDelete = items.filter(i => selectedItems.includes(i.id));
  
  await batchOps(itemsToDelete, 'remove', (done, total) => {
    console.log(`Deleted ${done}/${total}`);
  });
  
  analyticsTracker.trackAction('bulk_delete', 'items', itemsToDelete.length);
};
```

### Export with Error Handling
```typescript
const handleExport = async () => {
  const result = await retryWithBackoff(
    async () => batchExport(items, 'csv'),
    { maxRetries: 3 }
  );
  
  if (result.success) {
    // Save to file
  } else {
    notificationService.notify('error', 'Export Failed', result.error?.message);
  }
};
```

### Search with Caching
```typescript
const search = useAdvancedItemSearch();
const [query, setQuery] = useState('');

const results = useMemo(() => {
  if (!query) return items;
  return search(query, { type: 'clothing', sortBy: 'relevance' });
}, [query]);
```

## ⚙️ Configuration

### Cache Settings
```typescript
// Default: 60s TTL, 50MB max size
const itemCache = new Cache<Item[]>(10 * 1024 * 1024, 30000);
```

### Batch Settings
```typescript
// Default: 10 items per batch, 3 concurrent
const result = await executeBatch({
  items,
  operation,
  batchSize: 20,      // Items per batch
  parallelism: 5      // Concurrent operations
});
```

### Retry Settings
```typescript
// Exponential backoff: 100ms → 200ms → 400ms → 800ms...
await retryWithBackoff(fn, {
  maxRetries: 3,              // Attempt 4 times total
  initialDelay: 100,          // Start with 100ms
  maxDelay: 10000,            // Cap at 10s
  backoffMultiplier: 2,       // Double each time
  jitter: true                // Add randomness
});
```

## 🔍 Debugging

### Check Cache Stats
```typescript
console.log(itemCache.stats());
// { size: 1024, entries: 5, hits: 100, misses: 20, hitRate: 0.83 }
```

### Check Sync Status
```typescript
const manager = persistenceManager.createManager('items');
const status = await manager.getSyncStatus();
// { syncStatus: 'synced', lastSync: 1234567890, ... }
```

### View Analytics Report
```typescript
const report = analyticsTracker.generateReport();
console.log(report.topPages, report.topActions, report.performanceMetrics);
```

### Get Notifications
```typescript
const all = notificationService.getAll();
const unread = notificationService.getUnread();
notificationService.markAllAsRead();
```

## 💡 Best Practices

1. **Always validate user input**: Use `validateItem()` before storing
2. **Track important actions**: Use `analyticsTracker.trackAction()`
3. **Handle errors gracefully**: Wrap async calls with `retryWithBackoff()`
4. **Cache expensive operations**: Use `itemCache` for searches
5. **Batch bulk operations**: Use `executeBatch()` for 5+ items
6. **Notify users of progress**: Use `onProgress` callback in batch ops
7. **Monitor storage**: Use `useStorageQuota()` to warn when near limit
8. **Export important data**: Implement `useDataExportImport()` for backups

## 🚦 Performance Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| Search | <100ms | 20-50ms |
| Batch operation | <5sec for 100 items | 2-3sec |
| Image optimization | <1sec | 200-500ms |
| Cache hit | <1ms | 0.1-0.5ms |
| Analytics log | <10ms | 1-5ms |
| Data validation | <10ms | 2-5ms |

## 📚 Documentation Links

- Full API: [OPTIMIZATION_LIBRARY.md](./OPTIMIZATION_LIBRARY.md)
- Session Summary: [OPTIMIZATION_SESSION_SUMMARY.md](./OPTIMIZATION_SESSION_SUMMARY.md)
- Example Component: [src/components/AdvancedItemManagerOptimized.tsx](./src/components/AdvancedItemManagerOptimized.tsx)

## 🆘 Common Issues

### Cache not updating
```typescript
// Use manager.onChange() to watch for changes
const unsubscribe = manager.onChange((data) => {
  setItems(data);
});
```

### Sync not triggering
```typescript
// Ensure callback is set and auto-sync is started
manager.setSyncCallback(syncFn);
manager.startAutoSync(30000); // 30s interval
```

### Storage quota exceeded
```typescript
// Check quota and cleanup old data
const usage = await storageQuotaManager.getUsagePercent();
if (usage > 0.8) {
  await storageQuotaManager.cleanup();
}
```

### Validation errors unclear
```typescript
// Get detailed error messages
const { valid, errors } = validateItem(data);
if (!valid) {
  errors?.forEach(err => console.error(err));
}
```

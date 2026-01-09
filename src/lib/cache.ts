/**
 * Advanced caching utilities with TTL and memory management
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
  size: number; // bytes estimate
  hits: number;
  lastAccess: number;
}

interface CacheStats {
  size: number;
  entries: number;
  hits: number;
  misses: number;
  hitRate: number;
}

class Cache<T> {
  private entries = new Map<string, CacheEntry<T>>();
  private maxSize: number; // bytes
  private ttl: number; // milliseconds
  private misses = 0;
  private hits = 0;

  constructor(maxSizeBytes = 50 * 1024 * 1024, ttlMs = 60000) {
    this.maxSize = maxSizeBytes;
    this.ttl = ttlMs;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const size = this.estimateSize(value);
    const expiry = Date.now() + (ttlMs || this.ttl);

    // Remove oldest entry if cache is full
    if (this.getTotalSize() + size > this.maxSize) {
      this.evictLRU();
    }

    this.entries.set(key, {
      value,
      expiry,
      size,
      hits: 0,
      lastAccess: Date.now(),
    });
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiry) {
      this.entries.delete(key);
      this.misses++;
      return undefined;
    }

    entry.hits++;
    entry.lastAccess = Date.now();
    this.hits++;
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiry) {
      this.entries.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats(): CacheStats {
    return {
      size: this.getTotalSize(),
      entries: this.entries.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0,
    };
  }

  private getTotalSize(): number {
    let total = 0;
    this.entries.forEach((entry) => {
      total += entry.size;
    });
    return total;
  }

  private evictLRU(): void {
    let oldest: [string, CacheEntry<T>] | null = null;
    let oldestTime = Date.now();

    this.entries.forEach((entry, key) => {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldest = [key, entry];
      }
    });

    if (oldest) {
      this.entries.delete(oldest[0]);
    }
  }

  private estimateSize(value: T): number {
    // Rough estimation
    return JSON.stringify(value).length;
  }
}

// Create singleton cache instances for common data types
export const itemCache = new Cache<any[]>(10 * 1024 * 1024, 30000);
export const lookCache = new Cache<any[]>(5 * 1024 * 1024, 30000);
export const measurementCache = new Cache<any[]>(5 * 1024 * 1024, 60000);
export const analyticsCache = new Cache<any>(2 * 1024 * 1024, 30000);

/**
 * Create a memoized async function with caching
 */
export function createAsyncMemoizer<Args extends any[], Result>(
  fn: (...args: Args) => Promise<Result>,
  keyFn: (...args: Args) => string,
  ttlMs = 60000
) {
  const cache = new Cache<Result>(5 * 1024 * 1024, ttlMs);

  return async (...args: Args): Promise<Result> => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Debounced async function that caches results
 */
export function createDebouncedAsyncMemoizer<Args extends any[], Result>(
  fn: (...args: Args) => Promise<Result>,
  keyFn: (...args: Args) => string,
  delayMs = 300,
  ttlMs = 60000
) {
  const cache = new Cache<Result>(5 * 1024 * 1024, ttlMs);
  let timeout: NodeJS.Timeout | null = null;
  const pending = new Map<string, Promise<Result>>();

  return async (...args: Args): Promise<Result> => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    // Return pending promise if one exists
    if (pending.has(key)) {
      return pending.get(key)!;
    }

    return new Promise((resolve) => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(async () => {
        try {
          const result = await fn(...args);
          cache.set(key, result);
          pending.delete(key);
          resolve(result);
        } catch (error) {
          pending.delete(key);
          throw error;
        }
      }, delayMs);

      const promise = new Promise<Result>((innerResolve) => {
        const checkInterval = setInterval(() => {
          const value = cache.get(key);
          if (value !== undefined) {
            clearInterval(checkInterval);
            pending.delete(key);
            innerResolve(value);
          }
        }, 50);
      });

      pending.set(key, promise);
      resolve(promise);
    });
  };
}

/**
 * Advanced data persistence layer with sync, versioning, and recovery
 */

import { get, set, del, entries, clear } from "idb-keyval";

export interface PersistenceMetadata {
  version: number;
  lastSync: number;
  lastModified: number;
  syncStatus: "synced" | "pending" | "failed" | "offline";
  changeHash: string;
}

export interface SyncRecord<T> {
  data: T;
  metadata: PersistenceMetadata;
  backup?: T;
  history?: Array<{ timestamp: number; version: T }>;
}

/**
 * Advanced persistence manager with versioning and recovery
 */
export class PersistenceManager<T> {
  private key: string;
  private version = 1;
  private maxHistory = 10;
  private autoSyncInterval = 30000; // 30 seconds
  private syncTimer?: NodeJS.Timeout;
  private syncCallback?: (data: T) => Promise<void>;
  private changeListeners: Set<(data: T) => void> = new Set();

  constructor(key: string, version = 1) {
    this.key = key;
    this.version = version;
  }

  /**
   * Load data from persistent storage
   */
  async load(): Promise<SyncRecord<T> | null> {
    try {
      const record = await get<SyncRecord<T>>(this.key);
      
      if (!record) {
        return null;
      }

      // Verify version compatibility
      if (record.metadata.version !== this.version) {
        console.warn(`Version mismatch: ${record.metadata.version} vs ${this.version}`);
        // Could implement migration logic here
      }

      return record;
    } catch (error) {
      console.error(`Failed to load ${this.key}:`, error);
      return null;
    }
  }

  /**
   * Save data to persistent storage
   */
  async save(data: T, metadata?: Partial<PersistenceMetadata>): Promise<void> {
    try {
      const existing = (await this.load()) || {
        data,
        metadata: this.createMetadata(),
        history: []
      };

      // Create backup before updating
      const backup = existing.data;

      // Keep history
      const history = (existing.history || []).slice(-(this.maxHistory - 1));
      history.push({
        timestamp: Date.now(),
        version: existing.data,
      });

      const record: SyncRecord<T> = {
        data,
        backup,
        history,
        metadata: {
          ...existing.metadata,
          ...metadata,
          version: this.version,
          lastModified: Date.now(),
          changeHash: this.calculateHash(data),
        },
      };

      await set(this.key, record);
      this.notifyListeners(data);

      // Trigger sync if configured
      if (this.syncCallback) {
        this.triggerSync(data);
      }
    } catch (error) {
      console.error(`Failed to save ${this.key}:`, error);
      throw error;
    }
  }

  /**
   * Delete data from persistent storage
   */
  async delete(): Promise<void> {
    try {
      await del(this.key);
      this.notifyListeners(null as any);
    } catch (error) {
      console.error(`Failed to delete ${this.key}:`, error);
      throw error;
    }
  }

  /**
   * Get data history
   */
  async getHistory(): Promise<Array<{ timestamp: number; version: T }>> {
    const record = await this.load();
    return record?.history || [];
  }

  /**
   * Restore data to a previous version
   */
  async restoreVersion(timestamp: number): Promise<boolean> {
    const record = await this.load();
    if (!record) return false;

    const historyEntry = record.history?.find((h) => h.timestamp === timestamp);
    if (!historyEntry) return false;

    await this.save(historyEntry.version, {
      syncStatus: "pending",
    });

    return true;
  }

  /**
   * Recover from backup
   */
  async recoverFromBackup(): Promise<boolean> {
    const record = await this.load();
    if (!record || !record.backup) return false;

    await this.save(record.backup, {
      syncStatus: "pending",
    });

    return true;
  }

  /**
   * Set up automatic sync
   */
  setSyncCallback(callback: (data: T) => Promise<void>): void {
    this.syncCallback = callback;
  }

  /**
   * Start automatic syncing
   */
  startAutoSync(interval = this.autoSyncInterval): void {
    if (this.syncTimer) return;

    this.syncTimer = setInterval(async () => {
      const record = await this.load();
      if (record && record.metadata.syncStatus === "pending" && this.syncCallback) {
        try {
          await this.syncCallback(record.data);
          await this.save(record.data, { syncStatus: "synced" });
        } catch (error) {
          await this.save(record.data, { syncStatus: "failed" });
          console.error("Sync failed:", error);
        }
      }
    }, interval);
  }

  /**
   * Stop automatic syncing
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  /**
   * Trigger immediate sync
   */
  private async triggerSync(data: T): Promise<void> {
    if (!this.syncCallback) return;

    try {
      await this.save(data, { syncStatus: "pending" });
      await this.syncCallback(data);
      await this.save(data, { syncStatus: "synced", lastSync: Date.now() });
    } catch (error) {
      await this.save(data, { syncStatus: "failed" });
      console.error("Sync failed:", error);
    }
  }

  /**
   * Subscribe to data changes
   */
  onChange(listener: (data: T) => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<PersistenceMetadata | null> {
    const record = await this.load();
    return record?.metadata || null;
  }

  /**
   * Export data for backup
   */
  async export(): Promise<string> {
    const record = await this.load();
    return JSON.stringify(record, null, 2);
  }

  /**
   * Import data from backup
   */
  async import(json: string): Promise<boolean> {
    try {
      const record = JSON.parse(json) as SyncRecord<T>;
      await set(this.key, record);
      this.notifyListeners(record.data);
      return true;
    } catch (error) {
      console.error("Import failed:", error);
      return false;
    }
  }

  /**
   * Clear history
   */
  async clearHistory(): Promise<void> {
    const record = await this.load();
    if (record) {
      record.history = [];
      await set(this.key, record);
    }
  }

  private createMetadata(): PersistenceMetadata {
    return {
      version: this.version,
      lastSync: 0,
      lastModified: Date.now(),
      syncStatus: "pending",
      changeHash: "",
    };
  }

  private calculateHash(data: T): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    return Math.abs(hash).toString(36);
  }

  private notifyListeners(data: T): void {
    this.changeListeners.forEach((listener) => listener(data));
  }
}

/**
 * Multi-key persistence with batching
 */
export class BatchPersistenceManager {
  private managers: Map<string, PersistenceManager<any>> = new Map();
  private batchSaveTimer?: NodeJS.Timeout;
  private batchDelay = 1000; // 1 second

  createManager<T>(key: string, version = 1): PersistenceManager<T> {
    if (!this.managers.has(key)) {
      this.managers.set(key, new PersistenceManager(key, version));
    }
    return this.managers.get(key) as PersistenceManager<T>;
  }

  /**
   * Save multiple items with batching
   */
  async batchSave<T>(
    items: Array<{ key: string; data: T; version?: number }>
  ): Promise<void> {
    const promises = items.map(({ key, data, version }) => {
      const manager = this.createManager(key, version);
      return manager.save(data);
    });

    await Promise.all(promises);
  }

  /**
   * Load multiple items
   */
  async batchLoad<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();

    for (const key of keys) {
      const manager = this.createManager<T>(key);
      const record = await manager.load();
      results.set(key, record?.data || null);
    }

    return results;
  }

  /**
   * Get all stored keys and their metadata
   */
  async getAllMetadata(): Promise<Map<string, PersistenceMetadata>> {
    const metadata = new Map<string, PersistenceMetadata>();
    const allEntries = await entries();

    for (const [key, value] of allEntries) {
      if (value && typeof value === 'object' && 'metadata' in value) {
        metadata.set(key as string, (value as any).metadata);
      }
    }

    return metadata;
  }

  /**
   * Get storage usage
   */
  async getStorageInfo(): Promise<{
    count: number;
    estimatedSize: number;
    lastSync: number;
    syncStatus: Map<string, string>;
  }> {
    const allEntries = await entries();
    let estimatedSize = 0;
    const syncStatus = new Map<string, string>();
    let lastSync = 0;

    for (const [key, value] of allEntries) {
      const size = JSON.stringify(value).length;
      estimatedSize += size;

      if (value && typeof value === 'object' && 'metadata' in value) {
        const meta = (value as any).metadata;
        syncStatus.set(key as string, meta.syncStatus);
        lastSync = Math.max(lastSync, meta.lastSync);
      }
    }

    return {
      count: allEntries.length,
      estimatedSize,
      lastSync,
      syncStatus,
    };
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    this.managers.clear();
    await clear();
  }
}

/**
 * Singleton instance for global use
 */
export const persistenceManager = new BatchPersistenceManager();

/**
 * Data migration utilities
 */
export class DataMigration {
  static async migrate<T, R>(
    sourceKey: string,
    targetKey: string,
    transformer: (data: T) => R,
    targetVersion: number
  ): Promise<boolean> {
    try {
      const sourceManager = persistenceManager.createManager<T>(sourceKey);
      const targetManager = persistenceManager.createManager<R>(targetKey, targetVersion);

      const sourceRecord = await sourceManager.load();
      if (!sourceRecord) return false;

      const transformedData = transformer(sourceRecord.data);
      await targetManager.save(transformedData);

      return true;
    } catch (error) {
      console.error("Migration failed:", error);
      return false;
    }
  }

  static async mergeData<T>(
    key1: string,
    key2: string,
    merger: (a: T, b: T) => T
  ): Promise<T | null> {
    try {
      const manager1 = persistenceManager.createManager<T>(key1);
      const manager2 = persistenceManager.createManager<T>(key2);

      const record1 = await manager1.load();
      const record2 = await manager2.load();

      if (!record1 || !record2) return null;

      const merged = merger(record1.data, record2.data);
      await manager1.save(merged);

      return merged;
    } catch (error) {
      console.error("Merge failed:", error);
      return null;
    }
  }
}

/**
 * Storage quota management
 */
export class StorageQuotaManager {
  private maxSize: number; // bytes
  private warningThreshold = 0.8; // 80%

  constructor(maxSizeBytes = 50 * 1024 * 1024) {
    this.maxSize = maxSizeBytes;
  }

  async getUsagePercent(): Promise<number> {
    const info = await persistenceManager.getStorageInfo();
    return info.estimatedSize / this.maxSize;
  }

  async isNearCapacity(): Promise<boolean> {
    const usage = await this.getUsagePercent();
    return usage >= this.warningThreshold;
  }

  async cleanup(): Promise<number> {
    const metadata = await persistenceManager.getAllMetadata();
    let deleted = 0;

    // Delete oldest unsynced items
    const oldestItems = Array.from(metadata.entries())
      .filter(([, meta]) => meta.syncStatus === "synced")
      .sort(([, a], [, b]) => a.lastModified - b.lastModified)
      .slice(0, 10);

    for (const [key] of oldestItems) {
      const manager = persistenceManager.createManager(key);
      await manager.delete();
      deleted++;
    }

    return deleted;
  }
}

export const storageQuotaManager = new StorageQuotaManager();

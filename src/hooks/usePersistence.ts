/**
 * Advanced store hooks for persistence and sync
 */

import { useEffect, useCallback, useState } from "react";
import {
  persistenceManager,
  PersistenceManager,
  storageQuotaManager,
  DataMigration,
} from "@/lib/persistence";
import type { Item, MeasurementLog, Look } from "@/types";

/**
 * Hook for persistent data with automatic sync
 */
export function usePersistentData<T>(
  key: string,
  initialValue: T,
  version = 1,
  syncCallback?: (data: T) => Promise<void>
) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  // Create manager
  const manager = persistenceManager.createManager<T>(key, version);

  // Load data on mount
  useEffect(() => {
    (async () => {
      try {
        const record = await manager.load();
        if (record) {
          setData(record.data);
          setSynced(record.metadata.syncStatus === "synced");
        }
      } catch (error) {
        console.error("Failed to load persistent data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [key]);

  // Set up sync callback
  useEffect(() => {
    if (syncCallback) {
      manager.setSyncCallback(syncCallback);
      manager.startAutoSync();
    }

    return () => manager.stopAutoSync();
  }, [syncCallback]);

  // Watch for changes from other tabs
  useEffect(() => {
    const unsubscribe = manager.onChange((newData) => {
      setData(newData);
    });

    return unsubscribe;
  }, []);

  // Save function
  const save = useCallback(
    async (newData: T) => {
      setData(newData);
      try {
        await manager.save(newData, { syncStatus: syncCallback ? "pending" : "synced" });
      } catch (error) {
        console.error("Failed to save:", error);
      }
    },
    [syncCallback]
  );

  // Export function
  const exportData = useCallback(async () => {
    return await manager.export();
  }, []);

  return {
    data,
    loading,
    synced,
    save,
    exportData,
    manager,
  };
}

/**
 * Hook for monitoring storage quota
 */
export function useStorageQuota() {
  const [usage, setUsage] = useState(0);
  const [isNearCapacity, setIsNearCapacity] = useState(false);

  useEffect(() => {
    const checkQuota = async () => {
      const usagePercent = await storageQuotaManager.getUsagePercent();
      setUsage(usagePercent);

      const nearCapacity = await storageQuotaManager.isNearCapacity();
      setIsNearCapacity(nearCapacity);
    };

    checkQuota();
    const interval = setInterval(checkQuota, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const cleanup = useCallback(async () => {
    const deleted = await storageQuotaManager.cleanup();
    return deleted;
  }, []);

  return { usage, isNearCapacity, cleanup };
}

/**
 * Hook for data versioning and history
 */
export function useDataHistory<T>(key: string, version = 1) {
  const [history, setHistory] = useState<Array<{ timestamp: number; version: T }>>([]);

  const manager = persistenceManager.createManager<T>(key, version);

  useEffect(() => {
    (async () => {
      const hist = await manager.getHistory();
      setHistory(hist);
    })();
  }, [key]);

  const restoreVersion = useCallback(
    async (timestamp: number) => {
      const success = await manager.restoreVersion(timestamp);
      if (success) {
        const hist = await manager.getHistory();
        setHistory(hist);
      }
      return success;
    },
    [manager]
  );

  const clearHistory = useCallback(async () => {
    await manager.clearHistory();
    setHistory([]);
  }, [manager]);

  return { history, restoreVersion, clearHistory };
}

/**
 * Hook for data migration
 */
export function useDataMigration() {
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const migrate = useCallback(
    async <T, R>(
      sourceKey: string,
      targetKey: string,
      transformer: (data: T) => R,
      targetVersion: number
    ) => {
      setMigrating(true);
      setError(null);

      try {
        const success = await DataMigration.migrate(
          sourceKey,
          targetKey,
          transformer,
          targetVersion
        );

        if (!success) {
          setError("Migration failed");
        }

        return success;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return false;
      } finally {
        setMigrating(false);
      }
    },
    []
  );

  const mergeData = useCallback(
    async <T>(key1: string, key2: string, merger: (a: T, b: T) => T) => {
      setMigrating(true);
      setError(null);

      try {
        const merged = await DataMigration.mergeData(key1, key2, merger);
        return merged;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setMigrating(false);
      }
    },
    []
  );

  return { migrate, mergeData, migrating, error };
}

/**
 * Hook for sync status monitoring
 */
export function useSyncStatus(key: string) {
  const [status, setStatus] = useState<"synced" | "pending" | "failed" | "offline">("pending");
  const [lastSync, setLastSync] = useState(0);

  const manager = persistenceManager.createManager(key);

  useEffect(() => {
    const checkStatus = async () => {
      const metadata = await manager.getSyncStatus();
      if (metadata) {
        setStatus(metadata.syncStatus);
        setLastSync(metadata.lastSync);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, [key]);

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "synced":
        return "✓";
      case "pending":
        return "⟳";
      case "failed":
        return "✗";
      case "offline":
        return "⊘";
      default:
        return "?";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "synced":
        return "green";
      case "pending":
        return "yellow";
      case "failed":
        return "red";
      case "offline":
        return "gray";
      default:
        return "gray";
    }
  };

  return { status, lastSync, getStatusIcon, getStatusColor };
}

/**
 * Hook for batch persistence operations
 */
export function useBatchPersistence() {
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const saveBatch = useCallback(
    async <T,>(
      items: Array<{ key: string; data: T; version?: number }>
    ) => {
      setIsSaving(true);
      setProgress(0);

      try {
        const total = items.length;

        for (let i = 0; i < total; i++) {
          const { key, data, version } = items[i];
          const manager = persistenceManager.createManager(key, version);
          await manager.save(data);

          setProgress((i + 1) / total);
        }

        return true;
      } catch (error) {
        console.error("Batch save failed:", error);
        return false;
      } finally {
        setIsSaving(false);
        setProgress(0);
      }
    },
    []
  );

  const loadBatch = useCallback(async (keys: string[]) => {
    try {
      return await persistenceManager.batchLoad(keys);
    } catch (error) {
      console.error("Batch load failed:", error);
      return new Map();
    }
  }, []);

  return { saveBatch, loadBatch, isSaving, progress };
}

/**
 * Hook for export/import functionality
 */
export function useDataExportImport(key: string) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manager = persistenceManager.createManager(key);

  const exportData = useCallback(async () => {
    setExporting(true);
    setError(null);

    try {
      const json = await manager.export();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";
      setError(message);
      return false;
    } finally {
      setExporting(false);
    }
  }, [key]);

  const importData = useCallback(
    async (json: string) => {
      setImporting(true);
      setError(null);

      try {
        const success = await manager.import(json);
        if (!success) {
          setError("Import failed");
        }
        return success;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Import failed";
        setError(message);
        return false;
      } finally {
        setImporting(false);
      }
    },
    [manager]
  );

  return { exportData, importData, exporting, importing, error };
}

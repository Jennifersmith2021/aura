/**
 * Batch operation utilities for bulk actions
 */

interface BatchOperation<T, R> {
  items: T[];
  operation: (item: T) => Promise<R>;
  onProgress?: (completed: number, total: number) => void;
  onError?: (error: Error, item: T) => void;
  batchSize?: number;
  parallelism?: number;
}

interface BatchResult<R> {
  successful: R[];
  failed: Array<{ error: Error; index: number }>;
  total: number;
  duration: number;
}

/**
 * Execute batch operations with progress tracking
 */
export async function executeBatch<T, R>(
  options: BatchOperation<T, R>
): Promise<BatchResult<R>> {
  const {
    items,
    operation,
    onProgress,
    onError,
    batchSize = 10,
    parallelism = 3,
  } = options;

  const successful: R[] = [];
  const failed: Array<{ error: Error; index: number }> = [];
  const startTime = Date.now();

  // Process in batches with parallelism
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const promises = batch.map((item, batchIndex) =>
      operation(item)
        .then((result) => {
          successful.push(result);
          onProgress?.(successful.length + failed.length, items.length);
          return { success: true, result };
        })
        .catch((error) => {
          const index = i + batchIndex;
          failed.push({ error, index });
          onError?.(error, item);
          onProgress?.(successful.length + failed.length, items.length);
          return { success: false, error };
        })
    );

    // Limit parallelism
    for (let j = 0; j < promises.length; j += parallelism) {
      await Promise.all(promises.slice(j, j + parallelism));
    }
  }

  return {
    successful,
    failed,
    total: items.length,
    duration: Date.now() - startTime,
  };
}

/**
 * Batch update multiple items
 */
export async function batchUpdate<T extends { id: string }>(
  items: T[],
  updates: Partial<T>,
  updateFn: (item: T) => Promise<void>
): Promise<BatchResult<T>> {
  return executeBatch({
    items: items.map((item) => ({ ...item, ...updates })),
    operation: updateFn,
    batchSize: 20,
    parallelism: 5,
  });
}

/**
 * Batch delete multiple items
 */
export async function batchDelete<T extends { id: string }>(
  items: T[],
  deleteFn: (item: T) => Promise<void>,
  onProgress?: (completed: number, total: number) => void
): Promise<BatchResult<void>> {
  return executeBatch({
    items,
    operation: deleteFn,
    onProgress,
    batchSize: 20,
    parallelism: 5,
  });
}

/**
 * Batch tag/untag items
 */
export async function batchTag<T extends { id: string }>(
  items: T[],
  tags: string[],
  tagFn: (item: T, tags: string[]) => Promise<void>
): Promise<BatchResult<void>> {
  return executeBatch({
    items,
    operation: (item) => tagFn(item, tags),
    batchSize: 20,
    parallelism: 5,
  });
}

/**
 * Batch import items
 */
export async function batchImport<T>(
  items: T[],
  importFn: (items: T[]) => Promise<void>,
  chunkSize = 50
): Promise<{ total: number; successful: number; failed: number }> {
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    try {
      await importFn(chunk);
      successful += chunk.length;
    } catch (error) {
      failed += chunk.length;
      console.error("Batch import error:", error);
    }
  }

  return {
    total: items.length,
    successful,
    failed,
  };
}

/**
 * Batch export items to CSV/JSON
 */
export async function batchExport<T>(
  items: T[],
  format: "json" | "csv" = "json"
): Promise<string> {
  if (format === "json") {
    return JSON.stringify(items, null, 2);
  }

  if (format === "csv" && items.length > 0) {
    // Get headers from first item
    const headers = Object.keys(items[0]);
    const rows = [headers.join(",")];

    items.forEach((item) => {
      const values = headers.map((header) => {
        const value = (item as any)[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      rows.push(values.join(","));
    });

    return rows.join("\n");
  }

  return "";
}

/**
 * Batch search across multiple data sources
 */
export async function batchSearch<T extends { id: string }>(
  dataSources: Array<T[]>,
  searchQuery: string,
  searchField: string
): Promise<Array<T[]>> {
  const query = searchQuery.toLowerCase();

  return Promise.all(
    dataSources.map((source) =>
      Promise.resolve(
        source.filter((item) => {
          const value = (item as any)[searchField];
          return (
            typeof value === "string" &&
            value.toLowerCase().includes(query)
          );
        })
      )
    )
  );
}

/**
 * Batch validate items
 */
export async function batchValidate<T>(
  items: T[],
  validator: (item: T) => Promise<boolean>,
  onProgress?: (completed: number, total: number) => void
): Promise<{
  valid: T[];
  invalid: Array<{ item: T; index: number }>;
}> {
  const valid: T[] = [];
  const invalid: Array<{ item: T; index: number }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const isValid = await validator(item);
      if (isValid) {
        valid.push(item);
      } else {
        invalid.push({ item, index: i });
      }
    } catch (error) {
      invalid.push({ item, index: i });
    }
    onProgress?.(i + 1, items.length);
  }

  return { valid, invalid };
}

/**
 * Batch transform items
 */
export async function batchTransform<T, R>(
  items: T[],
  transformer: (item: T) => Promise<R>,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i++) {
    const result = await transformer(items[i]);
    results.push(result);
    onProgress?.(i + 1, items.length);
  }

  return results;
}

/**
 * Create a batch operation controller
 */
export class BatchController<T, R> {
  private queue: T[] = [];
  private isRunning = false;
  private batchSize = 10;
  private operation?: (items: T[]) => Promise<R[]>;

  setBatchSize(size: number): void {
    this.batchSize = size;
  }

  setOperation(op: (items: T[]) => Promise<R[]>): void {
    this.operation = op;
  }

  add(item: T): void {
    this.queue.push(item);
    if (this.queue.length >= this.batchSize) {
      this.process();
    }
  }

  addMultiple(items: T[]): void {
    this.queue.push(...items);
    if (this.queue.length >= this.batchSize) {
      this.process();
    }
  }

  async flush(): Promise<R[] | null> {
    if (this.queue.length === 0) return null;
    return await this.processBatch(this.queue.splice(0));
  }

  private async process(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processBatch(batch);
    }

    this.isRunning = false;
  }

  private async processBatch(batch: T[]): Promise<R[] | null> {
    if (!this.operation) return null;
    return await this.operation(batch);
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

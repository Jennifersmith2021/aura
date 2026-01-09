/**
 * Error recovery and retry utilities
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  timeout?: number;
  shouldRetry?: (error: Error) => boolean;
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelay = 100,
    maxDelay = 10000,
    backoffMultiplier = 2,
    jitter = true,
    timeout,
    shouldRetry = isRetryableError,
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelay;
  const startTime = Date.now();
  let attempts = 0;

  for (let i = 0; i <= maxRetries; i++) {
    attempts = i + 1;

    try {
      const data = await (timeout ? withTimeout(fn(), timeout) : fn());
      return {
        success: true,
        data,
        attempts,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries && shouldRetry(lastError)) {
        // Calculate next delay with optional jitter
        let nextDelay = delay * backoffMultiplier;
        if (jitter) {
          nextDelay *= 0.5 + Math.random();
        }
        delay = Math.min(nextDelay, maxDelay);

        await new Promise((resolve) => setTimeout(resolve, delay));
      } else if (i === maxRetries) {
        break;
      }
    }
  }

  return {
    success: false,
    error: lastError || new Error("Unknown error"),
    attempts,
    totalTime: Date.now() - startTime,
  };
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    /timeout/i,
    /network|connection/i,
    /ECONNREFUSED/i,
    /ENOTFOUND/i,
    /429/, // Rate limit
    /5\d{2}/, // 5xx errors
  ];

  return retryablePatterns.some((pattern) => {
    if (typeof pattern === "string") {
      return error.message.includes(pattern);
    }
    return pattern.test(error.message);
  });
}

/**
 * Wrap a promise with a timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Create a circuit breaker pattern
 */
export class CircuitBreaker<T> {
  private state: "closed" | "open" | "half-open" = "closed";
  private failureCount = 0;
  private successCount = 0;
  private failureThreshold: number;
  private successThreshold: number;
  private timeout: number;
  private nextAttemptTime = 0;

  constructor(
    failureThreshold = 5,
    successThreshold = 2,
    timeout = 60000
  ) {
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.timeout = timeout;
  }

  async execute(fn: () => Promise<T>): Promise<T> {
    // If open, check if we should try half-open
    if (this.state === "open") {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(
          `Circuit breaker is open. Next attempt at ${new Date(
            this.nextAttemptTime
          ).toISOString()}`
        );
      }
      this.state = "half-open";
    }

    try {
      const result = await fn();

      if (this.state === "half-open") {
        this.successCount++;
        if (this.successCount >= this.successThreshold) {
          this.state = "closed";
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;

      if (this.failureCount >= this.failureThreshold) {
        this.state = "open";
        this.nextAttemptTime = Date.now() + this.timeout;
        this.failureCount = 0;
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.successCount = 0;
  }
}

/**
 * Error handler with recovery strategies
 */
export class ErrorRecovery {
  private strategies: Map<string, (error: Error) => Promise<any>> = new Map();

  register(
    errorType: string,
    handler: (error: Error) => Promise<any>
  ): void {
    this.strategies.set(errorType, handler);
  }

  async recover(error: Error): Promise<any> {
    // Try specific handlers first
    for (const [pattern, handler] of this.strategies) {
      if (error.message.match(new RegExp(pattern, "i"))) {
        return await handler(error);
      }
    }

    // Fallback
    throw error;
  }
}

/**
 * Queue for async operations with retry support
 */
export class AsyncQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private concurrency: number;
  private activeCount = 0;

  constructor(concurrency = 1) {
    this.concurrency = concurrency;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.activeCount >= this.concurrency) {
      return;
    }

    this.isProcessing = true;
    this.activeCount++;

    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) {
        try {
          await fn();
        } catch (error) {
          console.error("Queue error:", error);
        }
      }
    }

    this.activeCount--;
    this.isProcessing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

/**
 * Create a fallback mechanism
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }
    return await fallback();
  }
}

/**
 * Deadletter queue for failed operations
 */
export class DeadletterQueue<T> {
  private items: Array<{ data: T; error: Error; timestamp: number }> = [];
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  add(data: T, error: Error): void {
    this.items.push({
      data,
      error,
      timestamp: Date.now(),
    });

    // Keep only recent items
    if (this.items.length > this.maxSize) {
      this.items = this.items.slice(-this.maxSize);
    }
  }

  getAll(): Array<{ data: T; error: Error; timestamp: number }> {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }

  export(): string {
    return JSON.stringify(this.items, null, 2);
  }
}

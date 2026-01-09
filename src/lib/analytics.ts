/**
 * Analytics tracking and reporting service
 */

interface PageView {
  page: string;
  timestamp: number;
  duration?: number;
  referrer?: string;
}

interface UserAction {
  action: string;
  category: string;
  value?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface AnalyticsReport {
  pageViews: number;
  uniquePages: string[];
  averageSessionDuration: number;
  actions: Map<string, number>;
  topPages: Array<{ page: string; views: number }>;
  topActions: Array<{ action: string; count: number }>;
  performanceMetrics: PerformanceMetric[];
}

/**
 * Analytics tracker
 */
export class AnalyticsTracker {
  private pageViews: PageView[] = [];
  private actions: UserAction[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private sessionStart = Date.now();
  private currentPage = "";
  private pageStartTime = Date.now();
  private maxRecords = 1000;

  trackPageView(page: string, referrer?: string): void {
    // Record previous page duration
    if (this.currentPage) {
      const lastView = this.pageViews[this.pageViews.length - 1];
      if (lastView && lastView.page === this.currentPage) {
        lastView.duration = Date.now() - this.pageStartTime;
      }
    }

    this.currentPage = page;
    this.pageStartTime = Date.now();

    this.pageViews.push({
      page,
      timestamp: Date.now(),
      referrer,
    });

    this.maintainMaxRecords();
  }

  trackAction(
    action: string,
    category: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    this.actions.push({
      action,
      category,
      value,
      timestamp: Date.now(),
      metadata,
    });

    this.maintainMaxRecords();
  }

  trackPerformance(name: string, value: number, unit = "ms"): void {
    this.performanceMetrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
    });

    this.maintainMaxRecords();
  }

  trackEvent(eventType: string, data: any): void {
    this.trackAction(eventType, "event", undefined, data);
  }

  generateReport(): AnalyticsReport {
    const uniquePages = [...new Set(this.pageViews.map((v) => v.page))];
    const actionMap = new Map<string, number>();
    const pageViews = new Map<string, number>();

    this.actions.forEach((action) => {
      actionMap.set(
        action.action,
        (actionMap.get(action.action) || 0) + 1
      );
    });

    this.pageViews.forEach((view) => {
      pageViews.set(view.page, (pageViews.get(view.page) || 0) + 1);
    });

    const topPages = Array.from(pageViews.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const topActions = Array.from(actionMap.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const avgSessionDuration =
      this.pageViews.reduce((sum, v) => sum + (v.duration || 0), 0) /
        Math.max(this.pageViews.length, 1);

    return {
      pageViews: this.pageViews.length,
      uniquePages,
      averageSessionDuration: avgSessionDuration,
      actions: actionMap,
      topPages,
      topActions,
      performanceMetrics: this.performanceMetrics,
    };
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  exportJson(): string {
    return JSON.stringify({
      pageViews: this.pageViews,
      actions: this.actions,
      performanceMetrics: this.performanceMetrics,
      sessionDuration: this.getSessionDuration(),
    }, null, 2);
  }

  clear(): void {
    this.pageViews = [];
    this.actions = [];
    this.performanceMetrics = [];
    this.sessionStart = Date.now();
  }

  private maintainMaxRecords(): void {
    if (this.pageViews.length > this.maxRecords) {
      this.pageViews = this.pageViews.slice(-this.maxRecords);
    }
    if (this.actions.length > this.maxRecords) {
      this.actions = this.actions.slice(-this.maxRecords);
    }
  }
}

/**
 * Singleton instance
 */
export const analyticsTracker = new AnalyticsTracker();

/**
 * Web Vitals tracker
 */
export class WebVitalsTracker {
  private metrics: Map<string, PerformanceMetric> = new Map();

  trackLCP(): void {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric("LCP", lastEntry.renderTime || lastEntry.loadTime);
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    }
  }

  trackFID(): void {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const processingTime = (entry as any).processingDuration;
          this.recordMetric("FID", processingTime);
        });
      });

      observer.observe({ entryTypes: ["first-input"] });
    }
  }

  trackCLS(): void {
    let clsValue = 0;

    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.recordMetric("CLS", clsValue);
          }
        });
      });

      observer.observe({ entryTypes: ["layout-shift"] });
    }
  }

  trackFCP(): void {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    this.recordMetric("FCP", pageLoadTime);
  }

  private recordMetric(name: string, value: number): void {
    this.metrics.set(name, {
      name,
      value,
      unit: "ms",
      timestamp: Date.now(),
    });

    analyticsTracker.trackPerformance(name, value);
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }
}

export const webVitalsTracker = new WebVitalsTracker();

/**
 * User behavior analyzer
 */
export class UserBehaviorAnalyzer {
  private sessionEvents: UserAction[] = [];
  private sessionStart = Date.now();

  recordInteraction(type: string, element: string, metadata?: any): void {
    this.sessionEvents.push({
      action: type,
      category: `interaction:${element}`,
      timestamp: Date.now(),
      metadata,
    });
  }

  recordError(error: Error, context?: string): void {
    this.sessionEvents.push({
      action: "error",
      category: "error",
      timestamp: Date.now(),
      metadata: {
        message: error.message,
        stack: error.stack,
        context,
      },
    });
  }

  recordFormSubmission(formName: string, fields: string[]): void {
    this.sessionEvents.push({
      action: "form_submit",
      category: "form",
      timestamp: Date.now(),
      metadata: {
        formName,
        fieldCount: fields.length,
      },
    });
  }

  recordSearch(query: string, resultCount: number): void {
    this.sessionEvents.push({
      action: "search",
      category: "search",
      value: resultCount,
      timestamp: Date.now(),
      metadata: { query },
    });
  }

  getSessionAnalysis(): {
    duration: number;
    eventCount: number;
    errorCount: number;
    interactions: number;
    avgTimeBetweenEvents: number;
  } {
    const duration = Date.now() - this.sessionStart;
    const errorCount = this.sessionEvents.filter((e) => e.category === "error").length;
    const interactions = this.sessionEvents.filter((e) => e.category.startsWith("interaction")).length;
    const avgTimeBetweenEvents =
      this.sessionEvents.length > 1
        ? duration / this.sessionEvents.length
        : 0;

    return {
      duration,
      eventCount: this.sessionEvents.length,
      errorCount,
      interactions,
      avgTimeBetweenEvents,
    };
  }

  clear(): void {
    this.sessionEvents = [];
    this.sessionStart = Date.now();
  }
}

export const userBehaviorAnalyzer = new UserBehaviorAnalyzer();

/**
 * Feature usage tracker
 */
export class FeatureUsageTracker {
  private usage: Map<string, { count: number; lastUsed: number }> = new Map();

  trackFeatureUse(featureName: string): void {
    const current = this.usage.get(featureName) || { count: 0, lastUsed: 0 };
    current.count++;
    current.lastUsed = Date.now();
    this.usage.set(featureName, current);
  }

  getFeatureStats(featureName: string): { count: number; lastUsed: number } | null {
    return this.usage.get(featureName) || null;
  }

  getMostUsedFeatures(limit = 10): Array<{ feature: string; count: number }> {
    return Array.from(this.usage.entries())
      .map(([feature, { count }]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getLeastUsedFeatures(limit = 10): Array<{ feature: string; count: number }> {
    return Array.from(this.usage.entries())
      .map(([feature, { count }]) => ({ feature, count }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => a.count - b.count)
      .slice(0, limit);
  }

  getUnusedFeatures(allFeatures: string[]): string[] {
    return allFeatures.filter((f) => !this.usage.has(f));
  }
}

export const featureUsageTracker = new FeatureUsageTracker();

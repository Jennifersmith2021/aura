/**
 * Real-time notifications service
 */

export interface NotificationEvent {
  id: string;
  type:
    | "achievement"
    | "goal"
    | "reminder"
    | "alert"
    | "milestone"
    | "update"
    | "error";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  icon?: string;
  priority?: "low" | "medium" | "high";
  metadata?: Record<string, any>;
}

type NotificationCallback = (event: NotificationEvent) => void;

/**
 * Event emitter for notifications
 */
export class NotificationService {
  private listeners: Map<string, Set<NotificationCallback>> = new Map();
  private notifications: Map<string, NotificationEvent> = new Map();
  private maxNotifications = 100;

  subscribe(type: string, callback: NotificationCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  subscribeAll(callback: NotificationCallback): () => void {
    return this.subscribe("*", callback);
  }

  emit(event: NotificationEvent): void {
    // Store notification
    if (this.notifications.size >= this.maxNotifications) {
      const oldestId = Array.from(this.notifications.entries())[0][0];
      this.notifications.delete(oldestId);
    }
    this.notifications.set(event.id, event);

    // Notify specific type listeners
    this.listeners.get(event.type)?.forEach((callback) => callback(event));

    // Notify all listeners
    this.listeners.get("*")?.forEach((callback) => callback(event));

    // Persist to localStorage
    this.persist();
  }

  notify(
    type: NotificationEvent["type"],
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const event: NotificationEvent = {
      id,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      metadata,
    };

    this.emit(event);
    return id;
  }

  markAsRead(id: string): void {
    const event = this.notifications.get(id);
    if (event) {
      event.read = true;
      this.persist();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((event) => {
      event.read = true;
    });
    this.persist();
  }

  getAll(): NotificationEvent[] {
    return Array.from(this.notifications.values());
  }

  getUnread(): NotificationEvent[] {
    return Array.from(this.notifications.values()).filter((n) => !n.read);
  }

  getByType(type: string): NotificationEvent[] {
    return Array.from(this.notifications.values()).filter((n) => n.type === type);
  }

  remove(id: string): void {
    this.notifications.delete(id);
    this.persist();
  }

  clear(): void {
    this.notifications.clear();
    this.persist();
  }

  private persist(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("notifications", JSON.stringify(Array.from(this.notifications.values())));
    }
  }

  restore(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        try {
          const notifications = JSON.parse(stored) as NotificationEvent[];
          notifications.forEach((n) => {
            this.notifications.set(n.id, n);
          });
        } catch (error) {
          console.error("Failed to restore notifications:", error);
        }
      }
    }
  }
}

/**
 * Create singleton instance
 */
export const notificationService = new NotificationService();

/**
 * Browser notification handler
 */
export class BrowserNotificationManager {
  private enabled = false;

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("Browser notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      this.enabled = true;
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.enabled = permission === "granted";
      return this.enabled;
    }

    return false;
  }

  notify(title: string, options?: NotificationOptions): Notification | null {
    if (!this.enabled || !("Notification" in window)) {
      return null;
    }

    return new Notification(title, options);
  }

  isEnabled(): boolean {
    return this.enabled && "Notification" in window;
  }
}

/**
 * Scheduled notification triggers
 */
export class ScheduledNotifications {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  scheduleOnce(
    id: string,
    delay: number,
    callback: () => void
  ): void {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, delay);

    this.timers.set(id, timer);
  }

  scheduleRepeating(
    id: string,
    interval: number,
    callback: () => void
  ): void {
    const timer = setInterval(callback, interval);
    this.timers.set(id, timer);
  }

  scheduleDaily(
    id: string,
    time: string,
    callback: () => void
  ): void {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0);

    // If scheduled time has passed today, schedule for tomorrow
    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const delay = scheduled.getTime() - now.getTime();

    // First trigger
    this.scheduleOnce(`${id}_first`, delay, callback);

    // Then repeat daily
    const dailyTimer = setInterval(callback, 24 * 60 * 60 * 1000);
    this.timers.set(`${id}_repeat`, dailyTimer);
  }

  cancel(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  cancelAll(): void {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.timers.clear();
  }

  getScheduled(): string[] {
    return Array.from(this.timers.keys());
  }
}

export const scheduledNotifications = new ScheduledNotifications();

/**
 * Achievement notification builder
 */
export class AchievementNotifier {
  static milestone(name: string, value: number, unit: string): void {
    notificationService.notify(
      "milestone",
      "🎉 New Milestone!",
      `You've reached ${value} ${unit} on ${name}!`,
      { milestone: { name, value, unit } }
    );
  }

  static streak(days: number): void {
    notificationService.notify(
      "achievement",
      "🔥 Streak Milestone!",
      `Amazing! You've kept up a ${days}-day streak!`,
      { streak: days }
    );
  }

  static goal(goalName: string): void {
    notificationService.notify(
      "goal",
      "🎯 Goal Achieved!",
      `Congratulations! You've completed: ${goalName}`,
      { goal: goalName }
    );
  }

  static progress(name: string, percent: number): void {
    if (percent === 25 || percent === 50 || percent === 75 || percent === 100) {
      notificationService.notify(
        "update",
        `Progress Update`,
        `${name} is ${percent}% complete!`,
        { progress: percent }
      );
    }
  }
}

/**
 * Reminder notification builder
 */
export class ReminderNotifier {
  static reminder(title: string, message: string, actionUrl?: string): void {
    notificationService.notify("reminder", title, message, { actionUrl });
  }

  static supplement(supplement: string, time: string): void {
    this.reminder(
      "💊 Supplement Reminder",
      `Time to take ${supplement}`,
      undefined
    );
  }

  static workout(type: string): void {
    this.reminder(
      "💪 Workout Time",
      `Ready for your ${type} session?`,
      undefined
    );
  }

  static dailyAffirmation(affirmation: string): void {
    this.reminder(
      "✨ Daily Affirmation",
      affirmation,
      undefined
    );
  }
}

/**
 * Alert notification builder
 */
export class AlertNotifier {
  static warning(title: string, message: string): void {
    notificationService.notify("alert", title, message, { priority: "medium" });
  }

  static error(title: string, message: string): void {
    notificationService.notify("error", title, message, { priority: "high" });
  }

  static info(title: string, message: string): void {
    notificationService.notify("update", title, message, { priority: "low" });
  }

  static expiringProduct(product: string, daysLeft: number): void {
    this.warning(
      "⏰ Product Expiring Soon",
      `${product} expires in ${daysLeft} days!`
    );
  }

  static lowStock(item: string): void {
    this.warning(
      "📉 Low Stock",
      `You're running low on ${item}`
    );
  }
}

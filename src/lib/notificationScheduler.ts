// Service Worker registration utility

export async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/service-worker.js", {
                scope: "/"
            });
            console.log("Service Worker registered successfully:", registration);

            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute

            return registration;
        } catch (error) {
            console.warn("Service Worker registration failed:", error);
        }
    }
}

export function scheduleNotification(title: string, options?: NotificationOptions) {
    if ("Notification" in window && Notification.permission === "granted") {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: "SHOW_NOTIFICATION",
                title,
                options
            });
        } else {
            // Fallback for when service worker isn't active
            new Notification(title, options);
        }
    }
}

export function setupNotificationScheduler() {
    if ("Notification" in window && "serviceWorker" in navigator) {
        // Request notification permission
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }

        // Set up periodic checks
        setInterval(() => {
            checkAndScheduleNotifications();
        }, 60000); // Check every minute

        // Check immediately on setup
        checkAndScheduleNotifications();
    }
}

function checkAndScheduleNotifications() {
    const settings = localStorage.getItem("notificationSettings");
    if (!settings) return;

    try {
        const config = JSON.parse(settings);
        if (!config.enabled) return;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const currentDay = now.getDay();

        // Morning Affirmation
        if (config.morningAffirmation.enabled && currentTime === config.morningAffirmation.time) {
            scheduleNotification("Good morning! 💕", {
                body: "Time for your daily affirmations. You are beautiful and worthy!",
                icon: "/icon-192.png",
                badge: "/icon-192.png"
            });
        }

        // Workout Reminder
        if (
            config.workoutReminder.enabled &&
            currentTime === config.workoutReminder.time &&
            config.workoutReminder.dayOfWeek.includes(currentDay)
        ) {
            scheduleNotification("Time to work out! 💪", {
                body: "Let's get those endorphins flowing!",
                icon: "/icon-192.png",
                badge: "/icon-192.png"
            });
        }

        // Evening Goal Check-In
        if (config.goalCheckIn.enabled && currentTime === config.goalCheckIn.time) {
            scheduleNotification("Evening goal check-in 📊", {
                body: "How did you do today? Review your progress and plan tomorrow!",
                icon: "/icon-192.png",
                badge: "/icon-192.png"
            });
        }

        // Supplement Reminder
        if (config.supplementReminder.enabled && currentTime === config.supplementReminder.time) {
            scheduleNotification("Time for your supplements! 💊", {
                body: "Stay consistent with your supplement routine",
                icon: "/icon-192.png",
                badge: "/icon-192.png"
            });
        }
    } catch (error) {
        console.error("Error checking notifications:", error);
    }
}

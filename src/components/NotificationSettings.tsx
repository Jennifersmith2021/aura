"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Trash2, Clock, ToggleLeft, ToggleRight } from "lucide-react";

interface NotificationSettings {
    enabled: boolean;
    morningAffirmation: {
        enabled: boolean;
        time: string; // HH:MM format
    };
    workoutReminder: {
        enabled: boolean;
        time: string;
        dayOfWeek: number[]; // 0-6, 0=Sunday
    };
    goalCheckIn: {
        enabled: boolean;
        time: string;
    };
    supplementReminder: {
        enabled: boolean;
        time: string;
    };
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    morningAffirmation: { enabled: true, time: "07:00" },
    workoutReminder: { enabled: true, time: "18:00", dayOfWeek: [1, 3, 5] },
    goalCheckIn: { enabled: true, time: "21:00" },
    supplementReminder: { enabled: true, time: "08:00" }
};

export function NotificationSettings() {
    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("notificationSettings");
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch {
                setSettings(DEFAULT_SETTINGS);
            }
        }
        setLoaded(true);
    }, []);

    // Save settings to localStorage
    const saveSettings = useCallback((newSettings: NotificationSettings) => {
        setSettings(newSettings);
        localStorage.setItem("notificationSettings", JSON.stringify(newSettings));
        
        // Request notification permission
        if (newSettings.enabled && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const toggleMasterSwitch = useCallback(() => {
        const newSettings = { ...settings, enabled: !settings.enabled };
        saveSettings(newSettings);
    }, [settings, saveSettings]);

    const updateTime = useCallback((key: keyof NotificationSettings, time: string) => {
        const newSettings = { ...settings };
        if (typeof newSettings[key] === "object" && key !== "workoutReminder") {
            (newSettings[key] as any).time = time;
        }
        saveSettings(newSettings);
    }, [settings, saveSettings]);

    const toggleFeature = useCallback((key: keyof NotificationSettings) => {
        const newSettings = { ...settings };
        if (typeof newSettings[key] === "object") {
            (newSettings[key] as any).enabled = !(newSettings[key] as any).enabled;
        }
        saveSettings(newSettings);
    }, [settings, saveSettings]);

    if (!loaded) return null;

    return (
        <div className="space-y-4">
            {/* Master Toggle */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    <div>
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-xs text-muted-foreground">Enable all reminders and notifications</p>
                    </div>
                </div>
                <button
                    onClick={toggleMasterSwitch}
                    className="text-2xl transition"
                >
                    {settings.enabled ? "✓" : "✗"}
                </button>
            </div>

            {settings.enabled && (
                <>
                    {/* Morning Affirmation */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <h4 className="font-semibold text-sm">Morning Affirmation</h4>
                            </div>
                            <button
                                onClick={() => toggleFeature("morningAffirmation")}
                                className="text-lg transition"
                            >
                                {settings.morningAffirmation.enabled ? "✓" : "✗"}
                            </button>
                        </div>
                        {settings.morningAffirmation.enabled && (
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">
                                    Notification time
                                </label>
                                <input
                                    type="time"
                                    value={settings.morningAffirmation.time}
                                    onChange={(e) => updateTime("morningAffirmation", e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Workout Reminder */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <h4 className="font-semibold text-sm">Workout Reminder</h4>
                            </div>
                            <button
                                onClick={() => toggleFeature("workoutReminder")}
                                className="text-lg transition"
                            >
                                {settings.workoutReminder.enabled ? "✓" : "✗"}
                            </button>
                        </div>
                        {settings.workoutReminder.enabled && (
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">
                                        Notification time
                                    </label>
                                    <input
                                        type="time"
                                        value={settings.workoutReminder.time}
                                        onChange={(e) => updateTime("workoutReminder", e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">
                                        Days: {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                                            .map((d, i) => settings.workoutReminder.dayOfWeek.includes(i) ? d : null)
                                            .filter(Boolean)
                                            .join(", ")}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Goal Check-In */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-500" />
                                <h4 className="font-semibold text-sm">Evening Goal Check-In</h4>
                            </div>
                            <button
                                onClick={() => toggleFeature("goalCheckIn")}
                                className="text-lg transition"
                            >
                                {settings.goalCheckIn.enabled ? "✓" : "✗"}
                            </button>
                        </div>
                        {settings.goalCheckIn.enabled && (
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">
                                    Notification time
                                </label>
                                <input
                                    type="time"
                                    value={settings.goalCheckIn.time}
                                    onChange={(e) => updateTime("goalCheckIn", e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Supplement Reminder */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-500" />
                                <h4 className="font-semibold text-sm">Supplement Reminder</h4>
                            </div>
                            <button
                                onClick={() => toggleFeature("supplementReminder")}
                                className="text-lg transition"
                            >
                                {settings.supplementReminder.enabled ? "✓" : "✗"}
                            </button>
                        </div>
                        {settings.supplementReminder.enabled && (
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">
                                    Notification time
                                </label>
                                <input
                                    type="time"
                                    value={settings.supplementReminder.time}
                                    onChange={(e) => updateTime("supplementReminder", e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

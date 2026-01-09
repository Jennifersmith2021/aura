"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Activity, Target } from "lucide-react";
import { useStore } from "@/hooks/useStore";

interface Analytics {
    totalItems: number;
    totalLooks: number;
    totalWorkouts: number;
    totalSupplements: number;
    totalMeasurements: number;
    workoutStreak: number;
    supplementStreak: number;
    avgWorkoutDuration: number;
    favoriteWorkout: string | null;
    mostUsedItem: string | null;
    progressTrend: "improving" | "stable" | "declining";
}

export function AnalyticsDashboard() {
    const store = useStore();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    useEffect(() => {
        // Calculate analytics from store data
        if (!store.items) return;

        // Count workouts in last 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentWorkouts = (store.workoutSessions || []).filter(
            (s: any) => s.date && new Date(s.date).getTime() > sevenDaysAgo
        );

        // Calculate average workout duration
        const avgDuration = recentWorkouts.length > 0
            ? recentWorkouts.reduce((sum: number, s: any) => sum + (s.durationMinutes || 0), 0) / recentWorkouts.length
            : 0;

        // Find most used item
        const looks = store.looks || [];
        const itemUsage = new Map<string, number>();
        looks.forEach((look: any) => {
            (look.items || []).forEach((itemId: string) => {
                itemUsage.set(itemId, (itemUsage.get(itemId) || 0) + 1);
            });
        });
        const mostUsedItemId = itemUsage.size > 0
            ? Array.from(itemUsage.entries()).sort((a, b) => b[1] - a[1])[0][0]
            : null;
        const mostUsedItem = mostUsedItemId
            ? store.items.find((i: any) => i.id === mostUsedItemId)?.name || null
            : null;

        // Calculate supplement streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let supplementStreak = 0;
        const supplements = store.supplements || [];
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const hasSupplementThatDay = supplements.some((s: any) => {
                const sDate = new Date(s.dateAdded || s.lastTaken || 0);
                sDate.setHours(0, 0, 0, 0);
                return sDate.getTime() === checkDate.getTime();
            });
            if (hasSupplementThatDay) {
                supplementStreak++;
            } else {
                break;
            }
        }

        // Calculate progress trend
        const measurements = store.measurements || [];
        let progressTrend: "improving" | "stable" | "declining" = "stable";
        if (measurements.length >= 2) {
            const latest = measurements[measurements.length - 1];
            const previous = measurements[measurements.length - 2];
            const latestWaist = latest?.values?.waist || 0;
            const previousWaist = previous?.values?.waist || 0;
            if (latestWaist < previousWaist) {
                progressTrend = "improving";
            } else if (latestWaist > previousWaist) {
                progressTrend = "declining";
            }
        }

        setAnalytics({
            totalItems: store.items.length,
            totalLooks: looks.length,
            totalWorkouts: recentWorkouts.length,
            totalSupplements: supplements.length,
            totalMeasurements: measurements.length,
            workoutStreak: recentWorkouts.length > 0 ? 7 : 0,
            supplementStreak,
            avgWorkoutDuration: Math.round(avgDuration),
            favoriteWorkout: null, // Can be calculated from workoutSessions
            mostUsedItem,
            progressTrend
        });
    }, [store]);

    if (!analytics) return null;

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case "improving":
                return "text-green-500";
            case "declining":
                return "text-red-500";
            default:
                return "text-blue-500";
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {/* Total Items */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {analytics.totalItems}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Closet Items</p>
                </div>

                {/* Total Looks */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {analytics.totalLooks}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Outfit Looks</p>
                </div>

                {/* Recent Workouts */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {analytics.totalWorkouts}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Workouts (7d)</p>
                </div>

                {/* Supplements */}
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {analytics.supplementStreak}d
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Supplement Streak</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Workout Duration</span>
                    <span className="font-semibold">{analytics.avgWorkoutDuration} min</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Measurements</span>
                    <span className="font-semibold">{analytics.totalMeasurements}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className={`font-semibold capitalize ${getTrendColor(analytics.progressTrend)}`}>
                        {analytics.progressTrend === "improving" ? "📈 Improving" : analytics.progressTrend === "declining" ? "📉 Declining" : "→ Stable"}
                    </span>
                </div>
            </div>

            {/* Most Used Item */}
            {analytics.mostUsedItem && (
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">Most Used Item</p>
                    <p className="font-semibold truncate">{analytics.mostUsedItem}</p>
                </div>
            )}
        </div>
    );
}

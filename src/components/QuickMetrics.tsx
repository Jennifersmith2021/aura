"use client";

import { useStore } from "@/hooks/useStore";
import { TrendingDown, Activity, Calendar, Target } from "lucide-react";
import { useState, useEffect } from "react";

export function QuickMetrics() {
    const { measurements, workoutSessions, supplements } = useStore();
    const [stats, setStats] = useState({
        latestWeight: 0,
        latestWaist: 0,
        thisWeekWorkouts: 0,
        supplementStreak: 0,
    });

    useEffect(() => {
        const latest = measurements[0];
        const weight = latest?.values?.weight || 0;
        const waist = latest?.values?.waist || 0;

        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const weekWorkouts = workoutSessions?.filter(s => s.date > oneWeekAgo).length || 0;

        let streak = 0;
        if (supplements && supplements.length > 0) {
            const sortedByDate = [...supplements].sort((a, b) => b.date - a.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < sortedByDate.length; i++) {
                const logDate = new Date(sortedByDate[i].date);
                logDate.setHours(0, 0, 0, 0);
                const daysBack = Math.floor((today.getTime() - logDate.getTime()) / (24 * 60 * 60 * 1000));
                if (daysBack === i) streak++;
                else break;
            }
        }

        setStats({
            latestWeight: weight,
            latestWaist: waist,
            thisWeekWorkouts: weekWorkouts,
            supplementStreak: streak,
        });
    }, [measurements, workoutSessions, supplements]);

    const metrics = [
        {
            label: "Workouts This Week",
            value: stats.thisWeekWorkouts,
            unit: "sessions",
            icon: Activity,
            color: "from-blue-500 to-cyan-500",
        },
        {
            label: "Current Waist",
            value: stats.latestWaist ? stats.latestWaist.toFixed(1) : "—",
            unit: "in",
            icon: Target,
            color: "from-pink-500 to-rose-500",
        },
        {
            label: "Supplement Streak",
            value: stats.supplementStreak,
            unit: "days",
            icon: Calendar,
            color: "from-green-500 to-emerald-500",
        },
        {
            label: "Weight",
            value: stats.latestWeight ? stats.latestWeight.toFixed(1) : "—",
            unit: "lbs",
            icon: TrendingDown,
            color: "from-purple-500 to-violet-500",
        },
    ];

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">Quick Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {metrics.map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                        <div
                            key={idx}
                            className={`bg-gradient-to-br ${metric.color} p-4 rounded-xl text-white shadow-lg`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white/80 text-xs font-medium">{metric.label}</span>
                                <Icon className="w-4 h-4 opacity-60" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{metric.value}</p>
                                <p className="text-xs text-white/70">{metric.unit}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

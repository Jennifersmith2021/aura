"use client";

import { useStore } from "@/hooks/useStore";
import { TrendingUp, Calendar, Flame, Target, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

/**
 * Quick Stats Widget - Shows key metrics at a glance
 * Perfect for home dashboard or any page needing quick overview
 */
export function QuickStatsWidget() {
    const {
        measurements,
        workoutSessions,
        corsetSessions,
        chastitySessions,
        sissyGoals,
        items,
        looks,
    } = useStore();

    const stats = useMemo(() => {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

        // Latest measurements
        const latestMeasurement = measurements[0];
        const waist = latestMeasurement?.values?.waist;
        const goalWaist = latestMeasurement?.goalWaist;

        // Active streaks
        const activeChastity = chastitySessions?.find(s => !s.endDate);
        const chastityDays = activeChastity
            ? Math.floor((now - activeChastity.startDate) / (1000 * 60 * 60 * 24))
            : 0;

        // Workouts this week
        const weekWorkouts = workoutSessions?.filter(s => s.date > weekAgo).length || 0;

        // Corset hours this month
        const monthCorsetHours = corsetSessions
            ?.filter(s => s.startDate > monthAgo && s.endDate)
            .reduce((total, s) => {
                const duration = (s.endDate! - s.startDate) / (1000 * 60 * 60);
                return total + duration;
            }, 0) || 0;

        // Completed goals
        const completedGoals = sissyGoals?.filter(g => g.completed).length || 0;
        const totalGoals = sissyGoals?.length || 0;

        // Wardrobe stats
        const totalItems = items?.length || 0;
        const totalLooks = looks?.length || 0;

        return {
            waist,
            goalWaist,
            waistProgress: waist && goalWaist ? ((goalWaist / waist) * 100).toFixed(0) : null,
            chastityDays,
            weekWorkouts,
            monthCorsetHours: monthCorsetHours.toFixed(1),
            completedGoals,
            totalGoals,
            goalProgress: totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(0) : 0,
            totalItems,
            totalLooks,
        };
    }, [measurements, workoutSessions, corsetSessions, chastitySessions, sissyGoals, items, looks]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Quick Stats</h2>
                <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Waist Progress */}
                {stats.waist && stats.goalWaist && (
                    <Link href="/studio?tab=stats">
                        <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-4 hover:border-pink-500/40 transition-all cursor-pointer">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-pink-500" />
                                <span className="text-xs font-medium text-muted-foreground">Waist Goal</span>
                            </div>
                            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                {stats.waist}"
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-white/50 dark:bg-black/20 rounded-full h-1.5">
                                    <div
                                        className="bg-pink-500 h-1.5 rounded-full"
                                        style={{ width: `${stats.waistProgress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">{stats.waistProgress}%</span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Chastity Streak */}
                {stats.chastityDays > 0 && (
                    <Link href="/studio?tab=love">
                        <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all cursor-pointer">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-medium text-muted-foreground">Chastity</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {stats.chastityDays}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">days locked</p>
                        </div>
                    </Link>
                )}

                {/* Workouts This Week */}
                <Link href="/training/workouts">
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-muted-foreground">This Week</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.weekWorkouts}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">workouts</p>
                    </div>
                </Link>

                {/* Corset Training Hours */}
                {stats.monthCorsetHours !== '0.0' && (
                    <Link href="/wellness">
                        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all cursor-pointer">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-medium text-muted-foreground">Corset Hours</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {stats.monthCorsetHours}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">this month</p>
                        </div>
                    </Link>
                )}

                {/* Goals Progress */}
                {stats.totalGoals > 0 && (
                    <Link href="/sissy">
                        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all cursor-pointer">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium text-muted-foreground">Goals</span>
                            </div>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {stats.completedGoals}/{stats.totalGoals}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-white/50 dark:bg-black/20 rounded-full h-1.5">
                                    <div
                                        className="bg-emerald-500 h-1.5 rounded-full"
                                        style={{ width: `${stats.goalProgress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">{stats.goalProgress}%</span>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Secondary Stats Bar */}
            <div className="flex items-center justify-between bg-background/50 border border-border rounded-lg p-3 text-sm">
                <Link href="/closet" className="hover:text-primary transition-colors">
                    <span className="text-muted-foreground">Closet: </span>
                    <span className="font-semibold">{stats.totalItems} items</span>
                </Link>
                <div className="w-px h-4 bg-border" />
                <Link href="/studio?tab=looks" className="hover:text-primary transition-colors">
                    <span className="text-muted-foreground">Looks: </span>
                    <span className="font-semibold">{stats.totalLooks}</span>
                </Link>
            </div>
        </div>
    );
}

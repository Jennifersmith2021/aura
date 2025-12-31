"use client";

import { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { Flame, Target, Zap } from "lucide-react";

export interface DailyHabit {
    id: string;
    name: string;
    emoji: string;
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate?: number;
}

export function StreakTracker() {
    const { 
        workoutSessions, 
        dailyAffirmations, 
        supplements,
        chastitySessions 
    } = useStore();

    // Calculate streaks based on logged activities
    const habits = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        // Workout streak
        const workoutDates = new Set(
            workoutSessions.map((s) => {
                const d = new Date(s.dateLogged ?? 0);
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            })
        );
        const workoutStreak = calculateStreak(workoutDates, today);

        // Affirmation streak (using daily affirmations)
        const affirmationDates = new Set(
            dailyAffirmations.map((a) => {
                const d = new Date(a.dateLogged ?? 0);
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            })
        );
        const affirmationStreak = calculateStreak(affirmationDates, today);

        // Supplement streak
        const supplementDates = new Set(
            supplements.map((s) => {
                const d = new Date(s.dateLogged ?? 0);
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            })
        );
        const supplementStreak = calculateStreak(supplementDates, today);

        // Chastity status
        const activeLock = chastitySessions.find((c) => !c.endDate);
        const chastityCurrent = activeLock ? Math.floor((Date.now() - (activeLock.startDate ?? 0)) / (1000 * 60 * 60 * 24)) : 0;

        return [
            {
                id: "workout",
                name: "Workouts",
                emoji: "💪",
                currentStreak: workoutStreak,
                longestStreak: Math.max(...Array.from(workoutDates).map((_, i, arr) => calculateStreak(new Set(arr.slice(0, i + 1)), today)), 0),
                lastCompletedDate: workoutSessions[workoutSessions.length - 1]?.dateLogged,
            },
            {
                id: "affirmation",
                name: "Affirmations",
                emoji: "✨",
                currentStreak: affirmationStreak,
                longestStreak: Math.max(...Array.from(affirmationDates).map((_, i, arr) => calculateStreak(new Set(arr.slice(0, i + 1)), today)), 0),
                lastCompletedDate: dailyAffirmations[dailyAffirmations.length - 1]?.dateLogged,
            },
            {
                id: "supplement",
                name: "Supplements",
                emoji: "💊",
                currentStreak: supplementStreak,
                longestStreak: Math.max(...Array.from(supplementDates).map((_, i, arr) => calculateStreak(new Set(arr.slice(0, i + 1)), today)), 0),
                lastCompletedDate: supplements[supplements.length - 1]?.dateLogged,
            },
            {
                id: "chastity",
                name: "Chastity Lock",
                emoji: "🔐",
                currentStreak: chastityCurrent,
                longestStreak: chastityCurrent, // Simplified for active session
                lastCompletedDate: activeLock?.startDate,
            },
        ] as DailyHabit[];
    }, [workoutSessions, dailyAffirmations, supplements, chastitySessions]);

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    Your Streaks
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Keep your fire burning! 🔥</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {habits.map((habit) => (
                    <StreakCard key={habit.id} habit={habit} />
                ))}
            </div>

            {habits.every((h) => h.currentStreak === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Start your first streak today! Log your first activity. 💫</p>
                </div>
            )}
        </div>
    );
}

function StreakCard({ habit }: { habit: DailyHabit }) {
    return (
        <div className="bg-gradient-to-r from-muted to-muted/50 border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl">{habit.emoji}</div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {habit.currentStreak > 0 ? `${habit.currentStreak} days in a row!` : "Start your streak"}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2">
                        {habit.currentStreak > 0 && (
                            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                <Flame className="w-4 h-4 text-orange-600" />
                                <span className="font-bold text-sm text-orange-700">{habit.currentStreak}</span>
                            </div>
                        )}
                    </div>
                    {habit.longestStreak > 0 && habit.longestStreak !== habit.currentStreak && (
                        <p className="text-xs text-muted-foreground mt-1">Best: {habit.longestStreak} days</p>
                    )}
                </div>
            </div>

            {/* Streak visualization (last 7 days) */}
            <div className="flex gap-1 mt-3">
                {Array.from({ length: 7 }).map((_, i) => {
                    const dayOffset = 6 - i;
                    const dayDate = new Date();
                    dayDate.setDate(dayDate.getDate() - dayOffset);
                    const dayTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()).getTime();
                    
                    // This is simplified - in reality you'd check if this habit was completed that day
                    const isCompleted = habit.currentStreak > 0 && dayOffset < habit.currentStreak;
                    
                    return (
                        <div
                            key={i}
                            className={`flex-1 h-8 rounded-md transition ${
                                isCompleted
                                    ? "bg-green-500 shadow-md"
                                    : "bg-muted-foreground/20"
                            }`}
                            title={dayDate.toLocaleDateString("en-US", { weekday: "short" })}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// Helper to calculate streak length
function calculateStreak(dates: Set<number>, today: number): number {
    if (dates.size === 0) return 0;

    let current = today;
    let streak = 0;

    while (dates.has(current)) {
        streak++;
        current -= 24 * 60 * 60 * 1000;
    }

    return streak;
}

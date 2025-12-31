"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarRange, Flame } from "lucide-react";
import clsx from "clsx";

interface DailyScheduleProgress {
    date: string;
    completedTasks: string[];
}

interface SkincareProgress {
    date: string;
    morningCompleted: string[];
    eveningCompleted: string[];
}

const daysToShow = 7;

export default function DailyProgressSummary() {
    const [scheduleHistory, setScheduleHistory] = useState<DailyScheduleProgress[]>([]);
    const [skincareHistory, setSkincareHistory] = useState<SkincareProgress[]>([]);

    useEffect(() => {
        const scheduleRaw = localStorage.getItem("dailyScheduleHistory");
        const skincareRaw = localStorage.getItem("skincareHistory");

        if (scheduleRaw) {
            setScheduleHistory(JSON.parse(scheduleRaw));
        }
        if (skincareRaw) {
            setSkincareHistory(JSON.parse(skincareRaw));
        }
    }, []);

    const stats = useMemo(() => {
        const recentSchedule = scheduleHistory.slice(0, daysToShow);
        const essentialIds = ["morning-skincare", "evening-skincare"];

        let bestStreak = 0;
        let currentStreak = 0;
        const lastDate = new Date();

        // Calculate streak based on essential completion (>=70% already captured by component, but here we require both skincare tasks)
        for (let i = 0; i < scheduleHistory.length; i++) {
            const checkDate = new Date();
            checkDate.setDate(lastDate.getDate() - i);
            const dateStr = checkDate.toDateString();
            const day = scheduleHistory.find((d) => d.date === dateStr);

            const essentialDone = day
                ? essentialIds.every((id) => day.completedTasks.includes(id))
                : false;

            if (essentialDone) {
                currentStreak += 1;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                break;
            }
        }

        const averageTasks = recentSchedule.length
            ? Math.round(
                  recentSchedule.reduce((sum, day) => sum + day.completedTasks.length, 0) /
                      recentSchedule.length
              )
            : 0;

        const skincareRecent = skincareHistory.slice(0, daysToShow);
        const skincareConsistency = skincareRecent.length
            ? Math.round(
                  (skincareRecent.filter(
                      (d) => d.morningCompleted.length > 0 && d.eveningCompleted.length > 0
                  ).length /
                      skincareRecent.length) *
                      100
              )
            : 0;

        const scheduleConsistency = recentSchedule.length
            ? Math.round(
                  (recentSchedule.filter((d) => d.completedTasks.length > 0).length /
                      recentSchedule.length) *
                      100
              )
            : 0;

        return { bestStreak, averageTasks, skincareConsistency, scheduleConsistency };
    }, [scheduleHistory, skincareHistory]);

    const chartDays = useMemo(() => {
        const days: { label: string; value: number }[] = [];
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const label = date.toLocaleDateString(undefined, { weekday: "short" });
            const day = scheduleHistory.find((d) => d.date === date.toDateString());
            const value = day ? day.completedTasks.length : 0;
            days.push({ label, value });
        }
        return days;
    }, [scheduleHistory]);

    const maxValue = Math.max(...chartDays.map((d) => d.value), 1);

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Weekly Progress</h3>
                    <p className="text-sm text-muted-foreground">Last {daysToShow} days</p>
                </div>
                <BarChart3 className="w-6 h-6 text-pink-400" />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    icon={<Flame className="w-4 h-4" />}
                    title="Best Streak"
                    value={`${stats.bestStreak} days`
                    }
                    accent="from-orange-500/30 to-red-500/30"
                />
                <StatCard
                    icon={<CalendarRange className="w-4 h-4" />}
                    title="Avg Tasks/Day"
                    value={stats.averageTasks.toString()}
                    accent="from-pink-500/30 to-purple-500/30"
                />
                <StatCard
                    icon={<Flame className="w-4 h-4" />}
                    title="Skincare Consistency"
                    value={`${stats.skincareConsistency}%`}
                    accent="from-blue-500/30 to-cyan-500/30"
                />
                <StatCard
                    icon={<SparkIcon />}
                    title="Schedule Active Days"
                    value={`${stats.scheduleConsistency}%`}
                    accent="from-green-500/30 to-emerald-500/30"
                />
            </div>

            {/* Mini chart */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span>Tasks Completed</span>
                    <span>Past Week</span>
                </div>
                <div className="flex items-end gap-2 h-28">
                    {chartDays.map((day) => (
                        <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className="w-full rounded-md bg-gradient-to-t from-pink-500 to-purple-500"
                                style={{ height: `${(day.value / maxValue) * 100}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground font-semibold">
                                {day.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    title,
    value,
    accent,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    accent: string;
}) {
    return (
        <div
            className={clsx(
                "p-3 rounded-xl border border-white/10 bg-gradient-to-r",
                accent
            )}
        >
            <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground font-semibold">
                <span>{title}</span>
                <span className="text-foreground">{icon}</span>
            </div>
            <div className="text-xl font-bold text-foreground">{value}</div>
        </div>
    );
}

function SparkIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-green-400"
        >
            <path d="M12 2l1.9 6H20l-5.2 3.8L16.8 18 12 14.6 7.2 18l2-6.2L4 8h6.1z" />
        </svg>
    );
}

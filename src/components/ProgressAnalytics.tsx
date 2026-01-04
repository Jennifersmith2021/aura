"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Target, Calendar, Award, Sparkles } from "lucide-react";
import { ProgressTracker } from "./ProgressTracker";
import clsx from "clsx";

export function ProgressAnalytics() {
    const { 
        measurements = [], 
        sissyGoals = [], 
        sissyLogs = [], 
        clitMeasurements = [],
        chastitySessions = [],
        workoutSessions = []
    } = useStore();

    const [activeTab, setActiveTab] = useState<"progress" | "measurements" | "goals" | "clit" | "workouts">("progress");

    // Measurement trends (last 10)
    const measurementTrend = useMemo(() => {
        return (measurements || [])
            .sort((a, b) => (a.date ?? 0) - (b.date ?? 0))
            .slice(-10)
            .map((m) => ({
                date: new Date(m.date ?? 0).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                waist: m.values?.waist,
                bust: m.values?.bust,
                hips: m.values?.hips,
                weight: m.values?.weight || 0,
            }));
    }, [measurements]);

    // Clit size trend
    const clitTrend = useMemo(() => {
        return (clitMeasurements || [])
            .sort((a, b) => (a.date ?? 0) - (b.date ?? 0))
            .slice(-10)
            .map((c) => ({
                date: new Date(c.date ?? 0).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                length: c.lengthMm || 0,
                width: c.widthMm || 0,
            }));
    }, [clitMeasurements]);

    // Goal progress
    const goalProgress = useMemo(() => {
        const goalsArray = sissyGoals || [];
        const completed = goalsArray.filter((g) => g.completed).length;
        const total = goalsArray.length;
        return {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }, [sissyGoals]);

    // Workout stats
    const workoutStats = useMemo(() => {
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);
        const sessions = workoutSessions || [];
        const weekSessions = sessions.filter((s) => (s.date ?? 0) > thisWeek.getTime());
        const totalMinutes = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        return {
            count: weekSessions.length,
            totalMinutes,
            averageMinutes: weekSessions.length > 0 ? Math.round(totalMinutes / weekSessions.length) : 0,
        };
    }, [workoutSessions]);

    // Chastity tracking
    const chastityStat = useMemo(() => {
        const sessions = chastitySessions || [];
        const current = sessions.find((c) => !c.endDate);
        if (!current) return { locked: false, days: 0 };
        const days = Math.floor(((current.endDate ? new Date(current.endDate).getTime() : Date.now()) - (current.startDate ?? 0)) / (1000 * 60 * 60 * 24));
        return { locked: true, days, model: current.cageModel };
    }, [chastitySessions]);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Progress Analytics</h1>
                <p className="text-sm text-muted-foreground mt-1">Track your transformation journey</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    icon={<Target className="w-5 h-5" />}
                    label="Goals Completed"
                    value={`${goalProgress.completed}/${goalProgress.total}`}
                    subtext={`${goalProgress.percentage}% complete`}
                />
                <StatCard 
                    icon={<Calendar className="w-5 h-5" />}
                    label="Workouts This Week"
                    value={workoutStats.count}
                    subtext={`${workoutStats.totalMinutes} min total`}
                />
                <StatCard 
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Measurements Logged"
                    value={measurements.length}
                    subtext={`Latest: ${new Date(measurements[measurements.length - 1]?.date ?? 0).toLocaleDateString()}`}
                />
                <StatCard 
                    icon={<Award className="w-5 h-5" />}
                    label={chastityStat.locked ? "Days Locked" : "Not Locked"}
                    value={chastityStat.locked ? chastityStat.days : "—"}
                    subtext={chastityStat.model ? `Model: ${chastityStat.model}` : "Ready to lock"}
                />
            </div>

            {/* Charts */}
            <div className="space-y-4">
                <div className="flex gap-2 border-b overflow-x-auto pb-2">
                    {[
                        { id: "progress", label: "Progress Tracker", icon: <Sparkles className="w-4 h-4" />, enabled: true },
                        { id: "measurements", label: "Body Measurements", enabled: measurementTrend.length > 0 },
                        { id: "clit", label: "Clit Growth", enabled: clitTrend.length > 0 },
                        { id: "goals", label: "Goal Progress", enabled: sissyGoals.length > 0 },
                        { id: "workouts", label: "Workouts", enabled: workoutSessions.length > 0 },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            disabled={!tab.enabled}
                            className={clsx(
                                "px-4 py-2 border-b-2 transition whitespace-nowrap flex items-center gap-2",
                                activeTab === tab.id
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent text-muted-foreground hover:text-foreground",
                                !tab.enabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Progress Tracker Tab */}
                {activeTab === "progress" && <ProgressTracker />}

                {/* Measurement Chart */}
                {activeTab === "measurements" && measurementTrend.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={measurementTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="waist" stroke="#ef4444" name="Waist" />
                            <Line type="monotone" dataKey="bust" stroke="#3b82f6" name="Bust" />
                            <Line type="monotone" dataKey="hips" stroke="#ec4899" name="Hips" />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {/* Clit Growth Chart */}
                {activeTab === "clit" && clitTrend.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={clitTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="length" stroke="#8b5cf6" name="Length (mm)" />
                            <Line type="monotone" dataKey="width" stroke="#d946ef" name="Width (mm)" />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {/* Goal Progress */}
                {activeTab === "goals" && sissyGoals.length > 0 && (
                    <div className="space-y-3">
                        <div className="bg-muted rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">Overall Progress</span>
                                <span className="text-sm font-mono">{goalProgress.percentage}%</span>
                            </div>
                            <div className="w-full bg-muted border rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${goalProgress.percentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            {sissyGoals.slice(0, 5).map((goal) => (
                                <div key={goal.id} className="bg-muted p-3 rounded-lg">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-sm">{goal.title}</span>
                                        <span className="text-xs bg-background px-2 py-1 rounded">{goal.progress}%</span>
                                    </div>
                                    <div className="w-full bg-background rounded-full h-1.5">
                                        <div 
                                            className="bg-primary h-1.5 rounded-full"
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Workouts */}
                {activeTab === "workouts" && workoutSessions.length > 0 && (
                    <div className="space-y-3">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={workoutSessions.slice(-7).map((s) => ({
                                date: new Date(s.date ?? 0).toLocaleDateString("en-US", { weekday: "short" }),
                                duration: s.duration || 0,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="duration" fill="#06b6d4" name="Minutes" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* No Data Messages */}
            {activeTab === "measurements" && measurementTrend.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No measurement data yet. Start logging to see trends!</p>
                </div>
            )}
            {activeTab === "clit" && clitTrend.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No clit measurements logged yet.</p>
                </div>
            )}
            {activeTab === "goals" && sissyGoals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No goals set. Create some to track progress!</p>
                </div>
            )}
            {activeTab === "workouts" && workoutSessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No workouts logged yet.</p>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode; label: string; value: string | number; subtext: string }) {
    return (
        <div className="bg-muted border rounded-lg p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="text-primary">{icon}</div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{subtext}</div>
        </div>
    );
}

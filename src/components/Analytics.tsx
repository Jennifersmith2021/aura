"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { TrendingUp, Activity, Flame, Target } from "lucide-react";

export default function Analytics() {
  const { measurements, workoutSessions, sissyGoals } = useStore();
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("month");

  // Calculate workout stats
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const cutoff = timeframe === "week" ? weekAgo : timeframe === "month" ? monthAgo : 0;

  const recentWorkouts = workoutSessions.filter((s) => s.date >= cutoff);
  const totalWorkouts = recentWorkouts.length;
  const totalMinutes = recentWorkouts.reduce((sum, s) => sum + (s.duration || 0), 0);
  const avgMinutes = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  // Calculate streak
  const workoutDates = new Set(
    recentWorkouts.map((s) => new Date(s.date).toDateString())
  );
  let streak = 0;
  let checkDate = new Date();
  while (workoutDates.has(checkDate.toDateString())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate measurement trends
  const recentMeasurements = measurements.filter((m) => m.date >= cutoff);
  const latestMeasurement = measurements[0];
  const oldestRecentMeasurement = recentMeasurements[recentMeasurements.length - 1];

  const waistChange = latestMeasurement && oldestRecentMeasurement 
    ? (latestMeasurement.values.waist || 0) - (oldestRecentMeasurement.values.waist || 0)
    : 0;

  const weightChange = latestMeasurement && oldestRecentMeasurement
    ? (latestMeasurement.values.weight || 0) - (oldestRecentMeasurement.values.weight || 0)
    : 0;

  // Calculate goal progress
  const completedGoals = sissyGoals.filter((g) => g.completed).length;
  const goalProgress = sissyGoals.length > 0 ? Math.round((completedGoals / sissyGoals.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics & Progress</h2>
        <div className="flex gap-2">
          {(["week", "month", "all"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? "bg-primary text-white"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {tf === "week" ? "Week" : tf === "month" ? "Month" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workouts */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Workouts</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">
            {avgMinutes} min avg duration
          </p>
        </div>

        {/* Streak */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Workout Streak</span>
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold">{streak}</div>
          <p className="text-xs text-muted-foreground">days in a row</p>
        </div>

        {/* Waist Change */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Waist</span>
            <TrendingUp
              className={`w-5 h-5 ${
                waistChange < 0 ? "text-green-400" : "text-red-400"
              }`}
            />
          </div>
          <div className="text-3xl font-bold">
            {waistChange === 0 ? "—" : `${waistChange > 0 ? "+" : ""}${waistChange.toFixed(1)}"`}
          </div>
          <p className="text-xs text-muted-foreground">change this period</p>
        </div>

        {/* Goal Progress */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Goals</span>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold">{goalProgress}%</div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Measurements */}
      {recentMeasurements.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Recent Measurements</h3>
          <div className="space-y-2">
            {recentMeasurements.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
                <span className="text-sm text-muted-foreground">
                  {new Date(m.date).toLocaleDateString()}
                </span>
                <div className="flex gap-4 text-sm">
                  {m.values.bust && <span>👔 {m.values.bust}"</span>}
                  {m.values.waist && <span>⏳ {m.values.waist}"</span>}
                  {m.values.hips && <span>🍑 {m.values.hips}"</span>}
                  {m.values.weight && <span>⚖️ {m.values.weight} lbs</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 space-y-3">
        <h3 className="font-semibold text-blue-400">💡 Tips for Better Progress</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Log measurements weekly for better trend visibility</li>
          <li>• Maintain your workout streak with consistent sessions</li>
          <li>• Track waist changes to monitor corset training progress</li>
          <li>• Complete sissy goals for achievements and confidence</li>
        </ul>
      </div>
    </div>
  );
}

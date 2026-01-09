"use client";

import { useStore } from "@/hooks/useStore";
import { useState, useEffect } from "react";
import { GripVertical, Plus, X, TrendingUp, Calendar, Target, Sparkles, Flame } from "lucide-react";
import { clsx } from "clsx";
import { motion, Reorder } from "framer-motion";

type WidgetType = "affirmation" | "goals" | "measurements" | "events" | "streak" | "quick-stats";

interface Widget {
  id: string;
  type: WidgetType;
  enabled: boolean;
}

const defaultWidgets: Widget[] = [
  { id: "affirmation", type: "affirmation", enabled: true },
  { id: "streak", type: "streak", enabled: true },
  { id: "goals", type: "goals", enabled: true },
  { id: "measurements", type: "measurements", enabled: true },
  { id: "events", type: "events", enabled: true },
  { id: "quick-stats", type: "quick-stats", enabled: false },
];

export default function Dashboard() {
  const {
    dailyAffirmations,
    sissyGoals,
    measurements,
    calendarEvents,
    workoutSessions,
    items,
  } = useStore();

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  // Load widget order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dashboardWidgets");
    if (saved) {
      setWidgets(JSON.parse(saved));
    } else {
      setWidgets(defaultWidgets);
    }
  }, []);

  // Save widget order to localStorage
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem("dashboardWidgets", JSON.stringify(widgets));
    }
  }, [widgets]);

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const enabledWidgets = widgets.filter((w) => w.enabled);

  // Calculate streak (consecutive days with workouts)
  const calculateStreak = () => {
    if (workoutSessions.length === 0) return 0;
    const sortedSessions = [...workoutSessions].sort((a, b) => b.date - a.date);
    let streak = 0;
    let currentDay = new Date().setHours(0, 0, 0, 0);
    
    for (const session of sortedSessions) {
      const sessionDay = new Date(session.date).setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((currentDay - sessionDay) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === streak) {
        streak++;
      } else if (dayDiff === streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();
  const latestMeasurement = measurements[0];
  const activeGoals = sissyGoals.filter((g) => !g.completed);
  const upcomingEvents = calendarEvents
    .filter((e) => e.date >= Date.now())
    .sort((a, b) => a.date - b.date)
    .slice(0, 3);

  const renderWidget = (type: WidgetType) => {
    switch (type) {
      case "affirmation":
        return (
          <motion.div
            layout
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 space-y-2"
          >
            <div className="flex items-center gap-2 text-purple-300">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">Daily Affirmation</h3>
            </div>
            <p className="text-lg font-medium italic">
              {dailyAffirmations[0]?.text || "You are beautiful, confident, and unstoppable. 💖"}
            </p>
          </motion.div>
        );

      case "streak":
        return (
          <motion.div
            layout
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-300">
                <Flame className="w-5 h-5" />
                <h3 className="font-semibold">Workout Streak</h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-400">{streak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          </motion.div>
        );

      case "goals":
        return (
          <motion.div
            layout
            className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              <h3 className="font-semibold">Active Goals</h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {activeGoals.length} active
              </span>
            </div>
            <div className="space-y-2">
              {activeGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{goal.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {goal.progress || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {activeGoals.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No active goals. Create one to get started!
                </p>
              )}
            </div>
          </motion.div>
        );

      case "measurements":
        return (
          <motion.div
            layout
            className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold">Latest Measurements</h3>
            </div>
            {latestMeasurement ? (
              <div className="grid grid-cols-3 gap-3">
                {latestMeasurement.values.bust && (
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Bust</p>
                    <p className="text-lg font-bold">{latestMeasurement.values.bust}</p>
                  </div>
                )}
                {latestMeasurement.values.waist && (
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Waist</p>
                    <p className="text-lg font-bold">{latestMeasurement.values.waist}</p>
                  </div>
                )}
                {latestMeasurement.values.hips && (
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">Hips</p>
                    <p className="text-lg font-bold">{latestMeasurement.values.hips}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No measurements yet. Add your first measurement!
              </p>
            )}
          </motion.div>
        );

      case "events":
        return (
          <motion.div
            layout
            className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-primary">
              <Calendar className="w-5 h-5" />
              <h3 className="font-semibold">Upcoming Events</h3>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                >
                  <div
                    className={clsx(
                      "w-2 h-2 rounded-full",
                      event.type === "workout" && "bg-blue-400",
                      event.type === "chastity" && "bg-purple-400",
                      event.type === "corset" && "bg-pink-400",
                      event.type === "milestone" && "bg-amber-400",
                      event.type === "event" && "bg-green-400",
                      event.type === "challenge" && "bg-orange-400"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No upcoming events
                </p>
              )}
            </div>
          </motion.div>
        );

      case "quick-stats":
        return (
          <motion.div
            layout
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">{items.length}</p>
                <p className="text-xs text-muted-foreground">Items</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {workoutSessions.length}
                </p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {measurements.length}
                </p>
                <p className="text-xs text-muted-foreground">Measurements</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {calendarEvents.length}
                </p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Customize your view
          </p>
        </div>
        <button
          onClick={() => setShowWidgetPicker(!showWidgetPicker)}
          className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Widget Picker */}
      {showWidgetPicker && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Manage Widgets</h3>
            <button
              onClick={() => setShowWidgetPicker(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid gap-2">
            {widgets.map((widget) => (
              <label
                key={widget.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={widget.enabled}
                  onChange={() => toggleWidget(widget.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium capitalize">
                  {widget.type.replace("-", " ")}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {/* Draggable Widgets */}
      <Reorder.Group
        axis="y"
        values={enabledWidgets}
        onReorder={(newOrder) => {
          const updatedWidgets = widgets.map((w) => {
            const newIndex = newOrder.findIndex((nw) => nw.id === w.id);
            return newIndex === -1 ? w : { ...w, order: newIndex };
          });
          setWidgets(updatedWidgets);
        }}
        className="space-y-4"
      >
        {enabledWidgets.map((widget) => (
          <Reorder.Item key={widget.id} value={widget}>
            <div className="relative group">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="pl-8">
                {renderWidget(widget.type)}
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {enabledWidgets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No widgets enabled.</p>
          <button
            onClick={() => setShowWidgetPicker(true)}
            className="text-primary text-sm font-medium mt-2"
          >
            Add your first widget
          </button>
        </div>
      )}
    </div>
  );
}

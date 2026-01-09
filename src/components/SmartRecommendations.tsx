"use client";

import { useStore } from "@/hooks/useStore";
import { useState, useEffect } from "react";
import { Lightbulb, Zap, Package } from "lucide-react";
import { clsx } from "clsx";

interface Recommendation {
  id: string;
  type: "outfit" | "skincare" | "supplement";
  title: string;
  description: string;
  items: string[];
  reason: string;
  icon: typeof Lightbulb;
  color: string;
}

export default function SmartRecommendations() {
  const { items, measurements, workoutSessions, corsetSessions, sissyGoals } = useStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("week");

  useEffect(() => {
    const generateRecommendations = () => {
      const recs: Recommendation[] = [];

      // Get latest measurement for context
      const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;
      const hasGoal = sissyGoals.some((g) => !g.completed);
      const recentWorkouts = workoutSessions.filter((w) => {
        const daysSince = (Date.now() - w.date) / (1000 * 60 * 60 * 24);
        return daysSince < (timeframe === "today" ? 1 : timeframe === "week" ? 7 : 30);
      });

      // Outfit Recommendations
      const outfitItems = items.filter((i) => i.type === "clothing");
      if (outfitItems.length >= 2) {
        recs.push({
          id: "outfit-1",
          type: "outfit",
          title: "Confidence Boost Outfit",
          description: "Highlighting your favorite pieces for maximum impact",
          items: outfitItems.slice(0, 3).map((i) => i.id),
          reason: "Based on your recent choices and body goals",
          icon: Lightbulb,
          color: "text-blue-400",
        });

        if (
          latestMeasurement?.values?.waist !== undefined &&
          latestMeasurement.goalWaist !== undefined &&
          latestMeasurement.values.waist < latestMeasurement.goalWaist
        ) {
          recs.push({
            id: "outfit-waist",
            type: "outfit",
            title: "Waist-Highlighting Outfit",
            description: "Celebrate your waist gains with fitted silhouettes",
            items: outfitItems.slice(1, 4).map((i) => i.id),
            reason: `You're ${(latestMeasurement.goalWaist - latestMeasurement.values.waist).toFixed(1)}" closer to your goal!`,
            icon: Zap,
            color: "text-pink-400",
          });
        }
      }

      // Skincare Recommendations
      if (measurements.length > 0) {
        recs.push({
          id: "skincare-1",
          type: "skincare",
          title: "Evening Routine",
          description: "Deep cleanse → essence → serum → moisturizer → night cream",
          items: [],
          reason: "Prep skin for quality sleep and overnight repair",
          icon: Package,
          color: "text-purple-400",
        });

        if (latestMeasurement?.values?.weight) {
          recs.push({
            id: "skincare-hydration",
            type: "skincare",
            title: "Hydration Protocol",
            description: "Toner → essence → hydrating serum → sheet mask (2x/week)",
            items: [],
            reason: "Support skin elasticity during body changes",
            icon: Lightbulb,
            color: "text-cyan-400",
          });
        }
      }

      // Supplement Stack Recommendations
      if (recentWorkouts.length > 0 || hasGoal) {
        recs.push({
          id: "supplement-recovery",
          type: "supplement",
          title: "Recovery Stack",
          description: "Post-workout: Protein powder + Creatine + Electrolytes",
          items: [],
          reason: `You've completed ${recentWorkouts.length} workouts this ${timeframe}`,
          icon: Zap,
          color: "text-orange-400",
        });
      }

      if (latestMeasurement) {
        recs.push({
          id: "supplement-body",
          type: "supplement",
          title: "Body Composition Stack",
          description: "Daily: Collagen + Biotin + Vitamin D3 + Omega-3",
          items: [],
          reason: "Support skin, hair, and hormonal health during transformation",
          icon: Package,
          color: "text-green-400",
        });
      }

      setRecommendations(recs);
    };

    generateRecommendations();
  }, [items, measurements, workoutSessions, timeframe, sissyGoals]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "outfit":
        return "👗";
      case "skincare":
        return "💆";
      case "supplement":
        return "💊";
      default:
        return "✨";
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (timeframe === "today") return r.type === "outfit";
    if (timeframe === "week") return ["outfit", "skincare"].includes(r.type);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          Smart Recommendations
        </h2>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(["today", "week", "month"] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium transition-colors capitalize",
              timeframe === tf
                ? "bg-primary text-white"
                : "bg-white/5 hover:bg-white/10 text-muted-foreground"
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRecs.map((rec) => (
          <div
            key={rec.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getTypeIcon(rec.type)}</span>
              <div className="flex-1">
                <h3 className="font-semibold">{rec.title}</h3>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
            </div>

            <p className="text-sm text-white/80">{rec.description}</p>

            {rec.items.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Items:</p>
                <div className="flex flex-wrap gap-2">
                  {rec.items.map((itemId) => {
                    const item = items.find((i) => i.id === itemId);
                    return item ? (
                      <span
                        key={itemId}
                        className="text-xs px-2 py-1 bg-white/10 rounded text-white/70"
                      >
                        {item.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <button className="w-full text-sm px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        ))}
      </div>

      {filteredRecs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No recommendations available yet. Add some items to get personalized suggestions!</p>
        </div>
      )}
    </div>
  );
}

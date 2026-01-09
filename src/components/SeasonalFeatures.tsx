"use client";

import { useStore } from "@/hooks/useStore";
import { useState, useMemo } from "react";
import { Cloud, CloudRain, Sun, Snowflake, Wind, Zap } from "lucide-react";
import { clsx } from "clsx";

type Season = "spring" | "summer" | "fall" | "winter";

interface SeasonalOutfit {
  name: string;
  occasion: string;
  items: string[];
  tempRange: [number, number];
  weather: string[];
}

const SEASON_DATA: Record<Season, {
  months: number[];
  emoji: string;
  colors: string;
  outfits: SeasonalOutfit[];
}> = {
  spring: {
    months: [3, 4, 5],
    emoji: "🌸",
    colors: "from-pink-400 to-green-400",
    outfits: [
      {
        name: "Light Layers",
        occasion: "casual",
        items: [],
        tempRange: [10, 18],
        weather: ["cloudy", "rainy"],
      },
      {
        name: "Floral Casual",
        occasion: "casual",
        items: [],
        tempRange: [15, 22],
        weather: ["sunny"],
      },
    ],
  },
  summer: {
    months: [6, 7, 8],
    emoji: "☀️",
    colors: "from-yellow-400 to-orange-400",
    outfits: [
      {
        name: "Breathable Sundress",
        occasion: "casual",
        items: [],
        tempRange: [22, 32],
        weather: ["sunny", "hot"],
      },
      {
        name: "Beach Ready",
        occasion: "casual",
        items: [],
        tempRange: [25, 35],
        weather: ["sunny"],
      },
    ],
  },
  fall: {
    months: [9, 10, 11],
    emoji: "🍂",
    colors: "from-amber-400 to-red-400",
    outfits: [
      {
        name: "Cozy Layers",
        occasion: "casual",
        items: [],
        tempRange: [12, 20],
        weather: ["cloudy", "rainy"],
      },
      {
        name: "Sweater Weather",
        occasion: "casual",
        items: [],
        tempRange: [10, 18],
        weather: ["cloudy", "windy"],
      },
    ],
  },
  winter: {
    months: [12, 1, 2],
    emoji: "❄️",
    colors: "from-blue-400 to-cyan-400",
    outfits: [
      {
        name: "Warm Layers",
        occasion: "casual",
        items: [],
        tempRange: [-5, 5],
        weather: ["cloudy", "snowy"],
      },
      {
        name: "Cozy Indoor",
        occasion: "casual",
        items: [],
        tempRange: [5, 15],
        weather: ["any"],
      },
    ],
  },
};

export default function SeasonalFeatures() {
  const { items } = useStore();
  const [selectedSeason, setSelectedSeason] = useState<Season>("spring");
  const [temperatureFilter, setTemperatureFilter] = useState<[number, number]>([0, 30]);
  const [weatherFilter, setWeatherFilter] = useState<string[]>([]);

  const currentSeason = useMemo(() => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "fall";
    return "winter";
  }, []);

  const seasonData = SEASON_DATA[selectedSeason];

  const filteredOutfits = seasonData.outfits.filter((outfit) => {
    const tempMatch =
      outfit.tempRange[0] >= temperatureFilter[0] &&
      outfit.tempRange[1] <= temperatureFilter[1];
    const weatherMatch =
      weatherFilter.length === 0 ||
      outfit.weather.some((w) => weatherFilter.includes(w));
    return tempMatch && weatherMatch;
  });

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return <Sun className="w-4 h-4" />;
      case "cloudy":
        return <Cloud className="w-4 h-4" />;
      case "rainy":
        return <CloudRain className="w-4 h-4" />;
      case "snowy":
        return <Snowflake className="w-4 h-4" />;
      case "windy":
        return <Wind className="w-4 h-4" />;
      case "hot":
        return <Zap className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Seasonal Wardrobe</h2>
        <p className="text-sm text-muted-foreground">
          Plan outfits for each season {seasonData.emoji}
        </p>
      </div>

      {/* Current Season Badge */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-1">Current Season</p>
        <p className="text-lg font-semibold capitalize">
          {currentSeason} {SEASON_DATA[currentSeason].emoji}
        </p>
      </div>

      {/* Season Selector */}
      <div className="grid grid-cols-4 gap-2">
        {(["spring", "summer", "fall", "winter"] as Season[]).map((season) => (
          <button
            key={season}
            onClick={() => setSelectedSeason(season)}
            className={clsx(
              "px-3 py-2 rounded-lg font-semibold text-sm transition-all capitalize",
              selectedSeason === season
                ? clsx(
                    "bg-gradient-to-r text-white shadow-lg",
                    SEASON_DATA[season].colors
                  )
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            <span className="mr-1">{SEASON_DATA[season].emoji}</span>
            {season}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold">Filters</h3>

        {/* Temperature Filter */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Temperature: {temperatureFilter[0]}°C - {temperatureFilter[1]}°C
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="-10"
              max="40"
              value={temperatureFilter[0]}
              onChange={(e) =>
                setTemperatureFilter([Number(e.target.value), temperatureFilter[1]])
              }
              className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm"
            />
            <input
              type="number"
              min="-10"
              max="40"
              value={temperatureFilter[1]}
              onChange={(e) =>
                setTemperatureFilter([temperatureFilter[0], Number(e.target.value)])
              }
              className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm"
            />
          </div>
        </div>

        {/* Weather Filter */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Weather Types</label>
          <div className="flex flex-wrap gap-2">
            {["sunny", "cloudy", "rainy", "snowy", "windy"].map((weather) => (
              <button
                key={weather}
                onClick={() =>
                  setWeatherFilter((prev) =>
                    prev.includes(weather)
                      ? prev.filter((w) => w !== weather)
                      : [...prev, weather]
                  )
                }
                className={clsx(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  weatherFilter.includes(weather)
                    ? "bg-primary text-white"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {getWeatherIcon(weather)}
                {weather.charAt(0).toUpperCase() + weather.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Outfit Packs */}
      <div className="space-y-3">
        <h3 className="font-semibold">Suggested Outfits</h3>
        {filteredOutfits.length > 0 ? (
          filteredOutfits.map((outfit, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{outfit.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {outfit.occasion}
                  </p>
                </div>
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                  {outfit.tempRange[0]}°-{outfit.tempRange[1]}°C
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {outfit.weather.map((w) => (
                  <div
                    key={w}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-xs text-muted-foreground"
                  >
                    {getWeatherIcon(w)}
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </div>
                ))}
              </div>

              <button className="w-full px-3 py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-semibold transition-colors">
                View Outfit
              </button>
            </div>
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No outfits match your filters. Try adjusting temperature or weather preferences.
          </p>
        )}
      </div>

      {/* Seasonal Goals */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">Seasonal Goals</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white/5 rounded">
            <div>
              <p className="text-sm font-medium">Spring Refresh</p>
              <p className="text-xs text-muted-foreground">Update wardrobe palette</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">45%</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/5 rounded">
            <div>
              <p className="text-sm font-medium">Summer Essentials</p>
              <p className="text-xs text-muted-foreground">Get beach-ready outfits</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">60%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

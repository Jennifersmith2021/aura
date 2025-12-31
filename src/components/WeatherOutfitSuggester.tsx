"use client";
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */

import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Wind, Snowflake, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/hooks/useStore";
import clsx from "clsx";

interface WeatherData {
    temp: number;
    condition: "sunny" | "cloudy" | "rainy" | "snowy" | "windy";
    humidity: number;
    windSpeed: number;
}

interface OutfitSuggestion {
    title: string;
    items: string[];
    reasoning: string;
    accessories: string[];
}

const weatherIcons = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    snowy: Snowflake,
    windy: Wind,
};

const getOutfitSuggestions = (weather: WeatherData): OutfitSuggestion[] => {
    const { temp, condition } = weather;

    if (temp < 32) {
        // Freezing
        return [
            {
                title: "Cozy Winter Look",
                items: ["Thermal leggings", "Sweater dress", "Long coat", "Boots"],
                reasoning: "Stay warm in freezing temperatures",
                accessories: ["Scarf", "Gloves", "Warm tights"],
            },
            {
                title: "Layered Warmth",
                items: ["Jeans", "Long sleeve top", "Cardigan", "Winter coat"],
                reasoning: "Multiple layers trap heat effectively",
                accessories: ["Beanie", "Warm socks", "Mittens"],
            },
        ];
    } else if (temp < 50) {
        // Cold
        return [
            {
                title: "Light Layers",
                items: ["Jeans", "Blouse", "Blazer", "Ankle boots"],
                reasoning: "Perfect for chilly but not freezing weather",
                accessories: ["Light scarf", "Tights"],
            },
            {
                title: "Cute and Comfy",
                items: ["Leggings", "Tunic", "Cardigan", "Flats"],
                reasoning: "Comfortable layers you can adjust",
                accessories: ["Infinity scarf", "Crossbody bag"],
            },
        ];
    } else if (temp < 65) {
        // Cool/Mild
        return [
            {
                title: "Spring Fresh",
                items: ["Midi skirt", "Light sweater", "Denim jacket", "Sneakers"],
                reasoning: "Perfect transition weather outfit",
                accessories: ["Sunglasses", "Light jewelry"],
            },
            {
                title: "Casual Chic",
                items: ["Jeans", "T-shirt", "Cardigan", "Loafers"],
                reasoning: "Easy to layer if temperature changes",
                accessories: ["Watch", "Tote bag"],
            },
        ];
    } else if (temp < 75) {
        // Warm
        return [
            {
                title: "Summer Casual",
                items: ["Shorts", "Tank top", "Sandals"],
                reasoning: "Light and breezy for warm weather",
                accessories: ["Sunglasses", "Sun hat", "Crossbody"],
            },
            {
                title: "Flowy Dress",
                items: ["Sundress", "Flat sandals"],
                reasoning: "Stay cool and feminine",
                accessories: ["Straw bag", "Delicate jewelry"],
            },
        ];
    } else {
        // Hot
        return [
            {
                title: "Beat the Heat",
                items: ["Loose shorts", "Crop top", "Sandals"],
                reasoning: "Maximum breathability for hot days",
                accessories: ["Sunglasses", "Cooling towel"],
            },
            {
                title: "Minimal & Cool",
                items: ["Maxi dress", "Strappy sandals"],
                reasoning: "Light fabric keeps you comfortable",
                accessories: ["Wide-brim hat", "Water bottle"],
            },
        ];
    }

    // Weather-specific additions
    if (condition === "rainy") {
        return [
            {
                title: "Rainy Day Ready",
                items: ["Waterproof jacket", "Jeans", "Rain boots"],
                reasoning: "Stay dry and stylish in the rain",
                accessories: ["Umbrella", "Waterproof bag"],
            },
        ];
    }

    return [];
};

export default function WeatherOutfitSuggester() {
    const { items } = useStore();
    const [weather, setWeather] = useState<WeatherData>({
        temp: 68,
        condition: "sunny",
        humidity: 50,
        windSpeed: 5,
    });
    const [location, setLocation] = useState("Your City");
    const [loading, setLoading] = useState(false);

    // Simulate weather fetch (in production, this would call a weather API)
    const fetchWeather = async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock weather data
        const conditions: Array<"sunny" | "cloudy" | "rainy" | "snowy" | "windy"> = [
            "sunny",
            "cloudy",
            "rainy",
            "snowy",
            "windy",
        ];
        setWeather({
            temp: Math.floor(Math.random() * 60) + 30,
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            humidity: Math.floor(Math.random() * 40) + 30,
            windSpeed: Math.floor(Math.random() * 15) + 2,
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    const suggestions = getOutfitSuggestions(weather);
    const WeatherIcon = weatherIcons[weather.condition];

    const clothingItems = items.filter((i) => i.type === "clothing");
    const matchingItems = suggestions.flatMap((sug) =>
        sug.items.flatMap((sugItem) =>
            clothingItems.filter((item) =>
                item.name.toLowerCase().includes(sugItem.toLowerCase()) ||
                item.category?.toLowerCase().includes(sugItem.toLowerCase())
            )
        )
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Weather Outfit Suggester</h2>
                    <p className="text-sm text-muted-foreground">
                        Perfect outfits for today's weather
                    </p>
                </div>
                <Cloud className="w-8 h-8 text-blue-400" />
            </div>

            {/* Weather Card */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-2xl text-foreground">{location}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                            {weather.condition}
                        </p>
                    </div>
                    <WeatherIcon className="w-12 h-12 text-blue-400" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">
                            {weather.temp}°F
                        </div>
                        <div className="text-xs text-muted-foreground">Temperature</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">
                            {weather.humidity}%
                        </div>
                        <div className="text-xs text-muted-foreground">Humidity</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">
                            {weather.windSpeed}mph
                        </div>
                        <div className="text-xs text-muted-foreground">Wind</div>
                    </div>
                </div>

                <button
                    onClick={fetchWeather}
                    disabled={loading}
                    className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Refresh Weather"}
                </button>
            </motion.div>

            {/* Temperature Guide */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-sm text-foreground mb-3">
                    Temperature Guide
                </h3>
                <div className="space-y-2 text-xs text-muted-foreground font-medium">
                    <div className="flex justify-between">
                        <span>❄️ Below 32°F: Heavy winter wear</span>
                    </div>
                    <div className="flex justify-between">
                        <span>🧥 32-50°F: Warm layers needed</span>
                    </div>
                    <div className="flex justify-between">
                        <span>🍂 50-65°F: Light jacket weather</span>
                    </div>
                    <div className="flex justify-between">
                        <span>☀️ 65-75°F: Perfect t-shirt weather</span>
                    </div>
                    <div className="flex justify-between">
                        <span>🔥 Above 75°F: Light, breathable fabrics</span>
                    </div>
                </div>
            </div>

            {/* Outfit Suggestions */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Recommended Outfits
                </h3>

                {suggestions.map((suggestion, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/30"
                    >
                        <h4 className="font-bold text-lg text-foreground mb-2">
                            {suggestion.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            {suggestion.reasoning}
                        </p>

                        {/* Items */}
                        <div className="mb-3">
                            <div className="text-xs font-semibold text-foreground mb-2">
                                Main Pieces:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {suggestion.items.map((item, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-purple-500/20 rounded-full text-xs font-medium text-foreground"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Accessories */}
                        <div>
                            <div className="text-xs font-semibold text-foreground mb-2">
                                Accessories:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {suggestion.accessories.map((acc, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-pink-500/20 rounded-full text-xs font-medium text-foreground"
                                    >
                                        {acc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* From Your Closet */}
            {matchingItems.length > 0 && (
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-bold text-lg text-foreground mb-4">
                        Weather-Appropriate Items from Your Closet
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {matchingItems.slice(0, 6).map((item) => (
                            <div key={item.id} className="space-y-1">
                                <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-medium text-center p-2">
                                            {item.name}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium truncate">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                <h3 className="font-semibold text-sm text-blue-300 mb-2">Weather Tips</h3>
                <ul className="space-y-1 text-xs text-foreground">
                    {weather.temp < 50 && (
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>Layer up! Multiple thin layers are warmer than one thick one</span>
                        </li>
                    )}
                    {weather.condition === "rainy" && (
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>Don't forget waterproof footwear and an umbrella</span>
                        </li>
                    )}
                    {weather.temp > 75 && (
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>Choose light colors and breathable fabrics to stay cool</span>
                        </li>
                    )}
                    {weather.windSpeed > 10 && (
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>It's windy! Secure loose items and consider a windbreaker</span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

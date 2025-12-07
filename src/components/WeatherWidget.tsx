"use client";

import { useWeather } from "@/hooks/useWeather";
import { Cloud, CloudRain, CloudSnow, Sun, Moon, CloudLightning, Wind } from "lucide-react";

export function WeatherWidget() {
    const { weather, loading, error } = useWeather();

    if (loading) return <div className="animate-pulse h-24 bg-muted rounded-xl"></div>;
    if (error) return null; // Hide if error/denied
    if (!weather) return null;

    const getWeatherIcon = (code: number, isDay: boolean) => {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        if (code === 0) return isDay ? <Sun className="w-8 h-8 text-amber-500" /> : <Moon className="w-8 h-8 text-slate-400" />;
        if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-slate-400" />;
        if (code >= 45 && code <= 48) return <Wind className="w-8 h-8 text-slate-400" />;
        if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />;
        if (code >= 71 && code <= 77) return <CloudSnow className="w-8 h-8 text-sky-200" />;
        if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-500" />;
        if (code >= 95 && code <= 99) return <CloudLightning className="w-8 h-8 text-purple-500" />;
        return <Sun className="w-8 h-8 text-amber-500" />;
    };

    const getWeatherDescription = (code: number) => {
        if (code === 0) return "Clear sky";
        if (code <= 3) return "Partly cloudy";
        if (code <= 48) return "Foggy";
        if (code <= 67) return "Rainy";
        if (code <= 77) return "Snowy";
        if (code <= 82) return "Heavy Rain";
        if (code <= 99) return "Thunderstorm";
        return "Unknown";
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Weather</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold">{Math.round(weather.temperature)}°F</span>
                    <span className="text-sm text-muted-foreground">{getWeatherDescription(weather.weatherCode)}</span>
                </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-full">
                {getWeatherIcon(weather.weatherCode, weather.isDay)}
            </div>
        </div>
    );
}

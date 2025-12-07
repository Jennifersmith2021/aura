import { useState, useEffect } from "react";

interface WeatherData {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
}

export function useWeather() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation not supported");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`
                    );
                    const data = await res.json();

                    if (data.current_weather) {
                        setWeather({
                            temperature: data.current_weather.temperature,
                            weatherCode: data.current_weather.weathercode,
                            isDay: data.current_weather.is_day === 1
                        });
                    }
                } catch (err) {
                    setError("Failed to fetch weather");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError("Location access denied");
                setLoading(false);
            }
        );
    }, []);

    return { weather, loading, error };
}

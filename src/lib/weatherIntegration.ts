/**
 * Weather Integration Module
 * Provides location detection, weather fetching, and weather-aware outfit suggestions
 * Uses OpenWeatherMap API with caching for optimal performance
 */

import { cache } from './cache'

export interface WeatherData {
  temp: number
  humidity: number
  windSpeed: number
  uvIndex: number
  precipitation: number
  condition: string
  icon: string
  location: string
  lat: number
  lon: number
  timestamp: number
}

export interface ForecastData {
  date: string
  high: number
  low: number
  condition: string
  precipitation: number
}

export interface WeatherOutfitSuggestion {
  weatherId: string
  outfit: string
  reasoning: string
  layering?: string
  items?: string[]
}

/**
 * Get user location via browser geolocation API with fallback
 */
export async function getUserLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator?.geolocation) {
      console.warn('Geolocation not available')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      (error) => {
        console.warn('Geolocation error:', error.message)
        resolve(null)
      },
      { timeout: 5000, maximumAge: 3600000 } // Cache for 1 hour
    )
  })
}

/**
 * Fetch current weather from OpenWeatherMap
 * Falls back to cached/placeholder data if API unavailable
 */
export async function fetchCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
  const cacheKey = `weather:current:${lat}:${lon}`
  const cached = cache.get<WeatherData>(cacheKey)

  if (cached) {
    return cached
  }

  try {
    // Using free tier - fallback to cache/placeholder if API key not set
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
    if (!apiKey) {
      console.warn('Weather API key not configured')
      return null
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    const weather: WeatherData = {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      uvIndex: 0, // Requires separate UV API call
      precipitation: data.rain?.['1h'] || 0,
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      location: `${data.name}, ${data.sys.country}`,
      lat,
      lon,
      timestamp: Date.now(),
    }

    // Cache for 1 hour
    cache.set(cacheKey, weather, 3600000)
    return weather
  } catch (error) {
    console.error('Weather fetch error:', error)
    return null
  }
}

/**
 * Fetch 7-day forecast
 */
export async function fetch7DayForecast(lat: number, lon: number): Promise<ForecastData[]> {
  const cacheKey = `weather:forecast:${lat}:${lon}`
  const cached = cache.get<ForecastData[]>(cacheKey)

  if (cached) {
    return cached
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
    if (!apiKey) return []

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`)
    }

    const data = await response.json()
    const forecast: ForecastData[] = []
    const processedDates = new Set<string>()

    // Process one forecast per day (API returns every 3 hours)
    for (const item of data.list) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0]

      if (!processedDates.has(date)) {
        processedDates.add(date)
        forecast.push({
          date,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          precipitation: item.rain?.['3h'] || 0,
        })
      }

      if (forecast.length >= 7) break
    }

    // Cache for 6 hours
    cache.set(cacheKey, forecast, 21600000)
    return forecast
  } catch (error) {
    console.error('Forecast fetch error:', error)
    return []
  }
}

/**
 * Categorize weather condition for outfit suggestions
 */
export function getWeatherCategory(condition: string, temp: number): string {
  const normalized = condition.toLowerCase()

  if (temp < 0) return 'freezing'
  if (temp < 10) return 'cold'
  if (temp < 15) return 'cool'
  if (temp < 25) return 'mild'
  if (temp < 30) return 'warm'
  if (temp >= 30) return 'hot'

  if (normalized.includes('rain') || normalized.includes('drizzle')) return 'rainy'
  if (normalized.includes('snow')) return 'snowy'
  if (normalized.includes('cloud')) return 'cloudy'
  if (normalized.includes('clear') || normalized.includes('sunny')) return 'sunny'
  if (normalized.includes('wind')) return 'windy'

  return 'mild'
}

/**
 * Determine layering recommendations based on weather
 */
export function getLayeringGuide(temp: number, condition: string): string {
  if (temp < 0) {
    return 'Heavy coat, thermal layers, scarf, gloves, hat. Consider merino wool for comfort.'
  }
  if (temp < 10) {
    return 'Warm coat, sweater, long sleeves. Wind protection recommended.'
  }
  if (temp < 15) {
    return 'Light jacket over layers. Can remove jacket as day warms.'
  }
  if (temp < 20) {
    return 'Long sleeves with optional light layer. Bring cardigan for flexibility.'
  }
  if (temp < 25) {
    return 'Short sleeves acceptable, light layers optional.'
  }

  if (condition.toLowerCase().includes('rain')) {
    return 'Waterproof/water-resistant outer layer. Avoid suede and heavy fabrics.'
  }

  return 'Light clothing, breathable fabrics, consider sun protection.'
}

/**
 * Get rain protection alerts
 */
export function getRainAlert(condition: string, precipitation: number): string | null {
  if (precipitation > 0 || condition.toLowerCase().includes('rain')) {
    if (precipitation > 5) {
      return 'Heavy rain expected! Consider waterproof coat and closed-toe shoes.'
    }
    return 'Rain possible. Bring umbrella and wear shoes that can handle moisture.'
  }
  return null
}

/**
 * Get color palette suggestions based on weather mood
 */
export function getWeatherColorPalette(condition: string, temp: number): string[] {
  const normalized = condition.toLowerCase()

  if (temp < 5) {
    // Cold/winter: Cozy deep colors
    return ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#8b4789']
  }

  if (temp > 28) {
    // Hot/summer: Bright, light colors
    return ['#fff8dc', '#ffe4b5', '#ffd700', '#87ceeb', '#e0ffff']
  }

  if (normalized.includes('rain') || normalized.includes('cloud')) {
    // Gloomy: Moody but elegant
    return ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#c0392b']
  }

  if (normalized.includes('sun') || normalized.includes('clear')) {
    // Sunny: Vibrant, warm
    return ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6']
  }

  // Default: Neutral/balanced
  return ['#2c3e50', '#34495e', '#95a5a6', '#e67e22', '#9b59b6']
}

/**
 * Generate outfit suggestion prompt for Gemini based on weather
 */
export function buildWeatherOutfitPrompt(
  weather: WeatherData,
  userItems: Array<{ name: string; category: string; color: string; type: string }>
): string {
  const category = getWeatherCategory(weather.condition, weather.temp)
  const layering = getLayeringGuide(weather.temp, weather.condition)
  const rainAlert = getRainAlert(weather.condition, weather.precipitation)

  return `
You are styling an outfit for the following weather:
- Location: ${weather.location}
- Temperature: ${weather.temp}°C
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} m/s
- Precipitation: ${weather.precipitation}mm

Styling Guidelines:
${layering}
${rainAlert ? `ALERT: ${rainAlert}` : ''}

User's Available Items:
${userItems.map((item) => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Create 3 outfit suggestions that:
1. Match the weather conditions
2. Use only items from their collection
3. Consider comfort, style, and practicality
4. Include layering recommendations if needed

Format response as JSON: { outfits: [{ name: string, items: string[], reasoning: string, confidence: number }] }
  `.trim()
}

/**
 * Parse weather outfit suggestions from AI response
 */
export function parseWeatherOutfits(jsonResponse: string): WeatherOutfitSuggestion[] {
  try {
    const data = JSON.parse(jsonResponse)
    return (data.outfits || []).map((outfit: any, index: number) => ({
      weatherId: `weather-outfit-${Date.now()}-${index}`,
      outfit: outfit.name || `Outfit ${index + 1}`,
      reasoning: outfit.reasoning || '',
      items: outfit.items || [],
    }))
  } catch (error) {
    console.error('Failed to parse weather outfits:', error)
    return []
  }
}

export default {
  getUserLocation,
  fetchCurrentWeather,
  fetch7DayForecast,
  getWeatherCategory,
  getLayeringGuide,
  getRainAlert,
  getWeatherColorPalette,
  buildWeatherOutfitPrompt,
  parseWeatherOutfits,
}

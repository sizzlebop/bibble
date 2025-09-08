/**
 * Weather Tool using OpenWeatherMap API
 * Built-in tool for getting current weather and forecasts
 */

import { z } from 'zod';
import axios from 'axios';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { createErrorResult, createSuccessResult } from '../utilities/common.js';
import { checkRateLimit } from '../utilities/security.js';
import { Config } from '../../../config/config.js';

// Weather API interfaces
export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  visibility: number;
  uvIndex?: number;
  cloudiness: number;
  sunrise: string;
  sunset: string;
  timezone: string;
  units: string;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

// Parameter schemas - location is now optional to allow default location usage
const GetWeatherSchema = z.object({
  location: z.string().optional(),
  units: z.enum(['metric', 'imperial', 'kelvin']).optional(),
  includeforecast: z.boolean().default(false),
  forecastDays: z.number().min(1).max(5).default(3)
}).strict();

type GetWeatherParams = z.infer<typeof GetWeatherSchema>;

// Get configuration helper
function getWeatherConfig() {
  const config = Config.getInstance();
  return {
    apiKey: config.get('weather.apiKey') || process.env.OPENWEATHER_API_KEY || '',
    defaultLocation: config.get('weather.defaultLocation', ''),
    units: config.get('weather.units', 'metric'),
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    requestTimeoutMs: config.get('weather.requestTimeoutMs', 10000),
    rateLimitPerHour: config.get('weather.rateLimitPerHour', 1000),
    cacheResultsMinutes: config.get('weather.cacheMinutes', 10)
  };
}

// Simple cache for weather results
interface CachedWeather {
  data: WeatherData | { current: WeatherData; forecast: WeatherForecast[] };
  timestamp: number;
  location: string;
  units: string;
}

const weatherCache = new Map<string, CachedWeather>();

/**
 * Format temperature with appropriate unit symbol
 */
function formatTemperature(temp: number, units: string): string {
  const rounded = Math.round(temp);
  switch (units) {
    case 'metric': return `${rounded}°C`;
    case 'imperial': return `${rounded}°F`;
    case 'kelvin': return `${rounded}K`;
    default: return `${rounded}°`;
  }
}

/**
 * Format wind speed with appropriate unit
 */
function formatWindSpeed(speed: number, units: string): string {
  switch (units) {
    case 'metric': return `${speed} m/s`;
    case 'imperial': return `${speed} mph`;
    case 'kelvin': return `${speed} m/s`;
    default: return `${speed}`;
  }
}

/**
 * Convert wind direction degrees to cardinal direction
 */
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get cached weather data if still valid
 */
function getCachedWeather(location: string, units: string, includeforecast: boolean): CachedWeather | null {
  const config = getWeatherConfig();
  const cacheKey = `${location.toLowerCase()}_${units}_${includeforecast}`;
  const cached = weatherCache.get(cacheKey);
  
  if (cached) {
    const ageMinutes = (Date.now() - cached.timestamp) / (1000 * 60);
    if (ageMinutes < config.cacheResultsMinutes) {
      return cached;
    } else {
      weatherCache.delete(cacheKey);
    }
  }
  
  return null;
}

/**
 * Cache weather data
 */
function cacheWeatherData(location: string, units: string, includeforecast: boolean, data: any): void {
  const cacheKey = `${location.toLowerCase()}_${units}_${includeforecast}`;
  weatherCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    location,
    units
  });
}

/**
 * Execute weather search
 */
async function executeGetWeather(params: GetWeatherParams): Promise<any> {
  const config = getWeatherConfig();
  
  // Resolve location and units from parameters or config defaults
  const location = params.location || config.defaultLocation;
  const units = params.units || config.units;
  
  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit('weather-api', config.rateLimitPerHour, 3600000);
    if (!rateLimitResult) {
      return createErrorResult('Rate limit exceeded. Please wait before making more weather requests.');
    }

    // Check for API key
    if (!config.apiKey) {
      return createErrorResult('OpenWeatherMap API key not configured. Please run \'bibble config weather\' to set up your API key.');
    }
    
    // If no location specified and no default configured, return helpful error
    if (!location) {
      return createErrorResult('No location specified. Please provide a location in your request or configure a default location with \'bibble config weather\'.');
    }

    // Check cache first
    const cached = getCachedWeather(location, units, params.includeforecast);
    if (cached) {
      return createSuccessResult(cached.data, 'Weather data retrieved from cache');
    }

    console.log(`[WEATHER] Getting weather for: ${location} (${units} units)`);

    // Prepare API requests
    const requests = [];
    
    // Current weather request
    const currentUrl = `${config.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${config.apiKey}&units=${units}`;
    requests.push(axios.get(currentUrl, { timeout: config.requestTimeoutMs }));

    // Forecast request if needed
    if (params.includeforecast) {
      const forecastUrl = `${config.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${config.apiKey}&units=${units}&cnt=${params.forecastDays * 8}`; // 8 forecasts per day (3-hour intervals)
      requests.push(axios.get(forecastUrl, { timeout: config.requestTimeoutMs }));
    }

    const responses = await Promise.all(requests);
    const currentWeatherResponse = responses[0];
    const forecastResponse = responses[1];

    // Process current weather data
    const current = currentWeatherResponse.data;
    const weatherData: WeatherData = {
      location: `${current.name}, ${current.sys.country}`,
      country: current.sys.country,
      temperature: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      windSpeed: current.wind?.speed || 0,
      windDirection: current.wind?.deg || 0,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      visibility: current.visibility ? current.visibility / 1000 : 0, // Convert to km
      uvIndex: current.uvi,
      cloudiness: current.clouds.all,
      sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString(),
      timezone: `UTC${current.timezone >= 0 ? '+' : ''}${current.timezone / 3600}`,
      units: units
    };

    let result: any = weatherData;

    // Process forecast data if requested
    if (params.includeforecast && forecastResponse) {
      const forecast = forecastResponse.data;
      const dailyForecasts: WeatherForecast[] = [];
      
      // Group forecasts by day and take the midday forecast
      const forecastsByDay = new Map<string, any[]>();
      
      forecast.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!forecastsByDay.has(date)) {
          forecastsByDay.set(date, []);
        }
        forecastsByDay.get(date)!.push(item);
      });

      // Process each day's forecast
      forecastsByDay.forEach((dayForecasts, date) => {
        if (dailyForecasts.length >= params.forecastDays) return;
        
        // Find temps for the day
        const temps = dayForecasts.map(f => f.main.temp);
        const descriptions = dayForecasts.map(f => f.weather[0].description);
        const winds = dayForecasts.map(f => f.wind?.speed || 0);
        const humidity = dayForecasts.map(f => f.main.humidity);
        
        // Use midday forecast or first available
        const representative = dayForecasts[Math.floor(dayForecasts.length / 2)] || dayForecasts[0];
        
        dailyForecasts.push({
          date,
          temperature: {
            min: Math.min(...temps),
            max: Math.max(...temps)
          },
          description: representative.weather[0].description,
          icon: representative.weather[0].icon,
          humidity: Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length),
          windSpeed: Math.round(winds.reduce((a, b) => a + b, 0) / winds.length)
        });
      });

      result = {
        current: weatherData,
        forecast: dailyForecasts
      };
    }

    // Cache the result
    cacheWeatherData(location, units, params.includeforecast, result);

    // Format response message
    let message = `Current weather for ${weatherData.location}:\n`;
    message += `🌡️  Temperature: ${formatTemperature(weatherData.temperature, units)} (feels like ${formatTemperature(weatherData.feelsLike, units)})\n`;
    message += `🌤️  Condition: ${weatherData.description}\n`;
    message += `💧 Humidity: ${weatherData.humidity}%\n`;
    message += `🌬️  Wind: ${formatWindSpeed(weatherData.windSpeed, units)} ${getWindDirection(weatherData.windDirection)}\n`;
    message += `🔍 Visibility: ${weatherData.visibility}km\n`;
    message += `☁️  Cloudiness: ${weatherData.cloudiness}%\n`;
    message += `🌅 Sunrise: ${weatherData.sunrise} | Sunset: ${weatherData.sunset}\n`;
    
    if (params.includeforecast && 'forecast' in result) {
      message += `\n📅 ${params.forecastDays}-Day Forecast:\n`;
      result.forecast.forEach((day: WeatherForecast, index: number) => {
        const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.date;
        message += `  ${dayName}: ${formatTemperature(day.temperature.max, units)}/${formatTemperature(day.temperature.min, units)} - ${day.description}\n`;
      });
    }

    return createSuccessResult(result, message);

  } catch (error: any) {
    console.error('[WEATHER] Error getting weather:', error.message);
    
    if (error.response?.status === 401) {
      return createErrorResult('Invalid OpenWeatherMap API key. Please check your API key configuration.');
    } else if (error.response?.status === 404) {
      return createErrorResult(`Location "${location}" not found. Please check the spelling or try a different location format (city name, zip code, or coordinates).`);
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return createErrorResult('Unable to connect to OpenWeatherMap API. Please check your internet connection.');
    } else if (error.code === 'ECONNABORTED') {
      return createErrorResult('Weather request timed out. Please try again.');
    }
    
    return createErrorResult(`Failed to get weather data: ${error.message}`);
  }
}

// Export the tool
export const getWeatherTool: BuiltInTool = {
  name: 'get-weather',
  description: 'Get current weather and optional forecast for a location using OpenWeatherMap API. Location is optional if default location is configured. Supports cities, zip codes, and coordinates. Configure with \'bibble config weather\'.',
  category: 'weather',
  parameters: GetWeatherSchema,
  execute: executeGetWeather
};

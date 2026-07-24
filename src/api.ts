import { Location, WeatherData } from './types';

export async function searchLocations(query: string): Promise<Location[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch locations", error);
    return [];
  }
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
    const data = await res.json();
    
    if (!data.current || !data.daily) return null;

    const current = {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      isDay: data.current.is_day,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      time: data.current.time,
    };

    const daily = data.daily.time.map((timeStr: string, index: number) => ({
      time: timeStr,
      weatherCode: data.daily.weather_code[index],
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      precipProbability: data.daily.precipitation_probability_max[index],
    }));

    return {
      current,
      daily,
      timezone: data.timezone,
    };
  } catch (error) {
    console.error("Failed to fetch weather data", error);
    return null;
  }
}

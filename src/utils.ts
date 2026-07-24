import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  LucideIcon
} from 'lucide-react';

export function getWeatherMeta(code: number, isDay: number = 1): { label: string, icon: LucideIcon } {
  const meta: Record<number, { label: string, icon: LucideIcon }> = {
    0: { label: 'Clear sky', icon: isDay ? Sun : Moon },
    1: { label: 'Mainly clear', icon: isDay ? CloudSun : CloudMoon },
    2: { label: 'Partly cloudy', icon: isDay ? CloudSun : CloudMoon },
    3: { label: 'Overcast', icon: Cloud },
    45: { label: 'Fog', icon: CloudFog },
    48: { label: 'Depositing rime fog', icon: CloudFog },
    51: { label: 'Light drizzle', icon: CloudDrizzle },
    53: { label: 'Moderate drizzle', icon: CloudDrizzle },
    55: { label: 'Dense drizzle', icon: CloudDrizzle },
    56: { label: 'Light freezing drizzle', icon: CloudDrizzle },
    57: { label: 'Dense freezing drizzle', icon: CloudDrizzle },
    61: { label: 'Slight rain', icon: CloudRain },
    63: { label: 'Moderate rain', icon: CloudRain },
    65: { label: 'Heavy rain', icon: CloudRain },
    66: { label: 'Light freezing rain', icon: CloudRain },
    67: { label: 'Heavy freezing rain', icon: CloudRain },
    71: { label: 'Slight snow', icon: CloudSnow },
    73: { label: 'Moderate snow', icon: CloudSnow },
    75: { label: 'Heavy snow', icon: CloudSnow },
    77: { label: 'Snow grains', icon: CloudSnow },
    80: { label: 'Slight rain showers', icon: CloudRain },
    81: { label: 'Moderate rain showers', icon: CloudRain },
    82: { label: 'Violent rain showers', icon: CloudRain },
    85: { label: 'Slight snow showers', icon: CloudSnow },
    86: { label: 'Heavy snow showers', icon: CloudSnow },
    95: { label: 'Thunderstorm', icon: CloudLightning },
    96: { label: 'Thunderstorm with slight hail', icon: CloudLightning },
    99: { label: 'Thunderstorm with heavy hail', icon: CloudLightning },
  };

  return meta[code] || { label: 'Unknown', icon: isDay ? Sun : Moon };
}

export function generateRecommendations(code: number, temp: number): string[] {
  const recommendations: string[] = [];
  
  if (temp < 10) {
    recommendations.push("Wear a heavy coat and bundle up.");
  } else if (temp < 18) {
    recommendations.push("A light jacket or sweater is recommended.");
  } else if (temp > 28) {
    recommendations.push("Stay hydrated and wear light clothing.");
    if (code === 0 || code === 1) {
      recommendations.push("Don't forget your sunglasses and sunscreen!");
    }
  } else {
    recommendations.push("Perfect weather for outdoor activities.");
  }

  // Rain/Snow conditions
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    recommendations.push("Bring an umbrella and wear waterproof shoes.");
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    recommendations.push("Expect snowy conditions. Dress warmly and wear boots.");
  } else if ([95, 96, 99].includes(code)) {
    recommendations.push("Thunderstorms expected. Better to stay indoors if possible.");
  } else if ([45, 48].includes(code)) {
    recommendations.push("Foggy conditions. Drive carefully if commuting.");
  }

  return recommendations;
}

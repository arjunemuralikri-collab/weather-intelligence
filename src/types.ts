export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  isDay: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  time: string;
}

export interface DailyForecast {
  time: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipProbability: number;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  timezone: string;
}

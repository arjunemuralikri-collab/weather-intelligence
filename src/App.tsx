import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Wind, Droplets, Thermometer, Calendar, Loader2, CloudSun } from 'lucide-react';
import { searchLocations, getWeatherData } from './api';
import { Location, WeatherData } from './types';
import { getWeatherMeta, generateRecommendations } from './utils';

export default function App() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setIsSearching(true);
        const results = await searchLocations(query);
        setLocations(results);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setLocations([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch weather when location is selected
  useEffect(() => {
    if (!selectedLocation) return;
    
    async function fetchWeather() {
      setIsLoadingWeather(true);
      const data = await getWeatherData(selectedLocation!.latitude, selectedLocation!.longitude);
      setWeather(data);
      setIsLoadingWeather(false);
    }
    
    fetchWeather();
  }, [selectedLocation]);

  const handleSelectLocation = (loc: Location) => {
    setSelectedLocation(loc);
    setQuery(`${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}`);
    setShowDropdown(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6 lg:p-8 flex flex-col overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto space-y-6 flex-grow flex flex-col">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-2">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CloudSun className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Weather<span className="text-indigo-400">Intelligence</span></h1>
          </div>

          {/* Search Section */}
          <div className="relative w-full md:w-96" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search city... (e.g. Tokyo, JP)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (locations.length > 0) setShowDropdown(true); }}
                className="w-full bg-slate-900 border border-slate-800 rounded-full py-2.5 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-500 text-slate-100"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 text-slate-500 w-5 h-5 animate-spin" />
              )}
            </div>

            <AnimatePresence>
              {showDropdown && locations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-2 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden"
                >
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors border-b border-slate-800/50 last:border-0"
                    >
                      <MapPin className="text-slate-500 w-4 h-4 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-slate-200">{loc.name}</div>
                        <div className="text-sm text-slate-500">
                          {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Loading State */}
        {isLoadingWeather && (
          <div className="flex justify-center items-center py-20 flex-grow">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Dashboard */}
        {!isLoadingWeather && weather && selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-grow"
          >
            {/* Current Weather Card */}
            <div className="md:col-span-8 md:row-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="z-10">
                <h2 className="text-5xl font-bold mb-1">{selectedLocation.name}</h2>
                <p className="text-slate-400 text-lg mb-8">{selectedLocation.admin1 ? `${selectedLocation.admin1}, ` : ''}{selectedLocation.country}</p>
                <div className="flex items-end gap-3">
                  <span className="text-9xl font-black leading-none">{Math.round(weather.current.temperature)}°</span>
                  <div className="flex flex-col pb-3">
                    {(() => {
                      const { icon: WeatherIcon, label } = getWeatherMeta(weather.current.weatherCode, weather.current.isDay);
                      return (
                        <>
                          <WeatherIcon className="w-8 h-8 text-slate-400 mb-1 hidden sm:block" />
                          <span className="text-3xl text-slate-400 font-medium">{label}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div className="z-10 flex flex-col justify-end items-end mt-8">
                <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2 mb-8 hidden sm:flex">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Live Update</span>
                </div>
                <div className="grid grid-cols-3 gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-6 sm:pt-0 border-t border-slate-800 sm:border-none">
                  <div className="text-center sm:text-right">
                    <p className="text-slate-500 text-xs uppercase mb-1">Wind</p>
                    <p className="text-xl font-bold">{Math.round(weather.current.windSpeed)}<span className="text-sm font-normal text-slate-400">km/h</span></p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-slate-500 text-xs uppercase mb-1">Humidity</p>
                    <p className="text-xl font-bold">{weather.current.humidity}<span className="text-sm font-normal text-slate-400">%</span></p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-slate-500 text-xs uppercase mb-1">Feels Like</p>
                    <p className="text-xl font-bold">{Math.round(weather.current.feelsLike)}<span className="text-sm font-normal text-slate-400">°</span></p>
                  </div>
                </div>
              </div>
              {/* Decorative background icon */}
              <CloudSun className="absolute right-[-40px] top-[-40px] opacity-[0.03] w-[400px] h-[400px] text-slate-100 pointer-events-none" />
            </div>

            {/* Recommendations Card */}
            <div className="md:col-span-4 md:row-span-3 bg-indigo-600 rounded-3xl p-6 md:p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Wind className="w-6 h-6" />
                Plan Smarter
              </h3>
              <div className="space-y-4 flex-grow">
                {generateRecommendations(weather.current.weatherCode, weather.current.temperature).map((rec, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-indigo-500/40 p-4 rounded-2xl border border-white/10"
                  >
                    <p className="text-sm leading-relaxed text-indigo-50">{rec}</p>
                  </motion.div>
                ))}
              </div>
              <button className="mt-6 w-full bg-white text-indigo-600 font-bold py-3 rounded-2xl shadow-xl transition-transform hover:scale-[1.02]">View Detailed Report</button>
            </div>

            {/* 7-Day Forecast */}
            <div className="md:col-span-8 md:row-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-100">7-Day Forecast</h3>
                <p className="text-indigo-400 text-sm font-semibold cursor-pointer hover:text-indigo-300">Full Calendar &rarr;</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {weather.daily.map((day, i) => {
                  const { icon: DayIcon } = getWeatherMeta(day.weatherCode, 1);
                  const isToday = i === 0;
                  return (
                    <div key={i} className={`rounded-2xl p-4 flex flex-col items-center border ${isToday ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/40 border-slate-800'}`}>
                      <span className={`text-xs font-medium mb-2 ${isToday ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {isToday ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(day.time))}
                      </span>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${isToday ? 'bg-white/20' : 'bg-indigo-500/20'}`}>
                        <DayIcon className={`w-6 h-6 ${isToday ? 'text-white' : 'text-indigo-400'}`} />
                      </div>
                      <p className={`text-lg font-bold ${isToday ? 'text-white' : 'text-slate-100'}`}>{Math.round(day.maxTemp)}°</p>
                      <p className={`text-xs ${isToday ? 'text-indigo-200' : 'text-slate-500'}`}>{Math.round(day.minTemp)}°</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}
        
        {!selectedLocation && !isLoadingWeather && (
          <div className="py-20 text-center flex flex-col items-center justify-center flex-grow">
            <MapPin className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-xl text-slate-600 font-medium">Search for a location to see the weather</p>
          </div>
        )}

      </div>
    </div>
  );
}

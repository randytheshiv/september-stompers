import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, TrendingUp, TrendingDown, Award, Zap, Save } from 'lucide-react';
import Head from 'next/head';

// NYC/Nassau County coordinates
const NYC_COORDS = { lat: 40.7128, lon: -74.0060 };

// Unique distance comparisons - one per person (80+ landmarks!)
const UNIQUE_DISTANCES = [
  // Original 18
  { name: 'Empire State Building Height', distance: 1454 },
  { name: 'Central Park Length', distance: 2650 },
  { name: 'Golden Gate Bridge Length', distance: 8981 },
  { name: 'Statue of Liberty Height', distance: 305 },
  { name: 'Washington Monument Height', distance: 555 },
  { name: 'Big Ben Height', distance: 316 },
  { name: 'Eiffel Tower Height', distance: 1083 },
  { name: 'One Football Field', distance: 300 },
  { name: 'One Mile', distance: 5280 },
  { name: 'One Kilometer', distance: 3281 },
  { name: 'Burj Khalifa Height', distance: 2717 },
  { name: 'Christ the Redeemer Height', distance: 1145 },
  { name: 'Leaning Tower of Pisa Height', distance: 183 },
  { name: 'Sagrada Familia Height', distance: 2555 },
  { name: 'Arc de Triomphe Height', distance: 49 },
  { name: 'Tower Bridge Length', distance: 244 },
  { name: 'Brooklyn Bridge Length', distance: 3455 },
  { name: 'Sydney Opera House Height', distance: 220 },
  
  // Additional Famous Landmarks
  { name: 'Statue of Christ the Redeemer Length', distance: 98 },
  { name: 'One-Twenty Story Building', distance: 1200 },
  { name: 'Mount Everest Base Camp to Summit', distance: 26246 },
  { name: 'Great Wall of China (one section)', distance: 13100 },
  { name: 'Taj Mahal Length', distance: 561 },
  { name: 'Colosseum Perimeter', distance: 1837 },
  { name: 'Lincoln Memorial Height', distance: 190 },
  { name: 'Space Needle Height', distance: 605 },
  { name: 'CN Tower Height', distance: 1136 },
  { name: 'Petronas Twin Towers Height', distance: 1483 },
  { name: 'One World Trade Center Height', distance: 1776 },
  { name: 'Chrysler Building Height', distance: 1046 },
  { name: 'Woolworth Building Height', distance: 792 },
  { name: 'Transamerica Pyramid Height', distance: 853 },
  { name: 'Willis Tower Height', distance: 1450 },
  { name: 'Trump Tower Height', distance: 664 },
  
  // Bridges & Structures
  { name: 'Suspension Bridge (average)', distance: 3280 },
  { name: 'George Washington Bridge', distance: 3500 },
  { name: 'Verrazano Bridge', distance: 13632 },
  { name: 'London Bridge', distance: 928 },
  { name: 'Millennium Bridge', distance: 330 },
  { name: 'Akashi Kaikyo Bridge', distance: 30105 },
  { name: 'Forth Bridge', distance: 8296 },
  
  // Geographic Distances
  { name: 'New York to Boston', distance: 215136 },
  { name: 'San Francisco to Los Angeles', distance: 383040 },
  { name: 'New York to Philadelphia', distance: 95040 },
  { name: 'Manhattan Length', distance: 33660 },
  { name: 'Manhattan Width', distance: 11484 },
  { name: 'Lake Michigan Length', distance: 307680 },
  { name: 'English Channel Width', distance: 106920 },
  { name: 'Grand Canyon Width', distance: 264480 },
  
  // Sports Distances
  { name: 'American Football Field (100 yards)', distance: 300 },
  { name: 'Soccer Field Length', distance: 360 },
  { name: 'Basketball Court Length', distance: 94 },
  { name: 'Tennis Court Length', distance: 78 },
  { name: 'Baseball Infield', distance: 360 },
  { name: 'Track & Field Circuit', distance: 1312 },
  { name: 'Olympic Marathon Distance', distance: 138336 },
  { name: 'Ironman Triathlon Run', distance: 138336 },
  
  // Nature & Geology
  { name: 'Mount Fuji Height', distance: 12388 },
  { name: 'Mount Kilimanjaro Height', distance: 19341 },
  { name: 'Machu Picchu Elevation', distance: 7970 },
  { name: 'Dead Sea Depth', distance: 1410 },
  { name: 'Mariana Trench Depth', distance: 358367 },
  { name: 'Victoria Falls Height', distance: 355 },
  { name: 'Niagara Falls Height', distance: 188 },
  { name: 'Yellowstone Geyser Height', distance: 180 },
  
  // Historical Routes
  { name: 'Route 66 (Chicago to LA)', distance: 2448960 },
  { name: 'Oregon Trail Length', distance: 2170560 },
  { name: 'Appalachian Trail Length', distance: 2190240 },
  { name: 'Trans-Siberian Railway', distance: 5815200 },
  
  // Speed Records & Distances
  { name: 'Speed of Sound (1 second)', distance: 1125 },
  { name: 'Usain Bolt 100m Record', distance: 328 },
  { name: 'Marathon Distance', distance: 138336 },
  { name: 'Half Marathon Distance', distance: 69168 },
  { name: '5K Race', distance: 16404 },
  { name: '10K Race', distance: 32808 },
  
  // Other Famous Attractions
  { name: 'Disneyland Park Perimeter', distance: 15840 },
  { name: 'Times Square Length', distance: 900 },
  { name: 'Shibuya Crossing Width', distance: 492 },
  { name: 'Red Square Moscow', distance: 2330 },
  { name: 'St. Peter\'s Basilica Height', distance: 448 },
  { name: 'Vatican City Width', distance: 2625 },
  { name: 'The Great Sphinx Height', distance: 240 },
  { name: 'Parthenon Length', distance: 228 },
  { name: 'Angkor Wat Perimeter', distance: 5280 },
  { name: 'Great Pyramid Height', distance: 481 },
];

function getWeatherEmoji(code, isDay) {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code === 51 || code === 53 || code === 55) return '🌧️';
  if (code === 61 || code === 63 || code === 65) return '🌧️';
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 80 || code === 81 || code === 82) return '❄️';
  if (code === 85 || code === 86) return '❄️';
  if (code === 95 || code === 96 || code === 99) return '⛈️';
  return '🌤️';
}

function getWeatherCondition(code) {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code === 51 || code === 53 || code === 55) return 'Drizzle';
  if (code === 61 || code === 63 || code === 65) return 'Rainy';
  if (code === 71 || code === 73 || code === 75 || code === 77) return 'Snow';
  if (code === 80 || code === 81 || code === 82) return 'Rain Showers';
  if (code === 85 || code === 86) return 'Snow Showers';
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
  return 'Unknown';
}

async function fetchCurrentWeather() {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${NYC_COORDS.lat}&longitude=${NYC_COORDS.lon}&current=temperature_2m,weather_code,relative_humidity_2m,is_day&temperature_unit=fahrenheit&timezone=America/New_York`
    );
    
    if (!response.ok) throw new Error('Weather fetch failed');
    
    const weatherData = await response.json();
    const current = weatherData.current;
    
    return {
      temp: Math.round(current.temperature_2m),
      condition: getWeatherCondition(current.weather_code),
      emoji: getWeatherEmoji(current.weather_code, current.is_day),
      humidity: current.relative_humidity_2m,
      location: 'NYC/Nassau County'
    };
  } catch (err) {
    console.error('Weather fetch error:', err);
    return null;
  }
}

function getUniqueDistance(playerIndex, steps) {
  const feetWalked = steps * 2.5 / 12;
  const distance = UNIQUE_DISTANCES[playerIndex % UNIQUE_DISTANCES.length];
  
  if (feetWalked >= distance.distance * 0.8) {
    return `That's about ${(feetWalked / distance.distance).toFixed(1)}x the ${distance.name}!`;
  }
  
  return `${steps.toLocaleString()} steps`;
}

export default function StompersApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/stompers_data.json');
        if (!response.ok) throw new Error('Failed to load data');
        const jsonData = await response.json();
        setData(jsonData);
        setSelectedDay(jsonData.challenge.currentDay);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      const loadWeather = async () => {
        setWeatherLoading(true);
        const weather = await fetchCurrentWeather();
        if (weather) {
          setCurrentWeather(weather);
        }
        setWeatherLoading(false);
      };
      
      loadWeather();
      const interval = setInterval(loadWeather, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [data]);

  const handleRefreshWeather = async () => {
    setWeatherLoading(true);
    const weather = await fetchCurrentWeather();
    if (weather) {
      setCurrentWeather(weather);
    }
    setWeatherLoading(false);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>September Stompers</title>
        </Head>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-2xl">Loading stompers...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>September Stompers - Error</title>
        </Head>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-red-400 text-xl">Error: {error}</div>
        </div>
      </>
    );
  }

  if (!data) return null;

  // Get daily steps for selected day
  const getDailySteps = (day) => {
    if (day === 1) {
      // Day 1 is just the daily steps
      return data.dailyData[1];
    } else {
      // Other days: subtract previous day from current day
      const current = data.dailyData[day] || {};
      const previous = data.dailyData[day - 1] || {};
      const dailySteps = {};
      
      data.players.forEach(player => {
        const curr = current[player] || 0;
        const prev = previous[player] || 0;
        dailySteps[player] = curr - prev;
      });
      
      return dailySteps;
    }
  };

  // Get cumulative totals
  const calculateCumulatives = () => {
    const cumulatives = {};
    data.players.forEach(player => {
      cumulatives[player] = 0;
    });

    for (let day = 1; day <= data.challenge.currentDay; day++) {
      data.players.forEach(player => {
        if (data.dailyData[day] && data.dailyData[day][player]) {
          cumulatives[player] = data.dailyData[day][player];
        }
      });
    }

    return cumulatives;
  };

  const cumulatives = calculateCumulatives();

  // Sort players by cumulative total
  const rankings = data.players
    .map((player) => ({
      name: player,
      total: cumulatives[player]
    }))
    .sort((a, b) => b.total - a.total)
    .map((player, idx) => ({
      rank: idx + 1,
      name: player.name,
      total: player.total,
      prize: idx === 0 ? data.challenge.prizes['1st'] : idx === 1 ? data.challenge.prizes['2nd'] : idx === 2 ? data.challenge.prizes['3rd'] : 0
    }));

  const daySteps = getDailySteps(selectedDay);
  
  // Get daily data for selected day
  const dayRankings = data.players
    .map((player, idx) => ({
      name: player,
      displayName: player.name,
      steps: daySteps[player] || 0,
      cumulative: cumulatives[player]
    }))
    .sort((a, b) => b.steps - a.steps);

  // Prepare cumulative chart data
  const chartData = [];
  for (let day = 1; day <= data.challenge.currentDay; day++) {
    const dayData = { day: `Day ${day}` };
    rankings.slice(0, 6).forEach(player => {
      const cumTotal = data.dailyData[day]?.[player.name] || 0;
      dayData[player.name] = cumTotal;
    });
    chartData.push(dayData);
  }

  const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <>
      <Head>
        <title>September Stompers - Live Leaderboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  SEPTEMBER STOMPERS
                </h1>
                <p className="text-gray-400 text-sm md:text-lg">
                  Day {data.challenge.currentDay}/{data.challenge.totalDays} • {data.players.length} Players • ${data.challenge.prizePool}
                </p>
              </div>
              
              {/* Weather Display for Selected Day */}
              {data.weather && data.weather[selectedDay] && (
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 md:p-6 text-center md:text-right relative group w-full md:w-auto">
                  <div className="text-3xl md:text-4xl mb-2">{data.weather[selectedDay].emoji}</div>
                  <div className="text-white font-bold text-sm md:text-base mb-1">Day {selectedDay}</div>
                  <div className="text-white font-bold text-sm md:text-base mb-1">{data.weather[selectedDay].condition}</div>
                  <div className="text-xl md:text-2xl text-blue-100 font-bold">{data.weather[selectedDay].temp}°F</div>
                  <div className="text-xs md:text-sm text-blue-200">Humidity: {data.weather[selectedDay].humidity}%</div>
                </div>
              )}
            </div>
            
            {/* Prize Breakdown */}
            <div className="grid grid-cols-3 gap-2 md:flex md:gap-4 mb-4">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 md:p-4 flex flex-col md:flex-row items-center gap-2 md:gap-3">
                <Trophy size={20} className="md:block hidden" />
                <Trophy size={16} className="md:hidden" />
                <div>
                  <div className="text-xs md:text-sm opacity-90">1st</div>
                  <div className="text-lg md:text-2xl font-bold">${data.challenge.prizes['1st']}</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg p-3 md:p-4 flex flex-col md:flex-row items-center gap-2 md:gap-3">
                <Trophy size={20} className="md:block hidden" />
                <Trophy size={16} className="md:hidden" />
                <div>
                  <div className="text-xs md:text-sm opacity-90">2nd</div>
                  <div className="text-lg md:text-2xl font-bold">${data.challenge.prizes['2nd']}</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 md:p-4 flex flex-col md:flex-row items-center gap-2 md:gap-3">
                <Trophy size={20} className="md:block hidden" />
                <Trophy size={16} className="md:hidden" />
                <div>
                  <div className="text-xs md:text-sm opacity-90">3rd</div>
                  <div className="text-lg md:text-2xl font-bold">${data.challenge.prizes['3rd']}</div>
                </div>
              </div>
            </div>

            {/* Calendar Day Selector */}
            <div className="bg-gray-700/30 rounded-lg p-4 md:p-6">
              <div className="mb-4">
                <p className="text-gray-300 font-semibold text-base md:text-lg">Select a Day</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 md:p-4 overflow-x-auto">
                <div className="text-center mb-3 md:mb-4">
                  <h3 className="text-white font-bold text-base md:text-lg">September 2026</h3>
                  <p className="text-gray-400 text-xs md:text-sm">Current: Day {data.challenge.currentDay}</p>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-max md:min-w-full">
                  {/* Day headers */}
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-gray-400 font-bold text-xs md:text-sm w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    // September 2026 starts on Tuesday (day 2 of week)
                    // Days 0-1: Previous month (Aug 30-31)
                    // Days 2-31: September 1-30
                    // Days 32-34: Next month (Oct 1-3)
                    
                    if (i < 1) {
                      // Previous month days
                      return (
                        <div key={`prev-${i}`} className="text-center text-gray-600 text-xs md:text-sm w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                          {30 + i}
                        </div>
                      );
                    } else if (i < 31) {
                      // September days
                      const day = i;
                      const isAvailable = day <= data.challenge.currentDay;
                      const isSelected = selectedDay === day;
                      const isToday = day === data.challenge.currentDay;
                      
                      return (
                        <button
                          key={day}
                          onClick={() => isAvailable && setSelectedDay(day)}
                          disabled={!isAvailable}
                          className={`text-center text-xs md:text-sm font-bold w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center transition active:scale-95 ${
                            isSelected
                              ? 'bg-yellow-500 text-black border-2 border-yellow-400'
                              : isToday
                              ? 'bg-blue-500 text-white'
                              : isAvailable
                              ? 'bg-gray-700 text-white active:bg-gray-600 cursor-pointer'
                              : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    } else {
                      // Next month days
                      return (
                        <div key={`next-${i}`} className="text-center text-gray-600 text-xs md:text-sm w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                          {i - 30}
                        </div>
                      );
                    }
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-400 space-y-1 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-700 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-900 rounded"></div>
                    <span>Not yet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">
          {/* Top 3 Podium */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-400" size={24} />
              Overall Leaders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              {rankings.slice(0, 3).map((player, idx) => (
                <div
                  key={player.name}
                  className={`rounded-lg p-4 md:p-6 border-2 ${
                    idx === 0
                      ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-500 md:scale-105'
                      : idx === 1
                      ? 'bg-gradient-to-br from-gray-700/40 to-gray-600/20 border-gray-400'
                      : 'bg-gradient-to-br from-orange-900/40 to-orange-800/20 border-orange-500'
                  }`}
                >
                  <div className="text-3xl md:text-4xl mb-2">{getMedalEmoji(idx + 1)}</div>
                  <div className="text-lg md:text-xl font-bold mb-1 break-words">{player.name}</div>
                  <div className="text-2xl md:text-3xl font-black text-yellow-300 mb-2">
                    {player.total.toLocaleString()}
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 mb-2 leading-tight">
                    {getUniqueDistance(rankings.indexOf(player), player.total)}
                  </div>
                  <div className={`text-base md:text-lg font-bold ${
                    idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-orange-400'
                  }`}>
                    ${player.prize}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Insights */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
              <Zap className="text-orange-400" size={24} />
              Today's Drama
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Biggest Gainers */}
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-600 rounded-lg p-4 md:p-6">
                <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                  🚀 Biggest Gainers (vs Yesterday)
                </h3>
                <div className="space-y-3">
                  {(() => {
                    if (selectedDay === 1) {
                      return <div className="text-gray-400 text-sm">No previous day to compare</div>;
                    }
                    
                    const todaySteps = getDailySteps(selectedDay);
                    const yesterdaySteps = getDailySteps(selectedDay - 1);
                    
                    const changes = data.players.map(player => ({
                      name: player,
                      today: todaySteps[player] || 0,
                      yesterday: yesterdaySteps[player] || 0,
                      change: (todaySteps[player] || 0) - (yesterdaySteps[player] || 0)
                    }))
                    .sort((a, b) => b.change - a.change)
                    .slice(0, 3);
                    
                    return changes.map((player) => (
                      <div key={player.name} className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm md:text-base">{player.name}</div>
                          <div className="text-xs text-gray-400">{player.yesterday.toLocaleString()} → {player.today.toLocaleString()}</div>
                        </div>
                        <div className="text-green-400 font-bold">+{player.change.toLocaleString()}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Biggest Losers */}
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-600 rounded-lg p-4 md:p-6">
                <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                  📉 Biggest Fallers (vs Yesterday)
                </h3>
                <div className="space-y-3">
                  {(() => {
                    if (selectedDay === 1) {
                      return <div className="text-gray-400 text-sm">No previous day to compare</div>;
                    }
                    
                    const todaySteps = getDailySteps(selectedDay);
                    const yesterdaySteps = getDailySteps(selectedDay - 1);
                    
                    const changes = data.players.map(player => ({
                      name: player,
                      today: todaySteps[player] || 0,
                      yesterday: yesterdaySteps[player] || 0,
                      change: (todaySteps[player] || 0) - (yesterdaySteps[player] || 0)
                    }))
                    .sort((a, b) => a.change - b.change)
                    .slice(0, 3);
                    
                    return changes.map((player) => (
                      <div key={player.name} className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm md:text-base">{player.name}</div>
                          <div className="text-xs text-gray-400">{player.yesterday.toLocaleString()} → {player.today.toLocaleString()}</div>
                        </div>
                        <div className="text-red-400 font-bold">{player.change.toLocaleString()}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Rank Climbers */}
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-600 rounded-lg p-4 md:p-6">
                <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                  ⬆️ Rank Climbers
                </h3>
                <div className="space-y-3">
                  {(() => {
                    // Calculate Day 1 rankings
                    const day1Data = data.dailyData[1] || {};
                    const day1Rankings = data.players
                      .map((player, idx) => ({
                        name: player,
                        rank: idx + 1,
                        total: day1Data[player] || 0
                      }))
                      .sort((a, b) => b.total - a.total)
                      .map((p, idx) => ({ ...p, rank: idx + 1 }));

                    // Find climbers (moved up from Day 1)
                    const climbers = rankings
                      .map(r => {
                        const day1Rank = day1Rankings.find(d => d.name === r.name)?.rank || 999;
                        const currentRank = rankings.indexOf(r) + 1;
                        const movement = day1Rank - currentRank;
                        return { ...r, movement, day1Rank, currentRank };
                      })
                      .filter(c => c.movement > 0)
                      .sort((a, b) => b.movement - a.movement)
                      .slice(0, 3);

                    return climbers.length > 0 ? (
                      climbers.map((player, idx) => (
                        <div key={player.name} className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-sm md:text-base">{player.name}</div>
                            <div className="text-xs text-gray-400">#{player.day1Rank} → #{player.currentRank}</div>
                          </div>
                          <div className="text-blue-400 font-bold">+{player.movement}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No changes yet</div>
                    );
                  })()}
                </div>
              </div>

              {/* Rank Fallers */}
              <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-600 rounded-lg p-4 md:p-6">
                <h3 className="text-orange-400 font-bold mb-4 flex items-center gap-2">
                  ⬇️ Rank Fallers
                </h3>
                <div className="space-y-3">
                  {(() => {
                    // Calculate Day 1 rankings
                    const day1Data = data.dailyData[1] || {};
                    const day1Rankings = data.players
                      .map((player, idx) => ({
                        name: player,
                        rank: idx + 1,
                        total: day1Data[player] || 0
                      }))
                      .sort((a, b) => b.total - a.total)
                      .map((p, idx) => ({ ...p, rank: idx + 1 }));

                    // Find fallers (moved down from Day 1)
                    const fallers = rankings
                      .map(r => {
                        const day1Rank = day1Rankings.find(d => d.name === r.name)?.rank || 999;
                        const currentRank = rankings.indexOf(r) + 1;
                        const movement = day1Rank - currentRank;
                        return { ...r, movement, day1Rank, currentRank };
                      })
                      .filter(c => c.movement < 0)
                      .sort((a, b) => a.movement - b.movement)
                      .slice(0, 3);

                    return fallers.length > 0 ? (
                      fallers.map((player, idx) => (
                        <div key={player.name} className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-sm md:text-base">{player.name}</div>
                            <div className="text-xs text-gray-400">#{player.day1Rank} → #{player.currentRank}</div>
                          </div>
                          <div className="text-orange-400 font-bold">{player.movement}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No changes yet</div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Cumulative Chart */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 md:p-6 mb-8 md:mb-12">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={24} />
              Progress Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 10 }} />
                <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {rankings.slice(0, 6).map((player, idx) => (
                  <Line
                    key={player.name}
                    type="monotone"
                    dataKey={player.name}
                    stroke={colors[idx]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-gray-400 text-xs md:text-sm mt-4">Top 6 players • Cumulative totals</p>
          </div>

          {/* Daily Steps for Selected Day */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 md:p-6 mb-8 md:mb-12">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Day {selectedDay} Steps</h2>
            
            {/* Mobile: Card View */}
            <div className="md:hidden space-y-2">
              {dayRankings.map((player, idx) => (
                <div key={player.name} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400 w-6">{idx + 1}</span>
                      <div>
                        <div className="font-semibold text-sm truncate max-w-xs">{player.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <div>
                      <div className="text-gray-400">Today</div>
                      <div className="text-cyan-400 font-bold">{(player.steps || 0).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400">Total</div>
                      <div className="text-yellow-300 font-bold">{player.cumulative.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold text-xs md:text-sm">#</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold text-xs md:text-sm">Name</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold text-xs md:text-sm">Today</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold text-xs md:text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRankings.map((player, idx) => (
                    <tr
                      key={player.name}
                      className="border-b border-gray-700 hover:bg-gray-700/30 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-300 text-xs md:text-base">{idx + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm truncate max-w-xs">{player.name}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-cyan-400 font-bold text-xs md:text-base">
                        {(player.steps || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-yellow-300 font-bold text-xs md:text-base">
                        {player.cumulative.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall Leaderboard */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <h2 className="text-lg md:text-2xl font-bold">Cumulative Leaderboard</h2>
            </div>
            
            {/* Mobile: Card View */}
            <div className="md:hidden space-y-2 p-4">
              {rankings.map((player, idx) => (
                <div
                  key={player.name}
                  className={`rounded-lg p-4 border border-gray-600 ${
                    idx < 3 ? 'bg-gray-700/40' : 'bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">{getMedalEmoji(idx + 1)}</span>
                      <div>
                        <div className="font-bold text-sm text-white truncate">{player.name}</div>
                        <div className="text-xs text-gray-400">#{idx + 1}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {player.prize > 0 && (
                        <div className="font-bold text-green-400 text-sm">${player.prize}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-yellow-300 font-bold text-base mb-1">
                    {player.total.toLocaleString()} steps
                  </div>
                  <div className="text-xs text-gray-300">
                    {getUniqueDistance(idx, player.total)}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">#</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">Player</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold">Steps</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">Fun Fact</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold">Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((player, idx) => (
                    <tr
                      key={player.name}
                      className={`border-b border-gray-700 hover:bg-gray-700/30 transition ${
                        idx < 3 ? 'bg-gray-700/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold">
                          {getMedalEmoji(idx + 1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{player.name}</td>
                      <td className="px-6 py-4 text-right text-yellow-300 font-bold">
                        {player.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-left text-sm text-gray-300">
                        {getUniqueDistance(idx, player.total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {player.prize > 0 ? (
                          <span className="font-bold text-green-400">${player.prize}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 md:mt-12 text-center text-gray-500 text-xs md:text-sm border-t border-gray-700 pt-6 md:pt-8 pb-4">
            <p>Day {data.challenge.currentDay} • Update: 9:00pm</p>
            <p className="mt-2">Good luck, Stompers! 👟⚡</p>
          </div>
        </div>
      </div>
    </>
  );
}

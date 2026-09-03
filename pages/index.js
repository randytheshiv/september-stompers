import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, TrendingDown, Award, Zap } from 'lucide-react';
import Head from 'next/head';

// Fun distance comparisons
const DISTANCE_COMPARISONS = {
  'Empire State Building Height': 1454,
  'Central Park Length': 2650,
  'Golden Gate Bridge Length': 8981,
  'Statue of Liberty Height': 305,
  'Washington Monument Height': 555,
  'Big Ben Height': 316,
  'Eiffel Tower Height': 1083,
  'Football Field': 300,
  'Mile': 5280,
  'Kilometer': 3281,
};

// Achievement stickers/emojis
const ACHIEVEMENTS = {
  firstPlace: '🥇',
  secondPlace: '🥈',
  thirdPlace: '🥉',
  hottestDay: '🔥',
  climbed: '📈',
  fell: '📉',
  milestone10k: '🎉',
  milestone20k: '⭐',
  milestone30k: '✨',
  personalBest: '💪',
  consistent: '🔥',
  comeback: '🚀',
};

function getDistanceContext(steps) {
  const feetWalked = steps * 2.5 / 12; // Approximate feet from steps
  
  let bestMatch = null;
  let smallestDifference = Infinity;
  
  Object.entries(DISTANCE_COMPARISONS).forEach(([name, distance]) => {
    const difference = Math.abs(feetWalked - distance);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestMatch = { name, distance, feetWalked };
    }
  });
  
  if (bestMatch && feetWalked >= bestMatch.distance * 0.8) {
    return `That's about ${(bestMatch.feetWalked / bestMatch.distance).toFixed(1)}x the height of ${bestMatch.name}!`;
  }
  
  return `${steps.toLocaleString()} steps!`;
}

function getAchievementStickers(player, rank, dayData, previousDayData, totalSteps) {
  const stickers = [];
  
  // Placement medals
  if (rank === 1) stickers.push({ emoji: '🥇', label: '1st Place' });
  if (rank === 2) stickers.push({ emoji: '🥈', label: '2nd Place' });
  if (rank === 3) stickers.push({ emoji: '🥉', label: '3rd Place' });
  
  // Daily progress stickers
  if (dayData && previousDayData) {
    const dayGain = dayData - previousDayData;
    const previousDayGain = previousDayData > 0 ? dayData - previousDayData : 0;
    
    if (dayGain > 3000) {
      stickers.push({ emoji: '🚀', label: 'Big Day!' });
    }
    if (dayGain > 5000) {
      stickers.push({ emoji: '💥', label: 'Crushed It!' });
    }
  }
  
  // Milestone stickers
  if (totalSteps >= 30000) stickers.push({ emoji: '✨', label: '30k Steps!' });
  else if (totalSteps >= 20000) stickers.push({ emoji: '⭐', label: '20k Steps!' });
  else if (totalSteps >= 10000) stickers.push({ emoji: '🎉', label: '10k Steps!' });
  
  return stickers;
}

// NYC/Nassau County coordinates
const NYC_COORDS = { lat: 40.7128, lon: -74.0060 };

// Get weather emoji based on weather code
function getWeatherEmoji(code, isDay) {
  // WMO Weather interpretation codes
  if (code === 0) return '☀️'; // Clear
  if (code === 1 || code === 2) return '⛅'; // Partly cloudy
  if (code === 3) return '☁️'; // Overcast
  if (code === 45 || code === 48) return '🌫️'; // Foggy
  if (code === 51 || code === 53 || code === 55) return '🌧️'; // Drizzle
  if (code === 61 || code === 63 || code === 65) return '🌧️'; // Rain
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 80 || code === 81 || code === 82) return '❄️'; // Snow/sleet
  if (code === 85 || code === 86) return '❄️'; // Snow showers
  if (code === 80 || code === 81 || code === 82) return '🌧️'; // Rain showers
  if (code === 95 || code === 96 || code === 99) return '⛈️'; // Thunderstorm
  return '🌤️'; // Default
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

// Fetch weather from Open-Meteo API (free, no API key needed)
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

export default function StompersApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/stompers_data.json');
        if (!response.ok) throw new Error('Failed to load data');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch weather on component mount and when data updates
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
      
      // Refresh weather every 15 minutes
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

  // Calculate cumulative totals for each player
  const calculateCumulatives = () => {
    const cumulatives = {};
    const dailyDataArray = Object.keys(data.dailyData)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(day => parseInt(day));

    data.players.forEach(player => {
      cumulatives[player] = 0;
    });

    dailyDataArray.forEach(day => {
      data.players.forEach(player => {
        if (data.dailyData[day] && data.dailyData[day][player]) {
          cumulatives[player] += data.dailyData[day][player];
        }
      });
    });

    return cumulatives;
  };

  const cumulatives = calculateCumulatives();

  // Calculate climb/fall changes
  const calculateClimbFall = () => {
    const climbFall = {};
    
    data.players.forEach(player => {
      const currentDay = data.challenge.currentDay;
      const previousDay = currentDay - 1;
      
      if (previousDay > 0 && data.dailyData[currentDay] && data.dailyData[previousDay]) {
        const currentTotal = data.dailyData[currentDay][player] || 0;
        const previousTotal = data.dailyData[previousDay][player] || 0;
        const dailyGain = currentTotal - previousTotal;
        
        climbFall[player] = dailyGain;
      } else {
        climbFall[player] = 0;
      }
    });
    
    return climbFall;
  };
  
  const climbFall = calculateClimbFall();

  // Sort players by cumulative total
  const rankings = data.players
    .map((player, idx) => ({
      rank: idx + 1,
      name: player,
      total: cumulatives[player],
      dailyGain: climbFall[player],
      prize: idx === 0 ? data.challenge.prizes['1st'] : idx === 1 ? data.challenge.prizes['2nd'] : idx === 2 ? data.challenge.prizes['3rd'] : 0
    }))
    .sort((a, b) => b.total - a.total);

  // Prepare chart data
  const chartData = [];
  Object.keys(data.dailyData)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(day => {
      const dayData = { day: `Day ${day}` };
      const dailyCumulative = {};

      // Reset cumulatives for this day
      data.players.forEach(player => {
        dailyCumulative[player] = 0;
      });

      // Calculate cumulative up to this day
      for (let d = 1; d <= parseInt(day); d++) {
        data.players.forEach(player => {
          if (data.dailyData[d] && data.dailyData[d][player]) {
            dailyCumulative[player] += data.dailyData[d][player];
          }
        });
      }

      // Add top 6 to chart for readability
      rankings.slice(0, 6).forEach(player => {
        dayData[player.name] = dailyCumulative[player.name];
      });

      chartData.push(dayData);
    });

  const colors = [
    '#FFD700', '#C0C0C0', '#CD7F32', '#FF6B6B', '#4ECDC4', '#45B7D1'
  ];

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <>
      <Head>
        <title>September Stompers - Step Challenge Leaderboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Real-time leaderboard for the September Stompers 30-day step challenge" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  SEPTEMBER STOMPERS
                </h1>
                <p className="text-gray-400 text-lg">
                  Day {data.challenge.currentDay} of {data.challenge.totalDays} • {data.players.length} Players • ${data.challenge.prizePool} Prize Pool
                </p>
              </div>
              
              {/* Weather Display - Auto-fetched from Open-Meteo API */}
              {currentWeather && (
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-right relative group">
                  <div className="text-4xl mb-2">{currentWeather.emoji}</div>
                  <div className="text-white font-bold mb-1">{currentWeather.condition}</div>
                  <div className="text-2xl text-blue-100 font-bold">{currentWeather.temp}°F</div>
                  <div className="text-sm text-blue-200">Humidity: {currentWeather.humidity}%</div>
                  <div className="text-xs text-blue-200 mt-2 opacity-75">{currentWeather.location}</div>
                  
                  {/* Refresh button */}
                  <button
                    onClick={handleRefreshWeather}
                    disabled={weatherLoading}
                    className="absolute top-2 right-2 bg-blue-400 hover:bg-blue-300 disabled:bg-blue-500 text-white rounded-full p-1 transition text-xs"
                    title="Refresh weather"
                  >
                    {weatherLoading ? '⟳' : '↻'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Prize Breakdown */}
            <div className="flex gap-4 flex-wrap">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 flex items-center gap-3">
                <Trophy size={24} />
                <div>
                  <div className="text-sm opacity-90">1st Place</div>
                  <div className="text-2xl font-bold">${data.challenge.prizes['1st']}</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg p-4 flex items-center gap-3">
                <Trophy size={24} />
                <div>
                  <div className="text-sm opacity-90">2nd Place</div>
                  <div className="text-2xl font-bold">${data.challenge.prizes['2nd']}</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 flex items-center gap-3">
                <Trophy size={24} />
                <div>
                  <div className="text-sm opacity-90">3rd Place</div>
                  <div className="text-2xl font-bold">${data.challenge.prizes['3rd']}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Top 3 Podium */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-400" />
              Current Leaders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {rankings.slice(0, 3).map((player, idx) => {
                const stickers = getAchievementStickers(player.name, idx + 1, data.dailyData[data.challenge.currentDay]?.[player.name], data.dailyData[data.challenge.currentDay - 1]?.[player.name], player.total);
                return (
                  <div
                    key={player.name}
                    className={`rounded-lg p-6 border-2 ${
                      idx === 0
                        ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-500 md:scale-105'
                        : idx === 1
                        ? 'bg-gradient-to-br from-gray-700/40 to-gray-600/20 border-gray-400'
                        : 'bg-gradient-to-br from-orange-900/40 to-orange-800/20 border-orange-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-4xl">{getMedalEmoji(idx + 1)}</div>
                      {player.dailyGain !== 0 && (
                        <div className={`flex items-center gap-1 text-sm font-bold ${player.dailyGain > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {player.dailyGain > 0 ? '↑' : '↓'} {Math.abs(player.dailyGain).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-xl font-bold mb-1">{player.name}</div>
                    <div className="text-3xl font-black text-yellow-300 mb-2">
                      {player.total.toLocaleString()} steps
                    </div>
                    
                    {/* Achievement Stickers */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {stickers.map((sticker, i) => (
                        <div key={i} className="text-lg" title={sticker.label}>
                          {sticker.emoji}
                        </div>
                      ))}
                    </div>
                    
                    {/* Fun Measurement */}
                    <div className="text-xs text-gray-300 mb-2">
                      {getDistanceContext(player.total)}
                    </div>
                    
                    <div className={`text-lg font-bold ${
                      idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-orange-400'
                    }`}>
                      ${player.prize}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-400" />
              Cumulative Progress
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="day" 
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
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
            <p className="text-gray-400 text-sm mt-4">Showing top 6 players for clarity</p>
          </div>

          {/* Full Leaderboard */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold">Full Leaderboard</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">Rank</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">Player</th>
                    <th className="px-6 py-3 text-center text-gray-400 font-semibold">Today</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold">Total Steps</th>
                    <th className="px-6 py-3 text-center text-gray-400 font-semibold">Achievements</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold">Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((player, idx) => {
                    const stickers = getAchievementStickers(player.name, idx + 1, data.dailyData[data.challenge.currentDay]?.[player.name], data.dailyData[data.challenge.currentDay - 1]?.[player.name], player.total);
                    return (
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
                        <td className="px-6 py-4 text-center">
                          {player.dailyGain !== 0 && (
                            <span className={`font-bold text-sm ${player.dailyGain > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {player.dailyGain > 0 ? '↑' : '↓'} {Math.abs(player.dailyGain).toLocaleString()}
                            </span>
                          )}
                          {player.dailyGain === 0 && <span className="text-gray-500">-</span>}
                        </td>
                        <td className="px-6 py-4 text-right text-yellow-300 font-bold">
                          {player.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {stickers.map((sticker, i) => (
                              <span key={i} className="text-lg" title={sticker.label}>
                                {sticker.emoji}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {player.prize > 0 ? (
                            <span className="font-bold text-green-400">${player.prize}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fun Facts Section */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-12 mt-12">
            <h2 className="text-2xl font-bold mb-6">🎯 Fun Facts & Measurements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankings.slice(0, 6).map((player) => (
                <div key={player.name} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="font-bold text-yellow-300 mb-2">{player.name}</div>
                  <div className="text-2xl font-black text-white mb-2">{player.total.toLocaleString()}</div>
                  <div className="text-sm text-gray-300">{getDistanceContext(player.total)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm border-t border-gray-700 pt-8">
            <p>Updated: Day {data.challenge.currentDay} • Next update: Tomorrow at 9:00pm</p>
            <p className="mt-2">Good luck, Stompers! 👟⚡</p>
          </div>
        </div>
      </div>
    </>
  );
}

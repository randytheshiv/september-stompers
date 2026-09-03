import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, TrendingUp, TrendingDown, Award, Zap, Edit2, Save, X } from 'lucide-react';
import Head from 'next/head';

// NYC/Nassau County coordinates
const NYC_COORDS = { lat: 40.7128, lon: -74.0060 };

// Unique distance comparisons - one per person
const UNIQUE_DISTANCES = [
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
  const [editingNames, setEditingNames] = useState(false);
  const [editedNames, setEditedNames] = useState({});

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

  const handleNameEdit = (playerName, newName) => {
    setEditedNames({
      ...editedNames,
      [playerName]: newName
    });
  };

  const getDisplayName = (playerName) => {
    return editedNames[playerName] || playerName;
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
    .map((player, idx) => ({
      rank: idx + 1,
      name: player,
      total: cumulatives[player],
      prize: idx === 0 ? data.challenge.prizes['1st'] : idx === 1 ? data.challenge.prizes['2nd'] : idx === 2 ? data.challenge.prizes['3rd'] : 0
    }))
    .sort((a, b) => b.total - a.total);

  const daySteps = getDailySteps(selectedDay);
  
  // Get daily data for selected day
  const dayRankings = data.players
    .map((player, idx) => ({
      name: player,
      displayName: getDisplayName(player),
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
              
              {/* Weather Display */}
              {currentWeather && (
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-right relative group">
                  <div className="text-4xl mb-2">{currentWeather.emoji}</div>
                  <div className="text-white font-bold mb-1">{currentWeather.condition}</div>
                  <div className="text-2xl text-blue-100 font-bold">{currentWeather.temp}°F</div>
                  <div className="text-sm text-blue-200">Humidity: {currentWeather.humidity}%</div>
                  
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
            <div className="flex gap-4 flex-wrap mb-4">
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

            {/* Day Selector */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-300 font-semibold">View Daily Steps:</p>
                <button
                  onClick={() => setEditingNames(!editingNames)}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                >
                  {editingNames ? <X size={16} /> : <Edit2 size={16} />}
                  {editingNames ? 'Done' : 'Edit Names'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: data.challenge.currentDay }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded font-bold transition ${
                      selectedDay === day
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                  >
                    Day {day}
                  </button>
                ))}
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
              Current Overall Leaders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {rankings.slice(0, 3).map((player, idx) => (
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
                  <div className="text-4xl mb-2">{getMedalEmoji(idx + 1)}</div>
                  <div className="text-xl font-bold mb-1">{getDisplayName(player.name)}</div>
                  <div className="text-3xl font-black text-yellow-300 mb-2">
                    {player.total.toLocaleString()} steps
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    {getUniqueDistance(rankings.indexOf(player), player.total)}
                  </div>
                  <div className={`text-lg font-bold ${
                    idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-orange-400'
                  }`}>
                    ${player.prize}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cumulative Chart */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-400" />
              Cumulative Progress (All Days)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 12 }} />
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
            <p className="text-gray-400 text-sm mt-4">Showing cumulative totals for top 6 players</p>
          </div>

          {/* Daily Steps for Selected Day */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Steps on Day {selectedDay}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">Rank</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">Player Name</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold">Day {selectedDay} Steps</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold">Cumulative Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRankings.map((player, idx) => (
                    <tr
                      key={player.name}
                      className="border-b border-gray-700 hover:bg-gray-700/30 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-300">{idx + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        {editingNames ? (
                          <input
                            type="text"
                            value={editedNames[player.name] || player.name}
                            onChange={(e) => handleNameEdit(player.name, e.target.value)}
                            className="bg-gray-700 text-white px-2 py-1 rounded w-full"
                          />
                        ) : (
                          <span className="font-semibold">{player.displayName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-cyan-400 font-bold">
                        {player.steps.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-yellow-300 font-bold">
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
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold">Cumulative Leaderboard</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">Rank</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold">Player</th>
                    <th className="px-6 py-3 text-right text-gray-400 font-semibold">Total Steps</th>
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
                      <td className="px-6 py-4 font-semibold">{getDisplayName(player.name)}</td>
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
          <div className="mt-12 text-center text-gray-500 text-sm border-t border-gray-700 pt-8">
            <p>Updated: Day {data.challenge.currentDay} • Next update: Tomorrow at 9:00pm</p>
            <p className="mt-2">Good luck, Stompers! 👟⚡</p>
          </div>
        </div>
      </div>
    </>
  );
}

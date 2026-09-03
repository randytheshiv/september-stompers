# September Stompers Step Challenge Tracker

A real-time leaderboard and analytics dashboard for the September Stompers 30-day step challenge.

## Features

🏆 **Live Leaderboard** - Real-time rankings with prize amounts  
📈 **Cumulative Charts** - Visual progress tracking with line charts  
🎯 **30-Day Challenge** - Track steps across the full month  
⚡ **Auto-Updating** - Redeploys instantly when data changes  
📱 **Responsive Design** - Works on desktop and mobile  
🥇 **Medal System** - 🥇 🥈 🥉 for top 3 finishers

## Tech Stack

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Hosting:** Vercel (free)
- **Data:** JSON

## Quick Deploy

### 1. Fork or Clone This Repo
```bash
git clone https://github.com/yourusername/september-stompers.git
cd september-stompers
```

### 2. Deploy to Vercel
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import this GitHub repo
- Click "Deploy"

Done! Your app is live.

## Updating Daily

Every day at ~9pm, update the leaderboard:

### Via GitHub (Direct Edit)
1. Go to `public/stompers_data.json`
2. Click the edit (pencil) icon
3. Update the daily step counts
4. Commit changes
5. Vercel redeploys automatically (30 seconds)

### Data Format
```json
{
  "challenge": { ... },
  "players": [ "Player 1", "Player 2", ... ],
  "dailyData": {
    "1": { "Player 1": 21346, "Player 2": 19396, ... },
    "2": { "Player 1": 23100, "Player 2": 21500, ... },
    ...
  }
}
```

**Important:** 
- `currentDay` = today's day number (1-30)
- Each player needs an entry for every day
- Numbers are **cumulative** (include all previous days)

## Example Daily Update

**Day 1 Screenshot → Enter:**
```json
"1": {
  "Goat InYuhThroat": 21346,
  "Steven SumwhereU": 19396,
  ...
}
```

**Day 2 Screenshot → Enter:**
```json
"2": {
  "Goat InYuhThroat": 23100,
  "Steven SumwhereU": 21500,
  ...
}
```

## Sharing the Link

Once deployed, share your Vercel URL with all players:
```
https://september-stompers-xyz.vercel.app
```

Everyone can bookmark it and check standings anytime!

## Troubleshooting

**Data not updating?**
- Refresh the page (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
- Wait 30 seconds for Vercel to redeploy
- Check JSON is valid at [jsonlint.com](https://jsonlint.com)

**Vercel build failing?**
- Check the Deployments tab in Vercel for error messages
- Ensure JSON syntax is correct (no trailing commas)
- Make sure all players have entries for all days

**Need help?**
- Check `public/stompers_data.json` structure
- Verify no syntax errors in JSON
- Ensure `currentDay` matches the actual day

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see it.

## Files Structure

```
september-stompers/
├── pages/
│   ├── _app.js         # App wrapper
│   └── index.js        # Main dashboard
├── public/
│   └── stompers_data.json  # Daily leaderboard data
├── styles/
│   └── globals.css     # Tailwind CSS
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Prize Breakdown

- **1st Place:** $252 (70%)
- **2nd Place:** $72 (20%)
- **3rd Place:** $36 (10%)
- **Total Pool:** $360

## License

Created for September Stompers 2026. Go Stompers! 👟⚡

---

**Need to update the leaderboard?** Just send a screenshot and I'll handle it!

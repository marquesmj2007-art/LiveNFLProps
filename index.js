const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const ODDS_API_URL = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds';

app.get('/props', async (req, res) => {
  const { player, team, date } = req.query;
  try {
    const response = await axios.get(ODDS_API_URL, {
      params: {
        apiKey: API_KEY,
        regions: 'us',
        markets: 'player_props',
        oddsFormat: 'american'
      }
    });

    const formatted = [];
    for (const game of response.data) {
      for (const bookmaker of game.bookmakers || []) {
        for (const market of bookmaker.markets || []) {
          for (const outcome of market.outcomes || []) {
            if (
              (!player || outcome.name.toLowerCase().includes(player.toLowerCase())) &&
              (!team || game.home_team.toLowerCase().includes(team.toLowerCase()) || game.away_team.toLowerCase().includes(team.toLowerCase()))
            ) {
              formatted.push({
                player: outcome.name,
                prop_type: market.key,
                line: outcome.point,
                odds: outcome.price,
                team: `${game.home_team} vs ${game.away_team}`,
                game_time: game.commence_time
              });
            }
          }
        }
      }
    }

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching props:', err.message);
    res.status(500).json({ error: 'Error fetching props' });
  }
});

app.listen(PORT, () => console.log(`Prop API server running on port ${PORT}`));

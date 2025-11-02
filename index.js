const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.API_KEY; // this is the one you set in Render

// health / homepage
app.get("/", (req, res) => {
  res.send("🚀 Live Prop API is working!");
});

// main endpoint
app.get("/props", async (req, res) => {
  // 1) make sure we actually got the key from Render
  if (!API_KEY) {
    return res.status(500).json({
      ok: false,
      error: "Missing API_KEY in server env (Render)",
    });
  }

  // you can change markets in the URL later, but let's start with some common ones
  const markets =
    req.query.markets ||
    "player_pass_tds,player_pass_yds,player_rush_yds,player_receptions";

  try {
    const { data } = await axios.get(
      "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds",
      {
        params: {
          apiKey: API_KEY,
          regions: "us",
          markets, // 👈 this is the list above
          oddsFormat: "american",
        },
      }
    );

    // if we got here, Odds API returned something
    return res.json({
      ok: true,
      markets,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Odds API error:", err.response?.data || err.message);

    return res.status(500).json({
      ok: false,
      error: err.message,
      fromOddsApi: err.response?.data || null,
      usedMarkets: markets,
      apiKeyPresent: !!API_KEY,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Prop API server running on port ${PORT}`);
});


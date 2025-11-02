const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("🚀 Live Prop API is working!");
});

app.get("/props", async (req, res) => {
  const url = "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds";
  const params = {
    regions: "us",
    markets: "player_pass_tds,player_pass_yds,player_receptions,player_rush_yds",
    apiKey: process.env.API_KEY,
  };

  try {
    const response = await axios.get(url, { params });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching props:", error);
    res.status(500).json({ error: "Failed to fetch props" });
  }
});

app.listen(PORT, () => {
  console.log(`Prop API server running on port ${PORT}`);
});

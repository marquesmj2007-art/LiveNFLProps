const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// Underdog public endpoints
const UD_LINES_URL = "https://api.underdogfantasy.com/beta/over_under_lines";
const UD_MARKETS_URL = "https://api.underdogfantasy.com/beta/over_unders";
const UD_PLAYERS_URL = "https://api.underdogfantasy.com/beta/players";

// fallback props (so your GPT ALWAYS has something)
const FALLBACK_PROPS = [
  {
    player: "Christian McCaffrey",
    team: "SF",
    market: "rushing_yards",
    line: 69.5,
    implied_odds: "-119",
  },
  {
    player: "Amon-Ra St. Brown",
    team: "DET",
    market: "receptions",
    line: 6.5,
    implied_odds: "-119",
  },
  {
    player: "Travis Kelce",
    team: "KC",
    market: "receiving_yards",
    line: 65.5,
    implied_odds: "-115",
  },
  {
    player: "Breece Hall",
    team: "NYJ",
    market: "rushing_yards",
    line: 63.5,
    implied_odds: "-115",
  }
];

app.get("/", (req, res) => {
  res.send("🚀 Live Prop API (Underdog + fallback) is working!");
});

app.get("/props", async (req, res) => {
  try {
    // try Underdog first
    const [linesRes, marketsRes, playersRes] = await Promise.all([
      axios.get(UD_LINES_URL, { headers: { "User-Agent": "Mozilla/5.0" } }),
      axios.get(UD_MARKETS_URL, { headers: { "User-Agent": "Mozilla/5.0" } }),
      axios.get(UD_PLAYERS_URL, { headers: { "User-Agent": "Mozilla/5.0" } }),
    ]);

    const lines = linesRes.data?.over_under_lines || [];
    const markets = marketsRes.data?.over_unders || [];
    const players = playersRes.data?.players || [];

    const marketById = Object.fromEntries(markets.map((m) => [m.id, m]));
    const playerById = Object.fromEntries(players.map((p) => [p.id, p]));

    const props = lines
      .map((line) => {
        const market = marketById[line.over_under_id];
        if (!market) return null;
        const player = playerById[market.applies_to_player_id];
        if (!player) return null;

        return {
          player: player.first_name
            ? `${player.first_name} ${player.last_name || ""}`.trim()
            : player.name,
          team: player.team || player.team_abbr || null,
          market: market.stat_type || market.over_under_type || "unknown",
          line: line.stat_value ?? market.line ?? null,
          implied_odds: "-119 (UD style)",
          source: "underdog"
        };
      })
      .filter(Boolean);

    // if Underdog gave us stuff, return it
    if (props.length > 0) {
      return res.json({
        ok: true,
        source: "underdog",
        count: props.length,
        props,
      });
    }

    // else fall back
    return res.json({
      ok: true,
      source: "fallback",
      count: FALLBACK_PROPS.length,
      props: FALLBACK_PROPS,
    });
  } catch (err) {
    console.error("Underdog fetch error:", err.message);
    // return fallback no matter what
    return res.json({
      ok: true,
      source: "fallback",
      count: FALLBACK_PROPS.length,
      props: FALLBACK_PROPS,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Prop API (Underdog + fallback) server running on port ${PORT}`);
});



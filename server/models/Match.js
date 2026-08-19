const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  matchName: { type: String, required: true },
  matchDate: { type: String, required: true },
  battingTeam: { type: String, required: true },
  bowlingTeam: { type: String, required: true },
  // Scores default to 0 when the match is first created
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: String, default: "0.0" }
});

module.exports = mongoose.model('Match', MatchSchema);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Match = require('./models/Match');

// 1. Initialize the Express application
const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Connect to MongoDB
// 3. Connect to MongoDB with strict error reporting
// Replace process.env.MONGO_URI with the actual string
mongoose.connect('mongodb://127.0.0.1:27017/cricketScorer', {
  serverSelectionTimeoutMS: 2000
})
  .then(() => console.log('✅ MongoDB Successfully Connected!'))
  .catch(err => {
    console.error('❌ MONGODB CRITICAL CRASH:');
    console.error(err.message);
  });
// --- API ROUTES ---

// CREATE the match before it starts (POST)
app.post('/api/matches', async (req, res) => {
  try {
    const newMatch = new Match(req.body);
    const savedMatch = await newMatch.save();
    res.status(201).json(savedMatch); 
  } catch (error) {
    console.error("CREATE MATCH ERROR:", error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// UPDATE the match score when innings ends (PUT)
app.put('/api/matches/:id', async (req, res) => {
  try {
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id, 
      { runs: req.body.runs, wickets: req.body.wickets, overs: req.body.overs },
      { new: true } 
    );
    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error("UPDATE MATCH ERROR:", error);
    res.status(500).json({ error: 'Failed to update match score' });
  }
});

// GET all past matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find().sort({ _id: -1 });
    res.status(200).json(matches);
  } catch (error) {
    console.error("FETCH MATCHES ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// 4. Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
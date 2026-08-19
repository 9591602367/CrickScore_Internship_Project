import React, { useState, useEffect } from 'react';

function App() {
  // App Navigation State
  const [appMode, setAppMode] = useState('setup'); // Can be 'setup' or 'scoring'
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Match Setup State
  const [matchName, setMatchName] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [battingTeam, setBattingTeam] = useState('SHATHABDI');
  const [bowlingTeam, setBowlingTeam] = useState('');

  // Game Score State
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [totalBalls, setTotalBalls] = useState(0); 
  const [pastMatches, setPastMatches] = useState([]);

  useEffect(() => {
    if (appMode === 'setup') fetchMatches();
  }, [appMode]);

  const fetchMatches = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/matches');
      const data = await res.json();
      if (Array.isArray(data)) setPastMatches(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getOvers = () => `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;

  // --- STEP 1: CREATE MATCH IN DATABASE ---
  const startMatch = async (e) => {
    e.preventDefault();
    
    const newMatchData = { matchName, matchDate, battingTeam, bowlingTeam };

    try {
      const response = await fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatchData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Save the MongoDB _id so we can update this exact match later
        setCurrentMatchId(data._id); 
        setAppMode('scoring'); // Switch the screen to the scoreboard
        setStatusMessage('');
      } else {
        setStatusMessage('Error creating match. Check console.');
      }
    } catch (error) {
      setStatusMessage('Server connection error.');
    }
  };

  // --- STEP 2: UPDATE MATCH SCORE ---
  const endInnings = async () => {
    const scoreData = { runs, wickets, overs: getOvers() };

    try {
      // Notice we are sending a PUT request to the specific Match ID
      const response = await fetch(`http://localhost:5000/api/matches/${currentMatchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      });

      if (response.ok) {
        // Reset everything and go back to setup screen
        setRuns(0); setWickets(0); setTotalBalls(0);
        setMatchName(''); setMatchDate(''); setBowlingTeam('');
        setAppMode('setup'); 
        setStatusMessage('Innings saved successfully!');
      }
    } catch (error) {
      setStatusMessage('Error saving score.');
    }
  };

  // --- RENDER SETUP SCREEN ---
  if (appMode === 'setup') {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <h2>Setup New Match</h2>
        <form onSubmit={startMatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <input type="text" placeholder="Tournament / Match Name" value={matchName} onChange={(e) => setMatchName(e.target.value)} required style={inputStyle} />
          <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Batting Team" value={battingTeam} onChange={(e) => setBattingTeam(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Bowling Team" value={bowlingTeam} onChange={(e) => setBowlingTeam(e.target.value)} required style={inputStyle} />
          <button type="submit" style={{...btnStyle, backgroundColor: '#3498db', color: 'white'}}>Create & Start Match</button>
        </form>

        <p style={{ color: 'green', fontWeight: 'bold' }}>{statusMessage}</p>

        <h3>Past Matches</h3>
        <ul>
          {pastMatches.map((m) => (
            <li key={m._id} style={{ marginBottom: '0.5rem' }}>
              <strong>{m.matchName}</strong> ({m.matchDate}): {m.battingTeam} scored {m.runs}/{m.wickets} vs {m.bowlingTeam}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // --- RENDER SCORING SCREEN ---
  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <div style={{ padding: '2rem', backgroundColor: '#2c3e50', color: 'white', borderRadius: '8px' }}>
        <h4>{matchName}</h4>
        <h2>{battingTeam} vs {bowlingTeam}</h2>
        <h1 style={{ fontSize: '3.5rem', margin: '1rem 0' }}>{runs} / {wickets}</h1>
        <h3>Overs: {getOvers()}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
        {[0, 1, 2, 3, 4, 6].map(num => (
          <button key={num} onClick={() => { setRuns(r => r + num); setTotalBalls(b => b + 1); }} style={btnStyle}>{num}</button>
        ))}
        <button onClick={() => { setWickets(w => w + 1); setTotalBalls(b => b + 1); }} style={{...btnStyle, backgroundColor: '#e74c3c', color: 'white'}}>Wicket</button>
        <button onClick={() => setRuns(r => r + 1)} style={btnStyle}>Wide/NB</button>
        <button onClick={endInnings} style={{...btnStyle, backgroundColor: '#27ae60', color: 'white'}}>End & Save Score</button>
      </div>
    </div>
  );
}

const inputStyle = { padding: '0.8rem', fontSize: '1rem' };
const btnStyle = { padding: '1rem', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' };

export default App;
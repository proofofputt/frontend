import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { apiUpdateLeagueSettings } from '@/api.js';

const EditLeagueModal = ({ league, onClose, onLeagueUpdated }) => {
  const { playerData } = useAuth();
  const [numRounds, setNumRounds] = useState(league.settings.num_rounds);
  const [roundDuration, setRoundDuration] = useState(league.settings.round_duration_hours);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Construct the new settings object, preserving non-editable settings
    const newSettings = {
      ...league.settings, // Copy all existing settings first
      num_rounds: parseInt(numRounds, 10),
      round_duration_hours: parseInt(roundDuration, 10),
    };

    try {
      await apiUpdateLeagueSettings(league.league_id, playerData.player_id, newSettings);
      onLeagueUpdated(); // This will trigger a refresh and close the modal
    } catch (err) {
      setError(err.message || 'Failed to update league settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit League Schedule</h2>
        <p>You can only edit the schedule before the league begins.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="num-rounds">Number of Rounds</label>
            <select id="num-rounds" value={numRounds} onChange={(e) => setNumRounds(e.target.value)}>
              {[2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} Rounds</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="round-duration">Round Schedule</label>
            <select id="round-duration" value={roundDuration} onChange={(e) => setRoundDuration(e.target.value)}>
              <option value={1}>1 Hour</option>
              <option value={2}>2 Hours</option>
              <option value={24}>1 Day</option>
              <option value={48}>2 Days</option>
              <option value={96}>4 Days</option>
              <option value={168}>7 Days</option>
            </select>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeagueModal;
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { apiCreateLeague } from '@/api.js';

const CreateLeagueModal = ({ onClose, onLeagueCreated }) => {
  const { playerData } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [numRounds, setNumRounds] = useState(4);
  const [roundDuration, setRoundDuration] = useState(168); // Default: 7 days
  const [startOffset, setStartOffset] = useState(24); // Default: Starts in 1 day
  const [allowLateJoiners, setAllowLateJoiners] = useState(true);
  const [membersCanInvite, setMembersCanInvite] = useState(false);
  const [timeLimit, setTimeLimit] = useState(5);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('League name is required.');
      return;
    }
    setIsLoading(true);
    try {
      const settings = {
        num_rounds: parseInt(numRounds, 10),
        round_duration_hours: parseInt(roundDuration, 10),
        time_limit_minutes: parseInt(timeLimit, 10),
        start_offset_hours: parseInt(startOffset, 10),
        allow_late_joiners: allowLateJoiners,
        members_can_invite: privacy === 'private' ? membersCanInvite : true,
      };
      await apiCreateLeague(playerData.player_id, name, description, privacy, settings);
      onLeagueCreated(); // This will trigger a refresh and close the modal
    } catch (err) {
      setError(err.message || 'Failed to create league.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New League</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="league-name">League Name</label>
            <input id="league-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="league-desc">Description</label>
            <textarea id="league-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Privacy</label>
            <div className="radio-group">
              <label><input type="radio" value="private" checked={privacy === 'private'} onChange={() => setPrivacy('private')} /> Private (Invite Only)</label>
              <label><input type="radio" value="public" checked={privacy === 'public'} onChange={() => setPrivacy('public')} /> Public (Open to Join)</label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="num-rounds">Number of Rounds</label>
            <select id="num-rounds" value={numRounds} onChange={(e) => setNumRounds(e.target.value)}>
              {[2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} Rounds</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="start-time">League Starts</label>
            <select id="start-time" value={startOffset} onChange={(e) => setStartOffset(e.target.value)}>
              <option value={0}>Immediately</option>
              <option value={24}>In 1 Day</option>
              <option value={72}>In 3 Days</option>
              <option value={168}>In 1 Week</option>
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
          <div className="form-group">
            <label htmlFor="time-limit">Session Time Limit (minutes)</label>
            <select id="time-limit" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}>
              {[2, 3, 5, 10, 15].map(n => <option key={n} value={n}>{n} Minutes</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="checkbox-group">
              <input type="checkbox" checked={allowLateJoiners} onChange={(e) => setAllowLateJoiners(e.target.checked)} />
              Allow players to join after the league has started
            </label>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create League'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeagueModal;
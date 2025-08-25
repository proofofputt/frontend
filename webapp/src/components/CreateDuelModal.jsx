import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { apiSearchPlayers, apiCreateDuel } from '@/api.js';
import './CreateDuelModal.css';

const CreateDuelModal = ({ onClose, onDuelCreated }) => {
  const { playerData, showNotification } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [invitationExpiry, setInvitationExpiry] = useState(72); // Default to 72 hours
  const [sessionDuration, setSessionDuration] = useState(5); // Default to 5 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounced search function
  const searchPlayers = useCallback(async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await apiSearchPlayers(term);
      // Filter out the current user from the search results
      setSearchResults(results.filter(p => p.player_id !== playerData.player_id));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [playerData.player_id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchPlayers(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchPlayers]);

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    setSearchTerm(player.name);
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlayer || isNaN(sessionDuration) || sessionDuration <= 0 || isNaN(invitationExpiry) || invitationExpiry <= 0) {
      setError('Please select a player and provide valid time limits.');
      return;
    }
    setIsLoading(true);
    try {
      await apiCreateDuel(playerData.player_id, searchTerm, invitationExpiry * 60, sessionDuration);
      showNotification('Challenge Sent');
      onDuelCreated();
      onClose(); // Close the modal on success
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create a New Duel</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="opponent-search">Challenge a Player</label>
            <input
              type="text"
              id="opponent-search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedPlayer(null); // Clear selection when typing
              }}
              placeholder="Search by name or email..."
              autoComplete="off"
            />
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map(player => (
                  <li key={player.player_id} onClick={() => handleSelectPlayer(player)}>
                    {player.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="session-duration">Session Duration</label>
            <select
              id="session-duration"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
            >
              <option value="2">2 minutes</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="21">21 minutes</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="invitation-expiry">Invitation Expires in (hours)</label>
            <input
              type="number"
              id="invitation-expiry"
              value={invitationExpiry}
              onChange={(e) => setInvitationExpiry(parseInt(e.target.value, 10))}
              min="1"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-tertiary">Cancel</button>
            <button type="submit" className="btn" disabled={!selectedPlayer || isLoading}>
              {isLoading ? 'Creating...' : 'Create Duel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDuelModal;
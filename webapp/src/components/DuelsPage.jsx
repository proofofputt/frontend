import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx'; // Keep useAuth for playerData, showNotification
import { apiListDuels, apiAcceptDuel, apiRejectDuel, apiCreateDuel, apiStartSession } from '@/api.js';
import CreateDuelModal from '@/components/CreateDuelModal.jsx'; // Assuming this component exists
import CountdownTimer from '@/components/CountdownTimer.jsx'; // Reusing the CountdownTimer component
import './DuelsPage.css'; // Import the new stylesheet

const DuelRow = ({ duel, currentUserId, onAccept, onReject, onStartSession, onRematch, category }) => {
  const isCreator = duel.creator_id === currentUserId;
  const opponent = isCreator ? duel.invited_player_name : duel.creator_name;
  const opponentId = isCreator ? duel.invited_player_id : duel.creator_id;
  const myScore = isCreator ? duel.creator_score : duel.invited_player_score;
  const opponentScore = isCreator ? duel.invited_player_score : duel.creator_score;
  const isMyTurnToAct = duel.status === 'pending' && duel.invited_player_id === currentUserId;
  const canStartSession = duel.status === 'accepted' && ((isCreator && !duel.creator_submitted_session_id) || (!isCreator && !duel.invited_player_submitted_session_id));
  const myDuration = isCreator ? duel.creator_duration : duel.invited_duration;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return '—';
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  // For pending/active duels, show the defined time limit. For completed duels, show the actual duration.
  let sessionLengthDisplay;
  if (['pending', 'accepted'].includes(duel.status)) {
    const limitMinutes = duel.session_duration_limit_minutes;
    sessionLengthDisplay = limitMinutes ? `${limitMinutes} minute${limitMinutes !== 1 ? 's' : ''}` : '—';
  } else {
    sessionLengthDisplay = formatDuration(myDuration);
  }

  // Determine content for the "Expiration" column
  let expirationContent = '—';
  if (duel.status === 'pending' && duel.invitation_expires_at) {
    const expiresAt = new Date(duel.invitation_expires_at);
    const now = new Date();
    const differenceInHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (differenceInHours <= 100 && differenceInHours > 0) {
      expirationContent = <CountdownTimer endTime={duel.invitation_expires_at} />;
    } else {
      expirationContent = (
        <div className="countdown-timer">
          <span><strong>{formatDate(duel.invitation_expires_at)}</strong></span>
        </div>
      );
    }
  }

  // For completed or declined duels, show when the duel ended. Otherwise, this column is blank.
  const resultDate = ['completed', 'declined', 'expired'].includes(duel.status)
    ? formatDate(duel.end_time)
    : '—';

  let resultText = '';
  if (duel.status === 'completed') {
    if (duel.winner_id === null) {
      resultText = 'Draw';
    } else if (duel.winner_id === parseInt(currentUserId)) {
      resultText = 'Won';
    } else {
      resultText = 'Lost';
    }
  }

  return (
    <tr className={`duel-row status-${duel.status}`}>
      <td><span className={`status-badge status-${resultText.toLowerCase() || duel.status}`}>{resultText || duel.status}</span></td>
      <td><Link to={`/player/${opponentId}/stats`}>{opponent}</Link></td>
      {category !== 'completed' && <td className="expiration-cell">{expirationContent}</td>}
      {category === 'completed' && <td>{resultDate}</td>}
      <td style={{ textAlign: 'center' }}>{myScore ?? '—'}</td>
      <td style={{ textAlign: 'center' }}>{opponentScore ?? '—'}</td>
      <td style={{ textAlign: 'center' }}>{sessionLengthDisplay}</td>
      <td className="actions-cell"> {/* Apply class for styling */}
        {isMyTurnToAct && (
          <div className="duel-actions">
            <button onClick={() => onReject(duel.duel_id)} className="btn btn-tertiary btn-small">Decline</button>
            <button onClick={() => onAccept(duel.duel_id)} className="btn btn-secondary btn-small">Accept</button>
          </div>
        )}
        {canStartSession && (
          <button onClick={() => onStartSession(duel.duel_id)} className="btn btn-small">Start Session</button>
        )}
        {['completed', 'expired'].includes(duel.status) && (
          <button onClick={() => onRematch(duel)} className="btn btn-small">Rematch</button>
        )}
      </td>
    </tr>
  );
};

const DuelTableHeader = ({ category }) => (
  <thead>
    <tr>
      <th>Status</th>
      <th>Opponent</th>
      {category !== 'completed' && <th>Expiration</th>}
      {category === 'completed' && <th>Result Date</th>}
      <th style={{ textAlign: 'center' }}>My Score</th>
      <th style={{ textAlign: 'center' }}>Opponent Score</th>
      <th style={{ textAlign: 'center' }}>Session Length</th>
      <th className="actions-header">Actions</th>
    </tr>
  </thead>
);

const DuelsPage = () => {
  const { playerData, showNotification } = useAuth();
  const navigate = useNavigate();
  const isSubscribed = playerData?.subscription_status === 'active';
  const [duels, setDuels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateDuelClick = () => {
    if (isSubscribed) {
      setShowCreateModal(true);
    } else {
      // For free users, show a notification instead of the modal.
      showNotification("Only full subscribed users can create a duel, free users can accept challenges.", true);
    }
  };

  const fetchDuels = async () => {
    if (!playerData?.player_id) return;
    setIsLoading(true);
    try {
      const data = await apiListDuels(playerData.player_id);
      setDuels(data);
    } catch (err) {
      setError(err.message || 'Failed to load duels.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDuels();
  }, [playerData]);

  const handleDuelCreated = () => {
    setShowCreateModal(false);
    fetchDuels();
  };

  const handleAccept = async (duelId) => {
    try {
      await apiAcceptDuel(duelId, playerData.player_id);
      showNotification("Duel accepted!");
      fetchDuels();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleReject = async (duelId) => {
    try {
      await apiRejectDuel(duelId, playerData.player_id);
      showNotification("Duel rejected.");
      fetchDuels();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleRematch = async (originalDuel) => {
    if (!isSubscribed) {
      showNotification("Only full subscribed users can create a duel.", true);
      return;
    }

    const opponentId = originalDuel.creator_id === playerData.player_id
      ? originalDuel.invited_player_id
      : originalDuel.creator_id;
    
    const opponentName = originalDuel.creator_id === playerData.player_id
      ? originalDuel.invited_player_name
      : originalDuel.creator_name;

    try {
      await apiCreateDuel(playerData.player_id, opponentId, originalDuel.invitation_expiry_minutes, originalDuel.session_duration_limit_minutes);
      showNotification(`Rematch challenge sent to ${opponentName}!`);
      fetchDuels(); // Refresh the list to show the new pending duel
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleStartSession = async (duelId) => {
    try { // Import apiStartSession directly
      const response = await apiStartSession(playerData.player_id, duelId, null);
      showNotification(response.message); // Assuming showNotification is still available from useAuth
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const categorizedDuels = {
    pending: duels.filter(d => d.status === 'pending'),
    active: duels.filter(d => d.status === 'accepted'),
    completed: duels.filter(d => ['completed', 'expired'].includes(d.status)),
  };

  const renderDuelCategory = (title, duelList, categoryKey) => {
    if (duelList.length === 0) return null;

    return (
      <div className="duel-category-section" key={title}>
        <h3 className="duel-category-title">{title}</h3>
        <div className="duels-table-container">
          <table className="duels-table">
            <DuelTableHeader category={categoryKey} />
            <tbody>
              {duelList.map(duel => (
                <DuelRow
                  key={duel.duel_id}
                  duel={duel}
                  currentUserId={playerData.player_id}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onStartSession={handleStartSession}
                  onRematch={handleRematch}
                  category={categoryKey}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="duels-page">
      <div className="page-header">
        <h2>Duels</h2>
        <button onClick={handleCreateDuelClick} className="btn">Create New Duel</button>
      </div>
      {showCreateModal && <CreateDuelModal onClose={() => setShowCreateModal(false)} onDuelCreated={handleDuelCreated} />}
      {isLoading && <p style={{textAlign: 'center', padding: '2rem'}}>Loading duels...</p>}
      {error && <p className="error-message" style={{textAlign: 'center', padding: '2rem'}}>{error}</p>}
      {!isLoading && !error && duels.length === 0 && <p style={{textAlign: 'center', padding: '2rem'}}>No duels yet. Create one to get started!</p>}
      {!isLoading && !error && duels.length > 0 && (
        <>
          {renderDuelCategory('Pending Duels', categorizedDuels.pending, 'pending')}
          {renderDuelCategory('Active Duels', categorizedDuels.active, 'active')}
          {renderDuelCategory('Completed Duels', categorizedDuels.completed, 'completed')}
        </>
      )}
    </div>
  );
};

export default DuelsPage;
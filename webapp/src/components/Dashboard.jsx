import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import SessionRow from '@/components/SessionRow.jsx';
import { apiStartSession, apiStartCalibration } from '@/api.js'; // Import the API functions
import ChangePassword from '@/components/ChangePassword.jsx';
import LeaderboardCard from '@/components/LeaderboardCard.jsx';

const StatCard = ({ title, value }) => (
  <div className="stats-card">
    <h3>{title}</h3>
    <p className="stat-value">{value ?? 'N/A'}</p>
  </div>
);

function Dashboard() {
  const { playerData, refreshData } = useAuth(); // Remove startCalibration
  const isSubscribed = playerData?.subscription_status === 'active';
  const [actionError, setActionError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [notification, setNotification] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const tableWrapperRef = useRef(null);

  // This effect manages the height of the session table container
  // to "lock" the view when a row is expanded.
  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;

    if (expandedSessionId) {
      // A row is expanded. Find the key elements inside the container.
      const header = wrapper.querySelector('.session-table thead');
      const parentRow = wrapper.querySelector('.session-table tr.is-expanded-parent');
      const detailsRow = wrapper.querySelector('.session-table .session-details-row');

      if (header && parentRow && detailsRow) {
        // Calculate the exact height needed to show only these three elements.
        // Add a small 2px buffer for borders.
        const requiredHeight = header.offsetHeight + parentRow.offsetHeight + detailsRow.offsetHeight + 2;
        wrapper.style.maxHeight = `${requiredHeight}px`;

        // To fix the occlusion, programmatically scroll the container so the
        // expanded row is positioned just below the sticky header.
        wrapper.scrollTop = parentRow.offsetTop - header.offsetHeight;
      }
    } else {
      // No row is expanded, so reset the maxHeight to allow the CSS to
      // apply the default collapsed height.
      wrapper.style.maxHeight = null;
    }
  }, [expandedSessionId]); // This effect runs every time the expandedRowId changes

  useEffect(() => {
    const fetchLeaderboards = async () => {
        try {
            const response = await fetch('http://localhost:8080/leaderboard/sessions');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setLeaderboardData(data);
        } catch (error) {
            console.error("Could not fetch leaderboard data:", error);
        }
    };

    fetchLeaderboards();
  }, []); // Empty dependency array means this runs once on mount

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(''), 4000);
  };

  const handleStartSessionClick = async () => {
    setActionError('');
    try {
      // Call the imported API function directly, passing the player ID.
      const response = await apiStartSession(playerData.player_id, null, null);
      showNotification(response.message);
    } catch (err) {
      setActionError(err.message);
      showNotification(err.message, true);
    }
  };

  const handleCalibrateClick = async () => {
    setActionError('');
    try {
      const response = await apiStartCalibration(playerData.player_id);
      showNotification(response.message);
    } catch (err) {
      setActionError(err.message);
      showNotification(err.message, true);
    }
  };

  const handleRefreshClick = () => {
    setActionError('');
    refreshData(playerData.player_id);
    showNotification('Data refreshed!');
  };

  const handleToggleExpand = (sessionId) => {
    setExpandedSessionId(prevId => (prevId === sessionId ? null : sessionId));
  };

  if (!playerData || !playerData.stats) {
    return <p>Loading player data...</p>;
  }

  const { stats, sessions } = playerData;

  const totalPutts = (stats.total_makes || 0) + (stats.total_misses || 0);
  const makePercentage = totalPutts > 0 ? ((stats.total_makes / totalPutts) * 100).toFixed(1) + '%' : 'N/A';

  return (
    <>
      {notification && (
        <div className={`notification ${notification.isError ? 'error' : ''}`}>
          {notification.message}
        </div>
      )}

      <div className="dashboard-actions">
        <button onClick={handleStartSessionClick}>Start New Session</button>
        <button onClick={handleCalibrateClick} className="btn-secondary">Calibrate Camera</button>
        <button onClick={handleRefreshClick} className="btn-tertiary">Refresh Data</button>
        {actionError && <p className="error-message">{actionError}</p>}
      </div>

      <div className="stats-summary-bar">
        <h2>All-Time Stats</h2>
      </div>
      <div className="dashboard-grid">
        <StatCard title="Makes" value={stats.total_makes} />
        <StatCard title="Misses" value={stats.total_misses} />
        <StatCard title="Accuracy" value={makePercentage} />
        <StatCard title="Fastest 21" value={stats.fastest_21_makes ? `${stats.fastest_21_makes.toFixed(2)}s` : 'N/A'} />
      </div>
      
      <div className={`session-list-container ${expandedSessionId ? 'is-expanded' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Session History</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to={`/player/${playerData.player_id}/stats`} className="btn btn-secondary">Career Stats</Link>
            <Link to={`/player/${playerData.player_id}/sessions`} className="btn btn-secondary">Full History</Link>
          </div>
        </div>
        <div className="session-table-wrapper" ref={tableWrapperRef}>
          <table className="session-table">
            <thead>
              <tr><th style={{ width: '120px' }}>Details</th><th>Session Date</th><th>Duration</th><th>Makes</th><th>Misses</th><th>Best Streak</th><th>Fastest 21</th><th>PPM</th><th>MPM</th><th>Most in 60s</th></tr>
            </thead>
            <tbody>
              {sessions && sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <SessionRow
                    key={session.session_id}
                    session={session}
                    playerTimezone={playerData.timezone}
                    isLocked={!isSubscribed && index > 0}
                    isExpanded={expandedSessionId === session.session_id}
                    onToggleExpand={handleToggleExpand}
                  />
                ))
              ) : (
                <tr className="table-placeholder-row">
                    <td colSpan="10">No sessions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="leaderboard-container">
        <div className="leaderboard-summary-bar">
            <h2>Leaderboard</h2>
        </div>
        <div className="leaderboard-grid">
            {leaderboardData ? (
                leaderboardData.map(({ title, leaders }) => (
                    <LeaderboardCard key={title} title={title} leaders={leaders} />
                ))
            ) : (
                <p>Loading leaderboards...</p>
            )}
        </div>
      </div>

    </>
  );
}

export default Dashboard;

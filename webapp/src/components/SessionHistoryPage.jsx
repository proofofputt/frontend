import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { apiGetPlayerSessions } from '@/api.js';
import SessionRow from '@/components/SessionRow.jsx';
import Pagination from '@/components/Pagination.jsx';
import './SessionHistoryPage.css';

const SessionHistoryPage = () => {
  const { playerId } = useParams();
  const { playerData } = useAuth();
  const isSubscribed = playerData?.subscription_status === 'active';
  const [sessions, setSessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!playerId) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await apiGetPlayerSessions(playerId, currentPage);
        setSessions(data.sessions);
        setTotalPages(data.total_pages);
      } catch (err) {
        setError(err.message || 'Failed to load session history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [playerId, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="session-history-page">
      <div className="page-header">
        <h2>Full Session History</h2>
      </div>
      <div className="session-list-container full-height">
        <div className="session-table-wrapper">
          <table className="session-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Details</th>
                <th>Session Date</th><th>Duration</th><th>Makes</th><th>Misses</th>
                <th>Best Streak</th><th>Fastest 21</th><th>PPM</th><th>MPM</th><th>Most in 60s</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading sessions...</td></tr>
              ) : error ? (
                <tr><td colSpan="10" className="error-message" style={{ textAlign: 'center', padding: '2rem' }}>{error}</td></tr>
              ) : sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <SessionRow key={session.session_id} session={session} playerTimezone={playerData.timezone} isLocked={!isSubscribed && !(currentPage === 1 && index === 0)} />
                ))
              ) : (
                <tr className="table-placeholder-row"><td colSpan="10">No sessions recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default SessionHistoryPage;
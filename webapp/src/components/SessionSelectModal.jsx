import React from 'react';

const SessionSelectModal = ({ duelId, sessions, onSelectSession, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Select a Session for Duel #{duelId}</h2>
        <div className="session-list">
          {sessions && sessions.length > 0 ? (
            sessions.map(session => (
              <div key={session.session_id} className="session-item">
                <p>Session ID: {session.session_id}</p>
                <p>Date: {new Date(session.timestamp).toLocaleString()}</p>
                <p>Total Putts: {session.total_putts}</p>
                <p>Made Putts: {session.made_putts}</p>
                <p>Missed Putts: {session.missed_putts}</p>
                <button onClick={() => onSelectSession(duelId, session.session_id, session.total_putts, session.duration_minutes)}>
                  Select This Session
                </button>
              </div>
            ))
          ) : (
            <p>No sessions available. Please complete a session first.</p>
          )}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SessionSelectModal;

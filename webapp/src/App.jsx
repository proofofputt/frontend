import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Auth from '@/components/Auth.jsx';
import Dashboard from '@/components/Dashboard.jsx';
import DuelsPage from '@/components/DuelsPage.jsx';
import SettingsPage from '@/components/SettingsPage.jsx';
import LeagueDetailPage from '@/components/LeagueDetailPage.jsx';
import LeaguesPage from '@/components/LeaguesPage.jsx';
import SessionHistoryPage from '@/components/SessionHistoryPage.jsx';
import PlayerCareerPage from '@/components/PlayerCareerPage.jsx';
import CoachPage from '@/components/CoachPage.jsx';
import FundraisingPage from '@/components/FundraisingPage.jsx';
import FundraiserDetailPage from '@/components/FundraiserDetailPage.jsx';
import NotificationsPage from '@/components/NotificationsPage.jsx';
import Header from '@/components/Header.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useNotification } from '@/context/NotificationContext.jsx';
import './App.css'; // Import App.css

const App = () => {
  const location = useLocation();
  const { playerData, isLoading } = useAuth(); // Consume AuthContext
  const { showTemporaryNotification } = useNotification(); // Consume NotificationContext

  // Note: showNotification is now provided by AuthContext, which internally uses showTemporaryNotification.
  // App component itself doesn't need to map it here directly anymore.

  return (
    <div className="App">
      <Header />
      <main className={location.pathname === '/coach' ? 'container-fluid' : 'container'}>
        {isLoading ? (
          <p>Loading...</p>
        ) : playerData ? (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/player/:playerId/sessions" element={<SessionHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/duels" element={<DuelsPage />} />
            <Route path="/player/:playerId/stats" element={<PlayerCareerPage />} />
            <Route path="/leagues/:leagueId" element={<LeagueDetailPage />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/fundraising" element={<FundraisingPage />} />
            <Route path="/fundraisers" element={<FundraisingPage />} />
            <Route path="/fundraisers/:fundraiserId" element={<FundraiserDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        ) : (
          <div className="auth-page-wrapper">
            <Auth />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const showTemporaryNotification = useCallback((message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Hide after 3 seconds
  }, []);

  const value = {
    showTemporaryNotification,
    unreadCount,
    setUnreadCount, // Expose setter to be updated from other components
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && <div className={`notification ${notification.isError ? 'error' : ''}`}>{notification.message}</div>}
    </NotificationContext.Provider>
  );
};
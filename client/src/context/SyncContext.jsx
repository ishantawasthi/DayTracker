import React, { createContext, useContext, useState, useEffect } from 'react';
import { taskApi } from '../api/taskApi';

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const q = localStorage.getItem('daytrack_offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncQueue = async () => {
    const queue = JSON.parse(localStorage.getItem('daytrack_offline_queue') || '[]');
    if (queue.length === 0) return;

    const remaining = [];
    for (const item of queue) {
      try {
        if (item.type === 'CREATE_TASK') {
          await taskApi.createTask(item.data);
        } else if (item.type === 'TOGGLE_TASK') {
          await taskApi.toggleTask(item.id);
        }
      } catch (err) {
        remaining.push(item);
      }
    }

    setOfflineQueue(remaining);
    localStorage.setItem('daytrack_offline_queue', JSON.stringify(remaining));
  };

  const queueAction = (action) => {
    const updated = [...offlineQueue, action];
    setOfflineQueue(updated);
    localStorage.setItem('daytrack_offline_queue', JSON.stringify(updated));
  };

  return (
    <SyncContext.Provider value={{ isOnline, offlineQueue, queueAction, syncQueue }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within a SyncProvider');
  return context;
};

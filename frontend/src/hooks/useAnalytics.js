import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';

export const useAnalytics = () => {
  const [stats,   setStats]   = useState(null);
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getAlerts(),
        ]);
        setStats(statsRes.data);
        setAlerts(alertsRes.data || []);
      } catch (e) {
        console.error('Analytics load failed:', e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await analyticsApi.markAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch {}
  };

  return { stats, alerts, loading, markRead, unreadCount: alerts.filter(a => !a.read).length };
};

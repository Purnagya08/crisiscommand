import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';

export const useAnalytics = () => {
  const [stats,   setStats]   = useState(null);
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);
        const [statsRes, alertsRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getAlerts(),
        ]);
        if (!active) return;
        setStats(statsRes.data);
        setAlerts(alertsRes.data || []);
      } catch (e) {
        console.error('Analytics load failed:', e.message);
      } finally {
        if (active && !silent) setLoading(false);
      }
    };

    load({ silent: false });
    const interval = setInterval(() => {
      load({ silent: true });
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const markRead = async (id) => {
    try {
      await analyticsApi.markAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch {}
  };

  return { stats, alerts, loading, markRead, unreadCount: alerts.filter(a => !a.read).length };
};

import { useState, useEffect, useCallback } from 'react';
import { crisisApi } from '../services/api';
import toast from 'react-hot-toast';

export const useCrises = (filters = {}) => {
  const [crises,  setCrises]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const filterKey = JSON.stringify(filters);

  const fetch = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await crisisApi.getAll(filters);
      setCrises(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!active) return;
      await fetch({ silent: false });
    };

    run();
    const interval = setInterval(() => {
      fetch({ silent: true });
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [fetch]);

  const updateStatus = async (id, status) => {
    try {
      const res = await crisisApi.updateStatus(id, status);
      setCrises(prev => prev.map(c => c.id === id ? res.data : c));
      toast.success(`Status updated to ${status}`);
      return res.data;
    } catch (e) { toast.error(e.message); throw e; }
  };

  const deleteCrisis = async (id) => {
    try {
      await crisisApi.delete(id);
      setCrises(prev => prev.filter(c => c.id !== id));
      toast.success('Crisis deleted');
    } catch (e) { toast.error(e.message); throw e; }
  };

  return { crises, loading, error, refetch: fetch, updateStatus, deleteCrisis };
};

export const useCrisis = (id) => {
  const [crisis,  setCrisis]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true); setError(null);
      const res = await crisisApi.getById(id);
      setCrisis(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const addTimeline = async (event, actor) => {
    try {
      const res = await crisisApi.addTimeline(id, { event, actor });
      setCrisis(res.data);
      toast.success('Timeline event added');
      return res.data;
    } catch (e) { toast.error(e.message); throw e; }
  };

  return { crisis, loading, error, refetch: fetch, setCrisis, addTimeline };
};

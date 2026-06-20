import React, { useEffect, useState } from 'react';
import { Activity, BarChart3, Bell, CheckCircle2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsApi } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import PageHeader from '../components/common/PageHeader';
import KPICharts from '../components/analytics/KPICharts';
import TimelinePanel from '../components/common/TimelinePanel';
import { PageLoader } from '../components/common/LoadingSpinner';
import { formatNumber, formatTime } from '../utils/helpers';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, alertsRes, timelineRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getAlerts(),
          analyticsApi.getTimeline()
        ]);
        setStats(overviewRes.data);
        setAlerts(alertsRes.data || []);
        setTimeline(timelineRes.data || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const markRead = async (id) => {
    try {
      await analyticsApi.markAlertRead(id);
      setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <PageLoader text="Loading analytics..." />;

  const unread = alerts.filter((alert) => !alert.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Operational metrics, alerts, and live activity."
        badge={unread > 0 ? `${unread} unread alerts` : undefined}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Crises" value={stats?.totalCrises} icon={BarChart3} color="blue" />
        <StatCard title="Active" value={stats?.activeCrises} icon={ShieldAlert} color="red" />
        <StatCard title="People Affected" value={formatNumber(stats?.totalAffected)} icon={Activity} color="orange" />
        <StatCard title="AI Analyses" value={stats?.aiAnalysesRun} icon={BarChart3} color="purple" />
      </div>

      <KPICharts severityData={stats?.severityBreakdown || []} categoryData={stats?.categoryBreakdown || []} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-2 text-base font-semibold text-white">
            <Bell size={16} className="text-amber-300" />
            System Alerts
            {unread > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">{unread}</span>}
          </div>

          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/8 bg-white/[0.02] p-6 text-center text-sm text-slate-500">
                No alerts
              </div>
            ) : (
              alerts.slice(0, 20).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-2xl border border-white/8 px-4 py-3 ${alert.read ? 'bg-white/[0.02]' : 'bg-white/[0.05]'}`}
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      alert.severity === 'critical' ? 'bg-rose-400' : alert.severity === 'high' ? 'bg-orange-400' : alert.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${alert.read ? 'text-slate-400' : 'text-slate-100'}`}>{alert.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatTime(alert.timestamp)}</p>
                  </div>
                  {!alert.read && (
                    <button type="button" onClick={() => markRead(alert.id)} className="rounded-xl border border-white/8 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-emerald-300">
                      <CheckCircle2 size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <TimelinePanel title="Recent Activity" events={timeline.slice(0, 15)} />
      </div>

      <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
        <h3 className="text-base font-semibold text-white">Resource Summary</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Resources', value: stats?.totalResources },
            { label: 'Deployed', value: stats?.deployedResources },
            { label: 'Available', value: stats?.availableResources },
            { label: 'Contained Crises', value: stats?.containedCrises }
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center">
              <div className="text-3xl font-semibold text-white">{item.value ?? '—'}</div>
              <div className="mt-1 text-xs text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { BarChart3, Bell, CheckCircle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsApi } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import PageHeader from '../components/common/PageHeader';
import { PageLoader } from '../components/common/LoadingSpinner';
import { formatTime, formatNumber } from '../utils/helpers';
import toast from 'react-hot-toast';

const SEVERITY_COLORS  = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const CATEGORY_COLORS  = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#8b5cf6','#06b6d4'];

export default function AnalyticsPage() {
  const [stats,    setStats]    = useState(null);
  const [alerts,   setAlerts]   = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, aRes, tRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getAlerts(),
          analyticsApi.getTimeline(),
        ]);
        setStats(sRes.data);
        setAlerts(aRes.data || []);
        setTimeline(tRes.data || []);
      } catch (e) { toast.error(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await analyticsApi.markAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch {}
  };

  if (loading) return <PageLoader text="Loading analytics..." />;

  const severityData  = stats?.severityBreakdown?.map(s => ({ name: s.severity, value: s.count, fill: SEVERITY_COLORS[s.severity] || '#6366f1' })) || [];
  const categoryData  = stats?.categoryBreakdown?.filter(c => c.count > 0).map((c, i) => ({
    name: c.category.replace(/_/g, ' '),
    count: c.count,
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  })) || [];
  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Analytics & Alerts"
        description="Real-time crisis metrics and operational overview"
        badge={unread > 0 ? `${unread} unread alerts` : undefined}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Crises"     value={stats?.totalCrises}     icon={BarChart3}   color="blue"   />
        <StatCard title="Active"           value={stats?.activeCrises}    icon={Activity}    color="red"    />
        <StatCard title="People Affected"  value={formatNumber(stats?.totalAffected)} icon={BarChart3} color="orange" />
        <StatCard title="AI Analyses"      value={stats?.aiAnalysesRun}   icon={BarChart3}   color="purple" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Severity Pie */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Crises by Severity</h3>
          {severityData.every(d => d.value === 0) ? (
            <p className="text-slate-500 text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => value > 0 ? `${name} (${value})` : ''}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Bar */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Crises by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alerts + Timeline */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Bell size={16} className="text-yellow-400" /> System Alerts
              {unread > 0 && <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">{unread}</span>}
            </h3>
          </div>
          {alerts.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No alerts</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {alerts.slice(0, 20).map(a => (
                <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${a.read ? 'bg-slate-700/20' : 'bg-slate-700/60'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    a.severity === 'critical' ? 'bg-red-500' :
                    a.severity === 'high'     ? 'bg-orange-500' :
                    a.severity === 'medium'   ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${a.read ? 'text-slate-400' : 'text-slate-200'}`}>{a.message}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{formatTime(a.timestamp)}</p>
                  </div>
                  {!a.read && (
                    <button onClick={() => markRead(a.id)} className="text-slate-500 hover:text-green-400 transition-colors shrink-0">
                      <CheckCircle size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Activity size={16} className="text-blue-400" /> Recent Activity
          </h3>
          {timeline.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No activity yet</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {timeline.slice(0, 15).map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    t.severity === 'critical' ? 'bg-red-500' :
                    t.severity === 'high'     ? 'bg-orange-500' :
                    t.severity === 'medium'   ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="text-slate-300 text-xs font-medium">{t.event}</p>
                    <p className="text-slate-500 text-xs">{t.crisisTitle} · {t.actor} · {formatTime(t.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resource Summary */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">Resource Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Resources',     value: stats?.totalResources,     color: 'text-white'         },
            { label: 'Deployed',            value: stats?.deployedResources,   color: 'text-blue-400'      },
            { label: 'Available',           value: stats?.availableResources,  color: 'text-green-400'     },
            { label: 'Contained Crises',    value: stats?.containedCrises,     color: 'text-yellow-400'    },
          ].map(s => (
            <div key={s.label} className="bg-slate-700/40 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value ?? '—'}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Brain, Boxes, Plus, ShieldAlert, Siren, Users } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { useCrises } from '../hooks/useCrises';
import { useAnalytics } from '../hooks/useAnalytics';
import StatCard from '../components/dashboard/StatCard';
import CrisisCard from '../components/crisis/CrisisCard';
import TimelinePanel from '../components/common/TimelinePanel';
import { PageLoader } from '../components/common/LoadingSpinner';
import { formatNumber } from '../utils/helpers';

export default function Dashboard() {
  const [timeline, setTimeline] = useState([]);
  const { crises, loading: crisesLoading } = useCrises({ status: 'active' });
  const { stats, loading } = useAnalytics();

  useEffect(() => {
    let active = true;

    const loadTimeline = async () => {
      try {
        const response = await analyticsApi.getTimeline();
        if (active) setTimeline(response.data || []);
      } catch {
        // Keep the last successful activity feed if polling fails.
      }
    };

    loadTimeline();
    const interval = setInterval(loadTimeline, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <PageLoader text="Loading command center..." />;

  const criticalCrises = crises.filter((crisis) => crisis.severity === 'critical');
  const recentCrises = crises.slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-gradient-to-br from-rose-500/12 via-slate-950/60 to-cyan-500/10 p-6 shadow-2xl shadow-black/25 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-rose-200">
              <Siren size={12} />
              Emergency Operations Center
            </div>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Coordinate crises, resources, and AI guidance from one command view.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              CrisisCommand gives responders a live operations picture across incidents, supplies, alerts, and AI-assisted planning.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/crises/new" className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} />
                  Report Crisis
                </span>
              </Link>
              <Link to="/ai" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
                <span className="inline-flex items-center gap-2">
                  <Brain size={16} />
                  Open AI Command
                </span>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Critical events</p>
              <p className="mt-3 text-4xl font-semibold text-white">{criticalCrises.length}</p>
              <p className="mt-2 text-sm text-slate-400">Crises requiring immediate attention</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Active response load</p>
              <p className="mt-3 text-4xl font-semibold text-white">{stats?.deployedResources}/{stats?.totalResources}</p>
              <p className="mt-2 text-sm text-slate-400">Teams currently in the field</p>
            </div>
          </div>
        </div>
      </section>

      {stats?.criticalCrises > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-rose-100">
              {stats.criticalCrises} critical crisis{stats.criticalCrises === 1 ? '' : 'es'} need immediate action.
            </p>
            <p className="mt-1 text-xs text-rose-200/70">Prioritize staffing, evacuation, and field coordination.</p>
          </div>
          <Link to="/crises?severity=critical" className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-white/5 px-4 py-2 text-sm text-rose-50 transition hover:bg-white/10">
            View critical
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active Crises" value={stats?.activeCrises} icon={AlertTriangle} color="red" description="Open incidents needing response" />
        <StatCard title="Critical Level" value={stats?.criticalCrises} icon={ShieldAlert} color="orange" description="Highest priority alerts" />
        <StatCard title="People Affected" value={formatNumber(stats?.totalAffected)} icon={Users} color="blue" description="Estimated impacted population" />
        <StatCard title="Resources Available" value={stats?.availableResources} icon={Boxes} color="green" description="Ready for deployment" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Crises</h2>
            <Link to="/crises" className="inline-flex items-center gap-1 text-sm text-rose-200 transition hover:text-white">
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          {crisesLoading ? (
            <PageLoader text="Loading active crises..." />
          ) : recentCrises.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
              No active crises right now.
            </div>
          ) : (
            <div className="grid gap-4">
              {recentCrises.map((crisis) => (
                <CrisisCard key={crisis.id} crisis={crisis} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
            <h3 className="text-base font-semibold text-white">Command Snapshot</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <span>Contained crises</span>
                <span className="font-semibold text-sky-300">{stats?.containedCrises}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <span>Resolved crises</span>
                <span className="font-semibold text-emerald-300">{stats?.resolvedCrises}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <span>AI analyses run</span>
                <span className="font-semibold text-violet-300">{stats?.aiAnalysesRun}</span>
              </div>
            </div>
          </div>

          <TimelinePanel title="Recent Activity" events={timeline.slice(0, 6)} />
        </div>
      </section>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Boxes, Users, Brain, Plus, ArrowRight, Activity, Shield } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { useCrises } from '../hooks/useCrises';
import StatCard from '../components/dashboard/StatCard';
import CrisisCard from '../components/crisis/CrisisCard';
import { PageLoader } from '../components/common/LoadingSpinner';
import { formatNumber } from '../utils/helpers';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const { crises, loading: crisesLoading } = useCrises({ status: 'active' });

  useEffect(() => {
    analyticsApi.getOverview()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  if (statsLoading) return <PageLoader text="Loading CrisisCommand..." />;

  const criticalCrises = crises.filter(c => c.severity === 'critical').slice(0, 3);
  const recentCrises   = crises.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time crisis overview and management</p>
        </div>
        <Link to="/crises/new" className="btn-primary">
          <Plus size={16} /> Report Crisis
        </Link>
      </div>

      {/* Critical Alert Banner */}
      {stats?.criticalCrises > 0 && (
        <div className="bg-red-900/30 border border-red-600/50 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
          <div className="flex-1">
            <p className="text-red-300 font-semibold text-sm">
              ⚠️ {stats.criticalCrises} CRITICAL {stats.criticalCrises === 1 ? 'CRISIS' : 'CRISES'} REQUIRE IMMEDIATE ATTENTION
            </p>
            <p className="text-red-400/70 text-xs mt-0.5">All available command resources should be mobilized.</p>
          </div>
          <Link to="/crises?severity=critical" className="btn-secondary text-xs py-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Crises"    value={stats?.activeCrises}       icon={AlertTriangle} color="red"    description="Require response" />
        <StatCard title="Critical Level"   value={stats?.criticalCrises}     icon={Shield}        color="orange" description="Highest priority" />
        <StatCard title="People Affected"  value={formatNumber(stats?.totalAffected)} icon={Users} color="blue"   description="Across all crises" />
        <StatCard title="Resources Active" value={`${stats?.deployedResources}/${stats?.totalResources}`} icon={Boxes} color="green" description="Teams deployed" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Contained"   value={stats?.containedCrises}  icon={Activity} color="purple" description="Under control" />
        <StatCard title="Resolved"    value={stats?.resolvedCrises}   icon={Activity} color="green"  description="Successfully closed" />
        <StatCard title="AI Analyses" value={stats?.aiAnalysesRun}    icon={Brain}    color="purple" description="AI recommendations run" />
        <StatCard title="Available"   value={stats?.availableResources} icon={Boxes}  color="yellow" description="Ready to deploy" />
      </div>

      {/* Main Content: Active Crises + Critical */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Active Crises */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" /> Active Crises
            </h2>
            <Link to="/crises" className="text-red-400 text-sm hover:text-red-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {crisesLoading ? (
            <PageLoader />
          ) : recentCrises.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-slate-400">No active crises. System is clear. ✅</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCrises.map(c => <CrisisCard key={c.id} crisis={c} />)}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Category Breakdown */}
          <div className="card">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Activity size={16} className="text-blue-400" /> By Category
            </h3>
            {stats?.categoryBreakdown?.filter(c => c.count > 0).map(({ category, count }) => (
              <div key={category} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                <span className="text-slate-400 text-sm capitalize">{category.replace(/_/g, ' ')}</span>
                <span className="text-white font-semibold text-sm">{count}</span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/crises/new" className="btn-primary w-full justify-center text-sm py-2">
                <Plus size={15} /> Report New Crisis
              </Link>
              <Link to="/ai" className="btn-secondary w-full justify-center text-sm py-2">
                <Brain size={15} /> AI Command
              </Link>
              <Link to="/resources" className="btn-ghost w-full justify-center text-sm py-2 border border-slate-600">
                <Boxes size={15} /> Manage Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

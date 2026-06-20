import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import CrisisCard from '../components/crisis/CrisisCard';
import CrisisFilters from '../components/crisis/CrisisFilters';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import { PageLoader } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useCrises } from '../hooks/useCrises';

export default function CrisesPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    severity: searchParams.get('severity') || '',
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || ''
  });

  const { crises, loading, error, refetch } = useCrises(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crisis Management"
        description="Monitor all open and historical incidents."
        badge={crises.length > 0 ? `${crises.length} incidents` : undefined}
        actions={
          <>
            <button type="button" onClick={refetch} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={15} />
                Refresh
              </span>
            </button>
            <Link to="/crises/new" className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600">
              <span className="inline-flex items-center gap-2">
                <Plus size={15} />
                Report Crisis
              </span>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total" value={crises.length} icon={AlertTriangle} color="red" description="Matching current filters" />
        <StatCard title="Critical" value={crises.filter((crisis) => crisis.severity === 'critical').length} icon={AlertTriangle} color="orange" description="Needs urgent attention" />
        <StatCard title="Contained" value={crises.filter((crisis) => crisis.status === 'contained').length} icon={AlertTriangle} color="blue" description="Under control" />
        <StatCard title="Resolved" value={crises.filter((crisis) => crisis.status === 'resolved').length} icon={AlertTriangle} color="green" description="Closed incidents" />
      </div>

      <CrisisFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <PageLoader text="Loading crises..." />
      ) : error ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center">
          <p className="text-rose-100">Failed to load crises: {error}</p>
          <button type="button" onClick={refetch} className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
            Retry
          </button>
        </div>
      ) : crises.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No crises found"
          description="No records match the current filters."
          action={<Link to="/crises/new" className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">Report Crisis</Link>}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
          {crises.map((crisis) => (
            <CrisisCard key={crisis.id} crisis={crisis} />
          ))}
        </div>
      )}
    </div>
  );
}

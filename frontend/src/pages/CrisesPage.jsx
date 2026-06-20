import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import { useCrises } from '../hooks/useCrises';
import CrisisCard from '../components/crisis/CrisisCard';
import CrisisFilters from '../components/crisis/CrisisFilters';
import PageHeader from '../components/common/PageHeader';
import { PageLoader } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function CrisesPage() {
  const [filters, setFilters] = useState({});
  const { crises, loading, error, refetch } = useCrises(filters);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Crisis Management"
        description="Monitor and manage all active and historical crises"
        badge={crises.length > 0 ? `${crises.length} crises` : undefined}
        actions={
          <>
            <button onClick={refetch} className="btn-ghost">
              <RefreshCw size={15} /> Refresh
            </button>
            <Link to="/crises/new" className="btn-primary">
              <Plus size={15} /> Report Crisis
            </Link>
          </>
        }
      />

      <CrisisFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <PageLoader text="Loading crises..." />
      ) : error ? (
        <div className="card text-center py-10 border-red-900/50">
          <p className="text-red-400 mb-3">Failed to load crises: {error}</p>
          <button onClick={refetch} className="btn-secondary mx-auto">Retry</button>
        </div>
      ) : crises.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No crises found"
          description="No crises match your filters. Clear filters or report a new crisis."
          action={<Link to="/crises/new" className="btn-primary">Report Crisis</Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {crises.map(c => <CrisisCard key={c.id} crisis={c} />)}
        </div>
      )}
    </div>
  );
}

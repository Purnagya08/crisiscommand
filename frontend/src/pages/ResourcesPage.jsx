import React, { useState, useEffect } from 'react';
import { Boxes, Plus, RefreshCw } from 'lucide-react';
import { resourceApi } from '../services/api';
import { resourceStatusConfig } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';
import { PageLoader } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const TYPES = ['response_team','rescue_team','medical','hazmat','utility','logistics','security','air_support','other'];
const STATUSES = ['available','deployed','on_standby','unavailable'];

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'response_team', capacity: '', location: '', contact: '', specialization: '' });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType)   params.type   = filterType;
      const res = await resourceApi.getAll(params);
      setResources(res.data || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterType]);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await resourceApi.updateStatus(id, status);
      setResources(prev => prev.map(r => r.id === id ? res.data : r));
      toast.success(`Status → ${status}`);
    } catch (e) { toast.error(e.message); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await resourceApi.create({ ...form, capacity: parseInt(form.capacity) || 10 });
      setResources(prev => [...prev, res.data]);
      setForm({ name: '', type: 'response_team', capacity: '', location: '', contact: '', specialization: '' });
      setShowForm(false);
      toast.success('Resource added!');
    } catch (e) { toast.error(e.message); }
    finally { setCreating(false); }
  };

  const deployed   = resources.filter(r => r.status === 'deployed').length;
  const available  = resources.filter(r => r.status === 'available').length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Resource Management"
        description="Track and manage all emergency response resources"
        badge={`${resources.length} total`}
        actions={
          <>
            <button onClick={load} className="btn-ghost"><RefreshCw size={15} /></button>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              <Plus size={15} /> Add Resource
            </button>
          </>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',       value: resources.length, color: 'text-white'         },
          { label: 'Available',   value: available,        color: 'text-green-400'     },
          { label: 'Deployed',    value: deployed,         color: 'text-blue-400'      },
          { label: 'On Standby',  value: resources.filter(r => r.status === 'on_standby').length, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="card py-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Resource Form */}
      {showForm && (
        <div className="card mb-6 border-blue-700/50 animate-slide-up">
          <h3 className="text-white font-semibold mb-4">Add New Resource</h3>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input type="text" placeholder="Resource Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" required />
            </div>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="select">
              {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
            <input type="number" placeholder="Capacity (people)" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} className="input" min="1" />
            <input type="text" placeholder="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="input" />
            <input type="text" placeholder="Contact (email)" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} className="input" />
            <div className="sm:col-span-2">
              <input type="text" placeholder="Specialization" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} className="input" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary flex-1 justify-center">
                {creating ? 'Adding...' : 'Add Resource'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-3 items-center">
        <select className="select py-1.5 text-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="select py-1.5 text-sm w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <PageLoader text="Loading resources..." />
      ) : resources.length === 0 ? (
        <EmptyState icon={Boxes} title="No resources found" description="Add emergency response resources to get started." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map(r => {
            const cfg = resourceStatusConfig[r.status] || resourceStatusConfig.available;
            return (
              <div key={r.id} className="card hover:border-slate-600 transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{r.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 capitalize">{r.type.replace(/_/g,' ')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400 mb-4">
                  <p>📍 {r.location || '—'}</p>
                  <p>👥 Capacity: {r.capacity}</p>
                  <p>🔧 {r.specialization}</p>
                  {r.contact && <p>📧 {r.contact}</p>}
                </div>

                <div>
                  <select
                    value={r.status}
                    onChange={e => handleStatusChange(r.id, e.target.value)}
                    className="select text-xs py-1"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

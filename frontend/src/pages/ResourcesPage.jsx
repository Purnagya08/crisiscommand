import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Boxes } from 'lucide-react';
import toast from 'react-hot-toast';
import { resourceApi } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import ResourceTable from '../components/resources/ResourceTable';
import { PageLoader } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [types, setTypes] = useState([]);
  const [statuses, setStatuses] = useState(['available', 'deployed', 'on_standby', 'unavailable']);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'response_team',
    capacity: '',
    location: '',
    contact: '',
    specialization: ''
  });

  const loadMeta = async () => {
    try {
      const response = await resourceApi.getTypes();
      setTypes(response.data.types || []);
      setStatuses(response.data.statuses || statuses);
    } catch {
      setTypes(['response_team', 'rescue_team', 'medical', 'hazmat', 'utility', 'logistics', 'security', 'air_support', 'other']);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      const response = await resourceApi.getAll(params);
      setResources(response.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    load();
  }, [filterStatus, filterType]);

  const handleStatusChange = async (id, status) => {
    try {
      const response = await resourceApi.updateStatus(id, status);
      setResources((current) => current.map((resource) => (resource.id === id ? response.data : resource)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setCreating(true);
    try {
      const response = await resourceApi.create({
        ...form,
        capacity: Number.parseInt(form.capacity, 10) || 1
      });
      setResources((current) => [response.data, ...current]);
      setForm({
        name: '',
        type: 'response_team',
        capacity: '',
        location: '',
        contact: '',
        specialization: ''
      });
      setShowForm(false);
      toast.success('Resource added');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const deployed = resources.filter((resource) => resource.status === 'deployed').length;
  const available = resources.filter((resource) => resource.status === 'available').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Management"
        description="Track and coordinate emergency response assets."
        badge={`${resources.length} total`}
        actions={
          <>
            <button type="button" onClick={load} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={15} />
                Refresh
              </span>
            </button>
            <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600">
              <span className="inline-flex items-center gap-2">
                <Plus size={15} />
                Add Resource
              </span>
            </button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total" value={resources.length} icon={Boxes} color="blue" description="Tracked resources" />
        <StatCard title="Available" value={available} icon={Boxes} color="green" description="Ready to deploy" />
        <StatCard title="Deployed" value={deployed} icon={Boxes} color="orange" description="Currently assigned" />
        <StatCard title="Standby" value={resources.filter((resource) => resource.status === 'on_standby').length} icon={Boxes} color="purple" description="Waiting on call" />
      </div>

      {showForm && (
        <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
          <h3 className="text-base font-semibold text-white">Add New Resource</h3>
          <form onSubmit={handleCreate} className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Resource Name *"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                required
              />
            </div>
            <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
              {types.map((type) => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Capacity"
              value={form.capacity}
              onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))}
              className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
              min="1"
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            />
            <input
              type="text"
              placeholder="Contact"
              value={form.contact}
              onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))}
              className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            />
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Specialization"
                value={form.specialization}
                onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={creating} className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
                {creating ? 'Adding...' : 'Add Resource'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5">
        <div className="flex flex-wrap gap-3">
          <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2 text-sm text-white outline-none">
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select value={filterType} onChange={(event) => setFilterType(event.target.value)} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2 text-sm text-white outline-none">
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading resources..." />
      ) : resources.length === 0 ? (
        <EmptyState icon={Boxes} title="No resources found" description="Add response units and support teams to begin." />
      ) : (
        <ResourceTable resources={resources} statuses={statuses} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}

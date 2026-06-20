import React from 'react';
import { Filter, Search } from 'lucide-react';
import { categoryLabels } from '../../utils/helpers';

export default function CrisisFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value || undefined });

  return (
    <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Filter size={16} className="text-rose-300" />
        Filters
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search crises..."
            value={filters.search || ''}
            onChange={(event) => set('search', event.target.value)}
            className="input pl-10"
          />
        </div>

        <select value={filters.severity || ''} onChange={(event) => set('severity', event.target.value)} className="select lg:w-44">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select value={filters.status || ''} onChange={(event) => set('status', event.target.value)} className="select lg:w-44">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
        </select>

        <select value={filters.category || ''} onChange={(event) => set('category', event.target.value)} className="select lg:w-52">
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

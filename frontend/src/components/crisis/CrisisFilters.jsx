import React from 'react';
import { Search, Filter } from 'lucide-react';
import { categoryLabels } from '../../utils/helpers';

export default function CrisisFilters({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val || undefined });

  return (
    <div className="card mb-6 flex flex-wrap gap-3 items-center">
      <Filter size={16} className="text-slate-400 shrink-0" />
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search crises..."
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          className="input pl-8 py-1.5 text-sm"
        />
      </div>
      <select className="select py-1.5 text-sm w-auto" value={filters.severity || ''} onChange={e => set('severity', e.target.value)}>
        <option value="">All Severities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select className="select py-1.5 text-sm w-auto" value={filters.status || ''} onChange={e => set('status', e.target.value)}>
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="contained">Contained</option>
        <option value="resolved">Resolved</option>
      </select>
      <select className="select py-1.5 text-sm w-auto" value={filters.category || ''} onChange={e => set('category', e.target.value)}>
        <option value="">All Categories</option>
        {Object.entries(categoryLabels).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </div>
  );
}

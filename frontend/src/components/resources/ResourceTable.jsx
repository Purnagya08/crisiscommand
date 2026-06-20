import React from 'react';
import { BadgeInfo, Mail, MapPin, Users } from 'lucide-react';
import { resourceStatusConfig } from '../../utils/helpers';

export default function ResourceTable({ resources, statuses = [], onStatusChange }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/8 bg-slate-950/60 shadow-2xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/8">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Resource</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Capacity</th>
              <th className="px-5 py-4">Contact</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {resources.map((resource) => {
              const cfg = resourceStatusConfig[resource.status] || resourceStatusConfig.available;

              return (
                <tr key={resource.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{resource.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {resource.specialization || 'General'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    <div className="capitalize">{resource.type.replace(/_/g, ' ')}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-500" />
                      {resource.location || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-500" />
                      {resource.capacity}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-500" />
                      <span className="truncate">{resource.contact || 'No contact'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      {onStatusChange && (
                        <select
                          value={resource.status}
                          onChange={(event) => onStatusChange(resource.id, event.target.value)}
                          className="w-fit rounded-xl border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-slate-100 outline-none transition focus:border-red-500/40"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

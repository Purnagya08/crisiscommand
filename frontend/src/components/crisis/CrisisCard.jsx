import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock3, MapPin, Users } from 'lucide-react';
import { categoryLabels, formatNumber, formatTime, getCategoryIcon, severityConfig, statusConfig } from '../../utils/helpers';

export default function CrisisCard({ crisis }) {
  const navigate = useNavigate();
  const sev = severityConfig[crisis.severity] || severityConfig.low;
  const sta = statusConfig[crisis.status] || statusConfig.active;

  return (
    <button
      type="button"
      onClick={() => navigate(`/crises/${crisis.id}`)}
      className="group w-full rounded-3xl border border-white/8 bg-slate-950/60 p-5 text-left shadow-2xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.03]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/8 bg-white/5 text-xl">
            {getCategoryIcon(crisis.category)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">{crisis.title}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
              {categoryLabels[crisis.category] || crisis.category}
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="mt-2 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
      </div>

      <p className="line-clamp-2 text-sm leading-6 text-slate-400">{crisis.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${sev.bg} ${sev.color} ${sev.border}`}>
          {sev.label}
        </span>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${sta.bg} ${sta.color} ${sta.border}`}>
          {sta.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          {crisis.location?.city && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {crisis.location.city}
            </span>
          )}
          {crisis.affectedCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={12} /> {formatNumber(crisis.affectedCount)}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1.5">
          <Clock3 size={12} /> {formatTime(crisis.createdAt)}
        </span>
      </div>
    </button>
  );
}

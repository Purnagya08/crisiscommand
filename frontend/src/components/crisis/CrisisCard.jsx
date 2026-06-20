import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import { severityConfig, statusConfig, categoryLabels, getCategoryIcon, formatTime, formatNumber } from '../../utils/helpers';

export default function CrisisCard({ crisis, onStatusChange }) {
  const navigate = useNavigate();
  const sev = severityConfig[crisis.severity] || severityConfig.low;
  const sta = statusConfig[crisis.status]     || statusConfig.active;

  return (
    <div
      onClick={() => navigate(`/crises/${crisis.id}`)}
      className={`card cursor-pointer hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl border-l-4 ${
        crisis.severity === 'critical' ? 'border-l-red-500' :
        crisis.severity === 'high'     ? 'border-l-orange-500' :
        crisis.severity === 'medium'   ? 'border-l-yellow-500' : 'border-l-green-500'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl mt-0.5 shrink-0">{getCategoryIcon(crisis.category)}</span>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-base leading-tight line-clamp-1">{crisis.title}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{categoryLabels[crisis.category] || crisis.category}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-500 shrink-0 mt-1" />
      </div>

      <p className="text-slate-400 text-sm line-clamp-2 mb-4">{crisis.description}</p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sev.bg} ${sev.color} ${sev.border}`}>
          {sev.label}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sta.bg} ${sta.color}`}>
          {sta.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {crisis.location?.city && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {crisis.location.city}
            </span>
          )}
          {crisis.affectedCount > 0 && (
            <span className="flex items-center gap-1">
              <Users size={11} /> {formatNumber(crisis.affectedCount)}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1">
          <Clock size={11} /> {formatTime(crisis.createdAt)}
        </span>
      </div>
    </div>
  );
}

import React from 'react';
import { Clock3, ShieldAlert } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

export default function TimelinePanel({ title = 'Timeline', events = [] }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <Clock3 size={16} className="text-red-300" />
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-400">Operational sequence and incident updates</p>
        </div>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/8 bg-white/[0.02] p-6 text-center text-sm text-slate-500">
            No timeline entries yet.
          </div>
        ) : (
          events.map((event, index) => (
            <div key={`${event.timestamp}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="mt-1.5 h-3 w-3 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.7)]" />
                {index !== events.length - 1 && <div className="mt-1 h-full w-px bg-white/10" />}
              </div>
              <div className="pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-100">{event.event}</p>
                  {event.severity && (
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-red-200">
                      {event.severity}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {event.actor || 'Command Center'} {event.crisisTitle ? `• ${event.crisisTitle}` : ''} • {formatTime(event.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'red', description, trend }) {
  const palette = {
    red: 'from-rose-500/20 to-red-500/5 text-rose-300',
    orange: 'from-orange-500/20 to-amber-500/5 text-orange-300',
    blue: 'from-sky-500/20 to-cyan-500/5 text-sky-300',
    green: 'from-emerald-500/20 to-green-500/5 text-emerald-300',
    purple: 'from-violet-500/20 to-fuchsia-500/5 text-violet-300',
    yellow: 'from-amber-500/20 to-yellow-500/5 text-amber-300'
  };

  return (
    <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{value ?? '—'}</div>
        </div>
        {Icon && (
          <div className={`rounded-2xl bg-gradient-to-br p-3 ${palette[color] || palette.red}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      {description && <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>}
      {trend !== undefined && (
        <p className={`mt-3 text-xs font-medium ${trend >= 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
          {trend >= 0 ? 'Up' : 'Down'} {Math.abs(trend)} from last hour
        </p>
      )}
    </div>
  );
}
